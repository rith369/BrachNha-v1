import { GoogleGenAI } from "@google/genai";
// Relative imports, not the @/ alias, all the way down this file's import
// graph. Vite resolves the alias fine, but the Vercel function bundler
// (api/chat.ts) reads the root tsconfig.json — a solution file that carries no
// `paths` — so an aliased import here fails the deploy build. Relative paths
// work in both. See the same note in src/utils/chat-prompt.ts.
import type { Lang, ChatMsg } from "../src/types/index.js";
import {
  buildSystemPrompt,
  pinnedContextFor,
  type ChatProfile,
} from "../src/utils/chat-prompt.js";
import type { ScreenRef } from "../src/utils/chat-screen.js";
import { checkRateLimit } from "./rate-limit.js";
import { isVerificationConfigured, verifyRequestUser } from "./verify-user.js";

/**
 * KruAI endpoint. Started life as a Netlify function, then a Next.js route
 * handler (`app/api/chat/route.ts`); it is now a plain
 * `Request -> Promise<Response>` function with no framework in it at all.
 *
 * Vite has no server runtime of its own, so during `npm run dev` this is
 * mounted at POST /api/chat by server/vite-chat-plugin.ts.
 * For a deployed build, drop this same function into whatever host you use —
 * a Vercel or Netlify function, a Cloudflare Worker, a small Express app —
 * since it only speaks the web Request/Response types those all provide.
 *
 * Two things changed on the way over:
 *   • Model is now Gemini 3 Flash.
 *   • Google's recommended surface is the Interactions API (`interactions.create`)
 *     rather than `generateContent`. We use the official @google/genai SDK for it,
 *     which also gives us typed streaming.
 *
 * The response is a plain UTF-8 text stream, not SSE — there is only one stream
 * of text to send, so the client can just read it with `body.getReader()`.
 * Runs on the default Node.js runtime; streaming works there with no config.
 */

/** https://ai.google.dev/gemini-api/docs/gemini-3 — Gemini 3 Flash. */
const GEMINI_MODEL = "gemini-3-flash-preview";

/** How many past bubbles to replay as context. Bounds cost and latency; the
 *  store keeps more than this for display purposes. */
const MAX_HISTORY = 12;

/** Longest single question we'll forward. */
const MAX_MESSAGE_CHARS = 2000;

/**
 * TWO caps, because there are now two things to defend against.
 *
 * The endpoint used to be public and unauthenticated, so one per-IP number had
 * to do both jobs — and it was deliberately set high (30/min) because a whole
 * classroom shares one school router's IP and a limit tuned to "one student"
 * would lock the class out. That compromise is over: a verified user id is a
 * real per-student key, so the two jobs split.
 *
 *   IP   — anti-flood only, in front of the signature check so junk costs
 *          nothing. High enough that a full classroom never notices it.
 *   USER — the real quota, and the one a student can actually hit.
 *
 * Note both are per serverless instance (see rate-limit.ts), so they are a
 * guardrail rather than an exact global budget.
 */
const IP_RATE_LIMIT = 240;
const USER_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

/**
 * Largest request body we will read. The whole history the client can legally
 * send is 40 messages that the composer itself caps well under this, so 64KB is
 * far above any real question and far below anything worth allocating for.
 *
 * It matters because `req.json()` parses the ENTIRE body before any of the
 * limits below apply: MAX_HISTORY and MAX_MESSAGE_CHARS bound what reaches the
 * MODEL, not what reaches memory. A megabyte of JSON was fully parsed and
 * array-allocated first, on a public endpoint, before being thrown away.
 */
const MAX_BODY_BYTES = 64 * 1024;

/** Messages accepted before the request is rejected outright, as opposed to
 *  MAX_HISTORY, which is how many of them are forwarded. The client's own cap
 *  is 40; this leaves room and still refuses an array built to be expensive. */
const MAX_MESSAGES = 100;

/**
 * The rate-limit key.
 *
 * Header order is the point. `x-vercel-forwarded-for` is set by the platform
 * and cannot be spoofed by the caller, so it is tried FIRST; plain
 * `x-forwarded-for` is a header anyone can put on a request, and a limiter
 * keyed on it hands out a fresh bucket to anybody who varies it — which is the
 * one thing this must not do, since it is the only gate on the endpoint.
 *
 * The fallbacks are kept for other hosts, in descending order of
 * trustworthiness. In local dev there is no proxy and every request keys to
 * "local", which is fine: the limit is there to protect a public deployment,
 * not your own machine.
 */
function clientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercel) return vercel.split(",")[0].trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "local";
}

/** One turn in the Interactions API's stateless `input` array. */
type InteractionStep = {
  type: "user_input" | "model_output";
  content: { type: "text"; text: string }[];
};

interface ChatRequestBody {
  messages?: ChatMsg[];
  lang?: Lang;
  profile?: ChatProfile;
  /** `unknown`, not `ScreenRef`: this is whatever JSON.parse produced. See
   *  cleanScreen — the declared type of a request body is a description of the
   *  intended caller, never a guarantee about the value. */
  screen?: unknown;
}

/**
 * Longest id we will even look up. Content ids are `biology-3-1-1` shaped, so
 * this is generous by an order of magnitude.
 *
 * Checked BEFORE the lookup, the same instinct as MAX_BODY_BYTES checking
 * content-length before reading the body: bound the cheap thing first, so a
 * 60KB string never becomes a hash probe.
 */
const MAX_ID_CHARS = 64;

function screenId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_ID_CHARS) return undefined;
  return trimmed;
}

/**
 * The screen the student had open, or {}.
 *
 * DELIBERATELY NOT clean()/cleanList()/cleanNumber(), and the distinction is
 * the whole security argument for this feature:
 *
 *   clean() makes a string safe to DISPLAY. It does not make it TRUE.
 *
 * Every ChatProfile field goes through it because every one is interpolated
 * straight into the model's instructions. Nothing here ever is. A screen ref is
 * used exactly once, as a lookup key into the app's own content, and then
 * discarded — what reaches the prompt is the object the lookup found. So the
 * client may SELECT from the corpus and can never SUPPLY content to it.
 *
 * This function therefore only bounds SHAPE and COST. Membership is checked by
 * pinnedContextFor(), next to the data it is checking against, so the invariant
 * holds even for a caller that skipped this step — see its `Object.hasOwn` note
 * for the prototype-inheritance trap that makes the guard non-obvious.
 *
 * An unrecognised id is dropped SILENTLY, with no error anywhere: a student on
 * a stale client, or on a route whose content was renamed, is an ordinary
 * thing. There is nothing to tell them and nothing for them to do.
 */
function cleanScreen(value: unknown): ScreenRef {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return {
    sectionId: screenId(raw.sectionId),
    lessonId: screenId(raw.lessonId),
    subjectId: screenId(raw.subjectId),
    practiceKey: screenId(raw.practiceKey),
  };
}

/**
 * Rate limiting is the most common failure in production, not an edge case:
 * the Gemini free tier allows only ~5 requests/minute for this model, so a
 * classroom asking questions at the same time will hit it routinely. It
 * deserves its own message rather than the generic "I could not answer that",
 * which would send students off debugging a question that was fine.
 */
function isQuotaError(err: unknown): boolean {
  const text = JSON.stringify(
    err,
    Object.getOwnPropertyNames(Object(err))
  ).toLowerCase();
  return (
    text.includes("quota") ||
    text.includes("rate limit") ||
    text.includes("resource_exhausted") ||
    text.includes("429")
  );
}

function busyMessage(lang: Lang): string {
  return lang === "km"
    ? "⏳ សំណួរច្រើនពេកក្នុងពេលតែមួយ។ សូមរង់ចាំមួយភ្លែត រួចសួរម្ដងទៀត។"
    : "⏳ Too many questions at once. Please wait a moment and ask again.";
}

/**
 * The 401 body.
 *
 * It has to read as a sentence, not as a status: chat-overlay.tsx renders any
 * non-ok response body verbatim as a KruAI bubble, so "Unauthorized" would
 * arrive on screen as the mentor's answer to the student's question.
 *
 * Deliberately says nothing about WHY. Expired, unsigned, anonymous and absent
 * are one message to the caller — the distinction is in the server log, where
 * it helps us, rather than in the response, where it only helps someone
 * probing the endpoint.
 */
function signInMessage(lang: Lang): string {
  return lang === "km"
    ? "🔒 សូមចូលគណនីដោយប្រើ Google ដើម្បីសួរសំណួរជាមួយ KruAI។"
    : "🔒 Please sign in with Google to ask KruAI a question.";
}

function textResponse(
  body: string,
  status: number,
  extraHeaders?: Record<string, string>
) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export async function handleChat(req: Request): Promise<Response> {
  // Declared size first, before a byte is read. Cheap, and it turns the obvious
  // way to make this endpoint expensive into a 413 that costs one header read.
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return textResponse("Request too large.", 413);
  }

  // Then the actual bytes, because content-length is the caller's claim about
  // the caller's own body and a chunked request carries none at all.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return textResponse("Invalid request body.", 400);
  }
  if (raw.length > MAX_BODY_BYTES) {
    return textResponse("Request too large.", 413);
  }

  let body: ChatRequestBody;
  try {
    body = JSON.parse(raw) as ChatRequestBody;
  } catch {
    return textResponse("Invalid request body.", 400);
  }

  const lang: Lang = body.lang === "km" ? "km" : "en";
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return textResponse("No message.", 400);
  }
  // Rejected rather than sliced. MAX_HISTORY below already bounds what is
  // FORWARDED, so a huge array costs nothing upstream — but accepting it says
  // this endpoint will do unbounded work on request, and the app's own client
  // never sends more than 40.
  if (messages.length > MAX_MESSAGES) {
    return textResponse("Too many messages.", 400);
  }

  // Anti-flood, before the signature check and before any upstream call, so
  // junk costs us nothing. Reuses busyMessage() so a student sees the same
  // wording whether the limit was ours or Google's — one situation, one message.
  const ipRate = checkRateLimit(clientIp(req), IP_RATE_LIMIT, RATE_WINDOW_MS);
  if (!ipRate.ok) {
    return textResponse(busyMessage(lang), 429, {
      "Retry-After": String(ipRate.retryAfterSec),
    });
  }

  // ── who is asking ─────────────────────────────────────────────────────────
  //
  // Hiding the button in the UI is not a gate; this is. Without it a guest can
  // spend the Gemini budget with one curl, which is the whole reason the client
  // sends a bearer token at all.
  if (!isVerificationConfigured()) {
    // Unconfigured is a DEVELOPMENT convenience only. In production it would
    // mean a missing Vercel variable had quietly reopened the endpoint to
    // everyone, so it fails closed instead — loudly, and in a way that shows up
    // the first time anyone tries the mentor rather than on a bill.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[api/chat] refusing to run: no SUPABASE_URL / VITE_SUPABASE_URL, so " +
          "no request can be authenticated. Set it in the Vercel project and redeploy."
      );
      return textResponse(
        lang === "km"
          ? "🔒 KruAI មិនអាចប្រើបានបណ្តោះអាសន្ន។ សូមព្យាយាមម្ដងទៀតនៅពេលបន្តិចទៀត។"
          : "🔒 KruAI is temporarily unavailable. Please try again shortly.",
        503
      );
    }
    console.warn(
      "[api/chat] no SUPABASE_URL — skipping token verification. " +
        "This is allowed in dev only; production fails closed."
    );
  } else {
    const auth = await verifyRequestUser(req);
    if (!auth.ok) {
      console.warn(`[api/chat] rejected request: ${auth.reason}`);
      return textResponse(signInMessage(lang), 401);
    }

    // The real quota, keyed on the student rather than on their school's
    // router. Prefixed so a user id can never collide with an IP key.
    const userRate = checkRateLimit(
      `u:${auth.userId}`,
      USER_RATE_LIMIT,
      RATE_WINDOW_MS
    );
    if (!userRate.ok) {
      return textResponse(busyMessage(lang), 429, {
        "Retry-After": String(userRate.retryAfterSec),
      });
    }
  }

  // Without a key the chat degrades to a friendly notice instead of a 500, so
  // a fresh clone of the repo still runs end to end.
  //
  // The wording is environment-aware on purpose: the .env.local hint is useful
  // to a developer running the repo, but it's a confusing internal instruction
  // if it ever surfaces to a real student on the deployed site.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const devHint = process.env.NODE_ENV !== "production";
    return textResponse(
      lang === "km"
        ? devHint
          ? "🔑 KruAI មិនទាន់ភ្ជាប់នៅឡើយទេ។ សូមបញ្ចូល GEMINI_API_KEY ក្នុងឯកសារ .env.local រួចចាប់ផ្តើម server ឡើងវិញ។"
          : "🔑 KruAI មិនអាចប្រើបានបណ្តោះអាសន្ន។ សូមព្យាយាមម្ដងទៀតនៅពេលបន្តិចទៀត។"
        : devHint
          ? "🔑 KruAI is not connected yet. Add GEMINI_API_KEY to .env.local and restart the dev server."
          : "🔑 KruAI is temporarily unavailable. Please try again shortly.",
      503
    );
  }

  const input: InteractionStep[] = messages
    .slice(-MAX_HISTORY)
    .filter((m) => typeof m?.text === "string" && m.text.trim())
    .map((m) => ({
      type: m.role === "bot" ? "model_output" : "user_input",
      content: [{ type: "text", text: m.text.slice(0, MAX_MESSAGE_CHARS) }],
    }));

  if (!input.length || input[input.length - 1].type !== "user_input") {
    return textResponse("No message.", 400);
  }

  const profile: ChatProfile = {
    name: "",
    language: "",
    grade: "",
    daysToExam: 0,
    strengths: [],
    weaknesses: [],
    level: 1,
    xp: 0,
    streak: 0,
    avgExamPct: null,
    examCount: 0,
    pendingPlacementTests: [],
    ...(body.profile ?? {}),
  };

  // The cheapest grounding the app has, and the most precise: a student reading
  // a section and asking "why does this happen?" has named the exact 7,000
  // characters of curriculum the question is about. No model, no round trip.
  //
  // `screen` is validated for shape here and for MEMBERSHIP inside
  // pinnedContextFor, which is what makes the text safe — it comes from the
  // app's own content, never from the request.
  const screen = cleanScreen(body.screen);
  const context = pinnedContextFor(screen);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const stream = await ai.interactions.create({
      model: GEMINI_MODEL,
      stream: true,
      // Don't let Google retain a student's conversation server-side; we keep
      // the history ourselves in the Zustand store and replay it each turn.
      store: false,
      // No `lang` here on purpose: the mentor always answers in Khmer (see
      // ANSWER_LANG in utils/chat-prompt.ts). `lang` still drives this route's
      // own error messages, which follow the app's UI language.
      system_instruction: buildSystemPrompt({
        profile,
        context,
        focusSubject: screen.subjectId,
      }),
      generation_config: {
        // Measured on this prompt: "minimal" gives ~2.7s to first character vs
        // ~11.2s on "low" — a big deal on a phone, and accuracy held up on
        // multi-step Bac II math (conjugate limits, conditional probability).
        // Raise to "low"/"medium" if harder content later starts coming out wrong.
        thinking_level: "minimal",
        max_output_tokens: 1200,
      },
      input,
    });

    const encoder = new TextEncoder();
    const out = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.event_type === "error") {
              // Log it: the student only sees a short apology, so without this
              // an upstream failure mid-stream is undiagnosable.
              console.error("[api/chat] upstream error event:", event.error);
              controller.enqueue(
                encoder.encode(
                  isQuotaError(event.error)
                    ? `\n${busyMessage(lang)}`
                    : lang === "km"
                      ? "\n⚠️ មានបញ្ហាពេលឆ្លើយ។ សូមព្យាយាមម្ដងទៀត។"
                      : "\n⚠️ Something went wrong mid-answer. Please try again."
                )
              );
              break;
            }
            // `type: "text"` is unique to TextDelta, so this also filters out
            // the model's internal thought summaries.
            if (event.event_type === "step.delta" && event.delta.type === "text") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          console.error("[api/chat] stream failed:", err);
          controller.enqueue(
            encoder.encode(
              lang === "km"
                ? "\n⚠️ ការតភ្ជាប់ដាច់។ សូមព្យាយាមម្ដងទៀត។"
                : "\n⚠️ The connection dropped. Please try again."
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(out, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/chat] request failed:", err);
    // 429 is a normal operating condition on the free tier, not a server fault.
    if (isQuotaError(err)) return textResponse(busyMessage(lang), 429);
    return textResponse(
      lang === "km"
        ? "⚠️ សុំទោស ខ្ញុំមិនអាចឆ្លើយបានទេ។ សូមព្យាយាមម្ដងទៀត។"
        : "⚠️ Sorry, I could not answer that. Please try again.",
      500
    );
  }
}

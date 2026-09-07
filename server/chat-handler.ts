import { GoogleGenAI } from "@google/genai";
// Relative imports, not the @/ alias, all the way down this file's import
// graph. Vite resolves the alias fine, but the Vercel function bundler
// (api/chat.ts) reads the root tsconfig.json — a solution file that carries no
// `paths` — so an aliased import here fails the deploy build. Relative paths
// work in both. See the same note in src/utils/chat-prompt.ts.
import type { Lang, ChatMsg } from "../src/types/index.js";
import { buildSystemPrompt, type ChatProfile } from "../src/utils/chat-prompt.js";
import { checkRateLimit } from "./rate-limit.js";

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
 * Per-IP burst cap. This endpoint is public and unauthenticated, so without it
 * anyone who finds the URL can spend the Gemini budget by scripting it. Set
 * well above human use on purpose: a whole classroom often shares one school
 * router's IP, and a limit tuned to "one student" would lock the class out.
 * A script doing thousands a minute still gets stopped.
 */
const RATE_LIMIT = 30;
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

  // Checked before the API-key lookup and before any upstream call, so a flood
  // costs us nothing. Reuses busyMessage() so a student sees the same wording
  // whether the limit was ours or Google's — one situation, one message.
  const rate = checkRateLimit(clientIp(req), RATE_LIMIT, RATE_WINDOW_MS);
  if (!rate.ok) {
    return textResponse(busyMessage(lang), 429, {
      "Retry-After": String(rate.retryAfterSec),
    });
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
      system_instruction: buildSystemPrompt({ profile }),
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

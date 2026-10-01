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
import { searchBiologyTextbook, searchHistoryTextbook, searchMathTextbook } from "./textbook-search.js";
import { getCachedAnswer, createCachedStreamResponse } from "./chat-cache.js";
import { takeQuota } from "./kruai-quota.js";
import { guidedAnchorIndex } from "../src/utils/chat-anchor.js";
import { KRUAI_LEFT_HEADER, KRUAI_LIMIT_HEADER } from "../src/data/kruai-phrases.js";

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
 * Upstream is Gemini through the Interactions API (`interactions.create`), not
 * `generateContent`, via the official @google/genai SDK. There is no single
 * model: GEMINI_MODELS × the key pool is a list of candidates, tried until one
 * produces the first character of an answer — see the fallback loop below.
 *
 * The response is a plain UTF-8 text stream, not SSE — there is only one stream
 * of text to send, so the client can just read it with `body.getReader()`.
 * Runs on the default Node.js runtime; streaming works there with no config.
 */

/** Candidate models in priority order to handle free-tier quotas and high demand. */
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
];

/**
 * Resolves all available Gemini API keys from environment variables.
 * Supports GEMINI_API_KEYS (comma-delimited), GEMINI_API_KEY (single or comma-delimited),
 * and GEMINI_API_KEY_1..5 for rotation pools.
 */
function getApiKeys(): string[] {
  const keys: string[] = [];
  const envVars = [
    process.env.GEMINI_API_KEYS,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ];

  for (const raw of envVars) {
    if (!raw) continue;
    const parts = raw
      .split(",")
      .map((k) => k.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    for (const p of parts) {
      if (!keys.includes(p)) {
        keys.push(p);
      }
    }
  }
  return keys;
}

/** Round-robin pointer across available API keys in the pool. */
let keyRotationIndex = 0;

/**
 * Most upstream calls one question may make before giving up. The pool is keys
 * × models — five keys and four models is twenty candidates — and trying all of
 * them one after another on a bad day would leave a student staring at an empty
 * bubble for most of a minute. Six is enough to get past one exhausted key and
 * one overloaded model.
 */
const MAX_ATTEMPTS = 6;

/**
 * How long ONE attempt may take to produce its first character before we give
 * up on it and try the next candidate.
 *
 * Measured, not guessed: a healthy candidate reaches first text in ~2–3s, but a
 * key whose quota is gone does not always refuse at once — Google held one for
 * 29.9s before answering 429, and the student watched an empty bubble for all
 * of it. Ten seconds is ~4× a normal first character.
 */
const ATTEMPT_TIMEOUT_MS = 10_000;

/**
 * Deadline for the first character across ALL attempts. vercel.json caps the
 * function at 60s, and that has to cover the whole answer streaming out after
 * the first character too, so the search for a working candidate may not eat
 * more than this.
 */
const FIRST_TEXT_DEADLINE_MS = 25_000;

/**
 * The same two numbers for a request carrying a photo. Reading an image before
 * answering takes longer to the first character, and cutting a healthy attempt
 * off at 10s would turn every photo question into a busy notice. Still under
 * vercel.json's 60s with room for the answer to stream.
 */
const IMAGE_ATTEMPT_TIMEOUT_MS = 18_000;
const IMAGE_FIRST_TEXT_DEADLINE_MS = 35_000;

/** How long a key+model that answered 429 is skipped by LATER requests. */
const QUOTA_COOLDOWN_MS = 60_000;
/** The same, when the quota that ran out is a daily one — retrying it every
 *  minute until midnight Pacific only adds a failed round trip to questions. */
const DAILY_COOLDOWN_MS = 30 * 60_000;
/** A key the API rejected (revoked, mistyped) or a model it does not know. */
const BROKEN_COOLDOWN_MS = 30 * 60_000;
/** A candidate we gave up on for being too slow — usually an exhausted key
 *  that had not got round to saying so. */
const TIMEOUT_COOLDOWN_MS = 5 * 60_000;

/**
 * `${keyIndex}|${model}` → the time it may be tried again. `*` in either slot
 * covers every key or every model.
 *
 * Without this, round-robin sent every Nth question to a key whose daily quota
 * was already gone, and each of those questions paid a failed round trip before
 * reaching one that worked — all day. Per serverless instance, like the hit map
 * in rate-limit.ts: a cold instance relearns it with one failed call, which is
 * the cost this saves being paid on every request instead.
 *
 * A cooldown is a PREFERENCE, never a ban: cooled candidates are sorted to the
 * back, not removed, so when everything is cooling down they are still tried.
 */
const cooldowns = new Map<string, number>();

function coolingUntil(keyIndex: number, model: string): number {
  return Math.max(
    cooldowns.get(`${keyIndex}|${model}`) ?? 0,
    cooldowns.get(`${keyIndex}|*`) ?? 0,
    cooldowns.get(`*|${model}`) ?? 0
  );
}

/**
 * What a failed attempt means for the attempts after it.
 *
 *   retry      busy or out of quota — the next key or model may well work
 *   skip-key   this key is refused outright, so every model on it will be too
 *   skip-model this model does not exist (renamed, retired), on any key
 *   fatal      the REQUEST is the problem; sending it again cannot help
 */
type Failure = "retry" | "skip-key" | "skip-model" | "fatal";

function errorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function errorText(err: unknown): string {
  try {
    return JSON.stringify(err, Object.getOwnPropertyNames(Object(err))).toLowerCase();
  } catch {
    return String(err).toLowerCase();
  }
}

function classifyFailure(err: unknown): Failure {
  const status = errorStatus(err);
  const text = errorText(err);
  // Gemini reports a bad key as 400 INVALID_ARGUMENT "API key not valid", not
  // as 401, so the key check has to read the message before the status.
  if (
    status === 401 ||
    status === 403 ||
    text.includes("api key not valid") ||
    text.includes("api_key_invalid")
  ) {
    return "skip-key";
  }
  if (status === 404) return "skip-model";
  if (status === 400 || status === 422) return "fatal";
  // 429, 5xx, a dropped connection (no status at all), anything unrecognised.
  return "retry";
}

/**
 * Called with the error from the attempt that just failed, so the NEXT request
 * does not repeat it. Only quota and broken-key/model failures cool down; a
 * one-off 503 says nothing about the next minute.
 */
function recordFailure(keyIndex: number, model: string, err: unknown, kind: Failure) {
  const now = Date.now();
  if (kind === "skip-key") {
    cooldowns.set(`${keyIndex}|*`, now + BROKEN_COOLDOWN_MS);
  } else if (kind === "skip-model") {
    cooldowns.set(`*|${model}`, now + BROKEN_COOLDOWN_MS);
  } else if (isQuotaError(err)) {
    const text = errorText(err);
    const daily = text.includes("perday") || text.includes("per day");
    cooldowns.set(
      `${keyIndex}|${model}`,
      now + (daily ? DAILY_COOLDOWN_MS : QUOTA_COOLDOWN_MS)
    );
  }
}

interface Candidate {
  keyIndex: number;
  model: string;
}

/**
 * Every key × model pair, best first.
 *
 * MODEL-major: the preferred model is tried on every key before a lesser model
 * is tried on any. Quotas are per project per model, so a second key usually has
 * the fast model's quota left, and falling to a slower model while a fresh key
 * sits unused trades answer speed for nothing. The key order starts at the
 * round-robin pointer so load still spreads across the pool.
 */
function orderedCandidates(keyCount: number): Candidate[] {
  const start = keyRotationIndex % keyCount;
  keyRotationIndex = (keyRotationIndex + 1) % keyCount;

  const all: Candidate[] = [];
  for (const model of GEMINI_MODELS) {
    for (let i = 0; i < keyCount; i++) {
      all.push({ keyIndex: (start + i) % keyCount, model });
    }
  }
  const now = Date.now();
  // Stable sort: order within each group is preserved.
  return all.sort(
    (a, b) =>
      Number(coolingUntil(a.keyIndex, a.model) > now) -
      Number(coolingUntil(b.keyIndex, b.model) > now)
  );
}

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
 * A third cap, on requests carrying a PHOTO, counted on top of USER_RATE_LIMIT.
 * A photo costs the model far more than a sentence, and re-sending it with each
 * follow-up multiplies that — so the cheap case keeps its generous limit and
 * only the expensive one gets a tighter one.
 */
const IMAGE_RATE_LIMIT = 6;

/**
 * What one question costs against the DAILY limits in kruai-quota.ts. A photo
 * is charged 3 because reading an image costs the model several times a text
 * question. The limits themselves (per student and for the whole app) live in
 * the kruai_take SQL function, so a student cannot choose them.
 */
const TEXT_UNITS = 1;
const PHOTO_UNITS = 3;

/**
 * A student's daily units. MIRRORS `user_daily` in
 * supabase/migrations/20260929000001_kruai_usage.sql, which is the one that
 * actually enforces it: change both together. This copy only turns "used so
 * far" (what kruai_take returns) into "left today" for the chat screen, so if
 * the two ever drift, the count a student sees is wrong but the limit is not.
 */
const USER_DAILY_UNITS = 30;

function quotaMessage(reason: "user" | "app", left: number, lang: Lang): string {
  // Only a photo can be refused with units still left (it costs 3), and those
  // still buy typed questions, so "come back tomorrow" would be wrong there.
  if (reason === "user" && left > 0) {
    return lang === "km"
      ? `📷 សំណួរដែលមានរូបភាព រាប់ជា 3 សំណួរ ប៉ុន្តែថ្ងៃនេះអ្នកនៅសល់តែ ${left} សំណួរទៀតប៉ុណ្ណោះ។ សូមសរសេរសំណួរជាអក្សរជំនួសវិញ ឬត្រឡប់មកវិញនៅថ្ងៃស្អែក។`
      : `📷 A question with a photo counts as 3, and you have only ${left} left today. Type your question instead, or come back tomorrow.`;
  }
  if (reason === "user") {
    return lang === "km"
      ? "📚 អ្នកបានសួរ KruAI គ្រប់ចំនួនសម្រាប់ថ្ងៃនេះហើយ។ សូមត្រឡប់មកសួរម្ដងទៀតនៅថ្ងៃស្អែក! សំណួរដែលមានរូបភាព រាប់ជា 3 សំណួរ។"
      : "📚 You have reached today's question limit for KruAI. Come back tomorrow! A question with a photo counts as 3.";
  }
  return lang === "km"
    ? "😴 KruAI បានឆ្លើយសំណួរច្រើនណាស់ថ្ងៃនេះ ហើយកំពុងសម្រាករហូតដល់ថ្ងៃស្អែក។ សូមត្រឡប់មកវិញនៅថ្ងៃស្អែក!"
    : "😴 KruAI has answered a lot of questions today and is resting until tomorrow. Please come back tomorrow!";
}

/**
 * Photos a single request may carry. The client sends the photo on the current
 * question plus, at most, one earlier photo still held in memory, so a
 * follow-up about the same exercise can still see it. More is refused rather
 * than trimmed: the app's own client never sends more.
 */
const MAX_IMAGES_PER_REQUEST = 2;

/**
 * Largest single photo, in base64 characters (≈1.1MB of JPEG). The client
 * re-encodes to 1400px at quality 0.72 (utils/image-compress.ts), which lands at
 * 200–450KB of base64 — this is ~3× that, room for a detailed page, and far
 * below anything worth parsing.
 */
const MAX_IMAGE_B64_CHARS = 1_500_000;

/**
 * How finely the model reads a photo. "high" because reading small print,
 * pencil and Khmer script correctly is the entire point of the feature — a
 * misread number is a wrong answer delivered with confidence.
 */
const IMAGE_RESOLUTION = "high";

/**
 * Largest request body we will read — text history (well under 64KB: 40
 * messages the composer itself caps) plus up to MAX_IMAGES_PER_REQUEST photos.
 *
 * It matters because `req.json()` parses the ENTIRE body before any of the
 * limits below apply: MAX_HISTORY and MAX_MESSAGE_CHARS bound what reaches the
 * MODEL, not what reaches memory. A megabyte of JSON was fully parsed and
 * array-allocated first, on a public endpoint, before being thrown away. It was
 * 64KB until photos; server/vite-chat-plugin.ts mirrors the number.
 */
const MAX_BODY_BYTES = 64 * 1024 + MAX_IMAGES_PER_REQUEST * MAX_IMAGE_B64_CHARS;

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
  content: (
    | { type: "text"; text: string }
    | { type: "image"; data: string; mime_type: string; resolution: string }
  )[];
};

/**
 * A message as it arrives on the wire: a ChatMsg plus what only the transport
 * carries. `image` is the full photo (lib/chat-images.ts holds it client-side);
 * `hadImage` marks a message that HAD one the client no longer holds — after a
 * reload — so the model is told a photo was there rather than left to pretend
 * it can see one. Both are `unknown` until cleanImage has looked at them.
 */
type WireMsg = Omit<ChatMsg, "image"> & { image?: unknown; hadImage?: unknown };

interface CleanImage {
  data: string;
  mimeType: string;
}

/** Base64 alphabet with optional padding, and nothing else. */
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * A photo from the request, or null if there is none — or throws "bad image"
 * for one that is present and wrong, which the caller turns into a 400.
 *
 * STRICT, because this is bytes forwarded to a paid model on a student's
 * behalf. The app's client always re-encodes to JPEG (utils/image-compress.ts),
 * so JPEG is the only type accepted, and the declared type is not trusted on
 * its own: `/9j/` is the base64 of JPEG's FF D8 FF signature, so a PNG or a
 * text file labelled image/jpeg is refused here rather than billed upstream.
 * Length is checked BEFORE the regex, so a huge string is never scanned.
 */
function cleanImage(value: unknown): CleanImage | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("bad image");
  const { data, mimeType } = value as Record<string, unknown>;
  if (
    mimeType !== "image/jpeg" ||
    typeof data !== "string" ||
    data.length === 0 ||
    data.length > MAX_IMAGE_B64_CHARS ||
    !data.startsWith("/9j/") ||
    !BASE64.test(data)
  ) {
    throw new Error("bad image");
  }
  return { data, mimeType };
}

function badImageMessage(lang: Lang): string {
  return lang === "km"
    ? "⚠️ មិនអាចអានរូបភាពនេះបានទេ។ សូមថតរូប ឬជ្រើសរូបភាពម្ដងទៀត។"
    : "⚠️ Could not read that photo. Please take or choose it again.";
}

/**
 * Appended to a turn whose photo the client no longer holds (see WireMsg). In
 * English on purpose: it is an instruction to the model, like the rest of the
 * system prompt's framing, never shown to the student.
 */
const PHOTO_GONE_NOTE =
  "\n\n[The student attached a photo to this message earlier. It is no longer available, so do not describe or rely on it; ask them to send it again if it is needed.]";

/** Put in front of the guided exercise when it is sent from outside the
 *  MAX_HISTORY window (see utils/chat-anchor.ts). Worded as a fact about where
 *  the guidance began, not as "the current exercise": a student who moved on
 *  to a second exercise mid-run still has those turns in the window. */
const ANCHOR_NOTE =
  "[Earlier messages are left out to save space. The step-by-step guidance in this conversation started from this question:]\n\n";

/**
 * The content of one student turn, or null when it has nothing in it. Image
 * first, then the words about it: the order the model's own guidance gives for
 * a single-image prompt. A photo turn with no words still counts: the photo IS
 * the question.
 */
function userContent(
  m: WireMsg | undefined,
  image: CleanImage | null,
  prefix = ""
): InteractionStep["content"] | null {
  const text = typeof m?.text === "string" ? m.text.trim() : "";
  if (!text && !image) return null;
  const words =
    text.slice(0, MAX_MESSAGE_CHARS) +
    (!image && m?.hadImage === true ? PHOTO_GONE_NOTE : "");
  return [
    ...(image
      ? [
          {
            type: "image" as const,
            data: image.data,
            mime_type: image.mimeType,
            resolution: IMAGE_RESOLUTION,
          },
        ]
      : []),
    ...(words ? [{ type: "text" as const, text: prefix + words }] : []),
  ];
}

/**
 * Appends a turn, folding it into the previous one when both are from the same
 * side. Turns normally alternate, but not always: a reply that never arrived is
 * left out of the history (the chat screen drops failed bubbles), which puts
 * two student turns next to each other, and so can the guided exercise sent
 * ahead of the window. One turn with several parts is valid on every model; two
 * same-side turns in a row is a shape we have no reason to depend on.
 */
function pushStep(input: InteractionStep[], step: InteractionStep) {
  const prev = input.at(-1);
  if (prev && prev.type === step.type) {
    prev.content.push(...step.content);
    return;
  }
  input.push(step);
}

interface ChatRequestBody {
  messages?: WireMsg[];
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
  // The status first. Matching "429" or "503" anywhere in the serialised error
  // also matched request ids and timestamps that happened to contain them.
  const status = errorStatus(err);
  if (status === 429 || status === 503) return true;
  const text = errorText(err);
  return (
    text.includes("quota") ||
    text.includes("rate limit") ||
    text.includes("resource_exhausted") ||
    text.includes("unavailable") ||
    text.includes("high demand") ||
    text.includes("overloaded")
  );
}

function busyMessage(lang: Lang): string {
  return lang === "km"
    ? "⏳ សំណួរច្រើនពេកក្នុងពេលតែមួយ ឬប្រព័ន្ធកំពុងរវល់បណ្ដោះអាសន្ន។ សូមរង់ចាំមួយភ្លែត រួចសួរម្ដងទៀត។"
    : "⏳ Too many questions at once or the system is temporarily busy. Please wait a moment and ask again.";
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

/**
 * One upstream call. Its own function so the stream's type is INFERRED from the
 * SDK: the interactions event union is not exported by @google/genai, and the
 * old code papered over that with `any`.
 */
function openStream(
  apiKey: string,
  model: string,
  system_instruction: string,
  input: InteractionStep[],
  signal: AbortSignal
) {
  const ai = new GoogleGenAI({ apiKey });
  return ai.interactions.create(
    {
      model,
      stream: true,
      store: false,
      system_instruction,
      generation_config: {
        // "minimal" measured ~2.7s to first character against ~11.2s on "low",
        // with accuracy holding on multi-step Bac II maths. The -latest alias
        // is the exception and keeps "low".
        thinking_level: model === "gemini-flash-latest" ? "low" : "minimal",
        max_output_tokens: 3000,
      },
      input,
    },
    // Aborts the request itself, response body included — so a timed-out
    // attempt and a student who closed the chat both stop costing quota.
    { fetchOptions: { signal } }
  );
}

type UpstreamStream = Awaited<ReturnType<typeof openStream>>;
type UpstreamEvent = UpstreamStream extends AsyncIterable<infer E> ? E : never;
type UpstreamIterator = AsyncIterator<UpstreamEvent>;

/** The answer text in an event, or "". `type: "text"` is unique to a text
 *  delta, so this also drops the model's internal thought summaries. */
function deltaText(event: UpstreamEvent): string {
  if (event.event_type !== "step.delta") return "";
  const delta = event.delta;
  return delta.type === "text" ? delta.text : "";
}

type FirstRead =
  | { kind: "text"; text: string }
  | { kind: "error"; error: unknown }
  | { kind: "empty" };

/** Reads until the first character of the answer, an error event, or the end. */
async function readUntilText(it: UpstreamIterator): Promise<FirstRead> {
  for (;;) {
    const next = await it.next();
    if (next.done) return { kind: "empty" };
    const event = next.value;
    if (event.event_type === "error") {
      return { kind: "error", error: event.error ?? event };
    }
    const text = deltaText(event);
    if (text) return { kind: "text", text };
  }
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

  // Every photo in the body is checked, not only the ones inside the forwarded
  // window: a malformed one is a malformed request wherever it sits. A photo on
  // a BOT message is ignored rather than refused — nothing the app sends puts
  // one there, and the model only accepts images from the user side.
  let images: (CleanImage | null)[];
  try {
    images = messages.map((m) =>
      m?.role === "bot" ? null : cleanImage(m?.image)
    );
  } catch {
    return textResponse(badImageMessage(lang), 400);
  }
  const imageCount = images.filter(Boolean).length;
  if (imageCount > MAX_IMAGES_PER_REQUEST) {
    return textResponse(badImageMessage(lang), 400);
  }

  const windowStart = Math.max(0, messages.length - MAX_HISTORY);
  const input: InteractionStep[] = [];

  // The exercise being guided, when it has slid out of the window: without it a
  // long guided chat ends with hints about a problem the model cannot see. See
  // utils/chat-anchor.ts.
  const anchor = guidedAnchorIndex(messages);
  if (anchor >= 0 && anchor < windowStart) {
    const content = userContent(messages[anchor], images[anchor], ANCHOR_NOTE);
    if (content) pushStep(input, { type: "user_input", content });
  }

  for (let i = windowStart; i < messages.length; i++) {
    const m = messages[i];
    if (m?.role === "bot") {
      const text = typeof m.text === "string" ? m.text.trim() : "";
      if (text) {
        pushStep(input, {
          type: "model_output",
          content: [{ type: "text", text: text.slice(0, MAX_MESSAGE_CHARS) }],
        });
      }
      continue;
    }
    const content = userContent(m, images[i]);
    if (content) pushStep(input, { type: "user_input", content });
  }

  if (!input.length || input[input.length - 1].type !== "user_input") {
    return textResponse("No message.", 400);
  }

  const lastUserText =
    input
      .filter((step) => step.type === "user_input")
      .at(-1)
      ?.content.map((c) => (c.type === "text" ? c.text : ""))
      .join(" ")
      .trim() ?? "";
  const hasImage = imageCount > 0;

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
      "[api/chat] no SUPABASE_URL, skipping token verification. " +
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

    if (hasImage) {
      const imageRate = checkRateLimit(
        `img:${auth.userId}`,
        IMAGE_RATE_LIMIT,
        RATE_WINDOW_MS
      );
      if (!imageRate.ok) {
        return textResponse(busyMessage(lang), 429, {
          "Retry-After": String(imageRate.retryAfterSec),
        });
      }
    }
  }

  // ── 0-token curated answers ──────────────────────────────────────────────
  // AFTER the gate, not before it: the endpoint has one door. (It used to sit
  // above, which also served a cache of other students' personalised replies to
  // an unauthenticated curl — see getCachedAnswer for why that cache is gone.)
  const isFirstTurn = !messages.some(
    (m) => m?.role === "bot" && typeof m.text === "string" && m.text.trim()
  );
  // Never with a photo: the typed words may match a canned answer while the
  // photo asks something else entirely.
  const cachedAnswer = getCachedAnswer(lastUserText, isFirstTurn && !hasImage);
  if (cachedAnswer) {
    return createCachedStreamResponse(cachedAnswer);
  }

  // ── API Key Pool & Rotation ──────────────────────────────────────────────
  // Collect all available Gemini API keys from environment variables.
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
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

  // ── daily limits (the money guard) ───────────────────────────────────────
  //
  // `unitsLeft` goes back to the chat screen in a header, so a student sees the
  // limit coming instead of meeting it. Null when nothing was charged.
  //
  // Charged HERE: after a curated answer (free) and after the key check (no
  // point spending a student's quota on a question that cannot be answered),
  // and before the first upstream call. See kruai-quota.ts.
  //
  // Only when verification is configured — the quota counts against the
  // verified student, and in dev without Supabase there is no student.
  let unitsLeft: number | null = null;
  if (isVerificationConfigured()) {
    const quota = await takeQuota(req, hasImage ? PHOTO_UNITS : TEXT_UNITS);
    if (!quota.ok && quota.reason !== "error") {
      // Usually 0 left, but not always: a photo (3 units) is refused with 2
      // left, and those 2 still buy two typed questions. No count with the
      // whole app's refusal: "8 left today" under "KruAI is resting until
      // tomorrow" would contradict it.
      const left = Math.max(0, USER_DAILY_UNITS - quota.userUnits);
      return textResponse(quotaMessage(quota.reason, left, lang), 429, {
        [KRUAI_LIMIT_HEADER]: quota.reason,
        ...(quota.reason === "user" ? { [KRUAI_LEFT_HEADER]: String(left) } : {}),
      });
    }
    if (quota.ok) {
      unitsLeft = Math.max(0, USER_DAILY_UNITS - quota.userUnits);
    }
    if (!quota.ok) {
      // FAILS CLOSED in production, like the auth gate above: the one job of
      // this check is that paid usage cannot run away, and "we could not
      // check" is not a reason to spend. The usual cause is the migration not
      // having been applied (PGRST202 in the detail).
      console.error(`[api/chat] daily quota check failed: ${quota.detail}`);
      if (process.env.NODE_ENV === "production") {
        return textResponse(
          lang === "km"
            ? "🔒 KruAI មិនអាចប្រើបានបណ្តោះអាសន្ន។ សូមព្យាយាមម្ដងទៀតនៅពេលបន្តិចទៀត។"
            : "🔒 KruAI is temporarily unavailable. Please try again shortly.",
          503
        );
      }
      console.warn("[api/chat] continuing without a daily limit (dev only)");
    }
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
  const pinned = pinnedContextFor(screen);

  // Ground KruAI in official MoEYS textbook text (Biology, Math, and History)
  const isMathQuery =
    screen.subjectId === "math" ||
    /គណិត|លីមីត|limit|ដេរីវេ|អាំងតេក្រាល|កុំផ្លិច|កោនិក|សមីការ|ប្រូបាប|វ៉ិចទ័រ|matrix|integral|derivative|\b0\/0\b|\b\+?\\infty\b/i.test(
      lastUserText
    );
  const isBioQuery =
    screen.subjectId === "biology" ||
    /ជីវ|កោសិកា|ប្រសាទ|អង់ស៊ីម|ប្រូតេអ៊ីន|adn|arn|ស៊ីណាប់|ណឺរ៉ូន|ស៊ីមណូ|អង់ស្យូ|មេយ៉ូស|មីតូស/i.test(
      lastUserText
    );
  const isHistoryQuery =
    screen.subjectId === "history" ||
    /ប្រវត្តិ|អាណាព្យាបាល|បារាំង|សន្ធិសញ្ញា|អង្គឌួង|នរោត្តម|ស៊ីសុវត្ថិ|មុនីវង្ស|សីហនុ|សៀម|កូសាំងស៊ីន|កម្ពុជាក្រោម|កោះត្រល់|ហ្សឺណែវ|ឯករាជ្យ|បាដេស|ក្រាំងលាវ|ឥស្សរៈ|ចលនាតស៊ូ|សង្គ្រាមលោក/i.test(
      lastUserText
    );

  const isSpecificSubject = isMathQuery || isBioQuery || isHistoryQuery;
  const bioChunks = isBioQuery || !isSpecificSubject ? searchBiologyTextbook(lastUserText) : [];
  const mathChunks = isMathQuery || !isSpecificSubject ? searchMathTextbook(lastUserText) : [];
  const historyChunks = isHistoryQuery || !isSpecificSubject ? searchHistoryTextbook(lastUserText) : [];
  const textbook = [...bioChunks, ...mathChunks, ...historyChunks].slice(0, 3);
  const context = [...pinned, ...textbook];

  const system_instruction = buildSystemPrompt({
    profile,
    context,
    focusSubject: screen.subjectId,
  });

  // ── upstream, with fallback ───────────────────────────────────────────────
  //
  // Tried in order until one produces its FIRST CHARACTER, not merely until one
  // accepts the request: an overloaded model often takes the request and then
  // sends an error event instead of text, which the old loop — falling back only
  // when create() threw — handed straight to the student as an apology. Once
  // text has been sent there is no switching; a mid-answer failure still ends in
  // the apology below, because the student has half an answer on screen.
  let served: { it: UpstreamIterator; first: string; candidate: Candidate } | null =
    null;
  let lastErr: unknown = null;
  let lastWasBusy = false;
  let emptyAnswer = false;
  let attempts = 0;
  const requestStart = Date.now();
  const skippedKeys = new Set<number>();
  const skippedModels = new Set<string>();

  let upstream: AbortController | undefined;
  const attemptTimeout = hasImage ? IMAGE_ATTEMPT_TIMEOUT_MS : ATTEMPT_TIMEOUT_MS;
  const firstTextDeadline = hasImage
    ? IMAGE_FIRST_TEXT_DEADLINE_MS
    : FIRST_TEXT_DEADLINE_MS;

  for (const candidate of orderedCandidates(apiKeys.length)) {
    if (attempts >= MAX_ATTEMPTS) break;
    const { keyIndex, model } = candidate;
    if (skippedKeys.has(keyIndex) || skippedModels.has(model)) continue;
    const timeLeft = firstTextDeadline - (Date.now() - requestStart);
    if (timeLeft < 1_000) break;
    attempts++;

    let it: UpstreamIterator | undefined;
    const attemptStart = Date.now();
    const abort = new AbortController();
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // The attempt RACES a timer rather than relying on the abort signal alone:
    // measured, a stalled attempt outlived its aborted signal by seven seconds,
    // so the SDK does not release on abort promptly. Racing guarantees the loop
    // moves on on time; the abort still runs, as cleanup.
    const attempt = (async () => {
      const stream = await openStream(
        apiKeys[keyIndex],
        model,
        system_instruction,
        input,
        abort.signal
      );
      it = stream[Symbol.asyncIterator]();
      return { first: await readUntilText(it), iter: it };
    })();
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        abort.abort();
        reject(new Error("attempt timeout"));
      }, Math.min(attemptTimeout, timeLeft));
    });

    try {
      const { first, iter } = await Promise.race([attempt, deadline]);
      clearTimeout(timer);
      if (first.kind === "text") {
        served = { it: iter, first: first.text, candidate };
        upstream = abort;
        break;
      }
      if (first.kind === "empty") {
        // Finished without a word — a safety block, usually. That is about the
        // question, not about capacity, so another key would only repeat it.
        emptyAnswer = true;
        break;
      }
      throw first.error;
    } catch (err) {
      clearTimeout(timer);
      abort.abort();
      // A late-arriving loser: swallow its result or error, and close its
      // stream if it opened one after we stopped waiting.
      attempt.then(
        () => void it?.return?.(),
        () => {}
      );
      void it?.return?.();
      const kind = timedOut ? "retry" : classifyFailure(err);
      if (timedOut) {
        cooldowns.set(`${keyIndex}|${model}`, Date.now() + TIMEOUT_COOLDOWN_MS);
      } else {
        recordFailure(keyIndex, model, err, kind);
      }
      // The key's POSITION, never the key.
      console.warn(
        `[api/chat] key #${keyIndex + 1} ${model} failed (${kind}) after ` +
          `${Date.now() - attemptStart}ms:`,
        timedOut
          ? "no text before the attempt timeout"
          : err instanceof Error
            ? err.message
            : err
      );
      lastErr = err;
      lastWasBusy = timedOut || isQuotaError(err);
      if (kind === "fatal") break;
      if (kind === "skip-key") skippedKeys.add(keyIndex);
      if (kind === "skip-model") skippedModels.add(model);
    }
  }

  if (!served) {
    if (!emptyAnswer) console.error("[api/chat] every attempt failed:", lastErr);
    // 429 is a normal operating condition on the free tier, not a server fault.
    // A timeout is the same situation to a student as a 429: busy, try again
    // in a moment. A request the API rejected as malformed is not.
    if (!emptyAnswer && lastWasBusy) {
      return textResponse(busyMessage(lang), 429);
    }
    return textResponse(
      lang === "km"
        ? "⚠️ សុំទោស ខ្ញុំមិនអាចឆ្លើយបានទេ។ សូមព្យាយាមម្ដងទៀត។"
        : "⚠️ Sorry, I could not answer that. Please try again.",
      500
    );
  }

  if (attempts > 1) {
    console.info(
      `[api/chat] served by key #${served.candidate.keyIndex + 1} ` +
        `${served.candidate.model} after ${attempts - 1} failed attempt(s); ` +
        `first text at ${Date.now() - requestStart}ms`
    );
  }

  const { it, first } = served;
  const encoder = new TextEncoder();
  // Set when the student closes the chat or loses the connection. Reading on
  // after that would spend quota generating an answer nobody will receive.
  let cancelled = false;

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(first));
        for (;;) {
          const next = await it.next();
          if (next.done || cancelled) break;
          const event = next.value;
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
          if (event.event_type === "interaction.completed") {
            // What this answer actually cost, in tokens. This line is how the
            // price of one question is MEASURED rather than guessed when the
            // daily limits in kruai_take are tuned. Numbers only, never text.
            const u = event.interaction?.usage;
            if (u) {
              console.info(
                `[api/chat] tokens in=${u.total_input_tokens ?? "?"} ` +
                  `out=${u.total_output_tokens ?? "?"} ` +
                  `thought=${u.total_thought_tokens ?? 0} ` +
                  `photo=${hasImage ? "yes" : "no"} model=${served.candidate.model}`
              );
            }
          }
          const text = deltaText(event);
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[api/chat] stream failed:", err);
        try {
          controller.enqueue(
            encoder.encode(
              lang === "km"
                ? "\n⚠️ ការតភ្ជាប់ដាច់។ សូមព្យាយាមម្ដងទៀត។"
                : "\n⚠️ The connection dropped. Please try again."
            )
          );
        } catch {
          // The reader went away between the failure and this line.
        }
      }
      if (!cancelled) {
        try {
          controller.close();
        } catch {
          // Already closed by a cancel racing the last chunk.
        }
      }
    },
    cancel() {
      cancelled = true;
      upstream?.abort();
      void it.return?.();
    },
  });

  return new Response(out, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...(unitsLeft !== null ? { [KRUAI_LEFT_HEADER]: String(unitsLeft) } : {}),
    },
  });
}

// Relative imports only — the Vercel function bundler reads the root tsconfig,
// which has no `paths`. See the note at the top of chat-handler.ts.
import { supabaseUrl } from "./verify-user.js";

/**
 * KruAI's DAILY limits, the money guard once the model is paid for.
 *
 * The counting happens in the database (supabase/migrations/
 * 20260929000001_kruai_usage.sql, `kruai_take`), NOT here, because a daily
 * limit has to be one number shared by every serverless instance — the
 * in-memory limiter in rate-limit.ts resets on every cold start. This file only
 * asks the question and reads the answer.
 *
 * It calls the RPC AS THE STUDENT: the request's own bearer token goes in
 * `Authorization`, so `auth.uid()` inside the function is them and the row it
 * increments is theirs. The server holds no secret key for this, and needs
 * none. That token has already been verified by verify-user.ts before this runs.
 *
 * Plain fetch rather than supabase-js: one POST does not justify pulling the
 * SDK into the function bundle.
 *
 * THE LIMITS LIVE IN THE DATABASE (20261002000004_kruai_controls.sql): the owner
 * sets them on /admin/kruai, and kruai_take returns the student limit it used
 * as `user_limit`. The server turns "used" into "left" with THAT number, so the
 * count a student sees can never disagree with the limit that was enforced.
 */

/** The student limit before 20261002000004 is applied, when kruai_take does
 *  not yet return `user_limit`. It matches the constant that migration's
 *  predecessor hard-coded, so the server works with or without it. */
export const DEFAULT_USER_DAILY_UNITS = 30;

export type QuotaResult =
  | { ok: true; userUnits: number; allUnits: number; userLimit: number }
  /** Refused. `user` is this student's own limit, `app` everyone's, and
   *  `blocked` means the team paused KruAI for this account. `userUnits` is
   *  what this student had already used (nothing was added). */
  | { ok: false; reason: "user" | "app" | "blocked"; userUnits: number; userLimit: number }
  /** Could not ask at all — the caller decides whether that blocks. */
  | { ok: false; reason: "error"; detail: string };

/** `user_limit` when the database sent a usable one, else the old default. */
function limitOf(row: Record<string, unknown>): number {
  const n = Number(row.user_limit);
  return row.user_limit != null && Number.isFinite(n) && n > 0
    ? n
    : DEFAULT_USER_DAILY_UNITS;
}

/** A slow database must not hold a question for long before the model even
 *  starts. Past this the take counts as failed (and production refuses). */
const QUOTA_TIMEOUT_MS = 5_000;

function publishableKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

export async function takeQuota(req: Request, units: number): Promise<QuotaResult> {
  const url = supabaseUrl();
  const key = publishableKey();
  const auth = req.headers.get("authorization") ?? "";
  if (!url || !key || !auth) {
    return { ok: false, reason: "error", detail: "quota not configured" };
  }

  let res: Response;
  try {
    res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/kruai_take`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_units: units }),
      signal: AbortSignal.timeout(QUOTA_TIMEOUT_MS),
    });
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      detail: err instanceof Error ? err.message : String(err),
    };
  }

  if (!res.ok) {
    // PGRST202 here means the migration was never applied.
    const body = await res.text().catch(() => "");
    return { ok: false, reason: "error", detail: `${res.status} ${body.slice(0, 200)}` };
  }

  // A set-returning function comes back as an array of rows.
  const rows: unknown = await res.json().catch(() => null);
  const row = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
  if (!row || typeof row.allowed !== "boolean") {
    return { ok: false, reason: "error", detail: "unexpected kruai_take response" };
  }
  const userLimit = limitOf(row);
  if (row.allowed) {
    return {
      ok: true,
      userUnits: Number(row.user_units) || 0,
      allUnits: Number(row.all_units) || 0,
      userLimit,
    };
  }
  return {
    ok: false,
    reason: row.reason === "app" ? "app" : row.reason === "blocked" ? "blocked" : "user",
    userUnits: Number(row.user_units) || 0,
    userLimit,
  };
}

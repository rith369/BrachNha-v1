import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * A student reporting a mistake in a question (components/report-mistake.tsx),
 * over report_content() in supabase/migrations/20261002000005.
 *
 * The function is the ONLY way a report is written: it checks the ref's shape,
 * caps a student at 30 a day ("too_many"), and treats a second report on a
 * question they already reported as done rather than as a new row. So a repeat
 * is success here too.
 *
 * Reached through getSupabase(): only a signed-in student sees the button, and
 * a signed-in student already has the SDK loaded for sync.
 */

export type MistakeKind = "wrong_answer" | "typo" | "unclear" | "other";

export type ReportResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "too_many" | "failed" };

/** Questions reported during this page load, so a button that remounts (the
 *  next question, back again) still shows "sent" rather than asking again. */
const sent = new Set<string>();

export function alreadyReported(ref: string): boolean {
  return sent.has(ref);
}

export async function reportContent(
  ref: string,
  kind: MistakeKind,
  note: string
): Promise<ReportResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "unconfigured" };
  const db = await getSupabase();
  if (!db) return { ok: false, reason: "unconfigured" };

  const { error } = await db.rpc("report_content", {
    p_ref: ref,
    p_kind: kind,
    p_note: note.trim().slice(0, 300),
  });
  if (error) {
    if (import.meta.env.DEV) console.warn("[content-reports]", error.message);
    return { ok: false, reason: error.hint === "too_many" ? "too_many" : "failed" };
  }
  sent.add(ref);
  return { ok: true };
}

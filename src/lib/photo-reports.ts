import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Result } from "./competitions";

/** Postgres unique-violation: this student already reported this photo. */
const UNIQUE_VIOLATION = "23505";

/**
 * Report another student's competition photo
 * (supabase/migrations/20261001000002_account_deletion_and_reports.sql).
 *
 * The report is a row for the team to review; nothing is hidden for anyone
 * else automatically, since one report removing a photo for everyone would let
 * any student hide a classmate's work. The policy only accepts a report about a
 * photo in a competition the reporter took part in, and never their own.
 *
 * A SECOND REPORT IS SUCCESS. The unique constraint refuses it, and that is the
 * outcome the student wanted: the photo is reported.
 */
export async function reportPhoto(path: string): Promise<Result<null>> {
  if (!isSupabaseConfigured) return { ok: false, reason: "unconfigured" };
  const db = await getSupabase();
  if (!db) return { ok: false, reason: "unconfigured" };

  const { data } = await db.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return { ok: false, reason: "unauthenticated" };

  const { error } = await db.from("photo_reports").insert({
    reporter_id: uid,
    competition_id: path.split("/")[0] ?? "",
    photo_path: path,
  });
  if (error && error.code !== UNIQUE_VIOLATION) {
    if (import.meta.env.DEV) console.warn("[photo-reports]", error.message);
    return { ok: false, reason: "failed" };
  }
  return { ok: true, data: null };
}

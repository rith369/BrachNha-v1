import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Result } from "./competitions";

/**
 * The team's photo-report review (/admin/reports), over
 * supabase/migrations/20261001000003_report_review.sql.
 *
 * NOTHING HERE IS THE SECURITY. Every function and Storage policy it calls
 * checks `is_app_admin()` in the database, so a student who opens the page gets
 * nothing back. This file only shapes the answers for the screen.
 */

/** Matches the bucket created in 20260914000001 (lib/competition-photos.ts). */
const BUCKET = "competition-work";
/** Long enough to look at a page of reports, short enough not to be a handout. */
const SIGNED_URL_TTL_SEC = 60 * 30;

export interface ReportedPhoto {
  path: string;
  competitionId: string;
  ownerName: string | null;
  reports: number;
  reasons: string[];
  firstReported: string;
  lastReported: string;
  /** A signed link, or null when the file is already gone from Storage. */
  url: string | null;
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

function devReport(op: string, error: { message?: string } | null): void {
  if (import.meta.env.DEV && error) {
    console.warn(`[admin-reports] ${op} failed:`, error.message ?? error);
  }
}

/** Whether the signed-in account is on the team's list. False on any failure:
 *  the page then shows "not for you", never a half-working review screen. */
export async function isAdmin(): Promise<boolean> {
  const db = await client();
  if (!db) return false;
  const { data, error } = await db.rpc("is_app_admin");
  devReport("is_app_admin", error);
  return data === true;
}

/** Whether the signed-in account is the OWNER (20261002000002): the one who
 *  can make and remove admins, and whose account the app will not delete.
 *  False on any failure, which only hides controls the database would refuse
 *  anyway. */
export async function isOwner(): Promise<boolean> {
  const db = await client();
  if (!db) return false;
  const { data, error } = await db.rpc("has_role", { p_role: "owner" });
  devReport("has_role owner", error);
  return data === true;
}

/** How many photos have open reports, for the menu badge. Null on failure or
 *  for a non-admin; no links are signed, so this is one cheap call. */
export async function countOpenReports(): Promise<number | null> {
  const db = await client();
  if (!db) return null;
  const { data, error } = await db.rpc("admin_photo_reports");
  devReport("count", error);
  return error ? null : (data ?? []).length;
}

/** Open reports, one entry per photo, newest report first, each with a link. */
export async function listReportedPhotos(): Promise<Result<ReportedPhoto[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };

  const { data, error } = await db.rpc("admin_photo_reports");
  if (error) {
    devReport("admin_photo_reports", error);
    return { ok: false, reason: "failed" };
  }
  const rows = data ?? [];
  if (rows.length === 0) return { ok: true, data: [] };

  // One batched signing call. Matched back by PATH, never by position: the
  // batch response is not promised to be in request order.
  const signed = await db.storage
    .from(BUCKET)
    .createSignedUrls(rows.map((r) => r.photo_path), SIGNED_URL_TTL_SEC);
  devReport("sign", signed.error);
  const urlByPath = new Map<string, string>();
  for (const s of signed.data ?? []) {
    if (s.path && s.signedUrl && !s.error) urlByPath.set(s.path, s.signedUrl);
  }

  return {
    ok: true,
    data: rows.map((r) => ({
      path: r.photo_path,
      competitionId: r.competition_id,
      ownerName: r.owner_name,
      reports: r.reports,
      reasons: r.reasons,
      firstReported: r.first_reported,
      lastReported: r.last_reported,
      url: urlByPath.get(r.photo_path) ?? null,
    })),
  };
}

/** Close every open report on this photo without touching the photo. */
export async function keepPhoto(path: string): Promise<Result<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_resolve_photo", {
    p_photo_path: path,
    p_resolution: "kept",
  });
  devReport("keep", error);
  return error ? { ok: false, reason: "failed" } : { ok: true, data: null };
}

/**
 * Delete the photo for everyone, then record the reports as "deleted".
 *
 * In that order: if the file delete fails, the reports stay open and the photo
 * stays on the list to try again. A file that is already gone (removed by hand
 * in Storage, so the list could not sign a link for it) is not an error, so
 * this also closes reports on such a photo.
 *
 * `fileExists` matters because Storage does NOT error when a policy blocks a
 * delete: it answers success with nothing removed. A photo the list could see
 * but this call removed nothing of means the admin delete policy is missing,
 * and recording it as "deleted" would be a lie.
 */
export async function deletePhoto(
  path: string,
  fileExists: boolean
): Promise<Result<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };

  const removed = await db.storage.from(BUCKET).remove([path]);
  if (removed.error || (fileExists && (removed.data?.length ?? 0) === 0)) {
    devReport("delete file", removed.error ?? { message: "nothing removed (policy?)" });
    return { ok: false, reason: "failed" };
  }
  const { error } = await db.rpc("admin_resolve_photo", {
    p_photo_path: path,
    p_resolution: "deleted",
  });
  devReport("resolve deleted", error);
  return error ? { ok: false, reason: "failed" } : { ok: true, data: null };
}

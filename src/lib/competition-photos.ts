import { getSupabase, isSupabaseConfigured } from "./supabase";
import { compressImage } from "@/utils/image-compress";
import type { FailReason, Result } from "./competitions";

/**
 * Photos of the working a student did on paper — uploading their own, and
 * reading the ones their opponent left.
 *
 * THIS IS THE ONLY FILE IN THE APP THAT TOUCHES STORAGE. It sits beside
 * lib/competitions.ts and shares its Result<T> contract for the same reason that
 * file gives: a student is waiting on the answer, so a failure is reported
 * rather than swallowed the way lib/supabase-sync.ts swallows its own.
 *
 * ── PER QUESTION, AND SEVERAL PER QUESTION ─────────────────────────────────
 *
 * It began as ONE photo per student per competition, and that was the wrong
 * unit: a photo of a whole paper does not say which working belongs to which
 * question, and one answer can run to several pages. The exchange is only useful
 * at the level a student actually asks about — "show me YOUR question 3".
 *
 * ── THE PATH IS STILL THE IDENTITY ─────────────────────────────────────────
 *
 *   {competitionId}/{userId}/{questionIndex}-{photoId}.jpg
 *
 * Nothing anywhere records a photo, so neither score table needs a write after
 * its insert. What changed is how a reader FINDS them: it lists the student's
 * folder rather than deriving a single name, and reads each photo's question
 * back out of its filename. The storage policies read the owner out of the path
 * the same way (see 20260916000002), so a file placed under anyone else's folder
 * is refused by the database rather than by a convention the client could break.
 *
 * ── WHY SIGNED URLS, NOT A PUBLIC BUCKET ───────────────────────────────────
 *
 * A public bucket would be a permanent URL for a photograph of a student's own
 * handwriting. These links expire, so access stays a live decision the policies
 * re-make on every view rather than something anyone who once saw it keeps.
 */

/** Matches the bucket created in 20260914000001. */
const BUCKET = "competition-work";

/** How long a view link lives. Long enough to read a page of working and come
 *  back to it, short enough that a copied URL is not a lasting handout. */
const SIGNED_URL_TTL_SEC = 60 * 60;

/**
 * The most photos one student may attach to one question.
 *
 * ENFORCED BY THE DATABASE, not only here — the upload policy counts the files
 * already on the question and refuses the seventh. This copy exists so the UI can
 * stop offering the button rather than letting a student take a photo that is
 * then refused. Six covers a long worked answer with room to spare; the number
 * that matters is that there IS one, because the first version bounded each
 * file's size and never how many there were.
 */
export const MAX_PHOTOS_PER_QUESTION = 6;

/** One photo of working, as a screen needs it. */
export interface WorkPhoto {
  /** The full object path — also what a delete is addressed by. */
  path: string;
  /** Which question it belongs to, zero-based, read from the filename. */
  question: number;
  /** A signed URL, or an object URL for a photo taken in this session. */
  url: string;
}

/** A student's folder for one competition. */
function folderOf(competitionId: string, userId: string): string {
  return `${competitionId}/${userId}`;
}

/**
 * The filename shape, and the ONLY place it is parsed.
 *
 * Mirrors the policy's `^[0-9]{1,2}-[A-Za-z0-9]{6,40}\.jpg$` exactly. Anything
 * else in the folder — a placeholder the storage service sometimes lists, a file
 * at the old single-photo path — is not a photo of a question and is skipped.
 */
const PHOTO_NAME = /^([0-9]{1,2})-[A-Za-z0-9]{6,40}\.jpg$/;

function questionOf(filename: string): number | null {
  const m = PHOTO_NAME.exec(filename);
  return m ? Number(m[1]) : null;
}

/**
 * A new photo id: a base-36 timestamp followed by random characters.
 *
 * The timestamp LEADS so the ids sort by when they were taken — the list is
 * ordered by name, and a student expects page one of an answer before page two.
 * Letters and digits only, which the filename check requires. Called from an
 * upload, never during render, so the impurity is where it belongs.
 */
function newPhotoId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).replace(/[^A-Za-z0-9]/g, "");
}

function fail(reason: FailReason): Result<never> {
  return { ok: false, reason };
}

/**
 * The storage service's actual error, printed in DEVELOPMENT only.
 *
 * This exists because of a real debugging failure: every upload was refused
 * with "infinite recursion detected in policy for relation objects", and the
 * screen could only say "Could not upload" — the Result contract deliberately
 * reduces an error to a reason, which is right for a student and useless for
 * finding the cause. A policy mistake is invisible from the UI by construction,
 * so the one place its message can surface is here. Never in production: the
 * text can name tables and policies.
 */
function devReport(op: string, error: { message?: string } | null): void {
  if (import.meta.env.DEV && error) {
    console.warn(`[competition-photos] ${op} failed:`, error.message ?? error);
  }
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

/**
 * Compress and upload one photo of this student's working for one question.
 *
 * Returns the new photo's PATH, which the caller keeps so it can show the photo
 * immediately and delete it later without listing the folder again.
 *
 * IT MUST RUN AFTER the competition or attempt row has reached the server — the
 * upload policy checks that the caller actually took part. A failed publish
 * therefore surfaces here as "failed" rather than silently producing an orphan.
 * The same "failed" covers the policy's other two refusals — a seventh photo on
 * a question, or a question the competition does not have — because the UI never
 * offers either, so reaching them means something is out of step rather than
 * something a student can act on.
 */
export async function uploadWorkPhoto(
  competitionId: string,
  userId: string,
  question: number,
  file: Blob
): Promise<Result<string>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return fail("unauthenticated");

  let compressed;
  try {
    compressed = await compressImage(file);
  } catch {
    // A file the browser cannot decode — a HEIC on a browser without support, a
    // PDF picked from the file browser. Reported as a plain failure because the
    // fix is the same either way: take another photo.
    return fail("failed");
  }

  const path = `${folderOf(competitionId, userId)}/${question}-${newPhotoId()}.jpg`;
  const { error } = await db.storage
    .from(BUCKET)
    // upsert OFF: every photo has its own id, so there is nothing to overwrite,
    // and the policy that would allow it no longer exists.
    .upload(path, compressed.blob, { contentType: compressed.contentType });

  if (error) {
    devReport("upload", error);
    return fail("failed");
  }
  return { ok: true, data: path };
}

/**
 * Take back one photo of your own working.
 *
 * THE ONE CONTROL A STUDENT HAS OVER SOMETHING THEY PUBLISHED. The storage
 * policies bound who can SEE a photo to the two people in a competition; this
 * is the other half. The delete policy is scoped to your own folder, so this can
 * only ever reach your own.
 *
 * A missing object is NOT an error: the caller asked for the file to be gone,
 * and it is. That also makes a retry after a half-failed delete safe.
 */
export async function deleteWorkPhoto(path: string): Promise<Result<null>> {
  const db = await client();
  if (!db) return fail("unconfigured");

  const { error } = await db.storage.from(BUCKET).remove([path]);
  if (error) {
    devReport("delete", error);
    return fail("failed");
  }
  return { ok: true, data: null };
}

/**
 * Every photo one student has attached to one competition, oldest first, each
 * with a viewable link.
 *
 * TWO ROUND TRIPS, NOT ONE PER PHOTO: one list of the folder, then one batched
 * signing call for everything in it. Signing each photo separately would be
 * thirty requests for a five-question competition on a phone on mobile data.
 *
 * ABSENT AND FORBIDDEN COLLAPSE INTO ONE ANSWER — an empty list — and that is
 * correct rather than lazy. The read policy decides what a folder listing
 * returns, and a joiner asking for another joiner's folder must not be able to
 * tell "no photos" from "not yours to see": the difference would leak who has
 * played a competition. A genuine transport failure still reports `failed`, so
 * the screen can say so rather than claiming there is nothing.
 */
export async function listWorkPhotos(
  competitionId: string,
  userId: string
): Promise<Result<WorkPhoto[]>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return { ok: true, data: [] };

  const folder = folderOf(competitionId, userId);
  const listed = await db.storage.from(BUCKET).list(folder, {
    // Comfortably above the most a competition can hold (10 questions × 6), so
    // one page is always the whole folder.
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (listed.error) {
    devReport("list", listed.error);
    return fail("failed");
  }

  const found = listed.data.flatMap((f) => {
    const question = questionOf(f.name);
    return question === null ? [] : [{ path: `${folder}/${f.name}`, question }];
  });
  if (found.length === 0) return { ok: true, data: [] };

  const signed = await db.storage
    .from(BUCKET)
    .createSignedUrls(
      found.map((f) => f.path),
      SIGNED_URL_TTL_SEC
    );
  if (signed.error) {
    devReport("sign", signed.error);
    return fail("failed");
  }

  // Matched by PATH, not by position: the batch response is not promised to be
  // in request order, and a photo paired with the wrong question's link would be
  // a silently wrong answer rather than a visible failure.
  const urlByPath = new Map(
    signed.data.flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl]] : []))
  );

  return {
    ok: true,
    data: found.flatMap((f) => {
      const url = urlByPath.get(f.path);
      return url ? [{ ...f, url }] : [];
    }),
  };
}

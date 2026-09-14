import { getSupabase, isSupabaseConfigured } from "./supabase";
import { compressImage } from "@/utils/image-compress";
import type { FailReason, Result } from "./competitions";

/**
 * The photo of the working a student did on paper — uploading their own, and
 * reading the one their opponent left.
 *
 * THIS IS THE ONLY FILE IN THE APP THAT TOUCHES STORAGE. It sits beside
 * lib/competitions.ts and shares its Result<T> contract for the same reason that
 * file gives: a student is waiting on the answer, so a failure is reported
 * rather than swallowed the way lib/supabase-sync.ts swallows its own.
 *
 * ── THE PATH IS THE IDENTITY ───────────────────────────────────────────────
 *
 * `{competitionId}/{userId}.jpg`, and nothing anywhere records it. That is a
 * deliberate structural choice rather than a saving: with the path derivable
 * from two ids the client already holds, neither `competitions` nor
 * `competition_attempts` needs a column written AFTER its insert — so both keep
 * the insert-only shape 20260913000001 argues for, and the feature adds no
 * UPDATE policy to a table holding a result.
 *
 * The storage policies read the owner straight back out of that filename (see
 * 20260914000001), so the path is not a convention the client could quietly
 * break: a file named after anyone else is refused by the database.
 *
 * ── WHY SIGNED URLS, NOT A PUBLIC BUCKET ───────────────────────────────────
 *
 * A public bucket would be one line less code and a permanent URL for a
 * photograph a student took of their own handwriting. These links expire, so
 * access stays a live decision the policies re-make on every view rather than
 * something anyone who once saw the page keeps forever.
 */

/** Matches the bucket created in 20260914000001. */
const BUCKET = "competition-work";

/** How long a view link lives. Long enough to read a page of working and come
 *  back to it, short enough that a copied URL is not a lasting handout. */
const SIGNED_URL_TTL_SEC = 60 * 60;

/**
 * Where one student's working for one competition lives.
 *
 * Exported because the review screen builds the OPPONENT's path from ids it
 * already has — there is nothing to look up first, which is what keeps reading
 * someone else's photo a single round trip.
 */
export function workPhotoPath(competitionId: string, userId: string): string {
  return `${competitionId}/${userId}.jpg`;
}

function fail(reason: FailReason): Result<never> {
  return { ok: false, reason };
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

/**
 * Compress and upload this student's own working.
 *
 * `upsert` is on so a blurry first try can be retaken — the storage policy
 * allows updating a file named after yourself and nothing else. That is the one
 * place this feature permits an update where the score tables permit none, and
 * the distinction is deliberate: a score is a result, a photo is an artefact,
 * and the first attempt at photographing a page of working very often has a
 * thumb across it.
 *
 * IT MUST RUN AFTER the competition or attempt row has reached the server — the
 * upload policy checks that the caller actually took part. A failed publish
 * therefore surfaces here as "failed" rather than silently producing an orphan.
 */
export async function uploadWorkPhoto(
  competitionId: string,
  userId: string,
  file: Blob
): Promise<Result<null>> {
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

  const { error } = await db.storage
    .from(BUCKET)
    .upload(workPhotoPath(competitionId, userId), compressed.blob, {
      contentType: compressed.contentType,
      upsert: true,
    });

  if (error) return fail("failed");
  return { ok: true, data: null };
}

/**
 * Take back the photo of your own working.
 *
 * THE ONE CONTROL A STUDENT HAS OVER SOMETHING THEY PUBLISHED. The storage
 * policies already bound who can SEE a photo to the two people in a
 * competition; this is the other half — the ability to withdraw it — and
 * without it the feature asks a student to hand over a picture of their own
 * handwriting with no way back. The delete policy is scoped to a file named
 * after the caller, so this can only ever reach your own.
 *
 * A missing object is NOT an error. Storage removes what it finds and says
 * nothing about what it does not, which is the right answer here: the caller
 * asked for the file to be gone, and it is. That also makes a retry after a
 * half-failed delete safe.
 */
export async function deleteWorkPhoto(
  competitionId: string,
  userId: string
): Promise<Result<null>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return fail("unauthenticated");

  const { error } = await db.storage
    .from(BUCKET)
    .remove([workPhotoPath(competitionId, userId)]);

  if (error) return fail("failed");
  return { ok: true, data: null };
}

/**
 * A viewable link to one student's working, or null when they have not uploaded.
 *
 * ABSENT AND FORBIDDEN COLLAPSE INTO ONE ANSWER — both come back as `ok: true,
 * data: null`, and that is correct rather than lazy. The storage policy is what
 * decides whether a file is reachable, and a joiner asking for another joiner's
 * photo must not be able to tell "no such photo" from "not yours to see": the
 * difference would leak who has played a competition. The UI says the same thing
 * for both ("nothing here yet"), which is all it could honestly say anyway.
 *
 * A genuine transport failure still reports `failed`, so the screen can offer a
 * retry rather than claiming an empty result.
 */
export async function workPhotoUrl(
  competitionId: string,
  userId: string
): Promise<Result<string | null>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return { ok: true, data: null };

  const { data, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(workPhotoPath(competitionId, userId), SIGNED_URL_TTL_SEC);

  // supabase-js reports a missing or unreadable object as an error on this call,
  // which is the case above: not something to retry, and not something to
  // describe precisely.
  if (error) return { ok: true, data: null };
  return { ok: true, data: data?.signedUrl ?? null };
}

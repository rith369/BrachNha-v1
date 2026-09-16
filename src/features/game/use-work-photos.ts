import { useEffect, useRef, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  MAX_PHOTOS_PER_QUESTION,
  deleteWorkPhoto,
  listWorkPhotos,
  uploadWorkPhoto,
  type WorkPhoto,
} from "@/lib/competition-photos";

/**
 * Photos of working, PER QUESTION — reading someone's, and managing your own.
 *
 * A `.ts` file rather than `.tsx`: it exports no component, and a non-component
 * export from a `.tsx` trips oxlint's only-export-components rule.
 */

export type PhotoLoad = "idle" | "loading" | "ready" | "failed";

export interface PhotoList {
  load: PhotoLoad;
  photos: WorkPhoto[];
}

/**
 * One student's photos for one competition, read-only.
 *
 * STATE IS KEYED ON WHOSE FOLDER IT HOLDS, so switching from one joiner to
 * another cannot show the first joiner's photos under the second one's name for
 * the moment the new list takes to arrive. A result whose key no longer matches
 * reads as "loading" during render — derived, not reset by an effect, because a
 * setState in an effect body is the cascading render oxlint's
 * react(set-state-in-effect) rule flags.
 */
export function usePhotoList(
  competitionId: string,
  userId: string,
  enabled: boolean
): PhotoList & { reload: () => void } {
  const key = `${competitionId}/${userId}`;
  const [result, setResult] = useState<{
    key: string;
    load: "ready" | "failed";
    photos: WorkPhoto[];
  } | null>(null);
  // Bumped by reload(); part of the effect's dependencies so a retry refetches
  // without the caller having to change anything else.
  const [attempt, setAttempt] = useState(0);

  const active = enabled && isSupabaseConfigured && Boolean(userId);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    listWorkPhotos(competitionId, userId).then((res) => {
      if (cancelled) return;
      setResult(
        res.ok
          ? { key, load: "ready", photos: res.data }
          : { key, load: "failed", photos: [] }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [active, competitionId, userId, key, attempt]);

  const reload = () => setAttempt((n) => n + 1);

  if (!active) return { load: "idle", photos: [], reload };
  if (!result || result.key !== key) return { load: "loading", photos: [], reload };
  return { load: result.load, photos: result.photos, reload };
}

/** What adding or removing is doing, per question. */
export interface QuestionActivity {
  /** Uploads still in flight for this question. */
  uploading: number;
  failed: "upload" | "delete" | null;
}

export interface MyWorkPhotos {
  /** False where photos could not work at all: no project, or no account. Both
   *  are supported states, so the UI hides the whole idea rather than offering a
   *  control guaranteed to fail. */
  available: boolean;
  load: PhotoLoad;
  photos: WorkPhoto[];
  forQuestion: (question: number) => WorkPhoto[];
  activity: (question: number) => QuestionActivity;
  /** Whether this student has shown ANY working. Drives the reciprocity gate. */
  uploaded: boolean;
  /**
   * Uploads the picked files to one question, in order, stopping at the cap.
   * Returns how many landed.
   *
   * A RETURN VALUE RATHER THAN THE CALLER WATCHING STATE, because a caller that
   * reads state after awaiting reads the value captured by the render it started
   * from — always the one from before the upload ran.
   */
  add: (question: number, files: File[]) => Promise<number>;
  remove: (photo: WorkPhoto) => Promise<boolean>;
}

/**
 * This student's own photos: what is already up there, plus what they add and
 * take back in this visit.
 *
 * ONE HOOK, CALLED ONCE, IN THE REVIEW PAGE. The photo step before the answers
 * and the per-question strips after them are two renderings of one fact; a copy
 * in each is how "have I added one?" ends up answered differently a few pixels
 * apart.
 *
 * WHAT THE SERVER LISTED AND WHAT THIS VISIT CHANGED ARE KEPT APART, and merged
 * during render. Re-listing after every photo would be a network round trip per
 * tap on a phone on mobile data; instead a new photo shows at once from the file
 * the phone is still holding, and a deleted one disappears at once.
 */
export function useMyWorkPhotos(
  competitionId: string,
  userId: string,
  /** The store's record that this student has shown working before — what lets
   *  the reciprocity gate open straight away, before the list has arrived. */
  alreadyTaken: boolean
): MyWorkPhotos {
  const setWorkPhoto = useBrachNhaStore((s) => s.setWorkPhoto);
  const available = isSupabaseConfigured && Boolean(userId);
  const listed = usePhotoList(competitionId, userId, available);

  const [added, setAdded] = useState<WorkPhoto[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [activityByQ, setActivityByQ] = useState<Record<number, QuestionActivity>>(
    {}
  );

  // Object URLs for photos taken this visit. Revoked on unmount, which is what
  // keeps them from outliving the screen that shows them. The Set is captured
  // once and mutated, so the cleanup sees every URL added after mount.
  const objectUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, []);

  const photos = [
    ...listed.photos,
    // Paths are unique per photo, so a just-added one can never collide with a
    // listed one — but the guard costs nothing if a list arrives mid-upload.
    ...added.filter((a) => !listed.photos.some((l) => l.path === a.path)),
  ].filter((p) => !removed.includes(p.path));

  const forQuestion = (question: number) =>
    photos.filter((p) => p.question === question);

  const activity = (question: number): QuestionActivity =>
    activityByQ[question] ?? { uploading: 0, failed: null };

  const patchActivity = (
    question: number,
    patch: (prev: QuestionActivity) => QuestionActivity
  ) =>
    setActivityByQ((all) => ({
      ...all,
      [question]: patch(all[question] ?? { uploading: 0, failed: null }),
    }));

  async function add(question: number, files: File[]): Promise<number> {
    // The cap is checked against what is on screen now, and the database
    // enforces it again — this copy only stops the app offering a photo that
    // would then be refused.
    const room = Math.max(0, MAX_PHOTOS_PER_QUESTION - forQuestion(question).length);
    const batch = files.slice(0, room);
    if (batch.length === 0) return 0;

    patchActivity(question, (a) => ({
      uploading: a.uploading + batch.length,
      failed: null,
    }));

    let landed = 0;
    // SEQUENTIAL, not Promise.all. Several pages uploading at once on a phone
    // compete for the same thin connection and the same memory — each one is
    // decoded to a full-size bitmap before it is shrunk — and a cheap handset
    // is exactly where decoding four at once kills the tab.
    for (const file of batch) {
      const res = await uploadWorkPhoto(competitionId, userId, question, file);
      patchActivity(question, (a) => ({ ...a, uploading: a.uploading - 1 }));
      if (!res.ok) {
        patchActivity(question, (a) => ({ ...a, failed: "upload" }));
        continue;
      }
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      setAdded((prev) => [...prev, { path: res.data, question, url }]);
      landed++;
    }

    // A local marker only — nothing on the server records a photo. It is what
    // lets the next visit skip the photo step and open the gate before the list
    // arrives.
    if (landed > 0) setWorkPhoto(competitionId, true);
    return landed;
  }

  async function remove(photo: WorkPhoto): Promise<boolean> {
    patchActivity(photo.question, (a) => ({ ...a, failed: null }));
    const res = await deleteWorkPhoto(photo.path);
    if (!res.ok) {
      patchActivity(photo.question, (a) => ({ ...a, failed: "delete" }));
      return false;
    }
    setRemoved((prev) => [...prev, photo.path]);
    if (objectUrls.current.has(photo.url)) {
      URL.revokeObjectURL(photo.url);
      objectUrls.current.delete(photo.url);
    }
    // THE LAST PHOTO GOING RE-CLOSES THE RECIPROCITY GATE. Showing your working
    // is what opens theirs, so withdrawing all of it has to withdraw the view it
    // bought — otherwise the promise to the other student is "show one once".
    const remaining = photos.filter((p) => p.path !== photo.path).length;
    if (remaining === 0) setWorkPhoto(competitionId, false);
    return true;
  }

  const uploaded =
    photos.length > 0 ||
    // Until a list has actually ARRIVED, trust the store's record rather than
    // shutting the gate on a student who showed working on another visit. That
    // covers a failed list too, not only a slow one: being offline for a moment
    // is not the same as having taken your photos back.
    (listed.load !== "ready" && alreadyTaken);

  return {
    available,
    load: listed.load,
    photos,
    forQuestion,
    activity,
    uploaded,
    add,
    remove,
  };
}

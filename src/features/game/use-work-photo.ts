import { useEffect, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { deleteWorkPhoto, uploadWorkPhoto } from "@/lib/competition-photos";

/**
 * Everything a student can do to the photo of their OWN working: take it,
 * replace it, take it back.
 *
 * ONE HOOK, CALLED ONCE, IN THE REVIEW PAGE. Two screens need this state — the
 * photo step before the answers, and the "your working" panel after them — and
 * they are two renders of one fact, not two facts. Holding it in either
 * component would mean the other could not see it, and holding a copy in both
 * is how "have I uploaded?" ends up answered differently a few pixels apart.
 * The two components are presentational and take what they need as props; this
 * is the lift-on-second-caller rule the repo already applies to utils/rewards.ts
 * and shell/stat-bar.tsx.
 *
 * A `.ts` file rather than `.tsx`: it exports no component, and a non-component
 * export from a `.tsx` trips oxlint's only-export-components rule.
 */

/** What the photo is doing right now. One value rather than three booleans, so
 *  "uploading and deleting at once" is unrepresentable rather than merely
 *  avoided. */
export type PhotoPhase =
  | "idle"
  | "uploading"
  | "deleting"
  | "uploadFailed"
  | "deleteFailed";

export interface WorkPhotoControls {
  phase: PhotoPhase;
  /** True once a photo exists on the server for this student. Drives the
   *  reciprocity gate — see WorkPhoto's `locked`. */
  uploaded: boolean;
  /** An object URL for a photo taken in THIS session, so the panel can show it
   *  without asking the server for bytes the phone is still holding. Null once
   *  the photo is deleted, or when it predates this visit. */
  localUrl: string | null;
  /**
   * Returns whether it actually landed.
   *
   * A RETURN VALUE RATHER THAN A CALLBACK WATCHING `phase`, because the caller
   * that needs to know — the photo step, which advances to the answers on
   * success — would otherwise read the phase captured by the render it started
   * from, which is always the one from before the upload ran.
   */
  upload: (file: Blob) => Promise<boolean>;
  remove: () => Promise<boolean>;
  /** False where a photo could not work at all: no project, or no account. Both
   *  are supported states, so the UI hides the whole idea rather than offering a
   *  control that is guaranteed to fail. */
  available: boolean;
}

export function useWorkPhoto(
  competitionId: string,
  userId: string,
  /** Whether the store already has a photo recorded for this competition. */
  alreadyTaken: boolean
): WorkPhotoControls {
  const setWorkPhoto = useBrachNhaStore((s) => s.setWorkPhoto);

  const [phase, setPhase] = useState<PhotoPhase>("idle");
  const [uploaded, setUploaded] = useState(alreadyTaken);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  // Revoking on change AND on unmount is what keeps the object URL from
  // outliving the screen that uses it. The cleanup runs with the OLD value
  // captured, which is exactly the one to release.
  useEffect(() => {
    if (!localUrl) return;
    return () => URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  async function upload(file: Blob): Promise<boolean> {
    setPhase("uploading");
    const res = await uploadWorkPhoto(competitionId, userId, file);
    if (!res.ok) {
      setPhase("uploadFailed");
      return false;
    }
    // The local marker only — nothing on the server records a path, because the
    // path is derived from ids. See lib/competition-photos.ts.
    setWorkPhoto(competitionId, true);
    setLocalUrl(URL.createObjectURL(file));
    setUploaded(true);
    setPhase("idle");
    return true;
  }

  async function remove(): Promise<boolean> {
    setPhase("deleting");
    const res = await deleteWorkPhoto(competitionId, userId);
    if (!res.ok) {
      setPhase("deleteFailed");
      return false;
    }
    setWorkPhoto(competitionId, false);
    setLocalUrl(null);
    // THE RECIPROCITY GATE CLOSES AGAIN, and that is deliberate rather than
    // theatre: the rule is that showing yours is what opens theirs, so
    // withdrawing yours has to withdraw the view it bought. Without it the rule
    // would read as "show yours once", which is a different and weaker promise
    // to make to the student on the other side.
    setUploaded(false);
    setPhase("idle");
    return true;
  }

  return {
    phase,
    uploaded,
    localUrl,
    upload,
    remove,
    available: isSupabaseConfigured && Boolean(userId),
  };
}

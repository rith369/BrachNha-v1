import { useRef } from "react";
import { Camera, TriangleAlert } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { FocusButton } from "@/components/shell/focus-layout";
import { gameCopy } from "../copy";
import type { WorkPhotoControls } from "../use-work-photo";

/**
 * Photograph the working you did on paper, between the result and the answers.
 *
 * ── WHY IT SITS EXACTLY THERE ──────────────────────────────────────────────
 *
 * AFTER the result, because a photo that had to succeed before a student learned
 * their own score would let a failed upload cost them the run — and this is the
 * one screen where the upload can genuinely fail, on a phone, on mobile data,
 * with a camera. The score is already theirs by the time this asks.
 *
 * BEFORE the answers, and this is the load-bearing half rather than a
 * preference. Once the correct answers are on screen, a photograph of "my
 * working" is a photograph of working that can be corrected first. Asking for it
 * while the student still only knows their score is what makes the picture worth
 * swapping at all.
 *
 * ── AND WHY SKIPPING IS STILL ALLOWED ──────────────────────────────────────
 *
 * A hard lock would mean a broken camera, a declined permission or a dead
 * connection permanently hides a review the student has already earned. So Skip
 * moves on to the answers — and buys nothing else. The classmate's working stays
 * behind the reciprocity gate (see WorkPhoto's `locked`), which is the honest
 * shape of an exchange: showing yours is what opens theirs, and nothing else is
 * held hostage to it. A student who skips here can still add one later from the
 * panel on the review itself — see MyWorkPhoto.
 *
 * IT OWNS NO UPLOAD STATE. The same photo is shown and managed by MyWorkPhoto
 * after the reveal, so both read one `useWorkPhoto` held by the page — see that
 * hook for why two copies of "have I uploaded?" is the bug worth designing out.
 */
export function WorkPhotoStep({
  photo,
  onDone,
  onSkip,
}: {
  photo: WorkPhotoControls;
  /** Called once a photo is actually on the server, to move on to the answers. */
  onDone: () => void;
  onSkip: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const input = useRef<HTMLInputElement>(null);

  const busy = photo.phase === "uploading";

  return (
    <div className="text-center">
      <Camera
        className="mx-auto mb-3 size-14 text-purple md:mb-5 md:size-20"
        strokeWidth={2}
      />
      <div className="font-heading mb-2 text-lg font-extrabold md:text-xl">
        {t.yourWorking}
      </div>
      <p className="mx-auto mb-1 max-w-xs text-sm font-bold text-muted">
        {t.photoPrompt}
      </p>
      <p className="mx-auto mb-5 max-w-xs text-xs font-bold text-muted">
        {t.photoWhy}
      </p>

      {/* `capture` asks a phone for the camera directly rather than the gallery,
          which is what a student photographing the page in front of them wants.
          Desktop browsers ignore it and open a file picker, which is also right
          — and `accept` still keeps them to images either way. */}
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so picking the SAME file again after a failure still fires a
          // change event — an input keeps its value otherwise and the retry
          // would silently do nothing.
          e.target.value = "";
          if (!file) return;
          // Advance ONLY on a real success — a failure leaves the student here
          // with the error and the same button, which is what a retry needs.
          void photo.upload(file).then((ok) => {
            if (ok) onDone();
          });
        }}
      />

      <div className="mx-auto flex w-full max-w-xs flex-col gap-2.5">
        <FocusButton onClick={() => input.current?.click()} disabled={busy}>
          {busy ? t.uploadingPhoto : t.takePhoto}
        </FocusButton>
        <button
          onClick={onSkip}
          disabled={busy}
          className="text-xs font-extrabold text-muted underline underline-offset-4 disabled:opacity-40"
        >
          {t.skipPhoto}
        </button>
      </div>

      {photo.phase === "uploadFailed" && (
        <p className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-1.5 text-xs font-bold text-pink">
          <TriangleAlert className="size-4 shrink-0" strokeWidth={2.5} />
          {t.photoFailed}
        </p>
      )}
    </div>
  );
}

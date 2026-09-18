import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { MAX_PHOTOS_PER_QUESTION, type WorkPhoto } from "@/lib/competition-photos";
import { gameCopy } from "../copy";

/**
 * A row of thumbnails for the photos attached to one question.
 *
 * EACH THUMBNAIL IS A PLAIN LINK TO THE FULL IMAGE, and that is the whole zoom
 * feature. Handwritten working is fine detail — an exponent is a few pixels — and
 * the browser's own viewer hands over pinch-zoom, rotate and save for nothing,
 * where a lightbox would be a focus trap and a gesture handler to get wrong.
 *
 * THE DELETE BUTTON IS A SIBLING OF THE LINK, NEVER INSIDE IT — a button in a
 * link is invalid markup, and the tap has to reach the button rather than open
 * the photo. It takes TWO taps: the first turns the × into a red "Delete?", the
 * second deletes. Same two-tap shape as Profile's logout and FocusLayout's exit,
 * at thumbnail size.
 */
export function PhotoStrip({
  photos,
  onDelete,
  lastPhotoOverall = false,
}: {
  photos: WorkPhoto[];
  /** Present only for your OWN photos — nobody else's can be deleted, and the
   *  storage policy would refuse it anyway. */
  onDelete?: (photo: WorkPhoto) => void;
  /** Whether deleting from this strip would remove the student's LAST photo
   *  anywhere, which closes the reciprocity gate. Said out loud at confirm time
   *  rather than discovered afterwards. */
  lastPhotoOverall?: boolean;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p, i) => {
          const armed = confirming === p.path;
          return (
            <div key={p.path} className="relative">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block size-16 overflow-hidden rounded-xl border border-purple/10 bg-control md:size-20"
              >
                <img
                  src={p.url}
                  // "Page 2", not the question — the question is already the
                  // card's own heading, and a student with three pages needs to
                  // know which is which.
                  alt={`${t.photoPage} ${i + 1}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </a>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (!armed) return setConfirming(p.path);
                    setConfirming(null);
                    onDelete(p);
                  }}
                  aria-label={armed ? t.deleteConfirmShort : t.deletePhoto}
                  className={cn(
                    "absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full border shadow-panel-sm transition",
                    armed
                      ? "h-6 border-pink bg-[var(--brand-pink)] px-2 text-[9px] font-extrabold text-white"
                      : "size-6 border-purple/20 bg-surface text-muted hover:text-pink"
                  )}
                >
                  {armed ? t.deleteConfirmShort : <X className="size-3.5" strokeWidth={3} />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* The consequence is stated WHILE the student is deciding. Deleting one of
          several pages changes nothing for the other side; deleting the last one
          hides their working again, which is worth knowing before the second tap. */}
      {confirming && lastPhotoOverall && (
        <p className="mt-1.5 text-[10px] font-bold text-pink">{t.deleteWarns}</p>
      )}
    </div>
  );
}

/**
 * "Add photo" for one question.
 *
 * `multiple`, and NO `capture` — the pair is deliberate. `capture` forces a
 * phone straight into its camera for a single shot, which is right for one
 * photo and wrong the moment an answer runs to several pages: a student who
 * photographed three sheets in their camera app first should be able to pick
 * all three at once. Without it, phones offer both the camera and the gallery.
 */
export function AddPhotosButton({
  count,
  uploading,
  onPick,
}: {
  /** Photos already on this question, for the cap. */
  count: number;
  uploading: number;
  onPick: (files: File[]) => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const input = useRef<HTMLInputElement>(null);

  const full = count >= MAX_PHOTOS_PER_QUESTION;

  // At the cap the button is REPLACED by a statement of the limit, never left
  // disabled — a control that answers a tap with silence reads as broken.
  if (full && uploading === 0) {
    return (
      <p className="text-[10px] font-bold text-muted">
        {t.photoLimitReached} ({MAX_PHOTOS_PER_QUESTION})
      </p>
    );
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          // Cleared so picking the SAME file again after a failure still fires a
          // change event — an input keeps its value otherwise and the retry
          // would silently do nothing.
          e.target.value = "";
          if (files.length > 0) onPick(files);
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading > 0}
        className="flex items-center gap-1.5 rounded-xl border border-purple/20 bg-purple/8 px-3 py-2 text-[11px] font-extrabold text-purple transition hover:bg-purple/15 disabled:opacity-50"
      >
        <Camera className="size-3.5 shrink-0" strokeWidth={2.5} />
        {uploading > 0 ? `${t.uploadingPhoto} (${uploading})` : t.addPhoto}
      </button>
    </>
  );
}

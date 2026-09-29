import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Images, LoaderCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Lang } from "@/types";

/**
 * The composer's photo button and the chip that previews what is attached.
 *
 * ONE BUTTON, TWO CHOICES (the user's call): the composer is already Σ, the
 * text field and Send, and at the 320px floor a fourth and fifth icon leave the
 * field too narrow to type in. The menu offers the two things a student means:
 *
 *   ថតរូប       an input WITH `capture="environment"` — a phone opens its rear
 *               camera straight away, which is what "take a photo" means.
 *   ជ្រើសរូបភាព  an input WITHOUT it — the phone's own picker, gallery and files.
 *
 * Two inputs rather than one toggled attribute, because `capture` is read when
 * the picker opens and some browsers cache it per element. On a laptop both
 * open the ordinary file dialog, which is right: there is no rear camera.
 * `accept="image/*"` rather than a list, so an iPhone's HEIC is offered too —
 * it is re-encoded to JPEG before it leaves the phone (utils/image-compress.ts).
 */

const COPY = {
  en: {
    button: "Add a photo",
    camera: "Take photo",
    gallery: "Choose photo",
    processing: "Preparing photo…",
    ready: "Photo attached",
    error: "Could not open this photo. Try another one.",
    remove: "Remove photo",
  },
  km: {
    button: "បន្ថែមរូបភាព",
    camera: "ថតរូប",
    gallery: "ជ្រើសរូបភាព",
    processing: "កំពុងរៀបចំរូបភាព…",
    ready: "បានភ្ជាប់រូបភាព",
    error: "មិនអាចបើករូបភាពនេះបានទេ។ សូមសាកល្បងរូបផ្សេង។",
    remove: "ដករូបភាពចេញ",
  },
} as const;

export function PhotoButton({
  lang,
  disabled,
  className,
  onOpen,
  onPick,
}: {
  lang: Lang;
  disabled?: boolean;
  className?: string;
  /** Called as the menu opens, so the overlay can put the math keyboard away. */
  onOpen?: () => void;
  onPick: (file: File) => void;
}) {
  const c = COPY[lang];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Outside tap and Escape close the menu. The listener exists only while it is
  // open, the same rule ActivityHeatmap's tooltip follows.
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(input: HTMLInputElement | null) {
    setOpen(false);
    input?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Cleared so picking the SAME photo again still fires a change event.
    e.target.value = "";
    if (file) onPick(file);
  }

  const item =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-text transition hover:bg-purple/10";

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((v) => !v);
        }}
        disabled={disabled}
        aria-label={c.button}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        <Camera className="size-4.5" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-20 mb-2 w-48 rounded-2xl border border-purple/15 bg-elevated p-1.5 shadow-panel"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(cameraRef.current)}
            className={item}
          >
            <Camera className="size-4.5 text-purple" strokeWidth={2.25} />
            {c.camera}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(galleryRef.current)}
            className={item}
          >
            <Images className="size-4.5 text-purple" strokeWidth={2.25} />
            {c.gallery}
          </button>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        data-testid="chat-photo-camera"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        data-testid="chat-photo-gallery"
      />
    </div>
  );
}

export function AttachmentChip({
  lang,
  status,
  thumb,
  onRemove,
}: {
  lang: Lang;
  status: "processing" | "ready" | "error";
  thumb?: string;
  onRemove: () => void;
}) {
  const c = COPY[lang];
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2.5 rounded-2xl border bg-surface p-1.5 pr-2",
        status === "error" ? "border-pink/30" : "border-purple/15"
      )}
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-control">
        {status === "ready" && thumb ? (
          <img src={thumb} alt="" className="size-full object-cover" />
        ) : status === "processing" ? (
          <LoaderCircle className="size-5 animate-spin text-purple" />
        ) : (
          <ImagePlus className="size-5 text-pink" />
        )}
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 text-xs font-bold",
          status === "error" ? "text-pink" : "text-muted"
        )}
      >
        {status === "processing" ? c.processing : status === "error" ? c.error : c.ready}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={c.remove}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-pink/10 hover:text-pink"
      >
        <X className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

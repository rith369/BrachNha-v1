import { useRef, useState } from "react";
import { RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { WorkPhoto } from "./work-photo";
import { gameCopy } from "../copy";
import type { WorkPhotoControls } from "../use-work-photo";

/**
 * This student's own working, with the two controls only they get: replace it,
 * or take it back.
 *
 * ── WHY DELETE HAD TO EXIST ────────────────────────────────────────────────
 *
 * The storage policies bound WHO can see a photo to the two students in a
 * competition, and for a while that was the whole control. It is not enough:
 * this feature asks a student to upload a picture of their own handwriting, and
 * a thing you can publish and cannot withdraw is not a thing you consented to
 * in any useful sense. The database permission was written with the rest of the
 * bucket's policies; this is the button for it.
 *
 * ── AND WHY RETAKE SHIPS WITH IT ───────────────────────────────────────────
 *
 * The photo step runs once, before the answers, and until this panel existed a
 * blurry first attempt was permanent. That is the case the storage layer's lone
 * UPDATE policy was written for — a score is a result and must not be editable,
 * but a photo is an artefact, and the first try at photographing a page of
 * working very often has a thumb across it.
 *
 * DELETING RE-CLOSES THE RECIPROCITY GATE — the classmate's photo goes back
 * behind "add your own to see theirs". The confirm says so before it happens
 * rather than letting it be discovered afterwards; see useWorkPhoto's `remove`.
 */
export function MyWorkPhoto({
  competitionId,
  userId,
  photo,
}: {
  competitionId: string;
  userId: string;
  photo: WorkPhotoControls;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const input = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);

  const busy = photo.phase === "uploading" || photo.phase === "deleting";

  return (
    <div>
      <WorkPhoto
        competitionId={competitionId}
        userId={userId}
        title={t.yourWorking}
        localUrl={photo.localUrl ?? undefined}
        // Without this the panel would keep showing the photo it fetched a
        // signed URL for before the delete landed.
        hidden={!photo.uploaded}
      />

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so picking the SAME file again after a failure still fires a
          // change event — an input keeps its value otherwise, and the retry
          // would silently do nothing.
          e.target.value = "";
          if (file) void photo.upload(file);
        }}
      />

      {/* Two-tap confirm rather than a dialog, matching Profile's logout, the
          chat's delete-conversation and FocusLayout's own exit. One less overlay
          to reason about, and it cannot escape the shell the way a portalled
          dialog would. */}
      {confirming ? (
        <div className="mt-2 rounded-2xl border border-pink/30 bg-pink/8 p-3">
          <div className="mb-1 text-xs font-extrabold">{t.deleteConfirm}</div>
          <p className="mb-2.5 text-[10px] font-bold text-muted">
            {t.deleteWarns}
          </p>
          <div className="flex gap-2">
            <Action
              onClick={() => setConfirming(false)}
              disabled={busy}
              tone="quiet"
            >
              {t.cancel}
            </Action>
            <Action
              onClick={() => {
                setConfirming(false);
                void photo.remove();
              }}
              disabled={busy}
              tone="danger"
              icon={<Trash2 className="size-3.5" strokeWidth={2.5} />}
            >
              {t.deletePhoto}
            </Action>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <Action
            onClick={() => input.current?.click()}
            disabled={busy}
            tone="quiet"
            icon={<RefreshCw className="size-3.5" strokeWidth={2.5} />}
          >
            {photo.phase === "uploading"
              ? t.uploadingPhoto
              : photo.uploaded
                ? t.retakePhoto
                : t.takePhoto}
          </Action>
          {/* ABSENT rather than disabled when there is nothing to delete — a
              control that answers a tap with silence reads as broken, the rule
              sidebar-nav's href:null rows and the survey's StudiedStep follow. */}
          {photo.uploaded && (
            <Action
              onClick={() => setConfirming(true)}
              disabled={busy}
              tone="danger"
              icon={<Trash2 className="size-3.5" strokeWidth={2.5} />}
            >
              {photo.phase === "deleting" ? t.deletingPhoto : t.deletePhoto}
            </Action>
          )}
        </div>
      )}

      {(photo.phase === "uploadFailed" || photo.phase === "deleteFailed") && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-pink">
          <TriangleAlert className="size-3.5 shrink-0" strokeWidth={2.5} />
          {photo.phase === "uploadFailed" ? t.photoFailed : t.deleteFailed}
        </p>
      )}
    </div>
  );
}

/** The small pill both rows are built from, so a quiet action and a destructive
 *  one differ only in tone rather than in two hand-written class strings. */
function Action({
  onClick,
  disabled,
  tone,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  tone: "quiet" | "danger";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition disabled:opacity-40",
        tone === "danger"
          ? "border-pink/30 bg-pink/8 text-pink hover:bg-pink/15"
          : "border-purple/20 bg-purple/8 text-purple hover:bg-purple/15"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

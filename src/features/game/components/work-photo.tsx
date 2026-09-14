import { useEffect, useState } from "react";
import { ImageOff, Lock } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { workPhotoUrl } from "@/lib/competition-photos";
import { gameCopy } from "../copy";

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "none" };

/**
 * One student's photographed working, fetched through a short-lived signed URL.
 *
 * IT RENDERS NOTHING AT ALL WHEN SUPABASE IS UNCONFIGURED, the same escape
 * open-competitions.tsx takes. A fresh clone and the blanked-env screenshot
 * harness are supported states, and a panel apologising for a server the app was
 * built to run without would be an error message about working as designed.
 *
 * THE IMAGE IS WRAPPED IN A PLAIN LINK, AND THAT IS THE WHOLE ZOOM FEATURE.
 * Handwritten working is fine detail — an exponent is a few pixels — so being
 * able to enlarge it is not optional. Opening the file in the browser's own
 * viewer hands over pinch-zoom, rotate and save for nothing, where a lightbox
 * would be a focus trap, a scroll lock and a gesture handler to get wrong. Same
 * reasoning as every other "the platform already does this" call in this repo.
 *
 * `locked` is the RECIPROCITY GATE and is deliberately enforced here rather than
 * in the storage policy: you see a classmate's working once you have shown
 * yours. It is a nudge toward the exchange the feature exists for, not a
 * security boundary — see 20260914000001 for why putting it in SQL would punish
 * someone whose upload failed on a bad connection.
 */
export function WorkPhoto({
  competitionId,
  userId,
  title,
  locked = false,
  hidden = false,
  localUrl,
}: {
  competitionId: string;
  /** Whose working to show. The file is named after them — see
   *  lib/competition-photos.ts. */
  userId: string;
  title: string;
  /** Show the "show yours first" panel instead of fetching anything. */
  locked?: boolean;
  /**
   * Treat it as absent whatever was fetched.
   *
   * This is what a DELETE needs: the signed URL fetched a moment ago still
   * resolves for its lifetime, so without an explicit override the panel would
   * go on showing a photo the student has just taken back — the one moment where
   * trusting the cached answer would be a broken promise rather than a stale
   * pixel. See MyWorkPhoto.
   */
  hidden?: boolean;
  /**
   * An object URL for a photo taken in THIS session, used instead of asking the
   * server for one. It is the same bytes that were just uploaded, and on
   * Cambodian mobile data re-downloading a file the phone is still holding is a
   * cost with nothing bought by it.
   */
  localUrl?: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (locked || hidden || localUrl || !isSupabaseConfigured || !userId) return;
    let cancelled = false;
    workPhotoUrl(competitionId, userId).then((res) => {
      // Every setState sits in the async callback, never synchronously in the
      // effect body — oxlint's react(set-state-in-effect) rule. The opening
      // "loading" comes from the initial value above.
      if (cancelled) return;
      if (!res.ok || !res.data) return setState({ kind: "none" });
      setState({ kind: "ready", url: res.data });
    });
    return () => {
      cancelled = true;
    };
  }, [competitionId, userId, locked, hidden, localUrl]);

  if (!isSupabaseConfigured) return null;

  // Derived during render rather than pushed into state, so a photo taken in
  // this session shows the instant it is handed down — and so a deleted one
  // stops showing the same instant, without waiting for a fetch to disagree.
  const shown: State = hidden
    ? { kind: "none" }
    : localUrl
      ? { kind: "ready", url: localUrl }
      : locked
        ? { kind: "none" }
        : state;

  return (
    <div>
      <div className="font-heading mb-2 text-sm font-extrabold">{title}</div>
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-surface shadow-panel-sm">
        {locked ? (
          <Note icon={<Lock className="size-4 shrink-0" strokeWidth={2.5} />}>
            {t.photoLocked}
          </Note>
        ) : shown.kind === "loading" ? (
          <Note>{t.loadingPhoto}</Note>
        ) : shown.kind === "none" ? (
          <Note
            icon={<ImageOff className="size-4 shrink-0" strokeWidth={2.5} />}
          >
            {t.noPhotoYet}
          </Note>
        ) : (
          <a href={shown.url} target="_blank" rel="noreferrer" className="block">
            <img
              src={shown.url}
              alt={title}
              // The intrinsic size is unknown until it decodes, so the box is
              // capped rather than reserved — a tall page of working would
              // otherwise fill the screen and bury the answers under it.
              className="max-h-96 w-full bg-control object-contain"
              loading="lazy"
            />
          </a>
        )}
      </div>
    </div>
  );
}

/** A quiet inline line inside the card's own space — no skeleton bars. A grey
 *  rectangle pretending to be a photo is a bigger lie than one muted sentence,
 *  which is the call open-competitions.tsx already made for its list. */
function Note({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-8 text-center text-xs font-bold text-muted">
      {icon}
      {children}
    </div>
  );
}

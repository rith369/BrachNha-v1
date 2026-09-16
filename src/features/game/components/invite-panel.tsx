import { lazy, Suspense, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { competitionInviteUrl } from "../invite";
import { gameCopy } from "../copy";

/**
 * React.lazy, so `uqr` downloads on the tap that opens this panel and never as
 * part of first paint — see the header of invite-qr.tsx. The import specifier
 * has to stay literal for the bundler to see it.
 */
const InviteQr = lazy(() =>
  import("./invite-qr").then((m) => ({ default: m.InviteQr }))
);

/**
 * "Show this to your friend, or send them the link."
 *
 * AN INLINE PANEL, NOT A DIALOG. `ui/sheet.tsx` portals to `document.body` with
 * fixed positioning and would escape the shell's frame — the same reason
 * ChatOverlay and FlashcardForm both avoid it. This just expands where it sits.
 *
 * THE URL IS ALWAYS VISIBLE, not tucked behind the buttons, and that is the
 * fallback rather than a decoration: both APIs below need a secure context and
 * neither exists everywhere, so a student whose browser has neither can still
 * select the text and copy it by hand. A panel whose only two controls might
 * both be missing needs something underneath them that cannot be.
 */
export function InvitePanel({
  competitionId,
  className,
}: {
  competitionId: string;
  /**
   * Overrides the panel's own card chrome.
   *
   * It exists because this renders in two places that frame it differently: on
   * its own in the middle of the posted screen, where it needs a card, and
   * nested inside a My Competitions row that already IS one — where keeping the
   * border and shadow would draw a card inside a card. `cn()` is twMerge, so a
   * caller passing `border-0 bg-transparent p-0 shadow-none` wins over the
   * defaults rather than fighting them. Same override-by-className shape
   * SubjectArt already uses.
   */
  className?: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  // Read at render rather than in a module constant: `location.origin` is
  // stable for the life of the page but is a browser global, and keeping the
  // reach for it at the edge is what lets invite.ts stay pure and testable.
  const url = competitionInviteUrl(window.location.origin, competitionId);

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Derived during render, never pushed into state — the answer cannot change
  // while the panel is open, and an effect would be a cascading render for a
  // value that was already knowable.
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFailed(false);
      setCopied(true);
      // No timer to clear it back. The panel is short-lived and the tick is a
      // receipt for something that genuinely stayed done; flipping the label
      // back after two seconds would suggest it had come undone.
    } catch {
      // Denied permission, or an insecure context. The URL above is still
      // selectable, which is exactly what the message points at.
      setCopied(false);
      setCopyFailed(true);
    }
  }

  async function share() {
    try {
      await navigator.share({ title: t.title, text: t.inviteBlurb, url });
    } catch {
      // A CANCELLED SHARE IS NOT A FAILURE. Dismissing the sheet rejects with
      // AbortError, which is indistinguishable here from a real error and is
      // overwhelmingly the common case — a student changing their mind must
      // never be told something went wrong. Nothing is reported either way:
      // a genuine failure leaves the link and the copy button right there.
    }
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-xs rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm",
        className
      )}
    >
      <p className="mb-3 text-xs font-bold text-muted">{t.qrHint}</p>

      {/* fallback={null} rather than a spinner, matching how ShellLayout mounts
          its routes: the chunk is small and a placeholder that flashes for one
          frame reads worse than the code simply appearing. The box below keeps
          its height either way, so nothing jumps. */}
      <Suspense fallback={<div className="aspect-square w-full" />}>
        <InviteQr url={url} />
      </Suspense>

      {/* `break-all`, not truncate: a link that is cut off cannot be read out
          or copied by hand, which is the one job this element has when the two
          buttons below are unavailable. */}
      <div className="mt-3 rounded-xl bg-control px-2.5 py-2 text-[10px] font-bold break-all text-muted select-all">
        {url}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition",
            copied
              ? "border-mint/40 bg-mint/10 text-mint"
              : "border-purple/20 bg-purple/8 text-purple hover:bg-purple/15"
          )}
        >
          {copied ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <Copy className="size-3.5" strokeWidth={2.5} />
          )}
          {copied ? t.copied : t.copyLink}
        </button>

        {/* ABSENT, never disabled, where the browser has no share sheet — a
            control that answers a tap with silence reads as broken, the rule
            sidebar-nav.tsx's href:null rows and the survey's StudiedStep set. */}
        {canShare && (
          <button
            type="button"
            onClick={() => void share()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-[11px] font-extrabold text-white shadow-cta transition"
          >
            <Share2 className="size-3.5" strokeWidth={2.5} />
            {t.shareLink}
          </button>
        )}
      </div>

      {copyFailed && (
        <p className="mt-2 text-[10px] font-bold text-muted">{t.copyFailed}</p>
      )}
    </div>
  );
}

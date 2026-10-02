import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { cn } from "@/utils/cn";
import {
  externalUrl,
  isAndroid,
  isIOS,
  openInExternalBrowser,
} from "@/utils/in-app-browser";

/**
 * What GoogleButton renders instead of Google when BrachNha was opened inside
 * another app's browser (Telegram, Messenger, Facebook…). See
 * utils/in-app-browser.ts for how that is decided.
 *
 * Google sign-in does not work there: the webview has its own cookie jar, so
 * Google shows a bare password form instead of the account chooser, or refuses
 * the embedded user agent outright. So at the moment a student asks to sign in,
 * this asks them to reopen the app in their real browser instead.
 *
 * It used to be a whole screen standing in for the entry screen, which blocked
 * the app entirely. There is no entry screen any more (every signed-out student
 * is a guest), so a Telegram visitor now uses the app as a guest like anyone
 * else and only meets this where sign-in is offered.
 *
 * ── The instructions are the real fallback ────────────────────────────────
 *
 * No page can force an external browser to open. The button makes the correct
 * platform request and that request can be silently refused, so the manual
 * instructions appear from a TIMER rather than from a result the page never
 * receives. On Android a successful intent opens the browser on top and leaves
 * this page mounted underneath, so "still here" is not proof of failure either
 * way; the delay only keeps the instructions from flashing up in the same frame
 * as the tap, which would read as the button having failed instantly.
 */
export function OpenInBrowser({
  variant = "primary",
  className,
}: {
  variant?: "primary" | "outline";
  className?: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  // Resolved once, so the address shown is the one handed over.
  const [url] = useState(externalUrl);
  const [refused, setRefused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const open = () => {
    openInExternalBrowser(url);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRefused(true), 1500);
  };

  const help = isIOS()
    ? t.inAppHelpIOS
    : isAndroid()
      ? t.inAppHelpAndroid
      : t.inAppHelpGeneric;

  return (
    <div className={cn("text-left", className)}>
      <p className="mb-2 text-center text-xs font-bold text-muted">
        {t.inAppTagline}
      </p>
      <button
        onClick={open}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold transition active:scale-[0.98]",
          variant === "primary"
            ? "bg-brand text-white shadow-cta"
            : "border border-border bg-surface text-text"
        )}
      >
        <ExternalLink className="size-4" strokeWidth={2.5} />
        {t.openInBrowser}
      </button>

      {refused && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-extrabold text-text">{t.inAppStillHere}</p>
          <p className="mt-1 text-xs font-bold text-muted">{help}</p>
          <p className="mt-3 text-xs font-bold text-muted">{t.inAppCopyLink}</p>
          {/* select-all and break-all, never truncated: this box is what a
              student copies by hand when both the intent and the host app's
              own menu have let them down. [font-family:…,sans-serif] rather
              than `font-body`, which has no generic fallback and renders in
              SERIF before Nunito lands. */}
          <p className="mt-1 select-all rounded-xl bg-control px-3 py-2 text-xs font-bold break-all text-text [font-family:var(--font-body),sans-serif]">
            {url}
          </p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { Wordmark } from "@/components/shell/wordmark";
import { Flag } from "@/components/ui/flag";
import { ExternalLink } from "lucide-react";
import {
  externalUrl,
  isAndroid,
  isIOS,
  openInExternalBrowser,
} from "@/utils/in-app-browser";

/**
 * Shown in place of the entry screen when BrachNha was opened inside another
 * app's browser — Telegram, Messenger, Facebook, Instagram and the rest. See
 * utils/in-app-browser.ts for how that is decided and why it matters.
 *
 * ── ONE BUTTON, and the rest is not a control ─────────────────────────────
 *
 * There is deliberately no "continue here", no guest option and no Google
 * button on this screen. Every one of those leads back into the webview, which
 * is the thing that does not work: Google either shows a bare password form
 * instead of the account chooser, or refuses the embedded user agent outright.
 * Offering a way through would mean offering the broken path.
 *
 * The consequence, stated so it is not mistaken for an oversight: a first-time
 * visitor arriving from Telegram cannot reach guest mode either, because guest
 * mode is chosen on the entry screen this one replaces. Guest mode itself is
 * untouched and works normally the moment they are in a real browser — and
 * localStorage is per-browser, so nothing they had is lost or duplicated.
 *
 * ── The instructions are the real fallback ────────────────────────────────
 *
 * No page can force an external browser to open. The button makes the correct
 * platform request and that request can be silently refused, so the manual
 * instructions appear a moment later rather than being hidden behind a result
 * the page never receives. They are TEXT, not a second control — the link sits
 * in a select-all box, the same shape features/game's invite panel uses for a
 * URL that has to survive both APIs being unavailable.
 *
 * Reuses entry-view.tsx's frame, Wordmark and language toggle on purpose: this
 * is the screen standing in for that one, and the two should read as one app.
 */
export function InAppBrowserView() {
  const { lang, setLang } = useBrachNhaStore(
    useShallow((s) => ({ lang: s.lang, setLang: s.setLang }))
  );
  const t = useT(lang);

  // Resolved once, on the tap, so the address shown is the one handed over.
  const [url] = useState(externalUrl);
  const [refused, setRefused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  // The instructions are revealed from a TIMER, not from a result. On Android a
  // successful intent opens the browser on top and leaves this page mounted
  // underneath, so "still here" is not proof of failure either way — the delay
  // only keeps the instructions from flashing up in the same frame as the tap,
  // which would read as the button having failed instantly.
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
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-4 pt-8 pb-6">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark
          subtitle={
            <div className="text-xs font-bold text-muted">Bac II Quest</div>
          }
        />
        {/* The one other affordance on the screen, and it is the same toggle
            the entry screen carries — a student who cannot read the English
            instruction has to be able to switch before following it. */}
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-border bg-purple/8 px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          <Flag code={lang === "en" ? "kh" : "gb"} className="size-3.5" />
          {lang === "en" ? "ខ្មែរ" : "EN"}
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          {/* Lucide, not an emoji — the app-wide rule, and the glyph has to
              read the same on every handset this screen exists to rescue. */}
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-purple/8 text-purple">
            <ExternalLink className="size-8" strokeWidth={2.5} />
          </div>
          <div className="mb-2 font-heading text-xl font-extrabold">
            {t.appName}
          </div>
          <p className="mx-auto max-w-xs text-sm font-bold text-muted">
            {t.inAppTagline}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel">
          <button
            onClick={open}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta transition active:scale-[0.98]"
          >
            <ExternalLink className="size-4" strokeWidth={2.5} />
            {t.openInBrowser}
          </button>

          {refused && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-extrabold text-text">
                {t.inAppStillHere}
              </p>
              <p className="mt-1 text-xs font-bold text-muted">{help}</p>
              <p className="mt-3 text-xs font-bold text-muted">
                {t.inAppCopyLink}
              </p>
              {/* select-all and break-all, never truncated: this box is what a
                  student reads out or copies by hand when both the intent and
                  the host app's own menu have let them down, and a link cut
                  off in the middle cannot be either. */}
              {/* [font-family:…,sans-serif] rather than the `font-body`
                  utility: --font-body carries no generic fallback of its own
                  (body adds one in globals.css), so before Nunito lands on a
                  slow connection that utility renders in the browser's default
                  SERIF — and this is the one line on the screen someone may
                  have to copy by hand. */}
              <p className="mt-1 select-all rounded-xl bg-control px-3 py-2 text-xs font-bold break-all text-text [font-family:var(--font-body),sans-serif]">
                {url}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { getInstallState, promptInstall, subscribeInstall } from "@/lib/install-prompt";
import {
  externalUrl,
  isAndroid,
  isIOS,
  isInAppBrowser,
  openInExternalBrowser,
} from "@/utils/in-app-browser";
import { INSTALL_COPY } from "../copy";
import { IosSteps } from "./ios-steps";

/** Same wait as OpenInBrowser before saying the host app ignored the request. */
const REFUSED_AFTER_MS = 1500;

/**
 * "Install BrachNha" on Profile, so a student can install whenever they want
 * rather than only when the pop-up (install-prompt.tsx) happens to appear.
 * Asked for by the user, 6 Nov 2026. Reads the same module as the pop-up
 * (lib/install-prompt.ts), so the two always agree on whether installing is
 * possible, and installing here also ends the pop-up.
 *
 * Three cases, and nothing at all otherwise:
 *  - Android/desktop Chromium holding the install event: Install opens the
 *    browser's real dialog.
 *  - iPhone: Safari gives a page no dialog, so Install shows the two manual
 *    steps inside the card.
 *  - Telegram, Messenger and other in-app browsers cannot install, so the card
 *    asks for Chrome or Safari, the same request sign-in makes
 *    (features/auth/components/open-in-browser.tsx), and shows the manual way
 *    if the host app ignores it. The address keeps /profile, so the real
 *    browser opens right on this card.
 *
 * Hidden when the app is installed already or the browser cannot install at
 * all (Firefox, say): a button that does nothing must not look tappable.
 */
export function InstallCard() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = INSTALL_COPY[lang];
  const t = useT(lang);
  const { mode } = useSyncExternalStore(subscribeInstall, getInstallState);
  // Read once: which browser this is does not change while the page is open.
  const [inApp] = useState(isInAppBrowser);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [refused, setRefused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  if (!mode && !inApp) return null;

  const openBrowser = () => {
    openInExternalBrowser(externalUrl());
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRefused(true), REFUSED_AFTER_MS);
  };

  const help = isIOS() ? t.inAppHelpIOS : isAndroid() ? t.inAppHelpAndroid : t.inAppHelpGeneric;
  const button =
    "shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-extrabold text-white shadow-cta active:scale-[0.98]";

  return (
    <Card className="mb-4 gap-3" data-testid="install-card">
      <div className="flex items-center gap-3">
        {/* The real home-screen icon, white in both themes like the logo. */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-[22%] border border-border bg-white"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold">{c.cardTitle}</div>
          <div className="text-xs font-bold text-muted">
            {inApp ? c.cardInAppBody : c.cardBody}
          </div>
        </div>
        {mode === "prompt" && (
          <button type="button" onClick={() => void promptInstall()} className={button}>
            {c.install}
          </button>
        )}
        {mode === "ios" && (
          <button
            type="button"
            aria-expanded={stepsOpen}
            onClick={() => setStepsOpen((open) => !open)}
            className={button}
          >
            {c.install}
          </button>
        )}
      </div>

      {mode === "ios" && stepsOpen && <IosSteps />}

      {inApp && (
        <>
          <button
            type="button"
            onClick={openBrowser}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-cta active:scale-[0.98]"
          >
            <ExternalLink className="size-4" strokeWidth={2.5} />
            {t.openInBrowser}
          </button>
          {refused && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-extrabold text-text">{t.inAppStillHere}</p>
              <p className="mt-1 text-xs font-bold text-muted">{help}</p>
              <p className="mt-3 text-xs font-bold text-muted">{t.inAppCopyLink}</p>
              <p className="mt-1 select-all rounded-xl bg-control px-3 py-2 text-xs font-bold break-all text-text [font-family:var(--font-body),sans-serif]">
                {externalUrl()}
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

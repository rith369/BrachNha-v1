import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Share, SquarePlus } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import {
  dismissInstall,
  getInstallState,
  promptInstall,
  subscribeInstall,
  type InstallMode,
  type InstallReason,
} from "@/lib/install-prompt";
import { INSTALL_COPY } from "../copy";

/** Lets the first screen paint and settle before anything covers it. */
const OPEN_DELAY_MS = 1500;

/**
 * The "add to home screen" pop-up. AppShell mounts it in the ordinary-app
 * branch only, so the entry, login and survey screens never get it, and passes
 * `suppressed` whenever something else owns the screen: a lesson or exam in
 * progress (hideChrome), the mentor, the pledge, or the login prompt. A
 * suppressed pop-up is not lost, only held — the lesson one in particular
 * waits for the student to leave the completion screen, which is focus mode.
 *
 * When and how often it may appear is decided in lib/install-prompt.ts; this
 * file only renders. Same absolute-inset overlay shape as AuthPromptOverlay,
 * and for the same reason not ui/sheet (which portals out of the app frame).
 */
export function InstallPrompt({ suppressed }: { suppressed: boolean }) {
  const { mode, openAvailable, lessonPending } = useSyncExternalStore(
    subscribeInstall,
    getInstallState
  );
  const [openReady, setOpenReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpenReady(true), OPEN_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // The lesson pop-up outranks the opening one: it is the better moment, and
  // closing either consumes the other for this page load.
  const reason: InstallReason | null =
    !mode || suppressed
      ? null
      : lessonPending
        ? "lesson"
        : openReady && openAvailable
          ? "open"
          : null;

  if (!mode || !reason) return null;
  return <InstallDialog mode={mode} reason={reason} />;
}

function InstallDialog({
  mode,
  reason,
}: {
  mode: InstallMode;
  reason: InstallReason;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = INSTALL_COPY[lang];

  const close = () => dismissInstall(reason);
  const install = async () => {
    await promptInstall();
    dismissInstall(reason);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] p-4 sm:items-center sm:p-6"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={c.dialogLabel}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-surface p-6 text-center shadow-panel"
      >
        {/* The real home-screen icon, so the student sees exactly what will
            land on their phone. White in both themes, like the logo. */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={64}
          height={64}
          className="mx-auto mb-4 size-16 rounded-[22%] bg-white shadow-panel-sm"
        />

        <h2 className="mb-2 font-heading text-lg font-extrabold text-text">
          {reason === "lesson" ? c.lessonTitle : c.openTitle}
        </h2>
        <p className="mb-5 text-sm font-bold text-muted">
          {reason === "lesson" ? c.lessonBody : c.openBody}
        </p>

        {mode === "ios" ? (
          <>
            <ol className="mb-5 space-y-2 text-left">
              <li className="flex items-center gap-3 rounded-2xl bg-control p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/10">
                  <Share className="size-5 text-blue" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-bold text-text">
                  {c.iosStep1}
                  <span className="block text-xs font-semibold text-muted">
                    {c.iosStep1Hint}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-control p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple/10">
                  <SquarePlus className="size-5 text-purple" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-bold text-text">{c.iosStep2}</span>
              </li>
            </ol>
            <button
              onClick={close}
              className="w-full rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-cta active:scale-[0.98]"
            >
              {c.gotIt}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={install}
              className="w-full rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-cta active:scale-[0.98]"
            >
              {c.install}
            </button>
            <button
              onClick={close}
              className="mt-2 w-full py-2 text-xs font-extrabold text-muted active:scale-[0.98]"
            >
              {c.notNow}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

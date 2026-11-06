import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageSquareText, Send } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useFabPlacement } from "@/hooks/use-fab-placement";
import { cn } from "@/utils/cn";

/**
 * The corner button while KruAI is switched off (src/data/kruai-switch.ts):
 * Feedback, so a student can tell the team what is wrong, in a Telegram chat.
 * The user's choices, 6 Nov 2026: a link rather than a form in the app, for
 * guests and signed-in students alike, and a short explanation FIRST, with the
 * Open Telegram button inside it, every time. Nothing is collected by the app;
 * the student writes to the team in their own Telegram.
 *
 * Same place, size and colour as the KruAI button (useFabPlacement), and hidden
 * by the shell in the same places: exams and the other assessments. The pop-up
 * is the same absolute-inset shape as the install pop-up, inside the app frame.
 *
 * A username link, never a phone number, so no number appears in the app or
 * the repo. Inside Telegram's own browser a t.me link opens the chat directly;
 * elsewhere it opens the Telegram app, or Telegram's web page without it.
 */
const FEEDBACK_TELEGRAM_URL = "https://t.me/Captain_Alexandros";
const FEEDBACK_TELEGRAM_NAME = "@Captain_Alexandros";

const COPY = {
  en: {
    fab: "Send feedback",
    title: "Tell us what's wrong",
    body: "Found a problem, or have an idea? Send us a message on Telegram. Say which page you were on and what happened. A screenshot helps a lot.",
    open: "Open Telegram",
    notNow: "Not now",
  },
  km: {
    fab: "ផ្ញើមតិយោបល់",
    title: "ប្រាប់យើងពីបញ្ហា",
    body: "ឃើញបញ្ហា ឬមានគំនិតល្អ? សូមផ្ញើសារមកយើងតាម Telegram។ ប្រាប់យើងថាអ្នកនៅទំព័រណា និងមានអ្វីកើតឡើង។ រូបថតអេក្រង់ជួយបានច្រើន។",
    open: "បើក Telegram",
    notNow: "ពេលក្រោយ",
  },
} as const;

export function FeedbackFab() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = COPY[lang];
  const btnRef = useRef<HTMLButtonElement>(null);
  const { offset, obscuring } = useFabPlacement(btnRef);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={c.fab}
        aria-haspopup="dialog"
        title={c.fab}
        data-testid="feedback-fab"
        className={cn(
          "absolute right-4 z-40 flex size-13 items-center justify-center rounded-2xl border border-border bg-[var(--brand-purple)] shadow-cta-lg transition-opacity duration-150 lg:right-6",
          // Faded and click-through over another control, as the KruAI button is.
          obscuring && "pointer-events-none opacity-30",
          offset
        )}
      >
        <MessageSquareText className="size-6 text-white" strokeWidth={2.25} />
      </button>
      {open && <FeedbackDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = COPY[lang];
  const reduceMotion = useReducedMotion();
  const goRef = useRef<HTMLAnchorElement>(null);

  // The main action takes focus, and Escape closes, as in any dialog.
  useEffect(() => {
    goRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] p-4 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      data-testid="feedback-dialog"
    >
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 text-center shadow-panel"
      >
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-[var(--brand-purple)] shadow-panel-sm">
          <MessageSquareText className="size-7 text-white" strokeWidth={2.25} />
        </span>
        <h2 id="feedback-title" className="mb-2 font-heading text-lg font-extrabold text-text">
          {c.title}
        </h2>
        <p className="mb-3 text-sm font-bold text-muted">{c.body}</p>
        <p className="mb-5 text-xs font-extrabold text-purple-strong">
          Telegram: {FEEDBACK_TELEGRAM_NAME}
        </p>
        <a
          ref={goRef}
          href={FEEDBACK_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-cta active:scale-[0.98]"
        >
          <Send className="size-4" strokeWidth={2.5} />
          {c.open}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 text-xs font-extrabold text-muted active:scale-[0.98]"
        >
          {c.notNow}
        </button>
      </motion.div>
    </motion.div>
  );
}

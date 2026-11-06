import { useRef } from "react";
import { MessageSquareText } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useFabPlacement } from "@/hooks/use-fab-placement";
import { cn } from "@/utils/cn";

/**
 * The corner button while KruAI is switched off (src/data/kruai-switch.ts):
 * Feedback, which opens a Telegram chat with the team so a student can say what
 * is wrong. The user's choice, 6 Nov 2026: a link rather than a form in the app,
 * for guests and signed-in students alike. Nothing is collected by the app; the
 * student writes to the team in their own Telegram.
 *
 * Same place, size and colour as the KruAI button (useFabPlacement), and hidden
 * by the shell in the same places: exams and the other assessments.
 *
 * A username link, never a phone number, so no number appears in the app or
 * the repo. Inside Telegram's own browser a t.me link opens the chat directly;
 * elsewhere it opens the Telegram app, or Telegram's web page without it.
 */
const FEEDBACK_TELEGRAM_URL = "https://t.me/Captain_Alexandros";

const COPY = {
  en: "Send feedback on Telegram",
  km: "ផ្ញើមតិយោបល់តាម Telegram",
} as const;

export function FeedbackFab() {
  const lang = useBrachNhaStore((s) => s.lang);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const { offset, obscuring } = useFabPlacement(linkRef);

  return (
    <a
      ref={linkRef}
      href={FEEDBACK_TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={COPY[lang]}
      title={COPY[lang]}
      data-testid="feedback-fab"
      className={cn(
        "absolute right-4 z-40 flex size-13 items-center justify-center rounded-2xl border border-border bg-[var(--brand-purple)] shadow-cta-lg transition-opacity duration-150 lg:right-6",
        // Faded and click-through over another control, as the KruAI button is.
        obscuring && "pointer-events-none opacity-30",
        offset
      )}
    >
      <MessageSquareText className="size-6 text-white" strokeWidth={2.25} />
    </a>
  );
}

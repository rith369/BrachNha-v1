import { Hourglass } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { gameCopy, num } from "../copy";

/**
 * What the CREATOR sees the moment their own run ends.
 *
 * DELIBERATELY NO WIN OR LOSS. There is nobody to compare against yet — the
 * whole point of the design is that the creator posts a score and waits — so
 * anything resembling a verdict here would be invented. It states the score,
 * says the competition is now open, and stops.
 *
 * That is also why this is a separate component from ResultView rather than a
 * branch inside it: the two screens answer different questions, and one
 * component with an `opponent | null` prop would carry a "pretend there is no
 * opponent" path through every line of the comparison.
 *
 * It is a terminal screen, so the caller can render it with a plain early
 * return — see the note in competition-run.tsx about why that matters.
 */
export function PostedView({
  score,
  total,
  shared,
  onExit,
  onNext,
}: {
  score: number;
  total: number;
  /** Did it actually reach the server? A competition only other students can
   *  see is the whole point, so a failed publish must not be reported as
   *  "waiting for a friend to join" — nobody can join it. */
  shared: boolean;
  onExit: () => void;
  /** Go on to the review — photograph the working, then see the answers. Same
   *  optional shape as ResultView's, and for the same reason. */
  onNext?: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  return (
    <FocusLayout
      progressPct={100}
      onExit={onExit}
      footer={
        <FocusButton onClick={onNext ?? onExit}>
          {onNext ? t.seeAnswers : t.done}
        </FocusButton>
      }
    >
      <div className="text-center">
        <Hourglass
          className="mx-auto mb-3 size-14 text-purple md:mb-5 md:size-20"
          strokeWidth={2}
        />
        <div className="font-heading mb-2 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
          {t.posted}
        </div>

        <div className="mx-auto mb-4 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
          <div className="text-lg font-extrabold md:text-2xl">
            {num(score, lang)} / {num(total, lang)}
          </div>
          <div className="text-xs font-bold opacity-90">{t.yourScore}</div>
        </div>

        <p className="mx-auto max-w-xs text-sm font-bold text-muted">
          {shared ? t.postedBlurb : t.postedOffline}
        </p>
      </div>
    </FocusLayout>
  );
}

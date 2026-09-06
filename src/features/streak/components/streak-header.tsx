import { useBrachNhaStore } from "@/lib/store";
import { useStreakCopy } from "../copy";
import { useCountUp } from "../use-count-up";
import { CelebrationAnimation } from "./celebration-animation";
import { StreakFlame } from "./streak-flame";

/**
 * The hero: flame, the streak count, and one line saying what it is for.
 *
 * THE COUNT IS THE PAGE. Everything below explains or extends it, so it is the
 * only thing on the screen set at display size, and it takes the flame ramp
 * through `bg-clip-text` rather than sitting on a coloured panel. That is the
 * same treatment the wordmark and every page title already use, and it dodges
 * the contrast problem a warm fill would have created — see --brand-flame-* in
 * globals.css.
 *
 * The subtitle CHANGES on completion rather than a banner appearing beneath it.
 * The brief asks for "🔥 13 Day Streak! / You kept your streak alive!" as the
 * success message, and the headline already reads 13 by then — so the only new
 * words are the second line, and swapping the line already in that position
 * says it without pushing the whole page down mid-animation.
 *
 * `role="status"` on that line is what makes the celebration reach a screen
 * reader at all: the confetti is aria-hidden, the flame is decorative, and a
 * number changing silently in the DOM is not announced.
 */
export function StreakHeader({
  streak,
  celebrating,
  completed,
}: {
  streak: number;
  /** True for the length of the one-shot burst only. */
  celebrating: boolean;
  /** Stays true afterwards — the subtitle does not revert. */
  completed: boolean;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const shown = useCountUp(streak);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/10 bg-surface px-4 py-6 text-center shadow-panel md:py-8">
      <CelebrationAnimation active={celebrating} />

      {/* Above the flame so "Streak" is named before the number is read, and
          so the untranslated product term appears once at full size rather
          than being carried only by the smaller label below. */}
      <div className="text-[11px] font-extrabold tracking-[0.2em] text-muted uppercase">
        {c.kicker}
      </div>

      <StreakFlame celebrating={celebrating} className="mx-auto mt-3" />

      <div
        className={`font-heading bg-flame mt-4 bg-clip-text text-6xl leading-none font-extrabold text-transparent md:text-7xl ${
          celebrating ? "animate-streak-pop" : ""
        }`}
      >
        {shown}
      </div>

      <div className="font-heading mt-1.5 text-sm font-extrabold text-text md:text-base">
        {c.dayStreak}
      </div>

      <div
        role="status"
        className="mx-auto mt-2.5 max-w-xs text-xs font-bold text-muted md:text-sm"
      >
        {completed ? c.celebrated : c.subtitle}
      </div>
    </div>
  );
}

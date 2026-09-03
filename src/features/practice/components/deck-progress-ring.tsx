import { toKhmerDigits } from "@/utils/khmer-num";
import type { DeckProgress } from "../review";

const R = 40;
const CIRC = 2 * Math.PI * R;

/**
 * The deck's progress as a donut: a mint arc for ចងចាំ, a pink arc for
 * មិនទាន់ចងចាំ, and bare track for everything not yet answered, with the
 * remembered share as a percentage in the middle.
 *
 * SAME SVG RECIPE AS `features/progress/score-hero.tsx` — a `0 0 100 100`
 * viewBox rotated -90° so the arc starts at twelve o'clock, `strokeDasharray`
 * against the full circumference, and `var(--color-chart-track)` for the
 * groove. That token and the two accent strokes are the per-theme `--color-*`
 * scale rather than `--brand-*`: these are lines on a surface, not fills under
 * white text, and they are what makes the ring correct in dark mode with no
 * `dark:` override. CLAUDE.md's theming section lists hand-coded SVG donut
 * tracks as one of the things a class toggle cannot reach — this is now a
 * third, and it is tokenised for that reason.
 *
 * TWO ARCS ON ONE CIRCLE, the second offset by the length of the first. Caps
 * are deliberately BUTT rather than round: round caps overhang by half the
 * stroke width at each end, which turns the junction between two adjacent arcs
 * into an overlap and draws a visible dot for a segment of length zero. A
 * segment with no cards is not rendered at all for the same reason.
 *
 * THE PERCENTAGE IS THE REMEMBERED SHARE OF THE WHOLE DECK, not of the cards
 * answered so far. A student who has answered one card correctly out of twenty
 * has learned 5% of the lesson, not 100% of it, and the second reading would
 * congratulate them for work they have not done.
 */
export function DeckProgressRing({
  progress,
  label,
  legend = true,
}: {
  progress: DeckProgress;
  /** Optional heading above the ring — "វឌ្ឍនភាពរបស់អ្នក" at both call sites
   *  today, but passed in rather than hardcoded so a future caller measuring
   *  something else isn't forced to mislabel it. */
  label?: string;
  /** The two counts under the ring. OFF on the lesson's opening screen, where
   *  the three pile buttons sit directly beneath and already carry the same two
   *  numbers — printing them twice, a few pixels apart, reads as a mistake. ON
   *  for the summary, which has no piles and would otherwise leave the two arc
   *  colours unexplained. */
  legend?: boolean;
}) {
  const { remembered, notRemembered, total } = progress;
  const pct = total > 0 ? Math.round((remembered / total) * 100) : 0;
  const mintDash = total > 0 ? (remembered / total) * CIRC : 0;
  const pinkDash = total > 0 ? (notRemembered / total) * CIRC : 0;

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="mb-2 text-xs font-extrabold text-muted">{label}</div>
      )}

      <div className="relative size-28 md:size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--color-chart-track)"
            strokeWidth="10"
          />
          {remembered > 0 && (
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--color-mint)"
              strokeWidth="10"
              strokeDasharray={`${mintDash} ${CIRC}`}
            />
          )}
          {notRemembered > 0 && (
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--color-pink)"
              strokeWidth="10"
              strokeDasharray={`${pinkDash} ${CIRC}`}
              strokeDashoffset={-mintDash}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-heading text-2xl font-extrabold text-text">
            {toKhmerDigits(pct)}%
          </div>
          <div className="text-[10px] font-bold text-muted">ចងចាំ</div>
        </div>
      </div>

      {/* Reading of the two arcs. Without it the ring says how much is mint but
          not what mint MEANS, and these two labels are the whole vocabulary the
          review screen rates cards with. */}
      {legend && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <span className="size-2 rounded-full bg-mint" />
            ចងចាំ {toKhmerDigits(remembered)}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <span className="size-2 rounded-full bg-pink" />
            មិនទាន់ចងចាំ {toKhmerDigits(notRemembered)}
          </span>
        </div>
      )}
    </div>
  );
}

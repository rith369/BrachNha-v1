import { useBrachNhaStore } from "@/lib/store";
import { InfoTip } from "@/components/ui/info-tip";
import type { ProgressSummary } from "../summary";

const R = 40;
const CIRC = 2 * Math.PI * R;

/** An em dash, not "0%" — a zero here would claim exams were sat and failed. */
const NO_VALUE = "—";

export function ScoreHero({ summary }: { summary: ProgressSummary }) {
  // The only two numbers on this card that are not derived from the summary,
  // and the two that used to be invented. The global StatBar renders the same
  // `streak` about forty pixels above this card, so a second hardcoded copy was
  // guaranteed to contradict it — the bug /streak already hit once.
  const streak = useBrachNhaStore((s) => s.streak);

  const { pct, changePct, examCount } = summary.overall;

  // Computed from the null check rather than `?? 0` inside the arithmetic: a
  // NaN here renders as strokeDasharray="NaN 251" and the arc silently does not
  // draw at all, which looks like a styling bug rather than missing data.
  const dash = pct === null ? 0 : (pct / 100) * CIRC;

  // `> 0`, not `>= 0`: two months averaging the same is "no change", and an
  // up-arrow on it would be the same small lie the subject trend used to tell.
  const up = (changePct ?? 0) > 0;
  const flat = changePct === 0;

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
            Overall{" "}
            <span className="whitespace-nowrap">
              Readiness
              <InfoTip label="What is Overall Readiness?" className="ml-1.5 align-middle">
                Your average score on the mock exams you took this month — the
                វិញ្ញាសារបង្កើតថ្មី papers. Past papers don&apos;t count here. The
                line underneath compares it with last month: 70% → 76% shows as +6
                pts.
              </InfoTip>
            </span>
          </div>
          <div className="font-heading text-4xl font-bold">
            {pct ?? NO_VALUE}
            {/* The % is part of the NUMBER, so it goes when the number does —
                "—%" reads as a percentage that failed to load rather than as a
                figure the app does not have yet. */}
            {pct !== null && <span className="text-lg text-muted">%</span>}
          </div>
          <div className="mt-0.5 text-xs font-bold text-muted">
            {examCount > 0
              ? "Average exam score this month"
              : "No mock exams yet"}
          </div>
          {/* Absent rather than "+0%" when there is nothing to compare against,
              and coloured from its own sign — this line was hardcoded mint,
              which would have turned a real drop green. */}
          {changePct !== null && (
            <div
              className={`mt-1 text-xs font-extrabold ${
                flat ? "text-muted" : up ? "text-mint" : "text-pink"
              }`}
            >
              {/* POINTS, not percent: this is the difference between two
                  percentages, so 60 -> 75 is fifteen points. "+15%" would be a
                  different and wrong number. */}
              {flat
                ? "No change vs last month"
                : `${up ? "▲ +" : "▼ "}${changePct} pts vs last month`}
            </div>
          )}
        </div>

        <div className="relative size-25 shrink-0">
          <svg viewBox="0 0 100 100" width="100" height="100" className="-rotate-90">
            <defs>
              <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-pink)" />
                <stop offset="50%" stopColor="var(--color-purple)" />
                <stop offset="100%" stopColor="var(--color-blue)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--color-chart-track)"
              strokeWidth="10"
            />
            {/* Not rendered at all with no exams: a zero-length arc with a round
                cap still paints a dot at twelve o'clock, which reads as 1%. */}
            {dash > 0 && (
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="url(#donutGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRC}`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-heading text-lg font-bold">
              {pct === null ? NO_VALUE : `${pct}%`}
            </div>
            <div className="text-[9px] font-bold text-muted">ready</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-purple/8 pt-3.5">
        <Metric
          value={String(summary.questionsThisMonth)}
          label="Questions"
          color="text-pink"
          hint="Quiz and exam questions you answered this month. Flashcards aren't counted."
        />
        {/* ACTIVE study minutes — see hooks/use-study-timer.ts for what counts —
            rendered in HOURS, because this figure is a month's total. The
            weekly chart below deliberately shows the same measurement in
            MINUTES, since one day at this app's scale does not fill an hour.
            Same number, two windows, two units. */}
        <Metric
          value={formatStudyTime(summary.minutesThisMonth)}
          label="Study Time"
          color="text-blue"
          hint="Time spent actively studying this month: lessons, sections, flashcards, quizzes and exams. It pauses after 2 minutes without a tap or scroll, and while you're out of the app. Chatting with KruAI isn't counted."
        />
        <Metric
          value={`${streak}🔥`}
          label="Day Streak"
          color="text-mint"
          hint="Days in a row you finished all 3 daily tasks: a lesson, practice and flashcards. Today is added once all 3 are done."
        />
        {/* THIS MONTH's XP, not the lifetime total. Lifetime would restate the
            number the global StatBar already shows a few pixels above, which is
            exactly the "could not tell which were real" confusion this page's
            Preview tag was added for. */}
        <Metric
          value={summary.xpThisMonth.toLocaleString("en-GB")}
          label="XP This Month"
          color="text-yellow"
          hint="XP you've earned since the 1st of this month. Your all-time total is in the bar at the top of the screen."
        />
      </div>
    </div>
  );
}

/**
 * "0h" / "0.3h" / "20.7h" — ALWAYS hours, at the user's call.
 *
 * This tile is a MONTH's total, which is the window where hours is the right
 * unit: "1,240m" is a worse answer than "20.7h" for a student who has been
 * studying all month. The per-day chart went the other way for the mirror-image
 * reason — see WeekDay.minutes in ../summary.ts.
 *
 * THE 0.1 FLOOR IS THE LOAD-BEARING PART. A month holding one or two real
 * minutes rounds to 0.0 and renders "0h", which is precisely the "I did biology
 * and it still says nothing" report that started this. A tenth is the smallest
 * thing this format can express, so it is what real work floors at — the figure
 * is allowed to overstate a first session by a rounding, but it may never tell a
 * student who studied that they did not.
 *
 * Exactly zero still prints "0h", and that is honest rather than absent: unlike
 * a percentage, "you have not studied yet this month" is a true and useful thing
 * to say, where "0%" would be a claim about work that was never attempted.
 */
function formatStudyTime(minutes: number): string {
  if (minutes <= 0) return "0h";
  return `${Math.max(Math.round((minutes / 60) * 10) / 10, 0.1)}h`;
}

/**
 * One stat tile. The WHOLE TILE is the hover and tap target for its
 * explanation, not a separate ⓘ: four icons crammed into a four-column strip at
 * the 320px floor would each be a hard-to-hit speck, and a ~70px tile is an easy
 * one. Deliberately unmarked — a dotted underline under each label was tried and
 * removed as ugly; see components/ui/info-tip.tsx.
 */
function Metric({
  value,
  label,
  color,
  hint,
}: {
  value: string;
  label: string;
  color: string;
  hint: string;
}) {
  return (
    <InfoTip
      className="flex w-full"
      triggerClassName="flex w-full flex-col items-center py-0.5"
      trigger={
        <>
          <span className={`font-heading text-base font-extrabold ${color}`}>
            {value}
          </span>
          <span className="text-[9px] font-bold text-muted">
            {label}
          </span>
        </>
      }
    >
      {hint}
    </InfoTip>
  );
}

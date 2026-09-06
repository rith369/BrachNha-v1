import { BookOpen, Check, Flame, Layers, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import {
  dailyTaskLabel,
  tasksCompletedLabel,
  tasksLeftLabel,
  useStreakCopy,
} from "../copy";
import type { DailyTaskId, DemoDailyTask } from "../demo-data";

const R = 40;
const CIRC = 2 * Math.PI * R;

/**
 * One icon per task, matching what each already uses elsewhere in the app —
 * BookOpen is the Lessons nav item and Layers is Flashcards/Quiz, both from
 * lib/nav-items.ts. Reusing them is what makes these three rows read as the
 * app's real daily tasks rather than three invented ones.
 */
const TASK_ICON: Record<DailyTaskId, LucideIcon> = {
  lesson: BookOpen,
  practice: PenLine,
  flashcards: Layers,
};

/**
 * Today's goal: a ring, the three tasks behind it, and the one button on the
 * page that does anything.
 *
 * THE RING USES THE SAME SVG RECIPE as features/progress/score-hero.tsx and
 * features/practice/deck-progress-ring.tsx — a `0 0 100 100` viewBox rotated
 * -90° so the arc starts at twelve o'clock, `strokeDasharray` against the
 * circumference, `var(--color-chart-track)` for the groove. Those tokens are
 * the per-theme `--color-*` scale rather than `--brand-*` because an arc is a
 * line on a surface, not a fill under white text; that is what makes it correct
 * in dark mode with no `dark:` override.
 *
 * The arc is `--brand-flame-to` rather than the flame gradient: an SVG stroke
 * cannot take a CSS gradient without its own `<linearGradient>` and a second id
 * to keep unique on a page that may render more than one ring. A single warm
 * stroke reads as the same family at this size.
 *
 * THE BUTTON KEEPS `bg-brand`, NOT `bg-flame`. Its label is normal-size white
 * text, which needs 4.5:1 — the flame ramp is 4.2:1 at the orange end and would
 * miss it. bg-brand is the app's established CTA and clears it at both ends.
 */
export function DailyGoalCard({
  tasks,
  onComplete,
}: {
  tasks: readonly DemoDailyTask[];
  /** Simulates finishing the day. No-op once every task is done. */
  onComplete: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const complete = done === total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const dash = (pct / 100) * CIRC;

  return (
    <Card className="gap-4">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--color-chart-track)"
              strokeWidth="12"
            />
            {done > 0 && (
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="var(--brand-flame-to)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRC}`}
                // The only animated property here, and it is on an element that
                // is not composited anyway — a 300ms arc sweep on one ring is
                // the reward for finishing, not a per-frame cost like the
                // Recharts mount animations that were turned off.
                className="transition-[stroke-dasharray] duration-500 ease-out"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-heading text-base font-extrabold text-text">
              {pct}%
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-heading text-sm font-extrabold md:text-base">
            {c.todaysGoal}
          </div>
          <div className="mt-0.5 text-xs font-bold text-muted">
            {tasksCompletedLabel(done, total, lang)}
          </div>
          <div
            className={cn(
              "mt-1.5 flex items-center gap-1.5 text-xs font-extrabold",
              complete ? "text-mint" : "text-muted"
            )}
          >
            {complete && (
              <Flame className="size-3.5 shrink-0" fill="currentColor" strokeWidth={1.5} aria-hidden />
            )}
            <span>
              {complete
                ? c.streakMaintained
                : tasksLeftLabel(total - done, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* The three tasks themselves. Rows, not controls: the single button
          below is what completes the day, and three separately tappable rows
          would imply per-task completion this prototype does not simulate. */}
      <ul className="flex flex-col gap-1.5">
        {tasks.map((task) => {
          const Icon = TASK_ICON[task.id];
          return (
            <li
              key={task.id}
              className="flex items-center gap-2.5 rounded-xl bg-control px-3 py-2"
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  task.done ? "text-mint" : "text-muted"
                )}
                strokeWidth={2.25}
                aria-hidden
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs font-bold",
                  task.done ? "text-muted line-through" : "text-text"
                )}
              >
                {dailyTaskLabel(task.id, lang)}
              </span>
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full",
                  task.done
                    ? "bg-mint text-white"
                    : "border-2 border-dashed border-border"
                )}
              >
                {task.done && <Check className="size-2.5" strokeWidth={4} aria-hidden />}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onComplete}
        disabled={complete}
        className={cn(
          "w-full rounded-2xl px-4 py-3 text-sm font-extrabold transition active:scale-[0.98]",
          complete
            ? "cursor-default border border-mint/30 bg-mint/10 text-mint"
            : "bg-brand text-white shadow-cta hover:brightness-105"
        )}
      >
        {complete ? c.goalComplete : c.completeGoal}
      </button>
    </Card>
  );
}

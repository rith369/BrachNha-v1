import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { useStreakCopy, weekdayLabel } from "../copy";
import type { DemoStreakDay, WeekdayId } from "../demo-data";

/**
 * Seven cells, Monday to Sunday, one per day of the current week.
 *
 * A GRID, NOT A FLEX ROW. `grid-cols-7` gives seven exactly-equal tracks with
 * no min-width negotiation, which is what keeps this inside a 320px phone
 * without a horizontal scroller: 288px of content minus six 6px gaps leaves
 * 36px a cell, and the disc is 32px. A flex row with `flex-1` gets there too
 * until one label is wider than its share and quietly pushes the row out.
 *
 * TODAY IS A RING, NOT A FILL. The fill means "goal met", so using it to mean
 * "you are here" as well would make an unfinished today look finished. The ring
 * survives the day being completed — the cell then reads as both.
 *
 * The note underneath is the one place the page states what a streak actually
 * measures. The brief asked for that explicitly, and it is the difference
 * between this feature and the social-app streaks it borrows its feel from:
 * those count opening the app, this counts finishing the work.
 */
export function WeeklyStreak({
  week,
  todayId,
}: {
  week: readonly DemoStreakDay[];
  todayId: WeekdayId;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <Card className="gap-3">
      <div className="flex items-baseline justify-between">
        <div className="font-heading text-sm font-extrabold">{c.thisWeek}</div>
        <div className="text-[11px] font-bold text-muted">
          {week.filter((d) => d.done).length} / {week.length}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {week.map((day) => {
          const isToday = day.id === todayId;

          return (
            <div key={day.id} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "text-[9px] font-extrabold tracking-wide uppercase md:text-[10px]",
                  isToday ? "text-purple" : "text-muted"
                )}
              >
                {weekdayLabel(day.id, lang)}
              </div>

              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors md:size-10",
                  day.done
                    ? "bg-flame text-white"
                    : "border-2 border-dashed border-border text-muted",
                  // ring-offset carries the page colour so the gap reads as a
                  // gap rather than a second, paler ring.
                  isToday && "ring-2 ring-purple ring-offset-2 ring-offset-surface"
                )}
              >
                {/* Empty when the goal was not met — a dashed outline says
                    "not yet" on its own, and putting a greyed-out tick in
                    there would be a completion mark on an incomplete day. */}
                {day.done && (
                  <Flame
                    className="size-4 md:size-5"
                    fill="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                )}
              </div>

              {/* Only under today, in a fixed-height slot so the other six keep
                  their baselines. h-4 rather than h-3: Khmer stacks vowel signs
                  above and coeng below, so ថ្ងៃនេះ needs more room than a Latin
                  cap-height line of the same size. */}
              <div className="h-4 text-[8px] font-extrabold text-purple md:text-[9px]">
                {isToday ? c.today : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] leading-relaxed font-bold text-muted">
        {c.countsNote}
      </div>
    </Card>
  );
}

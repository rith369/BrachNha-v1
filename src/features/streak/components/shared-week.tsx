import { Flame, Minus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { SharedDayStatus } from "@/utils/streak-friends";
import { sharedDayAriaLabel, useStreakCopy, weekdayLabel } from "../copy";
import type { Participant, SharedWeekDay } from "../types";

/**
 * The last seven days as SHARED outcomes, not two rows of ticks.
 *
 * Each day is a single indicator carrying the day's shared result — a flame
 * when both finished, an outlined flame for today while it is still open, a
 * cross for a day that was missed, a dash for a day before the two became
 * friends — with a two-dot strip underneath saying WHICH of the pair finished.
 * Left dot is you, right is your friend, matching the order the header puts
 * the two avatars in.
 *
 * A MISSED PAST DAY IS `broken` WHETHER ONE OR NEITHER FINISHED: the day is
 * over, and the streak only ever counted both. Only today can be "at risk".
 *
 * The dots are 4px and read as texture rather than data at a glance, which is
 * the intent. The full sentence is on each cell's `aria-label`, since neither a
 * glyph nor a pair of dots says anything out loud.
 *
 * A GRID, NOT A FLEX ROW, for the same reason the solo tracker is one:
 * `grid-cols-7` gives seven exactly-equal tracks with no min-width negotiation,
 * which is what keeps this inside a 320px phone without a horizontal scroller.
 */
export function SharedWeek({
  week,
  todayKey,
  you,
  friend,
}: {
  week: readonly SharedWeekDay[];
  todayKey: string;
  you: Participant;
  friend: Participant;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  // The "before" legend only when a cell actually shows it: a pair of a week
  // or more never sees one.
  const hasBefore = week.some((d) => d.status === "before");

  return (
    <Card className="gap-3">
      <div className="font-heading text-sm font-extrabold md:text-base">
        {c.sharedWeek}
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {week.map(({ id, key, day, status }) => {
          const isToday = key === todayKey;
          const label = weekdayLabel(id, lang);

          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "text-[9px] font-extrabold tracking-wide uppercase md:text-[10px]",
                  isToday ? "text-purple" : "text-muted"
                )}
              >
                {label}
              </div>

              <div
                aria-label={sharedDayAriaLabel(
                  label,
                  you.name,
                  friend.name,
                  day.you,
                  day.friend,
                  lang
                )}
                role="img"
                className={cn(
                  "flex size-8 items-center justify-center rounded-full md:size-10",
                  STATUS_STYLE[status],
                  isToday && "ring-2 ring-purple ring-offset-2 ring-offset-surface"
                )}
              >
                <StatusGlyph status={status} />
              </div>

              {/* Who finished. Left = you, right = friend, matching the header. */}
              <div className="flex items-center gap-0.5">
                <Dot done={day.you} />
                <Dot done={day.friend} />
              </div>

              <div className="h-4 text-[8px] font-extrabold text-purple md:text-[9px]">
                {isToday ? c.today : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <LegendItem status="kept" label={c.legendKept} />
        <LegendItem status="atRisk" label={c.legendAtRisk} />
        <LegendItem status="broken" label={c.legendBroken} />
        {hasBefore && <LegendItem status="before" label={c.legendBefore} />}
      </div>

      <div className="text-[11px] leading-relaxed font-bold text-muted">
        {c.bothRule}
      </div>
    </Card>
  );
}

/**
 * `broken` is muted rather than red. A day nobody kept is already a loss;
 * painting it in the destructive colour turns a quiet week into a telling-off,
 * which is the forward-only rule the leaderboard applies to the current user.
 */
const STATUS_STYLE: Record<SharedDayStatus, string> = {
  kept: "bg-flame text-white",
  atRisk: "border-2 border-yellow/70 text-yellow",
  broken: "border-2 border-dashed border-border text-muted",
  before: "bg-control text-muted",
};

function StatusGlyph({ status }: { status: SharedDayStatus }) {
  if (status === "kept") {
    return (
      <Flame
        className="size-4 md:size-5"
        fill="currentColor"
        strokeWidth={1.5}
        aria-hidden
      />
    );
  }
  if (status === "broken") {
    return <X className="size-3.5 md:size-4" strokeWidth={3} aria-hidden />;
  }
  if (status === "before") {
    return <Minus className="size-3.5 md:size-4" strokeWidth={3} aria-hidden />;
  }
  // Today, still open: an outlined flame, so it reads as "not finished yet"
  // beside its filled neighbours.
  return <Flame className="size-4 md:size-5" strokeWidth={2.5} aria-hidden />;
}

function Dot({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("size-1 rounded-full", done ? "bg-mint" : "bg-border")}
    />
  );
}

function LegendItem({
  status,
  label,
}: {
  status: SharedDayStatus;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
      <span
        aria-hidden
        className={cn(
          "flex size-4 items-center justify-center rounded-full",
          STATUS_STYLE[status]
        )}
      >
        <span className="scale-[0.55]">
          <StatusGlyph status={status} />
        </span>
      </span>
      {label}
    </span>
  );
}

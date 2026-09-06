import { Flame, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { sharedDayStatus } from "@/utils/streak-friends";
import type { SharedDayStatus } from "@/utils/streak-friends";
import { sharedDayAriaLabel, useStreakCopy, weekdayLabel } from "../copy";
import type { Participant, SharedWeekDay } from "../friend-streak-demo-data";
import type { WeekdayId } from "../demo-data";

/**
 * The week as SHARED outcomes, not two rows of ticks.
 *
 * The brief sketched this as a table with a column each for Panha and Dara, and
 * then said it need not look like one. It does not: each day is a single
 * indicator carrying the day's shared result — flame for both done, a hollow
 * amber ring for one, a cross for neither — with a two-dot strip underneath
 * saying WHICH of the pair finished. Left dot is you, right is your friend,
 * matching the order the header puts the two avatars in.
 *
 * The dots are 4px and read as texture rather than data at a glance, which is
 * the intent: the day's shared verdict is the headline, and who-did-what is
 * detail available on inspection. The full sentence is on each cell's
 * `aria-label`, since neither a glyph nor a pair of dots says anything out loud.
 *
 * A GRID, NOT A FLEX ROW, for the same reason the solo tracker is one:
 * `grid-cols-7` gives seven exactly-equal tracks with no min-width negotiation,
 * which is what keeps this inside a 320px phone without a horizontal scroller.
 */
export function SharedWeek({
  week,
  todayId,
  you,
  friend,
}: {
  week: readonly SharedWeekDay[];
  todayId: WeekdayId;
  you: Participant;
  friend: Participant;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const userName = useBrachNhaStore((s) => s.userName);
  const c = useStreakCopy(lang);

  const yourName = userName || you.name;

  return (
    <Card className="gap-3">
      <div className="font-heading text-sm font-extrabold md:text-base">
        {c.sharedWeek}
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {week.map(({ id, day }) => {
          const status = sharedDayStatus(day);
          const isToday = id === todayId;
          const label = weekdayLabel(id, lang);

          return (
            <div key={id} className="flex flex-col items-center gap-1.5">
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
                  yourName,
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
      </div>

      <div className="text-[11px] leading-relaxed font-bold text-muted">
        {c.bothRule}
      </div>
    </Card>
  );
}

/**
 * `broken` is muted rather than red. A day nobody managed is already a loss;
 * painting it in the destructive colour turns a quiet week into a telling-off,
 * which is the forward-only rule the leaderboard applies to the current user.
 */
const STATUS_STYLE: Record<SharedDayStatus, string> = {
  kept: "bg-flame text-white",
  atRisk: "border-2 border-yellow/70 text-yellow",
  broken: "border-2 border-dashed border-border text-muted",
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
  // At risk: a half-filled flame — outline only, so it reads as "started, not
  // finished" beside its filled neighbours.
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

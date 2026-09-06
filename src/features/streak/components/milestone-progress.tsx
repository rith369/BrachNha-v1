import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import type { MilestoneProgress as Progress } from "@/utils/streak";
import {
  daysUntilMilestoneLabel,
  milestoneCountLabel,
  milestoneDaysLabel,
  useStreakCopy,
} from "../copy";

/**
 * "12 / 14 days · 2 days until your next milestone", with the bar.
 *
 * Its own card, sitting between today's goal and the milestone grid, because it
 * answers a different question from either: the grid says what the rungs ARE,
 * this says how close the next one is. Merging it into the grid's header would
 * bury the one number a student checks daily inside a section they scroll past.
 *
 * `progress` is nullable and the caller renders nothing when it is null — see
 * milestoneProgress() in utils/streak.ts for why a student past the last rung
 * gets no card rather than a bar pinned at 100%.
 *
 * The bar takes `bg-flame`, which is a background-image rather than a colour,
 * so its width is animated by `width` — the fill has no transform to slide.
 * That is a layout property and would be the wrong choice on anything that ran
 * continuously; here it moves once, when the day is completed.
 */
export function MilestoneProgress({ progress }: { progress: Progress }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <Card className="gap-3">
      <div className="flex items-center gap-2.5">
        <Target className="size-4 shrink-0 text-purple" strokeWidth={2.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold tracking-wide text-muted uppercase">
            {c.nextMilestone}
          </div>
          <div className="font-heading truncate text-sm font-extrabold md:text-base">
            {milestoneDaysLabel(progress.target.days, lang)} ·{" "}
            {progress.target.label[lang]}
          </div>
        </div>
        <div className="font-heading shrink-0 text-sm font-extrabold text-purple">
          {milestoneCountLabel(progress.current, progress.target.days, lang)}
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-chart-track">
        <div
          className="bg-flame h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      <div className="text-xs font-bold text-muted">
        {daysUntilMilestoneLabel(progress.remaining, lang)}
      </div>
    </Card>
  );
}

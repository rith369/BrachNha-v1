import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useT } from "@/data/translations";
import { METRIC_META, TITLE_LABEL_KEY } from "../metric-meta";
import {
  climbLine,
  formatMetricValue,
  formatMetricWithUnit,
  gapLine,
  metricUnitLabel,
  metricValue,
  motivationLine,
  ofStudentsLine,
  summaryHeading,
  supportingMetrics,
  tomorrowLine,
} from "@/utils/leaderboard";
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  RankedStudent,
} from "@/utils/leaderboard";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  lang: Lang;
  row: RankedStudent;
  metric: LeaderboardMetric;
  period: LeaderboardPeriod;
  /** How much more of `metric` it takes to pass the row above. 0 at #1. */
  gap: number;
  total: number;
  name: string;
}

/**
 * The student's own standing, at the top of the page so the answer to "where am
 * I?" never requires scrolling.
 *
 * Everything in here re-reads off the selected board: at #12 on streak and #24
 * on study time, a summary that showed one fixed rank would contradict the list
 * directly below it. The metric being ranked is the big coloured number; the
 * other two stay as small supporting stats, so the hierarchy states which board
 * you're on without needing to re-read the tab.
 */
export function PersonalSummary({
  lang,
  row,
  metric,
  period,
  gap,
  total,
  name,
}: Props) {
  const t = useT(lang);
  const meta = METRIC_META[metric];
  const Icon = meta.icon;

  return (
    <Card className="gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold tracking-widest text-muted uppercase">
            {summaryHeading(period, lang)}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-heading text-3xl font-extrabold">
              #{row.rank}
            </span>
            <span className="truncate text-[11px] font-bold text-muted">
              {ofStudentsLine(total, lang)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-purple/10 px-2 py-0.5 text-[10px] font-extrabold text-purple">
              {t[TITLE_LABEL_KEY[row.title]]}
            </span>
            <span className="truncate text-[11px] font-extrabold text-muted">
              {name}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={cn(
              "flex items-center justify-end gap-1.5 font-heading text-2xl font-extrabold",
              meta.color
            )}
          >
            <Icon className="size-5" strokeWidth={2.5} />
            {formatMetricValue(row.value, metric)}
          </div>
          <div className="text-[10px] font-bold text-muted">
            {metricUnitLabel(metric, lang)}
          </div>
          {/* Only ever rendered while the student is climbing. A "↓ 2
              positions" badge on your own card is the exact discouragement
              this screen is supposed to avoid — peers' rows show movement
              both ways in neutral grey, but your own card stays forward
              looking, and the gap line below always gives you a next step. */}
          {row.change > 0 && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-mint/12 px-2 py-0.5 text-[10px] font-extrabold text-mint">
              <TrendingUp className="size-3" strokeWidth={2.5} />↑ {row.change}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-purple/8 pt-3">
        {supportingMetrics(metric).map((m) => {
          const supportMeta = METRIC_META[m];
          const SupportIcon = supportMeta.icon;
          return (
            <div key={m} className="flex items-center gap-2">
              <SupportIcon
                className={cn("size-4 shrink-0", supportMeta.color)}
                strokeWidth={2.25}
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold">
                  {formatMetricWithUnit(metricValue(row.stats, m), m, lang)}
                </div>
                <div className="truncate text-[10px] font-bold text-muted">
                  {t[supportMeta.labelKey]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-purple/6 p-2.5">
        <div className="text-xs font-extrabold">
          {motivationLine(metric, period, lang, {
            rank: row.rank,
            stats: row.stats,
          })}
        </div>
        <div className="mt-0.5 text-[11px] font-bold text-purple">
          {gapLine(metric, lang, gap, row.rank - 1)}
        </div>
        {/* Streak is the one board where the next step is always the same and
            always tomorrow, which is worth saying out loud — it's the habit the
            whole app is trying to build. */}
        {metric === "streak" && (
          <div className="mt-0.5 text-[11px] font-bold text-muted">
            {tomorrowLine(row.stats.streak, lang)}
          </div>
        )}
        {row.change > 0 && (
          <div className="mt-0.5 text-[11px] font-bold text-mint">
            {climbLine(row.change, period, lang)}
          </div>
        )}
      </div>
    </Card>
  );
}

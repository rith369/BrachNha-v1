import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { useT } from "@/data/translations";
import { METRIC_META, TITLE_LABEL_KEY } from "../metric-meta";
import {
  formatMetricValue,
  formatMetricWithUnit,
  gapLine,
  metricValue,
  supportingMetrics,
} from "@/utils/leaderboard";
import type { LeaderboardMetric, RankedStudent } from "@/utils/leaderboard";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  lang: Lang;
  row: RankedStudent;
  metric: LeaderboardMetric;
  gap: number;
  name: string;
}

/**
 * The student's row, pinned so it is never more than a glance away while they
 * scroll other people's.
 *
 * `sticky bottom-0` as the last child of the scrolling column, rather than
 * `fixed`: it floats above the list while there's list left, then lands in
 * place at the end instead of hovering over the final rows forever. The view
 * unmounts it entirely while the real row is on screen, so the same card is
 * never shown twice.
 *
 * pr-16 is not decoration — the chat FAB is absolutely positioned over the
 * bottom-right of the scroll area at every width (bottom-20 above the tab bar,
 * bottom-6 on desktop). Without the reserved gutter it would sit on top of the
 * metric value.
 */
export function StickyUserCard({ lang, row, metric, gap, name }: Props) {
  const t = useT(lang);
  const meta = METRIC_META[metric];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="sticky bottom-0 z-20 pt-2"
    >
      <div className="rounded-2xl border border-purple/30 bg-elevated/95 p-2.5 pr-16 shadow-panel backdrop-blur-sm">
        <div className="mb-1 text-[9px] font-extrabold tracking-widest text-muted uppercase">
          {t.yourRanking}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-7 shrink-0 text-center font-heading text-xs font-extrabold text-purple md:w-9 md:text-sm">
            #{row.rank}
          </span>
          <Avatar
            seed={row.student.avatarSeed}
            name={name}
            className="size-9 shrink-0 border-2 border-purple/30"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-extrabold md:text-sm">
              {name}
            </div>
            <div className="truncate text-[10px] font-bold text-muted md:text-[11px]">
              {t[TITLE_LABEL_KEY[row.title]]}
              {supportingMetrics(metric).map(
                (m) =>
                  ` · ${formatMetricWithUnit(metricValue(row.stats, m), m, lang)}`
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 font-heading text-sm font-extrabold md:text-base",
              meta.color
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2.5} />
            {formatMetricValue(row.value, metric)}
          </div>
        </div>
        <div className="mt-1.5 text-[10px] font-extrabold text-purple md:text-[11px]">
          {gapLine(metric, lang, gap, row.rank - 1)}
        </div>
      </div>
    </motion.div>
  );
}

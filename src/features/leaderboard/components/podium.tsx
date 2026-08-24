import { Avatar } from "@/components/ui/avatar";
import { useT } from "@/data/translations";
import { METRIC_META, PODIUM_STYLE, TITLE_LABEL_KEY } from "../metric-meta";
import {
  formatMetricValue,
  formatMetricWithUnit,
  metricValue,
  supportingMetrics,
} from "@/utils/leaderboard";
import type { LeaderboardMetric, RankedStudent } from "@/utils/leaderboard";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  lang: Lang;
  /** Ranks 1–3 of the board on screen, in rank order. */
  top: RankedStudent[];
  metric: LeaderboardMetric;
  currentUserName: string;
  /** Attached to the current user's column if they're up here — see
   *  leaderboard-view.tsx, which watches it to decide whether the sticky card
   *  is still needed. */
  currentUserRef: (el: HTMLElement | null) => void;
}

/**
 * Top 3, laid out 2–1–3 so first place is centred and raised.
 *
 * "Slightly more prominent", not a trophy scene: #1 gets a bigger avatar, a
 * taller card and one step up in type size. On a 320px phone each column is
 * ~91px wide, which is what caps the primary value at 13px — "18h 42m" beside
 * an icon is the widest thing that has to fit, and it fits at that size with
 * room to spare. Every increase from there is md:/lg:-only.
 */
export function Podium({
  lang,
  top,
  metric,
  currentUserName,
  currentUserRef,
}: Props) {
  const t = useT(lang);
  const meta = METRIC_META[metric];
  const Icon = meta.icon;

  // 2nd, 1st, 3rd — reading order on a podium is the shape, not the ranking.
  const order = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div className="grid grid-cols-3 items-end gap-2 md:gap-3">
      {order.map((row) => {
        const style = PODIUM_STYLE[row.rank - 1];
        const first = row.rank === 1;
        const mine = row.student.isCurrentUser;
        return (
          <div
            key={row.student.id}
            ref={mine ? currentUserRef : null}
            className={cn(
              "flex flex-col items-center rounded-2xl border px-1.5 pb-3 text-center md:px-2.5",
              first ? "pt-4 shadow-panel md:pt-6" : "pt-3 shadow-panel-sm",
              mine
                ? "border-purple/40 bg-purple/6"
                : "border-purple/10 bg-surface"
            )}
          >
            <div
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap md:text-[11px]",
                style.badge
              )}
            >
              {style.medal} #{row.rank}
            </div>

            <Avatar
              seed={row.student.avatarSeed}
              name={mine ? currentUserName : row.student.name}
              className={cn(
                "mt-2 ring-2 ring-offset-2 ring-offset-surface",
                style.ring,
                first ? "size-13 md:size-18" : "size-11 md:size-15"
              )}
            />

            <div className="mt-1.5 w-full truncate text-[11px] font-extrabold md:text-sm">
              {mine ? currentUserName : row.student.name}
            </div>
            <div className="w-full truncate text-[9px] font-bold text-muted md:text-[11px]">
              {t[TITLE_LABEL_KEY[row.title]]}
            </div>

            <div
              className={cn(
                "mt-1.5 flex items-center justify-center gap-1 font-heading font-extrabold",
                meta.color,
                first ? "text-[13px] md:text-xl" : "text-xs md:text-lg"
              )}
            >
              <Icon
                className={cn("shrink-0", first ? "size-3.5 md:size-5" : "size-3 md:size-4.5")}
                strokeWidth={2.5}
              />
              {formatMetricValue(row.value, metric)}
            </div>

            <div className="mt-1.5 flex flex-col items-center gap-0.5">
              {supportingMetrics(metric).map((m) => {
                const supportMeta = METRIC_META[m];
                const SupportIcon = supportMeta.icon;
                return (
                  <div
                    key={m}
                    className="flex items-center gap-1 text-[9px] font-bold text-muted md:text-[11px]"
                  >
                    <SupportIcon
                      className={cn("size-2.5 shrink-0 md:size-3", supportMeta.color)}
                      strokeWidth={2.5}
                    />
                    {formatMetricWithUnit(metricValue(row.stats, m), m, lang)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { Avatar } from "@/components/ui/avatar";
import { useT } from "@/data/translations";
import { METRIC_META, TITLE_LABEL_KEY } from "../metric-meta";
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
  /** Ranks 4 and below — the podium takes the first three. */
  rows: RankedStudent[];
  metric: LeaderboardMetric;
  currentUserName: string;
  currentUserRef: (el: HTMLElement | null) => void;
}

/**
 * The rest of the board.
 *
 * One row carries five things and a phone has room for three of them, so the
 * supporting stats live on the row's second line under ~768px and move out to
 * their own right-hand column from md — the "simplify to rank + avatar + name +
 * primary metric" rule the spec asks for, done by moving the extras rather than
 * dropping them. This is the one place in the app where a card has an internal
 * breakpoint, and it's deliberate: the row is the layout here, not a card
 * sitting inside a responsive grid.
 */
export function RankingList({
  lang,
  rows,
  metric,
  currentUserName,
  currentUserRef,
}: Props) {
  const t = useT(lang);
  const meta = METRIC_META[metric];
  const Icon = meta.icon;
  const support = supportingMetrics(metric);

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const mine = row.student.isCurrentUser;
        const name = mine ? currentUserName : row.student.name;
        return (
          <li
            key={row.student.id}
            ref={mine ? currentUserRef : null}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border p-2.5 transition md:gap-3 md:p-3",
              mine
                ? "border-purple/40 bg-purple/8 shadow-panel-sm"
                : "border-purple/10 bg-surface shadow-panel-sm hover:border-purple/25"
            )}
          >
            <span className="w-7 shrink-0 text-center font-heading text-xs font-extrabold text-muted md:w-9 md:text-sm">
              #{row.rank}
            </span>

            <Avatar
              seed={row.student.avatarSeed}
              name={name}
              className="size-9 shrink-0 border-2 border-purple/10 md:size-11"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13px] font-extrabold md:text-sm">
                  {name}
                </span>
                {mine && (
                  // --brand-purple, not --color-purple: this is white text on a
                  // fill, and the lifted dark-mode accent would drop it to
                  // ~2.8:1. See the two-accent-scales note in globals.css.
                  <span className="shrink-0 rounded-full bg-[var(--brand-purple)] px-1.5 py-px text-[9px] font-extrabold text-on-brand">
                    {t.youLabel}
                  </span>
                )}
              </div>
              <div className="truncate text-[10px] font-bold text-muted md:text-[11px]">
                {t[TITLE_LABEL_KEY[row.title]]}
                <span className="md:hidden">
                  {support.map(
                    (m) =>
                      ` · ${formatMetricWithUnit(metricValue(row.stats, m), m, lang)}`
                  )}
                </span>
              </div>
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-0.5 md:flex">
              {support.map((m) => {
                const supportMeta = METRIC_META[m];
                const SupportIcon = supportMeta.icon;
                return (
                  <div
                    key={m}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted"
                  >
                    <SupportIcon
                      className={cn("size-3 shrink-0", supportMeta.color)}
                      strokeWidth={2.5}
                    />
                    {formatMetricWithUnit(metricValue(row.stats, m), m, lang)}
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 text-right">
              <div
                className={cn(
                  "flex items-center justify-end gap-1 font-heading text-[13px] font-extrabold md:text-base",
                  meta.color
                )}
              >
                <Icon className="size-3.5 shrink-0 md:size-4" strokeWidth={2.5} />
                {formatMetricValue(row.value, metric)}
              </div>
              {/* Movement is reported both ways for peers, in one neutral
                  colour. A red "down" arrow would turn an ordinary quiet week
                  into a public failure, which is not what this board is for. */}
              {row.change !== 0 && (
                <div className="text-[9px] font-extrabold text-muted md:text-[10px]">
                  {row.change > 0 ? `↑ ${row.change}` : `↓ ${-row.change}`}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import { useT } from "@/data/translations";
import { METRIC_META, PERIOD_LABEL_KEY } from "../metric-meta";
import { METRICS, PERIODS } from "@/utils/leaderboard";
import type { LeaderboardMetric, LeaderboardPeriod } from "@/utils/leaderboard";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  lang: Lang;
  metric: LeaderboardMetric;
  period: LeaderboardPeriod;
  onMetric: (metric: LeaderboardMetric) => void;
  onPeriod: (period: LeaderboardPeriod) => void;
}

/**
 * Two selectors that answer two different questions, so they are deliberately
 * NOT the same control twice:
 *
 *   metric → "what are we ranking by?"   filled brand buttons, icon + label
 *   period → "over what window?"          quiet pills inside one track
 *
 * Given the same treatment they read as six equal options and students tap them
 * interchangeably. The size difference also matches how often each is used —
 * switching board is the main interaction on this screen, switching window is
 * an occasional one.
 *
 * Phone lays each metric button out as icon-over-label: "Study Time" beside a
 * 14px icon does not fit a 92px column at 320px, and truncating a control's own
 * name is not an option. From md there is room for one line.
 */
export function LeaderboardControls({
  lang,
  metric,
  period,
  onMetric,
  onPeriod,
}: Props) {
  const t = useT(lang);

  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="group"
        aria-label={t.leaderboard}
        className="grid grid-cols-3 gap-2"
      >
        {METRICS.map((m) => {
          const meta = METRIC_META[m];
          const Icon = meta.icon;
          const active = metric === m;
          return (
            <button
              key={m}
              onClick={() => onMetric(m)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-[11px] font-extrabold transition md:flex-row md:gap-2 md:py-3 md:text-xs",
                active
                  ? "border-transparent bg-brand text-on-brand shadow-cta"
                  : "border-purple/10 bg-surface text-muted hover:bg-purple/8 hover:text-text"
              )}
            >
              <Icon
                className={cn("size-4 shrink-0", !active && meta.color)}
                strokeWidth={2.25}
              />
              {t[meta.labelKey]}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label={t.periodWeekly}
        className="flex items-center gap-1 rounded-full border border-purple/10 bg-surface p-1"
      >
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => onPeriod(p)}
              aria-pressed={active}
              className={cn(
                "flex-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold transition md:text-xs",
                active
                  ? "bg-purple/12 text-purple"
                  : "text-muted hover:text-text"
              )}
            >
              {t[PERIOD_LABEL_KEY[p]]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

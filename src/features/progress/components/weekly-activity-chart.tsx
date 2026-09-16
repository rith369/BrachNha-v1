import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Clock, Sparkles, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ProgressSummary } from "../summary";
import { cn } from "@/utils/cn";

/**
 * A ROLLING 7 days ending today, not a fixed Mon-Sun week.
 *
 * Three things fall out of that, and all three were bugs before:
 *  - always exactly 7 points, so the chart does not shrink to one dot on a
 *    Monday morning;
 *  - no future day is ever plotted at 0, the same rule buildHeatmapWeeks
 *    already applies to the heatmap grid;
 *  - "vs last week" becomes DERIVABLE, against the previous rolling 7 days.
 *    It used to be a fixed `weeklyActivityChangePct` the old file apologised
 *    for in a comment, because the week it compared against was never plotted.
 *
 * BOTH SERIES ARE REAL NOW. Study time was invented until the study timer
 * existed, and this card shipped XP-only in the interim rather than drawing a
 * flat line at zero — which would have been a visual claim that the student
 * studied and earned nothing. See hooks/use-study-timer.ts for what a counted
 * minute is.
 *
 * THE SECOND SERIES IS MINUTES, NOT HOURS, and that is a correction rather than
 * a preference. It shipped as hours and a student who had just finished a
 * biology deck reported the chart showing nothing: six real minutes is 0.1h,
 * which rounds onto the axis floor and draws the same flat line the empty state
 * exists to avoid. A day is the wrong window to measure in hours at this app's
 * scale. See WeekDay.minutes in ../summary.ts.
 */

type Metric = "xp" | "minutes";

const METRIC_META: Record<
  Metric,
  { label: string; icon: LucideIcon; unit: (v: number) => string }
> = {
  xp: { label: "XP Points", icon: Zap, unit: (v) => `${v} XP` },
  minutes: { label: "Study Minutes", icon: Clock, unit: (v) => `${v}m` },
};
const METRICS: Metric[] = ["xp", "minutes"];

/**
 * A real numeric [lo, hi], not Recharts' `domain={["dataMin", "dataMax"]}`
 * string form — on the installed recharts 3.10.1 that form silently renders the
 * Y axis with zero ticks (empty `<g>`s, confirmed in the rendered SVG).
 *
 * Two fixes over the version this replaces, both of which only show up on real
 * data. The old step was `max <= 10 ? 0.5 : 10`, which gives a student with 8 XP
 * in a day a tick every half point — sixteen of them. And an all-zero week
 * returned [0, 0], a degenerate axis Recharts cannot lay out.
 *
 * The step LADDER is what lets one function serve both series, where the old
 * two-branch heuristic had to guess: a light day of minutes lands at 1 or 2, a
 * heavy one at 20, XP at 20 or 50, without any of them being named here.
 *
 * A standard 1-2-5 ladder, and it starts at 1 because BOTH series are whole
 * numbers now — XP is awarded in tens, minutes are floored before they are ever
 * stored. It used to open at 0.5 for the hours series it no longer carries, and
 * left over that would draw a half-minute gridline under an integer count.
 */
const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500];

function niceDomain(values: number[]): [number, number] {
  const max = Math.max(...values, 0);
  const step = STEPS.find((s) => max / s <= 4) ?? STEPS[STEPS.length - 1];
  const lo = 0;
  // Never collapse to a zero-height axis: an empty week still needs one step of
  // headroom for the flat line to sit on.
  const hi = Math.max(Math.ceil(max / step) * step, lo + step);
  return [lo, hi];
}

export function WeeklyActivityChart({ summary }: { summary: ProgressSummary }) {
  // Component state, not store state: this is how the card is being looked at
  // right now, not something a reload should inherit — the same call the
  // leaderboard's metric/period pair makes.
  const [metric, setMetric] = useState<Metric>("xp");
  const meta = METRIC_META[metric];

  const { week, bestDay, weekChangePct } = summary;
  const values = week.map((d) => d[metric]);
  const domain = niceDomain(values);
  const empty = values.every((v) => v === 0);
  const up = (weekChangePct ?? 0) > 0;
  const flat = weekChangePct === 0;

  // The best day is computed on XP by the summary, so it is only meaningful on
  // that series. Rather than print an XP day's name over a minutes chart, the
  // footer's left half goes absent — the same absent-rather-than-wrong rule the
  // empty week already follows.
  const showBest = metric === "xp" && bestDay !== null;

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      {/* flex-wrap, not a breakpoint: the toggle drops to its own line once the
          card is too narrow for the icon + title + pills on one row. ml-auto on
          the toggle rather than justify-between here — with justify-between a
          toggle that wraps onto its OWN line lands at the line's start, since
          space-between with a single item behaves like flex-start. */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Brand fill, not the lifted accent scale: a white icon sits ON this,
              so it needs the identical-in-both-themes gradient — same rule as
              the FAB and the wordmark. */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[var(--brand-blue)] to-[var(--brand-purple)] shadow-cta">
            <Sparkles className="size-4.5 text-white" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className="font-heading text-sm font-extrabold">
              Weekly Learning Activity
            </div>
            <div className="text-[11px] font-bold text-muted">
              Your study time &amp; XP over the last 7 days.
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="Weekly Learning Activity metric"
          className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full border border-purple/10 bg-control p-0.5"
        >
          {METRICS.map((m) => {
            const active = metric === m;
            const Icon = METRIC_META[m].icon;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold whitespace-nowrap transition",
                  active
                    ? "bg-linear-to-br from-[var(--brand-blue)] to-[var(--brand-purple)] text-on-brand shadow-cta"
                    : "text-muted hover:text-text"
                )}
              >
                <Icon className="size-3" strokeWidth={2.5} />
                {METRIC_META[m].label}
              </button>
            );
          })}
        </div>
      </div>

      {empty ? (
        // One honest line rather than a flat series pinned to the axis, which
        // reads as "you studied and earned nothing". Card and header stay, so
        // the page does not lose a block on a new student's first day, and the
        // toggle stays live so the other series is still reachable.
        <div className="flex h-40 items-center justify-center px-4 text-center text-xs font-bold text-muted">
          {metric === "xp"
            ? "No activity in the last 7 days. Finish a lesson to start the chart."
            : "No study time recorded in the last 7 days."}
        </div>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={week} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {/* One shared gradient id: only one <Area> is ever mounted at a
                  time, since the toggle swaps `dataKey` rather than the chart. */}
              <defs>
                <linearGradient id="weeklyActivityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-purple)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={domain}
                tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  // Recharts defaults its tooltip panel to a solid white box and
                  // sets item/label colours independently of contentStyle, so all
                  // three have to be named or the panel stays light-mode.
                  background: "var(--color-tooltip-bg)",
                  color: "var(--color-text)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
                itemStyle={{ color: "var(--color-text)" }}
                labelStyle={{ color: "var(--color-muted)" }}
                formatter={(v) => [meta.unit(v as number), meta.label]}
              />
              {/* isAnimationActive={false}: Recharts animates on MOUNT by
                  default, for 1500ms, and a route is a fresh mount — see the
                  Performance section in CLAUDE.md. Toggling the metric also
                  swaps `dataKey`, which Recharts treats as a new series and
                  would replay the sweep-in on every tap without this. */}
              <Area
                type="monotone"
                dataKey={metric}
                stroke="var(--color-purple)"
                strokeWidth={2.5}
                fill="url(#weeklyActivityFill)"
                dot={{ r: 5, fill: "var(--color-surface)", stroke: "var(--color-purple)", strokeWidth: 2.5 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple/8 pt-3 text-[11px] font-bold">
        {/* Absent, not zeroed. The old version read the best day off the array
            unconditionally — on an empty week `indexOf(Math.max(...[]))` is -1
            and `week[-1].day` threw, and on an all-zero week it announced
            "Highest productivity on Mon (0 XP)". */}
        {showBest && bestDay ? (
          <span className="flex items-center gap-1.5 text-muted">
            <span className="size-2 shrink-0 rounded-full bg-mint" />
            Highest productivity on{" "}
            <span className="font-extrabold text-text">
              {bestDay.label} ({bestDay.xp} XP)
            </span>
          </span>
        ) : (
          <span />
        )}
        {/* The change is computed on XP, so it is shown on the XP series only —
            labelling a minutes chart with an XP delta would be a quietly wrong
            number rather than a missing one. */}
        {metric === "xp" && weekChangePct !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-extrabold",
              flat ? "text-muted" : up ? "text-mint" : "text-pink"
            )}
          >
            {flat
              ? "No change vs last week"
              : `${up ? "+" : ""}${weekChangePct}% vs last week`}
            {!flat &&
              (up ? (
                <ArrowUpRight className="size-3.5" strokeWidth={3} />
              ) : (
                <ArrowDownRight className="size-3.5" strokeWidth={3} />
              ))}
          </span>
        )}
      </div>
    </div>
  );
}

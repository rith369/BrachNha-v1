import { useMemo, useState } from "react";
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
import { weeklyActivity, weeklyActivityChangePct } from "../demo-data";
import { cn } from "@/utils/cn";

type Metric = "xp" | "hours";

const METRIC_META: Record<
  Metric,
  { label: string; icon: LucideIcon; unit: (v: number) => string }
> = {
  xp: { label: "XP Points", icon: Zap, unit: (v) => `${v} XP` },
  hours: { label: "Study Hours", icon: Clock, unit: (v) => `${v}h` },
};
const METRICS: Metric[] = ["xp", "hours"];

function summarize(metric: Metric) {
  const values = weeklyActivity.map((d) => d[metric]);
  const bestIndex = values.indexOf(Math.max(...values));
  return {
    bestDay: weeklyActivity[bestIndex].day,
    bestValue: values[bestIndex],
    changePct: weeklyActivityChangePct[metric],
  };
}

/**
 * A real numeric [lo, hi], not Recharts' `domain={["dataMin", "dataMax"]}`
 * string form — on the installed recharts 3.10.1, that form silently renders
 * the Y axis with zero ticks (empty `<g>`s, no numbers at all, confirmed by
 * inspecting the rendered SVG). A concrete number pair is what the ORIGINAL
 * version of this chart used and ticks always rendered fine, so this avoids
 * the string form rather than chasing why it broke.
 *
 * XP (20-120) and Study Hours (0.5-3) are on completely different scales, so
 * the step size adapts: whole tens for the big numbers, halves for the small
 * ones. For the current data this lands XP exactly on 20/30/…/120 — the same
 * ticks as the reference design.
 */
function niceDomain(values: number[]): [number, number] {
  const step = Math.max(...values) <= 10 ? 0.5 : 10;
  return [Math.floor(Math.min(...values) / step) * step, Math.ceil(Math.max(...values) / step) * step];
}

export function WeeklyActivityChart() {
  const [metric, setMetric] = useState<Metric>("xp");
  const meta = METRIC_META[metric];
  const summary = useMemo(() => summarize(metric), [metric]);
  const domain = useMemo(
    () => niceDomain(weeklyActivity.map((d) => d[metric])),
    [metric]
  );
  const up = summary.changePct >= 0;

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      {/* flex-wrap, not a breakpoint: the toggle drops to its own line once the
          card is too narrow for the icon + title + pills on one row, and grows
          back onto the title's row as the card widens — same idea as every
          other "nothing inside a card needs a breakpoint" spot in this app,
          just solved with wrap instead of a fixed column count.

          ml-auto on the toggle below, not justify-between here: with
          justify-between, a toggle that wraps onto its OWN line (nothing else
          sharing that line) lands at the line's start — the left edge — since
          space-between with a single item behaves like flex-start. ml-auto
          pushes it to the right in both the shared-row and wrapped-alone
          cases, which is the one thing that actually needs guaranteeing. */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Brand fill, not the lifted accent scale: white icon sits ON this,
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
              Track your study time &amp; XP points gained across the week.
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

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {/* margin.left is 0, not the -20 the old dual-line chart used. That
              value was tuned back when the widest Y label was 3 digits
              ("100") sharing the same 28px YAxis width; combined with a -20px
              margin it left only ~8px, which right-aligned tick text (anchor
              "end") simply rendered past — confirmed by dumping the SVG: the
              numbers were there, sitting at x=0 and clipped by the container's
              left edge. Verified against git history: this predates every
              change made in this session. width=34 below gives 3-digit XP and
              one-decimal hour labels ("120", "3.0") real room instead. */}
          <AreaChart data={weeklyActivity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {/* One shared gradient id: only one <Area> is ever mounted at a
                time (the toggle swaps `metric`, not the chart type). */}
            <defs>
              <linearGradient id="weeklyActivityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-purple)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-purple)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            {/* domain is computed per metric by niceDomain() above — XP
                (20-120) and Study Hours (0.5-3) are on completely different
                scales, so a single hardcoded range would flatten or overflow
                whichever metric isn't active. */}
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple/8 pt-3 text-[11px] font-bold">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="size-2 shrink-0 rounded-full bg-mint" />
          Highest productivity on{" "}
          <span className="font-extrabold text-text">
            {summary.bestDay} ({meta.unit(summary.bestValue)})
          </span>
        </span>
        <span
          className={cn(
            "flex items-center gap-0.5 font-extrabold",
            up ? "text-mint" : "text-pink"
          )}
        >
          {up ? `+${summary.changePct}%` : `${summary.changePct}%`} vs last week
          {up ? (
            <ArrowUpRight className="size-3.5" strokeWidth={3} />
          ) : (
            <ArrowDownRight className="size-3.5" strokeWidth={3} />
          )}
        </span>
      </div>
    </div>
  );
}

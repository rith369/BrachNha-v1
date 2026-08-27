import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Lang } from "@/types";
import { useT } from "@/data/translations";

export function PredictionTrendChart({
  lang,
  data,
}: {
  lang: Lang;
  data: { week: string; aProbability: number }[];
}) {
  const t = useT(lang);
  const first = data[0]?.aProbability ?? 0;
  const last = data[data.length - 1]?.aProbability ?? 0;
  const delta = last - first;
  const trendUp = delta >= 0;

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-heading text-sm font-extrabold">
            📉 {t.predictionTrend}
          </div>
          <div className="text-[11px] font-bold text-muted">
            {lang === "en" ? "Grade A probability, weekly" : "ប្រូបាប៊ីលីតេនិទ្ទេស A ប្រចាំសប្ដាហ៍"}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
            trendUp ? "bg-mint/10 text-mint" : "bg-pink/10 text-pink"
          }`}
        >
          {trendUp ? "↑" : "↓"} {Math.abs(delta)}%
        </div>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          {/* margin.left: 0, width: 34 below — not the old -20/28 pair. That
              combo left only ~8px for right-aligned Y-axis tick text, which
              rendered fully off the card's left edge (confirmed by dumping the
              chart's SVG: the numbers existed in the DOM, positioned at x=0
              with the whole -20 margin behind them). See the identical fix and
              full explanation in weekly-activity-chart.tsx. */}
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
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
            <Line
              type="monotone"
              dataKey="aProbability"
              stroke="var(--color-purple)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-pink)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              // Was explicitly ON, which is the one chart that had opted in.
              // Recharts animates on MOUNT, and a route is a fresh mount, so it
              // replayed a 1500ms sweep every time this page was opened rather
              // than once when the data changed. See score-trend-chart.tsx.
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

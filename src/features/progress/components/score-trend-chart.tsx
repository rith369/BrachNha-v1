import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { scoreTrend } from "../demo-data";

export function ScoreTrendChart() {
  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-heading text-sm font-extrabold">
            Score Trend 📉📈
          </div>
          <div className="text-[11px] font-bold text-muted">
            Weekly avg score over 4 weeks
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-pink" /> Score
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-purple/20" /> Target
          </span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scoreTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
              width={28}
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
            {/* isAnimationActive={false} on every series here and in the two
                other charts. Recharts animates on MOUNT by default, for 1500ms,
                and a page is a fresh mount every time it is navigated to — so
                opening Progress used to draw the page and then spend a second
                and a half sweeping three charts in. That reads as the app being
                slow to switch pages, which is exactly what it was. The data is
                fixed demo data that never transitions, so there is nothing the
                animation was communicating. */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-chart-track)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-pink)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-purple)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

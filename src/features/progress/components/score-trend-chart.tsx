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
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
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
            <CartesianGrid vertical={false} stroke="rgba(139,43,226,0.08)" />
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
                border: "1px solid rgba(139,43,226,0.15)",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="rgba(139,43,226,0.25)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-pink)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-purple)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
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
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
              dataKey="aProbability"
              stroke="var(--color-purple)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-pink)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

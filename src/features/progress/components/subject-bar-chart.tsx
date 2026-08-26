import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import { questionsPerSubject } from "../demo-data";

export function SubjectBarChart() {
  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3">
        <div className="font-heading text-sm font-extrabold">
          Questions Answered 📊
        </div>
        <div className="text-[11px] font-bold text-muted">
          Per subject this month
        </div>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={questionsPerSubject} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="subject"
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-chart-grid)" }}
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
            {/* See the note in score-trend-chart.tsx — mount animation off, for
                the same reason and to keep the two charts on this page in step
                with each other. */}
            <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
              {questionsPerSubject.map((s) => (
                <Cell key={s.subject} fill={s.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

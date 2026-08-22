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
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
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
              cursor={{ fill: "rgba(139,43,226,0.05)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(139,43,226,0.15)",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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

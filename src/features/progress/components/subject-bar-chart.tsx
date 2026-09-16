import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import { useBrachNhaStore } from "@/lib/store";
import { progressSubjects, type ProgressSubject } from "../subjects";
import type { ProgressSummary } from "../summary";

/**
 * Recharts' tooltip content signature — not exported from the package, so
 * shaped by hand. `payload[0].payload` is the full ProgressSubject row Bar was
 * given, which is where the full name lives (the axis only shows the short
 * code).
 */
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ProgressSubject }[];
}) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <div
      className="rounded-xl border px-3 py-1.5 text-xs font-bold"
      style={{
        borderColor: "var(--color-border)",
        // Recharts' own contentStyle prop defaults to a solid white panel, so
        // the same values are set here by hand for a custom content component.
        background: "var(--color-tooltip-bg)",
        color: "var(--color-text)",
      }}
    >
      <span style={{ color: s.color }}>{s.name}</span>: {s.questions} questions
    </div>
  );
}

export function SubjectBarChart({ summary }: { summary: ProgressSummary }) {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const subjects = progressSubjects(summary, userLanguage);
  const empty = subjects.every((s) => s.questions === 0);

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3">
        <div className="font-heading text-sm font-extrabold">
          Questions Answered 📊
        </div>
        <div className="text-[11px] font-bold text-muted">
          Per subject, all time
        </div>
      </div>

      {empty ? (
        <div className="flex h-36 items-center justify-center px-4 text-center text-xs font-bold text-muted">
          No questions answered yet. Finish a lesson quiz to fill this in.
        </div>
      ) : (
        /* VERTICAL bars with SHORT axis labels — 7 real names don't fit under a
           ~40px column at the 320px floor, and Recharts silently DROPS ticks it
           can't fit rather than overlapping them, so bars would go unlabelled.
           The full name is a tap/hover away via the custom tooltip above.

           EVERY SUBJECT KEEPS ITS BAR, including ones at zero. A missing bar
           reads as a subject BrachNha does not teach — the mirror image of the
           geography bar this page used to carry. */
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjects} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="shortLabel"
                tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "var(--color-chart-grid)" }}
                content={<ChartTooltip />}
              />
              {/* See the note in weekly-activity-chart.tsx — mount animation
                  off, for the same reason and to keep the two charts on this
                  page in step with each other. */}
              <Bar dataKey="questions" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                {subjects.map((s) => (
                  <Cell key={s.id} fill={s.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

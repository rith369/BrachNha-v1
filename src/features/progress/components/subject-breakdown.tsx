import { subjectBreakdown } from "../demo-data";

export function SubjectBreakdown() {
  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        Subject Breakdown 🎯
      </div>
      <div className="flex flex-col gap-3.5">
        {subjectBreakdown.map((s) => (
          <div
            key={s.name}
            className="rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel-sm"
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="text-xl">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold">{s.name}</div>
                <div className="text-[10px] font-bold text-muted">
                  {s.sessions} sessions · {s.questions} questions
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-heading text-lg font-extrabold"
                  style={{ color: s.color }}
                >
                  {s.score}%
                </div>
                <div
                  className={`text-[10px] font-extrabold ${s.trendUp ? "text-mint" : "text-pink"}`}
                >
                  {s.trend}
                </div>
              </div>
            </div>

            <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-purple/8">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.score}%`, background: s.color }}
              />
            </div>

            <div className="flex h-8 items-end gap-1">
              {s.sparkline.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: s.color,
                    opacity: 0.35 + (i / s.sparkline.length) * 0.65,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useBrachNhaStore } from "@/lib/store";
import { progressSubjects, trendLabel } from "../subjects";

export function SubjectBreakdown() {
  // Only userLanguage matters here — which language subject shows. The name
  // itself is always English; see progressSubjects()'s own comment for why.
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const subjects = progressSubjects(userLanguage);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        Subject Breakdown 🎯
      </div>
      <div className="flex flex-col gap-3.5">
        {subjects.map((s) => {
          const Icon = s.icon;
          const up = s.trendPct >= 0;

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel-sm"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                {/* The catalog's Lucide icon, tinted to the subject's own
                    accent — not the emoji this list used to hand-pick per
                    subject. Same swap the rest of the app made. */}
                <Icon
                  className="size-5 shrink-0"
                  style={{ color: s.color }}
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
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
                    className={`text-[10px] font-extrabold ${up ? "text-mint" : "text-pink"}`}
                  >
                    {trendLabel(s.trendPct)}
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
          );
        })}
      </div>
    </div>
  );
}

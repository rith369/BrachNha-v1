import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { SubjectPrediction } from "@/utils/gradePrediction";

const SUBJECT_ICONS: Record<string, string> = {
  math: "📐",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "📜",
  khmer: "📖",
  english: "🗣️",
  french: "🗣️",
};

function gradeColor(grade: string) {
  if (grade === "A" || grade === "B") return "text-mint";
  if (grade === "C") return "text-yellow";
  return "text-pink";
}

function gradeBarColor(grade: string) {
  if (grade === "A" || grade === "B") return "bg-mint";
  if (grade === "C") return "bg-yellow";
  return "bg-pink";
}

// Strong / Developing / Needs Improvement — a status label derived straight
// from pct, independent of the letter grade, so it reads more like a coach's
// note than a repeat of the grade already shown next to it.
function statusKey(pct: number): TranslationKey {
  if (pct >= 80) return "statusStrong";
  if (pct >= 65) return "statusDeveloping";
  return "statusNeedsImprovement";
}

function statusColor(pct: number) {
  if (pct >= 80) return "text-mint";
  if (pct >= 65) return "text-yellow";
  return "text-pink";
}

export function SubjectGradeBreakdown({
  lang,
  subjects,
  subjectTrend,
}: {
  lang: Lang;
  subjects: SubjectPrediction[];
  subjectTrend: Record<string, number>;
}) {
  const t = useT(lang);

  const weakest = [...subjects]
    .filter((s) => s.countsTowardOverall)
    .sort((a, b) => a.pct - b.pct)[0];

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        {t.subjectPerformance} 🎯
      </div>

      {weakest && (
        <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-pink/20 bg-pink/8 p-3">
          <span className="text-xl">⚠️</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-pink">
              {t[weakest.subject as TranslationKey] ?? weakest.subject}
            </div>
            <div className="text-[11px] font-bold text-pink/80">
              {weakest.pct}% · {t[statusKey(weakest.pct)]}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {subjects.map((s) => {
          const delta = subjectTrend[s.subject] ?? 0;
          return (
            <div
              key={s.subject}
              className="rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{SUBJECT_ICONS[s.subject] ?? "📚"}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold">
                    {t[s.subject as TranslationKey] ?? s.subject}
                  </div>
                  <div className={`text-[10px] font-extrabold ${statusColor(s.pct)}`}>
                    {t[statusKey(s.pct)]}
                    {delta !== 0 && (
                      <span className={delta > 0 ? "text-mint" : "text-pink"}>
                        {" "}
                        {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
                      </span>
                    )}
                  </div>
                  {!s.countsTowardOverall && (
                    <div className="text-[10px] font-bold text-muted">
                      {lang === "en" ? "not counted in overall" : "មិនរាប់បញ្ចូលក្នុងសរុប"}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`font-heading text-lg font-extrabold ${gradeColor(s.grade)}`}
                  >
                    {s.grade}
                  </div>
                  <div className="text-[10px] font-extrabold text-muted">
                    {s.pct}%
                  </div>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-purple/8">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${gradeBarColor(s.grade)}`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

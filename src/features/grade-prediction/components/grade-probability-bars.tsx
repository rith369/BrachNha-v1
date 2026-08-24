import type { Lang } from "@/types";
import { useT } from "@/data/translations";

const GRADE_ORDER = ["A", "B", "C", "D", "E"];

function barColor(grade: string) {
  if (grade === "A" || grade === "B") return "bg-mint";
  if (grade === "C") return "bg-yellow";
  return "bg-pink";
}

export function GradeProbabilityBars({
  lang,
  probabilities,
  mostLikelyGrade,
}: {
  lang: Lang;
  probabilities: Record<string, number>;
  mostLikelyGrade: string;
}) {
  const t = useT(lang);

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel-sm">
      <div className="mb-3 font-heading text-sm font-extrabold">
        📊 {t.gradeProbability}
      </div>
      <div className="flex flex-col gap-2.5">
        {GRADE_ORDER.map((grade) => {
          const pct = probabilities[grade] ?? 0;
          const isMostLikely = grade === mostLikelyGrade;
          return (
            <div key={grade} className="flex items-center gap-3">
              <div
                className={`w-4 shrink-0 font-heading text-sm font-extrabold ${
                  isMostLikely ? "text-purple" : "text-muted"
                }`}
              >
                {grade}
              </div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-purple/8">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(grade)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={`w-10 shrink-0 text-right text-xs font-extrabold transition-all duration-500 ${
                  isMostLikely ? "text-purple" : "text-muted"
                }`}
              >
                {pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

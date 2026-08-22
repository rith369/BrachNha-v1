import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { TargetComparison } from "@/utils/gradePrediction";

const R = 40;
const CIRC = 2 * Math.PI * R;

export function PredictionHero({
  lang,
  mostLikelyGrade,
  mostLikelyPct,
  targetGrade,
  daysRemaining,
  comparison,
}: {
  lang: Lang;
  mostLikelyGrade: string;
  mostLikelyPct: number;
  targetGrade: string;
  daysRemaining: number;
  comparison: TargetComparison;
}) {
  const t = useT(lang);
  const dash = (mostLikelyPct / 100) * CIRC;

  const comparisonText =
    comparison === "ahead"
      ? lang === "en"
        ? `Ahead of your ${targetGrade} target 🎉`
        : `លើសពីគោលដៅ ${targetGrade} របស់អ្នក 🎉`
      : comparison === "behind"
        ? lang === "en"
          ? `Below your ${targetGrade} target`
          : `ក្រោមគោលដៅ ${targetGrade} របស់អ្នក`
        : lang === "en"
          ? `On track for your ${targetGrade} target`
          : `តាមគោលដៅ ${targetGrade} របស់អ្នក`;

  return (
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
          🎯 {t.brachNhaEstimate}
        </div>
        {daysRemaining > 0 && (
          <div className="text-[11px] font-extrabold text-purple">
            {daysRemaining} {t.daysRemaining}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
            {t.mostLikelyGrade}
          </div>
          <div className="font-heading text-5xl font-bold transition-all duration-500">
            {mostLikelyGrade}
            <span className="ml-1.5 text-lg text-muted">{mostLikelyPct}%</span>
          </div>
          <div className="mt-1 text-xs font-extrabold text-purple">
            {comparisonText}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <span>{lang === "en" ? "Target Grade" : "ពិន្ទុគោលដៅ"}:</span>
            <span className="font-heading text-sm font-extrabold text-yellow">
              {targetGrade || "—"}
            </span>
          </div>
        </div>

        <div className="relative size-25 shrink-0">
          <svg
            viewBox="0 0 100 100"
            width="100"
            height="100"
            className="-rotate-90"
          >
            <defs>
              <linearGradient
                id="predictionGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--color-pink)" />
                <stop offset="50%" stopColor="var(--color-purple)" />
                <stop offset="100%" stopColor="var(--color-blue)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="rgba(139,43,226,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="url(#predictionGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-heading text-2xl font-bold">
              {mostLikelyGrade}
            </div>
            <div className="text-[9px] font-bold text-muted">
              {mostLikelyPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

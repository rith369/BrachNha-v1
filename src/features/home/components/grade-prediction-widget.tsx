import { Link } from "react-router";
import { Gauge, ChevronRight } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { useGradePrediction } from "@/features/grade-prediction/use-grade-prediction";

// Reads the exact same hook as the full Grade Prediction page, so this card
// never shows a different grade than the page it links to. Before there is
// enough work to predict from it says how much is left instead of a grade.
export function GradePredictionWidget() {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);
  const { ready, missing, prediction } = useGradePrediction();
  const { mostLikely, probabilities } = prediction;
  const pct = probabilities[mostLikely] ?? 0;

  return (
    <Link
      to="/grade-prediction"
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-panel transition-transform active:scale-[0.99]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-[var(--brand-purple)]">
        <Gauge className="size-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
          🎯 {t.gradePrediction}
        </div>
        {ready ? (
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl font-extrabold">{mostLikely}</span>
            <span className="text-xs font-bold text-muted">
              {t.mostLikelyGrade} · {pct}%
            </span>
          </div>
        ) : (
          <div className="text-xs font-bold text-muted">
            {lang === "en"
              ? `Answer ${missing} more questions to see it`
              : `ឆ្លើយសំណួរ ${missing} ទៀត ដើម្បីមើលការព្យាករណ៍`}
          </div>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
    </Link>
  );
}

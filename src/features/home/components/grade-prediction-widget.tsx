import { Link } from "react-router";
import { Gauge, ChevronRight } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { computeBaselinePrediction } from "@/features/grade-prediction/demo-data";

// Reads the exact same baseline as the full Grade Prediction page
// (computeBaselinePrediction() in that feature's demo-data.ts) so this
// card never shows a different number than the page it links to.
export function GradePredictionWidget() {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  const { mostLikely, probabilities } = computeBaselinePrediction();
  const pct = probabilities[mostLikely] ?? 0;

  return (
    <Link
      to="/grade-prediction"
      className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)] transition-transform active:scale-[0.99]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-pink/15 via-purple/15 to-blue/15">
        <Gauge className="size-5 text-purple" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
          🎯 {t.gradePrediction}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-xl font-extrabold">
            {mostLikely}
          </span>
          <span className="text-xs font-bold text-muted">
            {t.mostLikelyGrade} · {pct}%
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
    </Link>
  );
}

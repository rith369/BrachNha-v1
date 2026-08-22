import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { computeGradePrediction, compareToTarget } from "@/utils/gradePrediction";
import { parseMonthsLeft } from "@/utils/roadmap";
import { useGradePrediction } from "../use-grade-prediction";
import { recommendations, consistencyPct } from "../demo-data";
import { PredictionHero } from "./prediction-hero";
import { GradeProbabilityBars } from "./grade-probability-bars";
import { PredictionTrendChart } from "./prediction-trend-chart";
import { SubjectGradeBreakdown } from "./subject-grade-breakdown";
import { PredictionFactors } from "./prediction-factors";
import { AiInsight } from "./ai-insight";
import { RecommendedActions } from "./recommended-actions";
import { PredictionUpdatedBanner } from "./prediction-updated-banner";
import type { TranslationKey } from "@/data/translations";

export function GradePredictionView() {
  const { lang, userData, userLanguage } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userData: s.userData,
      userLanguage: s.userLanguage,
    }))
  );
  const t = useT(lang);
  const languageKey = userLanguage || "english";

  const {
    subjectPerformance,
    subjectTrend,
    prediction,
    trendChartData,
    lastChange,
    simulateQuiz,
    dismissChange,
  } = useGradePrediction();

  const { subjects } = computeGradePrediction(subjectPerformance, languageKey);
  const comparison = compareToTarget(prediction.mostLikely, userData.grade);
  const daysRemaining = parseMonthsLeft(userData.months, 4) * 30;

  const core = subjects.filter((s) => s.countsTowardOverall);
  const weakest = [...core].sort((a, b) => a.pct - b.pct)[0];
  const weakestName = weakest
    ? (t[weakest.subject as TranslationKey] ?? weakest.subject)
    : "—";

  return (
    <div className="flex flex-col gap-4">
      {lastChange && (
        <PredictionUpdatedBanner
          lang={lang}
          change={lastChange}
          onDismiss={dismissChange}
        />
      )}

      <PredictionHero
        lang={lang}
        mostLikelyGrade={prediction.mostLikely}
        mostLikelyPct={prediction.probabilities[prediction.mostLikely] ?? 0}
        targetGrade={userData.grade}
        daysRemaining={daysRemaining}
        comparison={comparison}
      />

      <GradeProbabilityBars
        lang={lang}
        probabilities={prediction.probabilities}
        mostLikelyGrade={prediction.mostLikely}
      />

      <PredictionTrendChart lang={lang} data={trendChartData} />

      <SubjectGradeBreakdown lang={lang} subjects={subjects} subjectTrend={subjectTrend} />

      <PredictionFactors
        lang={lang}
        subjects={subjects}
        consistencyPct={consistencyPct}
        trendDeltaPct={weakest ? (subjectTrend[weakest.subject] ?? 0) : 0}
      />

      <AiInsight
        lang={lang}
        mostLikelyGrade={prediction.mostLikely}
        mostLikelyPct={prediction.probabilities[prediction.mostLikely] ?? 0}
        subjects={subjects}
        subjectTrend={subjectTrend}
      />

      <RecommendedActions
        lang={lang}
        actions={recommendations}
        limitingFactorName={weakestName}
        onSimulate={simulateQuiz}
      />
    </div>
  );
}

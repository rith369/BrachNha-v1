import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { compareToTarget } from "@/utils/gradePrediction";
import { daysUntilExam } from "@/utils/exam-date";
import { useStudyFeed } from "@/features/home/use-study-feed";
import { useGradePrediction } from "../use-grade-prediction";
import { PredictionHero } from "./prediction-hero";
import { GradeProbabilityBars } from "./grade-probability-bars";
import { PredictionTrendChart } from "./prediction-trend-chart";
import { SubjectGradeBreakdown } from "./subject-grade-breakdown";
import { PredictionFactors } from "./prediction-factors";
import { AiInsight } from "./ai-insight";
import { RecommendedActions, type RecommendedAction } from "./recommended-actions";
import { PredictionEmpty } from "./prediction-empty";
import type { TranslationKey } from "@/data/translations";
import type { Lang } from "@/types";

/** How many rows the actions card shows. */
const ACTIONS = 3;

function historyLabel(weeksAgo: number, lang: Lang): string {
  if (weeksAgo === 0) return lang === "en" ? "Now" : "ឥឡូវ";
  return lang === "en" ? `-${weeksAgo} wk` : `-${weeksAgo} សប្ដាហ៍`;
}

export function GradePredictionView() {
  const { lang, userData } = useBrachNhaStore(
    useShallow((s) => ({ lang: s.lang, userData: s.userData }))
  );
  const t = useT(lang);
  const real = useGradePrediction();
  const feed = useStudyFeed();

  // Before there is enough work, the page is one honest card rather than a
  // grade computed from nothing.
  if (!real.ready) {
    return (
      <PredictionEmpty
        lang={lang}
        answered={real.answered}
        missing={real.missing}
        href={feed.items[0]?.href ?? "/lessons"}
      />
    );
  }

  const { prediction, subjects, subjectTrend } = real;
  const comparison = compareToTarget(prediction.mostLikely, userData.grade);
  const daysRemaining = daysUntilExam();

  const core = subjects.filter((s) => s.countsTowardOverall);
  const weakest = [...core].sort((a, b) => a.pct - b.pct)[0];
  // A plain string, not `weakest.subject` read inside the closures below: the
  // React Compiler narrows a closure's dependency to the property path it
  // reads and checks it where the closure is built, above any guard
  // (the review-session.tsx crash). `weakest` is undefined when no core
  // subject has a score yet.
  const weakId = weakest?.subject ?? null;
  const weakestName = weakId ? (t[weakId as TranslationKey] ?? weakId) : null;

  // The weakest subject's next content first, then whatever the feed ranks
  // next, so the card is never empty while any content is left.
  const ranked = [
    ...feed.items.filter((i) => i.subject === weakId),
    ...feed.items.filter((i) => i.subject !== weakId),
  ];
  const actions: RecommendedAction[] = ranked.slice(0, ACTIONS).map((i) => ({
    id: i.id,
    kind: i.kind,
    title: i.title,
    context: i.context,
    href: i.href,
  }));
  if (actions.length === 0) {
    actions.push({
      id: "page:practice",
      kind: "page",
      title: lang === "en" ? "Practice" : "Flashcard និង Quiz",
      context: "",
      href: "/practice",
    });
  }

  const trendData = real.history.map((h) => ({
    week: historyLabel(h.weeksAgo, lang),
    score: h.pct,
  }));

  return (
    // Two columns from md — see pages/progress.tsx for why the cards need no
    // internal changes. The hero spans the full width: it is the headline this
    // whole page explains.
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <PredictionHero
          lang={lang}
          mostLikelyGrade={prediction.mostLikely}
          mostLikelyPct={prediction.probabilities[prediction.mostLikely] ?? 0}
          targetGrade={userData.grade}
          daysRemaining={daysRemaining}
          comparison={comparison}
        />
      </div>

      <GradeProbabilityBars
        lang={lang}
        probabilities={prediction.probabilities}
        mostLikelyGrade={prediction.mostLikely}
      />

      {/* Absent rather than a one-point "trend": the line needs two weeks with
          enough work in them. RecommendedActions takes its slot meanwhile. */}
      {trendData.length > 0 ? (
        <PredictionTrendChart lang={lang} data={trendData} />
      ) : (
        <RecommendedActions
          lang={lang}
          actions={actions}
          limitingFactorName={weakestName}
        />
      )}

      {/* Same reasoning as SubjectBreakdown on pages/progress.tsx: this list
          grows with the number of subjects, so it spans full width. */}
      {subjects.length > 0 && (
        <div className="md:col-span-2">
          <SubjectGradeBreakdown
            lang={lang}
            subjects={subjects}
            subjectTrend={subjectTrend}
          />
        </div>
      )}

      <PredictionFactors
        lang={lang}
        subjects={subjects}
        consistencyPct={real.consistencyPct}
        trendDeltaPct={real.trendDeltaPct}
      />

      <AiInsight
        lang={lang}
        mostLikelyGrade={prediction.mostLikely}
        mostLikelyPct={prediction.probabilities[prediction.mostLikely] ?? 0}
        subjects={subjects}
        subjectTrend={subjectTrend}
      />

      {trendData.length > 0 && (
        <div className="md:col-span-2">
          <RecommendedActions
            lang={lang}
            actions={actions}
            limitingFactorName={weakestName}
          />
        </div>
      )}
    </div>
  );
}

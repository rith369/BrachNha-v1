import { useMemo, useState } from "react";
import {
  quizResults as baseQuizResults,
  mockExamAttempts,
  subjectPerformance as baseSubjectPerformance,
  subjectTrend as baseSubjectTrend,
  recentTrendDeltaPct as baseTrendDeltaPct,
  computePrediction,
  predictionHistory,
  type QuizResult,
} from "./demo-data";

export type SimulationDirection = "good" | "poor";

export interface PredictionChange {
  grade: string;
  fromPct: number;
  toPct: number;
  direction: SimulationDirection;
}

const SIMULATE_PHYSICS_PCT = { good: 90, poor: 40 } as const;
const TREND_NUDGE = { good: 6, poor: -6 } as const;
const SUBJECT_NUDGE = { good: 5, poor: -5 } as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// All simulation state lives here, local to this hook instance — nothing
// is persisted or written back to demo-data.ts or the real store. Every
// section of the Grade Prediction page (and only that page — Home's
// dashboard card reads the baseline directly from demo-data.ts instead)
// shares this single hook so numbers never disagree with each other.
export function useGradePrediction() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>(baseQuizResults);
  const [trendDeltaPct, setTrendDeltaPct] = useState(baseTrendDeltaPct);
  const [physicsPct, setPhysicsPct] = useState(baseSubjectPerformance.physics);
  const [physicsTrend, setPhysicsTrend] = useState(baseSubjectTrend.physics);
  const [lastChange, setLastChange] = useState<PredictionChange | null>(null);

  const subjectPerformance = useMemo<Record<string, number>>(
    () => ({ ...baseSubjectPerformance, physics: physicsPct }),
    [physicsPct]
  );
  const subjectTrend = useMemo<Record<string, number>>(
    () => ({ ...baseSubjectTrend, physics: physicsTrend }),
    [physicsTrend]
  );

  const prediction = useMemo(
    () => computePrediction(quizResults, mockExamAttempts, trendDeltaPct),
    [quizResults, trendDeltaPct]
  );

  const trendChartData = useMemo(
    () => [
      ...predictionHistory,
      { week: "Today", aProbability: prediction.probabilities.A ?? 0 },
    ],
    [prediction]
  );

  function simulateQuiz(direction: SimulationDirection) {
    const before = prediction;
    const pct = SIMULATE_PHYSICS_PCT[direction];

    setQuizResults((qs) => [
      ...qs,
      { subject: "physics", pct, date: new Date().toISOString().slice(0, 10) },
    ]);
    setTrendDeltaPct((d) => clamp(d + TREND_NUDGE[direction], -20, 20));
    setPhysicsPct((p) => clamp(p + SUBJECT_NUDGE[direction], 0, 100));
    setPhysicsTrend((t) => clamp(t + SUBJECT_NUDGE[direction], -30, 30));

    // Compare the probability of whichever grade was most likely *before*
    // this simulation — always a meaningful, truthful delta regardless of
    // which specific grade the mock numbers happen to favor. Computed
    // directly (not read back from state, which updates asynchronously).
    const grade = before.mostLikely;
    const after = computePrediction(
      [...quizResults, { subject: "physics", pct, date: "" }],
      mockExamAttempts,
      clamp(trendDeltaPct + TREND_NUDGE[direction], -20, 20)
    );

    setLastChange({
      grade,
      fromPct: before.probabilities[grade] ?? 0,
      toPct: after.probabilities[grade] ?? 0,
      direction,
    });
  }

  function dismissChange() {
    setLastChange(null);
  }

  return {
    quizResults,
    subjectPerformance,
    subjectTrend,
    prediction,
    trendChartData,
    lastChange,
    simulateQuiz,
    dismissChange,
  };
}

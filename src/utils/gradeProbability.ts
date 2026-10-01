// Rule-based composite readiness model for the Grade Prediction prototype.
// This is NOT machine learning — it's a transparent, hand-tuned weighted
// average, deliberately simple so it can be swapped for a real model later
// without the UI changing shape. Every weight/constant below is a prototype
// assumption, not a scientifically validated figure.
//
// This module is intentionally data-agnostic — it just takes numbers and
// returns numbers, same convention as utils/gradePrediction.ts and
// utils/roadmap.ts. The real inputs are assembled in
// features/grade-prediction/real-prediction.ts.

import { GRADE_BANDS, pctToGrade } from "./gradePrediction";

// The first three are NULLABLE because a real student usually has not done
// all three kinds of work yet: someone who has answered fifty questions and
// sat no exam has no exam average, and 0 would claim they sat one and failed
// it. A null input is left out and the weights of the inputs that ARE present
// are scaled back up to 1, so the composite stays on the same 0-100 scale.
export interface PredictionInputs {
  quizPct: number | null; // practice accuracy, 0-100
  mockExamPct: number | null; // avg mock-exam / past-paper score, 0-100
  lessonCompletionPct: number | null; // % of written sections completed
  consistencyPct: number; // % of recent days with study activity
  trendDeltaPct: number; // recent quiz-accuracy slope, roughly -20..+20
}

// Prototype assumption from the spec: Quiz 30% / Mock Exam 35% /
// Lesson Completion 15% / Study Consistency 10% / Recent Trend 10%.
export const PREDICTION_WEIGHTS = {
  quiz: 0.3,
  mockExam: 0.35,
  lessonCompletion: 0.15,
  consistency: 0.1,
  trend: 0.1,
} as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// A recent-trend delta (e.g. "-5%" vs a few weeks ago) is converted to a
// 0-100 score centered on 50 (neutral) so it can be weighted alongside the
// other 0-100 inputs. Each 1pt of delta moves the trend score 2pts — a
// prototype assumption, not a validated conversion.
export function trendDeltaToScore(trendDeltaPct: number): number {
  return clamp(50 + trendDeltaPct * 2, 0, 100);
}

export function computeCompositeScore(inputs: PredictionInputs): number {
  const parts: [number | null, number][] = [
    [inputs.quizPct, PREDICTION_WEIGHTS.quiz],
    [inputs.mockExamPct, PREDICTION_WEIGHTS.mockExam],
    [inputs.lessonCompletionPct, PREDICTION_WEIGHTS.lessonCompletion],
    [inputs.consistencyPct, PREDICTION_WEIGHTS.consistency],
    [trendDeltaToScore(inputs.trendDeltaPct), PREDICTION_WEIGHTS.trend],
  ];
  let raw = 0;
  let weight = 0;
  for (const [value, w] of parts) {
    if (value === null) continue;
    raw += value * w;
    weight += w;
  }
  return Math.round(clamp(weight > 0 ? raw / weight : 0, 0, 100));
}

// Distance from each grade band's midpoint, mapped to a probability weight
// and normalized to sum to 100. Deterministic — the same composite score
// always yields the same distribution — and reuses GRADE_BANDS so the
// letter cutoffs never drift out of sync with utils/gradePrediction.ts.
const SPREAD = 20;

function bandMidpoint(index: number): number {
  const band = GRADE_BANDS[index];
  const nextMin = index === 0 ? 100 : GRADE_BANDS[index - 1].min;
  return (band.min + nextMin) / 2;
}

export function computeGradeProbabilities(
  compositeScore: number
): Record<string, number> {
  const weights = GRADE_BANDS.map((band, i) => {
    const distance = Math.abs(compositeScore - bandMidpoint(i));
    return { grade: band.grade, weight: Math.max(0, 1 - distance / SPREAD) };
  });

  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  if (total === 0) {
    // Composite score fell outside every band's spread (shouldn't happen
    // for 0-100 input, but fall back to the plain pctToGrade band).
    const fallback = pctToGrade(compositeScore);
    return Object.fromEntries(
      GRADE_BANDS.map((b) => [b.grade, b.grade === fallback ? 100 : 0])
    );
  }

  const rounded = weights.map((w) => ({
    grade: w.grade,
    pct: Math.round((w.weight / total) * 100),
  }));

  // Rounding can drift the sum a point or two off 100 — correct it on the
  // largest entry so the bars always add up to exactly 100%.
  const drift = 100 - rounded.reduce((sum, r) => sum + r.pct, 0);
  if (drift !== 0) {
    const largest = rounded.reduce((a, b) => (b.pct > a.pct ? b : a));
    largest.pct += drift;
  }

  return Object.fromEntries(rounded.map((r) => [r.grade, r.pct]));
}

export function mostLikelyGrade(probabilities: Record<string, number>): string {
  return Object.entries(probabilities).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

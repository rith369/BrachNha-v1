// Rule-based readiness model for Grade Prediction.
// This is NOT machine learning — it's a transparent, hand-tuned formula,
// deliberately simple so it can be swapped for a real model later without the
// UI changing shape. Every constant below is a prototype assumption, not a
// scientifically validated figure.
//
// This module is intentionally data-agnostic — it just takes numbers and
// returns numbers, same convention as utils/gradePrediction.ts and
// utils/roadmap.ts. The real inputs are assembled in
// features/grade-prediction/real-prediction.ts.

import { GRADE_BANDS } from "./gradePrediction";

// The first two are NULLABLE because a real student usually has not done both
// kinds of work yet: someone who has answered fifty questions and sat no exam
// has no exam average, and 0 would claim they sat one and failed it.
export interface PredictionInputs {
  quizPct: number | null; // practice accuracy, 0-100
  mockExamPct: number | null; // avg mock-exam / past-paper score, 0-100
  consistencyPct: number; // % of recent days with study activity
  trendDeltaPct: number; // recent quiz-accuracy change in points, roughly -20..+20
}

// THE SCORE IS HOW WELL THE STUDENT ANSWERS, and only that. Quiz accuracy and
// exam results are the only evidence of it, weighted 30:35 as the original
// spec had them. A missing one is left out and the other carries the score.
//
// Lesson completion used to be averaged in (15%) and is gone on purpose. It
// measures how much of the app's content a student has finished, not how well
// they know it, so a beginner answering 85% right was predicted an E. And its
// denominator is everything published, so every new lesson the team published
// lowered every student's predicted grade.
export const PREDICTION_WEIGHTS = {
  quiz: 0.3,
  mockExam: 0.35,
} as const;

// Trend and consistency used to be averaged in as 0-100 scores too, with a
// flat trend counting as 50, which pulled every student toward 50. They are
// NUDGES now, in points, each capped well under one 10-point grade band so
// neither can outweigh what the student actually answered.
export const TREND_POINTS_PER_POINT = 0.25;
export const MAX_TREND_POINTS = 5;
export const MAX_CONSISTENCY_POINTS = 3;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Improving adds points, slipping takes them away, flat changes nothing. */
export function trendAdjustment(trendDeltaPct: number): number {
  return clamp(
    trendDeltaPct * TREND_POINTS_PER_POINT,
    -MAX_TREND_POINTS,
    MAX_TREND_POINTS
  );
}

/** Studying on half the recent days is neutral; every day adds up to +3,
 *  none takes up to 3 away. */
export function consistencyAdjustment(consistencyPct: number): number {
  return ((clamp(consistencyPct, 0, 100) - 50) / 50) * MAX_CONSISTENCY_POINTS;
}

export function computeCompositeScore(inputs: PredictionInputs): number {
  const parts: [number | null, number][] = [
    [inputs.quizPct, PREDICTION_WEIGHTS.quiz],
    [inputs.mockExamPct, PREDICTION_WEIGHTS.mockExam],
  ];
  let raw = 0;
  let weight = 0;
  for (const [value, w] of parts) {
    if (value === null) continue;
    raw += value * w;
    weight += w;
  }
  // No evidence at all. real-prediction.ts never shows a prediction in this
  // state (it is not `ready`), so the number only has to be harmless.
  if (weight === 0) return 0;
  const score =
    raw / weight +
    trendAdjustment(inputs.trendDeltaPct) +
    consistencyAdjustment(inputs.consistencyPct);
  return Math.round(clamp(score, 0, 100));
}

// The composite is an estimate, not a measurement: the real exam score lands
// somewhere around it. That is modelled as a normal spread of SPREAD points
// either side, and each grade gets the share of the spread inside its band.
// A and F are open-ended, so the shares always add up to 100.
//
// This replaced "closeness to each band's midpoint", which stopped working
// once F became a band: F runs from 0 to 50, its midpoint is 25, and a score
// of 45 came out as 100% E. Deterministic either way, and it still reads the
// cutoffs from GRADE_BANDS so they cannot drift from utils/gradePrediction.ts.
const SPREAD = 8;

// Abramowitz & Stegun 7.1.26, accurate to about 1e-7, which is far finer than
// the whole percentages this feeds.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - poly * Math.exp(-a * a));
}

function shareBelow(cutoff: number, score: number): number {
  if (cutoff === Infinity) return 1;
  if (cutoff === -Infinity) return 0;
  return 0.5 * (1 + erf((cutoff - score) / (SPREAD * Math.SQRT2)));
}

export function computeGradeProbabilities(
  compositeScore: number
): Record<string, number> {
  const last = GRADE_BANDS.length - 1;
  const rounded = GRADE_BANDS.map((band, i) => {
    const upper = i === 0 ? Infinity : GRADE_BANDS[i - 1].min;
    const lower = i === last ? -Infinity : band.min;
    const share = shareBelow(upper, compositeScore) - shareBelow(lower, compositeScore);
    return { grade: band.grade, pct: Math.round(share * 100) };
  });

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

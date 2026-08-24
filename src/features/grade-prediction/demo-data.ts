// ============================================================
// DEMO DATA — Grade Prediction
// ------------------------------------------------------------
// Deliberately fake practice-quiz, mock-exam, and study-activity
// numbers, same convention as features/progress/demo-data.ts.
// This is the SINGLE SOURCE OF TRUTH for the feature: every
// component and the Home dashboard card reads only from here (or
// from computeBaselinePrediction() below), so numbers can never
// drift apart between pages.
//
// The store only tracks aggregate exam pct per attempt
// (ExamResult), not per-subject/per-topic accuracy or lesson
// completion, so there's no real signal to compute a prediction
// from yet. When that data exists (per-subject ExamResult
// breakdown, persisted lesson-quiz correctness, a real study-
// activity log), swap this file's numbers for live selectors off
// useBrachNhaStore — utils/gradeProbability.ts and every component
// here only consume the shapes below, so that's a one-file change.
// ============================================================

import {
  computeCompositeScore,
  computeGradeProbabilities,
  mostLikelyGrade,
  type PredictionInputs,
} from "@/utils/gradeProbability";

// Real Bac II subject weighting (utils/gradePrediction.ts) still drives the
// per-subject grades shown in Subject Performance — unchanged from before.
export const subjectPerformance: Record<string, number> = {
  khmer: 78,
  math: 88,
  physics: 65,
  chemistry: 72,
  biology: 91,
  history: 60,
  language: 82,
};

// Recent pct change per subject vs ~2 weeks ago — narrative/insight only,
// doesn't feed the official per-subject exam-weight calculation above.
export const subjectTrend: Record<string, number> = {
  khmer: 1,
  math: 3,
  physics: -8,
  chemistry: 0,
  biology: 2,
  history: -1,
  language: 1,
};

export interface QuizResult {
  subject: string;
  pct: number;
  date: string;
}

// Last 8 practice-quiz attempts, oldest first. Physics is the one subject
// trending down recently — matches subjectTrend.physics above and is the
// throughline for the AI Insight / Recommended Actions sections.
export const quizResults: QuizResult[] = [
  { subject: "math", pct: 85, date: "2026-07-14" },
  { subject: "biology", pct: 88, date: "2026-07-17" },
  { subject: "chemistry", pct: 74, date: "2026-07-21" },
  { subject: "khmer", pct: 80, date: "2026-07-24" },
  { subject: "language", pct: 84, date: "2026-07-28" },
  { subject: "physics", pct: 70, date: "2026-08-01" },
  { subject: "physics", pct: 66, date: "2026-08-05" },
  { subject: "physics", pct: 60, date: "2026-08-08" },
];

export interface MockExamAttempt {
  pct: number;
  date: string;
}

// Separate from the store's real examResults (which starts empty for a new
// user) — same reason Progress/Game use fake data: a blank chart would
// undersell the feature in a demo.
export const mockExamAttempts: MockExamAttempt[] = [
  { pct: 72, date: "2026-07-10" },
  { pct: 78, date: "2026-07-24" },
  { pct: 83, date: "2026-08-01" },
  { pct: 80, date: "2026-08-08" },
];

export const lessonCompletionPct = 78;

export const studyActivity = {
  activeDaysLast14: 11,
  totalDaysLast14: 14,
};

export const consistencyPct = Math.round(
  (studyActivity.activeDaysLast14 / studyActivity.totalDaysLast14) * 100
);

// Authored directly rather than derived from quizResults' noisy tail — a
// clean, tunable "recent performance is dipping a bit" signal, consistent
// with physics being the subject actually dipping.
export const recentTrendDeltaPct = -5;

// Weekly "Grade A probability" history for the trend chart — the 5th point
// (today) is always the live composite-derived value, appended by the
// hook/component, not stored here, so it can move during the interactive
// demo without editing this array.
export const predictionHistory = [
  { week: "Week 1", aProbability: 18 },
  { week: "Week 2", aProbability: 22 },
  { week: "Week 3", aProbability: 12 },
  { week: "Week 4", aProbability: 8 },
];

export function averagePct(values: { pct: number }[]): number {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, v) => sum + v.pct, 0) / values.length
  );
}

export function buildPredictionInputs(
  quizzes: QuizResult[],
  exams: MockExamAttempt[],
  trendDeltaPct: number
): PredictionInputs {
  return {
    quizPct: averagePct(quizzes),
    mockExamPct: averagePct(exams),
    lessonCompletionPct,
    consistencyPct,
    trendDeltaPct,
  };
}

export interface GradePredictionResult {
  compositeScore: number;
  probabilities: Record<string, number>;
  mostLikely: string;
}

export function computePrediction(
  quizzes: QuizResult[],
  exams: MockExamAttempt[],
  trendDeltaPct: number
): GradePredictionResult {
  const inputs = buildPredictionInputs(quizzes, exams, trendDeltaPct);
  const compositeScore = computeCompositeScore(inputs);
  const probabilities = computeGradeProbabilities(compositeScore);
  return { compositeScore, probabilities, mostLikely: mostLikelyGrade(probabilities) };
}

// The baseline (no simulation applied) prediction — used by both the Home
// dashboard card and the full page's initial state, so they always agree.
export function computeBaselinePrediction(): GradePredictionResult {
  return computePrediction(quizResults, mockExamAttempts, recentTrendDeltaPct);
}

export interface RecommendedAction {
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  duration: string;
  href: string;
}

export const recommendations: RecommendedAction[] = [
  {
    titleEn: "Review Physics fundamentals",
    titleKm: "review រូបវិទ្យាមូលដ្ឋាន",
    descriptionEn: "Your weakest subject — start with the topics behind your last 3 quiz dips.",
    descriptionKm: "មុខវិជ្ជាខ្សោយបំផុតរបស់អ្នក — ចាប់ផ្ដើមពីប្រធានបទដែលធ្លាក់ពិន្ទុថ្មីៗ។",
    duration: "40 min",
    href: "/lessons",
  },
  {
    titleEn: "Complete a Physics practice set",
    titleKm: "ធ្វើលំហាត់រូបវិទ្យា",
    descriptionEn: "15 questions, focused on your recent misses.",
    descriptionKm: "សំណួរ 15 ផ្ដោតលើចំណុចខុសថ្មីៗ។",
    duration: "30 min",
    href: "/exam",
  },
  {
    titleEn: "Take a full Mock Exam",
    titleKm: "ធ្វើតេស្តប្រឡងសាកល្បង",
    descriptionEn: "Refresh your mock-exam average with a current attempt.",
    descriptionKm: "កែពិន្ទុមធ្យមប្រឡងសាកល្បងរបស់អ្នកជាមួយការប៉ុនប៉ងថ្មី។",
    duration: "60 min",
    href: "/exam",
  },
];

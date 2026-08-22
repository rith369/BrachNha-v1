// Rule-based Bac II grade predictor: maps per-subject practice-quiz
// performance (0-100%) to a predicted letter grade, weighted by each
// subject's real exam importance. Same "pure function" convention as
// utils/roadmap.ts — no React/store imports here.

// Official MoEYS Bac II Science-track max-score table (2026 sitting).
// Grade bands are simply % of a subject's own max score, applied
// uniformly: 50/60/70/80/90 -> E/D/C/B/A. The source table confirms
// this exactly (e.g. math's B cutoff of 100 points = 80% of its 125 max).
export const SUBJECT_MAX_SCORE: Record<string, number> = {
  khmer: 75,
  math: 125,
  physics: 75,
  chemistry: 75,
  biology: 75,
  history: 50,
};

// Foreign language is graded separately in the real exam and excluded
// from the core total — its 50-point max isn't part of the 475-point
// sum used to determine the overall A-E grade.
export const FOREIGN_LANGUAGE_MAX = 50;

export const CORE_TOTAL_MAX = Object.values(SUBJECT_MAX_SCORE).reduce(
  (sum, max) => sum + max,
  0
);

// Exported so other prediction logic (e.g. utils/gradeProbability.ts) reuses
// these exact cutoffs instead of maintaining a second, potentially-drifting
// copy of the same official bands.
export const GRADE_BANDS: { min: number; grade: string }[] = [
  { min: 90, grade: "A" },
  { min: 80, grade: "B" },
  { min: 70, grade: "C" },
  { min: 60, grade: "D" },
  { min: 50, grade: "E" },
];

// Below 50% floors at "E" — the app's target-grade scale doesn't offer
// a fail grade, so there's nothing lower to predict into.
export function pctToGrade(pct: number): string {
  const band = GRADE_BANDS.find((b) => pct >= b.min);
  return band ? band.grade : "E";
}

export interface SubjectPrediction {
  subject: string;
  pct: number;
  grade: string;
  maxScore: number;
  countsTowardOverall: boolean;
}

export interface GradePrediction {
  overallPct: number;
  overallGrade: string;
  subjects: SubjectPrediction[];
}

export function computeGradePrediction(
  subjectPerformance: Record<string, number>,
  languageSubjectKey: string
): GradePrediction {
  const coreSubjects = Object.keys(SUBJECT_MAX_SCORE);

  const subjects: SubjectPrediction[] = coreSubjects.map((subject) => {
    const pct = subjectPerformance[subject] ?? 0;
    return {
      subject,
      pct,
      grade: pctToGrade(pct),
      maxScore: SUBJECT_MAX_SCORE[subject],
      countsTowardOverall: true,
    };
  });

  const languagePct = subjectPerformance.language ?? 0;
  subjects.push({
    subject: languageSubjectKey,
    pct: languagePct,
    grade: pctToGrade(languagePct),
    maxScore: FOREIGN_LANGUAGE_MAX,
    countsTowardOverall: false,
  });

  const rawScore = coreSubjects.reduce(
    (sum, subject) =>
      sum +
      ((subjectPerformance[subject] ?? 0) / 100) * SUBJECT_MAX_SCORE[subject],
    0
  );
  const overallPct = Math.round((rawScore / CORE_TOTAL_MAX) * 100);

  return { overallPct, overallGrade: pctToGrade(overallPct), subjects };
}

const GRADE_ORDER = ["A", "B", "C", "D", "E"];

export type TargetComparison = "ahead" | "on-track" | "behind";

export function compareToTarget(
  predictedGrade: string,
  targetGrade: string
): TargetComparison {
  const predictedIdx = GRADE_ORDER.indexOf(predictedGrade);
  const targetIdx = GRADE_ORDER.indexOf(targetGrade);
  if (predictedIdx === -1 || targetIdx === -1 || predictedIdx === targetIdx) {
    return "on-track";
  }
  return predictedIdx < targetIdx ? "ahead" : "behind";
}

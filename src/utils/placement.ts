import { MOCK_QS } from "@/data/questions";
import type { MockExamQuestion } from "@/types";

// The 3 "foundation" subjects that get test-backed weakness detection —
// matches CLAUDE.md's "we teach lesson and also foundation... math, physic,
// chemical foundation" scope. Biology is deliberately excluded here even
// though MOCK_QS happens to have biology questions too — this is a product
// scope choice, not a content gap.
export const FOUNDATION_SUBJECTS = ["math", "physics", "chemistry"] as const;
export type FoundationSubject = (typeof FOUNDATION_SUBJECTS)[number];

export const PLACEMENT_PASS_PCT = 80;

export function getQuestionsBySubject(subject: string): MockExamQuestion[] {
  return MOCK_QS.filter((q) => q.subj === subject);
}

export function scorePlacementTest(
  questions: MockExamQuestion[],
  answers: Record<number, string>
): { score: number; total: number; pct: number } {
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correct) score++;
  });
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return { score, total, pct };
}

export function isWeakFromScore(pct: number): boolean {
  return pct < PLACEMENT_PASS_PCT;
}

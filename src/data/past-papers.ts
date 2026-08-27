import type { ExamQuestion } from "@/types";

/**
 * REAL MoEYS Bac II past papers — the content slot for the Study-style
 * "វិញ្ញាសារឆ្នាំចាស់" tab on /exam.
 *
 * It is EMPTY today, and that is the normal state rather than a bug: the exam
 * sessions and their subject cards are DERIVED from the subject catalog (see
 * features/exam/papers.ts), so the whole screen renders finished-looking cards
 * with no questions behind them. Adding one entry below turns that card on —
 * there is no other code change, and a card's state can never disagree with the
 * content it describes, the same discipline as lessonCountFor() counting LESSONS
 * rather than carrying an authored number.
 *
 * NOTE this file deliberately imports nothing from features/ — data/ sits at the
 * bottom of the graph, exactly as data/lessons.ts does. The typed
 * paperKey(year, subjectId) helper lives in features/exam/papers.ts; here the
 * record is keyed by plain string.
 */

/**
 * The exam sessions offered, newest first. Order IS the chip order.
 *
 * A plain number because Bac II is one sitting per year today. If a year ever
 * needs two, this becomes `{ year: number; label: string }[]` and only this file
 * plus papersForYear()'s signature change — the chips, the heading and every
 * card derive from it.
 */
export const PAST_PAPER_YEARS: readonly number[] = [2025, 2024, 2023, 2022, 2021];

/**
 * Questions per paper, keyed `"{year}-{subjectId}"` — e.g. `"2025-math"`.
 * subjectId matches the SubjectId union in features/lessons/subjects.ts.
 *
 * A missing key means "this paper has no content yet", which is every paper
 * right now. Do NOT add an authored question count or duration alongside these:
 * the count is questions.length, and a duration label on a paper the app has no
 * timer for is a promise it can't keep.
 */
export const PAST_PAPER_QUESTIONS: Record<string, ExamQuestion[]> = {
  // "2025-math": [ { q: { en: "...", km: "..." }, correct: "...", options: [...] } ],
};

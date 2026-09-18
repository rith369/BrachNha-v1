import type { PastPaperContent } from "@/types";
import { ENGLISH_2025 } from "./papers/english-2025";

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
 * The papers themselves, keyed `"{year}-{subjectId}"` — e.g. `"2025-english"`.
 * subjectId matches the SubjectId union in features/lessons/subjects.ts.
 *
 * A missing key means "this paper has no content yet", which is still every
 * paper but one. ONE ENTRY TURNS A CARD ON: `papersForYear()` flattens a
 * paper's sections into the `ExamQuestion[]` that `ExamPaperCard`'s
 * `questions.length > 0` rule already reads, so nothing else in the screen
 * changes and a card can never claim content the app lacks.
 *
 * Do NOT author a question count beside a paper — it is derived from the
 * sections. A DURATION, on the other hand, is now real: `minutes` comes off the
 * paper's own printed header, and the runner counts it down. That is not the
 * invented "180 នាទី" label this file used to warn against; a paper with no
 * printed time simply omits it.
 *
 * Each paper lives in its own file under `papers/` — one real paper is ~350
 * lines of transcribed content, explanations included.
 */
export const PAST_PAPERS: Record<string, PastPaperContent> = {
  "2025-english": ENGLISH_2025,
};

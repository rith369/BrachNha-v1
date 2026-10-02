import { SECTION_CONTENT } from "@/data/sections";
import { PRACTICE_QUIZZES } from "@/data/practice";
import { PAST_PAPERS } from "@/data/past-papers";
import { scorePaper } from "@/features/exam/paper-scoring";
import { pastPaperByKey } from "@/features/exam/papers";
import { findSubject } from "@/features/lessons/subjects";
import { parseContentRef, type ContentRefKind } from "@/utils/content-ref";

/**
 * A mistake report's content_ref, turned back into the question it names, so
 * /admin/mistakes shows the real prompt, options, marked answer and
 * explanation instead of a code.
 *
 * Reached ONLY from the lazy /admin/mistakes chunk. It imports the whole
 * question corpus (sections, practice quizzes, past papers), which must never
 * be pulled into the entry chunk; the student-side button builds refs with
 * utils/content-ref.ts alone.
 *
 * EVERY LOOKUP IS GUARDED with Object.hasOwn, never `in` or a truthiness test:
 * these are plain object literals, so "constructor" is `in` them and
 * "toString" resolves to a function. A ref comes from a student's device, so
 * it is untrusted input even after the database's shape check.
 *
 * Returns null when the question no longer exists (renumbered, moved, removed),
 * which the page says plainly rather than guessing.
 */

export interface ResolvedQuestion {
  kind: ContentRefKind;
  /** What it belongs to: the section's or paper's title, or the quiz's subject
   *  and number. Khmer, because the content is. */
  title: string;
  /** 1-based, for "Question 3". */
  number: number;
  /** Sections only: 0 for the first quiz on the page, 1 for the second. */
  step?: number;
  /** The whole exercise above a past-paper part, when the paper prints one. */
  statement?: string;
  scenario?: string;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  /** Where the question lives in the app, for "Open it in the app". */
  link: string;
}

export function resolveContentRef(ref: string): ResolvedQuestion | null {
  const parsed = parseContentRef(ref);
  if (!parsed) return null;
  const { kind, key, item } = parsed;

  if (kind === "section") {
    if (!Object.hasOwn(SECTION_CONTENT, key)) return null;
    const m = /^([01])-(\d{1,3})$/.exec(item);
    if (!m) return null;
    const step = Number(m[1]);
    const index = Number(m[2]);
    const content = SECTION_CONTENT[key];
    const list = (step === 0 ? content.quiz : content.quizHarder) ?? [];
    const q = list[index];
    if (!q) return null;
    return {
      kind,
      title: content.title,
      number: index + 1,
      step,
      scenario: q.scenario,
      prompt: q.q,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
      link: `/sections/${key}`,
    };
  }

  if (kind === "quiz") {
    if (!Object.hasOwn(PRACTICE_QUIZZES, key)) return null;
    if (!/^\d{1,3}$/.test(item)) return null;
    const index = Number(item);
    const q = PRACTICE_QUIZZES[key][index];
    if (!q) return null;
    // "math-1-1-1": the subject, then the numbers the quiz path prints.
    const [subjectId, ...numbers] = key.split("-");
    const subject = findSubject(subjectId);
    return {
      kind,
      title: `${subject?.name ?? subjectId} ${numbers.join(".")}`,
      number: index + 1,
      scenario: q.scenario,
      prompt: q.q,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
      link: `/practice/quiz/${subjectId}/${numbers.join("-")}`,
    };
  }

  // A past paper. scorePaper with no answers lists every question with its
  // prompt, marked answer and explanation, in the review's own words.
  if (!Object.hasOwn(PAST_PAPERS, key)) return null;
  const content = PAST_PAPERS[key];
  const scored = scorePaper(content, {});
  for (const section of scored.sections) {
    const at = section.items.findIndex((i) => i.id === item);
    if (at === -1) continue;
    const reviewItem = section.items[at];
    const printed = content.sections.find((s) => s.id === section.id);
    const options =
      printed?.gapFill?.wordBank ??
      printed?.questions?.find((q) => q.id === item)?.options ??
      [];
    return {
      kind,
      title: pastPaperByKey(key)?.title ?? key,
      number: at + 1,
      statement: section.statement,
      prompt: reviewItem.prompt,
      options,
      correct: reviewItem.correct,
      explanation: reviewItem.explanation,
      link: `/exam/subjects/${key}`,
    };
  }
  return null;
}

import type { PaperBody, QuizQuestionBody, SectionBody } from "@/types";
import { scorePaper } from "@/features/exam/paper-scoring";
import { paperTitle, parsePaperKey, toPastPaperContent } from "@/features/exam/papers";
import { findSubject } from "@/features/lessons/subjects";
import { parseContentRef, type ContentRefKind } from "@/utils/content-ref";

/**
 * A mistake report's content_ref, turned back into the question it names, so
 * /admin/mistakes shows the real prompt, options, marked answer and
 * explanation instead of a code.
 *
 * Every kind a report can name lives in the DATABASE now (practice quizzes
 * since stage 1, lesson sections and past papers since step B of
 * docs/plans/sections-and-papers-in-database.md), so the page passes the
 * published bodies in (lib/content.ts's useAllBodies) and every resolved
 * question gets an Edit link to /admin/content, opened at that question.
 * "Fixed" on the mistakes page then means fixed there.
 *
 * Reached ONLY from the lazy /admin/mistakes chunk.
 *
 * EVERY LOOKUP IS GUARDED with Object.hasOwn, never `in` or a truthiness test:
 * these are plain objects, so "constructor" is `in` them and "toString"
 * resolves to a function. A ref comes from a student's device, so it is
 * untrusted input even after the database's shape check.
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
  /** The question in the content editor. */
  edit?: string;
}

/** The published bodies of each kind a report can name, keyed by content key. */
export interface ContentSets {
  quiz: Record<string, QuizQuestionBody[]>;
  section: Record<string, SectionBody>;
  paper: Record<string, PaperBody>;
}

export function resolveContentRef(ref: string, sets: ContentSets): ResolvedQuestion | null {
  const parsed = parseContentRef(ref);
  if (!parsed) return null;
  const { kind, key, item } = parsed;

  if (kind === "section") {
    if (!Object.hasOwn(sets.section, key)) return null;
    const content = sets.section[key];
    const lists = [content.quiz ?? [], content.quizHarder ?? []];
    // A question's own id ("q3", unique across both quizzes) since sections
    // moved into the database; an older report names it by step and position.
    let step = -1;
    let index = -1;
    const old = /^([01])-(\d{1,3})$/.exec(item);
    if (old) {
      step = Number(old[1]);
      index = Number(old[2]);
    } else {
      for (let s = 0; s < lists.length && step === -1; s++) {
        const at = lists[s].findIndex((x) => x.id === item);
        if (at !== -1) {
          step = s;
          index = at;
        }
      }
    }
    const q = step >= 0 ? lists[step][index] : undefined;
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
      edit: `/admin/content/section/${key}?q=${encodeURIComponent(q.id)}`,
    };
  }

  if (kind === "quiz") {
    if (!Object.hasOwn(sets.quiz, key)) return null;
    const list = sets.quiz[key];
    // A question's own id ("q4") since quizzes moved into the database; an
    // older report names it by position ("3").
    const index = /^\d{1,3}$/.test(item) ? Number(item) : list.findIndex((x) => x.id === item);
    const q = index >= 0 ? list[index] : undefined;
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
      edit: `/admin/content/quiz/${key}?q=${encodeURIComponent(q.id)}`,
    };
  }

  // A past paper. scorePaper with no answers lists every question with its
  // prompt, marked answer and explanation, in the review's own words.
  if (!Object.hasOwn(sets.paper, key)) return null;
  const content = toPastPaperContent(sets.paper[key]);
  const meta = parsePaperKey(key);
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
      title: meta ? `${paperTitle(meta.subject)} ${meta.year}` : key,
      number: at + 1,
      statement: section.statement,
      prompt: reviewItem.prompt,
      options,
      correct: reviewItem.correct,
      explanation: reviewItem.explanation,
      link: `/exam/subjects/${key}`,
      edit: `/admin/content/paper/${key}?q=${encodeURIComponent(item)}`,
    };
  }
  return null;
}

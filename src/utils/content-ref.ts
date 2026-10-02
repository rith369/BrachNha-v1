/**
 * A CONTENT REF names one question without copying its text, for mistake
 * reports (supabase/migrations/20261002000005, `content_reports.content_ref`):
 *
 *   section:biology-3-1-1#0-2      a section-quiz question: step 0, index 2
 *   quiz:math-1-1-1#3              a practice-quiz question: index 3
 *   paper:2025-math#l1             a past-paper question: its own id
 *
 * A report therefore stays small, and the admin page shows whatever the
 * question says TODAY, which is what someone checking a fix needs.
 *
 * Built here and parsed here, so the student's button and the admin page can
 * never disagree on the shape. REF_PATTERN mirrors the CHECK on the column and
 * the test in report_content(): a ref that fails it would be refused, so the
 * button hides itself instead of offering a report that cannot be sent.
 */

export type ContentRefKind = "section" | "quiz" | "paper";

export const REF_PATTERN = /^(section|quiz|paper):([a-z0-9-]{1,60})#([A-Za-z0-9_.-]{1,40})$/;

export function sectionRef(sectionId: string, step: number, index: number): string {
  return `section:${sectionId}#${step}-${index}`;
}

export function quizRef(contentKey: string, index: number): string {
  return `quiz:${contentKey}#${index}`;
}

export function paperRef(paperKey: string, questionId: string): string {
  return `paper:${paperKey}#${questionId}`;
}

export function isContentRef(ref: string): boolean {
  return ref.length <= 120 && REF_PATTERN.test(ref);
}

export interface ParsedRef {
  kind: ContentRefKind;
  /** The section id, the quiz's content key, or the paper key. */
  key: string;
  /** "0-2" for a section, "3" for a quiz, the question id for a paper. */
  item: string;
}

export function parseContentRef(ref: string): ParsedRef | null {
  if (ref.length > 120) return null;
  const m = REF_PATTERN.exec(ref);
  if (!m) return null;
  return { kind: m[1] as ContentRefKind, key: m[2], item: m[3] };
}

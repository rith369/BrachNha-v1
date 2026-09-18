import type { PastPaperContent, SkillId } from "@/types";
import type { PaperResult } from "@/lib/store";

/**
 * Marking a past paper, and turning the marks into the review the student
 * reads afterwards.
 *
 * PURE, and deliberately outside the components: the runner, the results screen
 * and the review list all have to agree about what a paper is out of, and three
 * components each counting for themselves is how they end up disagreeing —
 * the same reason features/practice/review.ts holds its queries rather than the
 * screens that render them.
 *
 * Answers are keyed by QUESTION ID (`"g3"`, `"r7"`), never by index. A paper is
 * sat over several steps and reviewed in a different order from the one it was
 * answered in; an index would re-point a saved answer the moment a section
 * gained a question.
 */

export type PaperAnswers = Record<string, string>;

/** One line in the review: what was asked, what they said, what was right. */
export interface ReviewItem {
  id: string;
  /** "សំណួរ 2" or "ចន្លោះ (7)" — what to call this item in the list. */
  label: string;
  /** The question, or the sentence around the gap. */
  prompt: string;
  correct: string;
  /** Undefined when the question was left blank (the clock, or a skip). */
  answer?: string;
  explanation: string;
  skill: SkillId;
  ok: boolean;
}

export interface SectionReview {
  id: string;
  title: string;
  score: number;
  total: number;
  items: ReviewItem[];
}

export interface PaperScore {
  score: number;
  total: number;
  pct: number;
  sections: SectionReview[];
}

/**
 * The sentence a gap sits in, so the review doesn't ask a student to remember
 * what "(7)" was about.
 *
 * Cut on sentence punctuation rather than on a character count: a fixed window
 * lands mid-word, and the whole point is that the line reads. The gap itself is
 * rendered as a blank, which is what it looked like while they answered.
 */
export function gapContext(body: string, number: number): string {
  const marker = `{${number}}`;
  const at = body.indexOf(marker);
  if (at === -1) return marker;

  const before = body.slice(0, at);
  const after = body.slice(at + marker.length);
  // Start after the previous sentence end (or paragraph break), stop at the next.
  const start = Math.max(
    before.lastIndexOf(". "),
    before.lastIndexOf("\n"),
    -1
  );
  const endRel = after.search(/[.?!](\s|$)/);
  const tail = endRel === -1 ? after : after.slice(0, endRel + 1);

  return `${before.slice(start + 1)}______${tail}`.trim();
}

/** Marks a paper and builds its review in one pass, so the two cannot diverge. */
export function scorePaper(
  content: PastPaperContent,
  answers: PaperAnswers
): PaperScore {
  const sections: SectionReview[] = content.sections.map((section) => {
    const items: ReviewItem[] = section.gapFill
      ? section.gapFill.gaps
          .filter((gap) => !gap.example)
          .map((gap) => {
            const answer = answers[gap.id];
            return {
              id: gap.id,
              label: `ចន្លោះ (${gap.number})`,
              prompt: gapContext(section.gapFill!.body, gap.number),
              correct: gap.correct,
              answer,
              explanation: gap.explanation,
              skill: gap.skill,
              ok: answer === gap.correct,
            };
          })
      : (section.questions ?? []).map((question, i) => {
          const answer = answers[question.id];
          return {
            id: question.id,
            label: `សំណួរ ${i + 1}`,
            prompt: question.q.en,
            correct: question.correct,
            answer,
            explanation: question.explanation,
            skill: question.skill,
            ok: answer === question.correct,
          };
        });

    return {
      id: section.id,
      title: section.title,
      score: items.filter((item) => item.ok).length,
      total: items.length,
      items,
    };
  });

  const score = sections.reduce((sum, s) => sum + s.score, 0);
  const total = sections.reduce((sum, s) => sum + s.total, 0);

  return {
    score,
    total,
    // Guarded because a paper with no scored questions is a legitimate shape
    // (an all-writing paper), and 0/0 would render NaN%.
    pct: total === 0 ? 0 : Math.round((score / total) * 100),
    sections,
  };
}

/**
 * One paper's attempts, NEWEST FIRST.
 *
 * A query over the store's flat `paperResults` list rather than a per-paper map:
 * the list is capped and small, every screen that wants it wants it sorted, and
 * one filter here is what stops the detail screen and its history tab from
 * counting differently. Sorted by the stored ISO instant, which is why
 * PaperResult keeps one rather than a day key.
 */
export function paperResultsFor(
  results: PaperResult[],
  paperKey: string
): PaperResult[] {
  return results
    .filter((r) => r.paperKey === paperKey)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** "45:09" — the countdown, and the time taken on the results screen. */
export function clockLabel(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

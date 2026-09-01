import type { PracticeCard, SectionQuestion } from "../types/index.js";

/**
 * Per-lesson flashcard decks and quizzes — the content slot behind the two tabs
 * on /practice.
 *
 * BOTH RECORDS ARE EMPTY TODAY, and that is the normal state rather than a bug.
 * The whole screen is DERIVED: the subject grid comes from the subject catalog
 * and the lesson list under it comes from chaptersFor() (the same chapter →
 * lesson structure the Study path renders), so /practice already shows a real,
 * finished-looking curriculum with no cards or questions behind any of it.
 * Adding one entry below turns that lesson row on — there is no other code
 * change, and no authored "available" flag that can drift from the content.
 *
 * Exactly the discipline PAST_PAPER_QUESTIONS follows in data/past-papers.ts;
 * read its header for the longer version of the same argument.
 *
 * NOTE this file deliberately imports nothing from features/ — data/ sits at the
 * bottom of the graph, as data/lessons.ts and data/past-papers.ts both do. The
 * typed practiceKey(subjectId, chapter, lesson) helper lives in
 * features/practice/practice.ts; here the records are keyed by plain string.
 */

/**
 * The key both records use: `"{subjectId}-{chapter}-{lesson}"` — e.g.
 * `"biology-3-1"` for ជំពូក ៣ · មេរៀនទី ១.
 *
 * That is the same prefix sectionsFor() already generates for section ids
 * (`"biology-3-1-1"` is section 1 of this lesson), so a lesson's practice
 * content and its sections share one numbering and cannot drift apart.
 */

/** Flashcards per lesson. A missing key means "no deck written yet". */
export const PRACTICE_DECKS: Record<string, PracticeCard[]> = {
  // "biology-3-1": [ { front: "…", back: "…" } ],
};

/**
 * Quiz questions per lesson. A missing key means "no quiz written yet".
 *
 * Typed as SectionQuestion — the curriculum question type — REUSED verbatim
 * rather than copied into a practice-specific twin. It is already Khmer-only
 * with the optional ស្ថានភាព scenario, and its `correct` is compared by string
 * equality, so the ក./ខ./គ./ឃ. prefix has to be repeated there exactly as it is
 * in the option. A parallel type would be a second thing to keep in step for no
 * gain.
 */
export const PRACTICE_QUIZZES: Record<string, SectionQuestion[]> = {
  // "biology-3-1": [ { q: "…", options: [...], correct: "…", explanation: "…" } ],
};

/** A lesson's deck, or an empty array when none is written. */
export function deckFor(key: string): PracticeCard[] {
  return PRACTICE_DECKS[key] ?? [];
}

/** A lesson's quiz, or an empty array when none is written. */
export function quizFor(key: string): SectionQuestion[] {
  return PRACTICE_QUIZZES[key] ?? [];
}

import type { ExamQuestion } from "@/types";

/**
 * Questions for a Game match — one subject per match, keyed by SubjectId
 * ("math", "biology", …), the same keying GENERATED_EXAM_QUESTIONS uses.
 *
 * EMPTY TODAY, AND THAT IS THE NORMAL STATE — the same discipline
 * PAST_PAPERS and PRACTICE_QUIZZES ship with. features/game/game.ts
 * derives one card per subject from the catalog regardless of what is in here,
 * so a subject with no entry below renders ឆាប់ៗនេះ and is not tappable. Adding
 * one entry turns that card on; there is no other code change.
 *
 * An entry here REPLACES the GENERATED_EXAM_QUESTIONS fallback for that subject
 * wholesale — the same rule SUBJECT_SESSIONS follows against chaptersFor()'s
 * derived path. See gameQuestionsFor() for the fallback and why it exists.
 *
 * DON'T author a question count, a duration, or a "playable" flag beside these.
 * The count is questions.length and the clock is one shared constant
 * (SECONDS_PER_QUESTION in features/game/game.ts) — the lessonCountFor() rule
 * that a card's number cannot drift from the content it describes.
 *
 * ExamQuestion rather than a game-specific type, deliberately: it is already
 * exactly {q: {en,km}, options, correct}, and a third question shape would mean
 * authoring the same questions twice. `subj` is left off — a match is ONE
 * subject end to end and carries its label on the match, which is the precise
 * case that field was made optional for. MockExamQuestion would be wrong here:
 * its MockExamSubject union cannot express a Khmer or History match, and the
 * catalog has cards for both.
 *
 * data/ imports nothing from features/, exactly as data/past-papers.ts does; the
 * typed SubjectId lookup lives in features/game/game.ts.
 */
export const GAME_QUESTIONS: Record<string, ExamQuestion[]> = {
  // "math": [
  //   {
  //     q: { en: "…", km: "…" },
  //     options: ["ក. …", "ខ. …", "គ. …", "ឃ. …"],
  //     correct: "ក. …",
  //   },
  // ],
};

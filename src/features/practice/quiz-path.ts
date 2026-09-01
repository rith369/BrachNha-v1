import type { SessionStatus } from "@/features/lessons/sessions";
import type { SubjectId } from "@/features/lessons/subjects";

/**
 * A Mimo-style quiz path — square nodes in a zigzag trail, shown when a student
 * drills into a subject's QUIZ tab, in place of the plain row list
 * PracticeLessonList renders for every other subject and for Flashcard.
 *
 * PHYSICS ONLY, AND FIXED DEMO DATA, ON PURPOSE. This was asked for as a design
 * sample before the real physics chapter/lesson/quiz content is supplied, so the
 * six nodes below and their done/current/locked statuses are authored by hand
 * rather than derived. That is the same explicitly-sanctioned move
 * features/progress, features/game and features/leaderboard's demo-data.ts
 * already make — see CLAUDE.md: "intentionally use fake, fixed demo data" to
 * preview a screen before the real tracking behind it exists.
 *
 * NOTHING HERE IS WIRED TO completedSessions OR ANY REAL PROGRESS, and every
 * node renders as a plain, non-interactive square regardless of status — see the
 * header of quiz-path-node.tsx for why even a "done" or "current" node is not a
 * <Link> yet.
 *
 * WHEN THE REAL CONTENT ARRIVES, replace this file's contents with an authored
 * structure keyed the way SUBJECT_SESSIONS is in features/lessons/sessions.ts
 * (chapter → lesson), derive `status` the way sessionStatus() does — locked
 * means "no quiz written yet", not "not earned" — and point each node at
 * `/practice/quiz/physics/{chapter}-{lesson}`, the same runner route the plain
 * list already links to. `QUIZ_PATHS` below is a Partial map for exactly that
 * reason: adding a second subject is one entry, not a hardcoded
 * `if (subjectId === "physics")` scattered across every caller.
 */
export interface QuizPathNode {
  id: string;
  /** Split rather than one combined string, so the header banner can print
   *  "ជំពូក N" as a kicker and the lesson name as its own bold line — the same
   *  two-line shape subject-path-view.tsx's lesson banner already uses. */
  chapterNumber: number;
  /** Placeholder lesson name — swap for the real physics lesson title once it
   *  is supplied. */
  title: string;
  status: SessionStatus;
}

export const PHYSICS_QUIZ_PATH_SAMPLE: QuizPathNode[] = [
  { id: "physics-sample-1", chapterNumber: 1, title: "មេរៀនទី ១", status: "done" },
  { id: "physics-sample-2", chapterNumber: 1, title: "មេរៀនទី ២", status: "done" },
  { id: "physics-sample-3", chapterNumber: 1, title: "មេរៀនទី ៣", status: "current" },
  { id: "physics-sample-4", chapterNumber: 2, title: "មេរៀនទី ១", status: "locked" },
  { id: "physics-sample-5", chapterNumber: 2, title: "មេរៀនទី ២", status: "locked" },
  { id: "physics-sample-6", chapterNumber: 2, title: "មេរៀនទី ៣", status: "locked" },
];

/** Which subjects have a Mimo-style sample path today — physics only. */
export const QUIZ_PATHS: Partial<Record<SubjectId, QuizPathNode[]>> = {
  physics: PHYSICS_QUIZ_PATH_SAMPLE,
};

/** A subject's quiz path, or null when it still uses the plain lesson list. */
export function quizPathFor(subjectId: SubjectId): QuizPathNode[] | null {
  return QUIZ_PATHS[subjectId] ?? null;
}

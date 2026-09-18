import { quizFor } from "@/data/practice";
import type { Chapter, PathLesson, Session } from "@/features/lessons/sessions";
import type { SubjectId } from "@/features/lessons/subjects";

/**
 * A Mimo-style quiz path — square nodes in a zigzag trail, shown when a student
 * drills into a subject's QUIZ tab, in place of the plain row list
 * PracticeLessonList renders for every other subject and for Flashcard.
 *
 * IT IS THE REAL CURRICULUM SHAPE NOW, NOT A FLAT SAMPLE. It first shipped as a
 * hand-authored list of six nodes carrying hand-authored done/current/locked
 * statuses. Both halves of that are gone:
 *
 *  - **Shape.** A path is CHAPTER → LESSON → SECTION, and one lesson holds
 *    several section squares — exactly the structure biology's Study path
 *    renders, and exactly what the textbooks look like. The types below are the
 *    app's own `Chapter`/`PathLesson`/`Session` from features/lessons/sessions.ts,
 *    imported rather than re-declared, so the two paths cannot describe one
 *    curriculum in two different ways.
 *  - **Progress.** Nothing is authored as "done" any more. Status comes from
 *    `sessionStatus(session, completedSessions)`, the same derivation the Study
 *    path uses, so a fresh student starts at the very first node and a tick can
 *    only appear because they earned it. See `nextQuizSectionId()` for the one
 *    deliberate difference from the Study path.
 *
 * WHY THIS IS NOT IN `SUBJECT_SESSIONS`. That map already holds a math entry —
 * the មូលដ្ឋានគ្រឹះ foundation-review path, on the Study page's foundation tab —
 * and sessions.ts's own PATH_TAB comment records the rule: "one id cannot open
 * two paths", so Bac II math needs its own data rather than being appended
 * there. This file IS that separate data, for the Practice feature's own screen.
 *
 * SECTION NAMES ARE NOT SUPPLIED YET, and `title: ""` is how that is said —
 * the same convention `Chapter.title` and `PathLesson.title` already use, read
 * back by `lessonHeading()` as the number alone rather than a made-up name. The
 * LESSON names for math are real (the user's own Grade 12 list); only the
 * sections inside them are pending.
 */

/**
 * How many section squares a lesson gets until its real sections are supplied.
 *
 * A PLACEHOLDER COUNT, and the same move sessions.ts already makes with
 * PLACEHOLDER_SECTIONS and PLACEHOLDER_SESSIONS: structure may be reserved, but
 * the names inside it may not be invented. Six matches what a real biology
 * lesson holds on the Study path, so the two screens have the same rhythm. When
 * a lesson's real sections arrive, pass its own count (or its titles) rather
 * than editing this.
 */
const SECTIONS_PER_LESSON = 6;

/**
 * One lesson's section nodes.
 *
 * Ids and labels are GENERATED from position, never typed out, for the reason
 * sectionsFor() gives in sessions.ts: a "3.2" on screen then cannot drift from
 * where the node actually sits.
 *
 * **THE ID IS PREFIXED `quiz-` AND THAT PREFIX IS LOAD-BEARING.** `completedSessions`
 * is ONE list shared by every path in the app, and the Study path's own math
 * sections are already `math-1-1-1…` — the exact ids this lesson would generate
 * without the prefix. Unprefixed, finishing a foundation-review section on the
 * Study page would tick a Bac II quiz node here, which is a wrong claim about
 * what a student has done. The prefix is not in the route or the content key;
 * it is only ever the progress identity.
 *
 * **PLAYABILITY IS DERIVED, never authored beside the node** — the rule
 * sectionsFor() and lessonCountFor() both exist to enforce. A section is
 * playable if and only if a quiz is written under its content key in
 * data/practice.ts, which today is none of them, so every node is locked and
 * non-interactive. Authoring `PRACTICE_QUIZZES["math-1-3-2"]` turns that one
 * node into a real <Link> with no code change here — which is why keyFromRef()
 * in ./practice accepts a three-number ref.
 */
function quizSections(
  subjectId: SubjectId,
  chapter: number,
  lesson: number,
  count: number,
  flat: boolean
): Session[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const ref = `${chapter}-${lesson}-${n}`;
    const contentKey = `${subjectId}-${ref}`;
    return {
      id: quizSessionId(contentKey),
      // A flat subject has no chapter to name, so its label drops the chapter
      // number too rather than printing a "1." that groups nothing — the same
      // rule Chapter.flat already applies to the banner's kicker.
      label: flat ? `${lesson}.${n}` : `${chapter}.${lesson}.${n}`,
      title: "",
      href:
        quizFor(contentKey).length > 0
          ? `/practice/quiz/${subjectId}/${ref}`
          : null,
    };
  });
}

/**
 * The progress id for a quiz section, from its content key.
 *
 * Exported because QuizRunner has to write the SAME id this path reads — it
 * holds the content key, not the node — and a second spelling of the prefix in
 * that file is how the two would silently stop matching.
 */
export function quizSessionId(contentKey: string): string {
  return `quiz-${contentKey}`;
}

/** A lesson of `SECTIONS_PER_LESSON` unnamed sections. */
function quizLesson(
  subjectId: SubjectId,
  chapter: number,
  number: number,
  title: string,
  flat: boolean
): PathLesson {
  return {
    number,
    title,
    sessions: quizSections(
      subjectId,
      chapter,
      number,
      SECTIONS_PER_LESSON,
      flat
    ),
  };
}

/**
 * MATH — the real Grade 12 lesson names, supplied by the user, in their order.
 *
 * ONE FLAT CHAPTER, because the list supplied has no chapter grouping in it.
 * `flat: true` is the app's existing way to say that (see Chapter.flat), and it
 * is what stops every banner printing a "ជំពូក 1" that groups nothing. If these
 * eight turn out to sit under real chapters, split them here — nothing else
 * needs to change.
 */
const MATH_LESSON_TITLES = [
  "លីមីតនៃអនុគមន៍",
  "ដេរីវេ និងព្រីមីទីវនៃអនុគមន៍",
  "ចំនួនកុំផ្លិច",
  "កោនិក",
  "អាំងតេក្រាលកំណត់",
  "សមីការឌីផេរ៉ង់ស្យែល",
  "ប្រូបាប",
  "ផលគុណនៃវិចទ័រក្នុងលំហ",
] as const;

const MATH_QUIZ_PATH: Chapter[] = [
  {
    number: 1,
    title: "",
    flat: true,
    lessons: MATH_LESSON_TITLES.map((title, i) =>
      quizLesson("math", 1, i + 1, title, true)
    ),
  },
];

/**
 * PHYSICS — still awaiting its real curriculum, and now expressed in the same
 * shape math is: its two supplied chapters, each holding ONE lesson of the same
 * placeholder sections. It used to be six flat nodes standing for "three things
 * in chapter 1, three in chapter 2"; those were never lessons OR sections, they
 * were just nodes, which is exactly the ambiguity this shape removes.
 *
 * Neither its chapters nor its lessons have names yet, so both carry "" and the
 * banner shows the numbers alone. Its statuses are derived like math's, so the
 * two ticks and the highlighted node it used to carry are gone: both paths now
 * start where a student actually is, which is at the beginning.
 */
const PHYSICS_QUIZ_PATH: Chapter[] = [1, 2].map((chapter) => ({
  number: chapter,
  title: "",
  lessons: [quizLesson("physics", chapter, 1, "", false)],
}));

/** Which subjects render as a quiz path rather than the plain lesson list. */
export const QUIZ_PATHS: Partial<Record<SubjectId, Chapter[]>> = {
  math: MATH_QUIZ_PATH,
  physics: PHYSICS_QUIZ_PATH,
};

/** A subject's quiz path, or null when it still uses the plain lesson list. */
export function quizPathFor(subjectId: SubjectId): Chapter[] | null {
  return QUIZ_PATHS[subjectId] ?? null;
}

/**
 * Finished / total across the whole path, for the header's progress bar.
 *
 * **NOT `pathProgress()` from sessions.ts, and the difference is a bug this
 * screen actually had.** That one counts only sections that are *playable* and
 * finished, which on the Study path can never differ from what is on screen —
 * a section there cannot be finished without having been playable. Here the
 * header used it while each lesson banner counted plain completions, so a
 * finished section whose quiz was later unpublished showed as a tick on the
 * trail, `2/6` on its banner and `0/48` in the header, all at once.
 *
 * ONE RULE FOR BOTH COUNTERS: a section counts as done when it is in
 * `completedSessions`, which is exactly what makes a node draw its tick. The
 * numbers on this screen then cannot disagree with the squares under them.
 */
export function quizPathProgress(chapters: Chapter[], completed: string[]) {
  const all = chapters.flatMap((c) => c.lessons.flatMap((l) => l.sessions));
  return {
    done: all.filter((s) => completed.includes(s.id)).length,
    total: all.length,
  };
}

/**
 * The node the START bubble points at: the first section not yet finished.
 *
 * **DELIBERATELY NOT the Study path's rule**, which is "the first PLAYABLE
 * section not yet finished" and therefore returns nothing at all while a path
 * has no content — subject-path-view.tsx covers that gap with an authored
 * `openHere` flag instead. A quiz path needs no such flag: "where do I start"
 * has an obvious answer whether or not the content is written, and it is the
 * top of the path. The bubble here means *this is where you begin*, not *this
 * is playable* — the node is still a non-interactive <div> until a quiz exists
 * behind it.
 *
 * It retires itself the same way `openHere` does: as sections are finished the
 * bubble walks down the path on its own, with nothing to maintain.
 */
export function nextQuizSectionId(
  chapters: Chapter[],
  completed: string[]
): string | null {
  for (const chapter of chapters) {
    for (const lesson of chapter.lessons) {
      for (const section of lesson.sessions) {
        if (!completed.includes(section.id)) return section.id;
      }
    }
  }
  return null;
}

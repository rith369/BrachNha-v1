import { LESSONS } from "@/data/lessons";
import { hasSectionContent } from "@/data/sections";
import type { SubjectId } from "./subjects";

/**
 * A subject's learning path, in the shape the real textbooks use:
 *
 *   ជំពូក (chapter) → មេរៀន (lesson) → ផ្នែក (section)
 *
 * Three levels, not two. A chapter groups lessons; a lesson is a run of short
 * sections; a section is one node on the path and one run of the 7-step lesson
 * flow. That is the Duolingo/Mimo shape and it is also, independently, how the
 * Grade 12 table of contents is laid out — so the data can mirror the book.
 *
 * KHMER-ONLY, like the rest of the Study feature. See LESSONS_PAGE_LANG in
 * ./subjects for why.
 *
 * NOTHING HERE IS AUTHORED CONTENT. Titles are the curriculum; the lessons
 * behind them are not written yet, which is why every authored session below
 * has no `href`. This module exists so the page renders *whatever
 * structure it is given*, and filling content in later needs no page change.
 */

export type SessionStatus = "done" | "current" | "locked";

/**
 * One node on the path.
 *
 * The curriculum calls this a ផ្នែក / "section" and the type is called Session.
 * That mismatch is deliberate: the store persists `completedSessions` and
 * exposes `completeSession()`, so renaming the type would invite renaming a
 * persisted field, which needs a migration and buys nothing. Section == Session.
 */
export interface Session {
  /** Stable id. Where real content exists this IS the lesson id, which is what
   *  lets the store's completedSessions hold lesson ids and still line up. */
  id: string;
  /** Shown on the node: "3.1.1" — chapter, lesson, then position. */
  label: string;
  /** Khmer section name. Rendered under the node, not just in the aria-label. */
  title: string;
  /**
   * Where the node goes, or null when nothing is written behind it — which is
   * also what makes it locked. ONE field rather than a lesson id beside a
   * section id, because the two destinations differ and a pair would drift:
   *
   *   /sections/{id}   authored curriculum, run by SectionDetail
   *   /lessons/{id}    the older 7-step flow, used by the derived fallback
   */
  href: string | null;
}

/**
 * PathLesson, not Lesson: types/index.ts already exports a `Lesson`, which is
 * the 7-step content object a section routes INTO. Two different things, and
 * conflating them would be a genuinely confusing import collision.
 */
export interface PathLesson {
  number: number;
  title: string;
  sessions: Session[];
  /**
   * "Open the path here." A pointer at the lesson currently being worked on,
   * used ONLY while nothing on the path is playable yet — see the landing rule
   * in subject-path-view.tsx. Once a lesson has real content the first
   * unfinished session takes over and this flag stops being consulted, so it is
   * self-retiring rather than something to keep in step.
   */
  openHere?: boolean;
}

export interface Chapter {
  number: number;
  /** Chapter name WITHOUT the number — the banner prefixes "ជំពូក N" itself.
   *  An empty string means the name has not been supplied yet, and the banner
   *  then shows the number alone rather than a made-up title. */
  title: string;
  lessons: PathLesson[];
}

/**
 * The three sections every lesson ends with.
 *
 * Supplied as 3.1.4–3.1.6 for តម្រូវប្រសាទ, and they are structural rather than
 * topic-specific — every lesson collects mistakes, summarises, then tests — so
 * they are applied to all lessons rather than retyped per lesson. If a lesson
 * ever needs a different tail, give it explicit titles instead of calling
 * `sectionsFor`.
 *
 * កំហុស is a plain locked node today. It describes a mistakes-collection
 * feature — a place a student's wrong answers accumulate — that does not exist
 * yet. This reserves its position in the path and nothing more.
 */
const LESSON_TAIL = ["កំហុស", "សេចក្តីសង្ខេប", "តេស្ត"] as const;

/** Placeholder names for a lesson whose real section titles haven't arrived. */
const PLACEHOLDER_SECTIONS = ["ផ្នែកទី ១", "ផ្នែកទី ២", "ផ្នែកទី ៣"];

/**
 * Build a lesson's sections from their titles.
 *
 * Ids and labels are GENERATED from position rather than typed out, so a
 * "3.1.4" on screen cannot drift from where the node actually sits — the same
 * reason lessonCountFor() counts LESSONS instead of being authored beside it.
 * Labels use Arabic digits to match the numbering printed in the textbook.
 */
function sectionsFor(
  subjectId: SubjectId,
  chapter: number,
  lesson: number,
  titles: readonly string[] = PLACEHOLDER_SECTIONS
): Session[] {
  return [...titles, ...LESSON_TAIL].map((title, i) => {
    const id = `${subjectId}-${chapter}-${lesson}-${i + 1}`;
    return {
      id,
      label: `${chapter}.${lesson}.${i + 1}`,
      title,
      // DERIVED, never authored: a node is playable if and only if content
      // exists for its id. Writing "this one is unlocked" by hand beside the
      // content is exactly how the two fall out of step.
      href: hasSectionContent(id) ? `/sections/${id}` : null,
    };
  });
}

/**
 * Authored chapter structure, keyed by subject. Most subjects are absent, and
 * that is the normal state — exactly like PAST_PAPER_QUESTIONS in
 * data/past-papers.ts. Adding an entry turns a real path on for that subject.
 *
 * Biology is the first real curriculum in the app, entered from the Grade 12
 * table of contents. Chapter 1's name and its two lessons' names are real
 * (ស៊ីមណូស្ពែម = Gymnosperm, អង់ស្យូស្ពែម = Angiosperm — the seed-plant split).
 * Chapter 2 still carries NO TITLE — the scan it came from is too soft to
 * transcribe Khmer safely, and a wrong glyph in a chapter title is worse than
 * an empty one. Its shape (two lessons) is correct; only the names are
 * pending, and its banner shows "ជំពូក ២" alone until they arrive.
 *
 * Every section is locked because no content is written behind any of them yet.
 * Note this REPLACES the derived fallback below, so biology-body and
 * biology-brain no longer appear on the path. Both remain reachable at
 * /lessons/biology-body and /lessons/biology-brain.
 */
export const SUBJECT_SESSIONS: Partial<Record<SubjectId, Chapter[]>> = {
  biology: [
    {
      number: 1,
      title: "ស៊ីមណូស្ពែម និងអង់ស្យូស្ពែម",
      lessons: [
        { number: 1, title: "ស៊ីមណូស្ពែម", sessions: sectionsFor("biology", 1, 1) },
        { number: 2, title: "អង់ស្យូស្ពែម", sessions: sectionsFor("biology", 1, 2) },
      ],
    },
    {
      number: 2,
      title: "",
      lessons: [
        { number: 1, title: "មេរៀនទី ១", sessions: sectionsFor("biology", 2, 1) },
        { number: 2, title: "មេរៀនទី ២", sessions: sectionsFor("biology", 2, 2) },
      ],
    },
    {
      number: 3,
      title: "តម្រូវផ្សេងៗរបស់សារពាង្គកាយ",
      lessons: [
        {
          number: 1,
          title: "តម្រូវប្រសាទ",
          // The lesson being authored right now. Nothing on this path is
          // playable, so without this the page opens on ជំពូក ១ and every
          // visit starts with a scroll past 20 locked nodes.
          openHere: true,
          sessions: sectionsFor("biology", 3, 1, [
            "សេចក្ដីផ្ដើម",
            "តម្រូវប្រសាទសត្វឥតឆ្អឹងកង",
            "តម្រូវប្រសាទសត្វឆ្អឹងកង",
            "ប្រព័ន្ធប្រសាទរបស់មនុស្ស",
          ]),
        },
        {
          number: 2,
          title: "សរីរាង្គវិញ្ញាណ",
          sessions: sectionsFor("biology", 3, 2),
        },
        {
          number: 3,
          title: "ប្រព័ន្ធអង់ដូគ្រីន",
          sessions: sectionsFor("biology", 3, 3),
        },
      ],
    },
  ],
};

/** How many locked placeholders to show after the real content runs out, so the
 *  path visibly continues rather than stopping dead. */
const PLACEHOLDER_SESSIONS = 6;

/** The chapter number real content lands in until chapters are authored. */
const DEFAULT_CHAPTER = 1;

/**
 * The path for a subject.
 *
 * Falls back to a DERIVED path when nothing is authored: one session per lesson
 * that genuinely exists in data/lessons.ts, followed by locked placeholders,
 * wrapped in a single chapter and a single lesson so the shape matches. Derived
 * rather than authored for the same reason lessonCountFor() is — a number on
 * screen can then never claim content the app does not have.
 */
export function chaptersFor(subjectId: SubjectId): Chapter[] {
  const authored = SUBJECT_SESSIONS[subjectId];
  if (authored?.length) return authored;

  const topics = Object.keys(LESSONS[subjectId] ?? {});
  const real: Session[] = topics.map((topic, i) => ({
    id: `${subjectId}-${topic}`,
    label: `${DEFAULT_CHAPTER}.${i + 1}`,
    title: LESSONS[subjectId][topic].title.km,
    href: `/lessons/${subjectId}-${topic}`,
  }));

  const locked: Session[] = Array.from(
    { length: PLACEHOLDER_SESSIONS },
    (_, i) => ({
      id: `${subjectId}-soon-${i + 1}`,
      label: `${DEFAULT_CHAPTER}.${real.length + i + 1}`,
      title: "ឆាប់ៗនេះ",
      href: null,
    })
  );

  return [
    {
      number: DEFAULT_CHAPTER,
      title: "",
      lessons: [
        {
          number: 1,
          title: "មេរៀនទី ១",
          sessions: [...real, ...locked],
        },
      ],
    },
  ];
}

/** Every section on a path, in order. */
export function allSessions(chapters: Chapter[]): Session[] {
  return chapters.flatMap((c) => c.lessons.flatMap((l) => l.sessions));
}

/**
 * Status per session, derived from what the student has actually finished.
 *
 * Deliberately NOT stored: a stored status would have to be kept in step with
 * completedSessions by hand, and the two would drift the first time a lesson id
 * changed. The rules are:
 *
 *   done     already in completedSessions
 *   locked   no lesson content behind it yet
 *   current  everything else — i.e. it is playable
 *
 * Note that "locked" here means "not written yet", NOT "you have not earned it".
 * Gating a session on finishing the previous one needs the real chapter
 * structure first, otherwise it would lock content that does exist.
 */
export function sessionStatus(
  session: Session,
  completed: string[]
): SessionStatus {
  if (completed.includes(session.id)) return "done";
  if (!session.href) return "locked";
  return "current";
}

/** Finished / total across every chapter, for the header's progress bar. */
export function pathProgress(chapters: Chapter[], completed: string[]) {
  const all = allSessions(chapters);
  const playable = all.filter((s) => s.href);
  const done = playable.filter((s) => completed.includes(s.id));
  return { done: done.length, total: all.length, playable: playable.length };
}

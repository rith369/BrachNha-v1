import { deckFor, quizFor } from "@/data/practice";
import { chaptersFor } from "@/features/lessons/sessions";
import { SUBJECTS, allSubjects, type SubjectId, type SubjectMeta } from "@/features/lessons/subjects";
import type { UnderlineTab } from "@/components/ui/underline-tabs";

/**
 * THIS PAGE IS KHMER-ONLY, ON PURPOSE.
 *
 * The practice feature's own copy — title, tab labels, lesson rows, both
 * runners' chrome — is Khmer literals rather than `{ en, km }` pairs behind
 * `T[lang]`, so it renders Khmer even when the app is switched to English. The
 * same product decision already recorded for the Study page (LESSONS_PAGE_LANG),
 * the exam page (EXAM_PAGE_LANG) and KruAI, which always answers in Khmer
 * whatever the student typed (ANSWER_LANG in utils/chat-prompt.ts).
 *
 * The content behind it is Khmer-only too — see PracticeCard in types/index.ts —
 * so unlike the exam page there are NO bilingual carve-outs here. The one piece
 * of shared chrome that stays lang-driven is FocusLayout's exit confirm, which
 * belongs to the lesson flow as well and must not read Khmer on a deck and
 * English on a lesson in the same session.
 *
 * Flipping it back means giving these strings `{ en, km }` shapes and reading
 * them through `T[lang]`; this constant exists so the decision is greppable and
 * reversible in one edit.
 */
export const PRACTICE_PAGE_LANG = "km" as const;

/**
 * The two tabs. `flashcards` and `quiz` are also the `:mode` route segment, so
 * the union is the URL vocabulary as well as the tab id — one spelling, not two.
 */
export type PracticeMode = "flashcards" | "quiz";

/**
 * Labels are "Flashcard" and "Quiz" in LATIN script even though the page is
 * Khmer. That is not an oversight and not untranslated copy: it is already what
 * translations.ts's own **km** column uses for these two words
 * (`km.flashcards = "Flashcard"`, `km.practice = "Quiz"`). Same call as KruAI
 * keeping its Latin spelling inside Khmer sentences — these are the names
 * students use, not descriptions to translate.
 */
export const PRACTICE_TABS: UnderlineTab<PracticeMode>[] = [
  { id: "flashcards", label: "Flashcard" },
  { id: "quiz", label: "Quiz" },
];

/**
 * Which subjects get flashcards.
 *
 * A closed list rather than every subject, because flashcards earn their keep on
 * recall-heavy material — definitions, organs, dates, reactions — and not on the
 * subjects a student is examined on by working a problem or writing prose. Math,
 * Khmer and the chosen language therefore appear under Quiz only.
 *
 * A NAMED CONSTANT beside FOUNDATION_SUBJECTS' precedent in utils/placement.ts,
 * so the decision has one home and the two tabs cannot quietly diverge.
 *
 * The ORDER comes from the catalog (see flashcardSubjects), not from this array,
 * so every subject list in the app stays in one order.
 */
export const FLASHCARD_SUBJECTS: readonly SubjectId[] = [
  "physics",
  "chemistry",
  "biology",
  "history",
];

/** The flashcard tab's subjects, in catalog order. */
export function flashcardSubjects(): SubjectMeta[] {
  return SUBJECTS.filter((s) => FLASHCARD_SUBJECTS.includes(s.id));
}

/**
 * The subjects a tab shows. Quiz covers everything — with allSubjects() dropping
 * whichever of english/french the student didn't pick at login, so it is 7 cards
 * rather than 8.
 */
export function subjectsFor(
  mode: PracticeMode,
  userLanguage: string | undefined
): SubjectMeta[] {
  return mode === "flashcards" ? flashcardSubjects() : allSubjects(userLanguage);
}

/**
 * The content key for one lesson: `"{subjectId}-{chapter}-{lesson}"`.
 *
 * Typed here rather than in data/practice.ts for the reason paperKey() lives in
 * features/exam/papers.ts — data/ sits at the bottom of the import graph and
 * must not reach up into features/ for a SubjectId.
 */
export function practiceKey(
  subjectId: SubjectId,
  chapter: number,
  lesson: number
): string {
  return `${subjectId}-${chapter}-${lesson}`;
}

/** The `:lessonRef` route segment — the key with its subject prefix removed. */
export function lessonRef(chapter: number, lesson: number): string {
  return `${chapter}-${lesson}`;
}

/** One row in a subject's practice list. */
export interface PracticeLesson {
  /** `"{subjectId}-{chapter}-{lesson}"`. Also the React key. */
  key: string;
  /** The `:lessonRef` route segment, `"3-1"`. */
  ref: string;
  chapterNumber: number;
  /** Empty string when the chapter's real name hasn't been supplied — the
   *  banner then shows "ជំពូក ១" alone. See Chapter in lessons/sessions.ts. */
  chapterTitle: string;
  lessonNumber: number;
  title: string;
  /** Cards or questions written for this lesson in this mode. DERIVED. */
  count: number;
}

/**
 * A subject's lessons, flattened from its chapters, for one mode.
 *
 * THE LIST COMES FROM chaptersFor(), the same function the Study path renders
 * from, so this screen and /subjects/:id can never disagree about what lessons a
 * subject has. Biology yields its real 7 lessons across 3 chapters; every other
 * subject yields the single-lesson fallback chaptersFor() builds when nothing is
 * authored, which is one row. That thinness is the honest state today, not a
 * bug — it fills in by itself the moment a curriculum is entered.
 *
 * `count` is READ FROM THE CONTENT rather than authored beside it, the rule
 * lessonCountFor() exists to enforce: a row cannot claim a deck the app does not
 * have, and playability is derived from the same number.
 */
export function practiceLessonsFor(
  subjectId: SubjectId,
  mode: PracticeMode
): PracticeLesson[] {
  return chaptersFor(subjectId).flatMap((chapter) =>
    chapter.lessons.map((lesson) => {
      const key = practiceKey(subjectId, chapter.number, lesson.number);
      const content = mode === "flashcards" ? deckFor(key) : quizFor(key);
      return {
        key,
        ref: lessonRef(chapter.number, lesson.number),
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        lessonNumber: lesson.number,
        title: lesson.title,
        count: content.length,
      };
    })
  );
}

/** How many of a subject's lessons have content in this mode. Feeds the card. */
export function readyLessonCount(
  subjectId: SubjectId,
  mode: PracticeMode
): number {
  return practiceLessonsFor(subjectId, mode).filter((l) => l.count > 0).length;
}

/** Narrow a `:mode` route param, or null for anything else. */
export function parseMode(value: string | undefined): PracticeMode | null {
  return value === "flashcards" || value === "quiz" ? value : null;
}

/** Resolve a `:lessonRef` back to its content key, or null if malformed. */
export function keyFromRef(
  subjectId: SubjectId,
  ref: string | undefined
): string | null {
  // Two positive integers, nothing else — this comes straight off the URL.
  return ref && /^\d+-\d+$/.test(ref) ? `${subjectId}-${ref}` : null;
}

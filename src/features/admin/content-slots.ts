import { PAST_PAPER_YEARS } from "@/data/past-papers";
import { chaptersShape, lessonHeading } from "@/features/lessons/sessions";
import { SUBJECTS, findSubject, type SubjectId } from "@/features/lessons/subjects";
import { FLASHCARD_SUBJECTS, lessonRef, practiceKey } from "@/features/practice/practice";
import { quizPathShape } from "@/features/practice/quiz-path";
import type { ContentKind } from "@/types";

/**
 * Every place a deck, quiz, lesson section, past paper or Battle question pool
 * can live, named the way the app names it, for the content editor
 * (/admin/content).
 *
 * THE SLOTS COME FROM THE SAME CURRICULUM THE APP RENDERS: chaptersShape() for
 * the Study and flashcard lessons, quizPathShape() for the Bac II quiz paths.
 * So "New" can only offer a key a student can actually reach, and the editor
 * names an item exactly as the student sees it. A key is never typed by hand.
 *
 * Only the admin chunk imports this.
 */

export interface ContentSlot {
  kind: ContentKind;
  key: string;
  subject: SubjectId;
  /** "ជំពូក 3 · មេរៀនទី 1 · តម្រូវប្រសាទ", or "មេរៀនទី 1 · លីមីតនៃអនុគមន៍ · 1.1 ប្រមាណវិធីលើលីមីត". */
  title: string;
  /** Where a student opens it. */
  link: string;
  /** A section's own name, which a new section starts with as its title. */
  name?: string;
}

/** A section id the Study path generates: subject, chapter, lesson, section. */
const SECTION_ID = /^[a-z]+-[1-9][0-9]?-[1-9][0-9]?-[1-9][0-9]?$/;

function deckSlots(): ContentSlot[] {
  return FLASHCARD_SUBJECTS.flatMap((subject) =>
    chaptersShape(subject).flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        kind: "deck" as const,
        key: practiceKey(subject, chapter.number, lesson.number),
        subject,
        title:
          (chapter.flat ? "" : `ជំពូក ${chapter.number} · `) +
          lessonHeading(lesson.number, lesson.title),
        link: `/practice/flashcards/${subject}/${lessonRef(chapter.number, lesson.number)}`,
      }))
    )
  );
}

function quizSlots(): ContentSlot[] {
  return SUBJECTS.flatMap((meta) => {
    const subject = meta.id;
    const path = quizPathShape(subject);
    if (path) {
      // A quiz path: one slot per SECTION node. The node's id is
      // quiz-{contentKey} (quizSessionId), so the key is read off it rather
      // than rebuilt from numbers.
      return path.flatMap((chapter) =>
        chapter.lessons.flatMap((lesson) =>
          lesson.sessions.map((section) => {
            const key = section.id.replace(/^quiz-/, "");
            return {
              kind: "quiz" as const,
              key,
              subject,
              title:
                lessonHeading(lesson.number, lesson.title) +
                ` · ${section.label}${section.title ? ` ${section.title}` : ""}`,
              link: `/practice/quiz/${subject}/${key.slice(subject.length + 1)}`,
            };
          })
        )
      );
    }
    // Otherwise one quiz per LESSON, the plain lesson list's shape.
    return chaptersShape(subject).flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        kind: "quiz" as const,
        key: practiceKey(subject, chapter.number, lesson.number),
        subject,
        title:
          (chapter.flat ? "" : `ជំពូក ${chapter.number} · `) +
          lessonHeading(lesson.number, lesson.title),
        link: `/practice/quiz/${subject}/${lessonRef(chapter.number, lesson.number)}`,
      }))
    );
  });
}

/** Every node on an authored Study path (chapter, lesson, section). A subject
 *  with no authored path has only placeholders, so it offers nothing. */
function sectionSlots(): ContentSlot[] {
  return SUBJECTS.flatMap((meta) =>
    chaptersShape(meta.id).flatMap((chapter) =>
      chapter.lessons.flatMap((lesson) =>
        lesson.sessions
          .filter((s) => SECTION_ID.test(s.id))
          .map((s) => ({
            kind: "section" as const,
            key: s.id,
            subject: meta.id,
            title:
              (chapter.flat ? "" : `ជំពូក ${chapter.number} · `) +
              lessonHeading(lesson.number, lesson.title) +
              ` · ${s.label}${s.title ? ` ${s.title}` : ""}`,
            link: `/sections/${s.id}`,
            name: s.title,
          }))
      )
    )
  );
}

/** One per exam session and subject, the exam tab's own cards. */
function paperSlots(): ContentSlot[] {
  return PAST_PAPER_YEARS.flatMap((year) =>
    SUBJECTS.map((meta) => ({
      kind: "paper" as const,
      key: `${year}-${meta.id}`,
      subject: meta.id,
      title: `វិញ្ញាសារ${meta.name} ${year}`,
      link: `/exam/subjects/${year}-${meta.id}`,
    }))
  );
}

/** One Battle pool per subject: a Battle is one subject end to end. */
function gameSlots(): ContentSlot[] {
  return SUBJECTS.map((meta) => ({
    kind: "game" as const,
    key: meta.id,
    subject: meta.id,
    title: meta.name,
    link: "/game/create",
  }));
}

export function contentSlots(kind: ContentKind): ContentSlot[] {
  switch (kind) {
    case "deck":
      return deckSlots();
    case "quiz":
      return quizSlots();
    case "section":
      return sectionSlots();
    case "paper":
      return paperSlots();
    case "game":
      return gameSlots();
  }
}

/**
 * One key's slot. A key stored in the database that the curriculum no longer
 * has a place for (renamed, or an old alias such as history-1-1-1) still gets
 * a name: the subject and its numbers, so it can be found and tidied.
 */
export function slotFor(kind: ContentKind, key: string): ContentSlot {
  const found = contentSlots(kind).find((s) => s.key === key);
  if (found) return found;
  if (kind === "game") {
    const subject = findSubject(key);
    return {
      kind,
      key,
      subject: (subject?.id ?? "math") as SubjectId,
      title: subject?.name ?? key,
      link: "/game/create",
    };
  }
  if (kind === "paper") {
    const [year, subjectId = ""] = key.split("-");
    const subject = findSubject(subjectId);
    return {
      kind,
      key,
      subject: (subject?.id ?? "math") as SubjectId,
      title: `វិញ្ញាសារ${subject?.name ?? subjectId} ${year}`,
      link: `/exam/subjects/${key}`,
    };
  }
  const [subjectId, ...numbers] = key.split("-");
  const subject = findSubject(subjectId);
  return {
    kind,
    key,
    subject: (subject?.id ?? "math") as SubjectId,
    title: `${subject?.name ?? subjectId} ${numbers.join(".")}`,
    link:
      kind === "section"
        ? `/sections/${key}`
        : `/practice/${kind === "deck" ? "flashcards" : "quiz"}/${subjectId}/${numbers.join("-")}`,
  };
}

/** The subject's Khmer name, for filter chips. */
export function subjectName(id: SubjectId): string {
  return findSubject(id)?.name ?? id;
}

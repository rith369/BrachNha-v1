import { allSubjects, type SubjectId, type SubjectMeta } from "@/features/lessons/subjects";
import { parsePaperKey } from "@/features/exam/papers";
import { lessonKeyOf } from "@/features/progress/content-keys";
import type { QuestionMistake } from "@/lib/store";
import { parseContentRef, type ParsedRef } from "@/utils/content-ref";
import { entryVersion, type ContentManifest } from "@/utils/content-manifest";
import { quizPathShape } from "./quiz-path";

/**
 * "Practice what I got wrong": what is on the list, and in what order. PURE, so the
 * hub's count, the list and the session cannot disagree.
 *
 * A mistake is only a reference (utils/content-ref.ts). The question is looked up
 * when it is shown, so a fix published on Admin -> Content reaches it.
 */

/** A session stays this short, so a long backlog is not a wall of questions. */
export const MISTAKES_PER_SESSION = 20;

export interface LiveMistake extends QuestionMistake {
  parsed: ParsedRef;
  version: number;
}

/**
 * The mistakes a student can practise now. One whose paper or quiz is no longer
 * published is left out but kept: it may come back, and nothing about it is wrong.
 */
export function liveMistakes(
  mistakes: readonly QuestionMistake[],
  manifest: ContentManifest
): LiveMistake[] {
  const live: LiveMistake[] = [];
  for (const mistake of mistakes) {
    const parsed = parseContentRef(mistake.ref);
    if (!parsed) continue;
    const version = entryVersion(manifest, parsed.kind, parsed.key);
    if (version !== null) live.push({ ...mistake, parsed, version });
  }
  return live;
}

/** The subject id a question belongs to. A paper is "2025-math"; the rest start with it. */
export function mistakeSubjectId({ kind, key }: Pick<ParsedRef, "kind" | "key">): string {
  return kind === "paper" ? (parsePaperKey(key)?.subject.id ?? key) : key.split("-")[0];
}

/** Where a right answer is counted on Progress: the lesson, or the subject for a paper. */
export function mistakeProgressKey(parsed: Pick<ParsedRef, "kind" | "key">): string {
  return parsed.kind === "paper" ? mistakeSubjectId(parsed) : lessonKeyOf(parsed.key);
}

export interface SubjectMistakes {
  subject: SubjectMeta;
  count: number;
}

/** Per subject, in the app's usual subject order. Subjects with none are left out. */
export function mistakesBySubject(
  live: readonly LiveMistake[],
  userLanguage: string | undefined
): SubjectMistakes[] {
  const rows: SubjectMistakes[] = [];
  for (const subject of allSubjects(userLanguage)) {
    const count = live.filter((m) => mistakeSubjectId(m.parsed) === subject.id).length;
    if (count > 0) rows.push({ subject, count });
  }
  return rows;
}

/**
 * One lesson's mistakes, for the "កំហុស" node on its Study path.
 *
 * A quiz only counts where the subject has no quiz path of its own. Maths' Bac II
 * quiz path and its foundation Study path both use the key `math-1-1` for different
 * lessons, so a quiz mistake there would land under the wrong lesson.
 */
export function mistakesForLesson(
  live: readonly LiveMistake[],
  lessonKey: string
): LiveMistake[] {
  return live.filter(({ parsed }) => {
    if (parsed.kind === "paper" || lessonKeyOf(parsed.key) !== lessonKey) return false;
    if (parsed.kind === "section") return true;
    return !quizPathShape(mistakeSubjectId(parsed) as SubjectId);
  });
}

export interface MistakeFilter {
  subject?: string;
  lesson?: string;
}

export function filterMistakes(live: readonly LiveMistake[], filter: MistakeFilter): LiveMistake[] {
  if (filter.lesson) return mistakesForLesson(live, filter.lesson);
  if (filter.subject) return live.filter((m) => mistakeSubjectId(m.parsed) === filter.subject);
  return [...live];
}

/** The most-missed first, then the longest waiting, capped at one session. */
export function sessionQueue(live: readonly LiveMistake[]): LiveMistake[] {
  return [...live]
    .sort((a, b) => b.times - a.times || a.lastWrongAt.localeCompare(b.lastWrongAt))
    .slice(0, MISTAKES_PER_SESSION);
}

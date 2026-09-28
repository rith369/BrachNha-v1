import type { ContentLog, PracticeCard } from "@/types";
import type { ReviewState } from "@/utils/spaced-repetition";
import { allSubjects, type SubjectId } from "@/features/lessons/subjects";
import { chaptersFor, lessonHeading } from "@/features/lessons/sessions";
import { quizPathFor } from "@/features/practice/quiz-path";
import { practiceKey, lessonRef } from "@/features/practice/practice";
import { cardsFor, deckProgress } from "@/features/practice/review";
import { isDue } from "@/utils/spaced-repetition";
import { lessonKeyOf } from "@/features/progress/content-keys";
import { deckFor } from "@/data/practice";
import { PAST_PAPERS } from "@/data/past-papers";
import { pastPaperByKey } from "@/features/exam/papers";

/**
 * Home's Study card — "continue where you left off", or a recommendation for a
 * student who has not started anything yet.
 *
 * THE CATALOG IS DERIVED FROM WHAT EXISTS, never authored beside it. An item is
 * here because its content is: a section with SECTION_CONTENT behind it, a
 * flashcard deck with cards in it, a quiz-path node with a quiz behind it, a
 * past paper in PAST_PAPERS. So writing new content adds it to Home with no
 * edit here, and Home can never point at something that is not written — the
 * rule lessonCountFor() and sectionsFor()'s `href` already follow.
 *
 * The legacy 7-step lessons (data/lessons.ts — biology-body, math-limits…) are
 * deliberately NOT in it. They are the old content this card used to list by
 * hand; they stay reachable by URL, the way the Study path already treats them.
 * That is also why a section only counts with a /sections/ href: chaptersFor()'s
 * derived fallback gives the legacy lessons /lessons/ hrefs.
 */

export type StudyKind = "section" | "flashcards" | "quiz" | "paper";

/** Why an item is on the card, which is also what its chip says. */
export type StudyReason = "continue" | "review" | "next" | "recommended";

export interface StudyItem {
  /** Unique across the catalog — the React key. */
  id: string;
  kind: StudyKind;
  subject: SubjectId;
  /** Khmer content title (the content itself is Khmer-only). */
  title: string;
  /** Where in the curriculum it sits, e.g. "មេរៀនទី 1 · តម្រូវប្រសាទ". */
  context: string;
  href: string;
  /** Lesson-grain key, matching what the content log is written at. */
  lessonKey: string;
  done: boolean;
  /** Worked on but not finished — only a deck can be part-done today. */
  started: boolean;
  /** A finished deck with cards due again. */
  due: boolean;
  /** 0..1 remembered share of a deck, else null. */
  progress: number | null;
}

export interface RankedItem extends StudyItem {
  reason: StudyReason;
}

export interface StudyFeed {
  /** "continue" once the student has touched anything; "recommend" before. */
  mode: "continue" | "recommend";
  /** Every not-yet-finished item worth showing, best first. Callers slice. */
  items: RankedItem[];
}

export interface StudyFeedInput {
  userLanguage: string | undefined;
  weaknesses: string[];
  strengths: string[];
  completedSessions: string[];
  cardReviews: Record<string, ReviewState>;
  studentCards: Record<string, PracticeCard[]>;
  paperResults: { paperKey: string }[];
  contentLog: ContentLog;
}

/** How many rows Home shows. The user's number. */
export const STUDY_FEED_SIZE = 5;

/** Every item that has content, per subject, in curriculum order. */
function catalogFor(subject: SubjectId, input: StudyFeedInput): StudyItem[] {
  const items: StudyItem[] = [];

  // Sections and decks, lesson by lesson: a lesson's reading comes before its
  // flashcards, which is the order a student would take them in.
  for (const chapter of chaptersFor(subject)) {
    for (const lesson of chapter.lessons) {
      const heading = lessonHeading(lesson.number, lesson.title);
      for (const s of lesson.sessions) {
        if (!s.href?.startsWith("/sections/")) continue;
        items.push({
          id: `section:${s.id}`,
          kind: "section",
          subject,
          title: s.title,
          context: lesson.title || heading,
          href: s.href,
          lessonKey: lessonKeyOf(s.id),
          done: input.completedSessions.includes(s.id),
          started: false,
          due: false,
          progress: null,
        });
      }

      const key = practiceKey(subject, chapter.number, lesson.number);
      if (deckFor(key).length === 0) continue;
      const cards = cardsFor(key, input.studentCards, input.cardReviews);
      const graded = cards.filter((qc) => qc.state.lastGrade !== null).length;
      const all = graded === cards.length;
      const p = deckProgress(cards);
      items.push({
        id: `deck:${key}`,
        kind: "flashcards",
        subject,
        title: lesson.title || heading,
        context: chapter.flat ? "" : `ជំពូក ${chapter.number}`,
        href: `/practice/flashcards/${subject}/${lessonRef(chapter.number, lesson.number)}`,
        lessonKey: key,
        // A deck is "done" once every card has been answered at least once; it
        // comes back as a review when the scheduler says cards are due again.
        done: all,
        started: graded > 0 && !all,
        due: all && cards.some((qc) => isDue(qc.state)),
        progress: p.total ? p.remembered / p.total : null,
      });
    }
  }

  for (const chapter of quizPathFor(subject) ?? []) {
    for (const lesson of chapter.lessons) {
      for (const s of lesson.sessions) {
        if (!s.href) continue;
        items.push({
          id: `quiz:${s.id}`,
          kind: "quiz",
          subject,
          title: s.title || lessonHeading(lesson.number, lesson.title),
          context: s.title ? lesson.title : "",
          href: s.href,
          // s.id is "quiz-{contentKey}"; the log is written at lesson grain.
          lessonKey: lessonKeyOf(s.id.replace(/^quiz-/, "")),
          done: input.completedSessions.includes(s.id),
          started: false,
          due: false,
          progress: null,
        });
      }
    }
  }

  for (const key of Object.keys(PAST_PAPERS)) {
    const paper = pastPaperByKey(key);
    if (!paper || paper.subject.id !== subject) continue;
    items.push({
      id: `paper:${key}`,
      kind: "paper",
      subject,
      title: paper.title,
      context: `${paper.year}`,
      href: `/exam/subjects/${key}`,
      lessonKey: subject,
      done: input.paperResults.some((r) => r.paperKey === key),
      started: false,
      due: false,
      progress: null,
    });
  }

  return items;
}

/** The most recent day anything under this lesson key was logged, or "". */
function lastActive(log: ContentLog, lessonKey: string): string {
  let latest = "";
  for (const [day, entries] of Object.entries(log)) {
    if (day > latest && Object.hasOwn(entries, lessonKey)) latest = day;
  }
  return latest;
}

/** Which kind a new student is pointed at first within one subject. */
const KIND_ORDER: Record<StudyKind, number> = {
  section: 0,
  flashcards: 1,
  quiz: 2,
  paper: 3,
};

/**
 * A subject's unfinished items, starting from WHERE THE STUDENT IS rather than
 * from the top of the curriculum: after the most recently worked-on item
 * (the furthest one on that day), then wrapping round to anything earlier they
 * skipped. Without this, a student three lessons into a subject was sent back
 * to chapter 1's flashcards before the next section of the lesson they are in.
 */
function upNext(
  items: StudyItem[],
  recency: (i: StudyItem) => string
): StudyItem[] {
  // Anchor on FINISHED work. A half-done deck is already on the card as
  // "continue", and it sits after its lesson's sections in the catalog, so
  // anchoring on it would skip the very sections that come next.
  const anchorOn = items.some((i) => i.done)
    ? (i: StudyItem) => i.done
    : (i: StudyItem) => i.started;
  let anchor = -1;
  let best = "";
  items.forEach((item, index) => {
    if (!anchorOn(item)) return;
    const r = recency(item) || "0";
    if (r >= best) {
      best = r;
      anchor = index;
    }
  });
  const rotated = [...items.slice(anchor + 1), ...items.slice(0, anchor + 1)];
  return rotated.filter((i) => !i.done && !i.started);
}

/** Take from each list in turn, so five rows are not all one subject. */
function roundRobin<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

/**
 * Subjects ordered for a recommendation: what the survey said is weak first
 * (that is what the Bac II punishes), then what the student likes, then the
 * rest in catalog order.
 */
function prioritise(subjects: SubjectId[], input: StudyFeedInput): SubjectId[] {
  const rank = (id: SubjectId) =>
    input.weaknesses.includes(id) ? 0 : input.strengths.includes(id) ? 1 : 2;
  return [...subjects].sort((a, b) => rank(a) - rank(b));
}

export function buildStudyFeed(input: StudyFeedInput): StudyFeed {
  const subjects = allSubjects(input.userLanguage).map((s) => s.id);
  const bySubject = new Map(subjects.map((id) => [id, catalogFor(id, input)]));
  const catalog = [...bySubject.values()].flat();

  const touched = catalog.some((i) => i.done || i.started);

  if (!touched) {
    // A new student: the opening item of each kind per subject — a lesson
    // before its flashcards before a quiz — weak subjects first, interleaved
    // so the card shows a spread rather than one subject. Past papers go LAST:
    // a full exam is not where somebody who has studied nothing should start.
    const learning = prioritise(subjects, input).map((id) => {
      const firstOfKind = new Map<StudyKind, StudyItem>();
      for (const item of bySubject.get(id) ?? []) {
        if (item.kind === "paper") continue;
        if (!firstOfKind.has(item.kind)) firstOfKind.set(item.kind, item);
      }
      return [...firstOfKind.values()].sort(
        (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
      );
    });
    const papers = catalog.filter((i) => i.kind === "paper");
    return {
      mode: "recommend",
      items: [...roundRobin(learning), ...papers].map((i) => ({
        ...i,
        reason: "recommended",
      })),
    };
  }

  const recency = (i: StudyItem) => lastActive(input.contentLog, i.lessonKey);
  const byRecency = (a: StudyItem, b: StudyItem) =>
    recency(b).localeCompare(recency(a));

  // 1. Half-finished decks, most recently touched first — the literal
  //    "continue where you left off".
  const inProgress = catalog.filter((i) => i.started).sort(byRecency);
  // 2. Finished decks the scheduler wants back — spaced repetition.
  const dueAgain = catalog.filter((i) => i.due).sort(byRecency);

  // 3. The next unfinished thing in each subject, in curriculum order, subjects
  //    the student has actually worked in first (most recent first), then the
  //    ones they have not started — weak subjects ahead of the rest.
  const subjectRecency = (id: SubjectId) =>
    (bySubject.get(id) ?? []).reduce((max, i) => {
      const r = i.done || i.started ? recency(i) || "0" : "";
      return r > max ? r : max;
    }, "");
  const active = subjects
    .filter((id) => subjectRecency(id) !== "")
    .sort((a, b) => subjectRecency(b).localeCompare(subjectRecency(a)));
  const fresh = prioritise(
    subjects.filter((id) => !active.includes(id)),
    input
  );
  const nextUp = roundRobin(
    active.map((id) => upNext(bySubject.get(id) ?? [], recency))
  );
  const newSubjects = roundRobin(
    fresh.map((id) => (bySubject.get(id) ?? []).filter((i) => !i.done))
  );

  const seen = new Set<string>();
  const items: RankedItem[] = [];
  const add = (list: StudyItem[], reason: StudyReason) => {
    for (const i of list) {
      if (seen.has(i.id)) continue;
      seen.add(i.id);
      items.push({ ...i, reason });
    }
  };
  add(inProgress, "continue");
  add(dueAgain, "review");
  add(nextUp, "next");
  add(newSubjects, "recommended");

  // Keep the LAST visible slot for a subject not started yet, when there is
  // one. Otherwise a student deep in one subject fills all five rows with it
  // and never sees the weak subject the survey flagged.
  const firstNew = items.findIndex((i) => i.reason === "recommended");
  if (firstNew >= STUDY_FEED_SIZE) {
    const [rec] = items.splice(firstNew, 1);
    items.splice(STUDY_FEED_SIZE - 1, 0, rec);
  }

  return { mode: "continue", items };
}

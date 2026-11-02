import type { ActivityLog, ContentLog } from "@/types";
import {
  lastActive,
  studyCatalog,
  type StudyFeedInput,
  type StudyItem,
} from "@/features/home/study-feed";
import { allSubjects, type SubjectId } from "@/features/lessons/subjects";

/**
 * The Roadmap's plan: real calendar months from when the student started to the
 * exam, each holding real lessons, flashcard decks, quizzes and past papers.
 *
 * DERIVED, NEVER STORED, like the study feed it shares a catalog with. Publishing
 * content adds it here with no edit, and there is no saved plan to go stale or to
 * sync.
 *
 * UNFINISHED WORK ROLLS FORWARD. Only what is left is shared out, from this month
 * to the exam, so a missed week leaves no backlog and no list of failures: the
 * rest of the year simply carries slightly more. So a past month shows what was
 * finished in it, and its unfinished items are in the current month, still one
 * tap away.
 *
 * WHICH MONTH A FINISHED ITEM BELONGS TO IS THE LAST MONTH ITS LESSON WAS WORKED
 * ON. Nothing records the day one section was finished; the content log records
 * days per LESSON, so that is the closest true answer. Going back over a lesson
 * moves its ticks to that month, which is accepted.
 *
 * THE CURRENT MONTH DOES NOT GROW AS IT IS WORKED THROUGH. Its size is worked out
 * from the work left when the month began (what is left now, plus what was
 * finished this month), so finishing an item ticks it rather than pulling in
 * another one to replace it.
 *
 * PURE. `today` and `examMonth` are arguments, for the reasons
 * features/progress/summary.ts gives.
 */

export type MonthStatus = "past" | "current" | "future";

export interface PlanMonth {
  /** `YYYY-MM`, which is also its URL. */
  key: string;
  status: MonthStatus;
  isExam: boolean;
  /** Finished first, then what is left, each in plan order. */
  items: StudyItem[];
  done: number;
  /** Distinct subjects of its items, in order. */
  subjects: SubjectId[];
}

export interface StudyPlan {
  months: PlanMonth[];
  /** Weak subjects with nothing published: the plan cannot include them yet. */
  waiting: SubjectId[];
}

export interface StudyPlanInput extends StudyFeedInput {
  /** Real scores by subject (features/progress/summary.ts), null below a sample. */
  scores: Record<string, { score: number | null }>;
  activityLog: ActivityLog;
  /** `YYYY-MM-DD`, the device's local day. */
  today: string;
  /** `YYYY-MM`. */
  examMonth: string;
}

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isMonthKey(value: string | undefined): value is string {
  return value !== undefined && MONTH_KEY.test(value);
}

function nextMonth(key: string): string {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** The first month with any recorded study, or this month for a new student. */
function firstMonth(log: ContentLog, activity: ActivityLog, current: string): string {
  let first = current;
  for (const day of [...Object.keys(log), ...Object.keys(activity)]) {
    const month = day.slice(0, 7);
    if (MONTH_KEY.test(month) && month < first) first = month;
  }
  return first;
}

/**
 * Hardest subject first. A real score wins once there is one, because it is what
 * the student actually does; until then the survey's answer stands in for it.
 * One number, so a subject scored 40 sits ahead of one merely called weak.
 */
function subjectOrder(ids: SubjectId[], input: StudyPlanInput): SubjectId[] {
  const need = (id: SubjectId) =>
    input.scores[id]?.score ??
    (input.weaknesses.includes(id) ? 30 : input.strengths.includes(id) ? 70 : 50);
  return [...ids].sort((a, b) => need(a) - need(b));
}

function distinctSubjects(items: StudyItem[]): SubjectId[] {
  return [...new Set(items.map((i) => i.subject))];
}

export function buildStudyPlan(input: StudyPlanInput): StudyPlan {
  const current = input.today.slice(0, 7);
  const start = firstMonth(input.contentLog, input.activityLog, current);
  const last = input.examMonth > current ? input.examMonth : current;

  const keys: string[] = [];
  for (let k = start; k <= last; k = nextMonth(k)) keys.push(k);

  const catalog = studyCatalog(input);
  const ordered = subjectOrder([...catalog.keys()], input).flatMap(
    (id) => catalog.get(id) ?? []
  );

  // Where each finished item goes, and what is left to share out.
  const finished = new Map<string, StudyItem[]>();
  for (const item of ordered) {
    if (!item.done) continue;
    const day = lastActive(input.contentLog, item.lessonKey);
    const logged = day.slice(0, 7);
    const month = !logged ? start : logged > current ? current : logged;
    const list = finished.get(month);
    if (list) list.push(item);
    else finished.set(month, [item]);
  }
  const left = ordered.filter((i) => !i.done && i.kind !== "paper");
  const papersLeft = ordered.filter((i) => !i.done && i.kind === "paper");

  // The months that can still take work: this one, then each up to the exam.
  const open = keys.filter((k) => k >= current && k < input.examMonth);
  if (open.length === 0) open.push(current);

  const planned = new Map<string, StudyItem[]>();
  const doneNow = (finished.get(current) ?? []).filter((i) => i.kind !== "paper").length;
  const thisMonth = Math.ceil((left.length + doneNow) / open.length);
  let cursor = Math.max(0, thisMonth - doneNow);
  planned.set(open[0], left.slice(0, cursor));
  open.slice(1).forEach((key, i) => {
    const size = Math.ceil((left.length - cursor) / (open.length - 1 - i));
    planned.set(key, left.slice(cursor, cursor + size));
    cursor += size;
  });

  // Past papers wait for the exam month: not where somebody should start.
  const paperMonth = last === input.examMonth && current < input.examMonth
    ? input.examMonth
    : current;
  planned.set(paperMonth, [...(planned.get(paperMonth) ?? []), ...papersLeft]);

  const months = keys.map((key): PlanMonth => {
    const done = finished.get(key) ?? [];
    const items = [...done, ...(planned.get(key) ?? [])];
    return {
      key,
      status: key < current ? "past" : key === current ? "current" : "future",
      isExam: key === input.examMonth,
      items,
      done: done.length,
      subjects: distinctSubjects(items),
    };
  });

  const offered = new Set(allSubjects(input.userLanguage).map((s) => s.id as string));
  const waiting = [...new Set(input.weaknesses)].filter(
    (id): id is SubjectId =>
      offered.has(id) && (catalog.get(id as SubjectId)?.length ?? 0) === 0
  );

  return { months, waiting };
}

export interface MonthActivity {
  answered: number;
  reviewed: number;
  minutes: number;
}

/** What was really done in one month, from the same logs Progress reads. */
export function monthActivity(
  key: string,
  log: ContentLog,
  activity: ActivityLog
): MonthActivity {
  const total: MonthActivity = { answered: 0, reviewed: 0, minutes: 0 };
  for (const [day, entries] of Object.entries(log)) {
    if (!day.startsWith(key)) continue;
    for (const entry of Object.values(entries)) {
      total.answered += entry.answered;
      total.reviewed += entry.reviewed;
    }
  }
  for (const [day, entry] of Object.entries(activity)) {
    if (day.startsWith(key)) total.minutes += entry?.minutes ?? 0;
  }
  return total;
}

import type { ActivityLog, Lang, Tasks } from "@/types";
import { T } from "@/data/translations";
import { goalTasksDone, isGoalComplete } from "@/utils/streak";
import { addDaysKey, parseDayKey } from "@/utils/day";
import type { SubjectId } from "@/features/lessons/subjects";
import { PROGRESS_COPY } from "./copy";
import type { ProgressSummary } from "./summary";

/**
 * The Study tips card: up to three short, true sentences about the student's
 * own work, with a link where there is somewhere useful to go.
 *
 * RULE-BASED, NO MODEL CALL. This card was "AI Insights" over three invented
 * sentences; a live model call from a bottom-nav tab would spend the daily
 * KruAI budget on a screen nobody asked a question on. Every tip below is a
 * sentence about a number this page already shows, so it cannot claim
 * something the cards beside it contradict.
 *
 * Order is priority: today's goal first (the one thing with a deadline), then
 * the weakest subject, a falling subject, the week, and flashcards due.
 */

export type TipTone = "purple" | "pink" | "blue" | "mint";

export interface StudyTip {
  id: string;
  icon: string;
  tone: TipTone;
  title: string;
  body: string;
  href: string | null;
}

export interface TipsInput {
  summary: ProgressSummary;
  activityLog: ActivityLog;
  streak: number;
  tasks: Tasks;
  tasksDate: string;
  /** Flashcards the student has graded before that are due again. */
  cardsDue: number;
  today: string;
  lang: Lang;
}

const MAX_TIPS = 3;
/** A subject is worth a "focus" tip below this score. */
const WEAK_BELOW = 80;
/** A fall of at least this many points earns its own tip. */
const SLIPPING_PTS = -5;

function studyDays(log: ActivityLog, base: Date, from: number): number {
  let n = 0;
  for (let i = from; i < from + 7; i++) {
    const d = log[addDaysKey(base, -i)];
    if (d && (d.xp > 0 || (d.minutes ?? 0) > 0)) n += 1;
  }
  return n;
}

export function buildStudyTips(input: TipsInput): StudyTip[] {
  const c = PROGRESS_COPY[input.lang];
  const names = T[input.lang];
  const tips: StudyTip[] = [];

  const anyWork =
    Object.keys(input.summary.subjects).length > 0 ||
    Object.values(input.activityLog).some((d) => d.xp > 0);
  if (!anyWork) {
    return [
      { id: "start", icon: "🚀", tone: "purple", ...c.tipStart, href: "/lessons" },
    ];
  }

  const todayTasks = input.tasksDate === input.today ? input.tasks : null;
  const done = todayTasks ? goalTasksDone(todayTasks) : 0;
  if (todayTasks && isGoalComplete(todayTasks)) {
    tips.push({ id: "goal", icon: "🔥", tone: "mint", ...c.tipGoalDone(input.streak), href: "/streak" });
  } else if (input.streak > 0) {
    tips.push({ id: "goal", icon: "🔥", tone: "pink", ...c.tipKeepStreak(input.streak, done), href: "/streak" });
  } else {
    tips.push({ id: "goal", icon: "🔥", tone: "purple", ...c.tipStartStreak(done), href: "/streak" });
  }

  const scored = Object.entries(input.summary.subjects)
    .filter(([, s]) => s.score !== null)
    .sort((a, b) => (a[1].score ?? 0) - (b[1].score ?? 0));
  const weakest = scored[0];
  const weakId = weakest && (weakest[1].score ?? 100) < WEAK_BELOW ? weakest[0] : null;
  if (weakest && weakId) {
    const id = weakId as SubjectId;
    tips.push({
      id: "weakest",
      icon: "🎯",
      tone: "blue",
      ...c.tipWeakest(names[id], weakest[1].score ?? 0),
      href: `/practice/quiz/${id}`,
    });
  }

  const slipping = Object.entries(input.summary.subjects)
    .filter(([id, s]) => s.trendPct !== null && s.trendPct <= SLIPPING_PTS && id !== weakId)
    .sort((a, b) => (a[1].trendPct ?? 0) - (b[1].trendPct ?? 0))[0];
  if (slipping) {
    const id = slipping[0] as SubjectId;
    tips.push({
      id: "slipping",
      icon: "📉",
      tone: "pink",
      ...c.tipDeclining(names[id], slipping[1].trendPct ?? 0),
      href: `/subjects/${id}`,
    });
  }

  const base = parseDayKey(input.today);
  const thisWeek = studyDays(input.activityLog, base, 0);
  const lastWeek = studyDays(input.activityLog, base, 7);
  if (thisWeek > lastWeek && lastWeek > 0) {
    tips.push({ id: "week", icon: "📅", tone: "mint", ...c.tipMoreDays(thisWeek, lastWeek), href: null });
  } else if (thisWeek < lastWeek) {
    tips.push({ id: "week", icon: "📅", tone: "purple", ...c.tipFewerDays(thisWeek, lastWeek), href: null });
  }

  if (input.cardsDue > 0) {
    tips.push({ id: "cards", icon: "🃏", tone: "blue", ...c.tipCardsDue(input.cardsDue), href: "/practice/review" });
  }

  return tips.slice(0, MAX_TIPS);
}

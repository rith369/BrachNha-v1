import type { ActivityLog, ContentLog } from "@/types";
import type { ExamResult, PaperResult } from "@/lib/store";
import { addDaysKey, parseDayKey, todayKey } from "@/utils/day";
import {
  computeCompositeScore,
  computeGradeProbabilities,
  mostLikelyGrade,
  type PredictionInputs,
} from "@/utils/gradeProbability";
import {
  computeGradePrediction,
  type SubjectPrediction,
} from "@/utils/gradePrediction";
import { buildProgressSummary } from "@/features/progress/summary";
import { SUBJECTS, type SubjectId } from "@/features/lessons/subjects";
import { chaptersFor, pathProgress } from "@/features/lessons/sessions";
import { quizPathFor } from "@/features/practice/quiz-path";
import type { ContentManifest } from "@/utils/content-manifest";

/**
 * The Grade Prediction page, computed from the student's OWN work.
 *
 * This replaced `demo-data.ts`, which held a fixed, invented student. Every
 * input below is read from the store, so the page, the Home widget and the
 * Progress page agree: per-subject scores come from the very same
 * `buildProgressSummary()` Progress renders, and nothing here keeps a second
 * copy of any number.
 *
 * PURE and takes `today`, the rule `summary.ts` and `utils/streak.ts` follow.
 *
 * RETURNS A TOTAL OBJECT, NEVER NULL — the React Compiler property
 * `summary.ts`'s header argues for. "Not enough data yet" is the `ready` flag,
 * not a null root, so no card needs a guard above its closures.
 */

/** Scored answers, all time, before a prediction is shown at all. Below this a
 *  letter grade is a guess wearing a percentage. One sat exam or past paper
 *  also qualifies, since that is a whole paper's worth of evidence. */
export const READY_ANSWERS = 20;

/** How many of the most recent exam / past-paper attempts the average uses. */
const RECENT_EXAMS = 10;

/** Days in the consistency window. */
const CONSISTENCY_DAYS = 14;

/** Weekly points on the trend chart, oldest first, ending today. */
const HISTORY_WEEKS = 4;

export interface PredictionInput {
  contentLog: ContentLog;
  activityLog: ActivityLog;
  examResults: ExamResult[];
  paperResults: PaperResult[];
  completedSessions: string[];
  userLanguage: string;
  /** What is published (lib/content.ts): a quiz section counts as playable
   *  only when its quiz is. */
  manifest: ContentManifest;
}

export interface PredictionResult {
  compositeScore: number;
  probabilities: Record<string, number>;
  mostLikely: string;
}

export interface HistoryPoint {
  /** 0 is this week, 3 is three weeks ago. The view turns it into a label. */
  weeksAgo: number;
  /** The composite readiness score (0-100) as of that week. One number where
   *  higher is always better: charting one grade's probability read backwards
   *  whenever that grade was a low one (a falling E line is good news). */
  pct: number;
}

export interface RealPrediction {
  ready: boolean;
  /** Scored answers so far, and how many more until `ready` (0 once ready). */
  answered: number;
  missing: number;
  /** Only subjects with enough answers to score. Empty before any do. */
  subjects: SubjectPrediction[];
  /** Points of change per subject, last 30 days against the 30 before. */
  subjectTrend: Record<string, number>;
  prediction: PredictionResult;
  /** At least two weeks with enough data, or empty: one point is not a trend. */
  history: HistoryPoint[];
  consistencyPct: number;
  trendDeltaPct: number;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((n, v) => n + v, 0) / values.length);
}

/** Correct / answered across every scored answer on or before `upTo`. */
function accuracyUpTo(log: ContentLog, upTo: string) {
  let answered = 0;
  let correct = 0;
  for (const [day, byKey] of Object.entries(log)) {
    if (day > upTo) continue;
    for (const d of Object.values(byKey)) {
      answered += d.answered;
      correct += d.correct;
    }
  }
  return { answered, correct };
}

/** Exam and past-paper percentages sat on or before `upTo`, newest last.
 *  Both store an ISO INSTANT, so each is turned back into a LOCAL day first
 *  (the trap `utils/day.ts` exists for). */
function examPctsUpTo(input: PredictionInput, upTo: string): number[] {
  const all = [
    ...input.examResults.map((r) => ({ date: r.date, pct: r.pct })),
    ...input.paperResults.map((r) => ({ date: r.date, pct: r.pct })),
  ]
    .filter((r) => todayKey(new Date(r.date)) <= upTo)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return all.slice(-RECENT_EXAMS).map((r) => r.pct);
}

function consistencyUpTo(log: ActivityLog, upTo: string): number {
  const base = parseDayKey(upTo);
  let active = 0;
  for (let i = 0; i < CONSISTENCY_DAYS; i++) {
    const d = log[addDaysKey(base, -i)];
    if (d && (d.xp > 0 || (d.minutes ?? 0) > 0)) active += 1;
  }
  return Math.round((active / CONSISTENCY_DAYS) * 100);
}

/**
 * Finished sections over sections that exist, across every subject's Study path
 * and quiz path. Null while the app has no playable content at all, rather than
 * a 0% that would drag every prediction down for a reason that is not the
 * student's. Not windowed by date: `completedSessions` records no dates, so the
 * history points reuse today's figure.
 */
function lessonCompletion(completed: string[], manifest: ContentManifest): number | null {
  let done = 0;
  let total = 0;
  for (const { id } of SUBJECTS) {
    const study = pathProgress(chaptersFor(id as SubjectId), completed);
    done += study.done;
    total += study.playable;
    const quiz = quizPathFor(id as SubjectId, manifest);
    if (quiz) {
      const playable = quiz.flatMap((c) =>
        c.lessons.flatMap((l) => l.sessions.filter((s) => s.href))
      );
      done += playable.filter((s) => completed.includes(s.id)).length;
      total += playable.length;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : null;
}

interface Snapshot {
  ready: boolean;
  answered: number;
  performance: Partial<Record<string, number>>;
  subjectTrend: Record<string, number>;
  consistencyPct: number;
  trendDeltaPct: number;
  prediction: PredictionResult;
}

function snapshot(
  input: PredictionInput,
  day: string,
  completionPct: number | null
): Snapshot {
  const summary = buildProgressSummary(
    input.contentLog,
    input.activityLog,
    input.examResults,
    day
  );

  const performance: Partial<Record<string, number>> = {};
  const subjectTrend: Record<string, number> = {};
  const trends: number[] = [];
  for (const [subject, stat] of Object.entries(summary.subjects)) {
    if (stat.score !== null) performance[subject] = stat.score;
    if (stat.trendPct !== null) {
      subjectTrend[subject] = stat.trendPct;
      trends.push(stat.trendPct);
    }
  }

  const { answered, correct } = accuracyUpTo(input.contentLog, day);
  const exams = examPctsUpTo(input, day);
  const consistencyPct = consistencyUpTo(input.activityLog, day);
  const trendDeltaPct = average(trends) ?? 0;

  const inputs: PredictionInputs = {
    quizPct: answered > 0 ? Math.round((correct / answered) * 100) : null,
    mockExamPct: average(exams),
    lessonCompletionPct: completionPct,
    consistencyPct,
    trendDeltaPct,
  };
  const compositeScore = computeCompositeScore(inputs);
  const probabilities = computeGradeProbabilities(compositeScore);

  return {
    ready: answered >= READY_ANSWERS || exams.length > 0,
    answered,
    performance,
    subjectTrend,
    consistencyPct,
    trendDeltaPct,
    prediction: {
      compositeScore,
      probabilities,
      mostLikely: mostLikelyGrade(probabilities),
    },
  };
}

export function buildRealPrediction(
  input: PredictionInput,
  today: string
): RealPrediction {
  const completionPct = lessonCompletion(input.completedSessions, input.manifest);
  const now = snapshot(input, today, completionPct);
  const { subjects } = computeGradePrediction(
    now.performance,
    input.userLanguage
  );

  // Re-run the same calculation as of the end of each earlier week. Nothing is
  // stored for this: the logs already hold every day, so the chart is real
  // history rather than a series someone has to remember to append to.
  const base = parseDayKey(today);
  const history: HistoryPoint[] = [];
  for (let w = HISTORY_WEEKS - 1; w >= 0; w--) {
    const snap =
      w === 0 ? now : snapshot(input, addDaysKey(base, -7 * w), completionPct);
    if (!snap.ready) continue;
    history.push({
      weeksAgo: w,
      pct: snap.prediction.compositeScore,
    });
  }

  return {
    ready: now.ready,
    answered: now.answered,
    missing: now.ready ? 0 : Math.max(0, READY_ANSWERS - now.answered),
    subjects,
    subjectTrend: now.subjectTrend,
    prediction: now.prediction,
    history: history.length >= 2 ? history : [],
    consistencyPct: now.consistencyPct,
    trendDeltaPct: now.trendDeltaPct,
  };
}

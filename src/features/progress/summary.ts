import type { ActivityLog, ContentLog, ContentDay } from "@/types";
import type { ExamResult } from "@/lib/store";
import { addDaysKey, parseDayKey } from "@/utils/day";
import { subjectOfKey } from "./content-keys";

/**
 * Every number the Progress dashboard shows, derived in one place.
 *
 * PURE, and it takes `today` as an argument rather than calling todayKey()
 * itself — the same rule utils/streak.ts follows, for the same two reasons: it
 * keeps `new Date()` out of component bodies (which is what oxlint's
 * react(purity) rule and the React Compiler both object to), and it makes every
 * window here testable against a fixed date.
 *
 * ── buildProgressSummary RETURNS A TOTAL OBJECT, NEVER NULL ──────────────────
 *
 * This is a React Compiler safety property, not a style choice. A
 * `ProgressSummary | null` would put `if (!summary) return <Empty/>` in every
 * card, and the compiler narrows a closure's memo dependency to the exact
 * property path it reads and emits that check where the closure is BUILT —
 * above any guard later in source order. That is the crash documented in
 * review-session.tsx, reproduced once per card. So nullability lives on the
 * LEAF fields (`pct: number | null`), where reading it cannot throw, and there
 * is no root guard whose position anyone can get wrong.
 */

/** Below this many answered questions a percentage is noise dressed as a
 *  finding — one right answer out of two is not "50% in Chemistry". */
const MIN_SAMPLE = 5;

/** Days in each half of the trend comparison. */
const TREND_WINDOW_DAYS = 30;

/** Days in the rolling week, and in the sparkline. */
const WEEK_DAYS = 7;

export interface SubjectStat {
  questions: number;
  correct: number;
  /** 0-100, or null when too few questions have been answered to mean anything. */
  score: number | null;
  /**
   * Percentage POINTS against the previous 30 days, or null when either window
   * is below MIN_SAMPLE. Not a ratio — "+6" means six points, not six percent.
   */
  trendPct: number | null;
  /**
   * WEEK_DAYS values, 0-100, of daily question VOLUME scaled against this
   * subject's own peak for the week. Null when nothing was answered all week.
   *
   * Volume rather than accuracy, which is what the demo sparklines implied:
   * real daily accuracy on a one-question day swings to 0 or 100 and the strip
   * becomes noise. Volume degrades to a flat empty strip instead.
   */
  sparkline: number[] | null;
  /** Distinct sittings — (day, content) pairs carrying at least one session. */
  sessions: number;
}

export interface WeekDay {
  /** `YYYY-MM-DD`. */
  key: string;
  /** "Mon". en-GB, matching formatHeatmapCellLabel's existing choice. */
  label: string;
  xp: number;
  /**
   * ACTIVE study minutes, as counted — no conversion.
   *
   * MINUTES RATHER THAN HOURS, and the unit is the whole point at this
   * granularity. This is ONE DAY, and a real day of study here is single or
   * double digit minutes, which in hours is 0.1 — so a student who studied for
   * six minutes read the chart as a flat line at zero and reasonably concluded
   * the timer was broken. That was reported. An hours axis only starts saying
   * anything at half an hour a day, which is not the scale this app is used at.
   *
   * The monthly Study Time tile still switches to hours past 60 (see
   * score-hero.tsx) — a MONTH's total genuinely does outgrow minutes, where a
   * single day's does not.
   */
  minutes: number;
}

export interface ProgressSummary {
  /**
   * Mean exam percentage this calendar month, and the change in POINTS against
   * last month. Both null when the month holds no exams — never 0, which would
   * claim exams were sat and failed.
   */
  overall: { pct: number | null; changePct: number | null; examCount: number };
  questionsThisMonth: number;
  /** Correct / answered this month, 0-100. Null below MIN_SAMPLE. */
  accuracyPct: number | null;
  xpThisMonth: number;
  /** ACTIVE study minutes this month. 0 is honest here — unlike a percentage,
   *  "you have studied for no minutes yet" is a true and useful thing to say. */
  minutesThisMonth: number;
  /**
   * A ROLLING 7 days ending today, not a fixed Mon-Sun. Always exactly 7
   * entries, so the chart never shrinks on a Monday, and no future day is ever
   * plotted at 0 — the rule buildHeatmapWeeks already applies to its own grid.
   */
  week: WeekDay[];
  /** Against the previous rolling 7 days, in percent. Null when that week was
   *  empty: any change from zero is infinite, not a percentage. */
  weekChangePct: number | null;
  /** The best day in `week`, or null when the whole week is empty — the footer
   *  goes absent rather than reading "Highest productivity on Mon (0 XP)". */
  bestDay: WeekDay | null;
  /** Keyed by subject id. Only subjects with recorded work appear; callers walk
   *  the catalog and treat a miss as not-started. */
  subjects: Record<string, SubjectStat>;
}

const EMPTY: ContentDay = { answered: 0, correct: 0, reviewed: 0, sessions: 0 };

interface RangeTotal extends ContentDay {
  /** Distinct (day, content) pairs with work, not the sum of their counters. */
  sittings: number;
}

/**
 * Sums every content entry in the inclusive day range whose subject matches,
 * or across all subjects when `subject` is null. Day keys are `YYYY-MM-DD`, so
 * they compare lexicographically and no parsing is needed to window them.
 */
function sumRange(
  log: ContentLog,
  from: string,
  to: string,
  subject: string | null
): RangeTotal {
  const acc: RangeTotal = { ...EMPTY, sittings: 0 };
  for (const [day, byKey] of Object.entries(log)) {
    if (day < from || day > to) continue;
    for (const [key, d] of Object.entries(byKey)) {
      if (subject !== null && subjectOfKey(key) !== subject) continue;
      acc.answered += d.answered;
      acc.correct += d.correct;
      acc.reviewed += d.reviewed;
      acc.sessions += d.sessions;
      if (d.sessions > 0) acc.sittings += 1;
    }
  }
  return acc;
}

function pctOf(correct: number, answered: number): number | null {
  return answered >= MIN_SAMPLE ? Math.round((correct / answered) * 100) : null;
}

function monthAverage(results: ExamResult[], prefix: string) {
  const inMonth = results.filter((r) => r.date.startsWith(prefix));
  if (inMonth.length === 0) return null;
  const sum = inMonth.reduce((n, r) => n + r.pct, 0);
  return { pct: Math.round(sum / inMonth.length), count: inMonth.length };
}

/** `YYYY-MM` of the month `back` months before the one `dayKey` falls in. */
function monthPrefix(dayKey: string, back: number): string {
  const d = parseDayKey(dayKey);
  d.setDate(1);
  d.setMonth(d.getMonth() - back);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function buildProgressSummary(
  contentLog: ContentLog,
  activityLog: ActivityLog,
  examResults: ExamResult[],
  today: string
): ProgressSummary {
  const thisMonth = monthAverage(examResults, monthPrefix(today, 0));
  const lastMonth = monthAverage(examResults, monthPrefix(today, 1));

  const monthStart = `${monthPrefix(today, 0)}-01`;
  const month = sumRange(contentLog, monthStart, today, null);

  let xpThisMonth = 0;
  let minutesThisMonth = 0;
  for (const [day, d] of Object.entries(activityLog)) {
    if (day < monthStart || day > today) continue;
    xpThisMonth += d.xp;
    minutesThisMonth += d.minutes ?? 0;
  }

  const base = parseDayKey(today);

  const week: WeekDay[] = [];
  for (let i = WEEK_DAYS - 1; i >= 0; i--) {
    const key = addDaysKey(base, -i);
    const day = activityLog[key];
    week.push({
      key,
      label: parseDayKey(key).toLocaleDateString("en-GB", { weekday: "short" }),
      xp: day?.xp ?? 0,
      minutes: day?.minutes ?? 0,
    });
  }
  const weekXp = week.reduce((n, d) => n + d.xp, 0);

  let prevWeekXp = 0;
  for (let i = WEEK_DAYS; i < WEEK_DAYS * 2; i++) {
    prevWeekXp += activityLog[addDaysKey(base, -i)]?.xp ?? 0;
  }

  const best = week.reduce((a, b) => (b.xp > a.xp ? b : a), week[0]);

  const recentFrom = addDaysKey(base, -(TREND_WINDOW_DAYS - 1));
  const priorFrom = addDaysKey(base, -(TREND_WINDOW_DAYS * 2 - 1));
  const priorTo = addDaysKey(base, -TREND_WINDOW_DAYS);

  // Only subjects with work recorded get an entry. A subject whose only content
  // key failed subjectOfKey() — a student-authored card with a random id — is
  // correctly absent rather than attributed to whatever its id happened to spell.
  const seen = new Set<string>();
  for (const byKey of Object.values(contentLog)) {
    for (const key of Object.keys(byKey)) {
      const subject = subjectOfKey(key);
      if (subject) seen.add(subject);
    }
  }

  const subjects: Record<string, SubjectStat> = {};
  for (const subject of seen) {
    // "0000-00-00" is before any real key, so this is "everything the log still
    // holds" — which is already bounded to MAX_ACTIVITY_DAYS by the store.
    const all = sumRange(contentLog, "0000-00-00", today, subject);
    const recent = sumRange(contentLog, recentFrom, today, subject);
    const prior = sumRange(contentLog, priorFrom, priorTo, subject);

    const recentPct = pctOf(recent.correct, recent.answered);
    const priorPct = pctOf(prior.correct, prior.answered);

    const daily: number[] = [];
    for (let i = WEEK_DAYS - 1; i >= 0; i--) {
      const day = contentLog[addDaysKey(base, -i)] ?? {};
      let n = 0;
      for (const [key, d] of Object.entries(day)) {
        if (subjectOfKey(key) === subject) n += d.answered + d.reviewed;
      }
      daily.push(n);
    }
    const peak = Math.max(...daily);

    subjects[subject] = {
      questions: all.answered,
      correct: all.correct,
      score: pctOf(all.correct, all.answered),
      trendPct:
        recentPct !== null && priorPct !== null ? recentPct - priorPct : null,
      sparkline:
        peak > 0 ? daily.map((n) => Math.round((n / peak) * 100)) : null,
      sessions: all.sittings,
    };
  }

  return {
    overall: {
      pct: thisMonth?.pct ?? null,
      changePct: thisMonth && lastMonth ? thisMonth.pct - lastMonth.pct : null,
      examCount: thisMonth?.count ?? 0,
    },
    questionsThisMonth: month.answered,
    accuracyPct: pctOf(month.correct, month.answered),
    xpThisMonth,
    minutesThisMonth,
    week,
    weekChangePct:
      prevWeekXp > 0
        ? Math.round(((weekXp - prevWeekXp) / prevWeekXp) * 100)
        : null,
    bestDay: best.xp > 0 ? best : null,
    subjects,
  };
}

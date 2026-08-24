/**
 * Leaderboard maths and wording. Pure functions only — the roster itself lives
 * in features/leaderboard/demo-data.ts and is passed in, the same way
 * utils/gradePrediction.ts takes subject performance rather than importing it.
 *
 * The important idea in here: there are THREE boards, not one board with three
 * columns. Each metric is ranked independently, so a student can sit at #3 on
 * streak, #18 on XP and #24 on study time at the same time. Nothing in this file
 * blends the three into a composite score, deliberately — a composite would let
 * hours-in-app buy a rank that learning should have earned.
 */
import type { Lang } from "@/types";

export type LeaderboardMetric = "streak" | "xp" | "studyTime";
export type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

export const METRICS: LeaderboardMetric[] = ["streak", "xp", "studyTime"];
export const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "allTime"];

/** Progression titles, ordered weakest → strongest. */
export type StudentTitle =
  | "beginner"
  | "learner"
  | "scholar"
  | "achiever"
  | "expert"
  | "master";

export interface MetricStats {
  xp: number;
  streak: number;
  studyMinutes: number;
}

/**
 * One student's demo row. Only the WEEKLY numbers are written out; the monthly
 * and all-time windows are derived from them by a per-student factor. That's
 * both less data to keep consistent and more honest — a student who put in a
 * heavy month earned more XP and logged more minutes that month, so one factor
 * moves both. The boards still reorder between periods because the factors
 * differ per student and the weekly orderings already differ per metric.
 *
 * Streak can't be scaled that way (a 4x multiplier on "days in a row" is
 * meaningless), so the longer windows carry their own explicit values:
 * `streakMonth` is the longest run inside the last 30 days, `streakAllTime` the
 * longest run ever. Both are >= the current weekly streak by definition.
 */
export interface LeaderboardStudent {
  id: string;
  name: string;
  avatarSeed: string;
  /** The signed-in student. Exactly one row in the roster carries this. */
  isCurrentUser?: boolean;
  weekly: MetricStats;
  monthFactor: number;
  allTimeFactor: number;
  streakMonth: number;
  streakAllTime: number;
  /** Positions moved on THIS WEEK's board, per metric. Scaled down for the
   *  longer windows by positionChange() — an all-time board barely moves. */
  momentum: Record<LeaderboardMetric, number>;
}

export interface RankedStudent {
  student: LeaderboardStudent;
  /** 1-based position on the board being viewed. */
  rank: number;
  stats: MetricStats;
  /** The selected metric's value, already pulled out of `stats`. */
  value: number;
  /** Overall progression, NOT a function of the selected board. */
  title: StudentTitle;
  /** Positions moved since the previous window. Positive = climbing. */
  change: number;
}

// XP reads as a round number on a board; minutes to the nearest 5 avoids
// "13h 07m" precision the demo can't justify.
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function statsFor(
  student: LeaderboardStudent,
  period: LeaderboardPeriod
): MetricStats {
  if (period === "weekly") return student.weekly;

  const monthly = period === "monthly";
  const factor = monthly ? student.monthFactor : student.allTimeFactor;
  return {
    xp: roundTo(student.weekly.xp * factor, monthly ? 10 : 50),
    streak: monthly ? student.streakMonth : student.streakAllTime,
    studyMinutes: roundTo(student.weekly.studyMinutes * factor, 5),
  };
}

export function metricValue(
  stats: MetricStats,
  metric: LeaderboardMetric
): number {
  if (metric === "xp") return stats.xp;
  if (metric === "streak") return stats.streak;
  return stats.studyMinutes;
}

/**
 * A leaderboard moves less the longer the window it covers: a week's board is
 * volatile, an all-time board is close to frozen. `momentum` is authored for
 * the weekly board, so the other two are damped rather than stored separately.
 */
export function positionChange(
  student: LeaderboardStudent,
  metric: LeaderboardMetric,
  period: LeaderboardPeriod
): number {
  const weekly = student.momentum[metric];
  if (period === "weekly") return weekly;
  if (period === "monthly") return Math.round(weekly / 2);
  return Math.trunc(weekly / 4);
}

/**
 * Titles come from ALL-TIME XP, whichever board is on screen. A title is who
 * the student has become across the whole app; it must not flicker between
 * "Scholar" and "Expert" as they tap between tabs.
 */
const TITLE_THRESHOLDS: [StudentTitle, number][] = [
  ["master", 34000],
  ["expert", 27000],
  ["achiever", 21000],
  ["scholar", 15000],
  ["learner", 9000],
];

export function titleFor(student: LeaderboardStudent): StudentTitle {
  const lifetimeXp = statsFor(student, "allTime").xp;
  for (const [title, floor] of TITLE_THRESHOLDS) {
    if (lifetimeXp >= floor) return title;
  }
  return "beginner";
}

/**
 * Ranks the whole roster on one metric for one period.
 *
 * Ties get ordinal ranks (…#11, #12…) rather than shared ones, because every
 * "N to reach #X" message below is written against the row directly above, and
 * a shared rank makes that sentence point at nothing. Ties break on the other
 * two metrics and finally on name, so the order is stable across renders.
 */
export function rankBoard(
  students: LeaderboardStudent[],
  metric: LeaderboardMetric,
  period: LeaderboardPeriod
): RankedStudent[] {
  return students
    .map((student) => {
      const stats = statsFor(student, period);
      return {
        student,
        stats,
        value: metricValue(stats, metric),
        title: titleFor(student),
        change: positionChange(student, metric, period),
        rank: 0,
      };
    })
    .sort(
      (a, b) =>
        b.value - a.value ||
        b.stats.xp - a.stats.xp ||
        b.stats.studyMinutes - a.stats.studyMinutes ||
        b.stats.streak - a.stats.streak ||
        a.student.name.localeCompare(b.student.name)
    )
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/**
 * The two metrics shown as supporting stats beside the one being ranked, in the
 * order they're read. XP comes before study time wherever both are supporting,
 * because XP is the metric the product actually wants students chasing.
 */
export function supportingMetrics(
  metric: LeaderboardMetric
): [LeaderboardMetric, LeaderboardMetric] {
  if (metric === "xp") return ["streak", "studyTime"];
  if (metric === "streak") return ["xp", "studyTime"];
  return ["xp", "streak"];
}

export function findCurrentUser(board: RankedStudent[]): RankedStudent | null {
  return board.find((row) => row.student.isCurrentUser) ?? null;
}

/**
 * How much more of the selected metric it would take to pass the student one
 * place above. 0 at #1 (there is nobody above), and never below the smallest
 * meaningful unit — "0 XP to reach #17" would be nonsense on a tie.
 *
 * Takes no metric: every row on the board already carries the selected metric's
 * value, which is also what guarantees this can't be computed against a
 * different board than the one on screen.
 */
export function gapToNext(board: RankedStudent[], rank: number): number {
  if (rank <= 1) return 0;
  const me = board[rank - 1];
  const above = board[rank - 2];
  if (!me || !above) return 0;
  return Math.max(1, above.value - me.value);
}

// ── Formatting ───────────────────────────────────────────────────────────────
// Numerals and units stay Latin in both languages, the same rule the AI mentor
// follows: a student meets "18h 42m" and "2,430 XP" in that form everywhere
// else in the app, so translating the digits would be the confusing choice.

export function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

export function formatXp(xp: number): string {
  return xp.toLocaleString("en-US");
}

/** Bare value, no unit — for the big number on a podium or a row. */
export function formatMetricValue(
  value: number,
  metric: LeaderboardMetric
): string {
  if (metric === "xp") return formatXp(value);
  if (metric === "studyTime") return formatStudyTime(value);
  return String(value);
}

/** Value plus its unit, for supporting stats and the summary card. */
export function formatMetricWithUnit(
  value: number,
  metric: LeaderboardMetric,
  lang: Lang
): string {
  if (metric === "xp") return `${formatXp(value)} XP`;
  if (metric === "studyTime") return formatStudyTime(value);
  return lang === "en"
    ? `${value} ${value === 1 ? "day" : "days"}`
    : `${value} ថ្ងៃ`;
}

// ── Wording ──────────────────────────────────────────────────────────────────
// Sentences are built here rather than in data/translations.ts because every
// one of them interpolates a number. The fixed labels (metric names, period
// names, titles) DO live in translations.ts, since the nav and the page header
// need them too.

function periodPhrase(period: LeaderboardPeriod, lang: Lang): string {
  if (lang === "en") {
    return period === "weekly"
      ? "this week"
      : period === "monthly"
        ? "this month"
        : "all-time";
  }
  return period === "weekly"
    ? "សប្តាហ៍នេះ"
    : period === "monthly"
      ? "ខែនេះ"
      : "គ្រប់ពេលវេលា";
}

/** Card heading: "Your Weekly Progress". */
export function summaryHeading(period: LeaderboardPeriod, lang: Lang): string {
  if (lang === "en") {
    return period === "weekly"
      ? "Your Weekly Progress"
      : period === "monthly"
        ? "Your Monthly Progress"
        : "Your All-time Progress";
  }
  return period === "weekly"
    ? "វឌ្ឍនភាពប្រចាំសប្តាហ៍របស់អ្នក"
    : period === "monthly"
      ? "វឌ្ឍនភាពប្រចាំខែរបស់អ្នក"
      : "វឌ្ឍនភាពគ្រប់ពេលវេលារបស់អ្នក";
}

/**
 * The headline encouragement. Phrased around what the student HAS done, never
 * around what they are behind on — the board is meant to pull them back into a
 * lesson, not to rank them as a person.
 */
export function motivationLine(
  metric: LeaderboardMetric,
  period: LeaderboardPeriod,
  lang: Lang,
  ctx: { rank: number; stats: MetricStats }
): string {
  const when = periodPhrase(period, lang);
  if (metric === "streak") {
    return lang === "en"
      ? `You're on a ${ctx.stats.streak}-day streak`
      : `អ្នកកំពុងសិក្សាជាប់គ្នា ${ctx.stats.streak} ថ្ងៃ`;
  }
  if (metric === "studyTime") {
    const time = formatStudyTime(ctx.stats.studyMinutes);
    return lang === "en"
      ? `${time} of productive study ${when}`
      : `សិក្សាប្រកបដោយផលិតភាព ${time} ${when}`;
  }
  return lang === "en"
    ? `You're #${ctx.rank} ${when}`
    : `អ្នកនៅចំណាត់ថ្នាក់ទី ${ctx.rank} ${when}`;
}

/** "Only 60 XP to reach #17" — the single most actionable line on the page. */
export function gapLine(
  metric: LeaderboardMetric,
  lang: Lang,
  gap: number,
  targetRank: number
): string {
  if (gap <= 0) {
    return lang === "en"
      ? "You're #1 — nobody above you 🎉"
      : "អ្នកនៅលេខ ១ — គ្មាននរណាខ្ពស់ជាងអ្នកទេ 🎉";
  }
  if (metric === "xp") {
    return lang === "en"
      ? `Only ${formatXp(gap)} XP to reach #${targetRank}`
      : `ត្រូវការតែ ${formatXp(gap)} XP ទៀត ដើម្បីឡើងដល់លេខ ${targetRank}`;
  }
  if (metric === "studyTime") {
    return lang === "en"
      ? `${formatStudyTime(gap)} to reach #${targetRank}`
      : `ត្រូវការ ${formatStudyTime(gap)} ទៀត ដើម្បីឡើងដល់លេខ ${targetRank}`;
  }
  return lang === "en"
    ? `${gap} ${gap === 1 ? "day" : "days"} to reach #${targetRank}`
    : `ត្រូវការ ${gap} ថ្ងៃទៀត ដើម្បីឡើងដល់លេខ ${targetRank}`;
}

/** Streak-only nudge: the next rung is always exactly one day away. */
export function tomorrowLine(streak: number, lang: Lang): string {
  return lang === "en"
    ? `Keep studying tomorrow to reach ${streak + 1} days`
    : `សិក្សាបន្តថ្ងៃស្អែក ដើម្បីឈានដល់ ${streak + 1} ថ្ងៃ`;
}

/** Only rendered while `change` is positive — see the note in the summary. */
export function climbLine(
  change: number,
  period: LeaderboardPeriod,
  lang: Lang
): string {
  const when = periodPhrase(period, lang);
  return lang === "en"
    ? `You're climbing! ↑ ${change} ${change === 1 ? "position" : "positions"} ${when}`
    : `អ្នកកំពុងឡើង! ↑ ${change} ចំណាត់ថ្នាក់ ${when}`;
}

/** Sits under the big rank number: "of 30 students". */
export function ofStudentsLine(total: number, lang: Lang): string {
  return lang === "en"
    ? `of ${total} students`
    : `ក្នុងចំណោមសិស្ស ${total} នាក់`;
}

/**
 * The caption under a bare metric value. Study time formats its own units
 * ("8h 42m"), so it labels what the number IS rather than repeating them.
 */
export function metricUnitLabel(
  metric: LeaderboardMetric,
  lang: Lang
): string {
  if (metric === "xp") return lang === "en" ? "XP" : "ពិន្ទុ XP";
  if (metric === "streak") return lang === "en" ? "days in a row" : "ថ្ងៃជាប់គ្នា";
  return lang === "en" ? "studied" : "បានសិក្សា";
}

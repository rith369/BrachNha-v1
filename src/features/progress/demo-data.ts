// ============================================================
// DEMO DATA — Progress Dashboard
// ------------------------------------------------------------
// Deliberately fake, fixed numbers (ported from the original
// kruai-progress.html static demo). Chosen over real store data
// so this dashboard always renders something polished and never
// breaks on an edge case like a brand-new user with zero exams.
//
// When real per-subject tracking + a daily activity log exist,
// swap this file's contents for live selectors off useBrachNhaStore
// — every component below only reads from here, so that's a
// one-file change.
//
// FAKE NUMBERS, REAL SUBJECTS. The numbers may be invented; the
// list of subjects they are attached to may not. This file used to
// carry its own subject list — five hand-written rows including a
// "Geo" that the app has never had a lesson, an exam paper or a
// colour token for, alongside two spellings of the other four
// ("Chem"/"Chemistry") and the shared brand accents rather than the
// per-subject palette every other screen keys off. `subjectStats`
// below is now keyed by SubjectId, so a subject that is not in the
// catalog cannot be given a score, and ../subjects.ts supplies the
// name, icon and colour from that same catalog.
// ============================================================

import type { SubjectId } from "@/features/lessons/subjects";

export const overallReadiness = {
  pct: 83,
  change: "▲ +8% vs last month",
};

export interface DailyActivity {
  day: string;
  xp: number;
  /** Study time, in hours, to one decimal place. */
  hours: number;
}

// One week, Mon..Sun, both metrics WeeklyActivityChart's toggle can show.
export const weeklyActivity: DailyActivity[] = [
  { day: "Mon", xp: 20, hours: 0.5 },
  { day: "Tue", xp: 45, hours: 1.2 },
  { day: "Wed", xp: 35, hours: 0.8 },
  { day: "Thu", xp: 70, hours: 1.8 },
  { day: "Fri", xp: 85, hours: 2.2 },
  { day: "Sat", xp: 120, hours: 3.0 },
  { day: "Sun", xp: 100, hours: 2.5 },
];

// The chart's footer compares this week to LAST week — a week that, unlike
// "Highest productivity", was never plotted, so there's nothing in
// weeklyActivity to derive it from. Fixed, same idiom as
// overallReadiness.change above, rather than fabricated data for a week that
// doesn't exist on screen.
export const weeklyActivityChangePct: Record<"xp" | "hours", number> = {
  xp: 28,
  hours: 15,
};

export interface SubjectStats {
  sessions: number;
  questions: number;
  score: number;
  /**
   * Signed percentage change, ONE field rather than the old
   * `trend: "▲ +6%"` string beside a `trendUp` boolean — two hand-written
   * values describing one fact, free to disagree. The arrow and the colour
   * are derived from the sign at render time.
   */
  trendPct: number;
  /** 7 relative heights, 0-100. */
  sparkline: number[];
}

/**
 * Keyed by SubjectId, so every row belongs to a subject the app actually
 * teaches and a missing row fails to compile rather than rendering blank.
 * The bar chart and the breakdown list both read this, which is what stops a
 * subject's question count differing between the two cards the way Math's
 * once could.
 *
 * ENGLISH AND FRENCH CARRY IDENTICAL NUMBERS on purpose. Only one of them is
 * ever on screen (the student picks at Login), so they are one "your language
 * subject" row shown twice — and keeping them equal is what lets the
 * Questions total below be computed without knowing which was chosen.
 */
export const subjectStats: Record<SubjectId, SubjectStats> = {
  math: {
    sessions: 24,
    questions: 98,
    score: 78,
    trendPct: 6,
    sparkline: [40, 55, 50, 65, 70, 75, 78],
  },
  physics: {
    sessions: 22,
    questions: 85,
    score: 91,
    trendPct: 11,
    sparkline: [55, 65, 72, 78, 84, 88, 91],
  },
  chemistry: {
    sessions: 18,
    questions: 72,
    score: 65,
    trendPct: -2,
    sparkline: [70, 68, 72, 66, 60, 63, 65],
  },
  biology: {
    sessions: 12,
    questions: 54,
    score: 54,
    trendPct: 3,
    sparkline: [48, 50, 45, 52, 50, 53, 54],
  },
  history: {
    sessions: 9,
    questions: 41,
    score: 72,
    trendPct: 4,
    sparkline: [60, 62, 66, 64, 70, 71, 72],
  },
  khmer: {
    sessions: 11,
    questions: 46,
    score: 80,
    trendPct: 2,
    sparkline: [72, 74, 73, 76, 78, 79, 80],
  },
  english: {
    sessions: 8,
    questions: 36,
    score: 69,
    trendPct: -3,
    sparkline: [75, 73, 74, 70, 68, 70, 69],
  },
  french: {
    sessions: 8,
    questions: 36,
    score: 69,
    trendPct: -3,
    sparkline: [75, 73, 74, 70, 68, 70, 69],
  },
};

/**
 * The hero's "Questions" figure, SUMMED from the rows above rather than
 * authored beside them — the same rule lessonCountFor() follows on the Study
 * page. The old hand-written 342 was the sum of the five subjects this file
 * used to list, geography included, so removing that subject would have left
 * a total no row on the page adds up to.
 *
 * French is skipped rather than filtered by the student's choice because the
 * two language rows are deliberately identical; see subjectStats.
 */
export const totalQuestions = (
  Object.entries(subjectStats) as [SubjectId, SubjectStats][]
)
  .filter(([id]) => id !== "french")
  .reduce((sum, [, s]) => sum + s.questions, 0);

export const miniMetrics = [
  { label: "Questions", value: String(totalQuestions), color: "text-pink" },
  { label: "Study Time", value: "28h", color: "text-blue" },
  { label: "Day Streak", value: "12🔥", color: "text-mint" },
  { label: "XP Earned", value: "1,240", color: "text-yellow" },
];

export const focusAreas = [
  {
    icon: "⚠️",
    label: "Need Work",
    kind: "weak" as const,
    topic: "Oxidation States",
    sub: "Chemistry · 48% avg",
  },
  {
    icon: "⭐",
    label: "Strongest",
    kind: "strong" as const,
    topic: "Mechanics",
    sub: "Physics · 95% avg",
  },
  {
    icon: "📉",
    label: "Declining",
    kind: "weak" as const,
    topic: "Organic Chem",
    sub: "Chemistry · ▼ -5%",
  },
  {
    icon: "🚀",
    label: "Most Improved",
    kind: "strong" as const,
    topic: "Calculus",
    sub: "Math · ▲ +14%",
  },
];

// 4 weeks x 7 days (Sun..Sat), REAL question counts rather than a pre-bucketed
// 0-4 level. utils/activity-heatmap.ts derives both the colour level and the
// calendar date each cell represents from this, so the number in a cell's tap
// tooltip and the shade it's painted can never disagree with each other.
export const activityHeatmap: number[][] = [
  [0, 2, 5, 9, 5, 13, 0],
  [5, 13, 9, 13, 9, 5, 0],
  [2, 9, 13, 13, 13, 9, 0],
  [5, 13, 9, 13, 5, 0, 0],
];

export const aiInsights = [
  {
    icon: "💡",
    title: "Study Tip",
    body: "Your Physics score jumps after morning sessions. Try studying it before 10am!",
    color: "purple" as const,
  },
  {
    icon: "⚠️",
    title: "Watch Out",
    body: "Chemistry is dropping. You haven't practiced Organic in 5 days.",
    color: "pink" as const,
  },
  {
    icon: "🎯",
    title: "Next Goal",
    body: "Reach 85% avg score to unlock the Gold badge. Only 2% away!",
    color: "blue" as const,
  },
];

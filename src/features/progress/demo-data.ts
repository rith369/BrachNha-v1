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
// ============================================================

export const overallReadiness = {
  pct: 83,
  change: "▲ +8% vs last month",
};

export const miniMetrics = [
  { label: "Questions", value: "342", color: "text-pink" },
  { label: "Study Time", value: "28h", color: "text-blue" },
  { label: "Day Streak", value: "12🔥", color: "text-mint" },
  { label: "XP Earned", value: "1,240", color: "text-yellow" },
];

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

export const questionsPerSubject = [
  { subject: "Math", value: 98, color: "var(--color-purple)" },
  { subject: "Chem", value: 72, color: "var(--color-blue)" },
  { subject: "Phys", value: 85, color: "var(--color-pink)" },
  { subject: "Bio", value: 54, color: "var(--color-mint)" },
  { subject: "Geo", value: 33, color: "var(--color-yellow)" },
];

export interface SubjectBreakdown {
  emoji: string;
  name: string;
  sessions: number;
  questions: number;
  score: number;
  trend: string;
  trendUp: boolean;
  color: string;
  sparkline: number[]; // 7 relative heights, 0-100
}

export const subjectBreakdown: SubjectBreakdown[] = [
  {
    emoji: "🧮",
    name: "Mathematics",
    sessions: 24,
    questions: 98,
    score: 78,
    trend: "▲ +6%",
    trendUp: true,
    color: "var(--color-purple)",
    sparkline: [40, 55, 50, 65, 70, 75, 78],
  },
  {
    emoji: "⚗️",
    name: "Chemistry",
    sessions: 18,
    questions: 72,
    score: 65,
    trend: "▼ -2%",
    trendUp: false,
    color: "var(--color-blue)",
    sparkline: [70, 68, 72, 66, 60, 63, 65],
  },
  {
    emoji: "🔭",
    name: "Physics",
    sessions: 22,
    questions: 85,
    score: 91,
    trend: "▲ +11%",
    trendUp: true,
    color: "var(--color-pink)",
    sparkline: [55, 65, 72, 78, 84, 88, 91],
  },
  {
    emoji: "🌿",
    name: "Biology",
    sessions: 12,
    questions: 54,
    score: 54,
    trend: "▲ +3%",
    trendUp: true,
    color: "var(--color-mint)",
    sparkline: [48, 50, 45, 52, 50, 53, 54],
  },
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

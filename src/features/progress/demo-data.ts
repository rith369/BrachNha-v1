// ============================================================
// DEMO DATA — Progress Dashboard
// ------------------------------------------------------------
// THREE CARDS, and only three. This file used to feed the whole
// page; the score hero, the weekly chart, the subject bar chart
// and the subject breakdown all read real student data now (see
// ../summary.ts). What is left is what has no real source:
//
//   focusAreas      Focus Areas 🔍    — per-TOPIC accuracy, a finer
//                                       grain than anything the app
//                                       records. Lesson level is the
//                                       finest honest grain there is.
//   activityHeatmap Study Activity 🗓️ — questions per calendar day.
//                                       contentLog could feed this;
//                                       kept demo at the user's
//                                       explicit request (16 Sep 2026).
//   aiInsights      AI Insights 🤖✨   — needs an LLM pass plus a badge
//                                       system. A live /api/chat call
//                                       from a bottom-nav tab would
//                                       exhaust the shared Gemini quota
//                                       (~20 requests/DAY for the whole
//                                       deployment) and break KruAI.
//
// BECAUSE THESE THREE STAY, `PreviewTag` STAYS on pages/progress.tsx.
// The rule is "the tags ARE the list of what is still fake", and with
// two or more demo cards the tag belongs at page level — the Game page
// is the precedent. The mechanical test for removing it: delete this
// file. If the build passes, nothing on the page invents a number.
//
// KNOWN AND ACCEPTED: the heatmap's "tap a day to see questions
// answered" now sits on a page whose bar chart shows REAL per-subject
// question counts, and the two will not add up. That is the cost of
// keeping this card demo, and the page-level tag is what covers it.
// ============================================================

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

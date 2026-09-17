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
// These three are still demo, but the page carries NO `PreviewTag` any more:
// the user asked for the "Preview · sample data" pill to go (17 Sep 2026),
// the same call made for the Game page. That is a knowing exception to "the
// tags ARE the list of what is still fake" — don't restore it without asking.
//
// KNOWN AND ACCEPTED: the heatmap's "tap a day to see questions
// answered" now sits on a page whose bar chart shows REAL per-subject
// question counts, and the two will not add up. That is the cost of
// keeping this card demo, and with the page tag gone nothing on screen
// covers it any more.
// ============================================================

// BOTH LANGUAGES, since the page follows `lang` (see ../copy.ts). The subject
// is an id rather than a name so it renders through the catalog's own
// translation, and `stat` is data rather than a pre-written sentence so each
// language can put the number where its own grammar wants it.
/** A card shows an average OR a movement, never both. */
type FocusStat = { avg: number } | { trend: string };

export const focusAreas = [
  {
    icon: "⚠️",
    label: "needWork" as const,
    kind: "weak" as const,
    topic: { en: "Oxidation States", km: "ចំនួនអុកស៊ីតកម្ម" },
    subject: "chemistry" as const,
    stat: { avg: 48 } as FocusStat,
  },
  {
    icon: "⭐",
    label: "strongest" as const,
    kind: "strong" as const,
    topic: { en: "Mechanics", km: "មេកានិច" },
    subject: "physics" as const,
    stat: { avg: 95 } as FocusStat,
  },
  {
    icon: "📉",
    label: "declining" as const,
    kind: "weak" as const,
    topic: { en: "Organic Chem", km: "គីមីសរីរាង្គ" },
    subject: "chemistry" as const,
    stat: { trend: "▼ -5%" } as FocusStat,
  },
  {
    icon: "🚀",
    label: "improved" as const,
    kind: "strong" as const,
    topic: { en: "Calculus", km: "ដេរីវេ និងអាំងតេក្រាល" },
    subject: "math" as const,
    stat: { trend: "▲ +14%" } as FocusStat,
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
    id: "study-tip",
    icon: "💡",
    title: { en: "Study Tip", km: "គន្លឹះរៀន" },
    body: {
      en: "Your Physics score jumps after morning sessions. Try studying it before 10am!",
      km: "ពិន្ទុរូបវិទ្យារបស់អ្នកកើនឡើងក្រោយពេលរៀនពេលព្រឹក។ សាកល្បងរៀនវាមុនម៉ោង 10 ព្រឹក!",
    },
    color: "purple" as const,
  },
  {
    id: "watch-out",
    icon: "⚠️",
    title: { en: "Watch Out", km: "ប្រយ័ត្ន" },
    body: {
      en: "Chemistry is dropping. You haven't practiced Organic in 5 days.",
      km: "ពិន្ទុគីមីកំពុងធ្លាក់ចុះ។ អ្នកមិនបានហាត់គីមីសរីរាង្គ 5 ថ្ងៃមកហើយ។",
    },
    color: "pink" as const,
  },
  {
    id: "next-goal",
    icon: "🎯",
    title: { en: "Next Goal", km: "គោលដៅបន្ទាប់" },
    body: {
      en: "Reach 85% avg score to unlock the Gold badge. Only 2% away!",
      km: "ទទួលបានពិន្ទុមធ្យម 85% ដើម្បីដោះសោមេដាយមាស។ នៅសល់តែ 2% ទៀតប៉ុណ្ណោះ!",
    },
    color: "blue" as const,
  },
];

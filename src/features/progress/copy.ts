import type { Lang } from "@/types";

/**
 * The Progress page's own wording, in BOTH languages.
 *
 * THIS PAGE WAS HARDCODED ENGLISH until the user asked for it to follow the
 * app's language like Home, Game, Streak, Profile and the Leaderboard do. That
 * also settles the old compromise in `subjects.ts`, where subject names were
 * kept English on purpose: making only the names switch would have put Khmer
 * words inside otherwise-English cards. With every label switching together,
 * the names follow `lang` as well.
 *
 * NOT KHMER-ONLY, for the reason `features/streak/copy.ts` records: that rule is
 * for screens whose CONTENT is Khmer curriculum. This page is numbers and
 * labels, the same kind of chrome as Home, so an English column is ordinary
 * translation rather than invented data.
 *
 * TECHNICAL TERMS STAY IN LATIN SCRIPT in the Khmer column, at the user's
 * instruction: Streak, XP, Flashcard, Quiz, KruAI, AI. Each is a product term a
 * student meets everywhere else in the app in exactly that spelling — the same
 * calls already made in `features/streak/copy.ts` and in `translations.ts`'s own
 * km column. Where the MEANING needs spelling out, the Khmer sentence around the
 * term does it. Digits stay Latin, matching the stat bar and the streak screens.
 *
 * `km` is typed as `typeof en`, so a line added to one language and forgotten
 * in the other fails to compile rather than rendering blank.
 */

interface Term {
  term: string;
  text: string;
}

const en = {
  // ── Score hero ──────────────────────────────────────────────────────────
  overallReadiness: "Overall Readiness",
  readinessAbout: "What is Overall Readiness?",
  readinessTip:
    "Your average score on the mock exams you took this month — the វិញ្ញាសារបង្កើតថ្មី papers. Past papers don't count here. The line underneath compares it with last month: 70% → 76% shows as +6 pts.",
  avgExamThisMonth: "Average exam score this month",
  noMockExams: "No mock exams yet",
  noChangeMonth: "No change vs last month",
  changeMonth: (pts: number) =>
    `${pts > 0 ? "▲ +" : "▼ "}${pts} pts vs last month`,
  ready: "ready",

  tileQuestions: "Questions",
  tileStudyTime: "Study Time",
  tileStreak: "Day Streak",
  tileXp: "XP This Month",
  hintQuestions:
    "Quiz and exam questions you answered this month. Flashcards aren't counted.",
  hintStudyTime:
    "Time spent actively studying this month: lessons, sections, flashcards, quizzes and exams. It pauses after 2 minutes without a tap or scroll, and while you're out of the app. Chatting with KruAI isn't counted.",
  hintStreak:
    "Days in a row you finished all 3 daily tasks: a lesson, practice and flashcards. Today is added once all 3 are done.",
  hintXp:
    "XP you've earned since the 1st of this month. Your all-time total is in the bar at the top of the screen.",
  /** Glued to the number in English ("0.3h"), spaced in Khmer. */
  hoursUnit: "h",

  // ── Weekly Learning Activity ────────────────────────────────────────────
  weeklyTitle: "Weekly Learning Activity",
  weeklySubtitle: "Your study time & XP over the last 7 days.",
  weeklyAbout: "About Weekly Learning Activity",
  weeklyTipIntro: "The last 7 days, with today on the right.",
  weeklyTipItems: [
    { term: "XP Points", text: "the XP you earned each day." },
    { term: "Study Minutes", text: "the time you actively studied each day." },
  ] as Term[],
  weeklyTipNote: "“vs last week” compares this week's XP with the 7 days before.",
  metricGroup: "Weekly Learning Activity metric",
  metricXp: "XP Points",
  metricMinutes: "Study Minutes",
  xpValue: (v: number) => `${v} XP`,
  minutesValue: (v: number) => `${v}m`,
  emptyXp: "No activity in the last 7 days. Finish a lesson to start the chart.",
  emptyMinutes: "No study time recorded in the last 7 days.",
  bestDayPrefix: "Highest productivity on",
  noChangeWeek: "No change vs last week",
  changeWeek: (pct: number) => `${pct > 0 ? "+" : ""}${pct}% vs last week`,

  // ── Questions Answered ──────────────────────────────────────────────────
  answeredTitle: "Questions Answered 📊",
  answeredSubtitle: "Per subject, all time",
  answeredAbout: "About Questions Answered",
  answeredTip:
    "How many quiz and exam questions you've answered in each subject, all time. Flashcards aren't counted. Tap a bar to see the exact number.",
  answeredEmpty:
    "No questions answered yet. Finish a lesson quiz to fill this in.",
  questionsCount: (n: number) => `${n} questions`,

  // ── Subject Breakdown ───────────────────────────────────────────────────
  breakdownTitle: "Subject Breakdown 🎯",
  breakdownAbout: "How to read Subject Breakdown",
  legend: (min: number): Term[] => [
    {
      term: "%",
      text: `how many questions you got right, all time. It appears after ${min} questions. Tap it to see the count.`,
    },
    { term: "Long bar", text: "the same score, as a bar." },
    {
      term: "▲ ▼",
      text: `your last 30 days compared with the 30 before, in points. It appears once both have ${min}+ questions.`,
    },
    {
      term: "Small bars",
      text: "how much you practised on each of the last 7 days, today on the right.",
    },
    {
      term: "Sessions",
      text: "how many times you finished a lesson, quiz, exam or flashcard deck. Repeating one on the same day counts once.",
    },
    {
      term: "Flashcards",
      text: "how many you've reviewed. They count as practice, but never change your score, because you mark them yourself.",
    },
  ],
  notStarted: "Not started yet",
  sessions: (n: number) => `${n} ${n === 1 ? "session" : "sessions"}`,
  questions: (n: number) => `${n} ${n === 1 ? "question" : "questions"}`,
  flashcards: (n: number) => `${n} ${n === 1 ? "flashcard" : "flashcards"}`,
  /**
   * The compact trend under a score. Zero gets its own words — "▲ +0" is a
   * green arrow on a subject that has not moved. And POINTS, not "%": this is a
   * difference between two percentages, so 70 → 76 is six points, and calling
   * that "+6%" would be a different and wrong number (ពិន្ទុ in Khmer).
   */
  trend: (pts: number) =>
    pts === 0 ? "no change" : pts > 0 ? `▲ +${pts} pts` : `▼ ${pts} pts`,
  trendSentence: (pts: number) =>
    pts === 0
      ? "The same as the 30 days before."
      : `${pts > 0 ? "Up" : "Down"} ${Math.abs(pts)} pts on the 30 days before.`,
  scoreTip: (correct: number, total: number) =>
    `${correct} of ${total} correct, all time.`,
  unscoredTip: (correct: number, total: number, more: number) =>
    `${correct} of ${total} correct so far. Answer ${more} more to see your score.`,
  flashcardsOnlyTip: (min: number) =>
    `Flashcards don't give a score, because you mark them yourself. Answer ${min} quiz or exam questions to see one.`,
  noScoreTip: (min: number) =>
    `Answer ${min} quiz or exam questions to see your score.`,

  // ── The three sample cards ──────────────────────────────────────────────
  focusTitle: "Focus Areas 🔍",
  focusLabel: {
    needWork: "Need Work",
    strongest: "Strongest",
    declining: "Declining",
    improved: "Most Improved",
  },
  /** "Chemistry · 48% avg" */
  focusAverage: (subject: string, pct: number) => `${subject} · ${pct}% avg`,

  activityTitle: "Study Activity 🗓️",
  activitySubtitle: "Tap a day to see questions answered",
  less: "Less",
  more: "More",
  today: "Today",
  noActivity: "No activity",

  aiTitle: "AI Insights 🤖✨",
};

export type ProgressCopy = typeof en;

const km: ProgressCopy = {
  // ── Score hero ──────────────────────────────────────────────────────────
  overallReadiness: "ភាពត្រៀមខ្លួនសរុប",
  readinessAbout: "តើភាពត្រៀមខ្លួនសរុបជាអ្វី?",
  readinessTip:
    "ពិន្ទុមធ្យមនៃការប្រឡងសាកល្បងដែលអ្នកបានធ្វើក្នុងខែនេះ (វិញ្ញាសារបង្កើតថ្មី)។ វិញ្ញាសារឆ្នាំចាស់មិនរាប់បញ្ចូលទេ។ បន្ទាត់ខាងក្រោមប្រៀបធៀបជាមួយខែមុន៖ ពី 70% ទៅ 76% បង្ហាញជា +6 ពិន្ទុ។",
  avgExamThisMonth: "ពិន្ទុប្រឡងមធ្យមខែនេះ",
  noMockExams: "មិនទាន់មានការប្រឡងសាកល្បង",
  noChangeMonth: "មិនប្រែប្រួលធៀបនឹងខែមុន",
  changeMonth: (pts) => `${pts > 0 ? "▲ +" : "▼ "}${pts} ពិន្ទុ ធៀបនឹងខែមុន`,
  ready: "ត្រៀមរួច",

  tileQuestions: "សំណួរ",
  tileStudyTime: "ពេលរៀន",
  // "Streak", untranslated at the user's instruction.
  tileStreak: "Streak",
  tileXp: "XP ខែនេះ",
  hintQuestions:
    "សំណួរ Quiz និងប្រឡងដែលអ្នកបានឆ្លើយក្នុងខែនេះ។ Flashcard មិនរាប់បញ្ចូលទេ។",
  hintStudyTime:
    "ពេលវេលាដែលអ្នករៀនយ៉ាងសកម្មក្នុងខែនេះ៖ មេរៀន ផ្នែកមេរៀន Flashcard Quiz និងប្រឡង។ វាឈប់រាប់ក្រោយ 2 នាទីដែលអ្នកមិនប៉ះ ឬមិនរំកិលអេក្រង់ និងពេលអ្នកចាកចេញពីកម្មវិធី។ ការជជែកជាមួយ KruAI មិនរាប់បញ្ចូលទេ។",
  hintStreak:
    "ចំនួនថ្ងៃជាប់ៗគ្នាដែលអ្នកបានបញ្ចប់កិច្ចការប្រចាំថ្ងៃទាំង 3៖ មេរៀន លំហាត់ និង Flashcard។ ថ្ងៃនេះនឹងត្រូវបូកបញ្ចូល ពេលអ្នកបញ្ចប់ទាំង 3 រួច។",
  hintXp:
    "XP ដែលអ្នកទទួលបានតាំងពីថ្ងៃទី 1 នៃខែនេះ។ XP សរុបរបស់អ្នកមាននៅរបារខាងលើអេក្រង់។",
  hoursUnit: " ម៉ោង",

  // ── Weekly Learning Activity ────────────────────────────────────────────
  weeklyTitle: "សកម្មភាពរៀនប្រចាំសប្តាហ៍",
  weeklySubtitle: "ពេលរៀន និង XP របស់អ្នកក្នុង 7 ថ្ងៃចុងក្រោយ។",
  weeklyAbout: "អំពីសកម្មភាពរៀនប្រចាំសប្តាហ៍",
  weeklyTipIntro: "7 ថ្ងៃចុងក្រោយ ដោយថ្ងៃនេះនៅខាងស្តាំ។",
  weeklyTipItems: [
    { term: "ពិន្ទុ XP", text: "XP ដែលអ្នកទទួលបានរៀងរាល់ថ្ងៃ។" },
    { term: "នាទីរៀន", text: "ពេលវេលាដែលអ្នករៀនយ៉ាងសកម្មរៀងរាល់ថ្ងៃ។" },
  ],
  weeklyTipNote:
    "«ធៀបនឹងសប្តាហ៍មុន» ប្រៀបធៀប XP សប្តាហ៍នេះ ជាមួយ 7 ថ្ងៃមុននោះ។",
  metricGroup: "ជ្រើសរើសទិន្នន័យសកម្មភាពរៀនប្រចាំសប្តាហ៍",
  metricXp: "ពិន្ទុ XP",
  metricMinutes: "នាទីរៀន",
  xpValue: (v) => `${v} XP`,
  minutesValue: (v) => `${v} នាទី`,
  emptyXp: "មិនមានសកម្មភាពក្នុង 7 ថ្ងៃចុងក្រោយទេ។ បញ្ចប់មេរៀនមួយ ដើម្បីចាប់ផ្តើមក្រាហ្វ។",
  emptyMinutes: "មិនទាន់មានពេលរៀនត្រូវបានកត់ត្រាក្នុង 7 ថ្ងៃចុងក្រោយទេ។",
  bestDayPrefix: "រៀនបានច្រើនបំផុតនៅថ្ងៃ",
  noChangeWeek: "មិនប្រែប្រួលធៀបនឹងសប្តាហ៍មុន",
  changeWeek: (pct) => `${pct > 0 ? "+" : ""}${pct}% ធៀបនឹងសប្តាហ៍មុន`,

  // ── Questions Answered ──────────────────────────────────────────────────
  answeredTitle: "សំណួរដែលបានឆ្លើយ 📊",
  answeredSubtitle: "តាមមុខវិជ្ជា តាំងពីដើមមក",
  answeredAbout: "អំពីសំណួរដែលបានឆ្លើយ",
  answeredTip:
    "ចំនួនសំណួរ Quiz និងប្រឡងដែលអ្នកបានឆ្លើយក្នុងមុខវិជ្ជានីមួយៗ តាំងពីដើមមក។ Flashcard មិនរាប់បញ្ចូលទេ។ ចុចលើរបារ ដើម្បីមើលចំនួនពិតប្រាកដ។",
  answeredEmpty:
    "មិនទាន់បានឆ្លើយសំណួរណាមួយនៅឡើយ។ បញ្ចប់ Quiz ក្នុងមេរៀនមួយ ដើម្បីបំពេញក្រាហ្វនេះ។",
  questionsCount: (n) => `${n} សំណួរ`,

  // ── Subject Breakdown ───────────────────────────────────────────────────
  breakdownTitle: "លទ្ធផលតាមមុខវិជ្ជា 🎯",
  breakdownAbout: "របៀបអានលទ្ធផលតាមមុខវិជ្ជា",
  legend: (min) => [
    {
      term: "%",
      text: `ចំនួនសំណួរដែលអ្នកឆ្លើយត្រូវ តាំងពីដើមមក។ វាបង្ហាញបន្ទាប់ពីអ្នកឆ្លើយបាន ${min} សំណួរ។ ចុចលើវា ដើម្បីមើលចំនួន។`,
    },
    { term: "របារវែង", text: "ពិន្ទុដដែល បង្ហាញជារបារ។" },
    {
      term: "▲ ▼",
      text: `30 ថ្ងៃចុងក្រោយរបស់អ្នក ធៀបនឹង 30 ថ្ងៃមុននោះ គិតជាពិន្ទុ។ វាបង្ហាញនៅពេលទាំងពីរមាន ${min} សំណួរឡើងទៅ។`,
    },
    {
      term: "របារតូចៗ",
      text: "ការហាត់រៀនរបស់អ្នករៀងរាល់ថ្ងៃក្នុង 7 ថ្ងៃចុងក្រោយ ដោយថ្ងៃនេះនៅខាងស្តាំ។",
    },
    {
      term: "វគ្គ",
      text: "ចំនួនដងដែលអ្នកបានបញ្ចប់មេរៀន Quiz ប្រឡង ឬកញ្ចប់ Flashcard។ ការធ្វើម្តងទៀតក្នុងថ្ងៃតែមួយ រាប់តែម្តង។",
    },
    {
      term: "Flashcard",
      text: "ចំនួនដែលអ្នកបានពិនិត្យ។ វារាប់ជាការហាត់រៀន ប៉ុន្តែមិនប្តូរពិន្ទុរបស់អ្នកទេ ព្រោះអ្នកដាក់ពិន្ទុខ្លួនឯង។",
    },
  ],
  notStarted: "មិនទាន់ចាប់ផ្តើម",
  // Khmer does not inflect for number, so one form serves 1 and many.
  sessions: (n) => `${n} វគ្គ`,
  questions: (n) => `${n} សំណួរ`,
  flashcards: (n) => `${n} Flashcard`,
  trend: (pts) =>
    pts === 0 ? "មិនប្រែប្រួល" : pts > 0 ? `▲ +${pts} ពិន្ទុ` : `▼ ${pts} ពិន្ទុ`,
  trendSentence: (pts) =>
    pts === 0
      ? "ដដែលនឹង 30 ថ្ងៃមុន។"
      : `${pts > 0 ? "កើនឡើង" : "ធ្លាក់ចុះ"} ${Math.abs(pts)} ពិន្ទុ ធៀបនឹង 30 ថ្ងៃមុន។`,
  scoreTip: (correct, total) =>
    `ត្រូវ ${correct} ក្នុងចំណោម ${total} សំណួរ តាំងពីដើមមក។`,
  unscoredTip: (correct, total, more) =>
    `ត្រូវ ${correct} ក្នុងចំណោម ${total} រហូតមកដល់ពេលនេះ។ ឆ្លើយ ${more} សំណួរទៀត ដើម្បីមើលពិន្ទុរបស់អ្នក។`,
  flashcardsOnlyTip: (min) =>
    `Flashcard មិនផ្តល់ពិន្ទុទេ ព្រោះអ្នកដាក់ពិន្ទុខ្លួនឯង។ ឆ្លើយសំណួរ Quiz ឬប្រឡង ${min} ដើម្បីមើលពិន្ទុ។`,
  noScoreTip: (min) =>
    `ឆ្លើយសំណួរ Quiz ឬប្រឡង ${min} ដើម្បីមើលពិន្ទុរបស់អ្នក។`,

  // ── The three sample cards ──────────────────────────────────────────────
  focusTitle: "ចំណុចត្រូវផ្តោត 🔍",
  focusLabel: {
    needWork: "ត្រូវខិតខំបន្ថែម",
    strongest: "ខ្លាំងបំផុត",
    declining: "កំពុងធ្លាក់ចុះ",
    improved: "រីកចម្រើនបំផុត",
  },
  focusAverage: (subject, pct) => `${subject} · មធ្យម ${pct}%`,

  activityTitle: "សកម្មភាពរៀន 🗓️",
  activitySubtitle: "ចុចលើថ្ងៃមួយ ដើម្បីមើលចំនួនសំណួរដែលបានឆ្លើយ",
  less: "តិច",
  more: "ច្រើន",
  today: "ថ្ងៃនេះ",
  noActivity: "គ្មានសកម្មភាព",

  aiTitle: "ការវិភាគ AI 🤖✨",
};

export const PROGRESS_COPY: Record<Lang, ProgressCopy> = { en, km };

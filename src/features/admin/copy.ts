import type { Lang } from "@/types";
import { formatKmDate } from "@/utils/khmer-dates";
import { parseDayKey } from "@/utils/day";

/**
 * The admin area's wording, in both languages, following `lang` like
 * pages/admin-reports.tsx does. These are the team's screens, not curriculum,
 * so an English column is ordinary translation.
 *
 * Product terms stay Latin in Khmer (KruAI, XP, Streak, Quiz, Flashcard), and
 * every number is Latin digits (see check:digits). No em dashes in any string.
 *
 * `km` is typed as `typeof en`, so a line added in one language and forgotten
 * in the other fails to compile.
 */

const en = {
  // ── The gate, shared by every admin page ─────────────────────────────────
  checking: "Checking access…",
  denied: "This page is for the BrachNha team.",
  home: "Back to Home",
  loading: "Loading…",
  failed: "Could not load this. Check your connection and reload.",
  backToAdmin: "Admin",

  // ── /admin ────────────────────────────────────────────────────────────────
  hubTitle: "Admin",
  hubBlurb: "How BrachNha is doing, and the team's tools.",
  tiles: {
    students: "Students",
    activeToday: "Active today",
    active7d: "Active, 7 days",
    new7d: "New, 7 days",
    kruaiToday: "KruAI units today",
    crashes7d: "Crashes, 7 days",
  },
  // ── Explanations (hover with a mouse, tap with a finger). They replaced a
  // paragraph under the tiles that explained all six at once. ──
  whatIsThis: "What this means",
  glanceTitle: "Key numbers",
  glanceTip: "Point at a number, or tap it, to see exactly what it counts.",
  tileTips: {
    students:
      "Every real account that has signed in with Google. Test accounts and guests (people using the app without signing in) are not counted.",
    activeToday:
      "Students who opened the app today, Phnom Penh time. Each student counts once, however many times they opened it.",
    active7d:
      "How many different students opened the app at least once in the last 7 days, today included.",
    new7d: "Accounts created in the last 7 days, today included.",
    kruaiToday:
      "How much KruAI was used today by the whole app. A typed question is 1 unit and a new photo is 3. The daily limits are on the KruAI page.",
    crashes7d:
      "Errors that broke a screen for a student in the last 7 days. 0 is good. The list at the bottom of this page shows which ones.",
  },
  dailyTip:
    "Active: students who opened the app that day (Phnom Penh time). New: accounts created that day. Guests are not counted, because they have no account. Point at the chart, or tap it, to see one day.",
  eventsTip:
    "Times: how often it happened. Students: how many different students did it. Only signed-in students are counted. Point at a name, or tap it, to see what it means.",
  eventTips: {
    app_open: "Opened the app. Each student counts once a day.",
    sign_up: "Signed in with Google for the first time and filled in their name.",
    survey_done: "Finished the 4-step survey that comes after signing up.",
    lesson_done: "Finished a lesson, or one section of a lesson, on the Lessons page.",
    quiz_done: "Finished a practice Quiz.",
    flashcards_done: "Finished a Flashcard review.",
    exam_done: "Finished a mock exam or a past exam paper.",
    battle_done: "Finished a Game battle, by creating one or by joining one.",
    kruai_question: "Asked KruAI a question.",
  } as Record<string, string>,
  retentionTip:
    "This shows whether students keep using BrachNha. For the students who joined in each week, how many opened the app again 7 to 13 days later. Example: 10 joined and 4 came back, so 40%. Higher is better. \"Not measured yet\" means that week's second week has not finished, or started before counting did.",
  crashesTip:
    "A crash is an error that broke a screen for a student. Under each one: how many times it happened, how many different students hit it, when it last happened, the page, and the app version. Send the top ones to the developer.",
  dailyTitle: "Students per day, last 30 days",
  dailyActive: "Active",
  dailyNew: "New",
  trackedSince: (date: string) =>
    `Counting since ${date}. Days before that read 0 because nothing was counting yet.`,
  notTracked: "No activity has been recorded yet.",
  eventsTitle: "What students did, last 7 days",
  eventsColEvent: "Event",
  eventsColTimes: "Times",
  eventsColStudents: "Students",
  eventsEmpty: "Nothing recorded in the last 7 days.",
  eventNames: {
    app_open: "Opened the app",
    sign_up: "Signed up",
    survey_done: "Finished the survey",
    lesson_done: "Finished a lesson",
    quiz_done: "Finished a Quiz",
    flashcards_done: "Finished Flashcards",
    exam_done: "Finished an exam",
    battle_done: "Finished a battle",
    kruai_question: "Asked KruAI",
  } as Record<string, string>,
  retentionTitle: "Came back in week 2",
  retentionBlurb:
    "Of the students who joined in each week, how many opened the app again 7 to 13 days after joining.",
  retentionRange: (from: string, to: string) => `Joined ${from} to ${to}`,
  retentionShare: (returned: number, joined: number) => `${returned} of ${joined}`,
  retentionNone: "Nobody joined",
  retentionNotYet: "Not measured yet",
  crashesTitle: "Most frequent crashes, last 7 days",
  crashesEmpty: "No crashes in the last 7 days.",
  crashMeta: (count: number, students: number) =>
    `${count} ${count === 1 ? "time" : "times"} · ${students} ${students === 1 ? "student" : "students"}`,
  toolsTitle: "Tools",
  toolStudents: "Students",
  toolStudentsBlurb: "Look someone up, manage admins, delete an account.",
  toolReports: "Photo reports",
  toolReportsBlurb: "Battle photos students reported.",
  openCount: (n: number) => `${n} open`,
  toolKruai: "KruAI",
  toolKruaiBlurb: "Daily limits, usage, and paused students.",

  // ── /admin/kruai ──────────────────────────────────────────────────────────
  kruaiTitle: "KruAI",
  kruaiBlurb: "How much KruAI is used, the daily limits, and students whose KruAI is paused.",
  todayTitle: "Today",
  usedOfLimit: (used: number, limit: number) =>
    `${used} of ${limit} units for the whole app`,
  studentsToday: (n: number) =>
    `${n} ${n === 1 ? "student" : "students"} asked today`,
  unitsNote:
    "A question is 1 unit and a new photo is 3. These are units, not dollars: the cost in dollars is only in the server logs.",
  kruaiDailyTitle: "Units per day, last 14 days",
  chartUnits: "Units",
  chartLimit: "Whole-app limit",
  topTitle: "Most units today",
  topEmpty: "Nobody has asked KruAI today.",
  unitsLabel: (n: number) => `${n} ${n === 1 ? "unit" : "units"}`,
  pausedChip: "Paused",
  limitsTitle: "Daily limits",
  limitUser: "Per student, each day",
  limitApp: "Whole app, each day",
  limitRange: (min: number, max: number) => `${min} to ${max}`,
  saveLimits: "Save limits",
  limitsSaved: "Saved. The new limits apply from the next question.",
  ownerOnlyLimits: "Only the owner can change the limits.",
  limitInvalid: "Enter whole numbers inside the ranges shown.",
  blockedTitle: "Paused students",
  blockedEmpty: "Nobody is paused.",
  blockedBy: (name: string, when: string) =>
    name ? `Paused by ${name}, ${when}` : `Paused ${when}`,
  noReason: "No reason given",
  pausedHelp: "To pause a student, open them on the Students page.",

  // ── Tools added in step C ─────────────────────────────────────────────────
  toolAnnouncements: "Announcements",
  toolAnnouncementsBlurb: "A message for every student, under the app bar.",
  toolMistakes: "Mistake reports",
  toolMistakesBlurb: "Questions students say are wrong or unclear.",
  toolContent: "Content",
  toolContentBlurb: "Write and fix flashcards and quizzes. The owner publishes.",

  // ── /admin/announcements ──────────────────────────────────────────────────
  annTitle: "Announcements",
  annBlurb:
    "A short message every student sees under the app bar, guests included, until it ends or you end it. One shows at a time: the newest.",
  newTitle: "New announcement",
  fieldKm: "Khmer text (required)",
  fieldEn: "English text (optional)",
  fieldEnHint: "Shown when the app is in English. Without it, students see the Khmer.",
  charsLeft: (n: number) => `${n} characters left`,
  fieldTone: "Colour",
  tones: { info: "Information", success: "Good news", warning: "Important" },
  fieldLink: "Link inside the app (optional)",
  fieldLinkHint: "A page such as /exam or /practice. Leave it empty for no button.",
  fieldEnds: "Ends",
  endsOptions: { day: "In 1 day", week: "In 7 days", month: "In 30 days", never: "When I end it" },
  preview: "Preview",
  publish: "Publish",
  published: "Published. Students see it the next time they open the app.",
  annDash: "Use a comma or a full stop instead of a long dash, so students read it more easily.",
  listTitle: "All announcements",
  listEmpty: "Nothing published yet.",
  liveChip: "Live",
  endedChip: "Not showing",
  endNow: "End now",
  confirmEnd: "Confirm: end now",
  publishedBy: (name: string, when: string) => (name ? `By ${name}, ${when}` : when),
  endsAtLabel: (when: string) => `Ends ${when}`,
  noEnd: "No end date",

  // ── /admin/mistakes ───────────────────────────────────────────────────────
  mistakesTitle: "Mistake reports",
  mistakesBlurb:
    "Questions students flagged. Fix the question in the code, then mark it Fixed. Not a mistake closes the reports with no change.",
  mistakesEmpty: "No reports waiting. 🎉",
  reportsCount: (n: number) => `${n} ${n === 1 ? "report" : "reports"}`,
  kindNames: {
    wrong_answer: "Wrong answer",
    typo: "Typo",
    unclear: "Unclear",
    other: "Other",
  } as Record<string, string>,
  refKinds: { section: "Lesson section", quiz: "Practice quiz", paper: "Past paper" },
  sectionPart: (step: number): string => (step === 0 ? "first quiz" : "second quiz"),
  questionN: (n: number) => `Question ${n}`,
  markedAnswer: "Marked correct",
  optionsLabel: "Options",
  explanationLabel: "Explanation",
  notesLabel: "What students wrote",
  openIt: "Open it in the app",
  missing: "This question is no longer in the app. It may have been moved or removed.",
  lastReported: (when: string) => `Last reported ${when}`,
  fixed: "Fixed",
  notMistake: "Not a mistake",

  // ── /admin/students ───────────────────────────────────────────────────────
  studentsTitle: "Students",
  studentsBlurb: "Real accounts only. Tap a student for details.",
  search: "Search by name or email",
  showing: (n: number) =>
    n >= 50 ? "The 50 most recently active. Search to find anyone else." : `${n} ${n === 1 ? "student" : "students"}`,
  noMatch: "No student matches.",
  noName: "No name yet",
  you: "You",
  adminChip: "Admin",
  ownerChip: "Owner",
  lastSeen: (when: string) => `Last seen ${when}`,
  neverSeen: "Not seen since tracking began",
  joined: "Joined",
  lastSeenLabel: "Last seen",
  xp: "XP",
  level: "Level",
  streak: "Streak",
  activeDays: "Days active (30 days)",
  kruaiToday: "KruAI units today",
  kruai7d: "KruAI units (7 days)",
  makeAdmin: "Make admin",
  removeAdmin: "Remove admin",
  confirmMake: "Confirm: make admin",
  confirmRemove: "Confirm: remove admin",
  adminNote:
    "An admin can see every student's name, email and activity, and can delete students' accounts.",
  selfNote: "This is your account. Nothing about it is changed here.",
  ownerNote: "This is the owner. The owner can only be changed in the database.",
  ownerOnly: "Only the owner can add or remove admins.",
  ownerOnlyAdmin: "Only the owner can remove an admin or delete their account.",
  pauseKruai: "Pause KruAI",
  resumeKruai: "Resume KruAI",
  confirmPause: "Confirm: pause KruAI",
  pauseReason: "Reason (optional)",
  pauseNote:
    "They will see that KruAI is paused for their account. Everything else in the app keeps working.",
  kruaiPausedChip: "KruAI paused",
  deleteOpen: "Delete account",
  deleteTitle: "Delete this account?",
  deleteBody: (name: string) =>
    `This permanently removes ${name}'s account and everything saved with it: profile, progress, exam results, KruAI conversations, battles and battle photos. It cannot be undone.`,
  deleteAdminFirst: "Remove the admin role before deleting this account.",
  understand: "I understand this cannot be undone",
  cancel: "Cancel",
  deleteConfirm: "Delete for good",
  working: "Working…",
  deleted: "Account deleted.",
  errors: {
    denied: "Your account is no longer an admin.",
    failed: "That did not work. Check your connection and try again.",
    unconfigured: "That did not work. Check your connection and try again.",
    photos: "Could not remove their battle photos, so nothing was deleted. Try again.",
    owner_only: "Only the owner can add or remove admins.",
    owner: "The owner's account cannot be deleted from the app.",
    self: "Use Profile to delete your own account.",
    admin: "Remove the admin role before deleting this account.",
    range: "Those numbers are outside the allowed range.",
    body: "Write the Khmer text, up to 300 characters.",
    link: "The link must be a page in the app, starting with /.",
    ends: "The end must be in the future.",
  },
};

type AdminCopy = typeof en;

const km: AdminCopy = {
  checking: "កំពុងពិនិត្យសិទ្ធិ…",
  denied: "ទំព័រនេះសម្រាប់ក្រុម BrachNha ប៉ុណ្ណោះ។",
  home: "ត្រឡប់ទៅទំព័រដើម",
  loading: "កំពុងទាញយក…",
  failed: "មិនអាចទាញយកបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចផ្ទុកឡើងវិញ។",
  backToAdmin: "ផ្ទាំងគ្រប់គ្រង",

  hubTitle: "ផ្ទាំងគ្រប់គ្រង",
  hubBlurb: "ស្ថានភាពរបស់ BrachNha និងឧបករណ៍សម្រាប់ក្រុម។",
  tiles: {
    students: "សិស្សសរុប",
    activeToday: "សកម្មថ្ងៃនេះ",
    active7d: "សកម្ម 7 ថ្ងៃ",
    new7d: "ថ្មី 7 ថ្ងៃ",
    kruaiToday: "ឯកតា KruAI ថ្ងៃនេះ",
    crashes7d: "កំហុសកម្មវិធី 7 ថ្ងៃ",
  },
  whatIsThis: "តើនេះមានន័យថាអ្វី",
  glanceTitle: "លេខសំខាន់ៗ",
  glanceTip: "ដាក់ម៉ៅស៍លើលេខ ឬចុចលើវា ដើម្បីមើលថាវារាប់អ្វី។",
  tileTips: {
    students:
      "គណនីពិតប្រាកដទាំងអស់ដែលបានចូលដោយ Google។ គណនីសាកល្បង និងភ្ញៀវ (អ្នកប្រើកម្មវិធីដោយមិនចូលគណនី) មិនត្រូវបានរាប់ទេ។",
    activeToday:
      "សិស្សដែលបានបើកកម្មវិធីថ្ងៃនេះ តាមម៉ោងភ្នំពេញ។ សិស្សម្នាក់រាប់តែម្តង ទោះបីបើកប៉ុន្មានដងក៏ដោយ។",
    active7d:
      "ចំនួនសិស្សខុសៗគ្នាដែលបានបើកកម្មវិធីយ៉ាងហោចណាស់ម្តង ក្នុង 7 ថ្ងៃចុងក្រោយ រួមទាំងថ្ងៃនេះ។",
    new7d: "គណនីដែលបានបង្កើតក្នុង 7 ថ្ងៃចុងក្រោយ រួមទាំងថ្ងៃនេះ។",
    kruaiToday:
      "ការប្រើ KruAI ថ្ងៃនេះ សម្រាប់កម្មវិធីទាំងមូល។ សំណួរវាយមួយស្មើ 1 ឯកតា រូបថតថ្មីមួយស្មើ 3។ កម្រិតប្រចាំថ្ងៃនៅលើទំព័រ KruAI។",
    crashes7d:
      "កំហុសដែលធ្វើឱ្យអេក្រង់ខូចសម្រាប់សិស្ស ក្នុង 7 ថ្ងៃចុងក្រោយ។ 0 គឺល្អ។ បញ្ជីនៅខាងក្រោមទំព័រនេះបង្ហាញថាកំហុសណាខ្លះ។",
  },
  dailyTip:
    "សកម្ម៖ សិស្សដែលបានបើកកម្មវិធីថ្ងៃនោះ (ម៉ោងភ្នំពេញ)។ ថ្មី៖ គណនីដែលបានបង្កើតថ្ងៃនោះ។ ភ្ញៀវមិនត្រូវបានរាប់ទេ ព្រោះគ្មានគណនី។ ដាក់ម៉ៅស៍លើក្រាហ្វ ឬចុចលើវា ដើម្បីមើលមួយថ្ងៃ។",
  eventsTip:
    "ចំនួនដង៖ វាបានកើតឡើងប៉ុន្មានដង។ សិស្ស៖ សិស្សខុសៗគ្នាប៉ុន្មាននាក់ដែលបានធ្វើវា។ រាប់តែសិស្សដែលបានចូលគណនីប៉ុណ្ណោះ។ ដាក់ម៉ៅស៍លើឈ្មោះ ឬចុចលើវា ដើម្បីមើលន័យរបស់វា។",
  eventTips: {
    app_open: "បានបើកកម្មវិធី។ សិស្សម្នាក់រាប់តែម្តងក្នុងមួយថ្ងៃ។",
    sign_up: "បានចូលដោយ Google ជាលើកដំបូង ហើយបំពេញឈ្មោះរបស់ខ្លួន។",
    survey_done: "បានបញ្ចប់ការស្ទង់មតិ 4 ជំហាន ដែលមកបន្ទាប់ពីចុះឈ្មោះ។",
    lesson_done: "បានបញ្ចប់មេរៀនមួយ ឬផ្នែកមួយនៃមេរៀន នៅលើទំព័រមេរៀន។",
    quiz_done: "បានបញ្ចប់ Quiz លំហាត់។",
    flashcards_done: "បានបញ្ចប់ការពិនិត្យ Flashcard។",
    exam_done: "បានបញ្ចប់ការប្រឡងសាកល្បង ឬវិញ្ញាសាឆ្នាំចាស់។",
    battle_done: "បានបញ្ចប់ការប្រកួតក្នុង Game ទាំងការបង្កើត និងការចូលរួម។",
    kruai_question: "បានសួរ KruAI មួយសំណួរ។",
  },
  retentionTip:
    "នេះបង្ហាញថាតើសិស្សនៅតែប្រើ BrachNha ឬអត់។ ក្នុងចំណោមសិស្សដែលចូលរួមក្នុងសប្តាហ៍នីមួយៗ តើប៉ុន្មាននាក់បានបើកកម្មវិធីម្តងទៀត 7 ដល់ 13 ថ្ងៃក្រោយមក។ ឧទាហរណ៍៖ ចូលរួម 10 នាក់ ត្រឡប់មកវិញ 4 នាក់ ស្មើ 40%។ កាន់តែខ្ពស់ កាន់តែល្អ។ «មិនទាន់វាស់បាន» មានន័យថាសប្តាហ៍ទី 2 នៃសប្តាហ៍នោះមិនទាន់ចប់ ឬបានចាប់ផ្តើមមុនពេលចាប់ផ្តើមរាប់។",
  crashesTip:
    "កំហុសកម្មវិធី គឺកំហុសដែលធ្វើឱ្យអេក្រង់ខូចសម្រាប់សិស្ស។ ក្រោមកំហុសនីមួយៗ៖ វាកើតឡើងប៉ុន្មានដង សិស្សខុសៗគ្នាប៉ុន្មាននាក់បានជួប ពេលចុងក្រោយ ទំព័រ និងកំណែកម្មវិធី។ សូមផ្ញើកំហុសនៅខាងលើគេទៅអ្នកអភិវឌ្ឍន៍។",
  dailyTitle: "សិស្សក្នុងមួយថ្ងៃ 30 ថ្ងៃចុងក្រោយ",
  dailyActive: "សកម្ម",
  dailyNew: "ថ្មី",
  trackedSince: (date: string) =>
    `ចាប់ផ្តើមរាប់ពី ${date}។ ថ្ងៃមុននោះបង្ហាញ 0 ព្រោះមិនទាន់បានរាប់នៅឡើយ។`,
  notTracked: "មិនទាន់មានសកម្មភាពត្រូវបានកត់ត្រានៅឡើយទេ។",
  eventsTitle: "អ្វីដែលសិស្សបានធ្វើ 7 ថ្ងៃចុងក្រោយ",
  eventsColEvent: "សកម្មភាព",
  eventsColTimes: "ចំនួនដង",
  eventsColStudents: "សិស្ស",
  eventsEmpty: "គ្មានអ្វីត្រូវបានកត់ត្រាក្នុង 7 ថ្ងៃចុងក្រោយទេ។",
  eventNames: {
    app_open: "បើកកម្មវិធី",
    sign_up: "ចុះឈ្មោះ",
    survey_done: "បញ្ចប់ការស្ទង់មតិ",
    lesson_done: "បញ្ចប់មេរៀន",
    quiz_done: "បញ្ចប់ Quiz",
    flashcards_done: "បញ្ចប់ Flashcard",
    exam_done: "បញ្ចប់ការប្រឡង",
    battle_done: "បញ្ចប់ការប្រកួត",
    kruai_question: "សួរ KruAI",
  },
  retentionTitle: "ត្រឡប់មកវិញក្នុងសប្តាហ៍ទី 2",
  retentionBlurb:
    "ក្នុងចំណោមសិស្សដែលចូលរួមក្នុងសប្តាហ៍នីមួយៗ តើប៉ុន្មាននាក់បានបើកកម្មវិធីម្តងទៀត 7 ដល់ 13 ថ្ងៃក្រោយចូលរួម។",
  retentionRange: (from: string, to: string) => `ចូលរួមពី ${from} ដល់ ${to}`,
  retentionShare: (returned: number, joined: number) => `${returned} ក្នុងចំណោម ${joined}`,
  retentionNone: "គ្មាននរណាចូលរួម",
  retentionNotYet: "មិនទាន់វាស់បាន",
  crashesTitle: "កំហុសកម្មវិធីញឹកញាប់បំផុត 7 ថ្ងៃចុងក្រោយ",
  crashesEmpty: "គ្មានកំហុសកម្មវិធីក្នុង 7 ថ្ងៃចុងក្រោយទេ។",
  crashMeta: (count: number, students: number) => `${count} ដង · សិស្ស ${students} នាក់`,
  toolsTitle: "ឧបករណ៍",
  toolStudents: "សិស្ស",
  toolStudentsBlurb: "ស្វែងរកសិស្ស គ្រប់គ្រងអ្នកគ្រប់គ្រង លុបគណនី។",
  toolReports: "របាយការណ៍រូបថត",
  toolReportsBlurb: "រូបថតក្នុងការប្រកួតដែលសិស្សបានរាយការណ៍។",
  openCount: (n: number) => `${n} កំពុងរង់ចាំ`,
  toolKruai: "KruAI",
  toolKruaiBlurb: "កម្រិតប្រចាំថ្ងៃ ការប្រើប្រាស់ និងសិស្សដែលត្រូវបានផ្អាក។",

  kruaiTitle: "KruAI",
  kruaiBlurb: "ការប្រើប្រាស់ KruAI កម្រិតប្រចាំថ្ងៃ និងសិស្សដែលត្រូវបានផ្អាក KruAI។",
  todayTitle: "ថ្ងៃនេះ",
  usedOfLimit: (used: number, limit: number) =>
    `${used} ក្នុងចំណោម ${limit} ឯកតា សម្រាប់កម្មវិធីទាំងមូល`,
  studentsToday: (n: number) => `សិស្ស ${n} នាក់បានសួរថ្ងៃនេះ`,
  unitsNote:
    "សំណួរមួយស្មើ 1 ឯកតា ហើយរូបថតថ្មីមួយស្មើ 3។ នេះជាឯកតា មិនមែនជាប្រាក់ដុល្លារទេ៖ តម្លៃជាដុល្លារមានតែក្នុងកំណត់ត្រារបស់ម៉ាស៊ីនមេប៉ុណ្ណោះ។",
  kruaiDailyTitle: "ឯកតាក្នុងមួយថ្ងៃ 14 ថ្ងៃចុងក្រោយ",
  chartUnits: "ឯកតា",
  chartLimit: "កម្រិតកម្មវិធីទាំងមូល",
  topTitle: "ប្រើច្រើនជាងគេថ្ងៃនេះ",
  topEmpty: "ថ្ងៃនេះមិនទាន់មាននរណាសួរ KruAI ទេ។",
  unitsLabel: (n: number) => `${n} ឯកតា`,
  pausedChip: "បានផ្អាក",
  limitsTitle: "កម្រិតប្រចាំថ្ងៃ",
  limitUser: "សិស្សម្នាក់ ក្នុងមួយថ្ងៃ",
  limitApp: "កម្មវិធីទាំងមូល ក្នុងមួយថ្ងៃ",
  limitRange: (min: number, max: number) => `${min} ដល់ ${max}`,
  saveLimits: "រក្សាទុកកម្រិត",
  limitsSaved: "បានរក្សាទុក។ កម្រិតថ្មីអនុវត្តចាប់ពីសំណួរបន្ទាប់។",
  ownerOnlyLimits: "មានតែម្ចាស់ទេ ដែលអាចប្តូរកម្រិតបាន។",
  limitInvalid: "សូមបញ្ចូលចំនួនគត់ ក្នុងចន្លោះដែលបានបង្ហាញ។",
  blockedTitle: "សិស្សដែលត្រូវបានផ្អាក",
  blockedEmpty: "មិនមាននរណាត្រូវបានផ្អាកទេ។",
  blockedBy: (name: string, when: string) =>
    name ? `ផ្អាកដោយ ${name} ${when}` : `ផ្អាក ${when}`,
  noReason: "គ្មានមូលហេតុ",
  pausedHelp: "ដើម្បីផ្អាកសិស្ស សូមបើកសិស្សនោះនៅទំព័រសិស្ស។",

  toolAnnouncements: "សេចក្តីប្រកាស",
  toolAnnouncementsBlurb: "សារសម្រាប់សិស្សទាំងអស់ នៅក្រោមរបារខាងលើ។",
  toolMistakes: "របាយការណ៍កំហុស",
  toolMistakesBlurb: "សំណួរដែលសិស្សថាខុស ឬមិនច្បាស់។",
  toolContent: "មាតិកា",
  toolContentBlurb: "សរសេរ និងកែ Flashcard និង Quiz។ ម្ចាស់ជាអ្នកផ្សាយ។",

  annTitle: "សេចក្តីប្រកាស",
  annBlurb:
    "សារខ្លីមួយដែលសិស្សទាំងអស់ឃើញនៅក្រោមរបារខាងលើ រួមទាំងភ្ញៀវ រហូតដល់វាផុតកំណត់ ឬអ្នកបញ្ចប់វា។ បង្ហាញម្តងមួយ៖ ថ្មីជាងគេ។",
  newTitle: "សេចក្តីប្រកាសថ្មី",
  fieldKm: "អត្ថបទខ្មែរ (ត្រូវតែមាន)",
  fieldEn: "អត្ថបទអង់គ្លេស (មិនចាំបាច់)",
  fieldEnHint: "បង្ហាញពេលកម្មវិធីជាភាសាអង់គ្លេស។ បើគ្មាន សិស្សនឹងឃើញអត្ថបទខ្មែរ។",
  charsLeft: (n: number) => `នៅសល់ ${n} តួអក្សរ`,
  fieldTone: "ពណ៌",
  tones: { info: "ព័ត៌មាន", success: "ដំណឹងល្អ", warning: "សំខាន់" },
  fieldLink: "តំណក្នុងកម្មវិធី (មិនចាំបាច់)",
  fieldLinkHint: "ទំព័រមួយ ដូចជា /exam ឬ /practice។ ទុកទទេ បើមិនចង់មានប៊ូតុង។",
  fieldEnds: "បញ្ចប់",
  endsOptions: { day: "ក្នុង 1 ថ្ងៃ", week: "ក្នុង 7 ថ្ងៃ", month: "ក្នុង 30 ថ្ងៃ", never: "ពេលខ្ញុំបញ្ចប់" },
  preview: "មើលជាមុន",
  publish: "ផ្សាយ",
  published: "បានផ្សាយ។ សិស្សនឹងឃើញវានៅពេលបើកកម្មវិធីលើកក្រោយ។",
  annDash: "សូមប្រើក្បៀស ឬខណ្ឌ ជំនួសសញ្ញាដាច់វែង ដើម្បីឱ្យសិស្សអានងាយ។",
  listTitle: "សេចក្តីប្រកាសទាំងអស់",
  listEmpty: "មិនទាន់មានអ្វីត្រូវបានផ្សាយនៅឡើយទេ។",
  liveChip: "កំពុងបង្ហាញ",
  endedChip: "មិនបង្ហាញ",
  endNow: "បញ្ចប់ឥឡូវ",
  confirmEnd: "បញ្ជាក់៖ បញ្ចប់ឥឡូវ",
  publishedBy: (name: string, when: string) => (name ? `ដោយ ${name} ${when}` : when),
  endsAtLabel: (when: string) => `បញ្ចប់ ${when}`,
  noEnd: "គ្មានថ្ងៃបញ្ចប់",

  mistakesTitle: "របាយការណ៍កំហុស",
  mistakesBlurb:
    "សំណួរដែលសិស្សបានរាយការណ៍។ កែសំណួរក្នុងកូដ រួចចុច «បានកែ»។ «មិនមែនកំហុស» បិទរបាយការណ៍ដោយមិនកែអ្វីទេ។",
  mistakesEmpty: "មិនមានរបាយការណ៍រង់ចាំទេ។ 🎉",
  reportsCount: (n: number) => `របាយការណ៍ ${n}`,
  kindNames: {
    wrong_answer: "ចម្លើយខុស",
    typo: "អក្ខរាវិរុទ្ធខុស",
    unclear: "មិនច្បាស់",
    other: "ផ្សេងៗ",
  },
  refKinds: { section: "ផ្នែកមេរៀន", quiz: "Quiz អនុវត្ត", paper: "វិញ្ញាសារឆ្នាំចាស់" },
  sectionPart: (step: number) => (step === 0 ? "សំណួរទីមួយ" : "សំណួរទីពីរ"),
  questionN: (n: number) => `សំណួរទី ${n}`,
  markedAnswer: "ចម្លើយត្រឹមត្រូវ",
  optionsLabel: "ជម្រើស",
  explanationLabel: "ការពន្យល់",
  notesLabel: "អ្វីដែលសិស្សបានសរសេរ",
  openIt: "បើកក្នុងកម្មវិធី",
  missing: "សំណួរនេះលែងមានក្នុងកម្មវិធីហើយ។ វាប្រហែលជាត្រូវបានផ្លាស់ទី ឬលុបចេញ។",
  lastReported: (when: string) => `រាយការណ៍ចុងក្រោយ ${when}`,
  fixed: "បានកែ",
  notMistake: "មិនមែនកំហុស",

  studentsTitle: "សិស្ស",
  studentsBlurb: "គណនីពិតប្រាកដប៉ុណ្ណោះ។ ចុចលើសិស្សដើម្បីមើលព័ត៌មានលម្អិត។",
  search: "ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល",
  showing: (n: number) =>
    n >= 50 ? "សិស្ស 50 នាក់ដែលសកម្មចុងក្រោយ។ ស្វែងរកដើម្បីរកអ្នកផ្សេងទៀត។" : `សិស្ស ${n} នាក់`,
  noMatch: "រកមិនឃើញសិស្សទេ។",
  noName: "មិនទាន់មានឈ្មោះ",
  you: "អ្នក",
  adminChip: "អ្នកគ្រប់គ្រង",
  ownerChip: "ម្ចាស់",
  lastSeen: (when: string) => `ឃើញចុងក្រោយ ${when}`,
  neverSeen: "មិនទាន់ឃើញតាំងពីចាប់ផ្តើមរាប់",
  joined: "ចូលរួម",
  lastSeenLabel: "ឃើញចុងក្រោយ",
  xp: "XP",
  level: "កម្រិត",
  streak: "Streak",
  activeDays: "ថ្ងៃសកម្ម (30 ថ្ងៃ)",
  kruaiToday: "ឯកតា KruAI ថ្ងៃនេះ",
  kruai7d: "ឯកតា KruAI (7 ថ្ងៃ)",
  makeAdmin: "ដាក់ជាអ្នកគ្រប់គ្រង",
  removeAdmin: "ដកចេញពីអ្នកគ្រប់គ្រង",
  confirmMake: "បញ្ជាក់៖ ដាក់ជាអ្នកគ្រប់គ្រង",
  confirmRemove: "បញ្ជាក់៖ ដកចេញពីអ្នកគ្រប់គ្រង",
  adminNote:
    "អ្នកគ្រប់គ្រងអាចមើលឈ្មោះ អ៊ីមែល និងសកម្មភាពរបស់សិស្សគ្រប់រូប ហើយអាចលុបគណនីសិស្សបាន។",
  selfNote: "នេះជាគណនីរបស់អ្នក។ គ្មានអ្វីត្រូវបានផ្លាស់ប្តូរនៅទីនេះទេ។",
  ownerNote: "នេះជាម្ចាស់។ ម្ចាស់អាចផ្លាស់ប្តូរបានតែក្នុងមូលដ្ឋានទិន្នន័យប៉ុណ្ណោះ។",
  ownerOnly: "មានតែម្ចាស់ទេ ដែលអាចបន្ថែម ឬដកអ្នកគ្រប់គ្រងបាន។",
  ownerOnlyAdmin: "មានតែម្ចាស់ទេ ដែលអាចដកអ្នកគ្រប់គ្រង ឬលុបគណនីរបស់គាត់បាន។",
  pauseKruai: "ផ្អាក KruAI",
  resumeKruai: "បើក KruAI វិញ",
  confirmPause: "បញ្ជាក់៖ ផ្អាក KruAI",
  pauseReason: "មូលហេតុ (មិនចាំបាច់)",
  pauseNote:
    "សិស្សនឹងឃើញថា KruAI ត្រូវបានផ្អាកសម្រាប់គណនីរបស់គាត់។ ផ្នែកផ្សេងទៀតនៃកម្មវិធីនៅតែដំណើរការធម្មតា។",
  kruaiPausedChip: "KruAI បានផ្អាក",
  deleteOpen: "លុបគណនី",
  deleteTitle: "លុបគណនីនេះ?",
  deleteBody: (name: string) =>
    `វានឹងលុបគណនីរបស់ ${name} និងអ្វីៗទាំងអស់ដែលបានរក្សាទុកជាមួយវាជាអចិន្ត្រៃយ៍៖ ប្រវត្តិរូប វឌ្ឍនភាព លទ្ធផលប្រឡង ការសន្ទនាជាមួយ KruAI ការប្រកួត និងរូបថតក្នុងការប្រកួត។ មិនអាចត្រឡប់វិញបានទេ។`,
  deleteAdminFirst: "សូមដកតួនាទីអ្នកគ្រប់គ្រងចេញសិន មុននឹងលុបគណនីនេះ។",
  understand: "ខ្ញុំយល់ថាវាមិនអាចត្រឡប់វិញបានទេ",
  cancel: "បោះបង់",
  deleteConfirm: "លុបជាអចិន្ត្រៃយ៍",
  working: "កំពុងដំណើរការ…",
  deleted: "បានលុបគណនីហើយ។",
  errors: {
    denied: "គណនីរបស់អ្នកលែងជាអ្នកគ្រប់គ្រងហើយ។",
    failed: "មិនបានសម្រេចទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    unconfigured: "មិនបានសម្រេចទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    photos: "មិនអាចលុបរូបថតក្នុងការប្រកួតរបស់គាត់បានទេ ដូច្នេះគ្មានអ្វីត្រូវបានលុបទេ។ សូមព្យាយាមម្តងទៀត។",
    owner_only: "មានតែម្ចាស់ទេ ដែលអាចបន្ថែម ឬដកអ្នកគ្រប់គ្រងបាន។",
    owner: "គណនីម្ចាស់មិនអាចលុបពីកម្មវិធីបានទេ។",
    self: "សូមប្រើទំព័រប្រវត្តិរូប ដើម្បីលុបគណនីរបស់អ្នកផ្ទាល់។",
    admin: "សូមដកតួនាទីអ្នកគ្រប់គ្រងចេញសិន មុននឹងលុបគណនីនេះ។",
    range: "ចំនួនទាំងនេះនៅក្រៅចន្លោះដែលអនុញ្ញាត។",
    body: "សូមសរសេរអត្ថបទខ្មែរ មិនលើសពី 300 តួអក្សរ។",
    link: "តំណត្រូវតែជាទំព័រក្នុងកម្មវិធី ដែលចាប់ផ្តើមដោយ /។",
    ends: "ថ្ងៃបញ្ចប់ត្រូវតែនៅថ្ងៃខាងមុខ។",
  },
};

export const ADMIN_COPY: Record<Lang, AdminCopy> = { en, km };

/** A `YYYY-MM-DD` day key as a short date, Latin digits in both languages. */
export function dayLabel(key: string, lang: Lang): string {
  if (!key) return "";
  const d = parseDayKey(key);
  return lang === "km"
    ? formatKmDate(d, { year: false })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** An instant (ISO timestamp) as a short date and time, Latin digits. */
export function whenLabel(iso: string, lang: Lang): string {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return lang === "km"
    ? `${formatKmDate(d, { year: false })} ${time}`
    : `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${time}`;
}

/** An instant as a date with the year, for "Joined". */
export function dateLabel(iso: string, lang: Lang): string {
  if (!iso) return "";
  const d = new Date(iso);
  return lang === "km"
    ? formatKmDate(d)
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

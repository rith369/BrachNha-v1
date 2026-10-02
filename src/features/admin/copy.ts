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
  tilesTip:
    "Students are real accounts (no test accounts). Active means the student opened the app that day. KruAI units: a question is 1, a new photo is 3.",
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
  tilesTip:
    "សិស្សគឺគណនីពិតប្រាកដ (មិនរាប់គណនីសាកល្បង)។ សកម្ម មានន័យថាសិស្សបានបើកកម្មវិធីនៅថ្ងៃនោះ។ ឯកតា KruAI៖ សំណួរមួយស្មើ 1 រូបថតថ្មីមួយស្មើ 3។",
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

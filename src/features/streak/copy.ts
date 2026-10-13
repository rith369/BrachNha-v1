import type { Lang } from "@/types";
import type { FriendFail } from "@/lib/friends";
import { parseDayKey } from "@/utils/day";
import { formatKmDate } from "@/utils/khmer-dates";
import type { DailyTaskId, WeekdayId } from "./types";

/**
 * This page's own wording, in BOTH languages.
 *
 * DELIBERATELY NOT KHMER-ONLY, which is the newer convention for the Study,
 * Exam and Practice pages (LESSONS_PAGE_LANG / EXAM_PAGE_LANG /
 * PRACTICE_PAGE_LANG). That rule exists for screens whose CONTENT is Khmer
 * curriculum — an English column there would be fabrication dressed as data.
 * Nothing on this screen is curriculum: it is gamification chrome, the same
 * kind of thing Home, Progress, Profile and the Leaderboard are, and all four
 * of those follow the store's `lang`. So does this.
 *
 * "STREAK" IS NEVER TRANSLATED. It stays in Latin script in the Khmer column,
 * on the user's explicit instruction — the earlier ជួរជាមួយមិត្ត reading of it
 * did not make sense, and streak is a product term rather than a word to find a
 * Khmer equivalent for. This matches the calls already made for KruAI, and for
 * "Flashcard" and "Quiz" in translations.ts's own km column. The Khmer copy
 * still says ថ្ងៃជាប់ៗគ្នា ("consecutive days") where the MEANING needs
 * spelling out, so nothing is left to be guessed from the loanword alone.
 *
 * Kept here rather than in data/translations.ts because it is one screen's
 * vocabulary, the same way features/exam/papers.ts and utils/leaderboard.ts own
 * theirs.
 */
export const STREAK_COPY = {
  en: {
    title: "Streak",
    kicker: "Streak",
    dayStreak: "Day Streak",
    subtitle: "Keep learning every day to keep your streak alive.",
    celebrated: "You kept your streak alive!",

    thisWeek: "Last 7 Days",
    today: "Today",
    // The one line on the page that says what a streak actually measures. The
    // brief asked for this explicitly, and it echoes the wording the
    // leaderboard already uses for study time.
    countsNote:
      "A day only counts when you finish your daily goal. Opening the app is not enough.",

    todaysGoal: "Today's Goal",
    goalComplete: "Goal complete",
    streakMaintained: "Streak maintained!",

    milestones: "Streak Milestones",
    nextMilestone: "Next milestone",
    reached: "Reached",
    next: "Next",
    locked: "Locked",

    taskLesson: "Lesson",
    taskPractice: "Practice",
    taskFlashcards: "Flashcards",

    // ── Friend Streak (the shared streak) ──
    friendsTitle: "Streak with Friends",
    sharedTagline: "Study together. Keep the streak alive.",
    // The rule the whole page exists to teach. Repeated under the week row as
    // well as under the goal card, because it is the one thing a student who
    // reads nothing else has to come away with.
    bothRule: "The streak only continues when BOTH of you finish your daily goal.",
    atRisk: "Your streak is at risk",
    streakSafe: "Streak kept for today",

    // `todaysGoal` is shared with the solo page's card above — same heading,
    // same meaning, so it is not restated here.
    dailyGoal: "Daily goal",
    statusDone: "Completed",
    statusWaiting: "Not completed yet",

    sharedWeek: "This Week Together",
    legendKept: "Both done",
    legendAtRisk: "Today, not done yet",
    legendBroken: "Missed",
    legendBefore: "Before you were friends",

    sharedMilestones: "Shared Streak Milestones",
    youLabel: "You",

    // ── The friends list (/streak/friends) ──
    friendsIntro:
      "Keep a streak with each friend. A day counts only when you both finish your daily goal.",
    requestsTitle: "Friend requests",
    accept: "Accept",
    decline: "Decline",
    yourFriends: "Your friends",
    noFriends: "No friends yet. Search for a classmate by name to start a shared streak.",
    addFriend: "Add a friend",
    searchPlaceholder: "Search by name",
    searchHint: "Type at least 2 letters of their name.",
    searchEmpty: "No student with that name.",
    searching: "Searching...",
    add: "Add",
    requestSent: "Request sent",
    cancel: "Cancel",
    alreadyFriends: "Friends",
    sentTitle: "Requests you sent",
    waitingAccept: "Waiting for them to accept",
    whoSees:
      "Anyone signed in can find you by name. A friend sees only your name and the days you finished your goal.",
    loading: "Loading...",
    loadFailed: "Could not load your friends. Check your connection.",
    retry: "Try again",
    needsAccount: "Streak with Friends needs an account, and this copy of the app has none.",
    removeFriend: "Remove friend",
    removeConfirm: "Tap again to remove. Your shared streak will be lost.",
    nowFriends: "They had already asked you. You are friends now!",
    noName: "Student",
    yourFriendsBack: "Your friends",

    failSelf: "That is you.",
    failUnknown: "That student can't be added.",
    failExists: "You are already friends, or a request is waiting.",
    failLimit: "You already have 20 friends. Remove one to add another.",
    failTheirLimit: "They already have 20 friends.",
    failTooMany: "You've sent a lot of requests. Try again tomorrow.",
    failMissing: "That request is no longer there.",
    failSignIn: "Sign in again to continue.",
    failGeneric: "Something went wrong. Try again.",
  },
  km: {
    title: "Streak",
    kicker: "Streak",
    dayStreak: "ថ្ងៃជាប់ៗគ្នា",
    subtitle: "រៀនរាល់ថ្ងៃ ដើម្បីរក្សា Streak របស់អ្នកកុំឲ្យដាច់។",
    celebrated: "អ្នករក្សា Streak របស់អ្នកបានហើយ!",

    thisWeek: "7 ថ្ងៃចុងក្រោយ",
    today: "ថ្ងៃនេះ",
    countsNote:
      "ថ្ងៃមួយត្រូវបានរាប់ លុះត្រាតែអ្នកបញ្ចប់គោលដៅប្រចាំថ្ងៃ។ ការបើកកម្មវិធីតែម្យ៉ាងមិនរាប់ទេ។",

    todaysGoal: "គោលដៅថ្ងៃនេះ",
    goalComplete: "បញ្ចប់គោលដៅរួចហើយ",
    streakMaintained: "រក្សា Streak បានហើយ!",

    milestones: "ចំណុចសំខាន់ៗនៃ Streak",
    nextMilestone: "ចំណុចសំខាន់បន្ទាប់",
    reached: "សម្រេចបាន",
    next: "បន្ទាប់",
    locked: "នៅជាប់សោ",

    taskLesson: "មេរៀន",
    taskPractice: "លំហាត់",
    // Latin, matching translations.ts's own km column for this word.
    taskFlashcards: "Flashcard",

    // ── Friend Streak (the shared streak) ──
    friendsTitle: "Streak ជាមួយមិត្តភក្តិ",
    sharedTagline: "រៀនជាមួយគ្នា រក្សា Streak កុំឲ្យដាច់។",
    bothRule: "Streak បន្តបានលុះត្រាតែអ្នកទាំងពីរបញ្ចប់គោលដៅប្រចាំថ្ងៃ។",
    atRisk: "Streak របស់អ្នកជិតដាច់",
    streakSafe: "រក្សា Streak បានហើយថ្ងៃនេះ",

    dailyGoal: "គោលដៅប្រចាំថ្ងៃ",
    statusDone: "បានបញ្ចប់",
    statusWaiting: "មិនទាន់បញ្ចប់",

    sharedWeek: "សប្តាហ៍នេះជាមួយគ្នា",
    legendKept: "បញ្ចប់ទាំងពីរ",
    legendAtRisk: "ថ្ងៃនេះ មិនទាន់រួច",
    legendBroken: "ខកខាន",
    legendBefore: "មុនពេលជាមិត្ត",

    sharedMilestones: "ចំណុចសំខាន់ៗនៃ Streak រួមគ្នា",
    youLabel: "អ្នក",

    // ── The friends list (/streak/friends) ──
    friendsIntro:
      "រក្សា Streak ជាមួយមិត្តម្នាក់ៗ។ ថ្ងៃមួយត្រូវបានរាប់ លុះត្រាតែអ្នកទាំងពីរបញ្ចប់គោលដៅប្រចាំថ្ងៃ។",
    requestsTitle: "សំណើធ្វើជាមិត្ត",
    accept: "ទទួលយក",
    decline: "បដិសេធ",
    yourFriends: "មិត្តភក្តិរបស់អ្នក",
    noFriends: "មិនទាន់មានមិត្តភក្តិនៅឡើយទេ។ ស្វែងរកមិត្តរួមថ្នាក់តាមឈ្មោះ ដើម្បីចាប់ផ្ដើម Streak រួមគ្នា។",
    addFriend: "បន្ថែមមិត្តភក្តិ",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះ",
    searchHint: "វាយឈ្មោះយ៉ាងហោចណាស់ 2 តួអក្សរ។",
    searchEmpty: "រកមិនឃើញសិស្សដែលមានឈ្មោះនេះទេ។",
    searching: "កំពុងស្វែងរក...",
    add: "បន្ថែម",
    requestSent: "បានផ្ញើសំណើ",
    cancel: "បោះបង់",
    alreadyFriends: "ជាមិត្តហើយ",
    sentTitle: "សំណើដែលអ្នកបានផ្ញើ",
    waitingAccept: "កំពុងរង់ចាំការទទួលយក",
    whoSees:
      "អ្នកដែលចូលគណនីអាចស្វែងរកអ្នកតាមឈ្មោះបាន។ មិត្តភក្តិឃើញតែឈ្មោះ និងថ្ងៃដែលអ្នកបានបញ្ចប់គោលដៅប៉ុណ្ណោះ។",
    loading: "កំពុងទាញយក...",
    loadFailed: "មិនអាចទាញយកមិត្តភក្តិបានទេ។ សូមពិនិត្យការភ្ជាប់អ៊ីនធឺណិត។",
    retry: "ព្យាយាមម្តងទៀត",
    needsAccount: "Streak ជាមួយមិត្តភក្តិ ត្រូវការគណនី ហើយកម្មវិធីនេះមិនទាន់មានទេ។",
    removeFriend: "ដកចេញពីមិត្តភក្តិ",
    removeConfirm: "ចុចម្តងទៀតដើម្បីដកចេញ។ Streak រួមគ្នានឹងបាត់។",
    nowFriends: "គេបានស្នើមកអ្នករួចហើយ។ ឥឡូវអ្នកជាមិត្តនឹងគ្នាហើយ!",
    noName: "សិស្ស",
    yourFriendsBack: "មិត្តភក្តិរបស់អ្នក",

    failSelf: "នោះគឺជាអ្នកផ្ទាល់។",
    failUnknown: "មិនអាចបន្ថែមសិស្សនេះបានទេ។",
    failExists: "អ្នកជាមិត្តនឹងគ្នារួចហើយ ឬមានសំណើកំពុងរង់ចាំ។",
    failLimit: "អ្នកមានមិត្ត 20 នាក់ហើយ។ ដកម្នាក់ចេញ ដើម្បីបន្ថែមម្នាក់ទៀត។",
    failTheirLimit: "គេមានមិត្ត 20 នាក់ហើយ។",
    failTooMany: "អ្នកបានផ្ញើសំណើច្រើនពេកហើយ។ សូមព្យាយាមម្តងទៀតនៅថ្ងៃស្អែក។",
    failMissing: "សំណើនោះលែងមានទៀតហើយ។",
    failSignIn: "សូមចូលគណនីម្តងទៀត ដើម្បីបន្ត។",
    failGeneric: "មានបញ្ហាអ្វីមួយ។ សូមព្យាយាមម្តងទៀត។",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function useStreakCopy(lang: Lang) {
  return STREAK_COPY[lang];
}

/**
 * Weekday initials for the 7-cell tracker.
 *
 * The Khmer column is the conventional single/double-glyph calendar
 * abbreviation set, not a truncation — ថ្ងៃអាទិត្យ shortened by character count
 * would break a coeng cluster and render as tofu. The cells are ~36px wide at
 * the 320px floor, so the full names would not fit either way.
 */
const WEEKDAY_LABELS: Record<WeekdayId, { en: string; km: string }> = {
  mon: { en: "MON", km: "ច" },
  tue: { en: "TUE", km: "អ" },
  wed: { en: "WED", km: "ព" },
  thu: { en: "THU", km: "ព្រ" },
  fri: { en: "FRI", km: "សុ" },
  sat: { en: "SAT", km: "ស" },
  sun: { en: "SUN", km: "អា" },
};

export function weekdayLabel(id: WeekdayId, lang: Lang): string {
  return WEEKDAY_LABELS[id][lang];
}

const TASK_KEYS: Record<DailyTaskId, "taskLesson" | "taskPractice" | "taskFlashcards"> = {
  lesson: "taskLesson",
  practice: "taskPractice",
  flashcards: "taskFlashcards",
};

export function dailyTaskLabel(id: DailyTaskId, lang: Lang): string {
  return STREAK_COPY[lang][TASK_KEYS[id]];
}

/** The goal card's link to the next open task: "Continue: Finish a lesson". */
export function continueTaskLabel(task: string, lang: Lang): string {
  return lang === "km" ? `បន្ត៖ ${task}` : `Continue: ${task}`;
}

/** "2 / 3 tasks completed" — pluralised, because "1 tasks" reads as a bug. */
export function tasksCompletedLabel(done: number, total: number, lang: Lang): string {
  if (lang === "km") return `បានបញ្ចប់ ${done} / ${total} កិច្ចការ`;
  return `${done} / ${total} ${total === 1 ? "task" : "tasks"} completed`;
}

/** The status line under the goal ring while the day is still open. */
export function tasksLeftLabel(left: number, lang: Lang): string {
  if (lang === "km") return `នៅសល់ ${left} កិច្ចការទៀត ដើម្បីរក្សា Streak`;
  return `${left} ${left === 1 ? "task" : "tasks"} left to keep your streak`;
}

/** "2 days until your next milestone". */
export function daysUntilMilestoneLabel(days: number, lang: Lang): string {
  if (lang === "km") return `នៅសល់ ${days} ថ្ងៃទៀត ដល់ចំណុចសំខាន់បន្ទាប់`;
  return `${days} ${days === 1 ? "day" : "days"} until your next milestone`;
}

/** "12 / 14 days" — the milestone bar's own readout. */
export function milestoneCountLabel(current: number, target: number, lang: Lang): string {
  if (lang === "km") return `${current} / ${target} ថ្ងៃ`;
  return `${current} / ${target} days`;
}

/** A milestone card's own heading: "7 Days" / "7 ថ្ងៃ" — digits are Latin everywhere, see CLAUDE.md. */
export function milestoneDaysLabel(days: number, lang: Lang): string {
  if (lang === "km") return `${days} ថ្ងៃ`;
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

// ── Friend Streak (the shared streak) ────────────────────────────────────────

/**
 * The headline under the shared count, one line per state of the day.
 *
 * FOUR BRANCHES, NOT THREE, because "neither of us has started" and "I'm done,
 * they aren't" are different situations and only one of them is the friend's
 * fault. Collapsing them — always naming the friend — would tell a student who
 * has not opened a lesson today that Dara is the problem.
 *
 * The brief's own two lines are branches 2 and 4 verbatim. Nothing here scolds
 * in any state: the same forward-only rule the leaderboard applies to the
 * current user's own card.
 */
export function sharedStatusLine(
  friendName: string,
  you: boolean,
  friend: boolean,
  lang: Lang
): string {
  if (you && friend) {
    return lang === "km"
      ? `អ្នក និង ${friendName} បានរក្សា Streak ទុកបានហើយ!`
      : `You and ${friendName} kept the streak alive!`;
  }
  if (you) {
    return lang === "km"
      ? `អ្នកបញ្ចប់ហើយ! ឥឡូវរង់ចាំ ${friendName}។`
      : `You're done! Now waiting for ${friendName}.`;
  }
  if (friend) {
    return lang === "km"
      ? `${friendName} បញ្ចប់ហើយ។ បញ្ចប់គោលដៅរបស់អ្នក ដើម្បីរក្សា Streak។`
      : `${friendName} is done. Finish your goal to keep the streak alive.`;
  }
  return lang === "km"
    ? `មិនទាន់មាននរណាបញ្ចប់គោលដៅថ្ងៃនេះទេ។`
    : `Neither of you has finished today's goal yet.`;
}

/** "Waiting for Dara..." — the goal card's own encouragement line. */
export function waitingForLabel(friendName: string, lang: Lang): string {
  if (lang === "km") return `កំពុងរង់ចាំ ${friendName}...`;
  return `Waiting for ${friendName}...`;
}

/** Why the wait matters, spelled out under it. */
export function friendNeedsToFinishLabel(friendName: string, lang: Lang): string {
  if (lang === "km") {
    return `${friendName} ត្រូវបញ្ចប់គោលដៅថ្ងៃនេះ ដើម្បីរក្សា Streak កុំឲ្យដាច់។`;
  }
  return `${friendName} needs to complete today's goal to keep the streak alive.`;
}

/** A friend refusal, as a sentence. One per hint the friend functions raise
 *  (lib/friends.ts), so a new reason fails to compile until it has words. */
export function friendFailLabel(reason: FriendFail, lang: Lang): string {
  const c = STREAK_COPY[lang];
  const byReason: Record<FriendFail, string> = {
    self: c.failSelf,
    unknown: c.failUnknown,
    exists: c.failExists,
    limit: c.failLimit,
    their_limit: c.failTheirLimit,
    too_many: c.failTooMany,
    missing: c.failMissing,
    unauthenticated: c.failSignIn,
    unconfigured: c.failGeneric,
    failed: c.failGeneric,
  };
  return byReason[reason];
}

/** "Best: 9 days", under a friend's count. */
export function bestStreakLabel(days: number, lang: Lang): string {
  if (lang === "km") return `ល្អបំផុត៖ ${days} ថ្ងៃ`;
  return `Best: ${days} ${days === 1 ? "day" : "days"}`;
}

/** "Friends since 13 Oct 2026". Khmer dates are built by hand (utils/khmer-dates.ts):
 *  a device's own km-KH formatting can print Khmer numerals, or English. */
export function friendsSinceLabel(since: string, lang: Lang): string {
  const date = parseDayKey(since);
  if (lang === "km") return `ជាមិត្តតាំងពី ${formatKmDate(date)}`;
  return `Friends since ${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

/** One day cell's accessible name — the dots and the glyph alone say nothing. */
export function sharedDayAriaLabel(
  dayLabel: string,
  youName: string,
  friendName: string,
  you: boolean,
  friend: boolean,
  lang: Lang
): string {
  const mark = (done: boolean) =>
    done
      ? lang === "km"
        ? "បានបញ្ចប់"
        : "completed"
      : lang === "km"
        ? "មិនទាន់បញ្ចប់"
        : "not completed";
  return `${dayLabel}។ ${youName}: ${mark(you)}, ${friendName}: ${mark(friend)}`;
}

/** "12 days" — used in screen-reader text beside a bare number. */
export function daysLabel(days: number, lang: Lang): string {
  if (lang === "km") return `${days} ថ្ងៃ`;
  return `${days} ${days === 1 ? "day" : "days"}`;
}

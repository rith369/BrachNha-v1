import { addDaysKey, todayKey } from "@/utils/day";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { Lang } from "@/types";

/**
 * The Game feature owns its copy, the way features/streak and features/exam own
 * theirs, rather than growing data/translations.ts by thirty keys that only one
 * screen reads.
 *
 * BILINGUAL, following the store's `lang` — NOT Khmer-only.
 *
 * An earlier pass made this feature Khmer-only behind a GAME_PAGE_LANG constant,
 * reasoning that it is a subject-first screen like Study, Exam and Practice. The
 * user overruled that: they want the page in English AND Khmer, like Home,
 * Progress, Profile and the Leaderboard. It is the right call — the chrome here
 * is gamification labels over numbers, not curriculum, so an English column is
 * ordinary translation rather than the fabrication the Khmer-only rule exists to
 * prevent.
 *
 * THE QUESTIONS THEMSELVES ARE NOT TRANSLATED, on the user's explicit
 * instruction: competition content renders exactly as supplied. ExamQuestion
 * still carries an {en, km} pair because it is shared with MOCK_QS and the
 * placement test; game content may simply carry the same string in both, which
 * is what "no need to translate" means in practice — nobody is asked for a
 * second version.
 */
export const GAME_COPY = {
  en: {
    title: "Game 🎮",
    subtitle: "Play against other students · Bac II Mode",
    createCta: "🎮 Create Game Now!",
    liveGame: "Live Game",
    you: "You",
    waiting: "Waiting for a joiner",
    myStats: "My Game Stats 🏅",
    wins: "Wins 🏆",
    losses: "Losses 💀",
    draws: "Draws 🤝",
    winRate: "Win Rate",
    winsShort: "Wins",
    drawShort: "Draw",
    lossesShort: "Losses",
    myCompetitions: "My Competitions ⏳",
    recentGames: "Recent Games 📜",
    seeAll: "See all →",
    openForJoiners: "Open for joiners",
    notShared: "Not shared yet",
    minutes: "min",
    questions: "questions",
    // Create flow
    create: "Create a competition",
    createBlurb:
      "You play first, then friends join and play against your score.",
    subject: "Subject",
    difficulty: "Difficulty",
    duration: "Time limit",
    startPlaying: "Start playing",
    comingSoon: "Coming soon",
    noQuestions: "No subject has questions yet.",
    // Run
    saving: "Saving…",
    // Posted
    posted: "Competition created!",
    yourScore: "Your score",
    postedBlurb:
      "Waiting for a friend to join. You will see the result once someone plays.",
    postedOffline:
      "Saved on this device, but it could not be shared yet — check your connection and your sign-in. Other students cannot see it until it is.",
    done: "Done",
    // Result
    win: "You win!",
    loss: "You lost",
    draw: "Draw",
    tieBreak: "Same score · decided on speed",
    seconds: "s",
    // Locked
    back: "← Back",
    // Browse list — the app's first network-backed section
    challengeSomeone: "Challenge Someone 👊",
    loadingCompetitions: "Looking for competitions…",
    loadingCompetition: "Opening the competition…",
    competitionsFailed: "Could not load competitions.",
    competitionsEmpty: "Nobody has posted one yet. Be the first!",
    competitionsSignIn: "Sign in to see competitions from other students.",
    competitionGone: "This competition is no longer available.",
    competitionFailed: "Could not open this competition. Check your connection.",
    retry: "Try again",
    play: "🎮 Play",
    scoreToBeat: "Score to beat",
    // Two clocks on the run screen: the budget for the whole competition, and a
    // stopwatch on the question in front of you. The labels are what tell them
    // apart — see clockLabel().
    timeLeft: "Time left",
    thisQuestion: "This question",
    // One attempt per competition — see attemptFor() in game.ts.
    played: "Played",
    alreadyPlayed: "You have already played this competition.",
    seeResult: "See result",
    /** Shown when competitions exist but this student has played them all —
     *  distinct from competitionsEmpty, which means none exist at all. */
    allPlayed: "You have played every competition. Create one of your own!",
    // ── Inviting one particular friend ──
    //
    // The competition is still public and still in everyone's browse list; this
    // is only a faster way to reach one person. The copy therefore says "invite"
    // and never "private", which would be a promise the feature does not make.
    invite: "👋 Invite a friend",
    /** The hub row's button. A LABEL, not a bare icon: the whole complaint this
     *  answers was that the link was hard to find, and an unlabelled glyph does
     *  not fix that. Short because it sits in a list row at the 320px floor. */
    inviteShort: "Invite",
    inviteBlurb: "Play this competition against me!",
    qrHint: "Let your friend scan this, or send them the link.",
    copyLink: "Copy link",
    copied: "Copied!",
    copyFailed: "Could not copy — select the link above instead.",
    shareLink: "Share",
    // ── The review: what each side answered, and the working they showed ──
    //
    // THE QUESTIONS AND OPTIONS ARE STILL NEVER TRANSLATED. These are the labels
    // AROUND the content — the same split the rest of this table already makes.
    reviewTitle: "Answers 📝",
    seeAnswers: "See the answers",
    questionLabel: "Question",
    correctAnswer: "Correct answer",
    noAnswer: "No answer",
    answersUnavailable:
      "This match was played before answers were recorded, so there is nothing to compare.",
    reviewMissing: "That competition is not on this device.",
    // Photos of the working done on paper — PER QUESTION, several per question.
    yourWorking: "Your working ✍️",
    theirWorking: "Their working ✍️",
    photoStepTitle: "Photograph your working",
    photoPrompt:
      "Add photos for each question — as many pages as you used. Skip the ones you did in your head. The answers come next.",
    photoWhy: "Take them before you look — that is what makes the swap worth something.",
    skipHint: "No photos? You will still see the answers, but not their working.",
    addPhoto: "Add photo",
    /** Alt text for one thumbnail: "Page 2". */
    photoPage: "Page",
    photoLimitReached: "Photo limit reached",
    uploadingPhoto: "Uploading…",
    photoFailed: "Could not upload. Check your connection and try again.",
    photosFailed: "Could not load their photos.",
    noPhotoForQuestion: "No photo for this question.",
    // Taking it back. A student uploads a picture of their own handwriting, so
    // being able to withdraw it is part of having agreed to share it at all.
    deletePhoto: "Delete",
    deleteConfirmShort: "Delete?",
    deleteWarns:
      "This is your last photo — deleting it hides their working again.",
    deleteFailed: "Could not delete. Check your connection and try again.",
    photoLocked: "Add your own working to see theirs.",
    loadingPhoto: "Opening…",
    // The creator's side: everyone who took their competition
    joiners: "Who has played 👥",
    noJoinersYet: "Nobody has joined yet.",
    loadingJoiners: "Looking for joiners…",
    joinersFailed: "Could not load who has played.",
  },
  km: {
    title: "ហ្គេម 🎮",
    subtitle: "ប្រកួតជាមួយសិស្សដទៃ · របៀប Bac II",
    createCta: "🎮 បង្កើតការប្រកួតឥឡូវនេះ!",
    liveGame: "ការប្រកួតផ្ទាល់",
    you: "អ្នក",
    waiting: "រង់ចាំអ្នកចូលរួម",
    myStats: "កំណត់ត្រារបស់អ្នក 🏅",
    wins: "ឈ្នះ 🏆",
    losses: "ចាញ់ 💀",
    draws: "ស្មើ 🤝",
    winRate: "អត្រាឈ្នះ",
    winsShort: "ឈ្នះ",
    drawShort: "ស្មើ",
    lossesShort: "ចាញ់",
    myCompetitions: "ការប្រកួតរបស់អ្នក ⏳",
    recentGames: "ការប្រកួតថ្មីៗ 📜",
    seeAll: "មើលទាំងអស់ →",
    openForJoiners: "បើកចំហរង់ចាំ",
    notShared: "មិនទាន់ចែករំលែក",
    minutes: "នាទី",
    questions: "សំណួរ",
    create: "បង្កើតការប្រកួត",
    createBlurb:
      "អ្នកលេងមុនគេ បន្ទាប់មកមិត្តភក្តិចូលរួមប្រកួតនឹងពិន្ទុរបស់អ្នក។",
    subject: "មុខវិជ្ជា",
    difficulty: "កម្រិត",
    duration: "រយៈពេល",
    startPlaying: "ចាប់ផ្តើមលេង",
    comingSoon: "ឆាប់ៗនេះ",
    noQuestions: "មិនទាន់មានសំណួរសម្រាប់មុខវិជ្ជាណាមួយនៅឡើយទេ។",
    saving: "កំពុងរក្សាទុក…",
    posted: "បានបង្កើតការប្រកួត!",
    yourScore: "ពិន្ទុរបស់អ្នក",
    postedBlurb:
      "រង់ចាំមិត្តភក្តិចូលរួម។ នៅពេលមានគេលេង អ្នកនឹងឃើញលទ្ធផល។",
    postedOffline:
      "រក្សាទុកក្នុងឧបករណ៍នេះ ប៉ុន្តែមិនទាន់បានចែករំលែកទេ។ សូមពិនិត្យអ៊ីនធឺណិត និងគណនីរបស់អ្នក។",
    done: "រួចរាល់",
    win: "អ្នកឈ្នះ!",
    loss: "អ្នកចាញ់",
    draw: "ស្មើគ្នា",
    tieBreak: "ពិន្ទុស្មើគ្នា · សម្រេចដោយល្បឿន",
    seconds: "វិនាទី",
    back: "← ត្រឡប់",
    challengeSomeone: "ប្រកួតជាមួយគេ 👊",
    loadingCompetitions: "កំពុងរកការប្រកួត…",
    loadingCompetition: "កំពុងបើកការប្រកួត…",
    competitionsFailed: "មិនអាចទាញយកការប្រកួតបានទេ។",
    competitionsEmpty: "មិនទាន់មាននរណាបង្កើតទេ។ អ្នកជាមនុស្សដំបូង!",
    competitionsSignIn: "ចូលគណនីដើម្បីមើលការប្រកួតរបស់សិស្សដទៃ។",
    competitionGone: "ការប្រកួតនេះលែងមានទៀតហើយ។",
    competitionFailed: "មិនអាចបើកការប្រកួតនេះបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត។",
    retry: "ព្យាយាមម្តងទៀត",
    play: "🎮 លេង",
    scoreToBeat: "ពិន្ទុត្រូវយកឈ្នះ",
    timeLeft: "នៅសល់",
    thisQuestion: "សំណួរនេះ",
    played: "លេងរួច",
    alreadyPlayed: "អ្នកបានលេងការប្រកួតនេះរួចហើយ។",
    seeResult: "មើលលទ្ធផល",
    allPlayed: "អ្នកបានលេងការប្រកួតទាំងអស់ហើយ។ បង្កើតមួយរបស់អ្នកទៅ!",
    invite: "👋 អញ្ជើញមិត្តភក្តិ",
    inviteShort: "អញ្ជើញ",
    inviteBlurb: "មកប្រកួតនឹងខ្ញុំក្នុងការប្រកួតនេះ!",
    qrHint: "ឱ្យមិត្តភក្តិស្កេនកូដនេះ ឬផ្ញើតំណទៅគេ។",
    copyLink: "ចម្លងតំណ",
    copied: "បានចម្លង!",
    copyFailed: "មិនអាចចម្លងបានទេ — សូមជ្រើសរើសតំណខាងលើជំនួសវិញ។",
    shareLink: "ចែករំលែក",
    reviewTitle: "ចម្លើយ 📝",
    seeAnswers: "មើលចម្លើយ",
    questionLabel: "សំណួរទី",
    correctAnswer: "ចម្លើយត្រឹមត្រូវ",
    noAnswer: "គ្មានចម្លើយ",
    answersUnavailable:
      "ការប្រកួតនេះបានលេងរួចមុនពេលប្រព័ន្ធកត់ត្រាចម្លើយ ដូច្នេះគ្មានអ្វីប្រៀបធៀបទេ។",
    reviewMissing: "រកមិនឃើញការប្រកួតនេះនៅលើឧបករណ៍នេះទេ។",
    yourWorking: "សន្លឹកចម្លើយរបស់អ្នក ✍️",
    theirWorking: "សន្លឹកចម្លើយរបស់គេ ✍️",
    photoStepTitle: "ថតរូបការគណនារបស់អ្នក",
    photoPrompt:
      "បន្ថែមរូបសម្រាប់សំណួរនីមួយៗ — ប៉ុន្មានសន្លឹកក៏បាន។ រំលងសំណួរដែលអ្នកគិតក្នុងចិត្ត។ បន្ទាប់មកអ្នកនឹងឃើញចម្លើយ។",
    photoWhy: "ថតមុនពេលមើលចម្លើយ ទើបការផ្លាស់ប្តូរគំនិតមានតម្លៃ។",
    skipHint: "គ្មានរូប? អ្នកនៅតែឃើញចម្លើយ ប៉ុន្តែមិនឃើញការគណនារបស់គេទេ។",
    addPhoto: "បន្ថែមរូប",
    photoPage: "ទំព័រ",
    photoLimitReached: "ដល់ចំនួនរូបអតិបរមាហើយ",
    uploadingPhoto: "កំពុងផ្ទុកឡើង…",
    photoFailed: "មិនអាចផ្ទុកឡើងបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    photosFailed: "មិនអាចទាញយករូបរបស់គេបានទេ។",
    noPhotoForQuestion: "គ្មានរូបសម្រាប់សំណួរនេះទេ។",
    deletePhoto: "លុប",
    deleteConfirmShort: "លុប?",
    deleteWarns: "នេះជារូបចុងក្រោយរបស់អ្នក — លុបវា នឹងលាក់ការគណនារបស់គេវិញ។",
    deleteFailed: "មិនអាចលុបបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    photoLocked: "ដាក់សន្លឹកចម្លើយរបស់អ្នកជាមុនសិន ទើបមើលរបស់គេបាន។",
    loadingPhoto: "កំពុងបើក…",
    joiners: "អ្នកដែលបានលេង 👥",
    noJoinersYet: "មិនទាន់មាននរណាចូលរួមទេ។",
    loadingJoiners: "កំពុងរកអ្នកចូលរួម…",
    joinersFailed: "មិនអាចទាញយកអ្នកចូលរួមបានទេ។",
  },
} as const;

/**
 * The one-word outcome shown on a chip — shared by the browse list and the
 * history card. Separate from copy.win/loss/draw, which are full sentences for
 * the result SCREEN ("You win!"); a chip needs one word.
 */
export const OUTCOME_LABEL = {
  win: { en: "Won", km: "ឈ្នះ" },
  loss: { en: "Lost", km: "ចាញ់" },
  draw: { en: "Draw", km: "ស្មើ" },
} as const;

export function gameCopy(lang: Lang) {
  return GAME_COPY[lang];
}

/** Digits follow the language: Khmer numerals in Khmer, Latin in English —
 *  matching how the rest of the bilingual chrome reads. */
export function num(value: number | string, lang: Lang): string {
  return lang === "km" ? toKhmerDigits(value) : String(value);
}

/**
 * `m:ss` from milliseconds.
 *
 * Shared by the run's COUNTDOWN (time left in the whole competition) and each
 * question's STOPWATCH (time spent on this one). Two clocks sit on that screen
 * at once, so they must at least be shaped identically — a countdown reading
 * `1:05` beside a stopwatch reading `65s` would make the pair harder to read
 * than either alone. Their LABELS are what tell them apart.
 *
 * It lives here rather than in competition-run.tsx because a non-component
 * export from a `.tsx` trips oxlint's `only-export-components` — the rule
 * `utils/focus-styles.ts` exists for.
 */
export function clockLabel(ms: number, lang: Lang): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${num(Math.floor(s / 60), lang)}:${num(
    String(s % 60).padStart(2, "0"),
    lang
  )}`;
}

/**
 * "Today" / "Yesterday" / "N days ago".
 *
 * HAND-WRITTEN RATHER THAN `Intl`, and that is not a style choice. Desktop
 * Chrome ships with no Khmer locale data — `Intl.DateTimeFormat` formats
 * `km-KH` in English without any warning — and Android ships trimmed data too.
 * The streak screens hand-write their Khmer weekday names for exactly this
 * reason, and two places in the app (commitment-banner.tsx's formatSignedDate
 * and utils/exam-date.ts's formatExamDate) still carry the bug.
 *
 * The day is re-derived through utils/day.ts, which computes a LOCAL calendar
 * day. Never `toISOString().slice(0, 10)` — that is UTC, and for a Phnom Penh
 * student studying before 07:00 it names the wrong day. The stored value is an
 * instant, which is correct; only the comparison has to be local.
 */
export function relativeDay(iso: string, lang: Lang): string {
  const day = localDayOf(iso);
  const now = new Date();
  if (day === todayKey(now)) return lang === "en" ? "Today" : "ថ្ងៃនេះ";
  if (day === addDaysKey(now, -1))
    return lang === "en" ? "Yesterday" : "ម្សិលមិញ";

  // Walk back rather than subtracting timestamps: a span containing a clock
  // change is not a whole number of 24-hour periods, and addDaysKey already
  // knows how to step a calendar day.
  for (let n = 2; n <= 30; n++) {
    if (day === addDaysKey(now, -n)) {
      return lang === "en" ? `${n} days ago` : `${toKhmerDigits(n)} ថ្ងៃមុន`;
    }
  }
  return lang === "en" ? "A while ago" : "យូរមកហើយ";
}

function localDayOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

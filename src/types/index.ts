export type Lang = "en" | "km";

// ── auth ────────────────────────────────────────────────────────────────────
//
// These live here rather than beside the code that uses them because both
// lib/store.ts and lib/auth.ts need them, and lib/auth.ts already reaches
// lib/supabase-sync.ts, which writes back into the store. Importing the types
// from a leaf module keeps that a type-only relationship instead of a runtime
// import cycle.

/** "loading" until the session is resolved, or ruled out without importing the
 *  SDK at all (see hasAuthTraces in lib/auth.ts). NOTHING may read "loading" as
 *  "signed out" — that is what flashes the entry screen at a signed-in student. */
export type AuthStatus = "loading" | "ready";

/** The identity, flattened out of a Supabase session. Non-null only for a real,
 *  non-anonymous account. Never persisted. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

/** Which locked feature raised the login prompt. A union rather than a free
 *  string so the modal's copy table has to cover every case that can reach it —
 *  adding a feature here is a type error until its wording exists. */
export type AuthFeature = "roadmap" | "chat" | "game";

/** One side of the sign-in conflict: enough to tell the two apart on screen
 *  without pulling either one down first. */
export interface AccountSnapshot {
  name: string;
  level: number;
  xp: number;
  streak: number;
}

/**
 * Raised when a sign-in finds study data on the DEVICE and a real account on
 * the SERVER, and they are not the same account this device last synced with.
 *
 * Neither side is written until the student picks one. Without this the push
 * path runs unconditionally and a guest signing in on a school computer
 * silently overwrites the account on their phone — see `syncedUserId` in
 * lib/store.ts for why the two cannot simply be merged.
 */
export interface AccountConflict {
  userId: string;
  local: AccountSnapshot;
  remote: AccountSnapshot;
}

// No `months` here on purpose: the time left is derived from the fixed exam
// date (utils/exam-date.ts), not asked for and stored. A stored answer goes
// stale the day after it is given.
export interface UserData {
  strengths: string[];
  weaknesses: string[];
  grade: string;
  /** Whether the student has already studied some Bac II material. Only `false`
   *  is reachable today — the survey's "I've studied some" branch is a labelled
   *  stub pending real lesson names — but the answer is committed anyway so the
   *  branch has its value waiting when it's built. Absent from older persisted
   *  copies, which read as undefined → falsy → "not yet", the correct default. */
  studied: boolean;
}

export interface Tasks {
  lesson: boolean;
  practice: boolean;
  flashcards: boolean;
  challenge: boolean;
}

/** One local calendar day of study — the device's twin of a daily_activity row. */
export interface DayActivity {
  /** XP earned that day. > 0 means the student studied. */
  xp: number;
  /** All three daily-goal tasks (utils/streak.ts's DAILY_GOAL_TASKS) were done
   *  that day. ONLY these days count toward the streak. */
  goal: boolean;
  /**
   * ACTIVE study minutes that day — time on a study screen with the tab visible
   * and the student actually touching it. See hooks/use-study-timer.ts for what
   * counts and what deliberately does not.
   *
   * OPTIONAL, and that is what makes it need no migration: every day already
   * logged predates the timer, and `?? 0` reads that correctly as "not
   * measured" rather than as "studied for zero minutes". Same no-migration
   * reasoning as Competition.sharedAt.
   *
   * It lives on the DAY rather than on contentLog's per-content entry because
   * idle time is not attributable to a lesson — a student can sit on one
   * section for an hour and study for ten minutes of it — and because the two
   * cards that read it are subject-agnostic.
   */
  minutes?: number;
}

/** Keyed `YYYY-MM-DD` by utils/day.ts's todayKey(). The streak, the "+N today"
 *  label and the Profile calendar are all derived from this and nothing else.
 *  An absent day was not studied at all. */
export type ActivityLog = Record<string, DayActivity>;

/**
 * Work done against ONE piece of content on ONE local day.
 *
 * This is the record nothing in the app kept before: a scored question,
 * attributed to a subject. `activityLog` knows a day earned XP; it has never
 * known what the XP was for, which is why every per-subject number on the
 * Progress dashboard was invented.
 */
export interface ContentDay {
  /** Scored questions answered — section quizzes, practice quizzes, exams. */
  answered: number;
  /** Of those, right first time. `correct <= answered` always. */
  correct: number;
  /**
   * Flashcard grades. Counted for VOLUME and never folded into accuracy: a
   * grade is a self-report ("I remembered it"), not a scored answer, and
   * mixing the two would make "average score" a blend of measured and claimed
   * that no caption on the page distinguishes.
   */
  reviewed: number;
  /** Sittings at this content that day. Two sittings at one lesson are two. */
  sessions: number;
}

/**
 * day key (`YYYY-MM-DD`) → content key → counters.
 *
 * A CONTENT KEY is either a LESSON key (`biology-3-1`) or a bare subject id
 * (`biology`) for work not attached to a lesson — an exam paper. The subject is
 * the first segment of both, which works because every SubjectId is a single
 * hyphen-free token; see features/progress/content-keys.ts, which is the only
 * place that parsing is allowed to happen.
 *
 * AGGREGATE, NOT AN EVENT LOG, and the distinction is load-bearing. A row per
 * question would grow with the fastest-growing quantity in the app and would
 * need a MAX_ cap the way reviewHistory does — and a cap silently truncates
 * exactly the history the 30-day trend reads. This grows with days × content
 * touched instead, so answering 200 questions in one lesson costs the same
 * bytes as answering 2. Trimmed to MAX_ACTIVITY_DAYS alongside activityLog.
 */
export type ContentLog = Record<string, Record<string, ContentDay>>;

export interface PendingPlacementTest {
  subject: string;
  scheduledDate: string;
}

// The pledge a student signs after seeing their roadmap. The grade/months/
// hours/mission fields are a SNAPSHOT taken at signing time, not live reads of
// userData — the promise has to keep saying what they actually agreed to even
// if they later re-do a placement test or their plan shifts.
export interface Commitment {
  /** "drawn" → `signature` is SVG path data; "typed" → it's the name itself. */
  kind: "drawn" | "typed";
  signature: string;
  signedAt: string;
  grade: string;
  /** Months left AT SIGNING TIME. A snapshot, unlike everywhere else — see
   *  utils/exam-date.ts. Do not turn this into a live countdown. */
  months: string;
  hoursPerDay: number;
  mission: { lessons: number; practice: number; flashcards: number };
}

// One bubble in the KruAI chat. Shared by the store (which owns the
// history), the ChatOverlay (which renders it) and the /api/chat route (which
// replays it to Gemini as conversation context), so all three agree on shape.
export interface ChatMsg {
  role: "user" | "bot";
  text: string;
  /**
   * A stable React key for the bubble. OPTIONAL because messages already sitting
   * in a student's localStorage predate it and messages restored from Supabase
   * have none either — the chat_messages table stores `seq`, `role` and
   * `content`, and this is not worth a migration to add.
   *
   * It exists because the list is NOT append-only: addChatMsg caps a
   * conversation with `slice(-40)`, which drops from the FRONT, so past 40
   * messages every remaining message's index shifts by one. The overlay used to
   * key on that index, which had React reuse each bubble's DOM node for a
   * different message — wrong text against an in-flight KaTeX render. Rendering
   * falls back to the index when this is absent, which is correct for history
   * that is already painted and will not move again.
   */
  id?: string;
}

// One saved conversation with KruAI. Conversations are created lazily —
// only once the student actually sends a first message — so tapping "New chat"
// never leaves an empty row behind in the history list.
export interface Conversation {
  id: string;
  /** Derived from the first user message; see utils/chat-history.ts. */
  title: string;
  msgs: ChatMsg[];
  createdAt: string;
  /** ISO timestamp of the last message. The history list sorts on this. */
  updatedAt: string;
}

// ── Content types (used once data/lessons.ts, data/questions.ts,
//    data/translations.ts are ported from the old content-*.js files) ──

export interface Model3DRef {
  /** public/-relative path, e.g. "/models/brain.glb" — loaded by URL, not imported. */
  src: string;
  /** License credit line, rendered under the viewer. */
  credit: string;
  /** Optional caption naming what the model shows, over the top-left corner.
   *  Authored rather than hardcoded in the viewer, because the viewer is shared
   *  and a second model would need a different name. */
  title?: string;
}

export interface Lesson {
  title: { en: string; km: string };
  importance: string;
  icon: string;
  content: { en: string; km: string };
  summary: { en: string; km: string };
  funFact: { en: string; km: string };
  tip: { en: string; km: string };
  didYouKnow?: { en: string; km: string };
  /** Only set on lessons with an interactive 3D model (currently just the
   *  Human Brain lesson). Absent everywhere else — no other lesson's render
   *  path changes. */
  model3d?: Model3DRef;
}

export interface Flashcard {
  q: { en: string; km: string };
  a: { en: string; km: string };
  topic: string;
}

export interface PracticeQuestion {
  q: { en: string; km: string };
  correct: string;
  options: string[];
  explanation: { en: string; km: string };
}

// ── Section content ──
//
// A SECTION is one node on a subject path and the unit the real curriculum is
// written in: មេរៀនសង្ខេប → ឧទាហរណ៍ → ចំណាំសំខាន់ៗ → កំហុស. That is deliberately
// NOT the shape of `Lesson` above, which is the older
// content/summary/funFact/tip/didYouKnow flow and stays as it is for the two
// legacy lessons. Bending one into the other would lose what makes each work —
// most visibly `Misconception`, where the pairing IS the teaching.
//
// Every string here is KHMER ONLY, not an { en, km } pair. Same decision as
// LESSONS_PAGE_LANG, EXAM_PAGE_LANG and KruAI's ANSWER_LANG: the content exists
// in Khmer, and inventing an English column for it would be fabrication dressed
// as data.

export interface SectionItem {
  /** Bold lead-in before the colon — "សរីរាង្គវិញ្ញាណ៖ …". */
  label?: string;
  body: string;
  /** Nested bullets, e.g. រំញោច / ការឆ្លើយតប under the stimulus note. */
  items?: string[];
}

export interface SectionBlock {
  /** Optional lead paragraph above the items. */
  intro?: string;
  items: SectionItem[];
  /** Optional closing paragraph below the items. */
  outro?: string;
}

/** An ❌ / ✍️ pair. Two fields rather than free text: the contrast is the point,
 *  and a single blob could not render the two halves differently. */
export interface Misconception {
  wrong: string;
  right: string;
}

/** Khmer-only sibling of PracticeQuestion. */
export interface SectionQuestion {
  /** Optional ស្ថានភាព setting the question up. Rendered above the prompt in a
   *  quieter style, because it is the situation rather than the question. */
  scenario?: string;
  q: string;
  options: string[];
  /** Must match one of `options` EXACTLY — the comparison is string equality,
   *  so the ក./ខ./គ./ឃ. prefix has to be carried here too. */
  correct: string;
  explanation: string;
  /**
   * The rule behind this question, the mistake students make on it, and the
   * exercises to practise it on — rendered under the answer by SkillDrill.
   *
   * THE HELP OBJECT ITSELF, not a key into a table, so the renderer needs no
   * lookup, no id union and no import from a subject's data file. The data file
   * still keys its own record by a skill id (see data/quizzes/math-1-1-1.ts), so
   * a future "give me more of what I got wrong" matcher has stable ids to group
   * on; the reference here is what links the two without the component learning
   * about either.
   *
   * OPTIONAL: every question already authored — biology's section quizzes — has
   * none, and `undefined` reads correctly as "no help written yet", which is the
   * same no-migration reasoning ExamQuestion.difficulty uses.
   */
  help?: SkillHelp;
}

/** Poster + duration for a section's video. There is no video file yet; see
 *  SectionVideoPlayer for why the player is built anyway. */
export interface SectionVideo {
  /** public/-relative poster image, e.g. "/sections/biology-3-1-1.webp". */
  poster: string;
  /** Run time in seconds, formatted for display. A number rather than a string
   *  so a malformed "3:9" cannot be typed in. */
  durationSec: number;
}

export interface SectionContent {
  title: string;
  /** Shown at the top of the section, under the title. */
  video?: SectionVideo;
  /** Opens the section — why the topic matters and what it covers. Rendered
   *  first, with no heading of its own: the section title above it is the
   *  heading, and a second one would just repeat it. */
  intro: SectionBlock;
  lesson: SectionBlock;
  examples: SectionBlock;
  notes: SectionBlock;
  mistakes: Misconception[];
  /** Interactive 3D model, shown under the examples. Same shape and the same
   *  viewer the Human Brain lesson uses — absent on every section without one,
   *  so no other section pays for the three.js chunk. */
  model3d?: Model3DRef;
  /** Absent until questions are written; the block simply doesn't render. An
   *  ARRAY because a section can ask several — the first one authored has two. */
  quiz?: SectionQuestion[];
}

/** Who authored a flashcard — see PracticeCard. */
export type FlashcardSource = "official" | "student";

/**
 * One flashcard in a lesson's practice deck.
 *
 * Deliberately NOT the older `Flashcard` above, which carries `{ en, km }` pairs
 * and a `topic` string tying it to the legacy 7-step lesson flow. The practice
 * feature is Khmer-only (PRACTICE_PAGE_LANG in features/practice/practice.ts) and
 * keys its content by LESSON rather than by topic, so an English column here
 * would be fabrication dressed as data — the same call SectionContent made.
 *
 * `id` is REQUIRED and must be stable, because the spaced-repetition layer
 * (utils/spaced-repetition.ts) keys per-card review state off it — an array
 * index would silently point at the wrong card the moment content is reordered
 * or a student's own card is deleted from the middle of their list. Official
 * cards get an explicit id when authored (matching the app's everywhere-else
 * convention of explicit ids over generated ones — session ids, lesson ids);
 * student cards get one from the store's `newId()` on creation.
 *
 * `source` distinguishes an official (BrachNha-authored) card from a
 * student-authored one. This is ONE type with a discriminant rather than two
 * separate `OfficialFlashcard`/`StudentFlashcard` interfaces — both would carry
 * the exact same front/back/id/timestamps fields, and a duplicate field list is
 * one more place for the two to quietly drift apart.
 */
export interface PracticeCard {
  id: string;
  /** The prompt side — a term, a question, a formula to recall. */
  front: string;
  /** The answer side, revealed on flip. */
  back: string;
  source: FlashcardSource;
  createdAt: string;
  updatedAt: string;
}

export type MockExamSubject = "math" | "biology" | "chemistry" | "physics";

/**
 * One multiple-choice question in an exam.
 *
 * `subj` is OPTIONAL here because a past paper is ONE subject end to end and
 * carries its label on the paper rather than repeating it per question — and
 * MockExamSubject cannot express a Khmer or History paper anyway, which the
 * past-paper catalog has entries for.
 */
export interface ExamQuestion {
  subj?: MockExamSubject;
  q: { en: string; km: string };
  correct: string;
  options: string[];
  /**
   * How hard this question is, used by the Game feature when a creator picks a
   * difficulty for their competition.
   *
   * OPTIONAL, and left unset on every question that exists today. None of the
   * authored questions carry a difficulty, and assigning one to each of them
   * would be inventing a judgement nobody made — the same reason a chapter with
   * no supplied title carries "" rather than a made-up one. An untagged question
   * passes every filter, so tagging content later starts the filter working with
   * no code change, exactly as adding a GAME_QUESTIONS entry turns a subject on.
   */
  difficulty?: GameDifficulty;
}

/** A question in the generated mock exam, where the subject is always known. */
export interface MockExamQuestion extends ExamQuestion {
  subj: MockExamSubject;
}

/**
 * ── A REAL MoEYS PAST PAPER ──────────────────────────────────────────────────
 *
 * A past paper is not a flat question list: it has numbered PARTS, each with its
 * own instruction and worked example, one of which may be a gap-fill over a
 * shared passage, and a writing task nothing can mark automatically.
 *
 * These types sit BESIDE `ExamQuestion` rather than widening it. That type is
 * shared with MOCK_QS, the placement test and the Game feature, and a `skill` or
 * an `explanation` means nothing to any of them. `PaperQuestion` extends it
 * instead, so one flattened `ExamQuestion[]` can still be derived for the card's
 * readiness rule (see features/exam/papers.ts) with nothing authored twice.
 */

/**
 * What a question tests, and therefore which study note and drill a student who
 * got it wrong is offered. Keyed into SKILLS in data/papers/english-drills.ts.
 *
 * English-specific today because the 2025 English paper is the only real paper
 * in the app. A maths paper would add its own ids here rather than reusing
 * these; nothing derives a subject from a skill.
 */
export type SkillId =
  | "quantifiers"
  | "past-simple"
  | "future-passive"
  | "because-of"
  | "conditional-2"
  | "collocation"
  | "word-choice"
  | "gap-context";

/** One scored question on a past paper. */
export interface PaperQuestion extends ExamQuestion {
  /**
   * Stable within the paper — `"g1"`, `"v3"`, `"r7"`. Answers are keyed on it
   * rather than on a running index, so reordering a section or inserting a
   * missed question cannot silently re-point a saved answer at another one.
   */
  id: string;
  /**
   * What this question tests, which is what a wrong answer offers a drill on.
   *
   * OPTIONAL, because `SkillId` is the ENGLISH paper's vocabulary and a maths
   * paper has none of those skills. A question with no skill simply shows its
   * explanation and no drill — absent rather than empty, and the honest state
   * until maths drills are written.
   */
  skill?: SkillId;
  /**
   * What the printed paper marks this part out of, where it says.
   *
   * SHOWN, NEVER SCORED ON. scorePaper() counts parts answered correctly,
   * because the app marks a tap and the real paper marks written working — see
   * the results screen's caption. Optional: a paper that prints no per-part
   * mark must not be given one.
   */
  points?: number;
  /** Why the correct answer is correct, in Khmer. Shown in the review. */
  explanation: string;
}

/** One blank in a gap-fill passage. */
export interface PaperGap {
  id: string;
  /** Printed gap number — `(3)`. Not the array index: gap 1 is the example. */
  number: number;
  /** The word from the bank that belongs here. */
  correct: string;
  /** True for the gap the paper prints already filled in as an example. */
  example?: boolean;
  skill: SkillId;
  explanation: string;
}

/**
 * The Reading part: one passage, one shared word bank, many gaps.
 *
 * `body` is the passage with `{1}`, `{2}` … where the gaps go — authored as one
 * string rather than as an array of alternating text/gap pieces, so the prose
 * stays readable and proofreadable in the data file. The renderer splits it.
 */
export interface PaperGapFill {
  title: string;
  body: string;
  /** Every word offered, in the order the paper's box prints them. */
  wordBank: string[];
  gaps: PaperGap[];
}

/** One numbered part of a paper. Exactly one of `questions`/`gapFill` is set. */
export interface PaperSection {
  id: string;
  /** As printed: "I. Reading", "II. Grammar". */
  title: string;
  instruction: string;
  /**
   * THE WHOLE EXERCISE AS PRINTED, shown on the part's cover before its first
   * question — the user's rule: "write the whole exercise first before start to
   * qcm".
   *
   * It exists because turning a written maths part into several multiple-choice
   * sub-questions hides the thing a student is actually sitting: the paper asks
   * one exercise with lettered parts, and meeting it as a run of isolated taps
   * teaches a shape the real exam does not have. So the cover prints the
   * exercise exactly as the paper does, and the sub-questions that follow are
   * how the app marks it.
   *
   * Rendered through MathText with `whitespace-pre-line`, so it carries LaTeX in
   * `$…$` and keeps its own line breaks. KHMER STAYS OUTSIDE THE DELIMITERS —
   * KaTeX has no Khmer glyphs and splitMath refuses such a span outright.
   *
   * Optional: the English paper's parts are a sentence of instruction and
   * nothing more, and inventing a statement for one would be printing something
   * the paper does not.
   */
  statement?: string;
  /** The worked example the paper gives before the questions. */
  example?: string;
  questions?: PaperQuestion[];
  gapFill?: PaperGapFill;
}

/**
 * The writing task. NOT typed into the app and NOT scored — the student writes
 * on paper, and afterwards compares against `modelEssay`, which is written for
 * BrachNha rather than copied from the paper's own printed sample.
 */
export interface PaperWriting {
  title: string;
  prompt: string;
  minWords: number;
  modelEssay: string[];
  /** What a good answer has to contain, for self-marking. */
  checklist: string[];
}

/** A whole past paper, as printed. */
export interface PastPaperContent {
  /** From the paper's own header — the only honest source for a timer. */
  minutes: number;
  /**
   * One line about what the app holds of this paper, shown on its detail
   * screen. For a paper transcribed in parts — the maths paper is I to III of
   * VII — this is what stops the parts list reading as the whole exam.
   */
  note?: string;
  /**
   * The mark the printed paper is out of, off its own header.
   *
   * OPTIONAL, because a paper whose header does not print one must not be given
   * a number. It is shown on the paper's detail screen as a fact about the real
   * exam and is NOT what the app scores out of — the pages supplied do not give
   * the per-part split, so scorePaper() counts the objective questions and the
   * results screen says so.
   */
  points?: number;
  sections: PaperSection[];
  writing?: PaperWriting;
}

/** One practice question offered alongside an answer. */
export interface DrillQuestion {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
}

/**
 * A skill's study note plus its exercises.
 *
 * Shared by the English past paper (offered only after a WRONG answer — see
 * past-paper-results.tsx) and the math practice quiz (offered after EVERY
 * answer, because practice is not measurement). The component renders whatever
 * it is handed; WHEN to hand it over is the caller's decision.
 *
 * `mistake` and `foundation` are OPTIONAL so the eight English entries in
 * data/papers/english-drills.ts stay valid untouched. A record that means to
 * carry all four should type itself `Record<Id, Required<SkillHelp>>`, which is
 * what makes forgetting one of ten a compile error rather than a missing line
 * on question 7.
 */
export interface SkillHelp {
  /** Khmer name of what this tests, shown as the review's ចំណាំ heading. */
  label: string;
  /** The rule, in Khmer. Two to four short lines. */
  note: string[];
  /** Exercises in the same shape as the question this hangs off. */
  questions: DrillQuestion[];
  /** The កំហុសញឹកញាប់ line — the error students actually make here. One
   *  sentence, and every distractor in `questions` should trace back to it. */
  mistake?: string;
  /** Prerequisite exercises, shown under their own heading below `questions`:
   *  the step a student who missed this one probably never had. */
  foundation?: DrillQuestion[];
}

// A worked past-paper answer, used as a few-shot example in KruAI's
// system prompt (see data/bac2-format.ts). `verified` means a teacher has
// checked the answer against a real MoEYS paper / answer key.
export interface Bac2Example {
  subject: string;
  question: { en: string; km: string };
  answer: { en: string; km: string };
  verified: boolean;
}

/**
 * How hard a competition is, chosen by whoever created it.
 *
 * "mix" is a real option rather than the absence of one: it says the creator
 * deliberately wanted a spread, which is different from not having decided.
 */
export type GameDifficulty = "easy" | "medium" | "hard" | "mix";

/**
 * A challenge one student posts for others to take.
 *
 * THE QUESTIONS ARE FROZEN ONTO THE ROW, not an index or a seed into the
 * subject's pool. It costs a little more storage and buys the one property the
 * whole feature rests on: a joiner answers EXACTLY what the creator answered,
 * for as long as the competition exists. A reference into the pool would break
 * the moment data/game-questions.ts is edited — and since content is explicitly
 * arriving later, that edit is not hypothetical. It also means a result stays
 * meaningful after the source questions are reworded or removed.
 *
 * `creatorName` IS DENORMALISED ON PURPOSE AND MUST STAY THAT WAY. The result
 * screen has to name who you were up against, and the obvious way to get that —
 * letting everyone read `profiles` — would publish email, age and location with
 * it. supabase/migrations/20260828000002_rls_policies.sql forbids exactly that
 * policy. Carrying the name here is what lets a competition be world-readable
 * while `profiles` stays owner-only. Do not "tidy" this into a join.
 *
 * The cost of that choice, stated so it is not mistaken for a bug: a student who
 * renames themselves does not rename their old competitions.
 */
export interface Competition {
  /** Client-minted, like conversations.id — see newId() in lib/store.ts. */
  id: string;
  creatorId: string;
  creatorName: string;
  /** A SubjectId, held as a plain string: lib/ never imports from features/,
   *  the same reason PendingPlacementTest.subject is one. */
  subject: string;
  difficulty: GameDifficulty;
  /** The whole-quiz budget the creator chose. */
  minutes: number;
  questions: ExamQuestion[];
  /**
   * WHICH OPTION THE CREATOR PICKED for each question, positionally matched to
   * `questions`, with null where the clock ran out before they answered.
   *
   * The option TEXT rather than its index, matching how `correct` is compared
   * everywhere else in this app — an index would be a second representation of
   * the same answer, free to drift the day a pool is reordered.
   *
   * OPTIONAL because every competition posted before the review screen existed
   * is already sitting in students' browsers without it, and on the server the
   * column defaults to `[]`. Both read as "this match predates answer recording",
   * which the review screen says out loud rather than drawing a grid where every
   * question looks unanswered. Same no-migration reasoning as `sharedAt`.
   */
  creatorAnswers?: (string | null)[];
  creatorScore: number;
  /** How long the creator took. Milliseconds, and the tie-break: equal scores
   *  rank on speed. */
  creatorMs: number;
  total: number;
  /** A full ISO INSTANT, never a date key — see utils/day.ts. */
  createdAt: string;
  /**
   * When this reached the server, or ABSENT if it never has.
   *
   * Absent is the honest default and the reason this is optional rather than a
   * boolean: every competition created before the tables existed is already
   * sitting in students' browsers without the field, and `undefined` reads
   * correctly as "not shared" with no migration.
   *
   * It exists because the local copy is written first and unconditionally, so a
   * publish can fail — offline, signed out, tables missing — and leave a
   * competition nobody else can see. Without this the hub called those rows
   * "open for joiners", which was simply false. features/game/share-pending.ts
   * retries them; MyCompetitions labels them until it succeeds.
   */
  sharedAt?: string;
  /**
   * Set while this student has AT LEAST ONE photo of their working on this
   * competition, on any question; ABSENT once they have none.
   *
   * A LOCAL MARKER WITH NO COLUMN BEHIND IT, and that is the point: photos live at
   * `{competitionId}/{userId}/{question}-{photoId}.jpg` and are found by listing
   * that folder, so the server needs nothing recorded and both tables stay
   * insert-only. This exists so the review screen can skip the photo step, and
   * open the reciprocity gate, before the list has arrived — or when it cannot
   * arrive at all. See lib/competition-photos.ts.
   */
  photoAt?: string;
}

/**
 * One student's run at someone else's competition.
 *
 * IT CARRIES THE COMPARISON, not just this student's half. `opponentName`,
 * `opponentScore`, `opponentMs`, `subject` and `total` are copied from the
 * competition at the moment it was played, so the row is a complete record of a
 * result on its own.
 *
 * That is what lets the history list render without the competition it refers
 * to — which matters as soon as competitions live on the server: a joiner
 * fetches one, plays it, and has no reason to keep it. The alternative is a
 * second read per history row, and a history that goes blank offline. Same
 * reasoning as freezing the questions onto the competition, and the same cost:
 * if the creator renames themselves, an old attempt keeps the old name.
 */
export interface CompetitionAttempt {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  score: number;
  ms: number;
  /** The creator's half of the comparison, frozen at play time. */
  opponentName: string;
  /**
   * The creator's account id, used to pick their avatar (utils/avatar-seed.ts)
   * so they look the same here as they did in the browse list.
   *
   * OPTIONAL because attempts already in a student's browser predate it, and
   * those fall back to hashing the name — the same no-migration reasoning as
   * Competition.sharedAt. Local-only: the server's competition_attempts row
   * identifies the competition by competition_id, which carries the creator.
   */
  opponentId?: string;
  opponentScore: number;
  opponentMs: number;
  /** A SubjectId, as a plain string — see Competition.subject. */
  subject: string;
  total: number;
  playedAt: string;
  /**
   * THE REVIEW'S THREE FIELDS. Everything the "what did each of us answer"
   * screen needs, frozen here at play time so it renders with no network at all.
   *
   * That is this type's existing rule taken one step further, not a new one: the
   * attempt already copies the opponent's score and name precisely so the history
   * list does not have to re-read a competition the joiner has no reason to keep.
   * A review that had to fetch would be a screen that goes blank on a bad
   * connection, in an app where every other screen does not.
   *
   * The cost is honest and bounded: roughly 8KB per attempt, against a store that
   * keeps at most MAX_COMPETITIONS of them.
   *
   * All three are OPTIONAL so attempts already in a student's browser still open
   * — the screen says the match predates answer recording rather than drawing an
   * empty grid. Same reasoning as `opponentId` and `Competition.sharedAt`.
   */
  questions?: ExamQuestion[];
  /** This student's own picks, positionally matched to `questions`. */
  answers?: (string | null)[];
  /** The creator's picks, copied off the competition at play time. */
  opponentAnswers?: (string | null)[];
  /** Set while this student has at least one photo of their working here — a
   *  local marker with no column behind it, exactly like Competition.photoAt. */
  photoAt?: string;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Lang,
  UserData,
  Tasks,
  PendingPlacementTest,
  ChatMsg,
  Conversation,
  Commitment,
  PracticeCard,
  AuthStatus,
  AuthUser,
  AuthFeature,
  AccountConflict,
  ActivityLog,
  Competition,
  CompetitionAttempt,
} from "@/types";
import { makeConversationTitle } from "@/utils/chat-history";
import {
  schedule,
  initialReviewState,
  type ReviewGrade,
  type ReviewResult,
  type ReviewState,
} from "@/utils/spaced-repetition";
import { FLASHCARD_XP, FLASHCARD_COINS, TASK_XP } from "@/utils/rewards";
import { addDaysKey, parseDayKey, todayKey } from "@/utils/day";
import { currentStreak, isGoalComplete } from "@/utils/streak";

export type {
  Lang,
  UserData,
  Tasks,
  PendingPlacementTest,
  ChatMsg,
  Conversation,
  Commitment,
  AuthStatus,
  AuthUser,
  AuthFeature,
  AccountConflict,
};

// Conversations are persisted, so both dimensions are capped — otherwise a
// chatty student slowly fills localStorage.
const MAX_CHAT_MSGS = 40; // per conversation
const MAX_CONVERSATIONS = 20; // oldest-updated dropped first
// Competitions a student has posted, and their runs at other people’s. Both
// persisted, so both need a bound like conversations and reviewHistory. 50 is
// months of real use; oldest drop first.
const MAX_COMPETITIONS = 50;

// reviewHistory grows by one entry per grade, across every deck, for as long
// as the student keeps studying — the fastest-growing persisted list in the
// app by far. 1000 is generous (months of real daily use) while still
// bounding localStorage; oldest entries drop first, same rule conversations
// already follow.
const MAX_REVIEW_HISTORY = 1000;

// activityLog gains at most one key per day studied, so this is roughly a
// year and a month of history — longer than a Bac II cohort uses the app, and
// the same window the sync layer pulls back on a fresh device.
export const MAX_ACTIVITY_DAYS = 400;

function newId(): string {
  // randomUUID needs a secure context; localhost and https both qualify, but
  // fall back rather than throw on an http:// LAN address during testing.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface ExamResult {
  score: number;
  total: number;
  pct: number;
  date: string;
}

export type Theme = "dark" | "light";

export interface LoginData {
  name: string;
  language: "english" | "french";
  email?: string;
  age?: string;
  location?: string;
}

interface BrachNhaState {
  // ── auth ──
  //
  // THE SESSION IS THE ONLY PROOF OF AUTHENTICATION. `authUser` below is a
  // flattened copy of it, and it is deliberately NOT persisted — it is
  // re-derived from Supabase on every load by hooks/use-auth-session.ts,
  // because a value someone can edit in devtools is not evidence of anything.
  //
  /** "loading" until the session has been resolved (or ruled out without even
   *  importing the SDK — see hasAuthTraces in lib/auth.ts). Nothing may treat
   *  "loading" as "signed out": that is what would flash the entry screen at a
   *  student who is in fact signed in. */
  authStatus: AuthStatus;
  /** Non-null ONLY for a real, non-anonymous session. Not persisted. */
  authUser: AuthUser | null;
  /**
   * The student chose "Continue as Guest". Persisted, and it GRANTS NOTHING —
   * it only routes them past the entry screen on the next load. Every check
   * that unlocks a feature reads `authUser`, never this.
   *
   * Deliberately does NOT set a userName: writing a placeholder like "Guest"
   * into the store would push it to profiles.display_name, surface it on the
   * leaderboard and pre-fill it into the pledge signature, and then survive a
   * later Google sign-in — leaving the student permanently named "Guest".
   * useDisplayName() supplies the fallback at render time instead.
   */
  guestMode: boolean;
  /** Which feature raised the "login required" prompt, or null. A string rather
   *  than a boolean so the modal can say what it was that needed an account. */
  authPrompt: AuthFeature | null;
  /**
   * The last account this DEVICE successfully synced with, or null.
   *
   * This is what makes signing in safe. `pushLocalState` writes a full
   * destructive snapshot — it deletes server conversations absent from the
   * local list and overwrites xp/level/coins/streak — so pushing into an
   * account this device has never seen would wipe whatever the student built up
   * on another one. Comparing the session's uid against this distinguishes
   * "my own account, back again" from "an account I am adopting", and the
   * second case asks before writing anything. See hooks/use-supabase-sync.ts.
   */
  syncedUserId: string | null;
  /** Set when a sign-in finds data on BOTH sides and the student has to choose.
   *  Nothing is written to either side until they do. */
  accountConflict: AccountConflict | null;

  // ── onboarding / profile ──
  lang: Lang;
  userName: string;
  userEmail: string;
  userAge: string;
  userLocation: string;
  userLanguage: "" | "english" | "french";
  surveyed: boolean;
  userData: UserData;
  pendingPlacementTests: PendingPlacementTest[];
  /** null until the student signs their roadmap pledge. Skippable, so a
   *  surveyed student can stay null indefinitely. */
  commitment: Commitment | null;
  /** True once the pledge overlay has been opened and closed — signed OR
   *  skipped. NOT the same as `commitment !== null`: the roadmap hides its
   *  hamburger and chat FAB until this flips, so gating that on the signature
   *  alone would strip the page forever for a student who declines. */
  pledgeSeen: boolean;

  // ── progression (was scattered useState in App() before) ──
  xp: number;
  level: number;
  /**
   * A spendable currency, earned alongside XP. XP measures how far the student
   * has come and only ever rises; coins are the same effort expressed as
   * something they can hold. Kept as a REAL persisted number awarded by the
   * same helper that grants XP — never a decorative figure on a header.
   * Nothing spends them yet.
   */
  coins: number;
  /**
   * DERIVED from `activityLog` by currentStreak() in utils/streak.ts, and
   * stored only so every reader — Home's StatPills, the global StatBar, both
   * /streak screens, the mentor prompt, profiles.streak — keeps reading one
   * plain field. Counts GOAL-COMPLETE days only. Recomputed wherever it can
   * change: `completeTask()` (the goal just completed) and
   * `rolloverDailyTasks()` (a day passed without it). Nothing may set it any
   * other way — and earning XP alone deliberately does not touch it.
   */
  streak: number;
  /** The one record of WHEN a student studied: per local day, the XP earned and
   *  whether the daily goal was met. See DayActivity in types/index.ts. XP is
   *  written by `award()`, the goal by `completeTask()`; capped at
   *  MAX_ACTIVITY_DAYS; synced through daily_activity. */
  activityLog: ActivityLog;
  tasks: Tasks;
  /**
   * The local calendar day (`YYYY-MM-DD`) `tasks` describes.
   *
   * `tasks` is meant to be TODAY's checklist and nothing else — Home's daily
   * checklist, Roadmap's Daily Mission and daily_activity's one-row-per-day all
   * assume it. It was never true: `resetDailyTasks` existed but had no caller
   * anywhere in the repo, and `completeTask` is a one-way latch, so a student's
   * first finished lesson left `tasks.lesson` ticked forever, its 20 XP was a
   * once-in-a-lifetime award rather than a daily one, and every future day's
   * activity row inherited the stale flags.
   *
   * This is the stamp that makes the reset possible: `rolloverDailyTasks()`
   * compares it to `todayKey()` and clears when they differ. Empty string means
   * "no tasks have been completed yet", which needs no reset.
   */
  tasksDate: string;
  examResults: ExamResult[];
  /**
   * Competitions this student CREATED.
   *
   * LOCAL-ONLY IN THIS STORE, and deliberately absent from `syncRelevantChange`
   * in hooks/use-supabase-sync.ts — not because it does not reach the server,
   * but because it does NOT go through the snapshot push. lib/competitions.ts
   * writes each competition once, at the moment it is posted.
   *
   * That distinction is the point. `pushLocalState` writes a DESTRUCTIVE
   * snapshot of this student's own tables, and a competition is not exclusively
   * theirs — other students' attempts hang off it. Pushed that way, clearing a
   * browser would delete challenges other people were part-way through. An
   * earlier draft of this comment told stage B to add both fields to that list;
   * that would have been the bug, and this is the correction.
   */
  competitions: Competition[];
  /** This student's own runs at other people's competitions. Written straight to
   *  the server by lib/competitions.ts for the same reason, and kept here so the
   *  history list renders offline. */
  competitionAttempts: CompetitionAttempt[];
  /**
   * Lesson ids the student has finished, which is what turns a session node on
   * the subject path from "next" into "done". Holds lesson ids rather than a
   * separate session id so it cannot drift from the lesson flow that sets it.
   */
  completedSessions: string[];
  /**
   * Per-card spaced-repetition state, keyed by `PracticeCard.id`. A card with
   * no entry here has never been graded — features/practice/review.ts treats
   * that as a fresh `initialReviewState()` rather than requiring one to exist
   * up front, so this map only ever holds cards that have actually been seen.
   *
   * LOCAL-ONLY for this prototype — deliberately NOT added to
   * `syncRelevantChange` in use-supabase-sync.ts or the push/pull mapping in
   * supabase-sync.ts. That layer pushes a full snapshot of each table on every
   * debounced change, which suits the small, capped data it handles today
   * (conversations, exam results); a per-card review table updated on every
   * single grade is a different access pattern and scale, and deserves its own
   * incremental sync path rather than being forced into the existing one. See
   * CLAUDE.md's Supabase section for what a real `card_reviews` table would
   * need to look like when that lands.
   */
  cardReviews: Record<string, ReviewState>;
  /**
   * Student-authored flashcards, keyed by the SAME deck key official cards use
   * (`"{subjectId}-{chapter}-{lesson}"`, see practiceKey in
   * features/practice/practice.ts) — a student's own cards live alongside the
   * official deck for that lesson rather than in a separate freeform deck
   * system, so the review queue, due-dates and UI stay one mechanism instead of
   * two. Same local-only reasoning as `cardReviews` above.
   */
  studentCards: Record<string, PracticeCard[]>;
  /**
   * Card ids the student has personally starred as important — a bookmark,
   * not a review-schedule concept, which is why it's a flat id list rather
   * than living inside `ReviewState`: a card's importance to the student has
   * nothing to do with where it sits in the spaced-repetition cycle. Works
   * for both official and student-authored cards since both share one id
   * space. Same local-only reasoning as `cardReviews` above.
   */
  starredCards: string[];
  /**
   * Every graded review, oldest first, capped at MAX_REVIEW_HISTORY. This is
   * DELIBERATELY SEPARATE from `cardReviews`: that map holds each card's
   * CURRENT scheduling state (one row per card, overwritten on every grade —
   * the interval, the next due date, the last grade), while this is the
   * EVENT LOG behind it (one row per grade, ever, never overwritten). A card
   * you've graded ten times has ONE entry in `cardReviews` and up to ten
   * here. Nothing reads this back yet — it exists so a future "how have you
   * done on this card over time" or "which cards keep coming back" view has
   * real data to read rather than needing a second capture pass added later.
   */
  reviewHistory: ReviewResult[];

  // ── ui ──
  /** Device preference, not account data — deliberately NOT reset by logout().
   *  Written onto <html> as a class by AppShell; index.html applies the same
   *  value before first paint so there's no light flash on load. */
  theme: Theme;
  chatOpen: boolean;
  drawerOpen: boolean;
  /** The commitment overlay. Lives here (not in RoadmapView's useState) because
   *  AppShell renders the overlay — RoadmapView's own root is a scrolling
   *  container, so an absolute panel inside it would anchor to scrolled
   *  content instead of the app frame. Same reasoning as chatOpen. */
  pledgeOpen: boolean;
  /** True while the student is mid-question in the mock exam, which hides every
   *  navigation affordance. Route-based tasks (a lesson, a placement test) are
   *  detected from the pathname instead — see utils/focus-routes.ts — because
   *  they have no equivalent "started" state. useFocusMode() ORs the two.
   *
   *  Deliberately NOT persisted: a stale `true` restored on next load would
   *  strand a student on a page with no way to navigate anywhere. */
  focusMode: boolean;

  // ── ai mentor chat ──
  // Lives here rather than in ChatOverlay's useState because AppShell unmounts
  // the overlay on close ({chatOpen && <ChatOverlay />}), which used to wipe
  // the conversation every time the student closed the mentor.
  conversations: Conversation[];
  /** null means a blank chat that hasn't been saved yet — addChatMsg creates
   *  the real conversation on the first message. */
  activeConversationId: string | null;

  // ── actions ──
  /** Called only by hooks/use-auth-session.ts, from the one onAuthStateChange
   *  subscription. A no-op when nothing actually changed — see the body: this
   *  fires on every token refresh and every tab focus, and `persist` writes the
   *  whole store to localStorage on every set(). */
  setAuthSession: (status: AuthStatus, user: AuthUser | null) => void;
  /** "Continue as Guest". Sets the flag and NOTHING else — deliberately no
   *  placeholder userName; see the field's own comment. */
  continueAsGuest: () => void;
  openAuthPrompt: (feature: AuthFeature) => void;
  closeAuthPrompt: () => void;
  setSyncedUserId: (userId: string | null) => void;
  setAccountConflict: (conflict: AccountConflict | null) => void;
  setLang: (lang: Lang) => void;
  /** The English/French track, changeable after signup. It decides which
   *  language subject appears across Study, Practice, the exam tabs and grade
   *  prediction, and used to be settable only on the login form — which a guest
   *  never sees, leaving them on the allSubjects() English fallback with no way
   *  out. Profile owns the control. */
  setStudyLanguage: (language: "english" | "french") => void;
  completeLogin: (data: LoginData) => void;
  /** Profile's name edit. Ignores a blank name — see the action body. */
  setUserName: (name: string) => void;
  completeSurvey: (data: UserData) => void;
  schedulePlacementTest: (subject: string, scheduledDate: string) => void;
  resolvePlacementTest: (subject: string, isWeak: boolean) => void;
  signCommitment: (commitment: Commitment) => void;
  /** `coins` overrides the default XP→coins ratio; see `award`. */
  addXp: (amount: number, coins?: number) => void;
  completeTask: (task: keyof Tasks) => void;
  completeSession: (lessonId: string) => void;
  /** Grade one flashcard, advance its schedule (see utils/spaced-repetition.ts)
   *  and award the flat per-card reward. Works for a card never graded before —
   *  it starts from a fresh state rather than requiring one to exist. */
  gradeCard: (cardId: string, grade: ReviewGrade) => void;
  addStudentCard: (deckKey: string, front: string, back: string) => void;
  updateStudentCard: (
    deckKey: string,
    cardId: string,
    front: string,
    back: string
  ) => void;
  /** Also drops any review-state record for that card — see the action body. */
  deleteStudentCard: (deckKey: string, cardId: string) => void;
  toggleStarredCard: (cardId: string) => void;
  addExamResult: (result: ExamResult) => void;
  /**
   * Posts a competition this student created, and pays for their own run.
   *
   * MINTS THE id AND createdAt ITSELF, so no component has to call newId() or
   * Date.now() — both are impure, and a call in a component body is the purity
   * violation oxlint's react(purity) rule and the React Compiler both object
   * to. Same shape as addChatMsg, which mints conversation ids here too.
   */
  addCompetition: (
    competition: Omit<Competition, "id" | "createdAt">,
    xp: number
  ) => void;
  /**
   * Stamps a competition as having reached the server.
   *
   * Separate from addCompetition because the two happen at different moments:
   * the row is saved immediately, and publishing it is a network round trip that
   * may only succeed on a later visit. Returns the state unchanged when there is
   * nothing to do, so a no-op publishes no store update — the same shape
   * rolloverDailyTasks uses.
   */
  markCompetitionShared: (id: string) => void;
  /** Records this student’s run at someone else’s competition. Mints its own
   *  id and playedAt, for the reason above. */
  addCompetitionAttempt: (
    attempt: Omit<CompetitionAttempt, "id" | "playedAt">,
    xp: number
  ) => void;
  /**
   * Records whether this student has a photo of their working for a competition.
   *
   * TWO-WAY, unlike markCompetitionShared, because a photo can be taken back —
   * see deleteWorkPhoto. That is the whole reason this is a setter with a
   * boolean rather than a one-way stamp: sharing is a fact about the past and
   * cannot un-happen, but a photograph of your own handwriting is something you
   * are allowed to withdraw.
   *
   * KEYED ON THE COMPETITION, NOT ON A ROW, and it writes to whichever of the
   * two lists holds it — which is never both: you cannot join a competition you
   * created, so exactly one of `competitions` and `competitionAttempts` can
   * match an id. That is what makes one action correct for both sides rather
   * than two to choose between at every call site.
   *
   * It records nothing the server does not already know — the file's path is
   * derived from ids (see lib/competition-photos.ts) — and exists only so the
   * review screen can decide whether to ask for a photo without a network round
   * trip. Returns the state unchanged when there is nothing to do.
   */
  setWorkPhoto: (competitionId: string, taken: boolean) => void;
  resetDailyTasks: () => void;
  /** Clears `tasks` and re-derives `streak` if `tasksDate` is not today.
   *  Idempotent and cheap, so the caller can run it on mount and on every
   *  tab-visible without a guard. */
  rolloverDailyTasks: () => void;
  setTheme: (theme: Theme) => void;
  setChatOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setPledgeOpen: (open: boolean) => void;
  setFocusMode: (on: boolean) => void;
  markPledgeSeen: () => void;
  addChatMsg: (msg: ChatMsg) => void;
  appendChatChunk: (text: string) => void;
  startNewChat: () => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  logout: () => void;
}

/**
 * The single place XP, level and coins are granted together.
 *
 * Both addXp and completeTask route through this so the three can never drift —
 * the level rule used to be written out twice, once in each, which is exactly
 * how a third caller ends up levelling differently.
 *
 * COINS_PER_XP is the DEFAULT, not a universal law. Coins are the same earned
 * effort as XP in a spendable form, so anything granting XP grants coins in
 * proportion unless it says otherwise, and there is no per-action table to keep
 * in step. Math.floor means small XP grants can round to zero coins, which is
 * correct — it should take real work to earn one.
 *
 * `coins` overrides that ratio for a caller whose reward was set by hand. Today
 * that is exactly one: a correct quiz answer, specified as 10 XP + 5 coins,
 * which is twice the ratio. It is an argument rather than a second constant so
 * the exception stays visible at the call site instead of hiding in a table
 * here — if a third or fourth caller ever needs one, that is the signal the
 * ratio itself is wrong and should be re-set, not worked around again.
 *
 * It is ALSO the single place a day becomes a studied day. Every lesson, quiz
 * answer, flashcard and daily task already routes its reward through here, so
 * logging the XP against today in the same breath is what makes "studied" and
 * "earned something" one fact rather than two trackers that can drift.
 *
 * It does NOT touch the streak. A streak day is a GOAL-complete day, not a
 * studied one (the user's rule), so only completeTask() can make one.
 */
const COINS_PER_XP = 0.25;

/** Drops anything older than MAX_ACTIVITY_DAYS. Day keys compare
 *  chronologically as plain strings. */
function trimLog(log: ActivityLog, today: string): ActivityLog {
  const cutoff = addDaysKey(parseDayKey(today), -MAX_ACTIVITY_DAYS);
  return Object.fromEntries(
    Object.entries(log).filter(([day]) => day > cutoff)
  );
}

/** Today's XP grows by `amount`. A zero grant leaves the log untouched rather
 *  than writing an empty entry, which would claim a studied day that wasn't.
 *  (`prev?.xp` also reads a plain number — the first, XP-only shape of this
 *  log — as 0 instead of throwing; it only ever reached development browsers.) */
function logXp(log: ActivityLog, today: string, amount: number): ActivityLog {
  if (amount <= 0) return log;
  const prev = log[today];
  return trimLog(
    { ...log, [today]: { xp: (prev?.xp ?? 0) + amount, goal: prev?.goal === true } },
    today
  );
}

/** Marks today's goal done. Idempotent. */
function logGoal(log: ActivityLog, today: string): ActivityLog {
  const prev = log[today];
  if (prev?.goal === true) return log;
  return trimLog({ ...log, [today]: { xp: prev?.xp ?? 0, goal: true } }, today);
}

function award(
  state: { xp: number; level: number; coins: number; activityLog: ActivityLog },
  amount: number,
  coins?: number
) {
  const xp = state.xp + amount;
  return {
    xp,
    level: xp >= state.level * 100 ? state.level + 1 : state.level,
    coins: state.coins + (coins ?? Math.floor(amount * COINS_PER_XP)),
    activityLog: logXp(state.activityLog, todayKey(), amount),
  };
}

const emptyTasks: Tasks = {
  lesson: false,
  practice: false,
  flashcards: false,
  challenge: false,
};

const emptyUserData: UserData = {
  strengths: [],
  weaknesses: [],
  grade: "",
  studied: false,
};

// Named rather than inline so `migrate` can borrow its return type — the two
// have to agree on exactly which keys reach localStorage.
const partializeState = (state: BrachNhaState) => ({
  // Persisted, but NOT synced — the two exceptions to the one-to-one with
  // syncRelevantChange in hooks/use-supabase-sync.ts, noted here so the next
  // person auditing the two lists does not "fix" them:
  //
  //   guestMode    — a choice about this device, not study data. Pushing it
  //                  would be pushing it for an account that by definition has
  //                  no session to push with.
  //   syncedUserId — bookkeeping ABOUT the sync, so syncing it is circular.
  //
  // authStatus/authUser/authPrompt/accountConflict are excluded outright, like
  // the UI flags below: the session is re-derived from Supabase on every load,
  // and a persisted copy of "who is signed in" would be exactly the thing an
  // attacker edits.
  guestMode: state.guestMode,
  syncedUserId: state.syncedUserId,
  lang: state.lang,
  userName: state.userName,
  userEmail: state.userEmail,
  userAge: state.userAge,
  userLocation: state.userLocation,
  userLanguage: state.userLanguage,
  surveyed: state.surveyed,
  userData: state.userData,
  pendingPlacementTests: state.pendingPlacementTests,
  commitment: state.commitment,
  pledgeSeen: state.pledgeSeen,
  xp: state.xp,
  level: state.level,
  coins: state.coins,
  streak: state.streak,
  activityLog: state.activityLog,
  tasks: state.tasks,
  tasksDate: state.tasksDate,
  examResults: state.examResults,
  competitions: state.competitions,
  competitionAttempts: state.competitionAttempts,
  completedSessions: state.completedSessions,
  cardReviews: state.cardReviews,
  studentCards: state.studentCards,
  starredCards: state.starredCards,
  reviewHistory: state.reviewHistory,
  theme: state.theme,
  conversations: state.conversations,
  activeConversationId: state.activeConversationId,
  // chatOpen/drawerOpen/pledgeOpen/focusMode intentionally excluded — UI state.
  // focusMode especially: persisting it would restore a student into a screen
  // with every navigation control hidden and no way back out.
});

type PersistedState = ReturnType<typeof partializeState>;

export const useBrachNhaStore = create<BrachNhaState>()(
  persist(
    (set) => ({
      // "loading" is the honest opening value even when Supabase is
      // unconfigured — use-auth-session.ts settles it on mount either way, and
      // the gate in AppShell only ever renders a splash for a student who would
      // be looking at the entry screen anyway.
      authStatus: "loading",
      authUser: null,
      guestMode: false,
      authPrompt: null,
      syncedUserId: null,
      accountConflict: null,

      lang: "en",
      userName: "",
      userEmail: "",
      userAge: "",
      userLocation: "",
      userLanguage: "",
      surveyed: false,
      userData: emptyUserData,
      pendingPlacementTests: [],
      commitment: null,
      pledgeSeen: false,

      xp: 0,
      level: 1,
      coins: 0,
      // Derived from activityLog — see the field's doc comment. It used to be
      // a seeded 12 (DEMO_SEED_STREAK) that nothing ever incremented.
      streak: 0,
      activityLog: {},
      tasks: emptyTasks,
      tasksDate: "",
      examResults: [],
      competitions: [],
      competitionAttempts: [],
      completedSessions: [],
      cardReviews: {},
      studentCards: {},
      starredCards: [],
      reviewHistory: [],

      theme: "light",
      chatOpen: false,
      drawerOpen: false,
      pledgeOpen: false,
      focusMode: false,
      conversations: [],
      activeConversationId: null,

      /**
       * Returns the state object UNCHANGED when the resolved identity has not
       * moved, which matters more than it looks: `persist` serialises the whole
       * store — up to 20 conversations of 40 messages — on every set(), and
       * this is called from an auth listener that fires on every hourly token
       * refresh and every tab focus. Comparing the id rather than the object is
       * the point; the listener builds a fresh AuthUser each time.
       *
       * Signing IN also clears `guestMode`. Without that a guest who signs in
       * keeps the flag, which would skip the survey and leave every locked
       * feature still locked for someone who now has an account.
       */
      setAuthSession: (status, user) =>
        set((state) => {
          const sameUser = (state.authUser?.id ?? null) === (user?.id ?? null);
          if (state.authStatus === status && sameUser) return state;
          return {
            authStatus: status,
            authUser: user,
            guestMode: user ? false : state.guestMode,
            // A prompt on screen is asking them to do exactly this; leaving it
            // up over the app they just unlocked would be its own bug.
            authPrompt: user ? null : state.authPrompt,
          };
        }),

      continueAsGuest: () => set({ guestMode: true, authPrompt: null }),
      openAuthPrompt: (feature) => set({ authPrompt: feature }),
      closeAuthPrompt: () => set({ authPrompt: null }),
      setSyncedUserId: (userId) => set({ syncedUserId: userId }),
      setAccountConflict: (conflict) => set({ accountConflict: conflict }),

      setLang: (lang) => set({ lang }),
      setStudyLanguage: (language) => set({ userLanguage: language }),
      completeLogin: (data) =>
        set({
          userName: data.name,
          userLanguage: data.language,
          userEmail: data.email ?? "",
          userAge: data.age ?? "",
          userLocation: data.location ?? "",
        }),

      // Blank is refused HERE, not only in the form: an empty userName is
      // exactly what AppShell's gate reads as "signed in, no profile yet", so
      // writing one would throw the student back onto the signup form.
      setUserName: (name) =>
        set((state) => {
          const trimmed = name.trim();
          return trimmed && trimmed !== state.userName
            ? { userName: trimmed }
            : state;
        }),

      completeSurvey: (data) =>
        set({ userData: data, surveyed: true }),

      schedulePlacementTest: (subject, scheduledDate) =>
        set((state) => ({
          pendingPlacementTests: [
            ...state.pendingPlacementTests.filter(
              (p) => p.subject !== subject
            ),
            { subject, scheduledDate },
          ],
        })),

      resolvePlacementTest: (subject, isWeak) =>
        set((state) => {
          const weaknesses = isWeak
            ? Array.from(new Set([...state.userData.weaknesses, subject]))
            : state.userData.weaknesses.filter((s) => s !== subject);
          return {
            pendingPlacementTests: state.pendingPlacementTests.filter(
              (p) => p.subject !== subject
            ),
            userData: { ...state.userData, weaknesses },
          };
        }),

      // Re-signing overwrites: there's only ever one live pledge, and the new
      // one re-snapshots whatever the plan says today.
      signCommitment: (commitment) => set({ commitment }),

      addXp: (amount, coins) => set((state) => award(state, amount, coins)),

      completeTask: (task) =>
        set((state) => {
          // Roll the day over first, so finishing a task on a new day clears
          // yesterday's ticks rather than adding to them. Without this, a
          // student whose tab has been open since yesterday would find the
          // task already "done" and earn nothing for real work.
          const today = todayKey();
          const rolled = state.tasksDate === today ? state.tasks : emptyTasks;
          if (rolled[task]) return state; // already done today, no-op
          const tasks = { ...rolled, [task]: true };
          const rewarded = award(state, TASK_XP);
          // THE ONLY PLACE A STREAK DAY IS MADE. The goal is complete the moment
          // the last of its three tasks lands, whichever order they came in.
          const activityLog = isGoalComplete(tasks)
            ? logGoal(rewarded.activityLog, today)
            : rewarded.activityLog;
          return {
            tasks,
            tasksDate: today,
            ...rewarded,
            activityLog,
            streak: currentStreak(activityLog, today),
          };
        }),

      // Idempotent: finishing a lesson a second time must not stack rewards,
      // and the path only needs to know that it is done.
      completeSession: (lessonId) =>
        set((state) =>
          state.completedSessions.includes(lessonId)
            ? state
            : { completedSessions: [...state.completedSessions, lessonId] }
        ),

      // A card with no prior record starts from a fresh ReviewState rather
      // than requiring one to already exist — this is what lets a "new" card
      // (never graded) be scheduled the first time it's shown.
      gradeCard: (cardId, grade) =>
        set((state) => {
          const prev = state.cardReviews[cardId] ?? initialReviewState();
          const reviewedAt = new Date().toISOString();
          return {
            cardReviews: {
              ...state.cardReviews,
              [cardId]: schedule(prev, grade),
            },
            // The event log — see reviewHistory's own doc comment for how
            // this differs from cardReviews above. Oldest dropped first, the
            // same rule conversations already follow.
            reviewHistory: [
              ...state.reviewHistory,
              { cardId, grade, reviewedAt },
            ].slice(-MAX_REVIEW_HISTORY),
            ...award(state, FLASHCARD_XP, FLASHCARD_COINS),
          };
        }),

      addStudentCard: (deckKey, front, back) =>
        set((state) => {
          const now = new Date().toISOString();
          const card: PracticeCard = {
            id: newId(),
            front,
            back,
            source: "student",
            createdAt: now,
            updatedAt: now,
          };
          return {
            studentCards: {
              ...state.studentCards,
              [deckKey]: [...(state.studentCards[deckKey] ?? []), card],
            },
          };
        }),

      updateStudentCard: (deckKey, cardId, front, back) =>
        set((state) => ({
          studentCards: {
            ...state.studentCards,
            [deckKey]: (state.studentCards[deckKey] ?? []).map((c) =>
              c.id === cardId
                ? { ...c, front, back, updatedAt: new Date().toISOString() }
                : c
            ),
          },
        })),

      deleteStudentCard: (deckKey, cardId) =>
        set((state) => {
          // Drop the card's review-state record too, or a stale entry sits in
          // cardReviews forever pointing at nothing.
          const { [cardId]: _dropped, ...restReviews } = state.cardReviews;
          return {
            studentCards: {
              ...state.studentCards,
              [deckKey]: (state.studentCards[deckKey] ?? []).filter(
                (c) => c.id !== cardId
              ),
            },
            cardReviews: restReviews,
          };
        }),

      toggleStarredCard: (cardId) =>
        set((state) =>
          state.starredCards.includes(cardId)
            ? { starredCards: state.starredCards.filter((id) => id !== cardId) }
            : { starredCards: [...state.starredCards, cardId] }
        ),

      resetDailyTasks: () =>
        set({ tasks: emptyTasks, tasksDate: todayKey() }),

      // The caller is AppShell, on mount and on every visibilitychange — a
      // phone left open overnight has to roll over too, and "hidden → visible"
      // is the only reliable moment a backgrounded tab gets to notice.
      // Returns the state object unchanged when there is nothing to do, so
      // zustand publishes no update and the sync layer schedules no push.
      rolloverDailyTasks: () =>
        set((state) => {
          const today = todayKey();
          if (state.tasksDate === today) return state;
          // No tasks completed yet: stamp the day and leave the (already
          // empty) checklist alone, so a fresh install does not look like a
          // rollover that just happened.
          return {
            tasks: emptyTasks,
            tasksDate: today,
            // A new day is the one moment a streak can BREAK with no task being
            // completed, so completeTask() alone would never notice. A run that
            // ended yesterday still counts today (see currentStreak); one that
            // ended the day before does not.
            streak: currentStreak(state.activityLog, today),
          };
        }),

      addExamResult: (result) =>
        set((state) => ({ examResults: [...state.examResults, result] })),

      addCompetition: (competition, xp) =>
        set((state) => ({
          competitions: [
            ...state.competitions,
            { ...competition, id: newId(), createdAt: new Date().toISOString() },
          ].slice(-MAX_COMPETITIONS),
          ...award(state, xp),
        })),

      markCompetitionShared: (id) =>
        set((state) => {
          const i = state.competitions.findIndex((c) => c.id === id);
          if (i === -1 || state.competitions[i].sharedAt) return state;
          const next = [...state.competitions];
          next[i] = { ...next[i], sharedAt: new Date().toISOString() };
          return { competitions: next };
        }),

      addCompetitionAttempt: (attempt, xp) =>
        set((state) => ({
          competitionAttempts: [
            ...state.competitionAttempts,
            { ...attempt, id: newId(), playedAt: new Date().toISOString() },
          ].slice(-MAX_COMPETITIONS),
          ...award(state, xp),
        })),

      setWorkPhoto: (competitionId, taken) =>
        set((state) => {
          // undefined rather than a falsy string, so a row with no photo is
          // shaped exactly like one written before this field existed — there is
          // one "no photo" state, not two.
          const at = taken ? new Date().toISOString() : undefined;

          const ci = state.competitions.findIndex((c) => c.id === competitionId);
          if (ci !== -1) {
            if (Boolean(state.competitions[ci].photoAt) === taken) return state;
            const next = [...state.competitions];
            next[ci] = { ...next[ci], photoAt: at };
            return { competitions: next };
          }

          const ai = state.competitionAttempts.findIndex(
            (a) => a.competitionId === competitionId
          );
          if (ai === -1) return state;
          if (Boolean(state.competitionAttempts[ai].photoAt) === taken) return state;
          const next = [...state.competitionAttempts];
          next[ai] = { ...next[ai], photoAt: at };
          return { competitionAttempts: next };
        }),


      setTheme: (theme) => set({ theme }),
      setChatOpen: (open) => set({ chatOpen: open }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setPledgeOpen: (open) => set({ pledgeOpen: open }),
      setFocusMode: (on) => set({ focusMode: on }),
      // One-way: the student has now been shown the pledge, so the roadmap
      // stops hiding its chrome whether or not they went through with it.
      markPledgeSeen: () => set({ pledgeSeen: true }),

      // Creates the conversation lazily on the first message, so "New chat"
      // never leaves an empty row in the history list.
      addChatMsg: (rawMsg) =>
        set((state) => {
          const now = new Date().toISOString();
          // Stamped here rather than at the call site so every message gets one
          // from the single place messages are created — the overlay's key
          // depends on it, and a caller that forgot would silently fall back to
          // the index key this exists to replace.
          const msg: ChatMsg = { ...rawMsg, id: rawMsg.id ?? newId() };
          const active = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );

          if (!active) {
            const created: Conversation = {
              id: newId(),
              title: makeConversationTitle(msg.text),
              msgs: [msg],
              createdAt: now,
              updatedAt: now,
            };
            return {
              conversations: [created, ...state.conversations].slice(
                0,
                MAX_CONVERSATIONS
              ),
              activeConversationId: created.id,
            };
          }

          const updated: Conversation = {
            ...active,
            msgs: [...active.msgs, msg].slice(-MAX_CHAT_MSGS),
            // A conversation that somehow opened with a bot bubble gets titled
            // by the first user message that does arrive.
            title:
              active.title ||
              (msg.role === "user" ? makeConversationTitle(msg.text) : ""),
            updatedAt: now,
          };

          // Move to the front: the array is kept sorted newest-updated-first so
          // the MAX_CONVERSATIONS cap always drops the least recently used one.
          return {
            conversations: [
              updated,
              ...state.conversations.filter((c) => c.id !== active.id),
            ],
          };
        }),

      // Streaming writes here: each chunk off the wire is glued onto the last
      // bot bubble, which addChatMsg pushed empty just before the request.
      appendChatChunk: (text) =>
        set((state) => {
          const active = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );
          const last = active?.msgs[active.msgs.length - 1];
          if (!active || !last || last.role !== "bot") return state;

          return {
            conversations: state.conversations.map((c) =>
              c.id === active.id
                ? {
                    ...c,
                    msgs: [
                      ...c.msgs.slice(0, -1),
                      { ...last, text: last.text + text },
                    ],
                  }
                : c
            ),
          };
        }),

      startNewChat: () => set({ activeConversationId: null }),

      openConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        })),

      logout: () =>
        set({
          // Cleared in the SAME set() as the study data, not left to the auth
          // listener a moment later. profile-view.tsx fires signOutAccount()
          // without awaiting it, so for a beat `userName` is empty while
          // `authUser` is still set — and the gate would read that as "signed
          // in but no profile" and flash LoginView on the way out.
          authStatus: "ready",
          authUser: null,
          guestMode: false,
          authPrompt: null,
          syncedUserId: null,
          accountConflict: null,
          userName: "",
          userEmail: "",
          userAge: "",
          userLocation: "",
          userLanguage: "",
          surveyed: false,
          userData: emptyUserData,
          pendingPlacementTests: [],
          commitment: null,
          pledgeSeen: false,
          xp: 0,
          level: 1,
          coins: 0,
          streak: 0,
          activityLog: {},
          tasks: emptyTasks,
          tasksDate: "",
          examResults: [],
          competitions: [],
          competitionAttempts: [],
          completedSessions: [],
          cardReviews: {},
          studentCards: {},
          starredCards: [],
          reviewHistory: [],
          conversations: [],
          activeConversationId: null,
        }),
    }),
    {
      name: "brachnha", // same localStorage key as the current prototype
      partialize: partializeState,

      // v1 stamped writes so a future schema change COULD use `migrate`; v2 is
      // the first one that actually did. Note neither helps with the v0 data
      // already in students' browsers — see the `merge` note below.
      version: 4,

      migrate: (persisted, version) => {
        let state = persisted as Partial<PersistedState>;

        // v1 → v2: dark shipped as the default for a few hours and got written
        // into everyone's localStorage before the default flipped to light.
        // That stored "dark" is the old default rather than a choice anyone
        // made, so it's cleared — otherwise flipping the default changes
        // nothing for the people who already opened the app. A deliberate pick
        // made from the drawer after this lands is stamped v2 and is left
        // alone.
        if (version < 2) {
          state = { ...state, theme: "light" as const };
        }

        // v3 → v4 (and it supersedes the old v2 → v3 step, which lifted the
        // seed 3 → 12): the streak stops being a seed and starts being derived
        // from activityLog. Overwriting a persisted value is normally wrong —
        // but NOTHING EVER INCREMENTED THIS FIELD, so every stored streak, 3 or
        // 12, is a default rather than days a student earned. There is no
        // history to derive a real one from, so it is 0 until they study.
        //
        // THIS IS THE LAST STREAK MIGRATION. From v4 on the stored number is
        // derived from the student's own log; a future step must never touch it.
        if (version < 4) {
          state = { ...state, streak: 0, activityLog: {} };
        }

        return state;
      },

      // The legacy conversion lives in `merge`, not `migrate`, on purpose.
      // zustand only calls `migrate` when the stored payload carries a numeric
      // `version` (node_modules/zustand/middleware.js:395), and the previous
      // build set no `version` option — so JSON.stringify omitted the key and
      // `migrate` would never fire for exactly the data it was meant to rescue.
      // `merge` runs on every hydration regardless, so it always sees v0 data.
      merge: (persisted, current) => {
        const { chatMsgs, ...rest } = (persisted ?? {}) as Partial<PersistedState> & {
          chatMsgs?: ChatMsg[];
        };
        const merged = { ...current, ...rest };

        // v0 → v1: one flat `chatMsgs` array becomes a single Conversation, so
        // a student who already had a chat saved doesn't silently lose it.
        if (Array.isArray(chatMsgs) && chatMsgs.length && !merged.conversations.length) {
          const now = new Date().toISOString();
          const firstUserMsg = chatMsgs.find((m) => m.role === "user");
          const restored: Conversation = {
            id: newId(),
            title: makeConversationTitle(firstUserMsg?.text ?? ""),
            msgs: chatMsgs.slice(-MAX_CHAT_MSGS),
            createdAt: now,
            updatedAt: now,
          };
          merged.conversations = [restored];
          merged.activeConversationId = restored.id;
        }

        return merged;
      },
    }
  )
);

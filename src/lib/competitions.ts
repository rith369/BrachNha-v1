import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Json } from "@/types/database";
import type {
  Competition,
  CompetitionAttempt,
  ExamQuestion,
  GameDifficulty,
} from "@/types";

/**
 * The server side of the Game feature: publishing a competition, browsing other
 * students' competitions, and recording an attempt at one.
 *
 * DELIBERATELY NOT PART OF lib/supabase-sync.ts, and the difference matters:
 *
 *  - That layer pushes a DESTRUCTIVE SNAPSHOT of one student's own tables. A
 *    competition is not exclusively owned by the device that posted it — other
 *    students' attempts hang off it — and a snapshot push would delete every
 *    competition missing from local storage. Clearing a browser would wipe
 *    challenges other people were mid-way through.
 *  - That layer also swallows every error by design ("a failure never
 *    propagates to a caller"). This one READS OTHER PEOPLE'S ROWS and writes
 *    things a student is waiting on, so it must report failure. Every function
 *    here returns a discriminated result rather than throwing or logging.
 *
 * So competitions are written ONCE, at the moment they happen, and are never
 * re-pushed. `competitions`/`competitionAttempts` stay out of
 * syncRelevantChange for that reason — an earlier note in lib/store.ts said
 * stage B "must add both"; this is the better answer and that note has been
 * corrected.
 *
 * getSupabase() is awaited rather than imported statically — the SDK is ~40KB
 * and lives in its own chunk. A static `import { createClient }` anywhere
 * collapses it into the entry bundle silently.
 */

/** Why a call could not do what was asked. Reported rather than thrown or
 *  logged, because a student is waiting on the answer. */
export type FailReason =
  | "unconfigured"
  | "unauthenticated"
  | "duplicate"
  /** Today's limit on new Battles (20261103000006). Shares by itself tomorrow. */
  | "too_many"
  | "failed";

/** Every call reports success or a reason, never a bare throw. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; reason: FailReason };

/** Postgres unique-violation. A second attempt at the same competition is an
 *  expected outcome, not an error — the UI says "you already played this". */
const UNIQUE_VIOLATION = "23505";

function fail(reason: FailReason): Result<never> {
  return { ok: false, reason };
}

/**
 * A stored answer list, narrowed at the boundary.
 *
 * An EMPTY array is the honest reading of both "this row predates answer
 * recording" (the column's default) and "nothing was answered", and the review
 * screen tells those apart by comparing the length against the question count
 * rather than by asking this to distinguish them. Anything that is not a string
 * becomes null — a null already means "no answer given", so a malformed entry
 * degrades into the case the screen already draws.
 */
function toAnswers(value: unknown): (string | null)[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : null));
}

const MAX_QUESTIONS = 50;
const MAX_TEXT = 2000;

function isText(v: unknown): v is string {
  return typeof v === "string" && v.length <= MAX_TEXT && !v.includes("<svg");
}

/**
 * Checks the frozen question set a competition arrives with. Since
 * 20261103000005 the database only stores questions from a published pool, but
 * rows from before that were written by the CREATOR'S DEVICE with nothing checking
 * them, so a stored row is still untrusted input. A malformed question is dropped
 * rather than crashing the joiner's screen, and SVG is refused outright: the app's
 * own question pool never contains any, so a question carrying one was not made by
 * the app. (MathText sanitises SVG anyway — see utils/sanitize-svg.ts — this is the
 * second layer.)
 */
function toQuestions(value: unknown): ExamQuestion[] {
  if (!Array.isArray(value)) return [];
  const out: ExamQuestion[] = [];
  for (const raw of value.slice(0, MAX_QUESTIONS)) {
    if (typeof raw !== "object" || raw === null) continue;
    const q = raw as Record<string, unknown>;
    const text = q.q as Record<string, unknown> | null | undefined;
    const options = q.options;
    if (
      typeof text !== "object" ||
      text === null ||
      !isText(text.en) ||
      !isText(text.km) ||
      !Array.isArray(options) ||
      options.length < 2 ||
      options.length > 6 ||
      !options.every(isText) ||
      !isText(q.correct) ||
      !options.includes(q.correct) ||
      (q.explanation !== undefined && !isText(q.explanation))
    ) {
      continue;
    }
    out.push({
      q: { en: text.en, km: text.km },
      options: [...options],
      correct: q.correct,
      ...(typeof q.explanation === "string" ? { explanation: q.explanation } : {}),
    });
  }
  return out;
}

/** A competition as it arrives from the server, plus whether it is the reader's
 *  own — the browse list hides those, and the UI labels them either way. */
export interface RemoteCompetition extends Competition {
  mine: boolean;
}

function toCompetition(
  row: {
    id: string;
    creator_id: string;
    creator_name: string;
    subject: string;
    difficulty: string;
    minutes: number;
    questions: unknown;
    creator_answers?: unknown;
    creator_score: number;
    creator_ms: number;
    total: number;
    created_at: string;
  },
  viewerId: string
): RemoteCompetition {
  return {
    id: row.id,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    subject: row.subject,
    // The column is a free-text check constraint; narrowing happens here, at the
    // boundary, rather than being assumed across the whole app.
    difficulty: (["easy", "medium", "hard", "mix"] as const).includes(
      row.difficulty as GameDifficulty
    )
      ? (row.difficulty as GameDifficulty)
      : "mix",
    minutes: row.minutes,
    // jsonb comes back as `Json`, written by another student's device. It is
    // CHECKED here, not asserted — see toQuestions.
    questions: toQuestions(row.questions),
    creatorAnswers: toAnswers(row.creator_answers),
    creatorScore: row.creator_score,
    creatorMs: row.creator_ms,
    total: row.total,
    createdAt: row.created_at,
    mine: row.creator_id === viewerId,
  };
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

/**
 * Post a competition so other students can find it.
 *
 * Called right after the creator finishes their own run. The local copy is
 * written first and unconditionally (see game-create.tsx), so a failure here
 * loses the sharing, never the student's own record of it.
 *
 * THROUGH A FUNCTION, not an insert (20261103000005). It refuses a question that is
 * not from a published pool, and takes the name, score and time itself, so another
 * student can only ever read app content under a real name.
 */
export async function publishCompetition(
  competition: Competition
): Promise<Result<null>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!competition.creatorId) return fail("unauthenticated");

  const { error } = await db.rpc("post_competition", {
    p_id: competition.id,
    p_subject: competition.subject,
    p_difficulty: competition.difficulty,
    p_minutes: competition.minutes,
    p_questions: competition.questions as unknown as Json,
    // In the SAME write as the score, which is what lets the table stay
    // insert-only: there is no second write to permit later.
    p_answers: (competition.creatorAnswers ?? []) as unknown as Json,
    p_ms: competition.creatorMs,
  });

  if (error?.hint === "too_many") return fail("too_many");
  if (error) return fail(error.code === UNIQUE_VIOLATION ? "duplicate" : "failed");
  return { ok: true, data: null };
}

/**
 * Competitions other students have posted, newest first.
 *
 * `limit` is small on purpose: this is a browse list on a phone, not an archive,
 * and an unbounded select over a table every student writes to is the query that
 * gets slow first.
 */
export async function fetchOpenCompetitions(
  viewerId: string,
  limit = 20
): Promise<Result<RemoteCompetition[]>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!viewerId) return fail("unauthenticated");

  const { data, error } = await db
    .from("competitions")
    .select("*")
    // Your own competitions are listed separately, under "My Competitions" —
    // and racing yourself is not a feature.
    .neq("creator_id", viewerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return fail("failed");
  return { ok: true, data: (data ?? []).map((r) => toCompetition(r, viewerId)) };
}

/** One competition by id, for a student arriving straight at /game/play/:id. */
export async function fetchCompetition(
  id: string,
  viewerId: string
): Promise<Result<RemoteCompetition | null>> {
  const db = await client();
  if (!db) return fail("unconfigured");

  const { data, error } = await db
    .from("competitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail("failed");
  return { ok: true, data: data ? toCompetition(data, viewerId) : null };
}

/**
 * Record this student's run at someone else's competition.
 *
 * A duplicate is reported as its own reason rather than a failure: the unique
 * constraint is what stops a student re-rolling a bad run until they beat the
 * creator, so hitting it means "you already played this", which is a sentence
 * the UI can say.
 *
 * Through a function, like publishCompetition: the name, score and time are the
 * server's, and an answer must be an option of the question.
 */
export async function publishAttempt(
  attempt: CompetitionAttempt
): Promise<Result<null>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!attempt.userId) return fail("unauthenticated");

  const { error } = await db.rpc("post_competition_attempt", {
    p_competition: attempt.competitionId,
    // Same write as the score, for the same reason publishCompetition sends the
    // creator's answers with it: the table has no UPDATE policy and should not.
    p_answers: (attempt.answers ?? []) as unknown as Json,
    p_ms: attempt.ms,
  });

  if (error) return fail(error.code === UNIQUE_VIOLATION ? "duplicate" : "failed");
  return { ok: true, data: null };
}

/**
 * This student's own attempt at a competition, or null if they have not played
 * it.
 *
 * THE POINT IS CROSS-DEVICE FAIRNESS. The local store only knows what happened
 * on this phone, so without asking the server a student could play on a laptop,
 * then play again on a phone and be paid twice for it. The database already
 * refuses the second ROW (`unique (competition_id, user_id)`), which is what
 * makes the SCORE fair; this is what makes the app agree with it instead of
 * silently letting someone replay and paying local XP for it.
 */
export async function fetchMyAttempt(
  competitionId: string,
  userId: string
): Promise<Result<{ score: number; ms: number } | null>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return fail("unauthenticated");

  const { data, error } = await db
    .from("competition_attempts")
    .select("score, ms")
    .eq("competition_id", competitionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return fail("failed");
  return { ok: true, data: data ? { score: data.score, ms: data.ms } : null };
}

/**
 * Every competition this student has already attempted, as a set of ids.
 *
 * The browse list uses it to DROP those competitions rather than show them with
 * a result chip: the list is what you can play, and a played one is answered
 * already — its result lives in Recent Games. The local attempts cover this
 * device; this covers every other one, so a competition played on a laptop
 * stops appearing on the phone too.
 *
 * One small select rather than a join: PostgREST cannot express "not in
 * (subquery)" across tables without a view or an RPC, and the number of
 * competitions a student plays is small enough that filtering on the client is
 * both simpler and cheaper than adding either.
 */
export async function fetchMyAttemptIds(
  userId: string
): Promise<Result<string[]>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return fail("unauthenticated");

  const { data, error } = await db
    .from("competition_attempts")
    .select("competition_id")
    .eq("user_id", userId);

  if (error) return fail("failed");
  return { ok: true, data: (data ?? []).map((r) => r.competition_id) };
}

/** Mirrors MAX_COMPETITIONS in lib/store.ts: the newest this many of each are
 *  rebuilt, the same cap the store applies when it writes them. */
const HISTORY_LIMIT = 50;

/**
 * This student's whole game history, rebuilt from the server: the competitions
 * they CREATED and the attempts they MADE at other students' competitions.
 *
 * Used by the sign-in pull (lib/supabase-sync.ts). `logout()` clears both lists
 * from the device, and before this nothing brought them back, so signing out
 * and in again (or opening a new phone) showed an empty Recent Games and My
 * Competitions although every row was still on the server.
 *
 * An attempt locally carries BOTH halves of the comparison (the opponent's name,
 * score, time, answers and the frozen questions), so each attempt is joined to
 * its competition row here. A competition that has since been deleted takes its
 * attempts with it (on delete cascade), so a missing one cannot happen in
 * practice; it is skipped rather than rebuilt half-empty.
 *
 * Everything goes through the same narrowing as a browse-list row
 * (toCompetition / toQuestions / toAnswers): a competition is another student's
 * device writing, not app content, wherever it is read.
 */
export async function fetchMyGameHistory(
  userId: string
): Promise<Result<{ competitions: Competition[]; attempts: CompetitionAttempt[] }>> {
  const db = await client();
  if (!db) return fail("unconfigured");
  if (!userId) return fail("unauthenticated");

  const [created, played] = await Promise.all([
    db
      .from("competitions")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    db
      .from("competition_attempts")
      .select("id, competition_id, user_id, user_name, score, ms, played_at, answers")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);
  if (created.error || played.error) return fail("failed");

  const attemptRows = played.data ?? [];
  const ids = [...new Set(attemptRows.map((a) => a.competition_id))];
  const opponents = new Map<string, Competition>();
  if (ids.length > 0) {
    const { data, error } = await db.from("competitions").select("*").in("id", ids);
    if (error) return fail("failed");
    for (const row of data ?? []) {
      opponents.set(row.id, toCompetition(row, userId));
    }
  }

  // Oldest first, the order the store appends in (newest is last).
  const competitions: Competition[] = (created.data ?? [])
    .map((row) => {
      const { mine: _mine, ...c } = toCompetition(row, userId);
      // On the server, so it was shared: the hub must not label it "Not shared".
      return { ...c, sharedAt: row.created_at };
    })
    .reverse();

  const attempts: CompetitionAttempt[] = [];
  for (const a of [...attemptRows].reverse()) {
    const c = opponents.get(a.competition_id);
    if (!c) continue;
    attempts.push({
      id: a.id,
      competitionId: a.competition_id,
      userId: a.user_id,
      userName: a.user_name,
      score: a.score,
      ms: a.ms,
      opponentName: c.creatorName,
      opponentId: c.creatorId,
      opponentScore: c.creatorScore,
      opponentMs: c.creatorMs,
      subject: c.subject,
      total: c.total,
      playedAt: a.played_at,
      questions: c.questions,
      answers: toAnswers(a.answers),
      opponentAnswers: c.creatorAnswers,
    });
  }

  return { ok: true, data: { competitions, attempts } };
}

/** One joiner's run, as the creator sees it on their own competition. */
export interface JoinerAttempt {
  competitionId: string;
  /** The joiner's account id. Needed for two things the creator's review does:
   *  picking their avatar (utils/avatar-seed.ts) and building the path to the
   *  photo of their working, which is named after them. */
  userId: string;
  userName: string;
  score: number;
  ms: number;
  /** What they picked per question, for the creator's side of the comparison. */
  answers: (string | null)[];
  playedAt: string;
}

/**
 * Everyone who has taken the given competitions.
 *
 * Only ever called with the CREATOR's own competition ids — the read policy
 * would return nothing else anyway, which is the point of writing the rule in
 * the database rather than in the query.
 */
export async function fetchAttemptsFor(
  competitionIds: string[]
): Promise<Result<JoinerAttempt[]>> {
  if (competitionIds.length === 0) return { ok: true, data: [] };

  const db = await client();
  if (!db) return fail("unconfigured");

  const { data, error } = await db
    .from("competition_attempts")
    .select("competition_id, user_id, user_name, score, ms, answers, played_at")
    .in("competition_id", competitionIds)
    // Best first, then fastest — the same ordering outcomeOf() decides by.
    .order("score", { ascending: false })
    .order("ms", { ascending: true });

  if (error) return fail("failed");
  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      competitionId: r.competition_id,
      userId: r.user_id,
      userName: r.user_name,
      score: r.score,
      ms: r.ms,
      answers: toAnswers(r.answers),
      playedAt: r.played_at,
    })),
  };
}

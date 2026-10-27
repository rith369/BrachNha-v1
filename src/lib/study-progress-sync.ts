import { getSupabase } from "@/lib/supabase";
import {
  MAX_PAPER_RESULTS,
  MAX_QUIZ_RESULTS,
  MAX_REVIEW_HISTORY,
} from "@/lib/store";
import type { PaperResult, QuizResult, useBrachNhaStore } from "@/lib/store";
import {
  clearMarks,
  emptyMarks,
  readMarks,
  writeMarks,
  type SyncMarks,
} from "@/lib/sync-marks";
import type { PracticeCard } from "@/types";
import type { InsertOf } from "@/types/database";
import type { ReviewResult, ReviewState } from "@/utils/spaced-repetition";

/**
 * The study progress that used to stay on one phone: flashcard review state,
 * the student's own cards, starred cards, the review log, and quiz and
 * past-paper attempts (supabase/migrations/20261027000001).
 *
 * ── Why this is not part of pushLocalState's snapshot ─────────────────────
 *
 * The snapshot re-sends everything on every push, which is right for a profile
 * row and a few capped lists. A review log of a thousand entries is not that,
 * and a grade changes ONE card. So this pushes only what differs from
 * lib/sync-marks.ts — the record of what this device last uploaded — and moves
 * the marks forward only for requests the server accepted. A failed request
 * leaves its marks where they were and the next push tries again.
 *
 * ── Deletions are inferred, so the marks must never outlive the data ─────
 *
 * A card or a star that is in the marks but no longer on the device was
 * deleted here, and the push deletes it on the server too. That is only true
 * if the marks describe THIS device's data. So the pull clears them before it
 * reads anything (a failed pull must not leave old marks over an empty store,
 * or the next push would delete the account's copy), and sign-out clears them.
 *
 * ── Two devices on one account ────────────────────────────────────────────
 *
 * Both upsert into the same rows, so the server holds the union and the last
 * grade of a card wins. Only "use this device" on the account-conflict screen
 * replaces the account's copy outright (SyncMarks.replace).
 */

type StoreState = ReturnType<typeof useBrachNhaStore.getState>;

/** The store fields this file owns, as the pull hands them back. */
export interface StudyProgress {
  cardReviews: Record<string, ReviewState>;
  studentCards: Record<string, PracticeCard[]>;
  starredCards: string[];
  reviewHistory: ReviewResult[];
  quizResults: QuizResult[];
  paperResults: PaperResult[];
}

/** Rows per request. A first upload can be a thousand log entries; split so no
 *  single request is large on mobile data. */
const CHUNK = 500;
/** Ids per `in` filter, which travels in the URL. */
const ID_CHUNK = 100;

const PHASES = new Set(["new", "learning", "review", "relearning"]);
const GRADES = new Set(["again", "hard", "good", "easy"]);
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const INT_MAX = 2_147_483_647;

async function ok(
  label: string,
  run: () => PromiseLike<unknown>
): Promise<boolean> {
  try {
    const result = (await run()) as { error?: { message: string } | null };
    if (result?.error) {
      console.warn(`[sync] ${label}: ${result.error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[sync] ${label}:`, err);
    return false;
  }
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function allOk<T>(
  label: string,
  items: T[],
  size: number,
  run: (part: T[]) => PromiseLike<unknown>
): Promise<boolean> {
  for (const part of chunks(items, size)) {
    if (!(await ok(label, () => run(part)))) return false;
  }
  return true;
}

// ── checks ──────────────────────────────────────────────────────────────────
// A row the database would refuse fails its whole request, and with it every
// other card in the batch. So anything out of shape is left on the device
// rather than sent.

function count(n: unknown): n is number {
  return Number.isSafeInteger(n) && (n as number) >= 0 && (n as number) <= INT_MAX;
}

function instant(v: unknown): v is string {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

function validReview(cardId: string, r: ReviewState): boolean {
  return (
    cardId.length >= 1 &&
    cardId.length <= 200 &&
    PHASES.has(r.phase) &&
    count(r.intervalDays) &&
    DATE_KEY.test(r.dueAt) &&
    count(r.reviewCount) &&
    count(r.lapses) &&
    (r.lastGrade === null || GRADES.has(r.lastGrade)) &&
    (r.lastReviewedAt === null || instant(r.lastReviewedAt))
  );
}

function reviewSignature(r: ReviewState): string {
  return [
    r.phase,
    r.intervalDays,
    r.dueAt,
    r.reviewCount,
    r.lapses,
    r.lastGrade ?? "",
    r.lastReviewedAt ?? "",
  ].join("|");
}

function validCard(deckKey: string, c: PracticeCard): boolean {
  const len = (s: string, max: number) => s.length >= 1 && s.length <= max;
  return (
    len(c.id, 100) &&
    len(deckKey, 100) &&
    len(c.front, 4000) &&
    len(c.back, 4000) &&
    instant(c.createdAt) &&
    instant(c.updatedAt)
  );
}

function validAttempt(r: {
  date: string;
  score: number;
  total: number;
  pct: number;
  ms: number;
}): boolean {
  return (
    instant(r.date) &&
    count(r.score) &&
    count(r.total) &&
    r.total > 0 &&
    r.score <= r.total &&
    Number.isFinite(r.pct) &&
    r.pct >= 0 &&
    r.pct <= 100 &&
    Number.isFinite(r.ms) &&
    r.ms >= 0
  );
}

const pct2 = (n: number) => Math.round(n * 100) / 100;
const quizMark = (r: QuizResult) => `${r.quizKey}|${r.date}`;
const paperMark = (r: PaperResult) => `${r.paperKey}|${r.date}`;

// ── push ────────────────────────────────────────────────────────────────────

export async function pushStudyProgress(userId: string, s: StoreState) {
  const db = await getSupabase();
  if (!db) return;

  let marks = readMarks(userId);

  // "Use this device" on the conflict screen: the account's copy goes first.
  // All six must succeed before anything is uploaded, or this device's rows
  // would land on top of the other device's and the replace would be half done.
  if (marks.replace) {
    const wiped = [
      await ok("card_reviews: replace", () =>
        db.from("card_reviews").delete().eq("user_id", userId)
      ),
      await ok("student_cards: replace", () =>
        db.from("student_cards").delete().eq("user_id", userId)
      ),
      await ok("starred_cards: replace", () =>
        db.from("starred_cards").delete().eq("user_id", userId)
      ),
      await ok("card_review_log: replace", () =>
        db.from("card_review_log").delete().eq("user_id", userId)
      ),
      await ok("quiz_results: replace", () =>
        db.from("quiz_results").delete().eq("user_id", userId)
      ),
      await ok("paper_results: replace", () =>
        db.from("paper_results").delete().eq("user_id", userId)
      ),
    ];
    if (wiped.includes(false)) return;
    marks = emptyMarks(userId);
    writeMarks(marks);
  }

  await pushReviews(db, userId, s, marks);
  await pushCards(db, userId, s, marks);
  await pushStarred(db, userId, s, marks);
  await pushLog(db, userId, s, marks);
  await pushQuizzes(db, userId, s, marks);
  await pushPapers(db, userId, s, marks);

  writeMarks(marks);
}

type Db = NonNullable<Awaited<ReturnType<typeof getSupabase>>>;

async function pushReviews(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const rows: InsertOf<"card_reviews">[] = [];
  const sent: Record<string, string> = {};
  for (const [cardId, r] of Object.entries(s.cardReviews)) {
    if (!validReview(cardId, r)) continue;
    const sig = reviewSignature(r);
    if (marks.reviews[cardId] === sig) continue;
    sent[cardId] = sig;
    rows.push({
      user_id: userId,
      card_id: cardId,
      phase: r.phase,
      interval_days: r.intervalDays,
      due_at: r.dueAt,
      review_count: r.reviewCount,
      lapses: r.lapses,
      last_grade: r.lastGrade,
      last_reviewed_at: r.lastReviewedAt,
      updated_at: new Date().toISOString(),
    });
  }
  if (
    rows.length &&
    (await allOk("card_reviews", rows, CHUNK, (part) =>
      db.from("card_reviews").upsert(part, { onConflict: "user_id,card_id" })
    ))
  ) {
    marks.reviews = { ...marks.reviews, ...sent };
  }

  // A review gone from the device went with a deleted student card.
  const gone = Object.keys(marks.reviews).filter(
    (id) => !Object.hasOwn(s.cardReviews, id)
  );
  if (
    gone.length &&
    (await allOk("card_reviews: delete", gone, ID_CHUNK, (part) =>
      db.from("card_reviews").delete().eq("user_id", userId).in("card_id", part)
    ))
  ) {
    const next = { ...marks.reviews };
    for (const id of gone) delete next[id];
    marks.reviews = next;
  }
}

async function pushCards(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const rows: InsertOf<"student_cards">[] = [];
  const sent: Record<string, string> = {};
  const local = new Set<string>();
  for (const [deckKey, cards] of Object.entries(s.studentCards)) {
    for (const c of cards) {
      local.add(c.id);
      if (!validCard(deckKey, c)) continue;
      if (marks.cards[c.id] === c.updatedAt) continue;
      sent[c.id] = c.updatedAt;
      rows.push({
        user_id: userId,
        card_id: c.id,
        deck_key: deckKey,
        front: c.front,
        back: c.back,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      });
    }
  }
  if (
    rows.length &&
    (await allOk("student_cards", rows, CHUNK, (part) =>
      db.from("student_cards").upsert(part, { onConflict: "user_id,card_id" })
    ))
  ) {
    marks.cards = { ...marks.cards, ...sent };
  }

  const gone = Object.keys(marks.cards).filter((id) => !local.has(id));
  if (
    gone.length &&
    (await allOk("student_cards: delete", gone, ID_CHUNK, (part) =>
      db.from("student_cards").delete().eq("user_id", userId).in("card_id", part)
    ))
  ) {
    const next = { ...marks.cards };
    for (const id of gone) delete next[id];
    marks.cards = next;
  }
}

async function pushStarred(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const local = [...new Set(s.starredCards)].filter(
    (id) => id.length >= 1 && id.length <= 200
  );
  const sent = new Set(marks.starred);
  const added = local.filter((id) => !sent.has(id));
  const removed = marks.starred.filter((id) => !local.includes(id));

  if (
    added.length &&
    (await allOk(
      "starred_cards",
      added.map((card_id) => ({ user_id: userId, card_id })),
      CHUNK,
      (part) =>
        db.from("starred_cards").upsert(part, {
          onConflict: "user_id,card_id",
          ignoreDuplicates: true,
        })
    ))
  ) {
    for (const id of added) sent.add(id);
  }
  if (
    removed.length &&
    (await allOk("starred_cards: delete", removed, ID_CHUNK, (part) =>
      db.from("starred_cards").delete().eq("user_id", userId).in("card_id", part)
    ))
  ) {
    for (const id of removed) sent.delete(id);
  }
  marks.starred = [...sent];
}

/**
 * Everything after `logUntil`. The log only grows, and each entry's time comes
 * from this device's clock, so a clock set BACKWARDS between two grades would
 * leave the later one unsent. Accepted: it stays on the device, and nothing on
 * screen reads the log yet.
 */
async function pushLog(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const fresh = s.reviewHistory.filter(
    (e) =>
      e.reviewedAt > marks.logUntil &&
      GRADES.has(e.grade) &&
      instant(e.reviewedAt) &&
      e.cardId.length >= 1 &&
      e.cardId.length <= 200
  );
  if (!fresh.length) return;
  const rows: InsertOf<"card_review_log">[] = fresh.map((e) => ({
    user_id: userId,
    card_id: e.cardId,
    grade: e.grade,
    reviewed_at: e.reviewedAt,
  }));
  if (
    await allOk("card_review_log", rows, CHUNK, (part) =>
      db.from("card_review_log").upsert(part, {
        onConflict: "user_id,card_id,reviewed_at",
        ignoreDuplicates: true,
      })
    )
  ) {
    marks.logUntil = fresh.reduce(
      (max, e) => (e.reviewedAt > max ? e.reviewedAt : max),
      marks.logUntil
    );
  }
}

async function pushQuizzes(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const sent = new Set(marks.quizzes);
  const fresh = s.quizResults.filter(
    (r) =>
      !sent.has(quizMark(r)) &&
      validAttempt(r) &&
      r.quizKey.length >= 1 &&
      r.quizKey.length <= 100
  );
  if (fresh.length) {
    const rows: InsertOf<"quiz_results">[] = fresh.map((r) => ({
      user_id: userId,
      quiz_key: r.quizKey,
      version: r.version ?? null,
      taken_at: r.date,
      score: r.score,
      total: r.total,
      pct: pct2(r.pct),
      ms: Math.round(r.ms),
      question_ms: r.questionMs,
      answers: r.answers,
    }));
    if (
      await allOk("quiz_results", rows, CHUNK, (part) =>
        db.from("quiz_results").upsert(part, {
          onConflict: "user_id,quiz_key,taken_at",
          ignoreDuplicates: true,
        })
      )
    ) {
      for (const r of fresh) sent.add(quizMark(r));
    }
  }
  // Only what is still on the device, so the marks stay as short as the list.
  const local = new Set(s.quizResults.map(quizMark));
  marks.quizzes = [...sent].filter((k) => local.has(k));
}

async function pushPapers(db: Db, userId: string, s: StoreState, marks: SyncMarks) {
  const sent = new Set(marks.papers);
  const fresh = s.paperResults.filter(
    (r) =>
      !sent.has(paperMark(r)) &&
      validAttempt(r) &&
      r.paperKey.length >= 1 &&
      r.paperKey.length <= 100
  );
  if (fresh.length) {
    const rows: InsertOf<"paper_results">[] = fresh.map((r) => ({
      user_id: userId,
      paper_key: r.paperKey,
      version: r.version ?? null,
      taken_at: r.date,
      score: r.score,
      total: r.total,
      pct: pct2(r.pct),
      ms: Math.round(r.ms),
      answers: r.answers,
      leaves: count(r.leaves) ? r.leaves : null,
    }));
    if (
      await allOk("paper_results", rows, CHUNK, (part) =>
        db.from("paper_results").upsert(part, {
          onConflict: "user_id,paper_key,taken_at",
          ignoreDuplicates: true,
        })
      )
    ) {
      for (const r of fresh) sent.add(paperMark(r));
    }
  }
  const local = new Set(s.paperResults.map(paperMark));
  marks.papers = [...sent].filter((k) => local.has(k));
}

// ── pull ────────────────────────────────────────────────────────────────────

/** Postgres answers `…+00:00`; the device writes `…Z`. One spelling, so the
 *  log's string comparison and the attempt marks agree. */
const iso = (v: string) => new Date(v).toISOString();

function isStringOrNullArray(v: unknown): v is (string | null)[] {
  return Array.isArray(v) && v.every((x) => x === null || typeof x === "string");
}
function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number");
}
function isStringRecord(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    Object.values(v).every((x) => typeof x === "string")
  );
}

/**
 * Reads the account's study progress. A table that fails to answer (not yet
 * migrated, or a dropped connection) comes back empty — the same tolerance the
 * rest of the pull has — and since its marks are empty too, nothing on the
 * server is deleted because of it.
 *
 * Clears the marks FIRST; see the header.
 */
export async function pullStudyProgress(userId: string): Promise<StudyProgress> {
  clearMarks();
  const empty: StudyProgress = {
    cardReviews: {},
    studentCards: {},
    starredCards: [],
    reviewHistory: [],
    quizResults: [],
    paperResults: [],
  };
  const db = await getSupabase();
  if (!db) return empty;

  let results;
  try {
    results = await Promise.all([
    db.from("card_reviews").select("*").eq("user_id", userId),
    db
      .from("student_cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    db.from("starred_cards").select("card_id").eq("user_id", userId),
    db
      .from("card_review_log")
      .select("card_id, grade, reviewed_at")
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false })
      .limit(MAX_REVIEW_HISTORY),
    db
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false })
      .limit(MAX_QUIZ_RESULTS),
    db
      .from("paper_results")
      .select("*")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false })
      .limit(MAX_PAPER_RESULTS),
    ]);
  } catch (err) {
    console.warn("[sync] pull study progress:", err);
    return empty;
  }
  const [reviews, cards, starred, log, quizzes, papers] = results;

  for (const [label, res] of [
    ["card_reviews", reviews],
    ["student_cards", cards],
    ["starred_cards", starred],
    ["card_review_log", log],
    ["quiz_results", quizzes],
    ["paper_results", papers],
  ] as const) {
    if (res.error) console.warn(`[sync] pull ${label}: ${res.error.message}`);
  }

  const out = empty; // filled in place; the name says what it is from here on

  for (const r of reviews.data ?? []) {
    out.cardReviews[r.card_id] = {
      phase: r.phase,
      intervalDays: r.interval_days,
      dueAt: r.due_at,
      reviewCount: r.review_count,
      lapses: r.lapses,
      lastGrade: r.last_grade,
      lastReviewedAt: r.last_reviewed_at ? iso(r.last_reviewed_at) : null,
    };
  }

  for (const r of cards.data ?? []) {
    (out.studentCards[r.deck_key] ??= []).push({
      id: r.card_id,
      front: r.front,
      back: r.back,
      source: "student",
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at),
    });
  }

  out.starredCards = (starred.data ?? []).map((r) => r.card_id);

  out.reviewHistory = (log.data ?? [])
    .map((r) => ({ cardId: r.card_id, grade: r.grade, reviewedAt: iso(r.reviewed_at) }))
    .reverse();

  // Oldest first, like the store. A row whose jsonb is not the shape the
  // review screen indexes into is left out rather than allowed to crash it.
  out.quizResults = (quizzes.data ?? [])
    .filter((r) => isStringOrNullArray(r.answers) && isNumberArray(r.question_ms))
    .map((r) => ({
      quizKey: r.quiz_key,
      ...(r.version ? { version: r.version } : {}),
      date: iso(r.taken_at),
      score: r.score,
      total: r.total,
      pct: Number(r.pct),
      ms: Number(r.ms),
      questionMs: r.question_ms as number[],
      answers: r.answers as (string | null)[],
    }))
    .reverse();

  out.paperResults = (papers.data ?? [])
    .filter((r) => isStringRecord(r.answers))
    .map((r) => ({
      paperKey: r.paper_key,
      ...(r.version ? { version: r.version } : {}),
      date: iso(r.taken_at),
      score: r.score,
      total: r.total,
      pct: Number(r.pct),
      ms: Number(r.ms),
      answers: r.answers as Record<string, string>,
      ...(r.leaves === null ? {} : { leaves: r.leaves }),
    }))
    .reverse();

  return out;
}

/** Called once the pulled progress is in the store: everything it holds came
 *  from the server, so none of it needs uploading again. */
export function markStudyProgressPulled(userId: string, p: StudyProgress) {
  const reviews: Record<string, string> = {};
  for (const [id, r] of Object.entries(p.cardReviews)) reviews[id] = reviewSignature(r);
  const cards: Record<string, string> = {};
  for (const list of Object.values(p.studentCards)) {
    for (const c of list) cards[c.id] = c.updatedAt;
  }
  writeMarks({
    userId,
    replace: false,
    reviews,
    cards,
    starred: [...p.starredCards],
    logUntil: p.reviewHistory.reduce(
      (max, e) => (e.reviewedAt > max ? e.reviewedAt : max),
      ""
    ),
    quizzes: p.quizResults.map(quizMark),
    papers: p.paperResults.map(paperMark),
  });
}

/**
 * What this device has already uploaded of the study progress that is pushed
 * INCREMENTALLY (supabase/migrations/20261027000001_study_progress_sync.sql):
 * flashcard review state, the student's own cards, starred cards, the review
 * log, and quiz and past-paper attempts.
 *
 * The rest of the sync layer re-sends a full snapshot on every push, which is
 * fine for a profile row and a few capped lists. These fields are bigger and
 * change one item at a time — a grade moves one card — so lib/supabase-sync.ts
 * sends only what differs from these marks, and writes them back once the
 * server has accepted it.
 *
 * A DEVICE fact in its own key, like lib/intro-seen.ts, and keyed by the
 * account: marks written for one student read as empty for the next, so a
 * shared phone never skips uploading someone's work. Every access is wrapped.
 * Losing the marks costs one full re-upload (upserts, so nothing doubles),
 * never lost work.
 */

const STORAGE_KEY = "brachnha-sync-marks";

export interface SyncMarks {
  userId: string;
  /**
   * Set by "use this device" on the account-conflict screen: the next push
   * deletes the account's copy of these tables before uploading this device's,
   * which is what that screen promises ("the other side will be replaced").
   * Cleared once the deletes have succeeded.
   */
  replace: boolean;
  /** cardId → signature of the ReviewState last uploaded. */
  reviews: Record<string, string>;
  /** Student card id → its `updatedAt` when last uploaded. */
  cards: Record<string, string>;
  /** Card ids uploaded as starred. */
  starred: string[];
  /** The newest `reviewedAt` uploaded from the review log ("" for none). The
   *  log only grows, so everything after it is new. */
  logUntil: string;
  /** `${quizKey}|${date}` of every quiz attempt uploaded. */
  quizzes: string[];
  /** `${paperKey}|${date}` of every paper attempt uploaded. */
  papers: string[];
}

export function emptyMarks(userId: string): SyncMarks {
  return {
    userId,
    replace: false,
    reviews: {},
    cards: {},
    starred: [],
    logUntil: "",
    quizzes: [],
    papers: [],
  };
}

export function readMarks(userId: string): SyncMarks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMarks(userId);
    const m = JSON.parse(raw) as Partial<SyncMarks>;
    if (m?.userId !== userId) return emptyMarks(userId);
    return {
      userId,
      replace: m.replace === true,
      reviews: isRecord(m.reviews) ? m.reviews : {},
      cards: isRecord(m.cards) ? m.cards : {},
      starred: isStrings(m.starred) ? m.starred : [],
      logUntil: typeof m.logUntil === "string" ? m.logUntil : "",
      quizzes: isStrings(m.quizzes) ? m.quizzes : [],
      papers: isStrings(m.papers) ? m.papers : [],
    };
  } catch {
    return emptyMarks(userId);
  }
}

export function writeMarks(marks: SyncMarks): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marks));
  } catch {
    // Nothing to do: the next push simply sends everything again.
  }
}

/** "Use this device": replace the account's copy on the next push. */
export function markReplace(userId: string): void {
  writeMarks({ ...emptyMarks(userId), replace: true });
}

/** On sign-out, so the next account on this browser starts from nothing. */
export function clearMarks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keyed by account anyway, so stale marks are ignored for anyone else.
  }
}

function isRecord(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStrings(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

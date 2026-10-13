import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * The server side of Streak with Friends: search, requests, and the list of
 * friends with the days each one met the daily goal
 * (supabase/migrations/20261013000001_friends.sql).
 *
 * NOT PART OF lib/supabase-sync.ts, for the reasons lib/competitions.ts gives:
 * this reads OTHER students' rows and writes things a student is waiting on,
 * so every call reports a reason rather than swallowing the error. The table
 * itself is read-own and has no write policy: every write goes through a
 * function that checks the caps and refuses with a `hint`.
 *
 * getSupabase() is awaited, never imported statically: the SDK is its own
 * chunk.
 */

/** Why a call could not do what was asked. Every hint the functions raise has
 *  a member here, so the screen can say something specific. */
export type FriendFail =
  | "unconfigured"
  | "unauthenticated"
  | "self"
  | "unknown"
  | "exists"
  | "limit"
  | "their_limit"
  | "too_many"
  | "missing"
  | "failed";

export type FriendResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: FriendFail };

/** One row of `my_friends`: a friend, or a request either way. */
export interface FriendRow {
  /** The friendship's id: what accept, decline, cancel and remove take. */
  id: string;
  /** The other student's account id. */
  otherId: string;
  /** Their display name, as stored; "" when they have none any more. */
  name: string;
  status: "pending" | "accepted";
  /** True when the caller sent it. */
  outgoing: boolean;
  /** Local `YYYY-MM-DD`: the first day the pair's streak can count. Null for a
   *  pending request. */
  since: string | null;
  /** The days THEY met the goal since `since`, oldest first. */
  goalDays: string[];
}

export type SearchRelation = "none" | "sent" | "received" | "friends";

export interface SearchHit {
  id: string;
  name: string;
  relation: SearchRelation;
}

const HINTS: readonly FriendFail[] = [
  "self",
  "unknown",
  "exists",
  "limit",
  "their_limit",
  "too_many",
  "missing",
];

interface DbError {
  message?: string;
  code?: string;
  hint?: string;
}

function reasonOf(error: DbError): FriendFail {
  if (import.meta.env.DEV) console.warn("[friends]", error.message ?? error);
  const hint = HINTS.find((h) => h === error.hint);
  if (hint) return hint;
  // Not signed in, or an anonymous account: both raise 42501.
  if (error.code === "42501") return "unauthenticated";
  return "failed";
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const RELATIONS: readonly SearchRelation[] = ["none", "sent", "received", "friends"];

/** Every friendship the caller is in. `today` is the device's local day key. */
export async function fetchFriends(today: string): Promise<FriendResult<FriendRow[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("my_friends", { p_today: today });
  if (error) return { ok: false, reason: reasonOf(error) };

  // Checked field by field rather than trusted: a malformed row is dropped,
  // never rendered half-built.
  const rows: FriendRow[] = [];
  for (const r of data ?? []) {
    if (typeof r.id !== "string" || typeof r.other_id !== "string") continue;
    if (r.status !== "pending" && r.status !== "accepted") continue;
    const since = typeof r.since === "string" && DAY.test(r.since) ? r.since : null;
    if (r.status === "accepted" && since === null) continue;
    rows.push({
      id: r.id,
      otherId: r.other_id,
      name: typeof r.display_name === "string" ? r.display_name : "",
      status: r.status,
      outgoing: r.outgoing === true,
      since,
      goalDays: Array.isArray(r.goal_days)
        ? r.goal_days.filter((d): d is string => typeof d === "string" && DAY.test(d))
        : [],
    });
  }
  return { ok: true, data: rows };
}

/** Up to 10 students whose name contains `query` (2+ letters, or none). */
export async function searchStudents(query: string): Promise<FriendResult<SearchHit[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("search_students", { p_query: query });
  if (error) return { ok: false, reason: reasonOf(error) };
  return {
    ok: true,
    data: (data ?? [])
      .filter((r) => typeof r.id === "string" && RELATIONS.includes(r.relation))
      .map((r) => ({ id: r.id, name: r.display_name, relation: r.relation })),
  };
}

/** "sent", or "accepted" when they had already asked you. */
export async function sendFriendRequest(
  userId: string
): Promise<FriendResult<"sent" | "accepted">> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("send_friend_request", { p_user: userId });
  if (error) return { ok: false, reason: reasonOf(error) };
  return { ok: true, data: data === "accepted" ? "accepted" : "sent" };
}

/** Accept or decline a request sent to you. */
export async function respondFriendRequest(
  id: string,
  accept: boolean
): Promise<FriendResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("respond_friend_request", { p_id: id, p_accept: accept });
  if (error) return { ok: false, reason: reasonOf(error) };
  return { ok: true, data: null };
}

/** Remove a friend, or cancel a request you sent. */
export async function removeFriendship(id: string): Promise<FriendResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("remove_friendship", { p_id: id });
  if (error) return { ok: false, reason: reasonOf(error) };
  return { ok: true, data: null };
}

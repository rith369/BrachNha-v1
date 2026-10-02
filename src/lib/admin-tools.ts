import { getSupabase, isSupabaseConfigured } from "./supabase";
import { clearPhotoFolders } from "./account-deletion";
import type { AnnouncementTone } from "@/types/database";

/**
 * The admin area's calls (/admin and /admin/students), over
 * supabase/migrations/20261002000001_roles_and_admin_tools.sql.
 *
 * NOTHING HERE IS THE SECURITY. Every function it calls checks is_app_admin()
 * in the database and raises for anyone else, so a student who opens an admin
 * page gets nothing back. This file only shapes the answers for the screen,
 * the same split lib/admin-reports.ts makes for the photo reports.
 */

/** Why an admin action did not happen. The last four are the database's own
 *  refusals, read from the `hint` each function raises with. */
export type AdminFail =
  | "unconfigured"
  | "denied"
  | "failed"
  | "photos"
  | "owner_only"
  | "owner"
  | "self"
  | "admin"
  | "range"
  | "body"
  | "link"
  | "ends";

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: AdminFail };

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastSeen: string | null;
  xp: number;
  level: number;
  streak: number;
  activeDays30: number;
  kruaiToday: number;
  kruai7d: number;
  isAdmin: boolean;
  /** Set in the SQL editor only; an owner is an admin everywhere. */
  isOwner: boolean;
  /** KruAI is paused for this student (20261002000004). False before that
   *  migration, when the column does not exist. */
  kruaiBlocked: boolean;
}

export interface DashboardDay {
  day: string;
  active: number;
  new: number;
}

export interface DashboardEvent {
  name: string;
  count: number;
  students: number;
}

export interface DashboardCohort {
  starts: string;
  ends: string;
  joined: number;
  returned: number;
  /** False when the cohort's second week began before tracking did, so its
   *  return share would be a 0 that means "nothing was counting". */
  measurable: boolean;
}

export interface DashboardCrash {
  message: string;
  count: number;
  students: number;
  lastSeen: string;
  route: string | null;
  version: string | null;
}

export interface AdminDashboard {
  today: string;
  /** The first day any usage event was recorded, or null if none ever was. */
  trackedSince: string | null;
  totals: {
    students: number;
    activeToday: number;
    active7d: number;
    active30d: number;
    new7d: number;
    kruaiToday: number;
    crashes7d: number;
  };
  daily: DashboardDay[];
  events: DashboardEvent[];
  retention: DashboardCohort[];
  crashes: DashboardCrash[];
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

interface DbError {
  message?: string;
  code?: string;
  hint?: string;
}

function devReport(op: string, error: DbError | null): void {
  if (import.meta.env.DEV && error) {
    console.warn(`[admin-tools] ${op} failed:`, error.message ?? error);
  }
}

/** A database refusal, mapped to something the screen can say. The hint is
 *  read FIRST: "owner_only" also carries 42501, and must not read as "you are
 *  no longer an admin". */
function reasonOf(error: DbError): AdminFail {
  const h = error.hint;
  if (
    h === "owner_only" ||
    h === "owner" ||
    h === "self" ||
    h === "admin" ||
    h === "range" ||
    h === "body" ||
    h === "link" ||
    h === "ends"
  ) {
    return h;
  }
  if (error.code === "42501") return "denied";
  return "failed";
}

// ── Students ────────────────────────────────────────────────────────────────

/** At most 50 real students, most recently active first; `search` matches a
 *  name or an email. */
export async function listStudents(search: string): Promise<AdminResult<AdminStudent[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_students", {
    p_search: search.trim(),
    p_limit: 50,
  });
  if (error) {
    devReport("admin_students", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      name: r.display_name,
      email: r.email,
      joinedAt: r.joined_at,
      lastSeen: r.last_seen,
      xp: r.xp,
      level: r.level,
      streak: r.streak,
      activeDays30: r.active_days_30,
      kruaiToday: r.kruai_today,
      kruai7d: r.kruai_7d,
      isAdmin: r.is_admin,
      isOwner: r.is_owner,
      kruaiBlocked: r.kruai_blocked === true,
    })),
  };
}

/** Make someone an admin, or remove the role. OWNER ONLY: the database refuses
 *  any other admin ("owner_only"), and never touches the owner role itself. */
export async function setAdmin(userId: string, grant: boolean): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_set_role", {
    p_user: userId,
    p_role: "admin",
    p_grant: grant,
  });
  if (error) {
    devReport("admin_set_role", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

/**
 * Delete one student's account, the admin twin of lib/account-deletion.ts, and
 * in the same order for the same reason:
 *
 *  1. ask the database which competitions they are in, while those rows still
 *     exist (they are the only record of where the photos are);
 *  2. clear the photos. For a competition the student CREATED, the whole folder
 *     goes: the competition and every joiner's attempt are deleted with its
 *     creator, so the joiners' photos would otherwise be left behind. If any
 *     folder fails, STOP, with nothing deleted ("photos");
 *  3. admin_delete_user(), which refuses the caller's own account ("self"),
 *     the owner's ("owner") and an admin's ("admin"). Every table cascades
 *     from the auth user.
 *
 * Steps 1 and 3 repeat the admin check in the database, so a refusal at step 1
 * means nothing was touched.
 */
export async function deleteStudent(userId: string): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };

  const listed = await db.rpc("admin_user_competition_ids", { p_user: userId });
  if (listed.error) {
    devReport("admin_user_competition_ids", listed.error);
    return { ok: false, reason: reasonOf(listed.error) };
  }
  const folders = (listed.data ?? []).map((r) => ({
    competitionId: r.competition_id,
    created: r.created,
  }));
  const cleared = await clearPhotoFolders(userId, folders);
  if (!cleared.ok) return { ok: false, reason: "photos" };

  const { error } = await db.rpc("admin_delete_user", { p_user: userId });
  if (error) {
    devReport("admin_delete_user", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

// ── KruAI (/admin/kruai) ────────────────────────────────────────────────────

export interface KruaiDay {
  day: string;
  units: number;
  students: number;
}

export interface KruaiStudent {
  id: string;
  name: string;
  email: string;
  units: number;
  blocked: boolean;
}

export interface KruaiBlocked {
  id: string;
  name: string;
  email: string;
  reason: string;
  blockedAt: string;
  blockedByName: string;
}

/** admin_kruai_overview() (20261002000004). Units, not dollars: what a unit
 *  costs is only in the server's log lines. */
export interface KruaiOverview {
  today: string;
  userDaily: number;
  appDaily: number;
  todayUnits: number;
  todayStudents: number;
  daily: KruaiDay[];
  top: KruaiStudent[];
  blocked: KruaiBlocked[];
}

/** The bounds admin_set_kruai_limits() enforces, mirrored for the form so a
 *  typo is caught before the round trip. The database is still the one that
 *  refuses. */
export const KRUAI_LIMIT_BOUNDS = {
  user: { min: 1, max: 200 },
  app: { min: 1, max: 10000 },
} as const;

export async function loadKruai(): Promise<AdminResult<KruaiOverview>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_kruai_overview");
  if (error) {
    devReport("admin_kruai_overview", error);
    return { ok: false, reason: reasonOf(error) };
  }
  const overview = toKruaiOverview(data);
  return overview ? { ok: true, data: overview } : { ok: false, reason: "failed" };
}

/** OWNER ONLY: the database refuses any other admin ("owner_only"), and a
 *  value outside KRUAI_LIMIT_BOUNDS ("range"). */
export async function setKruaiLimits(
  userDaily: number,
  appDaily: number
): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_set_kruai_limits", {
    p_user_daily: userDaily,
    p_app_daily: appDaily,
  });
  if (error) {
    devReport("admin_set_kruai_limits", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

/** Pause or resume KruAI for one student. Pausing yourself ("self"), the owner
 *  ("owner") or an admin ("admin") is refused; resuming never is. */
export async function setKruaiBlock(
  userId: string,
  blocked: boolean,
  reason = ""
): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_set_kruai_block", {
    p_user: userId,
    p_blocked: blocked,
    p_reason: reason.trim().slice(0, 200),
  });
  if (error) {
    devReport("admin_set_kruai_block", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

// ── Announcements (/admin/announcements) ────────────────────────────────────

export interface AdminAnnouncement {
  id: number;
  bodyKm: string;
  bodyEn: string | null;
  tone: AnnouncementTone;
  link: string | null;
  startsAt: string;
  endsAt: string | null;
  active: boolean;
  /** Showing to students right now: active and inside its time window. */
  live: boolean;
  createdAt: string;
  createdByName: string;
}

export async function listAnnouncements(): Promise<AdminResult<AdminAnnouncement[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_announcements");
  if (error) {
    devReport("admin_announcements", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return {
    ok: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      bodyKm: a.body_km,
      bodyEn: a.body_en,
      tone: a.tone,
      link: a.link,
      startsAt: a.starts_at,
      endsAt: a.ends_at,
      active: a.active,
      live: a.live,
      createdAt: a.created_at,
      createdByName: a.created_by_name,
    })),
  };
}

/** Live from now. The database refuses empty or long Khmer text ("body"), a
 *  link that is not an app path ("link") and an end in the past ("ends"). */
export async function publishAnnouncement(input: {
  bodyKm: string;
  bodyEn: string;
  tone: AnnouncementTone;
  link: string;
  endsAt: string | null;
}): Promise<AdminResult<number>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_publish_announcement", {
    p_body_km: input.bodyKm.trim(),
    p_body_en: input.bodyEn.trim() || null,
    p_tone: input.tone,
    p_link: input.link.trim() || null,
    p_ends_at: input.endsAt,
  });
  if (error) {
    devReport("admin_publish_announcement", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: Number(data) };
}

export async function endAnnouncement(id: number): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_end_announcement", { p_id: id });
  if (error) {
    devReport("admin_end_announcement", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

// ── Mistake reports (/admin/mistakes) ───────────────────────────────────────

export interface MistakeGroup {
  /** Names the question; see utils/content-ref.ts. */
  ref: string;
  reports: number;
  kinds: string[];
  /** Up to the 5 newest notes that say something. */
  notes: string[];
  firstReported: string;
  lastReported: string;
}

export async function listMistakes(): Promise<AdminResult<MistakeGroup[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_content_reports");
  if (error) {
    devReport("admin_content_reports", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return {
    ok: true,
    data: (data ?? []).map((m) => ({
      ref: m.content_ref,
      reports: m.reports,
      kinds: m.kinds ?? [],
      notes: m.notes ?? [],
      firstReported: m.first_reported,
      lastReported: m.last_reported,
    })),
  };
}

/** Close every open report on one question. */
export async function resolveMistake(
  ref: string,
  resolution: "fixed" | "not_mistake"
): Promise<AdminResult<null>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { error } = await db.rpc("admin_resolve_content", {
    p_ref: ref,
    p_resolution: resolution,
  });
  if (error) {
    devReport("admin_resolve_content", error);
    return { ok: false, reason: reasonOf(error) };
  }
  return { ok: true, data: null };
}

// ── Dashboard ───────────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** jsonb counts arrive as numbers; anything else reads as 0 rather than NaN. */
function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

function list(v: unknown): Obj[] {
  return Array.isArray(v) ? v.filter(isObj) : [];
}

/** Checks the one jsonb document admin_dashboard() returns, field by field, so
 *  a migration that changes its shape shows zeros instead of crashing a page. */
function toDashboard(raw: unknown): AdminDashboard | null {
  if (!isObj(raw)) return null;
  const t = isObj(raw.totals) ? raw.totals : {};
  return {
    today: str(raw.today),
    trackedSince: strOrNull(raw.tracked_since),
    totals: {
      students: num(t.students),
      activeToday: num(t.active_today),
      active7d: num(t.active_7d),
      active30d: num(t.active_30d),
      new7d: num(t.new_7d),
      kruaiToday: num(t.kruai_today),
      crashes7d: num(t.crashes_7d),
    },
    daily: list(raw.daily).map((d) => ({
      day: str(d.day),
      active: num(d.active),
      new: num(d.new),
    })),
    events: list(raw.events).map((e) => ({
      name: str(e.name),
      count: num(e.count),
      students: num(e.students),
    })),
    retention: list(raw.retention).map((c) => ({
      starts: str(c.starts),
      ends: str(c.ends),
      joined: num(c.joined),
      returned: num(c.returned),
      measurable: c.measurable === true,
    })),
    crashes: list(raw.crashes).map((c) => ({
      message: str(c.message),
      count: num(c.count),
      students: num(c.students),
      lastSeen: str(c.last_seen),
      route: strOrNull(c.route),
      version: strOrNull(c.version),
    })),
  };
}

/** Checks admin_kruai_overview()'s jsonb field by field, like toDashboard. */
function toKruaiOverview(raw: unknown): KruaiOverview | null {
  if (!isObj(raw)) return null;
  return {
    today: str(raw.today),
    userDaily: num(raw.user_daily),
    appDaily: num(raw.app_daily),
    todayUnits: num(raw.today_units),
    todayStudents: num(raw.today_students),
    daily: list(raw.daily).map((d) => ({
      day: str(d.day),
      units: num(d.units),
      students: num(d.students),
    })),
    top: list(raw.top).map((t) => ({
      id: str(t.id),
      name: str(t.name),
      email: str(t.email),
      units: num(t.units),
      blocked: t.blocked === true,
    })),
    blocked: list(raw.blocked).map((b) => ({
      id: str(b.id),
      name: str(b.name),
      email: str(b.email),
      reason: str(b.reason),
      blockedAt: str(b.blocked_at),
      blockedByName: str(b.blocked_by_name),
    })),
  };
}

export async function loadDashboard(): Promise<AdminResult<AdminDashboard>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_dashboard");
  if (error) {
    devReport("admin_dashboard", error);
    return { ok: false, reason: reasonOf(error) };
  }
  const dashboard = toDashboard(data);
  return dashboard ? { ok: true, data: dashboard } : { ok: false, reason: "failed" };
}

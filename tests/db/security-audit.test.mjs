import assert from "node:assert/strict";
import { before, test } from "node:test";
import { freshDb, outcome } from "./setup.mjs";

/**
 * Rules that must hold for the WHOLE database, read from the catalog rather than
 * listed by hand, so a table or function added next month is covered without anyone
 * remembering to add a test. Each of these lists is a decision: adding to one should
 * mean having a reason.
 */

// Guests have no account, so these are the only functions they may call.
const GUEST_CALLABLE = new Set(["content_current", "log_client_error"]);

// security definer functions run past the row rules, so each one a student can call is
// a door that has to check for itself. admin_ functions have their own test below.
const STUDENT_DOORS = new Set([
  "delete_my_account",
  "friend_invite",
  "has_role",
  "is_app_admin",
  "kruai_take",
  "leaderboard",
  "log_client_error",
  "log_event",
  "my_competition_work_count",
  "my_friends",
  "post_competition",
  "post_competition_attempt",
  "remove_friendship",
  "report_content",
  "respond_friend_request",
  "search_students",
  "send_friend_request",
]);

// Tables with a user_id that keep_newest_rows does not need to hold, and why.
const NO_ROW_LIMIT = new Map([
  ["daily_activity", "one row a day, inside the window of 20261103000007"],
  ["competition_attempts", "one per Battle, through a function"],
  ["client_errors", "held by log_client_error"],
  ["kruai_usage", "written only by kruai_take, one row a day"],
  ["kruai_blocks", "written only by admins"],
  ["user_roles", "written only by admins"],
]);

// admin_ functions that change something but have no audit line of their own.
const ADMIN_WRITES_NOT_AUDITED = new Map([
  ["admin_save_content_draft", "a draft students cannot see; publishing it is what is logged"],
]);

let h;
before(async () => {
  h = await freshDb();
});

test("every table in public has row level security on", async () => {
  const off = await h.rows(`
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    order by 1`);
  assert.deepEqual(off.map((r) => r.relname), []);
});

test("every security definer function fixes its search_path", async () => {
  const loose = await h.rows(`
    select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
    order by 1`);
  assert.deepEqual(loose.map((r) => r.proname), []);
});

test("guests can call only the functions meant for them", async () => {
  const callable = await h.rows(`
    select distinct p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and has_function_privilege('anon', p.oid, 'execute')
      and p.prorettype <> 'trigger'::regtype
    order by 1`);
  const extra = callable.map((r) => r.proname).filter((name) => !GUEST_CALLABLE.has(name));
  assert.deepEqual(extra, []);
});

test("students can call only the security definer functions on the list", async () => {
  const doors = await h.rows(`
    select distinct p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and has_function_privilege('authenticated', p.oid, 'execute')
      and p.prorettype <> 'trigger'::regtype and p.proname not like 'admin\\_%'
    order by 1`);
  assert.ok(doors.length > 5, `only found ${doors.length}`);
  assert.deepEqual(doors.map((r) => r.proname).filter((name) => !STUDENT_DOORS.has(name)), []);
});

test("no client can call a trigger function's security definer body directly", async () => {
  const open = await h.rows(`
    select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef and p.prorettype = 'trigger'::regtype
      and (has_function_privilege('anon', p.oid, 'execute')
        or has_function_privilege('authenticated', p.oid, 'execute'))
    order by 1`);
  assert.deepEqual(open.map((r) => r.proname), []);
});

test("every admin_ function refuses a student who is not an admin", async () => {
  const student = await h.student("Sok");
  const fns = await h.rows(`
    select p.proname, p.pronargs from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin\\_%' and p.proname <> 'admin_audit'
    order by 1`);
  assert.ok(fns.length > 15, `only found ${fns.length} admin functions`);

  const leaked = [];
  for (const { proname, pronargs } of fns) {
    const args = Array(pronargs).fill("null").join(", ");
    const result = await outcome(() => h.asStudent(student, () => h.db.query(`select public.${proname}(${args})`)));
    // 42501 is "not allowed". owner_only is the same refusal for an owner's action.
    if (result !== "42501" && result !== "owner_only" && result !== "not_admin") leaked.push(`${proname}: ${result}`);
  }
  assert.deepEqual(leaked, []);
});

test("admin_audit cannot be called by a client, so the log cannot be forged", async () => {
  const fns = await h.rows(`
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'admin_audit'`);
  assert.equal(fns.length, 1);
  const open = await h.one(
    `select has_function_privilege('authenticated', $1::oid, 'execute') s, has_function_privilege('anon', $1::oid, 'execute') g`,
    [fns[0].oid]
  );
  assert.deepEqual(open, { s: false, g: false });
});

test("every admin_ function that changes something still writes the audit log", async () => {
  const fns = await h.rows(`
    select p.proname, pg_get_functiondef(p.oid) def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin\\_%'
      and p.proname <> 'admin_audit' and p.provolatile = 'v'
    order by 1`);
  const silent = fns
    .filter((f) => !f.def.includes("admin_audit") && !ADMIN_WRITES_NOT_AUDITED.has(f.proname))
    // A function that only reads, left volatile by default, has nothing to log.
    .filter((f) => /\b(insert|update|delete)\s/i.test(f.def.replace(/--.*$/gm, "")))
    .map((f) => f.proname);
  assert.deepEqual(silent, []);
});

test("no policy on a table queries that same table", async () => {
  const self = await h.rows(`
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') ~* ('from\\s+(public\\.)?' || tablename || '\\M')
        or coalesce(with_check, '') ~* ('from\\s+(public\\.)?' || tablename || '\\M'))`);
  assert.deepEqual(self, []);
});

test("profiles, which hold email, age and location, are open to no one else", async () => {
  const policies = await h.rows(`
    select policyname, cmd, qual from pg_policies where schemaname = 'public' and tablename = 'profiles'`);
  for (const p of policies.filter((x) => x.cmd === "SELECT")) {
    assert.match(p.qual, /auth\.uid\(\)/, `${p.policyname} is not limited to the owner`);
  }
});

test("a table a student can write to has a limit on how many rows they keep", async () => {
  const tables = await h.rows(`
    select c.table_name from information_schema.columns c
    join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public' and c.column_name = 'user_id' and t.table_type = 'BASE TABLE'
    order by 1`);
  const held = new Set(
    (await h.rows(`select tgname from pg_trigger where tgname like '%\\_keep\\_newest'`)).map((r) =>
      r.tgname.replace(/_keep_newest$/, "")
    )
  );
  const loose = tables
    .map((t) => t.table_name)
    .filter((name) => !held.has(name) && !NO_ROW_LIMIT.has(name));
  assert.deepEqual(loose, []);
});

test("no client can write straight into Battles, content or the audit log", async () => {
  const student = await h.student("Sok");
  const tables = ["competitions", "competition_attempts", "content_items", "content_versions", "content_drafts", "audit_log", "user_roles"];
  for (const table of tables) {
    const policies = await h.rows(
      `select policyname from pg_policies where schemaname = 'public' and tablename = $1 and cmd in ('INSERT', 'ALL') and 'authenticated' = any(roles)`,
      [table]
    );
    assert.deepEqual(policies, [], `${table} has a write policy for students`);
  }
  assert.notEqual(
    await outcome(() => h.asStudent(student, () => h.db.exec(`insert into public.user_roles (user_id, role) values ('${student}', 'owner')`))),
    "accepted",
    "a student made themselves an owner"
  );
});

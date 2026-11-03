import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

/**
 * A real Postgres engine with the REAL database in it: every file in
 * supabase/migrations, in order, the way the live project was built. No network,
 * no account, and nothing here can reach the live project.
 *
 * What is not the real thing is what Supabase itself provides, stubbed below:
 * `auth.users`, `auth.uid()` and Storage's table and helpers. Its default privileges
 * are copied, because they are what makes a forgotten `revoke` a real hole.
 *
 * PGlite has ONE connection, so nothing here can test two requests at the same moment.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const migrations = join(root, "supabase", "migrations");

const SUPABASE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    is_anonymous boolean default false,
    created_at timestamptz default now(),
    raw_user_meta_data jsonb default '{}'
  );
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  grant usage on schema storage to anon, authenticated;
  create table storage.buckets (
    id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable
    as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  create function storage.filename(name text) returns text language sql immutable
    as $$ select (string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)] $$;
  grant execute on all functions in schema storage to anon, authenticated;
`;

let snapshot = null;

async function buildSnapshot() {
  const db = new PGlite();
  await db.exec(SUPABASE);
  for (const file of readdirSync(migrations).filter((f) => f.endsWith(".sql")).sort()) {
    try {
      await db.exec(readFileSync(join(migrations, file), "utf8"));
    } catch (err) {
      throw new Error(`${file} does not apply: ${err.message}`);
    }
  }
  const dump = await db.dumpDataDir("none");
  await db.close();
  return dump;
}

/** A database of its own, in about a third of a second once the first is built. */
export async function freshDb() {
  snapshot ??= await buildSnapshot();
  const db = new PGlite({ loadDataDir: snapshot });
  await db.waitReady;

  /** Runs `fn` as a client would reach the database: a role, and maybe a session. */
  async function as(role, uid, fn) {
    await db.exec(`set role ${role}; select set_config('test.uid', '${uid ?? ""}', false);`);
    try {
      return await fn();
    } finally {
      await db.exec(`reset role;`);
    }
  }

  /** A real account, signed in with Google, with a profile from the real trigger. */
  async function student(name = "Sok", { daysOld = 0, anonymous = false } = {}) {
    const id = crypto.randomUUID();
    await db.query(
      `insert into auth.users (id, email, is_anonymous, created_at)
       values ($1, $2, $3, now() - ($4 || ' days')::interval)`,
      [id, `${id}@test`, anonymous, String(daysOld)]
    );
    await db.query(`update public.profiles set display_name = $2 where id = $1`, [id, name]);
    return id;
  }

  return {
    db,
    as,
    student,
    /** As a signed-in student. */
    asStudent: (uid, fn) => as("authenticated", uid, fn),
    /** As a guest with no account. */
    asGuest: (fn) => as("anon", null, fn),
    rows: async (sql, args) => (await db.query(sql, args)).rows,
    one: async (sql, args) => (await db.query(sql, args)).rows[0],
    count: async (table, where = "true", args) =>
      (await db.query(`select count(*)::int n from ${table} where ${where}`, args)).rows[0].n,
  };
}

/** What a call was refused with, or "accepted". The hint is what the app reads. */
export async function outcome(fn) {
  try {
    await fn();
    return "accepted";
  } catch (err) {
    return err.hint || err.code || err.message;
  }
}

export const repoRoot = root;

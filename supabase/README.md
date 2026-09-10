# Supabase

The database behind BrachNha. Everything a student does is still written to
`localStorage` first — Supabase is a second copy that trails behind it. See
`src/lib/supabase-sync.ts` for why that direction, not the other one.

## What is in here

```
supabase/migrations/
  20260828000001_init_schema.sql   tables, indexes, triggers
  20260828000002_rls_policies.sql  row level security
  20260904000001_hardening.sql     revoke RPC on handle_new_user, one FK index
```

The SQL is the source of truth for the schema, checked into git like any other
code. Do not create or alter tables from the dashboard's Table Editor: the
change works, and then nothing in the repo records that it happened, no diff
shows it, and a fresh project cannot be rebuilt from the code. Write a new
migration file instead — the filename is a timestamp, so they apply in order.

## Applying them

**Run every file once against YOUR OWN project, in filename order.** Each
developer has their own Supabase project rather than sharing one, so this is
done per project, not once for the repo. Two ways:

### A. Dashboard (no install)

1. Supabase dashboard → **SQL Editor** → New query
2. Paste the whole of `20260828000001_init_schema.sql`, run it
3. Paste the whole of `20260828000002_rls_policies.sql`, run it
4. Paste the whole of `20260904000001_hardening.sql`, run it

Order matters: the second file adds policies to tables the first one creates,
and the third revokes a grant on a function the first one defines. Every file is
written to be safely re-runnable (`if not exists`, `drop policy if exists`, and
a `revoke` that is a no-op when already revoked), so a partial run can be
repeated rather than unpicked.

The first two are applied on the projects currently in use; the third was added
on 4 Sep 2026 and has to be run on each of them.

**Applying them by pasting does not register them** in Supabase's own migration
history — `list_migrations` comes back empty, and that is expected rather than a
sign something failed. The files in git are the source of truth; the CLI route
below is what would populate that history.

### B. Supabase CLI (recommended once there is more than one of these)

```bash
npm install -D supabase
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The project ref is the subdomain of your project URL — for
`https://abcdefghijklm.supabase.co` it is `abcdefghijklm`. It is also on
dashboard → Project Settings → General. Deliberately not hardcoded here: the
ref names one specific project, and this repo is not tied to one.

`db push` applies every migration not yet recorded in the project's migration
history, so it stays correct as files are added. It is also what makes a second
environment (a staging project, a teammate's local Postgres) reproducible.

## Then: enable Google sign-in

**This section used to say "enable anonymous sign-ins".** It was correct then
and is wrong now: `signInAnonymously()` was the only way the app could obtain an
`auth.uid()`, so with it off nothing synced. Real login replaced it. Nothing
calls it any more, and **you should turn that toggle OFF** — the publishable key
ships in the browser by design, so while anonymous sign-ins are on, anyone
holding it can create `auth.users` rows straight from the API. That is where
this project's ~205 junk accounts came from.

Google is configured in two places, and neither is in this repo:

**1. Google Cloud Console** — APIs & Services → Credentials → **OAuth 2.0
Client ID**, type *Web application*. Under **Authorized redirect URIs** add:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Configure the consent screen (External), and add the three non-sensitive scopes
`openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` under **Data
Access** — the app reads nothing else. While the app's publishing status is
*Testing*, only accounts listed under **Audience → Test users** can sign in.

**2. Supabase** — Authentication → **Sign In / Providers → Google → on**, paste
the client id and secret, and press **Save**. The page is a form; the toggle
alone does not persist.

Then Authentication → **URL Configuration**: set the Site URL, and list every
origin students arrive from under Redirect URLs (`http://localhost:5173/**` for
dev, plus your deployed domain). **Avoid a bare `https://*.vercel.app/**`** — it
would let Supabase hand an auth code to any Vercel subdomain, which anyone can
deploy. Scope the wildcard to your own project's hostnames.

## Checking it worked

```bash
npm run db:check
```

Reports, in order: env values present → project reachable and key accepted →
Google sign-in on → all eight tables reachable. It stops at the first failure so
the output names a cause rather than a symptom, and warns (without failing) if
anonymous sign-ins are still on.

## The tables

| table | holds | store field it mirrors |
| --- | --- | --- |
| `profiles` | identity, survey answers, XP/level/coins/streak, UI prefs | the flat fields + `userData` |
| `pending_placement_tests` | scheduled placement tests | `pendingPlacementTests` |
| `commitments` | signed roadmap pledges, newest is live | `commitment` |
| `daily_activity` | one row per student per day: the four tasks, plus counters | `tasks` (today only) |
| `exam_results` | one row per attempt, tagged `mock` / `past_paper` / `placement` | `examResults` (mock only) |
| `completed_sessions` | finished lesson ids | `completedSessions` |
| `conversations` | KruAI chat threads | `conversations` |
| `chat_messages` | the messages in them, ordered by `seq` | `conversations[].msgs` |

Curriculum content — lessons, sections, subjects, past papers — is **not** here.
It lives in `src/data/*.ts` and stays there while the curriculum shape is still
moving; putting it in the database now would make every content edit a
migration. Revisit when content settles.

## Row level security

Every table denies everything by default and then allows exactly one thing: you
may read and write rows where `user_id` (or `id`, on `profiles`) equals your own
`auth.uid()`. There is no shared or public data in this schema.

**The leaderboard is the one screen this deliberately does not serve.** It needs
to rank students against each other, which means reading across users, and it is
fixed demo data today partly for that reason. When it goes live it wants a view
or a `security definer` function exposing rank and display name only — not a
"profiles are readable by everyone" policy, which would hand out email, age and
location with it.

## Keys

`VITE_SUPABASE_ANON_KEY` is a **publishable** key. It is meant to be in the
browser bundle and is useless on its own — the policies above are what make it
safe. The `service_role` / secret key bypasses RLS entirely and must never
appear in a `VITE_`-prefixed variable, or anywhere in `src/`.

Same rule, opposite direction, as `GEMINI_API_KEY`: unprefixed on purpose so it
stays server-side. See CLAUDE.md.

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
  20260913000001_competitions.sql  the Game feature: the first cross-user tables
  20260914000001_competition_answers_and_work.sql
                                   what each side answered, and the first
                                   storage bucket in the project
  20260916000002_competition_work_per_question.sql
                                   photos of working per question, several
                                   per question; storage policies only
  20260916000003_competition_work_count_fix.sql
                                   fixes 000002: its photo count recursed
                                   into its own policy and refused uploads
  20260929000001_kruai_usage.sql   KruAI's daily question limits (the money
                                   guard for the paid model). REQUIRED in
                                   production: without it KruAI refuses every
                                   question, on purpose
  20261001000001_telemetry.sql     error reports and usage events
  20261001000002_account_deletion_and_reports.sql
                                   "Delete my account" and photo reports
  20261001000003_report_review.sql the team's photo-report page (/admin/reports)
  20261001000004_fix_admin_photo_reports.sql
  20261002000001_roles_and_admin_tools.sql
                                   user_roles (replaces app_admins), and the
                                   admin area: /admin and /admin/students
  20261002000002_owner_role.sql    the owner: the only one who manages admins,
                                   and never deleted from the app
  20261002000003_creator_photo_cleanup.sql
                                   a creator may delete the photos in their own
                                   competition, so "Delete my account" leaves
                                   no joiner photos behind. Apply BEFORE the app
                                   that uses it ships
  20261002000004_kruai_controls.sql
                                   KruAI limits set on /admin/kruai (owner
                                   only), and pausing KruAI for a student
  20261002000005_announcements_and_content_reports.sql
                                   the banner every student sees, and students
                                   reporting a mistake in a question
  20261003000001_content_in_database.sql
                                   flashcards and practice quizzes stored here,
                                   edited on /admin/content, published by the
                                   owner only
```

**Changing KruAI's daily limits:** since `20261002000004`, the owner changes
them on **`/admin/kruai`** (1 to 200 a student, 1 to 10000 for the whole app).
They live in `app_settings` (`key = 'kruai_limits'`), which no client can read
or write, and `kruai_take` reads them inside the function: they are still not
parameters, because a student can call it directly with their own token. The
server needs no change: `kruai_take` returns the student limit it enforced, and
the chat's "questions left today" counts down from that. By hand, if the page is
not to hand:

```sql
update public.app_settings
set value = '{"user_daily": 30, "app_daily": 300}', updated_at = now()
where key = 'kruai_limits';
```

A bad value cannot take KruAI down: a missing row or a non-number falls back to
30 / 300, and anything outside the bounds is clamped.

The SQL is the source of truth for the schema, checked into git like any other
code. Do not create or alter tables from the dashboard's Table Editor: the
change works, and then nothing in the repo records that it happened, no diff
shows it, and a fresh project cannot be rebuilt from the code. Write a new
migration file instead — the filename is a timestamp, so they apply in order.

## Applying them

**Run every file once, in filename order.** There are two projects, one per
developer, but only one is still being worked on — as of Sep 2026 the repo owner
is the only person building the app, so a new migration is applied once rather
than twice. The other project is untouched and needs nothing. If a second person
picks the app up again, every migration added since has to be applied to their
project too. Two ways:

### A. Dashboard (no install)

1. Supabase dashboard → **SQL Editor** → New query
2. Paste the whole of `20260828000001_init_schema.sql`, run it
3. Paste the whole of `20260828000002_rls_policies.sql`, run it
4. Paste the whole of `20260904000001_hardening.sql`, run it
5. Paste the whole of `20260913000001_competitions.sql`, run it
6. Paste the whole of `20260914000001_competition_answers_and_work.sql`, run it
7. Paste the whole of `20260916000001_content_activity.sql`, run it
8. Paste the whole of `20260916000002_competition_work_per_question.sql`, run it
9. Paste the whole of `20260916000003_competition_work_count_fix.sql`, run it

Order matters: the second file adds policies to tables the first one creates,
the third revokes a grant on a function the first one defines, the fourth
creates its own tables and their policies together, and the fifth adds columns
and storage policies that name the fourth's tables — enabling RLS without a
policy denies everything, so those cannot be split. Every file is
written to be safely re-runnable (`if not exists`, `drop policy if exists`, and
a `revoke` that is a no-op when already revoked), so a partial run can be
repeated rather than unpicked.

The first four are applied. **The fifth was added on 14 Sep 2026 and is the one
to run next.** `npm run db:check` names the two columns it adds until it is.

Until it runs, the Game page keeps working but **a new competition cannot be
shared**: the insert names `creator_answers`, so it is refused, the row stays on
the device and the hub labels it "Not shared yet" - which is true, and is why
that label exists. Applying the migration fixes it for every competition posted
after it; `features/game/share-pending.ts` retries the ones stranded before.

There is no bucket check in `db:check`, deliberately - the publishable key
cannot tell an existing bucket from an invented one. See the comment in
`scripts/supabase-check.mjs`; the column checks come from the same migration and
already answer whether it ran.

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

### Three traps in the Google console, in the order they bite

All three cost real time the first time through, and none of them says what it
actually wants.

**1. "Publish app" is greyed out, and the reason is on another page.** The
Audience page says only *"complete your configuration on the Branding page"*.
Publishing an External app needs three Branding fields that are optional while
in Testing: **Application home page**, **Application privacy policy link**, and
**Authorized domains**. The same missing configuration also shows on Audience as
a permanent *"OAuth configuration is incomplete"* banner that survives a reload,
which reads like a bug and is not one.

**2. Every domain you name has to be registered, and the full hostname is what
it wants.** Authorized domains must cover the redirect URI's domain AND
whatever the home page and privacy policy links use — usually two entries:

```
<your-project-ref>.supabase.co
your-app-domain.example.com
```

A shared hosting suffix like `vercel.app` is **rejected**: register the full
hostname (`your-app.vercel.app`). Google's own error names the exact string it
expects — read it rather than guessing.

**3. DO NOT UPLOAD A LOGO.** With only the three non-sensitive scopes above and
no logo, publishing is **instant and needs no review**. Uploading a logo is a
brand claim, and it triggers a verification that takes days to weeks — to change
one icon on one screen. The consent screen shows your app's NAME either way. Add
it later, once you are live and not waiting on anything.

### Testing vs In production

|  | Testing | In production |
| --- | --- | --- |
| Who can sign in | only emails added under Audience → Test users | anyone with a Google account |
| Cap | 100 | none |
| Anyone else | hard "Access blocked" error | signs in normally |
| Review | none | none, for non-sensitive scopes |

**Testing is the state that produces errors**, so it is not the cautious choice
— a student whose address you have not typed in by hand simply cannot get in,
and the message blames Google verification rather than your test-user list.
Publishing is reversible: the same page has a "Back to testing" button.

The app needs `/privacy` to be reachable WITHOUT signing in for any of this,
which is why that route sits outside `ShellLayout` — see the comment in
`src/app.tsx`.

## Checking it worked

```bash
npm run db:check
```

Reports, in order: env values present → project reachable and key accepted →
Google sign-in on → all ten tables reachable. It stops at the first failure so
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
| `competitions` | a posted challenge: frozen questions, the creator's score and picks | `competitions` |
| `competition_attempts` | one row per student per competition: their score and picks | `competitionAttempts` |

There is also one **storage bucket**, `competition-work` (private), holding the
photographs each student takes of the working they did on paper — per question,
up to six each. Objects are named
`{competition_id}/{user_id}/{question}-{photo_id}.jpg`, and every policy on them reads the owner
straight back out of that filename - so no table stores a path and neither of
the two above needs a write after its insert.

Curriculum content — lessons, sections, subjects, past papers — is **not** here.
It lives in `src/data/*.ts` and stays there while the curriculum shape is still
moving; putting it in the database now would make every content edit a
migration. Revisit when content settles.

## Row level security

Every table denies everything by default and then allows exactly one thing: you
may read and write rows where `user_id` (or `id`, on `profiles`) equals your own
`auth.uid()`.

**The two competition tables are the exception, and they are the only one.** A
competition is readable by every signed-in student, because a challenge nobody
else can see is not a challenge. That is safe as a property of the ROW rather
than of the policy: it carries a subject, a question set, a score and a display
NAME, and no email, age or location. `creator_name` is denormalised for exactly
that reason. An attempt is narrower still - readable by the student who made it,
or by whoever created the competition - which is the product rule in SQL: every
joiner competes against the creator, and joiners never see each other. The
storage policies on `competition-work` mirror the same three cases.

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

## `20260916000002` and `20260916000003` — the migrations `db:check` cannot see

They change storage POLICIES only (photos became per question), and the
publishable key cannot read policies, so `npm run db:check` passes whether or not
they have run. **Run both** — `000002` on its own refuses EVERY upload with
"infinite recursion detected in policy for relation objects", because its
six-photo count read `storage.objects` from inside a policy on that same table;
`000003` moves the count into a function. The symptom of it missing is specific: **every photo upload fails with
"Could not upload"**, because the older insert policy looks for the owner in the
filename and the new path puts it in a folder. If uploads fail on a project where
everything else works, this is the first thing to check.

## `20261001000001` and `20261001000002` — telemetry, account deletion, photo reports

Both are applied by hand in the SQL editor, like every migration here. After
them, `npm run db:check` lists `client_errors`, `app_events` and `photo_reports`.
It cannot see the functions (`log_client_error`, `log_event`,
`delete_my_account`), so check those directly: calling
`/rest/v1/rpc/log_event` with only the publishable key must be **refused**
(it is granted to `authenticated` only).

**Without `000001`** error reports and usage events are dropped silently; the app
is unaffected. **Without `000002`** "Delete my account" in Profile shows its
error message, and the photo Report button says it could not send.

Nothing in the app reads any of these tables back. You read them here, as the
project owner, in the SQL editor:

```sql
-- Daily active students (one app_open per student per day)
select event_date, count(*) as students
from public.app_events where name = 'app_open'
group by 1 order by 1 desc limit 30;

-- Day-7 return: of the students first seen on day D, how many came back on D+7
with first_seen as (
  select user_id, min(event_date) as d0
  from public.app_events where name = 'app_open' group by 1
)
select f.d0, count(*) as new_students,
       count(e.user_id) as back_on_day_7
from first_seen f
left join public.app_events e
  on e.user_id = f.user_id and e.name = 'app_open' and e.event_date = f.d0 + 7
group by 1 order by 1 desc limit 30;

-- What students actually do, last 7 days
select name, count(*) as events, count(distinct user_id) as students
from public.app_events
where event_date > current_date - 7
group by 1 order by 2 desc;

-- Recent crashes, grouped
select message, count(*) as times, max(created_at) as last_seen,
       max(route) as a_route, max(app_version) as version
from public.client_errors
where created_at > now() - interval '7 days'
group by 1 order by 2 desc limit 50;

-- Questions students reported as wrong or unclear, most reported first
-- (the page is /admin/mistakes)
select content_ref, count(*) as reports, array_agg(distinct kind) as kinds
from public.content_reports where resolution is null
group by 1 order by 2 desc;

-- Photo reports waiting for review
select r.created_at, r.reason, r.photo_path, r.competition_id
from public.photo_reports r order by r.created_at desc;
```

**Reviewing reports: use the page, not Storage.** `20261001000003_report_review.sql`
adds the team's review page at **`/admin/reports`** (in no menu; type the URL).
It shows each reported photo with **Keep** and **Delete** buttons, and records
the decision on the report rows (`resolution`, `resolved_at`, `resolved_by`)
instead of deleting them. Only admins get anything back (see "Admins" below).

### Admins and the owner

`20261002000001_roles_and_admin_tools.sql` replaced `app_admins` with
**`user_roles`** (one row per student and role) and moved every existing admin
across. It also adds the admin area: **`/admin`** (the dashboard) and
**`/admin/students`** (search, manage admins, delete an account). Admins and the
owner see an **Admin** row in the app's menu; nobody else does.

**`20261002000002_owner_role.sql`** adds the **owner**:

| | admin | owner |
| --- | --- | --- |
| sees `/admin`, the dashboard, photo reports | yes | yes |
| looks students up, deletes a student's account | yes | yes |
| makes or removes admins | no | **yes, the only one** |
| deletes an admin's account | no | yes, after removing the role |
| can be removed or deleted from the app | yes (own account, on Profile) | **no, SQL editor only** |

**The owner is set here, in the SQL editor, and nowhere else.** The account
must have signed in with Google at least once, or there is no `auth.users` row:

```sql
insert into public.user_roles (user_id, role)
select id, 'owner' from auth.users where email = 'someone@example.com';
```

After that the owner adds and removes admins on `/admin/students`. Removing the
owner (for example to hand the app to someone else, add the new owner first):

```sql
delete from public.user_roles where role = 'owner'
  and user_id = (select id from auth.users where email = 'someone@example.com');
```

Who has which role:

```sql
select u.email, r.role, r.granted_at
from public.user_roles r join auth.users u on u.id = r.user_id
order by r.role, u.email;
```

**Apply each migration in ONE go** (each is a single transaction). 000001 drops
`app_admins` only after copying its rows and redefining `is_app_admin()`, so the
photo-report page keeps working throughout. `db:check` sees `user_roles` but not
the functions; check those with a publishable-key-only call to
`/rest/v1/rpc/admin_dashboard`, which must be refused.

Still possible by hand: Storage → `competition-work` → open the folder named by
the report's `photo_path` (`{competition}/{student}/…`) and delete the file.
Reports never hide anything automatically: one report hiding a photo for
everyone would let any student hide a classmate's work.

## `20261003000001`: flashcards and quizzes in the database

Flashcard decks and practice quizzes move out of the code into three tables, so
the team can fix them on **`/admin/content`** without a code change
(`docs/plans/content-in-database.md`):

| table | what | readable by |
| --- | --- | --- |
| `content_items` | which version of each deck or quiz students see | anyone (published rows) |
| `content_versions` | every version ever published, never changed | anyone |
| `content_drafts` | unpublished drafts | nobody directly |

Any admin can save a draft. **Only the owner can publish, hide or import.**

**The one-time move, in order:**

1. Run the migration in the SQL editor, in one go.
2. Sign in as the owner, open `/admin/content`, press **Import a file**, choose
   `content/fixture.json` (made by `npm run content:export`), tick **Publish items
   that have never been published**, and press **Import**. It should say 26 published.
3. Check it arrived exactly: `npm run check:content -- --live content/fixture.json`
   must say "26 of 26 item(s) published exactly as in the file".

Since step 1b (3 Oct 2026) students read decks and quizzes ONLY from here: a
new publish reaches them the next time they open the app. On a new project, do
steps 1 to 3 before deploying, or every deck and quiz shows as coming soon.

`db:check` lists the three tables but cannot see the functions. Check those with
a publishable-key-only call to `/rest/v1/rpc/admin_content_list`, which must be
refused, and `/rest/v1/rpc/content_current?p_kind=quiz`, which must answer 200.

What is live, by hand:

```sql
select kind, key, version, item_count from public.content_items order by kind, key;
```

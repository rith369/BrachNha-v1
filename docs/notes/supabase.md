# Supabase: schema, sync and RLS

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Supabase — the database, and why the app does not read from it

`localStorage["brachnha"]` is still the app's live copy. Supabase is a SECOND
copy that trails behind it by a couple of seconds. Nothing in the UI awaits it,
no screen renders differently because of it, and the whole thing being absent —
unconfigured, unreachable, or a project whose migrations were never applied — is
a supported state rather than a broken one.

That direction is deliberate and is the thing to not "fix". Reading from the
database directly would mean every screen has a loading state, an error state
and a stale state it does not have today, on an app whose audience is on
Cambodian mobile data. The store already solves the hard part; Supabase makes it
durable.

### Current state — it is set up, and there are TWO projects

Since 2 Sep 2026 this is live rather than aspirational: both migrations applied,
`.env` filled, and a real row confirmed reaching `profiles`. `npm run db:check`
passes all four steps. So do not read the setup instructions below as work still
outstanding.

**Identity is Google sign-in now, not anonymous** — see the auth section near the
end of this file. Nothing calls `signInAnonymously()` any more, so a guest
creates no `auth.users` row and syncs nothing at all.

**ONE ACTIVE Supabase project — but the migrations are still the source of
truth.** The schema was built for two, one per developer, because neither wanted
a teammate's test data in their dashboard. As of Sep 2026 only the repo owner is
still working on the app; Hok Chheng's project still exists and nothing needs
doing to it, it simply stops receiving migrations. So a new migration is applied
ONCE, not twice. That is also why no project ref or URL appears in any tracked
file (`cc9a9c1` removed the last one) — `.env` is the only place it belongs, and
that stays right whether there is one project or five.

**The rule that outlives the headcount:** `supabase/migrations/*.sql` is applied
by hand, and never, ever replaced by an edit in the dashboard's Table Editor. A
change made there works, and then nothing in the repo records it, no diff shows
it, and the schema and the code drift apart silently. With one active project
that is merely invisible; the moment a second person starts working on the app
again, **every migration since has to be applied to their project too** and the
whole per-project discipline is back.

**THIS PROJECT IS NOT THE RAG STORE, and this paragraph used to say it was.**
It asserted `pgvector` here as the settled answer, with no reasoning attached,
and it was read as decided. The decision went the other way (13 Sep 2026, the
user's call): when the mentor outgrows one prompt, the embedding index is a
**committed file bundled into the serverless function**, not a table here. The
full argument is in the mentor section — the short version is that an absent or
unreachable Supabase is a SUPPORTED state everywhere in this app, so putting
mentor *quality* behind it creates a degradation that is invisible from the UI
by construction, and that the corpus is static, small, and already in git.

What survives unchanged is the half that was never in doubt: **content stays in
`src/data/*.ts` as the source of truth, with embeddings as a DERIVED index, and
no new vendor.** Revisit this only past ~5,000 chunks, or the moment
retrievable content stops living in `src/data/`.

**Files, and what each is for:**

| file | role |
| --- | --- |
| `supabase/migrations/*.sql` | the schema. Source of truth, checked into git |
| `supabase/README.md` | how to apply them, and the two dashboard steps |
| `src/types/database.ts` | hand-written mirror of the SQL, `Row`/`Insert`/`Update` |
| `src/lib/supabase.ts` | lazily-imported client, or null |
| `src/lib/supabase-sync.ts` | store ↔ row mapping, push and pull |
| `src/hooks/use-supabase-sync.ts` | auth + when to push. Mounted once, in `AppShell` |
| `scripts/supabase-check.mjs` | `npm run db:check` — env → reachability → auth → tables |

### Four things here that look wrong and are not

**1. `getSupabase()` is an async function, not an exported client.** The SDK is
~40KB gzipped and `AppShell` mounts the sync hook on every screen, so a static
import puts all of it in the entry chunk — 168KB gzipped, arrived at
deliberately (see the performance section). `import type` is erased, so the only
real import is the dynamic one inside the function. Same boundary as KaTeX,
MathLive and three.js. **Check `dist/assets/` still has a separate Supabase
chunk after touching that file**; a stray static `import { createClient }`
anywhere undoes it silently, exactly like `math-field-panel`.

**2. `Relationships` on every table in `database.ts` is mandatory, not
decoration.** It is a required member of postgrest-js's `GenericTable`. A table
missing it fails the `GenericSchema` constraint, and the client then degrades
every query's type to `never` instead of erroring at the definition — so the
build breaks in `supabase-sync.ts` with two dozen "not assignable to parameter
of type `never[]`" errors pointing at correct code. The entries also drive
embedded selects: the `conversations → chat_messages` embed in `pullRemoteState`
typechecks only because `chat_messages` declares a relationship back.

**3. Local always wins, except once.** The only pull is into an EMPTY store
(`userName === ""`) that has a live session — a cleared cache or a reinstall. A
wrong pull silently overwrites work the student just did with a stale server
copy and they cannot get it back; a wrong push overwrites a backup of that same
device. The costs are not symmetrical, so the tie does not go to the middle.

**4. `conversations.id` is `text`, not `uuid`.** The id is minted client-side by
`newId()` in `store.ts`, which falls back to a `c<base36>` string when
`crypto.randomUUID` is unavailable. A uuid column would reject those and every
id already sitting in a student's localStorage.

### Identity is GOOGLE, and anonymous sign-in is gone

**This section used to say the opposite.** Until real login landed, sign-in was
`signInAnonymously()` for anybody with a name in the store: a real `auth.users`
row with no email and no password, so `auth.uid()` existed and RLS worked while
the student only typed a name. That is all removed — `signInAnonymouslyOnce` and
its StrictMode `signInInFlight` guard are deleted, and `use-supabase-sync.ts`
never creates a session. See the auth section near the end of this file for what
replaced it.

Three consequences worth having in mind here:

- **A GUEST SYNCS NOTHING.** No session, so no rows, which is the honest meaning
  of having no account. Their work lives in `localStorage`, which is where the
  live copy has always been anyway.
- **The 205 junk users cannot happen again.** `scripts/shots.mjs` created about
  a hundred anonymous accounts per run because the seeded `userName` was all the
  old hook needed. Nothing signs in without a student pressing a button now.
  Run it with the Supabase vars blanked anyway — that is still the documented
  command, and it is what makes the screenshots skip the auth gate.
- **Anonymous sign-ins can be turned OFF in the dashboard** (Authentication →
  Sign In / Providers). Nothing calls it. It is still ON in the projects in use,
  and leaving it on is harmless but pointless.

**Roaming is real now, and so is the risk that comes with it.** Two devices
signing into one Google account get the same uid and therefore the same rows.
That is the feature — and it is also what made `pushLocalState` dangerous, since
it writes a full destructive snapshot. `syncedUserId` and `AccountConflictView`
are the answer; see "Signing in cannot destroy work" below.

**A Google user's email is on the auth user AND in `profiles.email`.** The
trigger `handle_new_user` copies `new.email` into the profile row on insert, and
`login-view.tsx` prefills the same address into `userEmail` so the ordinary push
keeps it there. `profiles.email` still has no unique constraint, which matters
more now than it did: two Google accounts are two uids with no linking.

**Verified against the live project:** the settings endpoint reports the
anonymous toggle at `external.anonymous_users`, NOT a flat
`external_anonymous_users` — the flat name is simply absent from the payload, so
reading it always says "disabled". `scripts/supabase-check.mjs` carries a
comment saying so. Google shows up at `external.google` the same way, which is
how "is Google actually enabled" is checked without trusting a toggle's colour.

### Two places the schema deliberately does more than mirror the store

**`daily_activity` has a date.** The store's `tasks` is only ever today —
`resetDailyTasks()` wipes it and nothing survives. (That was an ASPIRATION until
the pre-login review: the function had no caller, so `tasks` accumulated forever
and every day's row inherited stale flags. `tasksDate` + `rolloverDailyTasks()`
are what make the sentence true — see that section below.) One row per student per day
is the "daily activity log" that `features/progress/demo-data.ts` and
`utils/leaderboard.ts` both name as the missing piece before the heatmap and the
study-time board can stop being demo data. **It is the server copy of the
store's `activityLog` now** — `xp_earned` carries a day's XP and the three goal
task flags carry whether the daily goal was met — which is what the Profile study
calendar and the real streak are built on (see that section). The push sends
today's row plus the previous 14 days, and the pull reads the last 400 back.

**`daily_content_activity` (20260916000001) is its companion**, and the split is
the point: this table knows a day happened, that one knows what it was OF. It is
the server copy of `contentLog` and the thing four Progress cards are built on;
see the Progress section. **`study_minutes` IS written now** — by `hooks/use-study-timer.ts`, and it does
mean ACTIVE minutes, which is what that column's original comment demanded. See
the Progress section for what counts and for why the figure must not be ranked
on without a server-side cap. `questions_answered` is still written by nothing
and is deliberately left that way: its only consumer would be the Study Activity
heatmap, which is still demo, and `contentLog` already carries the number.

**`exam_results` has a `kind`.** The store's `examResults` holds generated mock
exams ONLY, and three things depend on that: Home's "from mock exams" stat pill
(no longer: since 28 Oct 2026 that pill counts every scored answer in
`contentLog` and is captioned "answered", see the Profile entry; older mentions
of the pill as a reason below are history), the average `chat-prompt.ts` states
to KruAI as fact, and the generated-exam
tab rendering the array unfiltered. `kind` lets past-paper and placement
attempts be recorded without ever being mistaken for a mock — the client filters
`kind = 'mock'` when it rebuilds the array. This is the "separate persisted
`pastPaperResults`" follow-up flagged in the Mock Exam section, done as a column
because the row shape is identical.

### RLS: own rows only, and the one screen that does not fit

Every table denies by default and then allows exactly `auth.uid() = user_id`
(`= id` on `profiles`), with `(select auth.uid())` so Postgres evaluates it once
per statement rather than once per row.

The leaderboard's cross-user read EXISTS now, as exactly the shape this
paragraph asked for: `public.leaderboard(p_today)`
(`20260916000004_leaderboard.sql`), a `security definer` function returning a
display name and numbers only — **not** a "profiles are readable by everyone"
policy, which hands out email, age and location with it. Granted to
`authenticated` only. See the Leaderboard section.

**`/streak/friends` has its own cross-user read now** (13 Oct 2026,
`20261013000001_friends.sql`): a `friendships` table with a request/accept
pair, read-own RLS and no write policy, and `security definer` functions for
search, requests and `my_friends()`, which returns a friend's name and goal days
only. **There is no pair-owned streak row**: the pair streak is DERIVED on the
device from both students' goal days, so it cannot disagree with them. See the
Streak with Friends section.

### Content stays in `src/data/`

Lessons, sections, subjects, past papers are NOT in the database. Most subjects
have no content yet and the curriculum shape is still moving; a schema would
make every content edit a migration. Revisit when content settles, not before.

**Revisited for flashcards and practice quizzes (3 Oct 2026, the user's call)**:
they now LIVE in the database, so the team fixes them without a code change, and
`data/practice.ts` and `data/quizzes/` are deleted. See "Flashcards and quizzes
move into the database" near the end of this file. **Lesson sections and past
papers followed on 7 Oct 2026** (stages 2 and 3): `data/sections.ts` and
`data/papers/` are deleted too. What stays in code is STRUCTURE (subjects, the
path shapes in `features/lessons/sessions.ts` and `quiz-path.ts`,
`PAST_PAPER_YEARS`). The 10 mock-exam questions (`MOCK_QS`) were deleted on 7 Oct 2026. The
game questions moved into the database the same day ("Game questions move into the
database"), and the legacy 7-step lessons (`data/lessons.ts`) were deleted ("The old
7-step lessons are deleted").

### Keeping the three copies in step

The schema, `database.ts` and the sync layer are three descriptions of one
thing. Two invariants worth re-checking after any change to the store:

- every key in `partializeState` (`lib/store.ts`) appears in
  `syncRelevantChange` (`use-supabase-sync.ts`), or that field silently never
  reaches the server;
- every column in the SQL appears in the matching `Row` type.

Both were verified mechanically when this landed — 21/21 fields, 74/74 columns
across 8 tables — and both are the kind of thing that rots quietly.

`contentLog` is the newest entry on both sides: one key in `partializeState`,
one line in `syncRelevantChange`, one table (`daily_content_activity`) mirrored
in `database.ts`. `ExamResult.subject` added no column — `exam_results.subject`
has existed since the initial schema and was simply never written until the
store had a subject to put in it.

`tasksDate` is listed in `syncRelevantChange` although it has NO column of its
own — `daily_activity` keys on `activity_date`, which the push derives itself.
It is there so the two lists stay the same length and the next person auditing
them finds a one-to-one, rather than a gap they have to reason about.

`activityLog` is in both lists too, and it has no column on `profiles` either:
it maps onto `daily_activity`, one row per key — `xp` to `xp_earned`, `goal` to
the lesson/practice/flashcards flags.

`@supabase/ssr` is in `package.json` and is unused: it is for frameworks with a
server-rendered request cycle, which this app does not have. Safe to remove.

## Study progress syncs across phones (27 Oct 2026)

Six persisted store fields never left the device, so a student who signed in on
a new phone (or cleared the browser) lost them even with an account:
`cardReviews`, `studentCards`, `starredCards`, `reviewHistory`, `quizResults`
and `paperResults`. They sync now, each to its own table
(`20261027000001_study_progress_sync.sql`): `card_reviews`, `student_cards`,
`starred_cards`, `card_review_log`, `quiz_results`, `paper_results`. Own rows
only (read, insert, delete; update only on `card_reviews` and `student_cards`,
since the other four are insert-once and written `on conflict do nothing`).

**NOT through the snapshot push.** `lib/study-progress-sync.ts` sends only what
changed since the last push. `lib/sync-marks.ts` is the record of what this
device uploaded (`localStorage["brachnha-sync-marks"]`, a device fact keyed by
account, like `lib/intro-seen.ts`): a signature per card review, `updatedAt` per
own card, the starred ids, the newest review-log time, and a key per quiz/paper
attempt. A grade costs one `card_reviews` row and one `card_review_log` row.
A mark moves forward only for a request the server accepted, so a failed table
just retries on the next push and the others are unaffected.
`pushLocalState()` calls it last; `pullRemoteState()` reads it back.

**Deletions are INFERRED from the marks**: a card or star in the marks but no
longer on the device was deleted here, and the push deletes it on the server.
That is only safe while the marks describe this device's data, hence two rules
that must not be undone:
- **`pullRemoteState()` clears the marks FIRST**, before anything can fail. A
  pull that fails (or a table that fails inside it) must not leave old marks
  over an emptier store, or the next push would delete the account's copy.
- **Sign-out clears them** (`resetSyncCache()`).

**Two devices on one account merge**: both upsert, the server holds the union,
the last grade of a card wins. The one exception is **"Keep this device's
work"** on the account-conflict screen, which calls `markReplace()`: the next
push deletes the account's rows in all six tables (all six must succeed, or
nothing is uploaded and the flag stays) and then uploads this device's. That is
what the screen's warning already promised.

Smaller decisions:
- A row the database would refuse is LEFT ON THE DEVICE, not sent, because one
  bad row fails its whole batch (`validReview`, `validCard`, `validAttempt`).
  The scheduler had no interval cap, so a card re-graded "good" many times
  reached a `dueAt` that is not a date. Fixed the same day: `MAX_INTERVAL_DAYS`
  (365) in `utils/spaced-repetition.ts` caps every interval, and
  `repairReviewState()` runs in the store's persist `merge` to bring cards saved
  before the cap back within a year of their last grade (the map is replaced
  only if a card changed, so an ordinary load arms no push). 14 checks.
- The review log is pushed by time (`logUntil`): a device clock set BACKWARDS
  between two grades leaves the later one unsent. Accepted; nothing reads the
  log yet.
- The pull reads back the store's own caps (1000 log entries, 50 quiz and 50
  paper attempts) and normalises Postgres's `+00:00` times to the device's `Z`
  spelling, so marks and the log's string comparison agree. A quiz or paper row
  whose jsonb is not the shape the review indexes into is dropped.
- `deviceHasWork()` counts these fields too, so a guest who only did flashcards
  or a quiz still gets the conflict question rather than a silent pull.
- **The code ships before or after the migration.** No column was added to an
  existing table; a missing table fails only its own request and its marks stay
  put, so everything uploads once the migration lands.

**Verified:** PGlite 0.2.17, the migration twice: 34 checks (RLS per table and
per role, `anon` reads nothing, insert-once duplicates ignored and no rewrites,
every CHECK, the replace delete, the profile cascade). The REAL
`study-progress-sync.ts` and `supabase-sync.ts` through `ssrLoadModule` with
only `getSupabase()` faked by an in-memory client: 39 checks (first push uploads
all six; an unchanged push writes nothing; one grade sends exactly two rows; a
deleted card, its review and an un-star are deleted on the server; a failing
table keeps its marks and retries; a malformed review is skipped while the rest
go; a pull onto an empty store restores all six fields exactly and the push
after it writes nothing; a partly failed pull deletes nothing; sign-out clears
the marks; another account's marks are ignored; replace removes the other
phone's rows and keeps its flag when a delete fails). **Not verified: two real
phones on one Google account.**

## Limits on what a student writes (3 Nov 2026, `20261103000006`)

**Free text is CUT by a trigger, never refused, and this is the decision to keep.** Sync failures are
silent (`attempt` in `lib/supabase-sync.ts` only logs), so a check refusing a long Google name would
stop that student's whole profile saving, XP and streak included, with nothing on screen. Chat sync
deletes a conversation's messages and re-inserts them, so one refused message would lose the
conversation from the account.

| column | limit |
| --- | --- |
| `profiles.display_name` | 40 (`MAX_NAME_LENGTH` in `lib/store.ts` and the name boxes match) |
| `profiles.email` | 320 |
| `profiles.location`, `grade`, `active_conversation_id` | 100 |
| `profiles.strengths`, `weaknesses` | 50 items of 100 |
| `commitments.signature` | 60000 (the longest real drawing is about 35000) |
| `commitments.grade`, `months` | 100 |
| `conversations.title` | 200 |
| `chat_messages.content` | 30000 (a KruAI reply is at most 3000 tokens) |

**Ids and keys are REFUSED**, with `not valid` checks so old rows cannot fail the migration: cutting
one would point it at something else, and the app only makes short ones. `conversations.id` 100,
`completed_sessions.lesson_id` and `daily_content_activity.content_key` 200, `exam_results.subject`
and `pending_placement_tests.subject` 100.

**A new free-text column needs a limit in the same migration:** a trigger clip if a real student can
reach it, otherwise a check.

**Not covered: how MANY rows a student can write to their own tables.** Nobody else reads those rows,
so it can only grow storage. A script could still do that.

**Verified:** the real tables, triggers and policies on PGlite 0.2.17, as the `authenticated` role: 49
checks, including a 1,000,000-letter profile save keeping the XP in the same save, a 40-message batch
with one giant message going in whole, and the Phnom Penh day boundary. Browser with the database faked:
58 checks at 390 and 320. **Not verified: against the real database.** The migration's last statement
returns `limits_in_place`, which `db:check` cannot read from outside.

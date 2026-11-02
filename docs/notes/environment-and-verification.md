# Environment and verification

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Environment notes

- Windows / Git Bash user. Node 22+, npm 10+.
- `.gitattributes` sets `* text=auto eol=lf`. It exists because right after the
  migration every file showed as wholly rewritten in `git status` from CRLF
  churn. If you see that again, that file is what to check.
- Run `npm install`, then `npm run dev`, and open **http://localhost:5173**
  (not 3000 — that was Next).
- The Gemini key goes in `.env` or `.env.local` (both git-ignored). Restart the
  dev server after adding it; `loadEnv` runs once at config time.
- **`.env` holds THREE values**, and the prefix rule cuts both ways:
  `GEMINI_API_KEY` has no `VITE_` prefix so it can never reach the browser, while
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are prefixed precisely
  *because* they must — the publishable key is a public identifier and RLS is
  what makes that safe. `.env.example` documents all three.
- **`VITE_SUPABASE_ANON_KEY` holds a `sb_publishable_…` key, not an `eyJ…` JWT.**
  The variable keeps the older "anon" name because `src/lib/supabase.ts` reads
  it; the value is Supabase's newer publishable format. Don't go hunting the
  dashboard for an "anon key" that isn't there. See AGENTS.md.
- **Restart the dev server after editing `.env`.** A running Vite server keeps
  the values it started with, and for a package installed since startup it
  reports the import as unresolvable rather than merely stale — which reads like
  a code error and isn't one.
- Deploying: Vercel, config in `vercel.json`. `GEMINI_API_KEY` must be set in
  the Vercel project's Environment Variables — `.env` files are not uploaded.
- **Verify what Vercel actually has with `vercel env ls`** rather than trusting
  that a dashboard edit was saved. The CLI is linked to `brach-nha-v1`; if a
  fresh clone needs it, `vercel link --yes --project brach-nha-v1` — plain
  `vercel link --yes` tries to CREATE a project from the folder name and fails,
  because `Brachnha-v2` has capitals and Vercel project names must be lowercase.
  `vercel logs <url>` reads production logs, but free-tier retention is about an
  hour, so it only helps if you look soon after a failure.
- **`vercel link` appends `.vercel` and `.env*` to `.gitignore`.** Both are
  already covered, and `.env*` silently overrides the `!.env.example` negation
  (last matching pattern wins), so delete them if they come back rather than
  leaving them.
- **The two `VITE_SUPABASE_*` values must be in Vercel too, on Production AND
  Preview, followed by a REDEPLOY.** Vite substitutes `VITE_*` at build time, so
  an existing deployment keeps the empty strings baked into its bundle and
  adding the variables changes nothing until a new build runs. Miss this and
  production silently never syncs while localhost does — invisible from the UI,
  because an absent Supabase is a supported state by design.

## Verification standard used throughout

Every feature is checked with **all three** of these, zero errors, before being
considered done:

```bash
npx tsc -b            # NOT `tsc --noEmit -p tsconfig.json` — this is a solution build
npx oxlint            # NOT eslint — there is no eslint config in this repo
npm run check:digits  # no Khmer numerals — see "Digits are Latin everywhere"
npm run check:content # content files under content/ (the database's five kinds)
```

The third is there because the first two cannot see it: to `tsc` and to oxlint,
`"១២"` and `"12"` are both just strings. It is instant and has no dependencies,
so there is no reason to skip it on a change that "obviously" touches no copy.

**`check:quiz` IS DELETED (7 Oct 2026).** Its last job was the 10 mock-exam
questions (`MOCK_QS`), deleted that day. Every question now lives in the
database, and `check:content` and the editor run the same rules on it
(`utils/content-check.ts`). The history below is why those rules exist.

**`check:quiz` was the same argument for authored QUIZ AND PAST-PAPER content**
(`scripts/check-quiz.mjs`). It covered `PAST_PAPERS`,
`GAME_QUESTIONS` and — since a section first carried LaTeX (`math-1-1-1`) —
`SECTION_CONTENT`, walking every block's intro and outro, every item label, body
and nested item, both halves of every misconception, and the quiz when one is
authored — the papers were added the day the maths paper shipped a wrong Khmer term
and Unicode standing in for notation, neither of which any other check can see.
For a paper it also walks each part's `statement` and `instruction`, and checks
a gap-fill answer really is in its own word bank. Every field in those records
is a string to a
typechecker, so nothing else in the repo can tell you that `correct` is not
actually one of the `options`, that two options are spelled identically, that a
`$` was never closed, or that a Khmer word ended up inside `$…$` where KaTeX has
no glyphs and renders a row of empty boxes. It runs the app's own path —
`splitMath`, then `katex.renderToString` with `throwOnError: true` — for the
reason recorded under the LaTeX bug below: **eyeballing is not enough, because
the broken output rendered without a single error.** A `$` left in a TEXT segment
is an error even though nothing throws: `splitMath` refusing a formula is correct
in a streamed chat reply and a bug in authored content, where it means the
student reads raw LaTeX. It loads the module through Vite's `ssrLoadModule`,
since `data/*.ts` uses `.js` specifiers that only resolve under a bundler.

What it cannot catch, and no mechanical check can short of a CAS, is **two
options that are the same VALUE in different forms** — `\frac{1}{4}` beside
`0.25`. That is why `content/README.md` states a canonical-form rule instead: fractions are always `\frac{a}{b}` and a decimal is never a legal
option, which makes the largest family of those collisions unwriteable rather
than merely discouraged.

`npm run build` runs `tsc -b && vite build` and must also pass. For anything
touching the mentor, additionally exercise `POST /api/chat` against a running
dev server — with and without a key — since neither typecheck nor lint covers it.

For anything touching Supabase, additionally:

```bash
npm run db:check     # env → reachability → Google sign-in → every table
```

**The Leaderboard needs `20260916000004_leaderboard.sql` applied**, by hand, in the
SQL editor — and `db:check` CANNOT see it (a function, not a table). Check it
directly: `POST {VITE_SUPABASE_URL}/rest/v1/rpc/leaderboard` with the publishable
key answers `PGRST202` ("could not find the function") while it is missing, and a
permission error once it exists (it is granted to `authenticated` only). Until
then the board is just the sample cohort plus the viewer, with no error shown.

**Progress needs `20260916000001_content_activity.sql` applied**, by hand, in the
SQL editor. Until it is, `db:check` names `daily_content_activity` as missing and
the content-log push fails silently while every Progress card keeps working off
the LOCAL log — which is the usual degradation here (localStorage is the live
copy; Supabase is the durable second one), so the only visible symptom is that a
new device pulls no per-subject history.

**Phase 0 needs `20261001000001_telemetry.sql` and
`20261001000002_account_deletion_and_reports.sql` applied**, by hand. `db:check`
sees their three tables (`client_errors`, `app_events`, `photo_reports`) but NOT
the functions (`log_client_error`, `log_event`, `delete_my_account`): a
publishable-key-only call to `/rest/v1/rpc/log_event` must be refused. Until
they are applied, error reports and events are dropped silently, Delete my
account shows its error, and Report says it could not send.

**The admin area needs `20261002000001_roles_and_admin_tools.sql` AND
`20261002000002_owner_role.sql` applied**, by hand, each in ONE run (each is
one transaction), then an owner row added in the SQL editor (see
`supabase/README.md`). **`20261002000003_creator_photo_cleanup.sql` must be
applied BEFORE the app that uses it ships**: without it, "Delete my account"
fails (safely, nothing deleted) for any student who created a competition that
someone joined with photos. Until it is, `db:check` names
`user_roles` as missing, `/admin` shows its tool links but "Could not load
this" for the dashboard, and `/admin/students` fails to load; the photo-report
page keeps working on the old `app_admins`. Afterwards a publishable-key-only
call to `/rest/v1/rpc/admin_dashboard` must be refused.

**`20261002000004_kruai_controls.sql` (KruAI limits and pausing)** can ship before
or after the code: the server falls back to 30 a student without it. Until it is
applied, `db:check` names `app_settings` and `kruai_blocks` as missing and
`/admin/kruai` says it could not load. Afterwards a publishable-key-only call to
`/rest/v1/rpc/admin_kruai_overview` must be refused.

**`20261002000005_announcements_and_content_reports.sql`** can ship before or
after the code: without it the banner's fetch fails quietly (no banner), the
report button's call fails with "could not send", and the two admin pages say
they could not load. Afterwards `db:check` lists `announcements` and
`content_reports`, and a publishable-key-only call to
`/rest/v1/rpc/admin_content_reports` must be refused while a plain
`GET /rest/v1/announcements` answers `200` with the live rows (often `[]`).

**`20261003000001_content_in_database.sql`** (flashcards and quizzes) can ship before or
after step 1a's code: without it `/admin/content` says it could not load and nothing else
changes, because students still read the code's copy until step 1b. Afterwards `db:check`
lists `content_items`, `content_versions` and `content_drafts`, a publishable-key-only call to
`/rest/v1/rpc/admin_content_list` must be refused, and `/rest/v1/rpc/content_current?p_kind=quiz`
answers `200`. **Since step 1b students read content ONLY from here**: the import was done
on 3 Oct 2026 (26 of 26 exact). On a NEW project, import `content/fixture.json` before
deploying, or every deck and quiz shows as coming soon; `npm run check:content -- --live
content/fixture.json` is the proof it is safe.

**`20261003000002_sections_and_papers.sql`** (lesson sections and past papers) must be
applied AFTER `20261003000001`, and can ship before or after step A's code: without it the
two new tabs list nothing and saving a section or paper is refused (`key`). `db:check`
sees no new table; `/rest/v1/rpc/content_current?p_kind=section` answers `200`. **Since
step B students read sections and papers ONLY from here**: the import was done on 7 Oct
2026 (9 of 9 exact). On a NEW project, import `content/fixture.json` (all four kinds)
before deploying, or every section and paper shows as coming soon.

**`20261007000001_game_questions.sql`** (the game questions) must be applied AFTER
`20261003000002`, and BEFORE the code that reads it ships: once the app reads the pools
from here, a project without them has no game questions at all. `db:check` sees no new
table; `/rest/v1/rpc/content_current?p_kind=game` answers `200`. The import was done on
7 Oct 2026 (4 of 4 exact). On a NEW project, import `content/fixture.json` (all five kinds)
before deploying, or every subject's game says it has no questions.

**`20261007000002_game_questions_one_language.sql`** must be applied AFTER
`20261007000001`; the code reads either shape, so it can ship before or after. Afterwards
every game pool's current version holds one text per question:
`select key, version from content_items where kind = 'game'` shows version 2 for each.

**`20261013000002_error_review.sql`** (the Errors page) is APPLIED to the live project (13 Oct
2026, checked: `db:check` lists `client_error_fixes` and all three functions refuse the
publishable key). On a new project it must be applied AFTER
`20261001000001` and `20261002000001`; the code can ship before or after it. Without it
`/admin/errors` says it could not load and the badge leaves errors out (nothing else
changes). Afterwards `db:check` lists `client_error_fixes`, and a publishable-key-only call
to `/rest/v1/rpc/admin_client_errors` must be refused.

**`20261026000001_admin_audit_log.sql`** (the audit log) must be applied AFTER every earlier
migration, in ONE run (one transaction), because it redefines 14 admin functions. The code
can ship before or after it: without it `/admin/audit` says it could not load and every admin
action works as before, unlogged. Afterwards `db:check` lists `audit_log`, and a
publishable-key-only call to `/rest/v1/rpc/admin_audit_log` must be refused.

**`20261027000001_study_progress_sync.sql`** (flashcard progress, own cards, stars, the
review log, quiz and paper history) can be applied before or after the code ships, in ONE
run. Without it each of the six pushes fails quietly and the work stays on the phone; once
it lands, the next push uploads everything. Afterwards `db:check` lists the six tables, each
answering `200 []` to the publishable key.

**`20261027000002_fsrs_memory.sql`** (FSRS's `stability` and `difficulty` on
`card_reviews`) must be applied AFTER `20261027000001`. Apply it BEFORE the FSRS code
deploys: the app sends both columns on every card, so until it lands the
`card_reviews` push fails (quietly, nothing lost; it uploads once applied). `db:check`
cannot see a column; check with a publishable-key
`GET /rest/v1/card_reviews?select=stability&limit=0`, which answers `200` once it
exists and `400` before.

**`20261103000001_daily_targets_and_gift.sql`** (daily targets, the streak rule, the gift) must be
applied AFTER `20261013000001` and `20260916000004`, and BEFORE the code ships: without it the push
of today's row is refused, so that day's progress stays on the phone until it lands. `db:check`
cannot see a column; a publishable-key `GET /rest/v1/daily_activity?select=streak_day&limit=0`
answers `200` once it exists and `400` before.

**`20261103000002_simulation_attempts.sql`** (the Simulation's saved attempts) can ship
before or after the code. Without it each push of an attempt fails quietly and the attempt
stays on the phone; once it lands, the next push uploads it. Afterwards `db:check` lists
`simulation_attempts`, answering `200 []` to the publishable key.

**`20261102000001_friend_invite.sql`** (the friend invite link) must be applied AFTER
`20261013000001` and BEFORE the code ships: without it every invite link says it could
not open. It adds no table, so `db:check` cannot see it. A publishable-key-only call to
`/rest/v1/rpc/friend_invite` answers `PGRST202` while it is missing and `42501` once it
exists.

**`20261013000001_friends.sql`** (Streak with Friends) is APPLIED to the live project
(13 Oct 2026, checked: `db:check` passes, and all five functions plus the helpers refuse
the publishable key). On a new project it must be applied BEFORE the code that uses it
ships: without it the friends list says it could not load, search fails and
the menu badge stays empty (nothing else breaks). Apply it in ONE run (it is one
transaction). Afterwards `db:check` lists `friendships`, and a publishable-key-only call
to `/rest/v1/rpc/search_students` must be refused. Then try it with two real Google
accounts: search, request, accept, both finish the goal, remove.

**The Game feature needs BOTH its migrations applied before db:check passes** —
`20260913000001_competitions.sql` and
`20260914000001_competition_answers_and_work.sql` — plus
`20260916000002_competition_work_per_question.sql` AND its fix
`20260916000003_competition_work_count_fix.sql` for photos, which db:check
cannot detect (policies only) — by hand, in the SQL editor.
Without the first, the check reports 2 of 10 tables missing and /game's browse
list shows its failed state while the rest of the page keeps working. Without the
second it names the two missing COLUMNS, and a new competition saves locally but
cannot be SHARED — the insert names `creator_answers` and is refused, so the hub
labels the row "Not shared yet", which is true, and `share-pending.ts` retries it
once the migration lands.

`db:check` deliberately has NO storage-bucket check. The publishable key cannot
tell a real bucket from an invented one — `POST /storage/v1/object/list` answers
`200 []` for both, measured — and a silent false pass is worse than no check at
all. The two columns come from the same migration as the bucket and already
answer whether it ran.

and check `dist/assets/` still contains a separate Supabase chunk, for the same
reason `math-field-panel-*.js` is checked — a static import undoes the lazy
boundary silently and only the bundle output shows it. The chunk is named after
the package's own dist folder (`dist-*.js`, ~54KB gzip); confirm it holds
`GoTrueClient` and that the entry chunk's only "supabase" hit is the inlined env
values.

**For anything touching auth, none of the above proves the thing that matters.**
Typecheck and lint cannot see a swallowed OAuth callback, a guest reaching the
mentor, or a React Compiler crash that only fires for a null `authUser`. Exercise
these against a running dev server:

```bash
# The gate. A guest must never reach the endpoint, and an unauthenticated
# caller must be refused even with a valid-looking token.
curl -i -X POST localhost:5173/api/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","text":"hi"}],"lang":"en"}'      # expect 401
```

Then in a browser: a fresh profile shows the intro, then Home, and downloads NO
Supabase chunk; a reload stays on Home; the chat
FAB raises the prompt and fires no `/api/chat` request; a typed `/roadmap` shows
the locked panel **with the navigation still on screen**; and loading with
`?code=x` in the URL DOES pull the SDK (that last one is the callback-swallowing
trap — see the auth section).

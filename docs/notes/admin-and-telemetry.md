# Admin area, telemetry and safety

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Phase 0: real data everywhere, telemetry, account deletion, photo reports (1 Oct 2026)

The user asked what would make BrachNha "real" before real students. The answer
they approved (the leaderboard explicitly EXCLUDED, they want it kept as is):
replace every remaining demo screen with the student's own data, add error and
usage reporting, and add the two safety pieces an app for minors needs.

### No more invented numbers (except the leaderboard)

(Streak with Friends was the other exception until 13 Oct 2026; it is real now.)

- **Grade Prediction** — `features/grade-prediction/real-prediction.ts`,
  `buildRealPrediction(input, today)`, a TOTAL object (the React Compiler rule
  from `summary.ts`). Per-subject scores come from `buildProgressSummary()`, so
  Progress and Prediction cannot disagree. Inputs: all-time accuracy from
  `contentLog`, the last 10 exam + past-paper percentages, days studied in
  the last 14, mean subject trend. `computeGradePrediction` only rows subjects
  that HAVE a score (a missing subject read as 0% predicted an F in a subject
  not yet started).
  - **The score is how WELL the student answers (27 Oct 2026, the user's
    call).** `utils/gradeProbability.ts`: quiz accuracy and the exam average,
    weighted 30:35 (a missing one is left out), then two capped NUDGES in
    points: trend ±5 (a quarter of the change) and consistency ±3 (half the
    days is neutral). Before, all five inputs were averaged together, a flat
    trend counted as 50, and finished-sections-over-published-sections was
    15% of the grade, so a beginner answering 85% right was predicted an E,
    and every lesson the team published lowered every student's grade.
    Lesson completion is no longer an input at all, and `buildRealPrediction`
    no longer takes the manifest or `completedSessions`.
  - **There is an F** (below 50%, a fail): the last row of `GRADE_BANDS`, so the
    subject grades, the chance bars and `compareToTarget` ("below your target")
    all have it. It used to floor at E because the survey's TARGET grades stop at
    E; nobody aims for F, so the survey still offers A to E.
  - **The chance bars are a normal spread** (8 points either side of the score),
    each grade getting the share inside its band. They used to be closeness to
    each band's midpoint, which broke once F (0 to 50, midpoint 25) became a band:
    a score of 45 came out 100% E.
  - `ready` needs 20 scored answers or 1 exam/paper; before that the page and
    the Home widget show how many answers are left (`prediction-empty.tsx`).
  - The trend chart is the COMPOSITE READINESS SCORE re-computed as of the end
    of each of the last 4 weeks, from the logs, with nothing stored. It charted
    one grade's probability first, which read backwards whenever that grade was
    a low one (a falling E line is good news). Hidden below 2 points.
  - The simulate buttons, `PredictionUpdatedBanner` and `PreviewTag` are gone.
    Recommended actions are real study-feed items, weakest subject first.
- **Progress** — Focus Areas, Study Activity and Study tips; see its section.
- **Streak page** and **Game hero** — see their sections.

### Error reports and usage events — `lib/telemetry.ts`

OUR OWN SUPABASE, no vendor (the user's call). `20261001000001_telemetry.sql`:
`client_errors` and `app_events`, RLS on with NO client policies, written only
by two `security definer` functions. The team reads errors on `/admin/errors` (see
"Errors page" below) and events on the `/admin` dashboard; the SQL editor queries in
`supabase/README.md` still work.

- `reportError(err, context)` — production only, deduped by message, at most
  10 per page load. `log_client_error` is granted to `anon` TOO (a guest's crash
  matters) and caps 20/hour per user, 200/hour across all guests, dropping the
  excess QUIETLY rather than raising. Wired into `ErrorBoundary` (with the
  component stack) and `installGlobalErrorHandlers()` in `main.tsx` (window
  `error` carrying an `error` object, and `unhandledrejection`).
- `track(name, props)` — signed-in only. `log_event` checks an ALLOW-LIST that
  mirrors the `AppEvent` union; change both together. `app_open` is accepted
  once per student per Phnom Penh day, so its count IS daily active users and
  day-7 return is a query over it. Sent from `AppShell` (app_open), login
  (sign_up), survey (survey_done), section/lesson finish (lesson_done),
  quiz-screen (quiz_done), review-session (flashcards_done), exam-view and
  paper-screen (exam_done), game-create/-play (battle_done), and the chat send
  (kruai_question).
- **Never sent:** answers, KruAI text, email. `pages/privacy.tsx` says so and is
  part of any change here.
- `__APP_VERSION__` is `define`d in `vite.config.ts` from Vercel's
  `VERCEL_GIT_COMMIT_SHA` ("dev" locally) so a report names its build.
- The lazy SDK boundary holds: telemetry reaches the client through
  `getSupabase()`. An error report downloads the SDK only when an error happens.

### Delete my account — `lib/account-deletion.ts`

Profile, signed-in only, below Logout: a quiet text button, a confirm box that
says what is removed, and a native checkbox that must be ticked. ORDER MATTERS:
(1) collect every competition id the student is in, from the server AND the
store, while those rows still exist, and which of them they CREATED; (2)
remove the photos through the Storage API (`clearPhotoFolders`; storage has no
FK and Supabase refuses SQL deletes on it): their own folder in a competition
they joined, and the WHOLE folder of one they created, since it is deleted with
them and every joiner's attempt with it (`"competition work: creator delete"`,
`20261002000003`, is what lets them). STOP on any failure so no photo is
orphaned; (3) `delete_my_account()` deletes `auth.users` where id =
`auth.uid()`, and every table cascades. Then sign out and `logout()`. Not
verified against a real account: try it on a TEST Google account first.

### Report a photo — `lib/photo-reports.ts`

A flag on each thumbnail of the OPPONENT's working (two taps, a sibling of the
link, like delete). `photo_reports` accepts a report only from someone in that
competition, about a photo in its folder that is not their own; a duplicate is
success. NOTHING is hidden automatically for anyone else (one report hiding a
photo would let any student hide a classmate's work); the reporter's own view
hides it for that visit.

**The team reviews them at `/admin/reports`** (`pages/admin-reports.tsx`,
`lib/admin-reports.ts`, migration `20261001000003_report_review.sql`). In no
nav list and deliberately NOT in `routeModules`, which is also the idle
prefetch list: the page has its own lazy chunk that students never download.
ADMIN IS DECIDED IN THE DATABASE: `user_roles` (it replaced `app_admins`, see
"Roles and the admin area" below) and `is_app_admin()`, which every `admin_*` function and
two extra Storage policies (admin read, admin delete on `competition-work`)
check. The page is only a screen over them. Keep and Delete RECORD the decision
on the report rows (`resolution` / `resolved_at` / `resolved_by`) rather than
deleting them. Delete removes the file FIRST and closes the reports only if
that worked; and because Storage answers a policy-blocked delete with success
and nothing removed, `deletePhoto` treats "a file the list could sign, but
nothing was removed" as a failure. `db:check` sees `user_roles` but not the
functions or policies.

**An admin account sees a "Team → Admin" row in the menu** (drawer and
desktop sidebar, `components/shell/sidebar-nav.tsx`), with a badge counting
open reports; everyone else sees nothing, not even a greyed row. The answer
comes from `lib/admin-status.ts`, which asks `is_app_admin()` once per signed-in
user id (a MODULE shared by both menus, not a store field: a persisted `true`
would outlive being removed from the list) and never compares an email in the
app. The review page reports its loaded count and every Keep/Delete back through
`setOpenReports()`, so the badge follows without another request. This is the
user's "option 2": the ordinary student app plus an admin-only extra, so the
same account can still be used to test the app as a student.

### Roles and the admin area (2 Oct 2026, Step A of `docs/plans/admin-roles.md`)

The single photo-report page grew into a small admin area: **`/admin`** (the
dashboard and the tools), **`/admin/students`** and the existing
**`/admin/reports`**. Steps B (KruAI limits and pausing) and C (announcements
and mistake reports) followed; see their own sections below.

**`user_roles` REPLACED `app_admins`** (`20261002000001_roles_and_admin_tools.sql`).
One row per (student, role); the roles are `admin` and `owner` (see THE OWNER ROLE
below), and a Teacher role later
is one wider CHECK plus one member in `AppRole` (`types/database.ts`). No client
policies. `has_role(role)` answers for the CALLER only, and `is_app_admin()`
was redefined as `has_role('admin')` with the same name and signature, so
`admin_photo_reports()`, `admin_resolve_photo()` and both admin Storage
policies needed no edit. **The migration's order is load-bearing**: create
`user_roles`, copy the `app_admins` rows, redefine `is_app_admin()`, THEN drop
`app_admins`, all in one `begin … commit`.

**Five admin functions, each SECURITY DEFINER, raising 42501 for a non-admin,
granted to `authenticated` only:**

| function | what it does | refuses (with `hint`) |
| --- | --- | --- |
| `admin_set_role(user, role, grant)` | add or remove the `admin` role | anyone but the owner (`owner_only`) |
| `admin_students(search, limit)` | real (non-anonymous) students, most recently active first, max 50; name/email search with `%` and `_` escaped | |
| `admin_user_competition_ids(user)` | the competitions a student is in, and whether they CREATED each | the same accounts as the delete, so nothing is touched first |
| `admin_delete_user(user)` | deletes the auth user; every table cascades | own account (`self`), the owner (`owner`), an admin (`admin`) |
| `admin_dashboard()` | one jsonb for the whole `/admin` page (below) | |

`lib/admin-tools.ts` maps each `hint` to an `AdminFail` the screen can say.
**Nothing in the app is the security**: the client only decides what to OFFER.

**The dashboard is one call**, so every number on the page comes from the same
moment. Daily active = distinct `app_open` per Phnom Penh day (`log_event`
accepts it once per student per day). "Came back in week 2" = of the students
who joined in a week, how many opened the app 7 to 13 days after joining, for
the last 4 COMPLETE cohorts. `tracked_since` (the first event ever recorded) is
what stops a 0 meaning "nothing was counting": the chart's caption says so, and a
cohort whose second week began before tracking reads "Not measured yet", never
0%. Students = non-anonymous accounts, so the ~205 harness accounts are left out.
`toDashboard()` checks the jsonb field by field rather than trusting it.

**Deleting a CREATOR clears the joiners' photos too, from either path.** A
creator's competitions are deleted with them, and every joiner's attempt with
those, so the JOINERS' photos would be left with nothing pointing at them.
`clearPhotoFolders(user, folders)` in `lib/account-deletion.ts` is shared by
the admin delete and "Delete my account": a created competition's whole folder
goes (`deleteCompetitionFolder`), a joined one's only the student's own folder.
Self-deletion first could NOT do this (a student reached only their own
folder), and `20261002000003_creator_photo_cleanup.sql` closed that: the
creator of a competition may delete any file in its folder. **That is not a
new power**: a creator could already delete the whole competition
(`"competitions: delete own"`), wiping every joiner's attempt, and could already
see every joiner's photos in it. Joiners still cannot touch each other's or the
creator's. Verified against the REAL read and delete-own policies in PGlite (a
creator clears all 5 files of their competition, only their own in one they
joined, a joiner only theirs, a stranger nothing; without the policy the creator
cleared 1 of 5), and in the browser: with the policy refused, the account is
NOT deleted and the error shows. `deleteMyFolder` became
`deleteUserFolder` and now treats **fewer files removed than listed as a
failure**, because Storage answers a policy-blocked delete with success and an
empty list. Photos first, then `admin_delete_user`; any failure stops with
nothing deleted.

**`AdminGate`** (`features/admin/components/admin-gate.tsx`) is the frame every
admin page shares: the scroller, the title, an optional "← Admin" back link,
and checking / "This page is for the BrachNha team." / the page. Its children
MOUNT ONLY ONCE ACCESS IS CONFIRMED, so a page's own loading never runs for a
student. `pages/admin-reports.tsx` now uses it instead of its own copy.

Things a later edit could undo:

- **All three admin pages are lazy and NOT in `routeModules`** (the idle
  prefetch list). Their code is ~25KB gzipped across `admin-*.js` chunks;
  `features/admin/copy.ts` lands in `admin-gate-*.js`. The entry chunk only has
  the menu row's label.
- **The menu row is now "Admin" → `/admin`**, lit by prefix on its sub-pages,
  still badged with open photo reports from `lib/admin-status.ts`.
- **The hub's two tool links render OUTSIDE the dashboard's load**, so
  `/admin/reports` stays one tap from the menu even if `admin_dashboard()`
  fails (for example before the migration is applied).
- **Students page actions**: your own row offers nothing (Profile is where you
  change yourself); an admin's row offers no Delete until the role is removed;
  role changes take two taps; delete takes two taps plus a native tick box, like
  Profile's `delete-account.tsx`. The search is debounced (300ms) and the old
  rows stay, dimmed, while a new search loads.
- **The privacy page says the team can see** name, email, joined / last seen,
  study numbers and KruAI usage. That list mirrors `admin_students()`'s columns:
  widen one, widen the other.

**Verified:** the migration ran twice against an in-memory Postgres (PGlite)
with stand-in `auth.users` and the referenced tables: 57 checks covering the
row carry-over, every refusal, the escaping, the created flag, the cascades and
the dashboard's shape; `anon` was refused every function and `authenticated`
could not read `user_roles`. Then 98 browser checks at 1280/390/320, both themes
and Khmer, with the Supabase REST and Storage calls faked through Playwright
`route` (the access gate as guest, student and admin; the debounced search; the
role confirm; the delete order and the folders it cleared; the refusal
messages; no sideways scroll; no page error). The migration was then applied to
the live project: `db:check` passes and every admin function refuses the
publishable key.

**THE OWNER ROLE (`20261002000002_owner_role.sql`, same day).** Step A first
made every admin equal, and testing on the real project found two holes:

- any admin could remove any other admin and then delete their account, so a
  second admin could take the app over;
- Profile's "Delete my account" never looked at roles. The only admin deleted
  themselves there, the role went with the account (cascade), and the team was
  left with NO admin, fixable only in the SQL editor. The old "never remove the
  last admin" rule only guarded the admin page, so it was never real.

The fix is one role above admin, the user's call:

- **The owner is an admin everywhere** (`is_app_admin()` is true for `admin` OR
  `owner`), and **the ONLY one who can make or remove admins**
  (`admin_set_role` raises 42501 with hint `owner_only` for anyone else, and
  only touches the `admin` role).
- **The owner role is set in the SQL editor only.** Nothing in the app grants
  or removes it.
- **An owner's account cannot be deleted from the app**: `admin_delete_user`
  refuses it (hint `owner`), and `delete_my_account()` now refuses the owner
  too. An ordinary admin can still delete their own account on Profile; with an
  owner always there, the team can no longer end up with nobody in charge.
- **The last-admin rule is GONE.** The owner manages admins and is an admin by
  definition, so it was redundant, and it would have stopped the owner removing
  the last ordinary admin.
- **Refusals come BEFORE any photo is removed.** `admin_user_competition_ids`,
  the admin delete's first call, refuses the same accounts with the same hints,
  and `deleteMyAccount()` asks `has_role('owner')` before step 1. The database
  functions at the end are still the real gate.
- **The constraint swap drops every CHECK on `user_roles`** rather than one by
  name, so a differently named old constraint cannot survive and keep refusing
  `'owner'`.
- `admin_students()` gained `is_owner`, which changes its type, so the
  migration drops and re-creates it (and re-grants) inside its transaction.

On screen: `lib/admin-status.ts` also answers `isOwner` (asked once, after
`isAdmin`, through `has_role('owner')` in `lib/admin-reports.ts`). The Students
page offers Make/Remove admin to the owner only, shows an **Owner** chip, gives
the owner's row no actions at all, and tells an ordinary admin "Only the owner
can …" where a button would be. Profile shows the owner "This is the owner
account, so it cannot be deleted from the app." instead of the delete button.

Verified: both migrations in order (000002 twice) against PGlite, 30 checks
covering each refusal, the cascades, the grants after the drop/create and the
single remaining CHECK; then 22 browser checks of the owner's and an admin's
views and of Profile, in English and Khmer.


**The hub explains itself the way Progress does (3 Oct 2026, the user's request:
"hard to understand what is what").** Every card title on `/admin` has an ⓘ, and
each of the six numbers and each activity name in "What students did" is itself the
trigger, opening on hover with a mouse and on tap with a finger
(`components/ui/info-tip.tsx`). The six tiles' explanations replaced the one
paragraph under them. `TitleWithTip` moved from `features/progress/components/` to
`components/title-with-tip.tsx` now that two features use it. The sentences are in
`features/admin/copy.ts` (`tileTips`, `eventTips`, `dailyTip`, …) and are claims
about what the SQL counts: change the counting, change the sentence, in both
languages. The Content pages have them too (see their section); the other admin pages
do not yet.

### KruAI limits and pausing (2 Oct 2026, Step B of `docs/plans/admin-roles.md`)

`/admin/kruai` (`features/admin/components/kruai-view.tsx`, migration
`20261002000004_kruai_controls.sql`): today's units against the whole-app limit,
a 14-day bar chart with the limit as a dashed line, the 10 heaviest students
today, the two daily limits, and the paused students with a Resume button. The
Students page gained Pause / Resume KruAI and a "KruAI paused" chip.

**The limits moved from constants in `kruai_take` into `app_settings`.**
`kruai_limits()` is the ONE reader (not granted to anyone; only the security
definer functions call it): a missing row or a non-number falls back to 30 /
300, and any value is clamped to the setter's bounds, so a row edited by hand
can make the limits odd but can never make every question fail. They are still
NOT a parameter of `kruai_take`. `kruai_take` gained a fifth column,
`user_limit`, which changed its return type, so the migration drops and creates
it inside one transaction.

**`USER_DAILY_UNITS` is GONE from the handler.** "Left today" is now
`quota.userLimit - quota.userUnits`, from the limit `kruai_take` enforced, so the
count a student sees can no longer drift from the limit. Without the migration
`user_limit` is absent and `server/kruai-quota.ts` falls back to
`DEFAULT_USER_DAILY_UNITS` (30), so code and migration ship in either order.

**Who may do what:**

| action | who | refusal (`hint`) |
| --- | --- | --- |
| see `/admin/kruai` | any admin | |
| change the limits (`admin_set_kruai_limits`) | **the owner only** | `owner_only`; out of 1–200 / 1–10000: `range` |
| pause a student (`admin_set_kruai_block`) | any admin | yourself `self`, the owner `owner`, an admin `admin` |
| resume | any admin, anyone | never refused |

Limits are owner-only because they decide how fast the prepaid credit can be
spent; this was my call when building it, beyond the plan's "admin". Pausing is
moderation, so every admin has it, but admins cannot silence each other or the
owner.

**A paused student gets a 403** with "⏸️ KruAI is paused for this account.
Contact the BrachNha team…" (both languages, sibling voice) and
`X-KruAI-Limit: blocked`, no "left" header. `chat-overlay.tsx` needed no change:
a 4xx that is not a busy 429 is already marked `failed: "final"`, so there is no
Try again. Refused in dev too, since unlike a failed check it is a definite
answer. **Curated answers still come** (`server/chat-cache.ts` runs before the
quota and costs nothing): pausing stops model use, which is what costs money.

**The page re-asks after every save or resume** (`version` bump) and keeps the
old numbers on screen while it does. The limit form checks whole numbers inside
`KRUAI_LIMIT_BOUNDS` before sending; the database checks again. Units, not
dollars: the page says the cost in dollars is only in the server logs.

**The hub's tool row has three cards now.** The third (KruAI) spans both columns
until `xl`, where three fit across, so the grid never holes.

**Verified:** the migration after `20260929000001`, `…0001` and `…0002`, applied
twice, against PGlite: 43 checks (old 4-column `kruai_take` replaced, seeded and
saved limits enforced, owner-only and range refusals, junk / out-of-range /
missing settings rows, paused refusal charging nothing, reason trimming and the
200-character cut, overview shape, `admin_students.kruai_blocked`, grants, RLS
hiding both tables). The REAL `handleChat` through `ssrLoadModule` against a fake
Supabase (JWKS + scripted `kruai_take`, ES256 token) and a fake model: 10 checks
(paused 403 in both languages with no model call, "left" from a 50 limit, the
photo refusal with 2 left, the fallback to 30 with no `user_limit`). Browser,
Supabase faked through Playwright `route`: 34 checks at 1280 / 390 / 320 dark
Khmer (owner save with invalid-value refusal and re-ask, admin read-only, resume,
pause with trimmed reason and chip, no Pause on an admin row, no sideways
scroll, no page error).


### Announcements and mistake reports (2 Oct 2026, Step C of `docs/plans/admin-roles.md`)

Migration `20261002000005_announcements_and_content_reports.sql`. The last
step of the admin plan.

**Announcements.** An admin writes a short message on `/admin/announcements`
(Khmer required, English optional, 300 characters each, a tone, an optional
link inside the app, an end of 1 / 7 / 30 days or none), sees a live preview
drawn exactly like the real banner, and publishes. Every student, guests
included, sees it under the app bar (`components/shell/announcement-banner.tsx`,
mounted in `AppShell` behind the same `!hideChrome` as the bar, so never in a
lesson, an exam or the onboarding lock). One at a time: the newest live one the
device has not dismissed.

- **A PLAIN FETCH, NOT THE SDK** (`lib/announcements.ts`): the banner is on
  every screen and the SDK must stay out of the entry chunk and away from
  guests. It sends only the publishable key (`apikey`); the table's read policy
  returns LIVE rows to `anon` and `authenticated`. `lib/supabase.ts` exports
  `supabaseRestUrl` / `supabasePublishableKey` for this one caller. Once per
  page load, cached in the module. Verified: a guest's browser never requests
  the SDK.
- **Dismissal is a device fact** (`localStorage["brachnha-announcements"]`, last
  50 ids), the `lib/intro-seen.ts` reasoning.
- **A link must be an app path, checked twice**: a CHECK on the column and in
  the publish function (`^/[A-Za-z0-9/_?=&.%#-]*$`, not `//`, max 200), and
  `isAppPath()` on the client, which renders a bad one as no link at all.
  `//evil.com` and `/\evil.com` (both read as another site by browsers) are
  refused at every layer.
- **The publish form refuses an em dash** and asks for a comma or a full stop:
  an announcement is something every student reads, so the app-wide rule
  applies. The database is not asked to enforce it.
- **Writes are FUNCTIONS, not table policies** (`admin_publish_announcement`,
  `admin_end_announcement`, plus `admin_announcements` to list all): a
  deviation from the plan, so the database records who published and every
  refusal carries a hint (`body`, `link`, `ends`). End now sets `active =
  false` and keeps the row, so the list shows what was said and when.

**Mistake reports.** After answering a question, a signed-in student sees a
quiet **រាយការណ៍កំហុស** (`components/report-mistake.tsx`, Khmer-only): four
kinds, an optional note, Send, then a thank-you. Placed on section quizzes
(`section-detail.tsx`), the practice quiz runner (`quiz-runner.tsx`) and the
past-paper review (`past-paper-results.tsx`, which now takes `paperKey`). Not on
`quiz-results.tsx`: the runner already offers it on every question. Absent for a
guest, when unconfigured, and for a ref that would fail the database's check.

- **A content ref names a question without copying it**
  (`utils/content-ref.ts`): `section:{id}#{step}-{index}`,
  `quiz:{key}#{index}`, `paper:{key}#{questionId}`. Built and parsed in one
  file; `REF_PATTERN` mirrors the column CHECK. **Verified: all 210 real
  questions produce a valid ref that resolves back to the same question.**
- **Written ONLY through `report_content()`**, never a client insert, because
  it caps a student at 30 a day (`too_many`) and a policy cannot count a
  student's own rows without querying its own table (the 20260916000003
  recursion trap). A repeat report on a question the student already has open
  is success; a report the team closed can be reopened by its reporter.
- **`/admin/mistakes`** groups open reports by question (most reported first),
  and `features/admin/content-ref.ts` resolves each ref against
  `SECTION_CONTENT`, `PRACTICE_QUIZZES` and `PAST_PAPERS` (with
  `Object.hasOwn`; a ref is student input), so the card shows the question as
  the app has it TODAY: prompt, options with the marked one, explanation, a
  link to it, and the students' notes. A ref that no longer resolves says so.
  "Fixed" and "Not a mistake" close every open report on that question. **The
  fix itself is a code edit** that goes through `check:quiz`. (No longer: since
  the content moved into the database, quiz, section and paper reports resolve
  against the PUBLISHED copies and carry an Edit link to `/admin/content`. See
  "Step 1b" and "Step B" near the end of this file.)
- **The resolver imports the whole question corpus**, so it is reached only
  from the lazy `admin-mistakes` chunk. The student button imports
  `utils/content-ref.ts` alone.

**The menu badge is photo reports PLUS questions with open mistake reports**
(`lib/admin-status.ts` `openMistakes`). The count lives in `lib/admin-reports.ts`
(`countOpenMistakes`), NOT `lib/admin-tools.ts`: admin-status is in every
student's bundle, and admin-tools imports the account-deletion code.

**The hub has five tool cards**; Students spans two columns at `md` and `xl`, so
neither grid holes.

**Verified:** the migration after `…0001` and `…0002`, applied twice, against
PGlite: 54 checks (publishing and each refusal including six hostile links,
`anon` reading live rows only, scheduled and expired hidden, guest insert and
student update refused, End now, the admin list; reports: refs and kinds
checked, repeat and reopen, grouping with non-empty notes only, resolve, own
rows only, direct insert refused, the daily cap, grants, the account cascade).
Every real question's ref through the real modules: 210 of 210, and 12 hostile
or stale refs return null. Browser, Supabase faked through Playwright `route`:
46 checks at 390 / 1280 / 320 dark Khmer (guest banner with no SDK request,
English text, the `//evil.com` link not rendered, dismissal kept across a
reload, no banner in a lesson, no button for a guest, a section report with the
right ref and trimmed note, the quiz runner's button, the hub's five tools and
the badge, publishing with the em-dash and bad-link refusals, End now, the
mistakes card and Fixed, no sideways scroll, no page error). The entry chunk is
about 182KB gzip, with no SDK, KaTeX or question corpus.


### Errors page (13 Oct 2026)

`/admin/errors` (`features/admin/components/errors-view.tsx`, migration
`20261013000002_error_review.sql`). `client_errors` had been filling since Phase 0, and the
hub showed its top 20 messages of 7 days, but nobody could close one or notice a new one
without opening the hub. The user chose this over Sentry, so no student data leaves Supabase.

- **One card per MESSAGE**, the dashboard's own grouping, over the last 30 days (at most 100):
  times, last 7 days, students (distinct signed-in) and guest reports, first and last seen.
  **Nobody is named**: a count says how bad it is.
- **"Fixed" is a TIMESTAMP, not a flag.** `client_error_fixes` (message, `fixed_at`,
  `fixed_by`; RLS, no client policies) records when it was marked. An error is OPEN if it
  happened after that, or was never marked, so a fix that did not work, or a bug that comes
  back, reopens itself with a "Back again" chip and "happened N more times since". Marking
  again moves the stamp.
- **Details** (folded): pages (top 5), app version, browser, the stack, all of the LATEST
  occurrence, plus "Copy for the developer", one text block. The stack is the minified
  build's; no source-map decoding (deliberately skipped).
- A 14-day bar chart (errors and students per day, Phnom Penh days).
- **The menu badge adds open errors** to photo and mistake reports (`admin_open_client_errors()`,
  the same rule and window as the page's `open`, so the two cannot disagree; in
  `lib/admin-reports.ts` for the reason `countOpenMistakes` is). The page reports its count
  back with `setOpenErrors()`, so a fix moves the badge with no second request.
- **The hub has seven tool cards**: Errors spans the whole row below the six (`md:col-span-2
  xl:col-span-3`), so neither grid holes. The dashboard's crash card links "See all errors".
- Three functions, each admin only (42501) and granted to `authenticated` only:
  `admin_client_errors()` (one jsonb, checked by `toErrorReview()`),
  `admin_fix_client_error(message)` (22023 for an empty or over-500 message),
  `admin_open_client_errors()`. An index on `(message, created_at desc)` serves the
  per-message lookups.

**Verified:** PGlite, the migration twice after `20261001000001`: 36 checks (refusals, the
30-day window, counts, guests, latest details, route order, the 14 days, fix and reopen and
re-mark, bad messages, grants, RLS, empty). **PGlite 0.3.x crashes on Windows** on any plpgsql
`raise` ("table index is out of bounds"); use 0.2.17. Browser, Supabase faked through
Playwright `route`: 35 checks at 390, 1280 and 320 dark Khmer (cards, chips, details, copy,
Mark fixed and the badge following it, the hub card spanning, the link, a student refused
with no error or count request, the empty state, no sideways scroll, no page error).

### Audit log (26 Oct 2026)

`/admin/audit` (`features/admin/components/audit-view.tsx`, words in
`features/admin/audit-copy.ts`, migration `20261026000001_admin_audit_log.sql`): who changed
what, and when. The user's decisions: every admin sees it, EXCEPT role changes (make or
remove an admin), which the owner alone sees; it starts empty (no backfill); admin actions
only, never a student's own (Delete my account is not logged).

- **One row per admin action, written INSIDE the action's own function**, in the same
  transaction, so a row exists if and only if the action happened: a refusal or a rollback
  (a stale restore, say) leaves nothing. `audit_log` has RLS and no client policies; the
  writer `admin_audit()` is revoked from every client role; the reader
  `admin_audit_log(p_before, p_limit)` is admin only, newest first, at most 200 a call,
  paged by id, and filters the role rows out for anyone but the owner.
- **The 14 functions were COPIED BY SCRIPT**, verbatim from the migration that last defined
  each, with only the `perform public.admin_audit(...)` call inserted at an exact anchor
  (the generator refused any anchor found 0 or 2+ times). `create or replace` keeps their
  grants. **A later migration that redefines any of them must keep that call**, or the action
  silently stops being logged. They are: `admin_set_role`, `admin_delete_user`,
  `admin_set_kruai_limits`, `admin_set_kruai_block`, `admin_publish_announcement`,
  `admin_end_announcement`, `admin_resolve_photo`, `admin_resolve_content`,
  `admin_fix_client_error`, `admin_publish_content`, `admin_unpublish_content`,
  `admin_restore_content_version`, `admin_discard_content_draft`, `admin_import_content`.
- **Logged only when something changed**: granting a role someone has, resuming KruAI for
  someone not paused, ending a missing announcement or closing reports already closed log
  nothing. A delete is logged BEFORE the delete runs, while the name still exists.
- **Names are COPIED onto the row** (`actor_name`, `target_label`), so a deleted student is
  still named, and `actor_id` goes null if the admin's own account goes. The privacy page
  says so in both languages. Limits record `from` and `to`; a pause its reason; content its
  kind, key and version; a mistake report its ref and how many reports closed.
- **Not logged, deliberately: draft saves** (frequent, never seen by students; the draft
  keeps `updated_by`). An import is ONE row with the item count.
- **The page**: sentences per action in both languages (`{a}`/`{t}`/`{c}`/`{n}` templates,
  names bold, typed `satisfies Record<AuditAction, string>`), grouped by the admin's own day,
  filter chips by kind of change and a "Who" select, both over what is loaded (no request),
  Show older 100 at a time. A content or mistake row links to its editor; content is named
  through `slotFor()`. `AdminGate` gained an optional `kicker` ("Administration history").
- **The hub has eight tool cards**: none spans at md (four rows of 2); at xl Errors spans two
  columns beside Audit log.

**Verified:** PGlite 0.2.17, all 26 migrations in order and this one twice: 58 checks (each
action logged with the right actor, target, label and details; each refusal and each no-op
logging nothing; a stale restore's row rolled back; a deleted student's name kept; owner sees
role rows and an admin does not; paging and the 200 cap; a student, no session and `anon`
refused; `authenticated` cannot call the writer, insert, or read the table directly). Browser,
Supabase faked through Playwright `route`: 31 checks at 1280 owner, 390 admin and 320 dark
Khmer (every sentence and detail line, bold names, the Open link, both filters, Show older
with the right cursor, the end line, the hub grid at xl and md, the owner-only note, no Khmer
numerals, empty state, a student refused with no log request, no sideways scroll, no page
error).

## The error log is held down (3 Nov 2026, `20261103000008`)

Rows were never deleted, and a script with no account could write 200 an hour. `log_client_error` now
also stops at **300 a day from guests and 2000 a day from everyone**, and over a limit it still drops the
call quietly. **Rows older than 45 days are deleted** on about 1 report in 50, and Admin → Errors reads at
most 30 days back. There is no scheduled job, so no extension is needed, and the log only needs cleaning
while it is being written to.

- **Guests have their own smaller limit**, so a flood with no account cannot use up the room signed-in
  students' errors need.
- **Worst case:** a script with no account can hold about 70 MB (300 × 45 days × 5 KB).
- **A crash hitting a whole class can reach 2000 in a day.** Later reports that day are lost, but the first
  2000 already show the problem. Raise `everyone_day` if real numbers ever get close.
- **`app_events` has no cleanup yet.** It is limited to 500 a day per signed-in student.

**Verified:** PGlite 0.2.17, as `anon` and `authenticated`: 41 checks across the three fixes in this migration.

**Guests keep reporting errors (6 Nov 2026, the user's call).** A security audit noted that anyone with no
account can still add up to 300 rows a day, which could put misleading messages on Admin → Errors. Requiring
sign-in was offered and declined: guests are a supported and common state, and every crash only guests hit
would become invisible. The protection stays the caps above, plus Admin → Errors counting guest reports
separately on each group, so a flood shows up as guests only.

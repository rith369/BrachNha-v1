# Roles and the admin area

> **Status: Step A DONE (2 Oct 2026, commit `4540f42`), with an OWNER role and
> the creator photo cleanup; its three migrations are applied, and keop1484 is
> the owner. Step B BUILT (2 Oct 2026), not committed yet; its migration
> (20261002000004) is applied on the live project. Step C not started.** Written 1 Oct 2026.
> Steps A, B and C are built in order, one commit each. When a step ships, mark
> it done here.

## Context

You asked whether BrachNha should have a user role and an admin role, and what an admin should control. Your answers:

- **Two roles:** Student and Admin. They are stored so a Teacher role can be added later without redoing anything.
- **Admin powers, all four areas:**
  1. Students
  2. KruAI and cost
  3. Dashboard
  4. Announcements and mistake reports
- **Content:** decide later. Lessons and quizzes stay in the code for now. Admins only *review* reported mistakes; the fix is still made in the code and goes through `check:quiz`.

**What exists today:**

- An `app_admins` table and `is_app_admin()`, from `20261001000003_report_review.sql`. `admin_photo_reports()` was fixed in `20261001000004` and calls `is_app_admin()`.
- One admin screen: `/admin/reports` (photo reports).
- A "Team → Photo reports" menu row, shown only to admins (`lib/admin-status.ts`, `components/shell/sidebar-nav.tsx`).

This plan grows that into a role system and a small admin area.

**The rule throughout:** every admin power is checked IN THE DATABASE (security-definer functions or policies calling `is_app_admin()`). The app's screens are only a view over those functions. A student who opens an admin URL gets nothing back from any of them.

### What changed since this plan was first written (1 Oct)

1. **B and C are no longer blocked.** The other session has committed its work:
   - `chat-handler.ts`: `d0fb895`, `2e1000e` and `a2d497b`;
   - `quiz-results.tsx`: `4be456f`.

   The tree is clean.
   - Step B's handler change is made against the CURRENT file: the `newPhoto` charge and `USER_DAILY_UNITS` at ~line 310.
   - Check `git status` before each step, since that session may still be active.
2. **The new look (neobrutalism, `fc55120`) has landed.** Admin pages use its tokens:
   - cards: `border border-border bg-surface shadow-panel`;
   - neo fills under `text-ink`;
   - flat `bg-brand` buttons that press into their shadow;
   - no gradients, and nothing positioned past its own box.
3. **Dropping `app_admins` is safe only in a set order.** `is_app_admin()` reads that table, so the migration must:
   1. create `user_roles`;
   2. copy the rows across;
   3. REDEFINE `is_app_admin()` on top of `user_roles`;
   4. only then drop `app_admins`.

   All of it goes in one transaction.

   Remaining references to update:
   - `src/types/database.ts` (the `app_admins` table type);
   - `scripts/supabase-check.mjs` (its table list);
   - the comments in `lib/admin-status.ts`, `pages/admin-reports.tsx` and `src/app.tsx`.

**Built in three steps, one commit each: A, then B, then C.** You apply each step's migration in the SQL editor before its real-account checks.

---

## A. Roles, admin hub, Students, Dashboard

> **Built 2 Oct 2026.** As planned, with these differences:
>
> - `admin_students()` also returns level, days active in the last 30 days and
>   KruAI units for the last 7 days. "Last seen" is the latest usage event of
>   any kind, not only `app_open`.
> - `admin_user_competition_ids()` also says whether the student CREATED each
>   competition. For those, the admin delete clears the whole competition
>   folder, since every joiner's attempt is deleted with the creator.
> - "7-day return" is "came back in week 2": opened the app 7 to 13 days after
>   joining, for the last 4 complete weekly cohorts, with cohorts from before
>   tracking began shown as "Not measured yet".
> - The `openMistakes` badge count waits for step C.
>
> **Then an OWNER role (`20261002000002_owner_role.sql`), the user's call after
> testing on the real project.** With admins all equal, one admin could remove
> another and delete their account, and the only admin deleting their own account
> on Profile left the team with no admin. Now:
>
> - the owner is an admin everywhere and the ONLY one who makes or removes admins;
> - the owner role is set in the SQL editor only, never from the app;
> - the owner's account cannot be deleted from the app, by an admin or on Profile;
> - the last-admin rule is gone (the owner always remains).
>
> For steps B and C: anything that changes who may manage the team belongs to
> the owner, not to every admin.

### Migration `20261002000001_roles_and_admin_tools.sql`

**Roles table:**

- `user_roles (user_id → auth.users on delete cascade, role text check (role in ('admin')), granted_by, granted_at, primary key (user_id, role))`.
- RLS on, with no client policies.
- Adding Teacher later means widening the check, nothing more.
- Copy the existing `app_admins` rows into it. Then redefine `is_app_admin()`, and only then drop `app_admins`, all in one transaction. Your admin row carries over.

**Role functions:**

- `has_role(p_role)` reads the CALLER only.
- `is_app_admin()` is redefined as `has_role('admin')`. `lib/admin-status.ts`, `admin_photo_reports()` and both admin Storage policies then keep working unchanged.

**Admin functions** (each `security definer`, raises if `not is_app_admin()`, granted to `authenticated` only):

- `admin_set_role(p_user, p_role, p_grant)`: refuses to remove the LAST admin, so the team cannot lock itself out. **Superseded by the owner role below.**
- `admin_students(p_search, p_limit)`: returns id, display name, email, joined, last seen (latest `app_open`), xp, streak, KruAI units today, and is-admin. Search matches name or email. Limited to 50 rows.
- `admin_user_competition_ids(p_user)`: the folders to clear before a deletion.
- `admin_delete_user(p_user)`:
  - deletes that `auth.users` row, and every table cascades;
  - refuses the caller's own account (use Profile for that) and another admin's account.
- `admin_dashboard()` returns one `jsonb`:
  - active students per day for 30 days;
  - new students per day;
  - totals (all students, active today, active this week);
  - events by name for the last 7 days;
  - 7-day return for the last 4 weekly cohorts;
  - the 20 most frequent crash messages from the last 7 days.

### Client

**Shared admin pieces, in `src/features/admin/`:**

- `copy.ts`: English and Khmer copy, following `lang` like the current `admin-reports.tsx`.
- `admin-gate.tsx`: the checking / not-for-you / admin states, extracted from `pages/admin-reports.tsx` and reused by every admin page.
- `lib/admin-tools.ts`: RPC wrappers using the `Result<T>` pattern from `lib/competitions.ts`.

**Deleting an account as an admin:**

- Generalise `lib/account-deletion.ts` so the photo cleanup takes a user id and a list of competition ids. `deleteMyFolder` is in `lib/competition-photos.ts`.
- An admin can already list and delete any folder through the admin Storage policies.
- Admin delete is then: clear the student's photo folders, then call `admin_delete_user`.

**Pages:**

- **`/admin`**: the hub and dashboard. Stat tiles, a daily-active line chart (Recharts, already in a separate chunk) and an events table. Below that, cards linking to each tool, with counts of open items.
- **`/admin/students`**: a search box and a list.
  - Tap a student to open a detail panel: Make admin or Remove admin.
  - Delete account takes two steps plus a tick box, the same pattern as Profile's `delete-account.tsx`.
  - "Pause KruAI" arrives in step B.
- Routes are added in `src/app.tsx` as lazy imports, like `/admin/reports`. They are kept OUT of `routeModules`, which is also the idle-prefetch list, so students never download them.

**Menu:**

- The Team row becomes **"Admin"**, linking to `/admin`.
- Its badge is the number of open photo reports, plus open mistake reports from step C.
- The badge comes from `lib/admin-status.ts`, extended with an `openMistakes` count.

### Docs

- **Privacy page** (`pages/privacy.tsx`): a new line saying the BrachNha team can see a student's name, email, activity and KruAI usage, to support them and keep the app safe.
- **`supabase/README.md`:** how to add and remove admins.
- **CLAUDE.md / AGENTS.md:** a "Roles and the admin area" section.
- **`report.md`:** an entry for this change.
- **`scripts/supabase-check.mjs`:** `user_roles` replaces `app_admins`.

---

## B. KruAI and cost

> **Built 2 Oct 2026.** As planned, with these differences:
>
> - **Changing the limits is OWNER ONLY** (`owner_only`), since they decide how
>   fast the prepaid credit goes. Pausing is any admin, but an admin cannot
>   pause themselves, another admin or the owner.
> - The limits are read through one helper, `kruai_limits()`, which falls back to
>   30 / 300 and clamps to the bounds, so a hand-edited settings row cannot make
>   every question fail.
> - `admin_students()` gained `kruai_blocked` for the Pause toggle, so it is
>   dropped and re-created in the same migration.
> - A paused student still gets the free curated answers; pausing stops model
>   use, which is what costs money.

### Migration `20261002000004_kruai_controls.sql` (the next free number; 000002 is the owner role, 000003 the creator photo cleanup)

**New tables:**

- `app_settings (key text primary key, value jsonb, updated_by, updated_at)`. RLS on, no client policies. Seeded with `kruai_limits = {"user_daily":30,"app_daily":300}`.
- `kruai_blocks (user_id primary key → auth.users cascade, reason, blocked_by, blocked_at)`. RLS on, no client policies.

**`kruai_take` changes** (`20260929000001_kruai_usage.sql`):

- **Limits** come from `app_settings`, falling back to 30/300 if the row is missing. They are still NEVER a parameter, so a student still cannot choose their own limit.
- **A blocked student** gets `allowed=false, reason='blocked'`.
- **A new `user_limit` column** is returned. Adding a column changes the function's return type, so the migration does `drop function` and then `create`, then re-grants. All of it sits in one `begin … commit`, so production is never without the function.

**New admin functions:**

- `admin_kruai_overview()`: today's total, both limits, totals for the last 14 days, the 10 heaviest students today, and the blocked list.
- `admin_set_kruai_limits(p_user_daily, p_app_daily)`: bounded to 1–200 per student and 1–10000 for the whole app.
- `admin_set_kruai_block(p_user, p_blocked, p_reason)`.

### Server

**`server/kruai-quota.ts`:**

- Reads `user_limit`. Falls back to 30 when it is absent, so the server works with or without the migration applied.
- Maps reason `blocked`.

**`server/chat-handler.ts`** (keep relative imports only):

- The "questions left" count uses the limit returned by the database, not the `USER_DAILY_UNITS` copy. This removes the "change both together" note.
- A blocked student gets a readable 403 in both languages, with no em dash, for example "KruAI is paused for this account. Contact the BrachNha team." It sends no "left" header, and the chat marks it `failed: "final"` (no Try again).

### Client

- **`/admin/kruai`:**
  - today's usage against the whole-app limit;
  - a 14-day bar chart;
  - the top students today;
  - limit inputs with a Save button;
  - the blocked list with Unblock buttons.
- **Students detail panel:** gets a Pause KruAI / Resume KruAI toggle.

**Cost in dollars stays out of scope.** Token counts only exist in the Vercel log line, not the database. The page shows units, and says so.

---

## C. Announcements and mistake reports

### Migration `20261002000005_announcements_and_content_reports.sql` (the next free number)

**`announcements` table:**

- Columns: `id`, `body_km` (required, ≤300 chars), `body_en` (optional), `tone` (info, success or warning), `link` (optional; app paths only, must start with `/`), `starts_at`, `ends_at`, `active`, `created_by`, `created_at`.
- Read policy, for `anon` and `authenticated`: active, and inside its time window.
- Insert and update policies: `is_app_admin()`.

**`content_reports` table:**

- Columns: `id`, `reporter_id` (cascade), `content_ref` (≤120 chars), `kind` (wrong_answer, typo, unclear or other), `note` (≤300 chars), `created_at`, `resolution` (fixed or not_mistake), `resolved_at`, `resolved_by`.
- `unique (reporter_id, content_ref)`.
- Policies: insert-own and select-own.

**`content_ref` format**, which names a question without copying its text:

- `section:biology-3-1-1#0-2` (a section-quiz question)
- `quiz:math-1-1-1#3` (a practice-quiz question)
- `paper:2025-math#<questionId>` (a past-paper question)

**Admin functions:**

- `admin_content_reports()`: open reports grouped by `content_ref`, with the count, the kinds and the 5 newest notes.
- `admin_resolve_content(p_ref, p_resolution)`.

### Client: announcements

- **`lib/announcements.ts`:**
  - **Plain `fetch` to the REST endpoint** with the publishable key, NOT the SDK. Guests still never download the Supabase chunk.
  - Runs once per page load, and caches the result in the module.
- **`components/shell/announcement-banner.tsx`:**
  - Shown under the StatBar on ordinary screens, and hidden in focus mode.
  - Picks the Khmer or English text by `lang`, falling back to Khmer.
  - Can be dismissed per announcement id in `localStorage["brachnha-announcements"]`.
- **`/admin/announcements`:**
  - Write the Khmer text (required) and the English text (optional).
  - Pick a tone, an optional link and an end date.
  - Preview, then publish.
  - The list shows live and past announcements, each with an "End now" button.

### Client: mistake reports

- **`components/report-mistake.tsx`:**
  - A small **រាយការណ៍កំហុស** button shown after a question is answered. Its copy is Khmer-only, like the content screens it sits on.
  - Tapping it opens an inline panel: 4 kind chips, an optional note, and Send. After sending it shows a thank-you state.
  - Hidden for guests and when Supabase is unconfigured.
  - Placed in three spots:
    1. section quiz questions (`section-detail.tsx`);
    2. practice quiz questions (`quiz-runner.tsx` / `quiz-results.tsx`);
    3. past-paper review rows (`past-paper-results.tsx`).
- **`features/admin/content-ref.ts`:** turns a `content_ref` back into the question.
  - It looks the question up in `SECTION_CONTENT`, `PRACTICE_QUIZZES` and `PAST_PAPERS`.
  - So the admin page shows the real prompt, options, marked answer and explanation.
  - It is reached only from the lazy `/admin/mistakes` chunk, so the corpus is never pulled into the entry chunk.
- **`/admin/mistakes`:**
  - A list of reported questions with "Fixed" and "Not a mistake" buttons.
  - The actual fix is a code edit, which then goes through `check:quiz`.

**Badge and docs:**

- The Admin menu badge adds the count of open mistake reports.
- The privacy page mentions announcements and mistake reports.

---

## Rules to keep

- **No em dashes, Latin digits only, no casual English inside Khmer strings.** Product terms stay Latin, per CLAUDE.md.
- **Supabase only via `await getSupabase()`, except the announcement `fetch`.** That fetch deliberately uses no SDK.
- **Admin pages stay lazy and out of `routeModules`.** After every build, check that the entry chunk has no `GoTrueClient`.
- **React and store conventions:** `useShallow` for multi-field selectors, no hand-written `useMemo`, `setState` only from async callbacks, and guards placed above any closure that reads a possibly-undefined value.
- **The neobrutalism tokens,** as listed under "What changed" above.
- **Every migration is applied by hand in the SQL editor.** `db:check` sees the tables but not the functions.
- **Commits contain only this work.** Another session may be editing the repo, so check `git status` and split shared files hunk by hunk.

## Verification (each step)

- **Build checks:** `npx tsc -b`, `npx oxlint`, `npm run check:digits`, `npm run check:quiz`, `npm run build`. Then check that `admin-*` chunks are separate, and that the entry chunk has no `GoTrueClient` and no katex.
- **After you apply each migration:**
  - `npm run db:check`;
  - calling each `admin_*` RPC with only the publishable key is refused;
  - for step B, `kruai_take` still answers a signed-in student, which we see when KruAI replies.
- **Browser,** on my own dev server (port 5191) with the Supabase variables blank:
  - admin pages show "not for you";
  - the Admin menu row is absent for a student;
  - the announcement banner renders from a mocked REST response and the Supabase chunk is never requested;
  - the mistake-report button is hidden for guests;
  - no sideways scroll at 320px in either theme.
- **Real-account checks** (done by you, signed in as admin):
  - make and remove a test admin;
  - search for students;
  - delete a TEST account;
  - change the KruAI limit and see the "questions left" count follow;
  - pause KruAI on a test account and see the message;
  - publish and end an announcement;
  - report a quiz question as a student, then mark it Fixed as admin.

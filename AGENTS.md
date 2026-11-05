# This stack is newer than your training data

Every major dependency here shipped a version that changes APIs, conventions or
file layout relative to what you probably remember. Check the installed version
before you write code against any of them:

| package             | why it will surprise you                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `vite` 8            | Rolldown-based bundler, not esbuild+Rollup. Build options and plugin hooks moved.          |
| `react` 19          | `use()`, ref-as-prop, no `forwardRef` needed, Actions. `React.FC` conventions changed.     |
| React Compiler      | On, via `babel-plugin-react-compiler`. Do NOT hand-add `useMemo`/`useCallback` for perf —  |
|                     | the compiler does it. Adding them back can defeat it.                                      |
| `react-router` 7    | Import from `react-router`, **not** `react-router-dom`. `<Link to>`, not `href`.           |
| `tailwindcss` 4     | CSS-first config via `@theme` in `globals.css`. There is no `tailwind.config.js`.          |
| `typescript` 6      | `baseUrl` is deprecated. `erasableSyntaxOnly` bans enums and parameter properties.         |
| `oxlint`            | Not ESLint. Config is `.oxlintrc.json`; there is no `eslint.config.mjs`.                   |
| `@google/genai` 2   | Interactions API (`ai.interactions.create`), not `models.generateContent`.                 |
| `@supabase/supabase-js` 2 | Keys are the NEW `sb_publishable_…` / `sb_secret_…` format, not `anon` / `service_role` JWTs — there is no `eyJ…` key to find. Reach the client through `await getSupabase()` in `src/lib/supabase.ts`, never a static import: the SDK is lazily loaded to keep it out of the entry chunk, and it returns `null` when unconfigured. |

When in doubt, read the installed package's own types in `node_modules/<pkg>/`
rather than recalling the API. Heed deprecation notices.

**This project is NOT Next.js.** It was migrated off it. If you find yourself
reaching for `next/link`, `next/navigation`, `next/font`, `next/dynamic`, a
`page.tsx` file convention or an `app/api/*/route.ts` handler, you are writing
code for the wrong framework — see the mapping table in CLAUDE.md.


# BrachNha — Project Context for Claude Code

## What this is

BrachNha is an AI-powered Bac II exam prep app for Cambodian Grade 12 science
students (Khmer/English bilingual). It is fully client-rendered (Vite + React),
with one serverless endpoint for the KruAI chat and Supabase as a durable second
copy behind localStorage. The audience is on phones and Cambodian mobile data, so
first-paint bytes and small screens (320px floor) matter everywhere.

## Where the detail lives

**This file holds only what applies to nearly every session. It loads in full on
every conversation, so keep it short.** The reasoning, measurements and history
for each area are in `docs/notes/`. Read the note for an area before changing it:
those notes record decisions the user made and traps already hit.

| note in `docs/notes/` | read it before touching |
| --- | --- |
| `conventions.md` | the full tech-stack reasoning, fonts, and the em dash, dash, sparkle, Khmer, digit and answer-distribution rules |
| `design-system.md` | neobrutalism tokens, theming, the two accent scales, dark mode |
| `kruai.md` | the chat endpoint, the prompt, Socratic mode, voice, key pool, photos, paying and daily limits, the corpus and budgets, RAG plans, LaTeX rendering |
| `supabase.md` | schema, sync, RLS, identity, study-progress sync |
| `auth.md` | Google sign-in, guests, the gate, the OAuth callback, in-app browsers |
| `shell-and-onboarding.md` | app bar, responsive layout, nav, focus mode, intro, login, survey, Home |
| `lessons.md` | Study page, subject paths, section content and rendering, coins |
| `exams.md` | Mock Exam, past papers, runners, the leave guard, the 2-day Simulation |
| `practice.md` | flashcards, swipe gestures, FSRS, quizzes and the quiz path |
| `roadmap.md` | the Roadmap and its monthly plan |
| `progress.md` | Progress cards, content log, study timer, tooltips |
| `game.md` | Battles, competitions, reviews, photos, invites |
| `streak-leaderboard-profile.md` | Leaderboard, Streak, Streak with Friends, Profile, study calendar |
| `admin-and-telemetry.md` | real-data phase, error and usage events, account deletion, roles, admin pages, audit log |
| `content-database.md` | content in the database, the editor, checks, what was deleted from code |
| `install-and-performance.md` | PWA, service worker, install prompts, performance rules, code splitting, stale builds |
| `decisions-and-review.md` | what is not built, standing product decisions, bugs found in review |
| `environment-and-verification.md` | environment setup, the full verification standard, what to check after each migration |

Keeping it this way:

- **New reasoning goes in the area's note, not here.** Add to this file only a
  rule that applies across features, in a line or two.
- **Never write an `@` import of a note.** CLAUDE.md's `@AGENTS.md` works by
  inlining, and an `@` import here would load that note in every session too.
- **Comments and older docs that say "see CLAUDE.md" or "see AGENTS.md"** mean text
  that now lives in the notes. Find it with `grep -rn "<phrase>" docs/notes`.
- **The notes are dated history moved here word for word.** Where two passages
  disagree the later one wins, and the code beats both. "This file", "above" and
  "near the end of this file" in a note refer to the old single file, so search
  all the notes for a section it names.

## Tech stack

Besides the table at the top: **shadcn/ui** for structural pieces only (Sheet,
Dialog), **Lucide** for icons rather than emoji, **Framer Motion** for the chat
overlay and slide transitions, **Recharts** on Progress and Grade Prediction,
**KaTeX** through `components/shell/math-text.tsx` only, **MathLive** in the chat
composer's lazy panel, **Zustand + persist** as the single global store, and
**Google Fonts** by `<link>` in `index.html`.

## Rules for anything a student reads

- **NO EM DASHES.** Never write `—` in a user-visible string, in any of the three
  quote styles, and that includes KruAI's prompt, because the model copies it. Use
  a comma, full stop, colon or parentheses; in Khmer `។` or `៖`. A bare `"—"` as the
  "no value yet" placeholder is the only exception. Code comments are exempt.
- **No dash between words in a sentence** either: `ការថប់បារម្ភ (Anxiety)`, not
  `Anxiety - ...`. A dash stays correct in a number range (`1975 – 1979`,
  `07:30 - 08:30`), a `- ` list line, a minus sign, a hyphen inside one word, ids,
  code and URLs.
- **No sparkle or four-point star icon**, anywhere: not Lucide's `Sparkles`,
  `Sparkle` or `WandSparkles`, not ✨. Pick an icon that says what the spot means.
  An ordinary five-point star is fine.
- **Khmer strings stay Khmer.** No casual English inside them. Latin stays only for
  exam terms (Khmer first, Latin in parentheses on first use: `ខួរធំ (Cerebrum)`) and
  notation, for product terms (`KruAI`, `BrachNha`, `XP`, `Streak`, `Flashcard`,
  `Quiz`, `Bac II`), for the English paper's own content, and for quoted phone UI.
- **Content is never translated.** It is one language: Khmer, or English for the
  English subject. Never add, keep or require a second language of content.
- **Digits are Latin everywhere**, in both languages, enforced by
  `npm run check:digits`. Never call `toLocaleDateString`/`toLocaleString` with
  `km-KH` or with no locale: pass `"en-GB"`, and use `formatKmDate()` in
  `utils/khmer-dates.ts` for Khmer dates.
- **Correct answers must not cluster on one option.** Spread them about evenly
  across ក ខ គ ឃ in any set. Explanations give the reasoning, never "the answer is ក".
- **Never remove Noto Sans Khmer from a font stack**: it is the per-glyph fallback
  that draws every Khmer character. Weights are 400/600/700/800. Caveat loads on
  demand through `lib/load-signature-font.ts`, never in the blocking link.
- **No vendor names** (Gemini, Google's model) in student copy or the client bundle.
  KruAI always answers in Khmer.
- **Khmer never goes inside `$…$`.** KaTeX draws it as empty boxes.
- **`pages/privacy.tsx` must stay true** to what the app collects and shows others.
  Change what is collected or shown, and change that page in both languages.

## Look and layout

- **Neobrutalism.** New components use `bg-surface`, `border border-border` and
  `shadow-panel`, never `bg-white` or a `shadow-[...]` literal. Bright `bg-neo-*`
  fills always take `text-ink`. Page titles with a mark use `components/page-title.tsx`.
- **Two accent scales, not interchangeable:** `--brand-*` for a fill under white
  text, `--color-*` for text, icons, borders, tints and chart series. Every themed
  value is declared in `:root`, never as a literal in `@theme`, or `.dark` cannot
  reach it. Tailwind cannot see a class assembled at runtime, so spell variants out.
- **Mobile is the baseline and must not shift.** Larger sizes are `md:`/`lg:` only.
  Dashboards use `grid grid-cols-1 items-start gap-4 md:grid-cols-2`; reading and
  answering screens cap at `mx-auto w-full max-w-2xl`.
- **One scroll container per screen**, owned by the page. Page scrollers force
  overflow-x to auto, so nothing may be positioned past its own box unless an
  ancestor clips it, or the page scrolls sideways.
- **A control that does nothing must not look tappable.** Empty or unavailable is a
  dimmed `<div>` with a `ឆាប់ៗនេះ` chip, never a disabled `<Link>` or silent button.
- **Task screens use `components/shell/focus-layout.tsx`** and `utils/focus-styles.ts`,
  and every one has a working exit. A multi-step one calls
  `hooks/use-focus-scroll-top.ts` with its step.
- **Every screen has one `<main>` (the shell's) and one `<h1>`**, which `tests/e2e/structure.test.mjs` checks. A task
  screen with no visible title passes `heading` to FocusLayout. `h1` takes the heading font, so a title in the
  body font keeps it with `font-body!`.
- **Performance:** animate only `transform` and `opacity`, with reduced-motion
  handled. No `backdrop-filter` over anything that scrolls. Charts on fixed data
  pass `isAnimationActive={false}`.

## Code traps neither `tsc` nor oxlint can see

- **Zustand:** a multi-field selector must be wrapped in `useShallow`, or it loops
  forever. Single-field selectors are fine.
- **React Compiler:** no hand-written `useMemo`/`useCallback`. An early return
  guarding a possibly-undefined value must sit ABOVE every closure that reads into
  it, not merely above the JSX, or the render crashes at the end of a list. A closure
  on a possibly-null store value reads `useBrachNhaStore.getState()`. Exercise the
  LAST item of any flow.
- **`key` on position, not payload id**, when state must reset on each advance.
- **Once per browser means module scope.** StrictMode gives each effect pass its own
  ref, so an effect that creates a remote resource dedupes at module level.
- **Date keys come from `utils/day.ts`.** Never `toISOString().slice(0, 10)`: it is
  UTC, and students are in Phnom Penh.
- **Lazy boundaries break silently.** KaTeX, MathLive, three.js, the Supabase SDK,
  the QR encoder, FSRS and the admin pages must stay out of the entry chunk. Reach the
  client through `await getSupabase()`. After a build, check by content, since chunk
  names move: `grep -l "GoTrueClient" dist/assets/*.js`, plus `renderToString` for KaTeX.
- **A new outside host must be added to the Content-Security-Policy in `vercel.json`**, or it
  silently fails in production only (`docs/notes/install-and-performance.md`).
- **Another student's text is untrusted.** Never pass it to
  `dangerouslySetInnerHTML` without `utils/sanitize-svg.ts` in the path.
- **The server:** `server/chat-handler.ts` and `src/utils/chat-prompt.ts` use relative
  imports only, never the `@/` alias, or the deploy build fails. `GEMINI_API_KEY`
  never gets a `VITE_` prefix. The client may SELECT from the corpus, never SUPPLY it.
  Run `Object.hasOwn` and shape checks on any client-sent key.

## Data rules

- **`localStorage["brachnha"]` is the live copy. Supabase is a second copy** trailing
  it by seconds. Nothing in the UI may depend on Supabase being present, and an absent
  or unconfigured project is a supported state.
- **Schema changes are `supabase/migrations/*.sql`**, applied by hand, once, and never
  made in the dashboard's Table Editor. Mirror every column in `src/types/database.ts`,
  including each table's `Relationships`. Say when a migration must land before code.
- **Keep the copies in step:** every key in `partializeState` (`lib/store.ts`) appears
  in `syncRelevantChange` (`use-supabase-sync.ts`), except the fields documented as
  synced elsewhere. A new key with a default needs no persist `version` bump.
- **The snapshot push is destructive**, so it must never run against an account this
  device has not claimed (`syncedUserId`, `AccountConflictView`).
- **RLS:** own rows only. A cross-user read is a `security definer` function returning
  the minimum, never a policy opening `profiles`, which holds email, age and location.
  **A policy on a table must never query that same table**: it fails at rewrite time.
- **Admin rights are decided in the database.** A redefined `admin_*` function must
  keep its `admin_audit` call, or that action silently stops being logged.
- **Content lives in the database:** decks, quizzes, sections, papers, game questions.
  Write new content as JSON under `content/new/`, following `content/README.md`, then
  import it on Admin → Content. The code keeps structure only.

## Directory rules — keep enforcing these

- `src/lib/` = stateful / app-wide (store, nav config)
- `src/utils/` = pure functions only
- `src/pages/` = one file per route, thin — they compose feature components
- `src/features/<name>/` = a feature owns its components and demo data
- `src/components/shell/` = app chrome; `src/components/ui/` = primitives
- `public/` = URL-referenced assets; `src/assets/` = imported-into-component assets
- `server/` = code that runs on a server, never in the browser
- `api/` = Vercel serverless entry points, thin wrappers over `server/`
- `supabase/` = database schema as timestamped SQL migrations, plus how to
  apply them. Never edited from the dashboard's Table Editor — a change made
  there works and then nothing in the repo records that it happened
- `tests/` = permanent tests, run by `npm test`. Keep a useful one-off test by moving it here
- `design/` = master artwork, **never served and never bundled**. It is outside
  `public/` precisely so it can't be. Sources live here; what ships is the
  derived asset in `public/`. See `design/README.md`.

Don't let these blur together.

`report.md` is a separate, plain-language changelog written for the user's
teammates, not for agents — what changed, why, and what to re-test, with no code
detail. Keep it updated alongside this file whenever a user-visible change
ships: add a new dated entry at the top (newest first) and name the commit it
landed in. Don't merge the two files — CLAUDE.md carries the technical
reasoning, report.md carries the human summary, different readers.


## Migrated off Next.js — the mapping

If you reach for any of the left column, you're writing for the wrong framework.

| Next.js | Here |
| --- | --- |
| `src/app/**/page.tsx` file routing | `src/pages/*` + the route table in `src/app.tsx` |
| `src/app/layout.tsx` | `index.html` (fonts, title, favicon) + `ShellLayout` in `src/app.tsx` |
| `next/link` | `<Link to>` from `react-router` |
| `usePathname()` | `useLocation().pathname` |
| `useRouter().push(x)` | `useNavigate()(x)` |
| `next/dynamic` | `React.lazy` + `<Suspense>` |
| `next/font/google` | the `<link>` in `index.html` + CSS vars in `globals.css` |
| `params: Promise<{ id }>` | `useParams()` |
| `'use client'` | nothing — everything is a client component |
| `@tailwindcss/postcss` | `@tailwindcss/vite` |
| `app/api/chat/route.ts` | `server/chat-handler.ts` (+ two mounts, see `docs/notes/kruai.md`) |
| `next.config.ts` image `remotePatterns` | gone — avatars are bundled in `public/avatars/` |

URL paths are unchanged, so `src/lib/nav-items.ts` and every link still resolve.
A `/*` catch-all renders `src/pages/not-found.tsx`, which Next used to provide.


## Standing decisions (don't relitigate)

**A streak day is any 1 finished mission, and reaching all 4 missions opens a gift**
(3 Nov 2026). `ActivityLog.goal` means "a streak day", and `tasks` means "this mission's
target is reached". A streak protection covers a missed day, holding the run together without
adding to it, for a shared streak too. See `docs/notes/streak-leaderboard-profile.md`.

There is no entry screen, guests land on Home. Donate is removed. KruAI is a global
overlay rather than a route, available in lessons and blocked in assessments. It is a
kind big sibling with no romantic persona. The exam countdown is derived from
`BAC2_EXAM_DATE`. `/streak` has no nav row on purpose. Battles never use a simulated
opponent. The leaderboard's sample rows stay and are unmarked. The service worker
caches only `offline.html`. The full list, and what is still unbuilt, is in
`docs/notes/decisions-and-review.md`.

## Environment

Windows with Git Bash, Node 22+, npm 10+. `npm run dev` serves
**http://localhost:5173**; `npm run preview` has no backend, so KruAI shows its
"unavailable" notice there. `.env` holds `GEMINI_API_KEY`, `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`, which holds a `sb_publishable_…` key. Restart the dev server
after editing it. Production is Vercel. Screenshots: run
`VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npm run dev`, then `node scripts/shots.mjs`.

## Verification

Run all of these, with zero new errors, before calling a change done:

```bash
npx tsc -b            # NOT `tsc --noEmit -p tsconfig.json`: this is a solution build
npx oxlint            # NOT eslint. One known warning: components/ui/button.tsx
npm run check:digits  # no Khmer numerals
npm run check:content # content files under content/
npm test              # database rules on a real engine, about 10 seconds (tests/db/)
npm run build         # whenever the change ships
```

After changing KruAI's prompt or model, run `npm run eval:kruai` (`docs/notes/kruai.md`). After changing a
student task or shared screen code, run `npm run test:e2e`: real Chrome, about 10 minutes (`tests/e2e/`).

Then exercise the change. KruAI needs a request against a running dev server,
Supabase work needs `npm run db:check`, and auth and UI need a real browser, where you
measure rather than eyeball: a check on the data can pass while the render is broken.
The `verify-brachnha` skill runs this checklist, and
`docs/notes/environment-and-verification.md` has the rest, including what to check
after each migration.

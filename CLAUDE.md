@AGENTS.md

# BrachNha — Project Context for Claude Code

## What this is

BrachNha is an AI-powered Bac II exam prep app for Cambodian Grade 12 science
students (Khmer/English bilingual). It began as a single-file vanilla HTML/React
(CDN + Babel) prototype across three separate HTML files, was rebuilt as a
Next.js 15 App Router app (`brachnha-next`), and now lives here on Vite. Every
screen was ported faithfully at each step, fixing real bugs along the way rather
than copy-pasting.

**`brachnha-next` no longer exists on disk** — the reference copy was not carried
across when this project moved folders. The "Migrated off Next.js — the mapping"
table below is now the only record of what moved where, so keep it accurate. The
warning it carried still stands: do not copy Next.js-specific patterns back in.

## Tech stack (final decision, with reasoning)

| Tech | Status | Why |
| --- | --- | --- |
| **Vite 8 (Rolldown) + TypeScript** | ✅ Use | Replaced Next.js. The app is fully client-rendered — there was no SSR/RSC benefit being used, and the Next build was paying for machinery this app never touched |
| **React 19 + React Compiler** | ✅ Use | Compiler is on via `babel-plugin-react-compiler` in `vite.config.ts`. Don't hand-write `useMemo`/`useCallback` for performance; it handles that |
| **react-router 7** | ✅ Use | Replaces Next's file-system routing. Import from `react-router`, not `react-router-dom` |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | ✅ Use | Replaces 500+ lines of hand-written CSS. CSS-first config — the theme lives in `@theme` inside `src/styles/globals.css`; there is no `tailwind.config.js` |
| **Oxlint** | ✅ Use | Replaces ESLint. Config is `.oxlintrc.json` |
| **shadcn/ui** | ⚠️ Partial | Structural pieces only (Sheet/Dialog); kept the app's own pink/purple/blue Gen-Z visual identity rather than generic shadcn styling |
| **Lucide React** | ✅ Use | Replaced emoji icons (inconsistent rendering across phones) |
| **Framer Motion** | ✅ Use | Chat overlay slide-up; CSS keyframes still used for simple fixed animations (fab pulse, shimmer) |
| **Recharts** | ✅ Use | Score trend line + subject bar chart on Progress. Sparklines and the score donut are still hand-coded |
| **KaTeX** | ✅ Use | Typesets both sides of the KruAI conversation. Pulled in through a lazy import of `ChatOverlay` so its JS and web fonts stay out of the first-paint bundle |
| **MathLive** | ✅ Use | The math keyboard and formula editor in the chat composer, replacing ~570 lines of hand-built Unicode keyboard. Lazy-imported one level deeper than KaTeX — see the mentor section below, the boundary is load-bearing |
| **Zustand (+ persist)** | ✅ Use | Single global store; replaces scattered `useState` + manual localStorage |
| **Supabase** (`@supabase/supabase-js`) | ✅ Use | Postgres + auth behind the store. A durable SECOND copy — the app still reads localStorage first and works with Supabase absent. Lazily imported so it stays out of the entry chunk; see its own section below |
| **Google Fonts via `<link>` in `index.html`** | ✅ Use | Nunito = body, Space Grotesk = headings, Noto Sans Khmer = every Khmer glyph, Caveat = typed signature only. See the font note below — it matters |

### Fonts: the one thing you must not "simplify"

`next/font/google` used to self-host these and inject four CSS variables. Now
`index.html` loads them from Google Fonts and `src/styles/globals.css` defines
the same four variables (`--font-nunito`, `--font-space-grotesk`,
`--font-noto-khmer`, `--font-caveat`) by hand, which `@theme` then composes into
`--font-heading` / `--font-body` / `--font-signature`.

Neither Nunito nor Space Grotesk nor Caveat ships Khmer glyphs — Khmer isn't
even an available subset for them. Noto Sans Khmer sits as a **fallback** in
each stack and the browser resolves it *per glyph*: Latin keeps Nunito, Khmer
picks up Noto, and mixed strings like "មេរៀនគ្រឹះ & ទី១២" render correctly from
one stack. **Removing that fallback silently breaks every Khmer string in the
app.** Weights 400/600/700/800 only — `font-black` has zero usages, which is
why Nunito is requested as `wght@400..800` and not `400..900`.

**`index.html`'s link carries THREE families, not four.** Caveat is fetched on
demand by `src/lib/load-signature-font.ts`, called from `SignatureDisplay`'s
typed branch — it is the only face in the app that isn't on every screen, and
that link blocks first paint. It is asked for from `SignatureDisplay` rather
than from `CommitmentOverlay` because the roadmap's commitment banner renders a
typed signature with the overlay never mounted. `--font-caveat` and
`--font-signature` still exist in `globals.css` exactly as before; only the
fetch moved. Don't "tidy" Caveat back into the blocking link.

A narrowed **range** (`400..800`), not a discrete weight list (`400;600;700;800`)
— Google serves one variable file for a range and four static instances for a
list, and the variable file is the smaller of the two here.

### Theming: two accent scales, and why one isn't enough

The app ships light **and** dark, **light by default**. `theme: "dark" | "light"`
lives on the store (persisted, and deliberately **not** cleared by `logout()` —
it's a device preference, not account data). Dark was briefly the default and
that value is still in older payloads, so `persist`'s `migrate` resets v1
`theme` to light — the stored "dark" there is the old default rather than
anyone's choice, and without the reset flipping the default would change nothing
for anyone who had already opened the app. This was the first migration that
actually fires; see the `merge` comment for why v0 data could never use one.
(`version` is now **4** — the v3 → v4 step zeroes the old seeded `streak` for
the same "the stored value is the old default" reason, now that the streak is
derived; see the Streak section. `index.html`'s pre-paint guard is `>= 2` and
still holds.)

`AppShell` toggles a `dark` class on `<html>` in an effect next to the existing
`lang` one, and `index.html` carries a blocking inline script that applies the
same class from localStorage **before first paint** — without it, choosing dark
flashes light for a frame on every load. That script repeats the migration's
`version >= 2` guard on purpose: without it a stale v1 "dark" paints dark and
then snaps to light when the migration runs, which is the exact flash the script
exists to prevent. Both it and the effect also write `<meta name="theme-color">`,
which is a single value rather than a `prefers-color-scheme` pair because the
app has its own setting and deliberately does not follow the OS. Tailwind v4
points `dark:` at `prefers-color-scheme` by default, so `globals.css` re-points
it with `@custom-variant dark (&:where(.dark, .dark *))`.

Because `@theme inline` resolves `var(--color-*)` at use site, redefining the
`:root` values under `.dark` flips ~160 token usages across 50 files with zero
component edits. That only works if **every themed value is declared in `:root`,
never literally inside `@theme`** — a literal in there is unreachable by `.dark`.
`--color-border`, `--color-secondary`, `--color-accent` and `--color-destructive`
used to be literals and were moved out for exactly this reason. Keep them out.

**There are two accent scales and they are not interchangeable:**

- `--brand-pink/purple/blue/mint/yellow` — **identical in both themes.** The only
  correct choice where the colour is a *fill sitting under white text*: gradient
  buttons, the FAB, the Roadmap phase nodes, the wordmark.
- `--color-pink/purple/blue/mint/yellow` — **lifted in `.dark`.** Text, icons,
  borders, tints, chart series, progress fills.

The split is forced, not stylistic. `#8b2be2` as text on a dark card is ~2:1.
Lifting it to `#b47cf5` fixes that but drops white-on-purple to 2.8:1. No single
value clears AA in both roles, so don't try to merge them. The lift also means
every existing `bg-purple/8` / `border-purple/10` tint becomes correct subtle
elevation on dark for free — **don't "fix" those alphas per theme.**

Surfaces are four intentional steps, not a computed ramp: `--color-bg` (page) →
`--color-surface` (cards) → `--color-elevated` (popover/tooltip) →
`--color-control`. `--color-control` exists because the math keyboard's keys need
opposite treatment per theme — a faint tint *below* the white panel in light, a
step *above* it in dark, or the keys read as holes punched in the keyboard.

Shadows are tokens (`shadow-panel`, `shadow-panel-sm`, `shadow-cta`,
`shadow-cta-lg`, `shadow-drawer`, `shadow-mint-cta`), purple glows in light and
real black shadows in dark. **New components use `bg-surface` and
`shadow-panel` — never `bg-white`, never a `shadow-[0_2px_12px_rgba(...)]`
literal.** Those two mistakes are what made this change a 35-file sweep.

Things a class toggle cannot reach, all now tokenised — check them when touching
charts: Recharts `<Tooltip contentStyle>` (it defaults to a solid **white** panel
and sets `itemStyle`/`labelStyle` independently, so all three need naming), grid
and axis strokes, the two hand-coded SVG donut tracks, both conic-gradient score
rings, and `--drawer-header` / `--scrim` / `--path-glow`. `ActivityHeatmap`'s
`LEVELS` is the one place a hand-tuned per-theme ramp was unavoidable — a scale
built to darken away from white has no useful bottom end when it's brightening
instead. `SignaturePad` redraws its canvas in a `requestAnimationFrame` on theme
change: it reads `--color-purple` off the element, and React runs child effects
before `AppShell`'s, so a synchronous redraw would read the outgoing theme.

### Directory rules — keep enforcing these

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
| `app/api/chat/route.ts` | `server/chat-handler.ts` (+ two mounts, below) |
| `next.config.ts` image `remotePatterns` | gone — avatars are bundled in `public/avatars/` |

URL paths are unchanged, so `src/lib/nav-items.ts` and every link still resolve.
A `/*` catch-all renders `src/pages/not-found.tsx`, which Next used to provide.

## The KruAI endpoint — one handler, two mounts

`server/chat-handler.ts` exports `handleChat(req: Request): Promise<Response>`
with no framework in it at all. It is mounted twice:

1. **Local dev** — `server/vite-chat-plugin.ts` adds Connect middleware on
   Vite's dev server at `POST /api/chat`. It loads the handler through
   `server.ssrLoadModule` rather than importing it at the top of the config, so
   TypeScript and hot-reload work there. It also bridges `GEMINI_API_KEY` from
   `.env`/`.env.local` into `process.env` via `loadEnv` (Vite deliberately does
   not do this for unprefixed vars).
2. **Production** — `api/chat.ts`, a Vercel Serverless Function whose Node
   runtime accepts exactly that web-standard signature, so it is a one-line
   passthrough. `vercel.json` sets `maxDuration: 60` because the reply streams
   and the 10s default truncates long answers.

**`npm run preview` has no backend.** It serves the static `dist/` only, so the
mentor shows its "unavailable" notice there. That is expected, not a bug.

**Never let the key reach the client.** `GEMINI_API_KEY` has no `VITE_` prefix
on purpose — Vite only exposes `VITE_*` to the browser bundle. Don't "fix" a
missing key by prefixing it.

**`server/chat-handler.ts` and `src/utils/chat-prompt.ts` must stay free of the
`@/` alias.** Vite resolves it, but the Vercel function bundler reads the root
`tsconfig.json` — a solution file with no `paths` — and an aliased import there
fails the deploy build. Both files carry a comment saying so. Type-only imports
are erased and would survive, but keep the whole reachable graph relative rather
than relying on that.

### Model and prompt

Model is Gemini 3 Flash (`gemini-3-flash-preview`) through the official
`@google/genai` SDK's **Interactions API** (`ai.interactions.create`), NOT the
older `models/*:generateContent` endpoint the original Netlify function used.
Replies stream as plain UTF-8 text (not SSE — there's one stream of text, so the
client just reads `response.body.getReader()`).

`store: false` is passed deliberately so Google doesn't retain student
conversations server-side; we replay history ourselves from the Zustand store.
`thinking_level` is `"minimal"` on purpose: measured ~2.7s to first character vs
~11.2s on `"low"`, and accuracy held on multi-step Bac II math (conjugate
limits, conditional probability). Don't raise it without re-measuring.

Free-tier quota is the routine failure mode, not an edge case —
`gemini-3-flash-preview` allows roughly 5 requests/minute and 20/day, so a
classroom exhausts it fast. `isQuotaError()` / `busyMessage()` detect that (both
as a thrown 429 and as an in-stream `event_type: "error"`) and return "Too many
questions at once" instead of the misleading generic apology. Real classroom use
needs billing enabled on the Google AI Studio key.

`server/rate-limit.ts` adds our own per-IP cap (30/min) before any upstream
call, so a flood costs nothing. In dev there's no proxy and everything keys to
`"local"`, which is fine — it exists to protect a deployment.

Chat answer quality is **prompt engineering, not fine-tuning** —
`gemini-3-flash-preview` can't be fine-tuned, and the whole content corpus (~28
items) fits in a ~2.7–3.1k-token system prompt, so no embeddings/RAG.
`src/utils/chat-prompt.ts` composes: persona + honesty guardrails +
`src/data/bac2-format.ts`'s `BAC2_ANSWER_RULES` (the Given → Method → numbered
Steps → Answer → Exam tip skeleton) + `BAC2_EXAMPLES` (few-shot worked answers)
+ every lesson/flashcard/practice/mock question flattened as grounding + the
student's real profile. `buildKnowledgeBlock` also emits the list of subjects
with NO app content (physics/chemistry/history/khmer today) so the model says so
instead of inventing a lesson. `src/data/bac2-format.ts` is the intended drop-in
point for real MoEYS past papers — add entries to `BAC2_EXAMPLES` and flip
`verified: true` once a teacher checks them; no code change needed.

**`SECTION_CONTENT` is in the block too, but CONDENSED, and the condensing is the
point.** `sectionLine()` emits title + every `items[].label` + the `mistakes`
pairs in full + a question count. It deliberately drops every `body`, `intro` and
`outro`. Measured on the first authored section: **~7,000 characters, 3,362 of
them Khmer glyphs**, against a whole prompt of ~2.7–3.1k tokens — and Khmer
tokenizes at roughly a token per glyph, so ONE section pasted whole would double
the prompt and biology's 43 nodes would make it unusable. Labels are the
curriculum's own names for things, which is what stops the model inventing its
own; the prose it drops is what the model can already teach once anchored.
Misconceptions are kept whole because they are two short strings and are the
highest-value grounding in the file — "students think X, actually Y" is the shape
of question a student actually brings.

Section subjects are added to the `covered` set (`id.split("-")[0]`), or a
subject whose only content is authored sections would still be announced as
having none — i.e. the model would deny the lesson the student is reading.

`PROMPT_BUDGET_CHARS` (24,000) warns on an oversized prompt. Deliberately
measured in CHARACTERS, not an estimated token count: a Latin-calibrated
estimate understates a Khmer prompt several times over. **If it fires, condense a
source — don't raise the number.** The whole no-embeddings/no-RAG decision rests
on the corpus staying small enough to send on every single request.

**The chatbot is called KruAI** — one spelling in both languages, Latin script
even in Khmer copy, because it's a brand name rather than a description. It used
to be "AI Mentor" / "គ្រូ AI", which is where the name comes from (គ្រូ = kru =
teacher). `buildSystemPrompt` states the name and instructs the model to identify
as KruAI and to **never name the company, model or service behind it**, which is
the prompt-side half of the product decision recorded below; the UI-side half is
that no vendor name appears anywhere in the client bundle.

**The mentor ALWAYS answers in Khmer**, whatever language the student types in —
a deliberate product decision (students sit the Bac II in Khmer), not a bug.
This is the `ANSWER_LANG` constant in `src/utils/chat-prompt.ts`, and it drives
every language-dependent block, not just the reply instruction:
`BAC2_ANSWER_RULES`, `buildExamplesBlock` and `buildKnowledgeBlock` are all
rendered in Khmer too. That's the important part — leaving the few-shot worked
examples in English quietly pulls the model back to English however firmly the
instruction is worded, because an example outweighs a sentence.
`buildSystemPrompt` therefore takes no `lang` argument at all; the handler still
uses `lang` for its own error messages, which follow the app's UI language. The
prompt tells the model to keep notation/units/established technical terms in
Latin form (lim, ∫, H₂O, mol, pH) with a Khmer gloss on first use, rather than
invent Khmer coinages a student won't meet on the exam paper. Flip the one
constant to go back to answering in the student's chosen language.

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

**When `PROMPT_BUDGET_CHARS` fires, this project is also the RAG store.** The
mentor section explains why the whole corpus is sent on every request today and
why that stops scaling once the curriculum is written. The answer is `pgvector`
in the database that now exists — content stays in `src/data/*.ts` as the source
of truth, with embeddings as a derived index — not a new vendor.

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
  command, and it is what makes the screenshots skip the entry screen.
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
today's row plus the previous 14 days, and the pull reads the last 400 back. `questions_answered` / `study_minutes` are still written by
nothing and are there so the row has somewhere to put them; an empty column
costs nothing, a migration on a live table costs a deploy. When `study_minutes`
is finally populated it must mean ACTIVE minutes — see the leaderboard section
for why.

**`exam_results` has a `kind`.** The store's `examResults` holds generated mock
exams ONLY, and three things depend on that: Home's "from mock exams" stat pill,
the average `chat-prompt.ts` states to KruAI as fact, and the generated-exam
tab rendering the array unfiltered. `kind` lets past-paper and placement
attempts be recorded without ever being mistaken for a mock — the client filters
`kind = 'mock'` when it rebuilds the array. This is the "separate persisted
`pastPaperResults`" follow-up flagged in the Mock Exam section, done as a column
because the row shape is identical.

### RLS: own rows only, and the one screen that does not fit

Every table denies by default and then allows exactly `auth.uid() = user_id`
(`= id` on `profiles`), with `(select auth.uid())` so Postgres evaluates it once
per statement rather than once per row.

The leaderboard needs cross-user reads and is fixed demo data partly for that
reason. When it goes live it wants a view or a `security definer` function
exposing rank and display name only — **not** a "profiles are readable by
everyone" policy, which hands out email, age and location with it.

**`/streak/friends` is now a SECOND screen waiting on that same function**, and
it needs two things more. A **friendship model** — a one-sided "following" turns
a SHARED streak into a stranger's progress bar you cannot influence, so it wants
an invite/accept pair, which nothing in the schema has. And a **pair-owned
streak row**, because the number belongs to neither student individually: it is
a property of the relationship, and storing it on one side means two rows that
can disagree. Build the read path once for both screens rather than twice — the
friends board needs display name, avatar seed and today's goal-met flag, which
is a superset of what the leaderboard asks for.

### Content stays in `src/data/`

Lessons, sections, subjects, past papers are NOT in the database. Most subjects
have no content yet and the curriculum shape is still moving; a schema would
make every content edit a migration. Revisit when content settles, not before.

### Keeping the three copies in step

The schema, `database.ts` and the sync layer are three descriptions of one
thing. Two invariants worth re-checking after any change to the store:

- every key in `partializeState` (`lib/store.ts`) appears in
  `syncRelevantChange` (`use-supabase-sync.ts`), or that field silently never
  reaches the server;
- every column in the SQL appears in the matching `Row` type.

Both were verified mechanically when this landed — 21/21 fields, 74/74 columns
across 8 tables — and both are the kind of thing that rots quietly.

`tasksDate` is listed in `syncRelevantChange` although it has NO column of its
own — `daily_activity` keys on `activity_date`, which the push derives itself.
It is there so the two lists stay the same length and the next person auditing
them finds a one-to-one, rather than a gap they have to reason about.

`activityLog` is in both lists too, and it has no column on `profiles` either:
it maps onto `daily_activity`, one row per key — `xp` to `xp_earned`, `goal` to
the lesson/practice/flashcards flags.

`@supabase/ssr` is in `package.json` and is unused: it is for frameworks with a
server-rendered request cycle, which this app does not have. Safe to remove.

## What's fully built and working

**Shell:** `AppShell` (`src/components/shell/app-shell.tsx`) — deliberately NOT
a phone mockup: no frame, notch, or status bar, just a `mx-auto h-dvh` container
that goes full-bleed on a phone. It was renamed from `PhoneShell` because that
name kept implying a device frame that has never existed; don't add one. Also
`TopBar` (a floating absolutely-positioned
hamburger button, not a bar — nothing reserves space for it), `Drawer`
(Sheet-based, built from one shared `src/lib/nav-items.ts` config), `BottomNav`,
`FabChat`, `ChatOverlay`. `AppShell` also syncs `document.documentElement.lang`
from the store in an effect, because `index.html` ships `lang="en"` and the real
value isn't known until React mounts.

`AppShell` takes optional `hideChrome` (unmounts `TopBar` and `Sidebar`) and
`hideMentor` (unmounts `FabChat` and `ChatOverlay`) props — see the focus-mode
section for why those are two props and not one. The roadmap onboarding lock
below passes **both**, leaving the page's own CTA as the only way forward.
`ShellLayout`
(`src/app.tsx`) is what decides when — `pathname === "/roadmap" && !commitment
&& !pledgeSeen` — because `AppShell` deliberately doesn't read the router (see
the comment there); the prop defaults to `false` so `AppShell` stays usable
outside a route. The rule exists because a student fresh out of the survey lands
on the Roadmap, which renders no `BottomNav`, and would otherwise tap the
hamburger and never reach the commitment pledge. `pledgeSeen` (persisted, set in
`CommitmentOverlay`'s single `close()`) is what un-hides it again — gating on
`commitment !== null` alone would strip the page forever for a student who taps
"Maybe later", which is an allowed choice.

### The global stat bar — level/XP/streak/coins, on every ordinary screen

`AppShell` renders `StatBar` (no `theme` prop, so no light/dark toggle) as its
own row, right-aligned, at the top of the content column — above `TopBar`, so it
appears on every screen that isn't hidden-chrome, without any individual page
knowing it exists. This was a deliberate widening: `StatBar` used to appear only
where a screen opted in (`FocusLayout`'s `showStats` prop, and one inline call in
`subject-path-view.tsx`), and the product call was that these numbers are the
core of the app's gamification loop and belong somewhere the student sees them
constantly, not just mid-lesson.

**Four pills, not three: `Lv{level}` leads the row**, added right after the bar
went global — level was the one number Home's own header already showed
(`កម្រិត 2 · 130 XP`) that the bar itself was still missing. It reuses
`StatPills`' `Target` icon for level, so there's one visual convention for "what
level am I" rather than two, and is given its own `text-blue` tone (the app's
`text-purple`/`text-pink`/`text-yellow` were already spoken for by XP, streak and
coins) so four adjacent pills stay scannable rather than reading as a single
repeated colour.

**Gated on the exact same `!hideChrome` that already hides `Sidebar`/`TopBar`**,
which is what makes this correct with zero new logic: focus tasks, the mock exam
and placement test (where a live counter would turn a measurement into a
scoreboard — the same reasoning `FocusLayout`'s own `showStats` already encodes,
and which stays true here since those routes hide chrome too), and the roadmap's
one-way onboarding lock all correctly stay clear of it for the reasons they
already hide the rest of the chrome.

**`subject-path-view.tsx`'s own inline `<StatBar />` was removed** the moment
this landed, and **`lessons-list.tsx`'s own streak-only chip went with it** —
both would have shown a number the global bar already shows a few pixels away.
`FocusLayout`'s `showStats` StatBar is a SEPARATE instance and was deliberately
left alone: those routes have `hideChrome = true`, so the global one is absent
there and the task screen's own copy is the only one rendering — no double-up,
and no shared state to keep in step since both read the same store.

**The tricky part was the hamburger, not the bar.** `TopBar`'s button is
`absolute top-3 right-4`, measured from its nearest positioned ancestor — so a
new row placed INSIDE that same ancestor would sit in normal flow while the
button stayed pinned to the ancestor's original top edge, and the two would
overlap. The fix was to nest: the stat-bar row is a sibling BEFORE a `relative`
wrapper, not a child inside it, so it pushes that wrapper's top edge down as a
whole, and the hamburger's `top-3` — still measured from the same wrapper — moves
down by exactly the bar's height along with it. That keeps it aligned with each
page's own `pt-4` title row exactly as before, just both shifted down together;
see the comment in `app-shell.tsx` for the fuller version of this argument.

**Page top-spacing convention:** pages start at `pt-4` and put `pr-14` on their
header block, so the page title sits on the same row as the floating hamburger
(button spans y=12–50px; a `text-xl` line at `pt-4` centres at ~30px against the
button's ~31px). Bottom padding is `pb-20` on pages that render `BottomNav` and
`pb-36` on those that don't (roadmap/profile/lesson-detail), so content clears
the FAB at `bottom-20`. The old `pt-14` convention was removed on purpose — it
existed only to dodge the hamburger and left a 56px dead band above every header.

### Responsive layout — two rules, and they pull in opposite directions

The app was phone-only until this convention landed (it had exactly **one**
responsive breakpoint in 69 component files). The shell is a **column on phone
and tablet and a ROW from `lg`**, where a permanent sidebar sits beside the
content: `max-w-lg` → `md:max-w-3xl` → `lg:max-w-[1600px] lg:flex-row`. The
1600px ceiling exists so an ultra-wide monitor doesn't stretch cards absurdly;
`mx-auto` centres whatever is left beyond it.

**The number the whole system rests on:** these cards already render at **288px**
on a 320px phone, so anything from ~290px up is inside their working range.
That is why multi-column is safe at tablet width and why *nothing inside a card
needs a breakpoint*. If a card seems to need internal breakpoints, the page grid
is wrong, not the card.

| viewport | nav | columns | card width |
| --- | --- | --- | --- |
| 320–767 | bottom nav + hamburger | 1 | 288–431px |
| 768–1023 (tablet) | bottom nav + hamburger | 2 | ~352px |
| 1024+ (laptop) | **sidebar**, no bottom nav | 2 | ~470–620px |

What goes inside splits into two kinds, and **which kind a screen is decides the
treatment**:

- **Dashboards / card stacks widen into columns.** Home, Progress, Game,
  Grade Prediction and the lessons list use
  `grid grid-cols-1 items-start gap-4 md:grid-cols-2`, with `md:col-span-2` on
  the card that heads the page (score donut, live game, prediction hero).
  **Two columns is the ceiling, and the limit is card HEIGHT, not width.** A
  third column at `2xl` was tried and reverted: `SubjectBreakdown` is a long
  list next to two short charts, so three columns left a *bigger* hole than two.
  Before adding a card to a grid, check the shape — a compact one-row card or a
  `grid-cols-N` stat strip takes `md:col-span-2` and reads as a banner; a list
  or chart pairs with its neighbour — and then check that the un-spanned cards
  are **even in number**, or the last row holes.
- **Reading and answering screens get NARROWER, not wider.** Lesson content,
  mock exam, placement test, profile, roadmap, login, survey, the leaderboard,
  the chat conversation and the math keyboard all cap at
  `mx-auto w-full max-w-2xl` (672px). Prose and exam questions have an optimal
  line length; stretching them across a laptop actively hurts. The roadmap stays
  one column for a second reason — it's a sequential path, and two columns would
  break the order. The leaderboard is a third: a ranked list read top to bottom
  is a sequence too, and at 1600px a row is a name at one end of the screen and
  a number at the other.

`max-w-2xl` is the single content-column width across every screen in that
second group. Keep using it rather than introducing a second number.

**One nav at a time.** `components/shell/sidebar-nav.tsx` exports `SidebarNav`
(the list) and `Sidebar` (the `hidden lg:flex` column). `Drawer` renders the
*same* `SidebarNav` inside its Sheet, so the two navs are one component and
cannot drift — add a route to `lib/nav-items.ts` and it appears in both.

**A ROUTE DOES NOT HAVE TO BE IN THAT LIST, and two deliberately are not.**
`/roadmap` and `/streak` were both removed from `featureNavItems` at the user's
request: the list had grown past a phone screen, and each already has a doorway
on Home that shows the very thing the page is about — the "Quest Map" chip in
`motivation-hero.tsx` and the Flame stat pill in `stat-pills.tsx`. A nav row
there is a second entrance to a screen the student is looking at the summary of.
Before adding a row for a new route, check whether Home already points at it.
The comment block where those two used to sit spells this out; don't quietly
re-add them.

`BottomNav` and `TopBar` carry `lg:hidden` on their own roots rather than on the
9 pages that render them. `FabChat` and page `pb-20`/`pb-36` both exist to clear
the bottom nav, so both get `lg:` overrides — without them desktop has ~80px of
dead space under every page.

**One name lockup, for the same reason.** `components/shell/wordmark.tsx` owns
the logo + "BrachNha" + optional subtitle, and is the ONLY place that gradient
wordmark is spelled out. Its four consumers are `HomeHeader`, `SidebarNav` (so
the drawer and the desktop sidebar both get it), `LoginView` and `SurveyView`.
They had already drifted before it existed — four hand-written copies carrying
four *different* decorations beside the name (⚔️ on login and survey, ✨ in the
sidebar, a Lucide `<Sparkles>` on Home). The logo is the decoration now; don't
add an emoji back beside it, and don't re-inline the gradient classes.

`subtitle` is a `ReactNode`, not a string, because Home passes its level/XP row
with Lucide icons in it while the other three pass plain text.

The mark is a `<picture>` over `public/logo/brachnha.webp` with a `.png`
fallback, the same bundled-in-`public/` approach as `ui/avatar.tsx`. Three
things about it:

- **The artwork has an opaque white background baked in** — it was supplied as
  an app-icon tile, and the outermost path is a full-canvas white rect. That is
  what `rounded-[26%]` is for: it clips the square into the tile shape so the
  mark reads as an app icon rather than a white block sitting on the dark
  theme's surface. Deliberately no `dark:` variant — a light badge in both
  themes is correct here, and this is the one place that's true.
- **It is a 96px RASTER, and the source SVG is deliberately not shipped.** The
  supplied file is 431KB of auto-traced paths (426 of them, ~169KB gzipped) for
  something rendered at 40px — more than half the weight of the entire JS
  bundle, on an audience on Cambodian mobile data. The WebP is **4.6KB** and is
  indistinguishable at 40px. 96px is 2.4× the display size, so 2× and 3× DPI are
  covered, and the raster is cropped square to agree with the `object-cover`
  rather than fight it.
- **The master SVG lives in `design/`, outside `public/`, so it is never
  served.** `design/README.md` records how to re-render it — via the Chrome that
  `playwright-core` already provides for `scripts/shots.mjs`, so no image
  tooling was added to the repo. If the artwork is ever replaced, regenerate
  **both** formats; `<picture>` needs the pair.

`width`/`height` are set on the `<img>` so the box is reserved before the image
lands — without them the name beside it shifts on first paint.

The big centred `⚔️` on the login and survey screens is a separate illustration
and was deliberately not touched. `public/favicon.ico` is still the OLD icon —
it does not come from this file and was left alone.

**Full-bleed is phone-only.** `AiInsights` uses `-mx-4 px-4` to cancel the page
padding so its carousel reaches both screen edges. From `md` the card sits in a
grid column where bleeding outward overlaps its neighbour — and the page padding
is `px-6`/`px-8` there anyway, so `-mx-4` lines up with nothing. It resets with
`md:mx-0 md:px-0`. Any future bleed needs the same reset.

**Mobile is the baseline and must not shift.** Every rule above is `md:`/`lg:`
only, and DOM order is unchanged — e.g. Home still has the grade card between
`StatPills` and `LessonPreviewList`, which is why the masthead is wrapped in one
`md:col-span-2` block rather than the children being reordered.

**Verify with `node scripts/shots.mjs`** (needs `npm run dev` running). It drives
the installed Chrome through `playwright-core` — no browser download — seeds a
logged-in profile into `localStorage` (that seed mirrors `partializeState`, so any
new field that gates what a page renders has to be added to it or the screenshots
quietly become of some other screen), then walks 17 routes × 9 widths (plus 4 click-driven states)
(320/375/390/430/768/1024/1280/1440/1920), writes a PNG each and asserts nothing
overflows. It separates **hard** failures (the page scrolls sideways, or an
element juts past the viewport with no scrollable ancestor) from **soft** ones
(an element measures wider than its own box — which a deliberate full-bleed
child does too, so Progress reports soft hits at phone widths and that is
correct). Exit code follows hard failures only.

**Run it with the Supabase variables BLANKED, or it fills the auth table with
junk:**

```bash
VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npm run dev   # then, elsewhere:
node scripts/shots.mjs
```

**The cause is gone; the command is still right.** The seed set `userName`,
which was exactly the condition the old `use-supabase-sync.ts` treated as "a
student is logged in, sign them in and push" — and each screenshot is a fresh
browser context with no saved session, so every one of the ~102 page loads
created a new `auth.users` + `profiles` row. Measured on the live project:
**212 users, of which 205 were screenshot runs** — 136 named "Panharith" (the
seed on line 102), 51 "Sok", 18 "P". The seven real ones each had exactly one
row, which is also the proof that the sync itself was correct.

Anonymous sign-in is REMOVED, so no run can create a user any more — nothing
signs in without a student pressing a button. **Keep blanking the two vars
anyway**, for a different and now more important reason: with Supabase
configured, the seeded profile is not an authenticated session, so the gate
would render the ENTRY SCREEN for all 17 routes and every screenshot would be of
the same page. Blanking them makes `isSupabaseConfigured` false, which gives the
harness full access exactly as before. The 205 existing rows are still there and
still worth deleting one day.

### Focus mode — lessons and tests take over the screen

Modelled on Duolingo: the moment a student is mid-task, **every** navigation
affordance goes (sidebar, bottom nav, hamburger, chat FAB) and the screen becomes
a top bar with an X and a progress bar, the exercise centred, and one action
button pinned to the bottom.

`components/shell/focus-layout.tsx` is that frame — `FocusLayout` plus
`FocusButton` — and it is deliberately shared by the lesson flow, the mock exam
and the placement test. Those three each used to hand-roll a progress bar and
inline buttons, which is exactly how they drifted apart; change the task
experience here, not in three places. The body uses
`min-h-full` + `justify-center`, which is what makes a short step sit in the
middle of a laptop screen while a long one still scrolls from the top.

**Whether focus is on comes from two sources, combined in one hook**
(`hooks/use-focus-mode.ts`), because the two kinds of task announce themselves
differently:

- **Route** — `utils/focus-routes.ts`'s `isFocusRoute()` for screens that are
  nothing but a task from the moment you land: `/lessons/:id`, `/placement-test/:subject`.
  It tests `startsWith("/lessons/")` **with the trailing slash**, so the
  `/lessons` LIST stays an ordinary page with full navigation. Don't loosen that.
- **Store** — `focusMode`, for the mock exam, where `/exam` is an ordinary
  destination (its intro screen shows past results) until the student actually
  starts answering. `ExamRunner` sets it in a **mount/unmount** effect — that
  component is rendered if and only if a question is on screen, so mount means
  focus on and unmount means focus off, with no condition to get wrong. (It
  used to be keyed on `started && !done` inside a component that was ALSO
  mounted for the intro and results screens.) **The cleanup is the load-bearing
  half** — without it, a browser-back out of a running exam leaves the whole app
  with no navigation at all. It is excluded
  from `partialize` for the same reason: a persisted `true` would strand a
  returning student on a screen with no way out.

Consumers are `ShellLayout` (ORs it into the existing `hideChrome`, which already
drops `TopBar`/`Sidebar` for the roadmap onboarding lock) and `BottomNav`
(returns `null`), which is checked in the component rather than in the 6 pages
that render it.

**The AI mentor is a SEPARATE question from the navigation, and the two answers
differ.** `hideChrome` and `hideMentor` are two `AppShell` props, driven by two
hooks in `hooks/use-focus-mode.ts`:

| Screen | Nav | Mentor |
| --- | --- | --- |
| Lesson (`/lessons/:id` — content, flashcard, quiz) | hidden | **available** |
| Mock exam, while answering | hidden | blocked |
| Placement test (`/placement-test/:subject`) | hidden | blocked |
| Roadmap onboarding lock | hidden | blocked |
| Everything else, incl. `/exam` intro and results | shown | available |

`useFocusMode()` answers "hide the navigation"; `useMentorBlocked()` answers "is
the student being measured". The second is a strict subset — `isAssessmentRoute`
in `utils/focus-routes.ts` is the placement test only, ORed with the store's
`focusMode` flag (which nothing but `MockExam` sets; if that ever changes, this
rule needs its own flag rather than borrowing that one).

A lesson keeps the mentor because asking "why is this step true?" mid-lesson is
the product working, not a leak. An assessment blocks it because a mentor on tap
measures the mentor. **The placement test is blocked for a sharper reason than
the mock exam**: it isn't graded, it decides which subjects get marked weak, so
looking up answers there builds the student a wrong roadmap with nothing
downstream to catch it.

Two non-obvious pieces. (1) Hiding the FAB is not enough — `chatOpen` is global
and survives navigation, so `AppShell` also force-closes it in an effect and
refuses to render `ChatOverlay` at all while `hideMentor`; otherwise a chat
opened on the exam INTRO is still sitting there after tapping Start. (2)
`FabChat` reads `useFocusMode()` for its own offset: `bottom-20` clears
`BottomNav`, but a lesson has `FocusLayout`'s taller pinned action bar instead,
so it moves to `bottom-22 md:bottom-26 lg:bottom-28`. It only ever sees focus
mode on a lesson, since the shell doesn't render it on the assessments at all.

`defaultMathLayout` (`utils/math-input.ts`) keys the math keyboard's opening
layout off `/lessons/:id`. That branch was unreachable until the mentor was
allowed inside lessons — it was written for this and is now live.

**`FocusLayout`'s `showStats` puts the XP / streak / coins counters and a
light-dark toggle above the progress bar.** It is opt-in and the LESSONS opt in —
`LessonDetail` and `SectionDetail` — while the mock exam and placement test do
not: a live XP counter mid-exam turns a measurement into a scoreboard, and a
theme toggle one tap from an answer that counts is a settings control in the
wrong place. The counters get their OWN row rather than joining the X + progress
row, because at the 320px floor that row is already a 32px button, a flexible bar
and a "1 / 2" — three chips and a toggle alongside would leave the progress bar a
few pixels wide.

**`components/shell/stat-bar.tsx` is that row, and it is shared.** It began as a
local function inside `subject-path-view.tsx` and was lifted the moment a second
caller appeared — same reason `shell/wordmark.tsx` exists. Its `theme` prop adds
a single toggle rather than reusing `ThemeSwitcher`: that is a two-option
segmented control built for the drawer footer, and with exactly two themes a
toggle says the same thing in a third of the width.

**Back is a SEPARATE affordance from exit, and `FocusLayout` owns both.** The X
leaves the task; `onBack` steps within it. It is an opt-in prop rendering a
compact button at the start of the FOOTER row (not beside the X — two icons in
one corner and neither reads), and it lives in the shared frame rather than in
each screen's own `footer` node so a back control cannot end up looking
different on the three task screens the way their progress bars once did. The
row is `items-stretch` so the button takes its height from the action button
beside it, and `footer` sits in a `flex-1` wrapper so `FocusButton` stays
full-width on the screens that pass no `onBack`.

Only `SectionDetail` passes it today, where it is absent on the first step (the
X is the only way out) and on the completion screen (the XP is already banked;
stepping back into the quiz from there would let it be re-answered). **The lesson
flow deliberately does NOT have it yet**: its `afterFunFact`/`afterDidYouKnow`
handlers skip steps a lesson has no content for, so a naive `step - 1` would land
on a step that lesson never renders. Adding it there means mirroring the skip
logic, not passing the prop.

**Every focus screen must have a working exit.** The exam's answering screen had
none before this — survivable only because the nav was still there to escape
through. It now passes `confirmExit`, which shows a two-tap confirm first,
because leaving discards the attempt.

`PlacementTestRunner` takes an opt-in `focus` prop that **defaults to false**:
the survey's `WeaknessStep` renders the same component inline inside a step card,
where a full-screen takeover would swallow the survey itself. Only the
`/placement-test/:subject` route passes `focus`.

**Focus mode scales with the screen; the phone does not move.** It first shipped
with fixed phone sizes at every width, so a 1920px laptop rendered 16px type
stranded in the middle of the screen. `utils/focus-styles.ts` now holds the
ladder as shared class strings — `focusCard`, `focusKicker`, `focusPrompt`,
`focusBody`, `focusLabel`, `focusOption` — used by all three task screens so
they can't drift. Sizes were taken from a real Duolingo lesson: a **~24px
prompt, ~18px options about 60px tall, in a ~768px column** (`md:max-w-3xl`,
applied to `FocusLayout`'s top bar, body **and** footer so their edges stay
aligned).

Two rules when touching it:
- **Base classes are the phone and are not to be edited.** Every step up is
  `md:`/`lg:`-only. The check that this held is a pixel diff of the 320/390/430
  focus screenshots before and after — they must be byte-identical.
- The constants live in a `.ts` file, not in `focus-layout.tsx`, because a
  non-component export from a `.tsx` trips oxlint's `only-export-components`
  fast-refresh rule (the repo carries that warning once already, in
  `components/ui/button.tsx`, and shouldn't grow a second).

`PlacementTestRunner` branches on `focus` before applying any of them: inline in
the survey it keeps plain phone classes, because that copy sits inside a step
card and would otherwise scale itself out of its container.

Duolingo's flat no-card look, split SKIP/CHECK footer and option number badges
were considered and **declined** — the card-and-shadow style is the app's
identity everywhere else.

**Login** (`features/login`) — name + language choice (both required) plus
email/age/location (all optional), shown before the survey; `AppShell` renders
this whenever `userName` is empty, then falls through to the survey. Language
lives on the store as `userLanguage` (sibling to `userName`/`userEmail`/etc.),
not inside `userData` — it's account-level identity, not a survey answer.

**Survey** (`features/survey`) — 4-step onboarding: **studied? → liked subjects →
weak subjects → target grade**. The 7 real subjects are math, physics, chemistry,
biology, history, khmer, and whichever language (English/French) was chosen at
Login. Step state lives in one `FormState` in `SurveyView` and **commits once, in
`finish()`, with no exceptions** — nothing in the survey writes to the store
before that any more.

**Step 1 (`StudiedStep`) is a fork with one live branch.** "Not yet" advances
into the survey as it always worked; "I've studied some" is a labelled stub for a
per-subject/per-lesson "did you study this lesson?" pass ending in a test, which
is blocked on real lesson names from the user. Three things not to "tidy":
- **It is a `<div>`, not a `<button>`** — same as how `sidebar-nav.tsx` renders
  its `href: null` routes. It does nothing, and a button whose tap answers with
  silence reads as broken. (An earlier pass made it a button with
  `aria-disabled`; Playwright refused to click it, which was the right
  complaint — a control that's disabled to assistive tech but carries the only
  explanation on screen is a contradiction.)
- **`t.studiedNote` is rendered unconditionally, not on tap.** It states what the
  branch will do *and* that it's coming soon. The whole point is that someone
  reading the screen — a student deciding, or someone evaluating the app — learns
  what the option is for without pressing a greyed-out control to find out.
- The answer still commits, as `UserData.studied`. Only `false` is reachable
  today; the field exists so the branch has its value waiting. Don't wire the
  control up "temporarily" — it stays dead until the lesson content exists.

**Step 3 (`WeaknessStep`)** treats the 3 foundation subjects —
math/physics/chemistry — differently from the other 4: a Weak / Not weak / Not
sure chip per subject. Biology/history/khmer/language keep the plain toggle grid.

**All three foundation subjects take the same path.** "Not sure" expands to the
`testComingSoon` note plus a Weak / Not-weak self-report, and that is the only
thing it can do. Math briefly had an inline `PlacementTestRunner` (it is the only
subject with questions in `MOCK_QS`) and all three briefly had a "Schedule for
later" that booked a date; **both were removed at the user's request**. A live
test on one subject out of three reads as a bug rather than a feature, and
booking a day for a test nobody can sit promises something the app can't keep.
"Not sure" deliberately isn't a final answer — nothing downstream knows what to
do with it — so it asks again in gentler terms rather than leaving the row
unresolved, which is what keeps `allFoundationResolved` reachable.

`FoundationStatus` is therefore `"weak" | "notWeak"`; there is no `"pending"`.
The component takes no store slice at all.

**Home** (`features/home`) — header, motivation hero w/ daily quote + nav chips,
stat pills, grade-prediction widget, lesson preview list, daily tasks (that
order is what `pages/home.tsx` renders; the grade card sits between `StatPills`
and `LessonPreviewList`).

**Lessons** (`features/lessons`) — a two-tab grid of SUBJECT tiles + dynamic
`/lessons/:lessonId` route with the full 7-step lesson flow (intro → content →
flashcard flip → fun fact → did-you-know → quiz → completion).

### The Study page is subject-first, and Khmer-only

`lessons-list.tsx` used to be a flat list of individual LESSONS — one compact row
per lesson, assembled by hand from whatever happened to exist in
`data/lessons.ts`. It grew a row per lesson and gave a subject no identity of its
own. It is now a two-tab, staggered grid of subject tiles, which is the shape
that survives real content arriving.

**`features/lessons/subjects.ts` is the catalog** — id, Khmer name, blurb,
accent, Lucide icon — plus the derivations. Four things there are load-bearing:

- **`LESSONS_PAGE_LANG = "km"`. This page renders Khmer even when the app is set
  to English**, and that is a product decision, not missing translation work —
  the same call already made for KruAI, which always answers in Khmer whatever
  the student typed (`ANSWER_LANG` in `utils/chat-prompt.ts`). Strings here are
  Khmer literals, NOT `{ en, km }` pairs behind `T[lang]`. Don't "fix" them.
  The constant exists so the decision is greppable and reversible in one edit.
- **Lesson counts and durations are DERIVED, never authored.** `lessonCountFor()`
  counts `LESSONS[id]`, so a card's number cannot drift from the content it
  describes — the same reason `levelForCount()` replaced a hand-authored level in
  `utils/activity-heatmap.ts`. `MINUTES_PER_LESSON` is one named constant rather
  than eight fake per-subject numbers; replace it with real timings when lesson
  content lands.
- **The Foundation tab derives from `FOUNDATION_SUBJECTS`** (`utils/placement.ts`,
  already exactly math/physics/chemistry and shared with the survey), rather than
  hardcoding a second list that can drift. Note `FOUNDATION` in `data/lessons.ts`
  still holds math + **biology**, which predates that constant; the biology entry
  is unreferenced by this page but still reachable at `/lessons/biology-foundation`.
- `english` and `french` are both in the catalog; `allSubjects()` renders whichever
  `userLanguage` chose and drops the other.

**Every subject has its OWN colour, and there are TWO scales per subject.** They
are not drawn from the five shared brand accents any more — eight subjects
cycling through five accents collided three times, and colour is useless as a
subject cue if chemistry and Khmer are both mint. `SubjectMeta` therefore carries
no `accent` field; the colour is keyed off `id`.

The supplied palette is Tailwind-500 shades, which are designed as **fills**. As
small text on `--color-bg` **all eight fail AA** (2.1:1 to 4.2:1), so the same
split that governs `--brand-*` vs `--color-*` applies here, for the same reason —
no single value clears AA in both roles:

| token | theme-dependent? | correct for |
| --- | --- | --- |
| `--subject-{id}` | **no** — one value, both themes | a fill sitting under white text. Today: the play button, and only that |
| `--color-subj-{id}` | **yes** — darkened light, lifted dark | small text, icons, borders, the `/8` card tints |

Only `--color-subj-*` is mapped into `@theme`, which is what generates
`bg-subj-math` / `text-subj-math` / `border-subj-math` with alpha. `--subject-*`
is deliberately NOT mapped — it is referenced as a bare `var()` at its one use
site so it cannot be reached by accident for text. Every value in both rows was
measured; the ratios are recorded beside the tokens in `globals.css`.

`subject-card.tsx`'s `SUBJECT` map spells all eight variants out because
**Tailwind cannot see a class assembled at runtime** — `bg-subj-${id}` produces
no CSS. Adding a subject means a row there, a pair of tokens in `globals.css`,
and a `@theme` line.

**Most subjects have NO lessons and that is the normal state today.** A subject
with zero lessons renders as a plain `<div>`, dimmed, with a `ឆាប់ៗនេះ` chip and
no play button — never a disabled `<Link>`. Same precedent as `sidebar-nav.tsx`'s
`href: null` rows and the survey's `StudiedStep`: a control that answers a tap
with silence reads as broken, so it must not look tappable.

**The artwork slot needs no files to exist.** `SubjectArt` renders a single
`<img>` at `/subjects/{id}.webp` on top of a gradient-plus-icon placeholder, and
the `<img>` hides itself via `onError`. Without that handler a missing file
paints the browser's broken-image glyph over the gradient.

**WebP only here — deliberately NOT the `<picture>` + PNG pair `wordmark.tsx`
uses.** That pair is right for the logo: one image, on every screen, where a
second file is cheap insurance. Subjects are eight images, so a fallback means
sixteen files to maintain for a format ~99% of handsets have supported for years
(Android Chrome since 2014, iOS Safari since 14). A browser too old for WebP
keeps the placeholder, which is a designed state rather than a failure.

**The artwork is Freepik free-licence, and the credit line at the bottom of
`features/profile/components/profile-view.tsx` is LOAD-BEARING.** That licence
grants use only on condition of a visible credit, so deleting the line leaves
eight images with no licence behind them. It looks exactly like removable
clutter, which is why it carries a comment saying otherwise. It can go only when
the artwork does — premium re-download or attribution-free replacements. Full
provenance, including the fact that `french`'s source has a watermark the 4:3
crop happens to remove, is in `design/subjects.md`.

`design/subjects.md` carries the naming and the 40KB budget — it is in `design/`
rather than beside the images because anything under `public/` is served, and a
README there ships to production at `/subjects/README.md`. Eight
stock-art files would undo the first-paint work recorded above.

### `scripts/webp.mjs` — PNG/JPG → WebP

Dev tooling, outside `src/` so it never bundles. **No image library was added**:
it drives the Chrome `playwright-core` already provides for `shots.mjs` and
encodes through a canvas, the same route the logo raster was made by (see
`design/README.md`). Resolves Chrome with the same `CHROME_CANDIDATES` list.

```bash
node scripts/webp.mjs art/*.png                      # -> public/subjects/, 600x450
node scripts/webp.mjs art/algebra.jpg --name math    # rename on the way out
node scripts/webp.mjs logo.png --width 96 --square --out public/logo
```

Defaults (600px, 4:3, quality 0.82) match the subject cards: 600px is 2× the
largest size a card ever draws, and the centred crop reproduces the card's own
`object-cover` rather than fighting it. It **warns** rather than fails over the
40KB budget — a deliberately detailed illustration may justify it, but it should
be a decision. `--square --width 96` reproduces the logo raster.

**Two deliberate departures from the reference design**, both because this is a
bottom-nav tab inside existing chrome rather than a standalone screen: there is
**no back arrow** (you don't go back from a tab), and the **streak chip is not
top-right** — `TopBar`'s floating hamburger already owns `absolute top-3 right-4`,
so the header keeps the app's title-left + `pr-14` convention with the streak
inside that reserved space.

**The grid is `columns-2 md:columns-3 lg:columns-4`, not a grid** — the staggered
look comes from cards of differing height flowing into balanced columns, which is
what CSS multi-column does natively and `grid` does not. Cards need
`break-inside-avoid` or they slice across the column boundary. **Two columns at
phone width is a deliberate exception** to the `grid-cols-1 md:grid-cols-2` rule:
that rule protects dense stat cards needing ~288px, while these are image tiles
that read fine at ~144px. 320px is the floor and is checked. The accent tints are
the `/8` scale, correct in both themes with no `dark:` override — see the
two-accent-scale note.

### The subject path — `/subjects/:subjectId`

Tapping a subject card no longer jumps into a lesson. It opens that subject's
**session path**: a Duolingo/Mimo-style winding trail of short sessions, which is
the screen a student picks work from. `subject-card.tsx` links here, not to
`firstLessonId()` — going straight to lesson one would skip the choice and hide
every other session.

**Its own top-level route, deliberately not nested under `/lessons`.** A lesson id
is `subject-topic` (`biology-brain`), so `/lessons/:lessonId` and a bare
`/lessons/:subjectId` would be two patterns matching one segment. An unknown id
`<Navigate>`s to `/lessons` rather than erroring — it is only reachable by a typed
URL or a stale link. It is **not** a focus route: the student is choosing, not
mid-task, so the nav stays.

**The reference design was a dark space-themed game map. Only the STRUCTURE was
taken** — winding path, numbered nodes, locks, a stat bar. Deliberately not
copied: the starfield, planet artwork, both side rails of icon buttons, the
premium badge, the mascot, and the keys/energy/gems currency bar. The page renders
in the app's own identity, in the subject's colour, and works in both themes.

**`CENTRES` in `subject-path-view.tsx` is the single source of truth for the
layout.** Each node is placed with `paddingLeft: X%` plus `-translate-x-1/2` so its
CENTRE lands on that percentage, and the connector SVG is drawn between two of the
same numbers in a `0 0 100 40` viewBox with `preserveAspectRatio="none"`. The first
version drew a fixed curve independent of the offsets and the trail visibly missed
every node. Values stay inside 12–88 because a 64px node at the 320px floor needs
~11% of clearance or it clips.

Those bounds have already moved once, and the reason is the trap: **the widest
part of a node is its LABEL BLOCK, not the disc.** Once section titles started
rendering under the nodes the block went to `w-28` (112px), needing 56px of
clearance — ~19% of a 288px column — so `CENTRES` went `[22, 50, 78, 50]` →
`[30, 50, 70, 50]`. Because `CENTRES` drives node placement *and* the connector
endpoints, the curve followed with no second edit; that is the whole point of
keeping one array. Measured at the 320px floor: nodes span 46→274 in a 16→304
column.

### The path has THREE levels, because the textbooks do

`ជំពូក` (chapter) → `មេរៀន` (lesson) → `ផ្នែក` (section). A section is one node and
one run of the 7-step lesson flow. `features/lessons/sessions.ts` models exactly
that: `Chapter { lessons }` → `PathLesson { sessions }` → `Session`.

Naming, both bits of which look like mistakes and are not:

- **`PathLesson`, not `Lesson`** — `types/index.ts` already exports a `Lesson`,
  which is the content object a section routes *into*. Different things.
- **`Session` keeps its name although the curriculum says "section".** The store
  persists `completedSessions` and exposes `completeSession()`; renaming the type
  invites renaming a persisted field, which needs a migration and buys nothing.

**The page renders ONE BANNER PER LESSON, with the chapter as its kicker** —
`ជំពូក ៣ · តម្រូវផ្សេងៗរបស់សារពាង្គកាយ` over `តម្រូវប្រសាទ`. The third level has to
surface somewhere and that is Duolingo's own unit-header shape. The kicker used to
repeat the subject name, which the header card directly above already says. A
chapter whose real title hasn't been supplied carries `title: ""` and the banner
shows `ជំពូក ១` alone — an empty string is the "pending" marker, deliberately,
because a made-up Khmer title is worse than none.

**Node labels are `{chapter}.{lesson}.{section}` in Arabic digits** (`3.1.1`),
matching the numbering printed in the textbook, and are GENERATED from position by
`sectionsFor()` so a label cannot drift from where the node sits. Prose on the
page keeps Khmer numerals via `utils/khmer-num.ts` — that split is intentional.

**The section TITLE renders under the node, not just in the `aria-label`.**
Duolingo gets away with bare numbers because its content is known; here the
curriculum names are the whole point of the screen. Two consequences: the wrapper
widened (see `CENTRES` above), and the title carries `[overflow-wrap:anywhere]`
rather than a Tailwind `break-*` utility, because **Khmer has no spaces** — a
section name is one unbreakable run and renders as a single line wider than the
node's box without it. A three-line title only pushes the next connector down; the
connector is its own fixed-height element between rows, so no geometry breaks.

**Session structure is DERIVED until it is authored.** `SUBJECT_SESSIONS` holds
the authored structure — the same shape as `PAST_PAPER_QUESTIONS`, and most
subjects are absent, which is the normal state. `chaptersFor()` falls back to one
session per lesson that genuinely exists in `data/lessons.ts` plus
`PLACEHOLDER_SESSIONS` locked nodes, wrapped in one chapter and one lesson so the
shape matches, so a node can never claim content the app lacks.

**Biology is the first real curriculum**, entered from the Grade 12 table of
contents: 3 chapters, 7 lessons, 6 sections each = 42 nodes, **every one locked**,
because no content is written behind any of them. Chapters 1–2 are titleless
pending a legible scan. Two things follow that are easy to mistake for bugs:

- **An authored structure REPLACES the derived fallback wholesale**, so
  `biology-body` and `biology-brain` no longer appear on the biology path. Both
  are still reachable at `/lessons/biology-body` and `/lessons/biology-brain`, and
  the 3D brain lesson is intact.
- **`lessonCountFor("biology")` still says 2**, because it counts `LESSONS`. The
  Study card therefore reads "២ មេរៀន" while the path shows 7 locked lessons.
  Left alone on purpose: making the card count *authored* lessons would have it
  claim seven lessons of content that does not exist, which is the rule that
  function exists to enforce. Revisit when content lands, not before.

**The page does NOT open at the top.** A path is long — biology is 43 nodes — so
landing at the very top means scrolling past everything already behind you to
reach today's work. `SubjectPathView` scrolls its own container on mount to put a
lesson BANNER at the top, banner first because the banner names the thing about to
be done. The target has two sources and the order is load-bearing:

1. the lesson holding the first unfinished playable session — the same session the
   START bubble points at, so landing and bubble cannot disagree;
2. failing that, a lesson flagged `openHere` in the authored data.

`openHere` exists because a path with no content yet has no playable session for
rule 1 to find; biology carries it on ជំពូក ៣ · មេរៀនទី ១, the lesson being
authored. **It retires itself** — the day that lesson has content, rule 1 returns
the same lesson and the flag stops being consulted. That is why it is the fallback
and not an override. The scroll is instant, never smooth (an animated scroll on
first paint reads as a glitch), measured from bounding rects rather than
`offsetTop` so it does not depend on which ancestor happens to be positioned, and
keyed on `subject.id` alone so finishing a session cannot yank the page.

**The `pt-10` above a lesson's first node is not decoration.** The START bubble
sits at `-top-8`, so anything less and it collides with the banner it is meant to
hang under. Banner separation is `mt-8 first:mt-0`.

### Section content — the curriculum shape, and why it is not `Lesson`

A SECTION is one node on a path and the unit real content is written in five
blocks — **សេចក្ដីផ្ដើម, មេរៀន, ឧទាហរណ៍, ចំណាំសំខាន់ៗ, កំហុស** — optionally then a
quiz.

**Those blocks render across TWO steps.** Step 0 is សេចក្ដីផ្ដើម → ឧទាហរណ៍ →
optional 3D model → សំណួរ (orientation: why this matters, what it looks like in
life, then "now you try"); step 1 is មេរៀន then ចំណាំសំខាន់ៗ then កំហុស (the
substance).

**The quiz is INSIDE step 0, not a step of its own**, and step 0 will not advance
until every question is answered — `quizDone`. `SectionContent.quiz` is an ARRAY
(the first authored section has two questions), answers are held in a
`Record<index, string>`, and `SectionQuestion.scenario` carries the ស្ថានភាព
set-up above the prompt in muted text. `correct` is compared by string equality,
so the ក./ខ./គ./ឃ. prefix has to be repeated there — a mismatch silently marks
every answer wrong.

**`SectionVideoPlayer` is a player for a video that does not exist.** The design
calls for one at the top of a section; none are recorded, so `SectionContent.video`
carries a poster and a duration and the component draws the chrome — poster, play
button, ០:០០ / duration, fullscreen glyph, scrub bar. Same idea as the mascot slot
and the empty past papers: build the shape now, drop the real thing in later.

**NOTHING IN IT IS INTERACTIVE.** It first shipped with a real `<button>` under
the play glyph plus a ឆាប់ៗនេះ chip and a "video is being prepared" notice; the
chip and notice were removed at the user's request, so the button went with them.
A `<button>` that answers a tap with silence is the broken-app pattern
`sidebar-nav.tsx` and the survey's `StudiedStep` both exist to avoid — with the
explanation gone, plain spans are the only honest form. Identical on screen, no
pointer cursor, no focus ring, nothing announced as pressable. **Don't reinstate
the `<button>` without reinstating something for it to say.** Elapsed reads ០:០០
and the scrub sits at zero because both are true — a pre-filled bar would invent a
state the app cannot know. Posters live in `public/sections/` named by section id, 16:9
at 800px (not the cards' 4:3 at 600px — the player is ~720px wide at `max-w-3xl`);
see `design/subjects.md`.

`Model3DRef.title` captions the viewer's top-left corner (ខួរក្បាលរបស់មនុស្ស on
this section). Authored rather than hardcoded in the viewer, since the viewer is
shared and a second model would need a different name; top-left because the drag
hint already owns top-right and at 320px a centred caption would meet it.

**`SectionContent.model3d` reuses `Model3DRef` and `BrainModelViewer` as-is**,
including the same `/models/brain.glb` and credit string the Human Brain lesson
uses — one asset referenced twice, not a second copy. It is behind the same
`React.lazy` boundary, so both routes share one `brain-model-viewer-*.js` chunk
and a section without a model never downloads three.js. **Check that chunk still
exists after touching either file.** It ran as five
one-block steps first and was cut back deliberately. Merging cost nothing
structurally because each block still renders in its own `Callout` — only the
step boundaries moved — so regrouping is a change to the render, never to the
data.

**`SectionBlock.items` renders as a BULLETED list**, with nested `item.items` as
`list-[circle]` under it. Every one of these blocks is a list, and without a
marker the items ran together into a wall of Khmer with only the bold label
breaking them up. `list-outside` keeps wrapped lines aligned under the text
rather than under the bullet, which matters here because Khmer lines wrap often.
`data/sections.ts` holds `SECTION_CONTENT` keyed by the id `sectionsFor()`
generates (`"biology-3-1-1"`); the types live in `types/index.ts` beside `Lesson`.
**One entry today** — ៣.១.១ សេចក្ដីផ្ដើម — and nearly-empty is the normal state,
same as `PAST_PAPER_QUESTIONS`.

**This is deliberately NOT `Lesson`, and `SectionDetail` is deliberately not a
branch inside `lesson-detail.tsx`.** That component runs the older
content/summary/funFact/tip/didYouKnow flow for the two legacy lessons. One
component serving both shapes would be a permanent fork down the middle of every
step. What is shared instead is the *frame*: `FocusLayout`/`FocusButton` and the
`utils/focus-styles.ts` ladder, which exist precisely so task screens cannot
drift. `Misconception` is the clearest case for the separate type — `wrong` and
`right` are two fields because the pairing IS the teaching, and one blob of text
could not render the halves differently.

**Khmer-only strings, not `{ en, km }` pairs** — same decision as
`LESSONS_PAGE_LANG`, `EXAM_PAGE_LANG` and `ANSWER_LANG`. The content exists in
Khmer; an English column would be fabrication dressed as data.

**`components/callout.tsx` is the left-border card** every block renders in. One
component, not four hand-rolled cards, for the reason `shell/wordmark.tsx` exists.
Tones come from the per-theme `--color-*` scale, never `--brand-*` — borders and
text rather than fills under white text — which is also why every tone is correct
in dark with no `dark:` override. `TONE` spells all five variants out because
Tailwind cannot see a runtime-assembled class.

**សេចក្ដីផ្ដើម and មេរៀន carry NO heading, and that is deliberate.** The section
title rendered above the first is already its heading, and មេរៀនសង្ខេប was
explicitly asked to lose its label. Within each step the unlabelled block leads
and the labelled ones follow, which is also what keeps a step reading as one flow
rather than a stack of equal cards.

**NO EMOJI in section content or its headings.** `Callout` takes a `LucideIcon`,
not a character — the same swap the rest of the app made, because emoji render
differently on every handset. The completion screen uses `Trophy` for the same
reason. The icon is tinted to the stripe colour: one small glyph reinforces the
stripe rather than competing with it the way the old tinted backgrounds did.

**The colour is the STRIPE and only the stripe.** Card body is `bg-surface` with a
neutral `border-border` hairline, and the label is ordinary `text-text`. The first
version tinted the background and the label as well; with four of these stacked on
one screen the page read as a colour chart and the stripe stopped working as the
thing that tells one block from another. One coloured element per card — don't
reintroduce a `bg-{tone}/8`. The single exception is the ✍️ ការពិត card nested
inside a ❌ card, which takes `bg-control` so it has something other than its own
stripe separating it from the surface it sits on.

**`Session.lessonId` is now `Session.href`.** A section and a lesson route to
different places, so the field answering "is this playable, and where does it go"
had to stop being lesson-specific — ONE field rather than two that drift:

- authored section → `/sections/{id}` **iff `SECTION_CONTENT[id]` exists**
- derived fallback → `/lessons/{subject}-{topic}`

That `iff` is the rule: playability is DERIVED from content existing, never
authored beside it. `completedSessions` is untouched — it matches on
`session.id`, and for derived paths `id` already is the lesson id.

**The landing rule's two sources must be TWO PASSES, not one loop.** Interleaved,
an `openHere` on an earlier lesson beats a real unfinished session further down —
the fallback beating the rule it stands in for. Rule 2 may only run once rule 1
has been ruled out across the whole path. (Caught by the end-to-end test, not by
types.)

`/sections/:sectionId` is a focus route (nav hidden) but **not** an assessment
route, so KruAI stays reachable — same rule as a lesson. `defaultMathLayout`
matches `/(?:lessons|sections)/` since the subject is the first id segment of
both.

**`LESSON_TAIL` — កំហុស / សេចក្តីសង្ខេប / តេស្ត — is appended to EVERY lesson.**
Those three are structural rather than topic-specific, so only sections 1–3 differ
per lesson. It is an inference from the one lesson whose sections were supplied,
and it is one constant to change if wrong. `កំហុស` is a plain locked node today:
it names a mistakes-collection feature that does not exist yet, and reserves its
position and nothing more.

`sessionStatus()` is derived, never stored — a stored status would drift from
`completedSessions` the first time a lesson id changed. Note **"locked" means "not
written yet", NOT "not earned"**: gating a session on finishing the previous one
needs the real chapter structure first, or it would lock content that exists.

**`completedSessions` holds LESSON ids, not a separate session id.** That is what
lets `LessonDetail`'s `finishQuiz` mark the path node done with the id it already
has, with nothing to keep in step. `completeSession` is idempotent so re-finishing
a lesson cannot stack.

### The Duolingo look, and where its limits are

The path deliberately borrows Duolingo's *visual grammar*, and almost all of it
is CSS — no artwork was needed:

- **The "lip" is the whole look.** A node is a solid disc sitting on a darker
  slab of the same colour (`0 5px 0` box-shadow — a hard offset with NO blur, so
  it reads as an edge rather than a shadow), and it presses into that slab on
  `:active` by exactly the distance the lip shrinks. The unit banner carries the
  same lip so the page reads as one material.
- **The lip colour is `color-mix(… black)`, never `--color-subj-*`.** That scale
  is *lighter* than the fill in dark mode, which would light the button from
  below. Mixing toward black is the only rule correct in both themes.
- **`startBob`** (globals.css) bobs the START bubble. Transform-only and in the
  `prefers-reduced-motion` block, like every other loop here.

**The curve was wrong once and the fix is worth keeping.** The connector is a
CUBIC with both control points vertically aligned with their own endpoint. A
quadratic through one midpoint leaves each endpoint aimed *diagonally*, so
consecutive segments disagreed on tangent and every node had a visible kink
through it. Vertical control points make each segment leave and arrive straight
up and down, so segments share a tangent and read as one continuous snake.

**The mascot is the one thing CSS cannot do**, which is why `Mascot` is a hole
rather than an invention: an `<img>` at `/mascot/idle.webp` that `remove()`s
itself on error, so nothing renders until artwork exists. `hidden md:block` —
on a 320px phone a character would cover the very nodes it is meant to cheer on.

**The banner's count is PER LESSON** — not per chapter, and not per path. It has
been wrong at both wider scopes, and each widening hid it one level longer,
because with a single lesson in a single chapter all three numbers coincide. It
would only have surfaced once a real curriculum landed and every banner claimed
the same total.

**This pulls the page away from the rest of the app on purpose, and only so far.**
Chunky pressable buttons live here and nowhere else; Home, Progress and
Leaderboard stay flat. Note this partly reverses the earlier call recorded in the
focus-mode section, where Duolingo's flat no-card look was considered and
declined — that decision still stands for the lesson flow itself.

### Coins

`coins` is a real persisted store field, added for this page's stat bar. It is
awarded by `award()` in `lib/store.ts` — the ONE place XP, level and coins are
granted together, which both `addXp` and `completeTask` now route through. The
level rule used to be written out twice, once in each; that is exactly how a third
caller ends up levelling differently.

`COINS_PER_XP` is the DEFAULT rather than a universal law: coins are the same
earned effort as XP in spendable form, so anything granting XP grants coins in
proportion unless it says otherwise, with no per-action table to keep in step.
`Math.floor` means small grants round to zero, which is correct.

`addXp(amount, coins?)` lets a caller override that ratio. **Exactly one does**:
a correct section-quiz answer, set by hand at 10 XP + 5 coins (twice the ratio),
in `section-detail.tsx`'s `QUIZ_XP`/`QUIZ_COINS`. It is an argument rather than a
second constant in the store so the exception stays visible at the call site — and
if a third or fourth caller ever needs one, that is the signal the ratio itself is
wrong and should be re-set, not worked around again. A wrong answer earns nothing
at all rather than a smaller amount: the correct option is revealed immediately,
so a consolation payout would make guessing worth as much as thinking.

**Nothing spends them yet.**

There is deliberately **no energy/hearts meter** despite the reference having one.
A decorative one is a promise the product does not keep, and a real one needs
refill-over-time rules and a paywall story nobody has designed.

**Mock Exam** (`features/exam`) — a two-tab screen; see its own section below.

### The Mock Exam page is two tabs over one subject catalog

`/exam` was a single "start the 10-question mock exam" card plus the last three
results. It is now **វិញ្ញាសារឆ្នាំចាស់** (real MoEYS past papers, browsed by exam
session then by subject) and **វិញ្ញាសារបង្កើតថ្មី** (newly-generated papers, one
card per subject, no session to choose), both rendered by the SAME
`ExamPaperCard` so the two tabs cannot visually drift — the user explicitly
asked for Tab B to match Tab A's style, minus the year selector.

**KHMER-ONLY, behind `EXAM_PAGE_LANG` in `features/exam/papers.ts`** — the same
decision as `LESSONS_PAGE_LANG` and KruAI's `ANSWER_LANG`. It governs the exam
feature's own copy and has **two carve-outs that are not oversights**: question
text (`q.q[lang]`) and the runner's subject kicker stay bilingual, because that
is authored data shared with the placement test and `MOCK_QS`'s km column is
visibly abbreviated against its en; and `FocusLayout`'s exit-confirm stays
`lang`-driven because it is shared with the lesson flow and must not read Khmer
on the exam and English on a lesson in the same session. The now-unused
`t.mockExam` / `t.startMockExam` / `t.examScore` / `t.retakeExam` /
`t.bacReadiness` / `t.examInstructions` keys were deliberately **left in**
`translations.ts` so the decision stays reversible in one edit. (`t.mockExam`'s
Khmer was `ប្រឡងល្បិច`, "trick exam" — a mistranslation this change retires.)

**Past papers are DERIVED, never authored.** `data/past-papers.ts` holds
`PAST_PAPER_YEARS` and a `PAST_PAPER_QUESTIONS` record keyed `"{year}-{subjectId}"`
that is **empty today, and that is the normal state**. `papersForYear()` builds
one paper per subject from `allSubjects(userLanguage)` — so a session is 7 cards,
not 8 — and looks the questions up. Filtering to subjects that *have* content
would render zero cards, and zero cards is not a screen. The payoff: dropping one
entry into that record turns a card on, and `paper.questions.length === 0` in
`PastPapersPanel.handleTest` is the only line whose behaviour changes. Don't add
an authored question count (it's `questions.length`) or a duration (there is no
timer, and a "១៨០ នាទី" label on an untimed paper is the scrapped
placement-scheduling failure again). `data/past-papers.ts` imports nothing from
`features/`; the typed `paperKey()` lives in `features/exam/papers.ts`.

**Tab B went through the exact same card-list redesign, minus the year
selector — and the OLD flow was kept, not deleted.** `GeneratedPapersPanel` is
`PastPapersPanel` with the `ជ្រើសរើសសម័យប្រឡង` heading and the year-chip row
removed and nothing else changed: same `ExamPaperCard`, same tap-anywhere
behaviour, same empty-shows-a-notice rule. `generatedPapers()` (in
`features/exam/papers.ts`) derives one paper per subject the same way
`papersForYear()` does, sharing its `paperTitle()`/`paperBlurb()` helpers so
the two tabs' wording is literally identical. `components/generated-exam-panel.tsx`
(the old single mixed-subject intro-card-plus-history screen) is **left in the
codebase, unreferenced by `ExamView`, at the user's explicit request** — don't
delete it as dead code; that is the point of keeping it.

**One real behaviour change worth flagging: Tab B lost its inline "Previous
Results" list**, which only `generated-exam-panel.tsx` ever rendered. It has no
home in the card layout and `PastPapersPanel` never had one either — dropping
it is what "same style as Tab A" means literally — but the data isn't gone: a
generated-paper attempt still writes `examResults` exactly as before (Home's
stat pill and `chat-prompt.ts`'s average both still see it), it's just not
listed on `/exam` itself any more. If a recent-attempts list is wanted back, it
would need its own home — e.g. on the results screen, or a new section under
the card list — rather than reviving the retired panel.

**`data/generated-exams.ts`'s `GENERATED_EXAM_QUESTIONS` is DERIVED FROM
`MOCK_QS`, not empty** — grouped by `subj`, so math and biology start live
(5 questions each, same content the retired flow always ran) and every other
subject starts `ឆាប់ៗនេះ` exactly like a real past paper does. This is what
"keep the old exam, don't show it [that way]" means for the CONTENT and not
only the component: retiring the old mixed-subject screen must not also mean a
student can no longer take any exam here at all. `MOCK_QS` itself is still very
much alive — `utils/chat-prompt.ts` and `utils/placement.ts` both read it
independently of any exam UI, old or new.

**`ExamPaperCard` (renamed from `PastPaperCard`) and its base `ExamPaper` type
are the shared surface.** `PastPaper extends ExamPaper { year: number }`, a
field the card has never rendered — `generatedPapers()` returns plain
`ExamPaper[]` rather than inventing a fake year. `Run` in `ExamView` changed to
match: `{ kind: "generated"; paper: ExamPaper } | { kind: "past"; paper:
ExamPaper }`, since Tab B stopped being one fixed test and needs to know WHICH
subject's paper is running exactly like Tab A already did. `handleSubmit`'s
`examResults`-write rule is unchanged (`kind === "generated"` writes, `"past"`
doesn't) — only what a "generated" run now points at changed.

**THE WHOLE CARD IS THE TAP TARGET, not just the `តេស្ត` pill.** It shipped with
only the small pill wired up and the user asked for the whole card to work — the
outer `<button>` now carries `onTest`, and the visible `តេស្ត` chip is a plain
`<span>` rather than a second nested button (a `<button>` inside a `<button>` is
invalid, and the card already has exactly one action). Same "the row IS the
control" shape `PracticeLessonList`'s lesson rows already use with `<Link>` —
`<button>` here because the action is a callback (open the runner, or show the
notice) rather than a route.

**The card stays tappable on an empty paper** — a deliberate departure from this
app's dim-and-don't-tap precedent (`sidebar-nav.tsx`'s `href: null` rows, the
survey's `StudiedStep`, `subject-card.tsx`'s zero-lesson tile). It was chosen:
the tap is not silent, it explains itself, and the `ឆាប់ៗនេះ` chip means the
state is legible **without** tapping — the same principle as `studiedNote` being
rendered unconditionally. The pill's two looks carry the real signal: neutral
outline while pending, subject fill under white text once the paper has
questions. Every PAST paper is pending today, so Tab A matches the reference
design exactly and gains the distinction for free later; Tab B's math and
biology cards already show the filled look, since `GENERATED_EXAM_QUESTIONS`
isn't empty — see below.

**The banner holds its CROP RATIO, not its height** (`aspect-[11/4] max-h-44`).
The card triples in width from 288px to the 672px content cap, so a fixed height
meant a 2.8:1 band on a phone and a 5.25:1 slot on a laptop — and the art is 4:3,
so that wide a crop decapitated every illustration. It still needs no internal
breakpoint: the ratio does the work one would. `max-h-44` stops the banner
ballooning into a hero image that fits one card per laptop screen.

**Three pieces were extracted so Study and Exam share them rather than drift:**

| moved to | what | why there |
| --- | --- | --- |
| `features/lessons/subject-styles.ts` | the 8-row `SUBJECT_STYLE` map | `.ts`, not `.tsx` — a non-component export from a `.tsx` trips oxlint's `only-export-components`, the rule `utils/focus-styles.ts` exists for |
| `features/lessons/components/subject-art.tsx` | `SubjectArt` + its `onError` hide | takes a `className` that overrides shape only; `cn()` is `twMerge`, so the override wins |
| `components/ui/underline-tabs.tsx` | `UnderlineTabs<T>` | generic over the id so both callers keep their literal union; `subject-tabs.tsx` is deleted |

They live under `features/lessons`, **not** `components/ui/`: that directory holds
primitives with zero domain knowledge, and both are keyed on `SubjectId` and know
the `/subjects/{id}.webp` convention. Cross-feature import precedent is Profile
reusing Home's `StatPills`. Artwork is reused from `/subjects/` rather than a new
`/exams/` set — one crop of one file, not sixteen files to keep in step.

**`ExamRunner` performs no store writes.** It reports out through
`onSubmit({score,total,pct})` and `ExamView` decides what the attempt counted as
— the shape `PlacementTestRunner` already uses, and what keeps "which attempts
land in `examResults`" one readable branch. It also fixes a real bug: the kicker
was `q.subj === "math" ? t.math : t.biology`, which labelled every physics and
chemistry question "Biology". It is now `t[q.subj]`, which typechecks with no
cast because all four `MockExamSubject` values are already translation keys.

**`ExamView` owns its own frame**, unlike the Study page where `pages/lessons.tsx`
supplies the padding, because the two branches need different frames: the tabbed
and results screens want a padded scroller, the runner brings `FocusLayout`'s and
must not be nested inside a second one — which `pages/exam.tsx` had been doing.
Single column at every width, `max-w-2xl` throughout: this is a reading-and-
answering screen, the page must not have two widths per tab, halving a *wide
banner* card defeats it, and 7 cards is odd so a 2-column last row would hole.

`ExamQuestion` (in `types/`) is `MockExamQuestion` with `subj` made optional, and
`MockExamQuestion extends` it with `subj` required. A past paper is one subject
end to end and labels the paper, and `MockExamSubject` cannot express a Khmer or
History paper — which the catalog has cards for.

**Two follow-ups, deliberately not done here:** a separate persisted
`pastPaperResults` so Tab A grows its own history, and feeding past papers into
`buildKnowledgeBlock` / `BAC2_EXAMPLES` once content exists. The second edit is
also the right moment to fix the known `no-useless-escape` backslash bug in
`BAC2_ANSWER_RULES`, which needs an answer-quality re-test rather than a silent
change.

`scripts/shots.mjs`'s `focus-exam` route now clicks Tab B's math card
specifically (`button:has-text("វិញ្ញាសារគណិតវិទ្យា")`) rather than a fixed "start"
button that no longer exists — math is the one subject on either tab
guaranteed to have content, via the `MOCK_QS` derivation above. If math's
`GENERATED_EXAM_QUESTIONS` entry is ever removed, that route needs a different
subject with real content or it stops reaching the runner at all.

**Practice** (`features/practice`) — Flashcards & Quiz; see its own section below.

### The practice page is two tabs, three levels, and empty on purpose

`/practice` fills the `flashcards` nav item that sat as a disabled `href: null`
placeholder. It is the Mock Exam page's shape — **two tabs over the subject
catalog** — where the tabs are **Flashcard** and **Quiz**, and it borrows the
Study page's tile grid for the subject chooser rather than inventing a third
layout.

**KHMER-ONLY, behind `PRACTICE_PAGE_LANG` in `features/practice/practice.ts`** —
the same decision as `LESSONS_PAGE_LANG`, `EXAM_PAGE_LANG` and KruAI's
`ANSWER_LANG`. Unlike the exam page there are **no bilingual carve-outs**: the
content type itself is Khmer-only (`PracticeCard` in `types/index.ts`), so
nothing underneath has an English column to preserve. The one piece of shared
chrome that stays `lang`-driven is `FocusLayout`'s exit confirm, which belongs to
the lesson flow too and must not read Khmer here and English there in one
session.

Tab labels are **"Flashcard" and "Quiz" in Latin script**. That is not
untranslated copy — it is already what `translations.ts`'s own **km** column uses
for those two words, the same call KruAI's Latin spelling makes.

**THREE LEVELS, each its own route**, because these are three genuinely different
screens and the back button should step through all of them:

| path | screen | nav | KruAI |
| --- | --- | --- | --- |
| `/practice` | hub: two tabs + subject grid | shown | shown |
| `/practice/:mode/:subjectId` | that subject's lesson list | shown | shown |
| `/practice/:mode/:subjectId/:lessonRef` | the deck or the quiz | **hidden** | **shown** |

`:mode` is `flashcards` \| `quiz` — the union is the URL vocabulary *and* the tab
id, one spelling rather than two. `:lessonRef` is `{chapter}-{lesson}` (`3-1`),
so the content key is `` `${subjectId}-${lessonRef}` `` → `biology-3-1`, the same
prefix `sectionsFor()` already generates for section ids (`biology-3-1-1`).
**Four segments for the runner, not three**, so it cannot collide with the
lesson-list pattern — the ambiguity `pages/subject-path.tsx` documents for
`/lessons/:lessonId` versus a bare `/lessons/:subjectId`.

**The runner is a focus ROUTE, deliberately not the store's `focusMode` flag, and
this is the load-bearing decision.** `hooks/use-focus-mode.ts` warns that
`focusMode` is read by `useMentorBlocked()` as "a mock exam is being answered",
and that a second screen setting it for another reason means the two questions
have come apart. That is exactly this case: a practice runner wants the
navigation hidden but **KruAI kept**. `isPracticeRunRoute()` in
`utils/focus-routes.ts` answers it by pathname — counting segments rather than
using `startsWith`, since the two shallower `/practice/` routes are places rather
than tasks — so no flag is borrowed and `isAssessmentRoute()` is untouched. It
also removes the failure `ExamRunner`'s cleanup effect exists to prevent: a
browser-back out of a running deck changes the pathname, so the navigation
returns on its own with nothing to unset.

**A quiz here is PRACTICE, not a test**, and every difference from `ExamRunner`
follows from that one call: answering is final and reveals the result and the
explanation immediately, there is no submit-at-the-end, correct answers pay out
as they are given, and there is no `confirmExit` because leaving discards
nothing. It is the shape `SectionDetail` already uses for the questions inside a
section, and it is why KruAI stays — a mentor mid-practice is the product
working, exactly as it is mid-lesson.

**The result never reaches `addExamResult`.** `examResults` captions Home's stat
pill "from mock exams" and feeds `chat-prompt.ts` an average it states to KruAI
as fact — the same reason past-paper and placement-test attempts are already kept
out. When practice deserves a history it should be a separate persisted field.

**What it DOES write is `tasks.flashcards` and `tasks.practice`**, through the
same `completeTask()` Home's daily checklist and Roadmap's Daily Mission read.
Those two rows previously had no way to be completed by doing anything — they
were self-reported checkboxes. Finishing a deck or a quiz is now one real
completion shared by all three screens, the way `tasks.lesson` already works.

**`utils/rewards.ts` holds `QUIZ_XP` / `QUIZ_COINS`**, lifted out of
`section-detail.tsx` the moment the practice quiz became a second caller — the
same lift `shell/wordmark.tsx` and `shell/stat-bar.tsx` got. `lib/store.ts` warns
that a *third* `addXp` coin override is the signal the ratio itself is wrong; two
callers importing **one** constant is what keeps that count honest. A new import
there is not a new override.

**The lesson list is DERIVED from `chaptersFor()`** — the same function the Study
path renders from — so `/practice/:mode/:subjectId` and `/subjects/:subjectId`
can never disagree about what lessons a subject has. Today that is 7 real lessons
for biology across 3 chapters and **one placeholder lesson for every other
subject**, which is `chaptersFor()`'s fallback and the honest state rather than a
bug. A row shows `lessonHeading(lesson.lessonNumber, lesson.title)` — "មេរៀនទី N"
plus the real name, the same number+name pairing the chapter kicker already uses
for "ជំពូក N", and the same helper `subject-path-view.tsx`'s own banner calls.
This reverses an earlier version of this paragraph, which had the row show
`lesson.title` alone and reasoned that prefixing the number would double up with
a placeholder title of literally "មេរៀនទី N". That reasoning no longer applies:
`PathLesson.title` for a not-yet-named lesson is now `""` (the same convention
`Chapter.title` already used), so `lessonHeading` falls back to the number alone
— never a name-shaped duplicate of the number it's next to. The user explicitly
asked for number+name to never drop the number once a name is added, across both
screens.

**`FLASHCARD_SUBJECTS` is physics/chemistry/biology/history — a closed list.**
Flashcards earn their keep on recall-heavy material, not on subjects examined by
working a problem or writing prose, so math, Khmer and the chosen language appear
under **Quiz only**. A named constant beside `FOUNDATION_SUBJECTS`' precedent,
and the render order comes from the catalog rather than from that array, so every
subject list in the app stays in one order. Quiz uses `allSubjects()`, which
drops the unchosen language — 7 cards, not 8.

**`data/practice.ts` was EMPTY, and that was the normal state**, exactly as
`PAST_PAPER_QUESTIONS` shipped — until `"biology-1-1"` became the first real
deck (see the spaced-repetition section below). Counts are read from it rather
than authored beside it (`lessonCountFor()`'s rule), so a row cannot claim a
deck the app lacks and playability is derived from the same number. Adding an
entry turns a row on with no other code change — which is exactly what
happened for Biology Lesson 1, and exactly what will happen for every deck
after it. `PracticeCard` is the one content type here, while the quiz reuses
`SectionQuestion` **verbatim** rather than growing a twin.

**Nothing empty is tappable, at either level.** A subject tile with no content
and a lesson row with no content are both a dimmed `<div>` with a `ឆាប់ៗនេះ` chip
— never a `<Link>` — following `subject-card.tsx`'s zero-lesson tile, the
survey's `StudiedStep` and `sidebar-nav.tsx`'s `href: null` rows: a control that
answers a tap with silence reads as broken. The mode badge is hidden on an empty
tile too, the same pairing `subject-card.tsx` makes with its play button, so the
tile carries no affordance at all.

The subject tile shipped **tappable-when-empty** for one revision, borrowing the
`PastPaperCard` departure on the grounds that the tap was "not silent" — it
landed on a lesson list. That was overruled by the user and correctly: a screen
whose rows are themselves all pending is silence with extra steps, and the app's
two subject grids now behave identically rather than one being the exception.
Don't restore it.

**That consequence was the whole page for a while, and it was intended:** with
`data/practice.ts` empty every tile on both tabs was dimmed, so nothing on
`/practice` could be opened at all — the honest rendering of having no content,
resolved by writing content rather than by re-enabling the link. Biology's
Flashcard tile is the first to light up; every other subject on both tabs is
still in that state until its own content lands.
`/practice/:mode/:subjectId` stays reachable by URL for development regardless.

**No emoji anywhere in this feature** — Lucide icons only, the newer
section-content rule rather than the legacy lesson flow's emoji. Both runners use
`utils/focus-styles.ts`'s ladder and `FocusLayout` with `showStats` on, since a
lesson-like activity opts in and only the two assessments leave the counters off.
The flashcard flip is the same `preserve-3d` + `backface-visibility` technique
`lesson-detail.tsx` step 2 uses — now living in `review-session.tsx` rather than
`flashcard-runner.tsx` itself; see the spaced-repetition section below for why
the flip-then-Continue gate this paragraph used to describe was replaced by a
graded Again/Hard/Good/Easy flow instead of a plain "seen it, move on" Continue.

`defaultMathLayout` (`utils/math-input.ts`) now has **two patterns**, because the
subject sits in a different place in each: the first id segment on a lesson or
section, its own third segment on a practice route.

**Bottom nav is untouched.** It is a 5-tab bar and already full; practice is a
drawer/sidebar destination, which is why its `NavItem` carries no `shortLabel`.

### Practice lesson rows are lip buttons now, and Biology chapter 1 has real names

Two follow-up fixes landed right after spaced repetition did, both from a first
look at Biology's actual content in the app.

**`PracticeLessonList`'s tappable rows now use the SAME "lip" 3D-button
technique `SessionNode` (the Study path's circular nodes) and
`QuizPathNode` (the Mimo path's square nodes) already use** — a solid
`style.fill` background under white text, a hard `0 4px 0
color-mix(...black)` shadow with no blur, and `active:translate-y` +
`active:shadow-[0_0_0_...]` so the row presses flush into its own shadow on
tap. Same reasoning as those two: the lip colour is mixed TOWARD BLACK
rather than the app's lighter `--color-subj-*` scale, because that scale is
lighter than the fill in dark mode and would light the button from below —
see session-node.tsx's own header for the fuller argument. This was a
conscious choice between two options (restyle the existing list's rows vs.
turn the list into a winding path like the Study page): the STRAIGHT LIST
STAYS a straight list — only the row's material changed, not its layout —
because Practice's lesson list is a reading-and-choosing screen by design
(capped at `max-w-2xl`, the same as the exam tabs and the leaderboard),
and a winding path is what the separate Study path screen is already for.

**A row with NOTHING written stays exactly what it always was** — a flat,
dimmed `<div>`, no lip, never a `<Link>`. Giving an empty row the lip
treatment too would make it look pressable, which is the one thing it must
not do; only content-backed rows get the 3D material.

**Biology chapter 1 and its two lessons have their real names now**:
ស៊ីមណូស្ពែម (Gymnosperm) and អង់ស្យូស្ពែម (Angiosperm) — the seed-plant
split the chapter covers, chapter title "ស៊ីមណូស្ពែម និងអង់ស្យូស្ពែម".
Set in `features/lessons/sessions.ts`'s `SUBJECT_SESSIONS.biology`, which
is the single source both the Study path's banner and every Practice
screen (lesson list, the flashcard runner's title, the review summary)
read from — one edit, and all four screens picked it up with no other
code change. Chapter 2 is still titleless, for the reason already recorded
there (the scan it came from is too soft to transcribe safely).

### Flashcards grew real spaced repetition, on top of the same feature

The plain flip-through deck above is still the shape for Quiz and for any
lesson before its own review history exists, but **Flashcard mode is now a
real (simplified) spaced-repetition system** — due dates, a graded
Again/Hard/Good/Easy review, and student-authored cards — layered onto the
same `/practice` routes and `PracticeCard` content rather than a parallel
feature. Biology Lesson 1 (`"biology-1-1"`) is the first deck with real
content; everything below was built generically, against the whole catalog,
not hardcoded to that one lesson.

**The brief was explicit that this is a PROTOTYPE, not FSRS/SM-2.** Three
things stayed deliberately out of scope and are documented as such at their
own definitions rather than silently missing: a real memory-model scheduler,
a real retention/ML prediction, and real AI-generated recommendations or
cards. Each of those has a comment at its own file explaining exactly what
would need to change to make it real.

**`utils/spaced-repetition.ts` is the WHOLE swap boundary for a future FSRS
integration.** One function, `schedule(state, grade, now) → state`, called
by nothing except `gradeCard` in the store and read by nothing except
`isDue`/`initialReviewState`/`daysUntilDue` in `features/practice/review.ts`
and `flashcard-runner.tsx`. The interval table is deterministic on purpose
(Again requeues the SAME session rather than simulating a real timer-based
delay; Hard/Good/Easy graduate a new card to a short 1/3/7-day interval or
scale an existing one ×1.2/×2/×2.5) — see the file's own header for the full
reasoning. Replacing this with real FSRS later means rewriting the body of
`schedule` and possibly widening `ReviewState`; no caller changes shape.

**Due-ness PRIORITISES, it never GATES — this took two passes to land on.**
"0 due, 0 new" is correct once every card has been graded (a card rated
"Good" a minute ago is not supposed to come back immediately, that's the
whole point of spaced repetition), but two different UI responses to it were
tried:

1. First pass: explain it. A flat, disabled "គ្មានកាតត្រូវពិនិត្យថ្ងៃនេះ"
   (no cards to review today) read as an error, so `daysUntilDue` (in
   `spaced-repetition.ts`) was added to show "អ្នកបានពិនិត្យអស់ហើយ!
   ការពិនិត្យបន្ទាប់ក្នុងរយៈពេល N ថ្ងៃទៀត" (next review in N days) instead
   — still disabled, just explained.
2. **Overruled immediately: the button should never be disabled at all.**
   A student who wants to restudy something they already know well should
   always be able to, the same way nothing else in this app locks a lesson
   behind a timer. `daysUntilDue`'s message stayed (still useful context,
   reworded to "…ឬពិនិត្យម្តងទៀតឥឡូវក៏បាន" — "or review again now too," so
   it reads as information rather than a restriction) but the GATE came off:
   `startQueue = due.length > 0 ? due : all` in `flashcard-runner.tsx`, and
   the same fallback in `practice-review.tsx` via the new `allCards()` in
   `review.ts`. The button is only ever disabled when the deck itself is
   empty (`all.length === 0`) — not when nothing happens to be scheduled.
   Grading still updates the real due date either way; reviewing early just
   means a card is judged again from wherever it already was.

`ReviewSession`'s own empty-queue branch is now reachable only when a deck
or the whole catalog TRULY has zero cards — both callers fall back before it
ever sees "nothing due" — so its copy changed from "come back tomorrow" to
"គ្មានកាតនៅឡើយទេ" (no cards yet), which is what that state actually means
now.

### The review CARD is Quizlet-style now — swipe, always-flippable, starrable

The Show-Answer-then-four-buttons flow is gone. `SwipeableFlashcard`
(`components/swipeable-flashcard.tsx`) is what `ReviewSession` renders
instead: tap anywhere on the card to flip, drag it right for ចងចាំ (know
it) or left for មិនទាន់ចងចាំ (don't know it yet), and a star in the corner
to mark it important — modelled directly on a Quizlet screenshot the user
supplied, with the explicit exception of Quizlet's pronunciation-audio
speaker icon, which was asked to be left out.

**Two student-facing options, not the scheduler's four.** This is a UI
simplification, not a scheduler one: `rate()` in `review-session.tsx` still
calls `gradeCard` with a real `ReviewGrade` from `utils/spaced-repetition.ts`
— ចងចាំ maps to `"good"`, មិនទាន់ចងចាំ to `"again"` — so the scheduler (and
its future FSRS replacement, which speaks the same four-grade vocabulary)
never sees anything different. `"hard"`/`"easy"` are still real, valid
`ReviewGrade` values; nothing currently produces them, which is why
`FlashcardSummary`'s breakdown folds them into the two visible columns
(`counts.again + counts.hard`, `counts.good + counts.easy`) rather than
deleting them from the type.

**Tap vs. drag is disambiguated by distance, via Pointer Events — one
implementation for touch AND mouse.** Movement under `TAP_THRESHOLD` (8px)
is a tap and flips the card; past `SWIPE_THRESHOLD` (110px) commits a
rating; anything in between snaps back to centre. This is why a desktop
student (`lg` and up gets a real laptop layout, not just a stretched phone
— see the responsive-layout section) can rate a card by click-dragging it
exactly like a touch swipe, with no separate mouse-only code path.

**Two nested transforms, not one.** The outer wrapper carries the drag
(`translateX` + a slight `rotate`, the same tilt Tinder/Quizlet both use);
the INNER wrapper carries the existing flip (`rotateY` in a `perspective`
container — the same technique `lesson-detail.tsx` step 2 uses). CSS
transforms compose through the DOM, so a card can be mid-drag and mid-flip
at once with no special-casing, which is what makes "they always can flip
always" true regardless of drag state.

**The star button caused a real bug worth remembering:** it originally sat
INSIDE the flip container with its own `backface-visibility: hidden`,
intending to "be on both faces." Instead, having no counter-rotation of its
own, it inherited the container's `rotateY(180deg)` when flipped and ended
up showing ITS OWN backface — invisible and unclickable — the moment the
card flipped. The fix was moving it OUTSIDE the rotating layer entirely (a
sibling of the flip container, not a child), so it is simply never subject
to that rotation and stays visible and tappable in both flip states. Watch
for this exact trap in any future ELEMENT THAT SHOULD SURVIVE A FLIP but
isn't one of the two faces themselves.

**`starredCards: string[]` is a new store field** — a flat id list, not
part of `ReviewState`, because importance is the student's own bookmark and
has nothing to do with where a card sits in its review cycle. Works for
official and student cards alike since both share one id space. Same
local-only reasoning as `cardReviews`/`studentCards`; nothing reads it back
anywhere yet (no "show starred cards" filter was asked for) — marking and
persisting is the whole feature today.

**The fly-off animation is timed, not instant, and that timing is why the
component is keyed on `card.id` by its caller.** Releasing past the swipe
threshold starts a CSS transition sending the card off-screen, and only
AFTER `FLYOFF_MS` (220ms, matched to the transition duration) does the
component call `onSwipe` — calling it immediately would have let the parent
swap in the next card synchronously, remounting `SwipeableFlashcard` under
a new key mid-animation and cutting the fly-off short. Keying on `card.id`
is also what resets the component's own drag/flip state for free between
cards, with no effect required to do it by hand.

**`rating-buttons.tsx` is deleted** — the four-button row it rendered has
no caller left. Don't recreate it without a caller asking for four options
again; the two-button fallback row now lives directly in
`review-session.tsx`, styled as a ✕/✓ pair rather than a labelled row, to
match the swipe gesture's own visual vocabulary (mint/pink) instead of
inventing a third.

**`PracticeCard` grew `id`, `source`, `createdAt`, `updatedAt`.** `id` is
required because review state is keyed off it — an array index would
silently point at the wrong card the moment content is reordered or a
student's own card is deleted from the middle of their list. `source:
"official" | "student"` is a discriminant on ONE type rather than two
separate `OfficialFlashcard`/`StudentFlashcard` interfaces, which would
carry an identical field list and be one more place for the two to drift.

**`cardReviews` and `studentCards` are new store fields, LOCAL-ONLY.**
Deliberately NOT added to `syncRelevantChange` in `use-supabase-sync.ts` or
the push/pull mapping in `supabase-sync.ts` — that layer pushes a full
snapshot of each table on every debounced change, which is justified there
by small, capped data (20 conversations, a handful of exam results). A
per-card table updated on every single grade is a different scale and access
pattern, and deserves its own incremental sync path rather than being forced
into the existing one. See "What a real backend would eventually need"
below for the shape that table should take when it's built. Both fields are
reset in `logout()` alongside the rest of a student's progress, and both
need no `persist` version bump — see the store's own `merge()` for why a
brand-new key with a default requires no migration.

**Student cards attach to an official lesson's deck — there is no freeform
"create your own deck" flow.** `studentCards` is keyed by the SAME
`practiceKey()` string official decks use, so a student's own cards join
the SAME review queue as the official ones for that lesson, tagged apart in
the UI (their own "កាតរបស់អ្នក" section, with edit/delete) rather than a
second review mechanism to keep in step. This also means student cards are
only reachable inside a lesson that already has an official deck — matching
`practice-run.tsx`'s redirect gate, which still checks the OFFICIAL deck
only (`deckFor(key).length === 0`), the same rule
`practiceLessonsFor()`'s `count` already enforces at the list level.

**`features/practice/review.ts` is the pure query layer** — `cardsFor`,
`dueCardsFor`, `allDeckKeys`, `allDueCards`, `reviewedTodayCount`. All take
`studentCards`/`cardReviews` as plain arguments rather than reading the
store directly (same shape as `pathProgress(chapters, completed)` in
`features/lessons/sessions.ts`), so they stay callable from anywhere. A
card with no review record is treated as fresh/"new"/due-now rather than
requiring one to be seeded up front.

**`ReviewSession` (`components/review-session.tsx`) is the ONE review loop**,
shared by the per-lesson `FlashcardRunner` (after its intro screen) and the
Daily Review aggregate at `/practice/review` — the loop itself (flip, grade,
requeue-on-Again, advance, finish) does not care where the queue came from,
only the title and exit route differ, and both are props. Same
lift-on-second-caller pattern as `utils/rewards.ts` and `shell/stat-bar.tsx`.
It owns three states: the graded queue with local same-session requeuing on
"Again", an empty state ("nothing due — come back tomorrow", a legitimate
state rather than an error), and `FlashcardSummary` on completion (shared
too) — a breakdown of how many cards got each grade this session.

**`FlashcardRunner` is now the INTRO screen**, not the review loop itself:
due/new/total counts, this student's own cards for the lesson (add/edit/
delete via `FlashcardForm`, an inline panel rather than a portalled dialog —
same reasoning `ChatOverlay` avoiding `ui/sheet.tsx` gives), a mock
retention line, and Start Review, which then renders `ReviewSession`. It
now takes a **`deckKey` prop, not a `cards` array** — it needs to combine
the official deck with this student's own cards and pair both with live
review state itself, so `pages/practice-run.tsx` stays a thin route
resolver rather than duplicating that assembly.

**`/practice/review` — the Daily Review aggregate — pulls due cards from
EVERY flashcard deck at once**, via `allDueCards()`. A static route,
listed BEFORE the dynamic `practice/:mode/:subjectId` route in `app.tsx` so
react-router resolves it first rather than treating "review" as a `:mode`
value; `isFocusRoute` in `utils/focus-routes.ts` matches it by exact
pathname rather than through `isPracticeRunRoute`'s segment-count scheme,
since it has no `:subjectId`/`:lessonRef` to count. Not an assessment route
— same non-measuring treatment the per-lesson runner already gets. Today
this reduces to "whatever Biology has," since it's the only subject with a
written deck; nothing here needs to change as more decks get content.

**The hub briefly gained two summary cards and no longer has them —
overruled by the user after seeing them.** `DailyReviewCard`
(due/new/reviewed-today, a progress bar, Start Review) and
`RecommendationsCard` (rule-based sentences, NOT AI, off the same numbers)
shipped on `/practice` for one revision, both deleted along with
`recommendations.ts` the moment that was overruled — the call was to keep
the DUE-COUNT SCREEN PER LESSON (`FlashcardRunner`'s intro — see below) but
drop the cross-subject summary sitting above the hub's tabs. Don't restore
either file without being asked; `reviewedTodayCount` in `review.ts` is the
one piece left with no caller today, kept because it's a small, correctly
derived pure function that costs nothing to leave for whatever reads it
next — everything else those two cards used (`allDueCards`, `allDeckKeys`)
is still live, called by `/practice/review`'s aggregate runner, which is
UNCHANGED and still reachable by URL even with no card on the hub driving
traffic to it — same "stays reachable by URL for development" precedent the
rest of this feature already sets for a screen with no authored entry point
yet.

**Retention is a MOCK, in its own file (`features/practice/
mock-retention.ts`) specifically so it can never be mistaken for the real
scheduler.** A small deterministic formula off `reviewCount`/`lapses` —
not FSRS's own retrievability estimate, not scientifically calibrated to
anything. Always labelled "ប្រហាក់ប្រហែល" (approximate) in the UI, and
only shown once at least one card in view has actually been reviewed
(`averageMockRetention` returns `null` otherwise, and the caller skips
rendering rather than showing a meaningless 0%).

**`FLASHCARD_XP`/`FLASHCARD_COINS` (in `utils/rewards.ts`, beside
`QUIZ_XP`/`QUIZ_COINS`) are smaller than the quiz reward and paid for
EVERY grade, including "Again".** A flashcard isn't right/wrong the way a
quiz question is — it's a self-assessed recall rating, and pressing
"Again" is genuine engagement, not a guess to be discouraged the way an
incorrect quiz answer is. The existing `completeTask("flashcards")` flat
daily bonus is unchanged and stacks on top per session.

**Biology Lesson 1's deck is the first REAL content in `data/practice.ts`**
— six cards transcribed from the textbook's own Q&A study page for
ជំពូក ១ · មេរៀនទី ១ (Gymnosperms), matching the chapter/lesson numbers
already authored in `features/lessons/sessions.ts`'s `SUBJECT_SESSIONS`.
**Transcribed from a photographed page, not a digital source** — dense
Khmer script is genuinely easy to misread character-by-character, so this
is a best-effort pass pending a native read-through, not a guaranteed-
correct transcript; the file's own comment says so and asks for a
spot-check against the original. Fixing a misread word is a plain data
edit in `data/practice.ts` — nothing else in the app needs to change.

**That spot-check already caught one, and it's worth knowing the shape of
it.** The recurring term across all six cards was first transcribed
"ស៊ីមណ្ឌាស្នេម" — a plausible-looking string, not obvious nonsense on
sight — and only came out as wrong once the user supplied the real term
(ស៊ីមណូស្ពែម, the Khmer transliteration of "Gymnosperm") for the chapter
title. The correction was made to the chapter/lesson TITLES in
`sessions.ts` first; the actual card front/back text in `data/practice.ts`
still had the old wrong spelling in all seven places until that was caught
too and fixed with a straight find-and-replace. The lesson: a name
correction supplied for one context (a title) can silently miss every
OTHER place the same misread term appears — search the whole term across
the codebase, not just the file the correction was mentioned for.

**What a real backend would eventually need**, if/when this stops being
local-only: a `card_reviews` table (`user_id`, `card_id`, the `ReviewState`
fields, `updated_at`), RLS'd the same "own rows only" way every other table
is, PLUS an incremental push path — writing just the one row that changed
on each `gradeCard()` call, not a snapshot of the whole table the way
`pushLocalState()` handles conversations and exam results today, since a
review table's write volume (one row per card, every grade) doesn't fit
that pattern. A `student_cards` table (`user_id`, `deck_key`, `front`,
`back`, timestamps) would follow the same shape `daily_activity` already
uses for per-user rows. Neither exists yet, on purpose — this file's own
Supabase section explains why introducing a table is a deliberate, tracked
step (a migration + hand-updated `database.ts`), not a silent one.

### Drag-to-rate hardened: a Back button, and a real bug worth remembering

Four follow-ups landed once the swipe redesign got real hands-on use.

**Drag works at EVERY width, mouse included — this reverses an earlier call.**
Drag used to activate only below `lg` (1024px), via an `isDragViewport()`
check in `swipeable-flashcard.tsx`, on the reasoning that a mouse-drag is
awkward and the ✕/✓ buttons were the intended desktop path. The user asked
for laptops to swipe like phones, so the gate and the function are deleted;
the gesture's axis alone decides drag vs scroll now. The card carries
`cursor-grab` so a mouse user can see it moves, and the hint under it no
longer has a desktop-only variant. The ✕/✓ buttons stay at every width — a
drag is an extra way in, not a replacement. A vertical mouse-drag resolves to
`"scroll"`, which does nothing on release (a mouse scrolls the face with the
wheel), so it neither rates nor flips.

**The ✕/✓ pair moved into `FocusLayout`'s `footer` slot, with `onBack`
beside it.** They used to sit inline in the body; moving them into `footer`
is what let a real `onBack` — FocusLayout's own step-BACKWARDS-within-
the-task affordance, the same one `SectionDetail` uses — sit next to them
the way the shell already expects ("the row is items-stretch so the back
button takes its height from the action button beside it"). Stepping back
only changes which card is ON SCREEN; it does NOT undo a grade already
committed to `cardReviews` — view-only, same as FocusLayout's own doc
comment describes it ("let me re-read that," not "let me take that back").

**A REAL BUG, worth reading in full because the fix looks small and the
cause wasn't.** After a real drag-and-release on a phone-width viewport, no
grade was ever recorded — the card just sat wherever the drag had left it,
silently. `pointerdown` and every `pointermove` fired correctly the whole
time (confirmed with on-page event logging: exact coordinates, every step);
`pointerup` after any real movement simply never reached the component at
all. Three plausible causes were tried and ruled out one at a time —
`setPointerCapture` interfering, `perspective` and the drag `transform`
sharing one element confusing hit-testing, a stale closure over
`dragging`/`dragX` (which WAS also a real, separate bug — see below) — and
none of them were the actual cause. **The real cause: `pointermove`/
`pointerup` were bound directly to the card being dragged, and that card's
own `transform` moves its hit-test box along with it. By release time on a
real drag, the box the browser hit-tests against and the box the pointer is
actually over have enough drift between them that the browser's hit test
for `pointerup` misses the element outright** — a known category of bug
with binding move/up to a transformed, dragged element itself rather than
to `window`, not a quirk unique to this component. The fix: `pointermove`
and `pointerup` are handled by a `useEffect` that adds `window`-level
listeners (filtered to the current gesture by matching `e.pointerId`
against the one captured at `pointerdown`), which fire reliably regardless
of what the browser thinks is currently under the cursor. `pointerdown`
alone stays a normal React prop on the card — it always fires at the card's
ORIGINAL, untransformed position, before any drag transform has been
applied, which is exactly the one part of the gesture that was never
actually broken. **If a future change needs the dragged element's own
move/up handlers back for some reason, re-verify a real release after a
real drag on an actual mobile viewport — this class of bug does not show up
in a static screenshot, only in an actual gesture, and effectively never
reproduces from a stationary tap.**

**A second, genuinely separate bug found while chasing the first: a
same-position tap right after a drag-heavy sequence could silently commit a
phantom rating instead of flipping.** A `pointermove` reaching the card
BEFORE its own next `pointerdown` — the pointer simply gliding onto the
card from wherever the previous tap or button click left it, which happens
on essentially every real interaction since the pointer is never already
resting exactly on the next element — computed its drag delta against
`start.current`'s stale default rather than a fresh baseline, latching the
drag-tracking refs to a large phantom value that a same-position release
right after never cleared. The fix is `onPointerDown` unconditionally
resetting `draggingRef`/`dragXRef` (and the mirrored `dragging`/`dragX`
state) at the START of every gesture, not only at the end of a completed
one — the state a NEW gesture begins from must never be inherited from
however the PREVIOUS one happened to end.

**`starredCards`/`toggleStarredCard`'s marking is now visible somewhere,
closing the gap the first version's own comment flagged** ("nothing reads
it back anywhere yet"). `FlashcardRunner`'s intro screen now has a
"កាតសំខាន់" section listing every starred card for that lesson — official
or student-authored, reading the SAME flat id list the review screen's star
button writes to, so starring during a review and un-starring from the
lesson intro are the same action from two places, never two trackers.
Absent entirely, no empty state, when nothing is starred — an empty
"important" section reads as a mistake, not a feature, the same rule the
"your own cards" section already follows.

**`reviewHistory: ReviewResult[]` is a new store field — the EVENT LOG
behind `cardReviews`, deliberately separate from it.** `cardReviews` holds
each card's CURRENT scheduling state, one row per card, overwritten on
every grade; `reviewHistory` is one row per grade, EVER, appended (never
overwritten) by the same `gradeCard()` call, capped at
`MAX_REVIEW_HISTORY` (1000 — generous, months of real use) with the oldest
entries dropped first, the same rule `conversations` already follows.
Nothing reads it back yet; it exists so a future "how have you done on this
card over time" or "which cards keep coming back" view has real data
waiting rather than needing a second capture pass bolted on later. Local-
only, for the same reason `cardReviews`/`studentCards`/`starredCards` are.

**A THIRD swipe bug, and the React lesson in it is the reusable part: the
review card is keyed on the QUEUE POSITION, not on `card.id`.** Reported as
"the last swipe doesn't finish — it stays there unless I press the button,"
and the repro is narrow enough to miss by hand: swipe មិនទាន់ចងចាំ (left →
`"again"`) on the LAST card in the queue. `rate()` requeues an "again" card at
the end of the same session, so when the card graded is the last one the very
next presentation is THE SAME CARD — same `card.id`, next index. With a
`card.id` key React sees no change, keeps the existing `SwipeableFlashcard`
mounted, and that instance is still holding the `flyingOut` it set a moment
ago: `opacity: 0`, translated 140% off-screen, and `onPointerDown` bailing on
its own `if (flyingOut) return`. Measured before the fix: `opacity: "0"`,
`x: -512`. The card was gone and every gesture landed on nothing, which is
exactly why only the ✕/✓ buttons — which live in the PARENT — still worked.

The id is not the identity that state belongs to. `SwipeableFlashcard`'s state
is per-PRESENTATION (this drag, this fly-off), and the queue index is what
counts presentations; a card can legitimately appear at two positions in one
session. `key={`${index}-${current.card.id}`}` — the id kept only so the key
reads as more than a bare number. **The general rule: when a component's state
must reset on every ADVANCE, key it on the position, not on the payload's id —
they differ precisely when the same payload can appear twice in a row, and that
is the one case a manual test walks straight past.** Finishing by swipe was
never broken and was re-verified alongside: a right-swipe on the last card
still reaches `FlashcardSummary` and still ticks `tasks.flashcards`.

### "Again" schedules for later, and the intro is three PILES, not three counts

Two changes from the same piece of feedback, plus one crash the first of them
exposed.

**A card graded មិនទាន់ចងចាំ no longer comes back inside the same sitting.**
`schedule()`'s "again" branch used to set `dueAt` to TODAY and `ReviewSession`
pushed the card onto the end of its own queue, so it came round again before the
session finished. Overruled: being shown a card seconds after admitting you
don't know it teaches recognition, not recall. `AGAIN_INTERVAL_DAYS` (1) in
`utils/spaced-repetition.ts` is that decision, named so it is one edit to
revisit, and the requeue is gone from `rate()`.

That makes `liveQueue` a genuinely frozen snapshot (`useState(queue)`, no
setter), which is now load-bearing rather than leftover: grading writes to the
store, the caller recomputes `cardsFor`/`dueCardsFor` on that same render, and a
live `queue` prop would resize under the index mid-session.

**The intro's due/new/total readout is now ចងចាំ / មិនទាន់ចងចាំ / សំខាន់, and
each one is a BUTTON that opens a review of exactly the cards it counts.** The
old three were numbers a student could look at and do nothing with. These are
the other half of the change above: the card comes back later, and a pile is the
"later" the student controls rather than waits for. `rememberedCards`,
`notRememberedCards` and `importantCards` in `features/practice/review.ts` are
the queries — the first two read `ReviewState.lastGrade`, which the scheduler
already writes on every grade, so a pile's count and the cards its tap queues
cannot become two different things. **A never-graded card is in NEITHER of the
first two**, on purpose: lumping new cards into "not remembered" tells a student
they failed something they have never been shown. Those are what the main Start
button queues. The two-vs-four asymmetry is the usual one — "hard" folds in with
"again", "easy" with "good".

An EMPTY pile is a dimmed `<div>`, never a `<button>` — `subject-card.tsx`'s
zero-lesson tile, the survey's `StudiedStep`, `sidebar-nav.tsx`'s `href: null`
rows. `FlashcardRunner`'s `reviewing` boolean became a `QueueCard[] | null`
because there are four ways in now and each opens a different set. The
`កាតសំខាន់` list below is deliberately KEPT alongside the yellow pile: the
button studies those cards, the list is the only place outside a review to see
which they are and un-star one.

**THE REACT COMPILER CRASH THIS EXPOSED — read this before adding an early
return to any component in this repo.** Removing the requeue made
`/practice/flashcards/biology/1-1` go blank on the last card with `TypeError:
Cannot read properties of undefined (reading 'card')`, thrown from the RENDER
path, in a component whose source has a perfectly ordinary `if (done) return
<FlashcardSummary/>` guarding exactly that. The compiled output is the whole
story:

```js
const done = index >= liveQueue.length;
const current = liveQueue[index];
let t2;
if ($[2] !== completeTask || $[3] !== current.card.id || ...) {   // <-- throws
  t2 = function rate(grade) { gradeCard(current.card.id, grade); ... };
```

`rate` touched `current` ONLY as `current.card.id`, so the compiler narrowed its
memo dependency to that exact property path and emitted the check where the
closure is built — ABOVE the `if (done)` return that was written to protect it.
On the render after the final grade `current` is `undefined` and the dependency
check throws before the guard can run. It had survived the previous version of
the file only by luck: the requeue line `[...liveQueue, current]` used `current`
as a whole value, so the dependency was the harmless `current` instead.

**The rule: an early return that guards a possibly-undefined value must sit
ABOVE every closure that reads INTO that value, not merely above the JSX.**
Source order is what the compiler preserves; a guard below the closure protects
nothing. This is why `EmptyQueue` was extracted into its own component — so both
terminal screens could be one-line returns placed before `rate`. Neither `tsc`
nor `oxlint` can see this, and it does not reproduce until the very last item of
a list, so exercise the END of any such flow.

### A progress ring on both flashcard screens, and a line that says well done

Two additions asked for together, and they answer deliberately DIFFERENT
questions — which is the part worth keeping straight.

**`DeckProgressRing` measures the WHOLE DECK.** A mint arc for ចងចាំ, a pink arc
for មិនទាន់ចងចាំ, bare `--color-chart-track` for everything not yet answered,
and the remembered share as a percentage in the middle. It appears on the
lesson's opening screen (where it REPLACED a decorative `Layers` icon — same
position, same job as an anchor, except it now says something) and again under
the summary. `deckProgress()` lives in `features/practice/review.ts` with the
other pure queries, NOT beside the component: it is a query over `QueueCard[]`
exactly like its neighbours, and a non-component export from a `.tsx` trips
oxlint's `only-export-components` — the rule `utils/focus-styles.ts` exists for.

Three things in the drawing that are decisions, not incidentals:

- **Same SVG recipe as `features/progress/score-hero.tsx`** — `0 0 100 100`
  viewBox, `-rotate-90` so the arc starts at twelve o'clock, `strokeDasharray`
  against the circumference. The strokes are `var(--color-mint)` /
  `var(--color-pink)` / `var(--color-chart-track)`, the per-theme scale rather
  than `--brand-*`, because these are lines on a surface rather than fills under
  white text. That is what makes it correct in dark with no `dark:` override.
  The theming section lists hand-coded SVG donut tracks among the things a class
  toggle cannot reach; this is a third one, tokenised for that reason.
- **Butt caps, and a zero-length segment is not rendered at all.** Round caps
  overhang by half the stroke width, which turns the junction between the two
  arcs into an overlap and paints a visible dot where a segment has no cards.
- **The percentage is of the WHOLE deck, not of the cards answered so far.** One
  card right out of twenty is 5% of the lesson learned, not 100%, and the second
  reading would congratulate a student for work they have not done.

**The legend under the ring is OFF on the intro and ON in the summary.** The
intro's three pile buttons sit directly beneath it carrying the same two
numbers, and printing them twice a few pixels apart reads as a bug; the summary
has no piles, so without the legend its two arc colours go unexplained.

**`encouragementFor(remembered, total)` in `features/practice/encouragement.ts`
is about THIS SESSION, not the deck** — that is the whole reason the two live
apart. The summary's headline is the moment's feedback on the cards just
answered, and a line drawn from deck totals would say the same thing to someone
who just aced ten cards and someone who just failed them. It is DETERMINISTIC,
banded at 100 / 75 / 40 / >0 / 0: random would say something different for the
same result on a second look, which reads as the app not paying attention, and
one fixed sentence congratulating everyone equally is worse than none, because
a student who got two out of ten knows it isn't true. **The zero band never
scolds** — same forward-only rule the leaderboard applies to the current user's
own card.

That headline REPLACED the old "បញ្ចប់ការពិនិត្យ!" rather than stacking under
it; the Trophy and the "N កាត បានពិនិត្យ" pill already say the session ended.
Anything keying off that string (an automated check, say) needs a new marker.

**`progress` is an OPTIONAL prop threaded caller → `ReviewSession` →
`FlashcardSummary`.** `ReviewSession` only ever sees its own queue, and a
session is usually a subset of a deck, so it cannot derive deck-level progress
itself — it forwards. `FlashcardRunner` passes `deckProgress(all)` and
`practice-review.tsx` passes the whole catalog, each recomputed from the store
every render, so by the time the summary renders it already reflects the grades
just made. A caller with no meaningful denominator omits it and the ring simply
is not drawn — absent rather than empty, like the starred list and the retention
line before it.

**NOTE: the intro now shows TWO percentages** — the ring's real remembered share
and `mock-retention.ts`'s "ប្រូបាបចងចាំប្រហាក់ប្រហែល ~N%". The second is
explicitly a mock (its own file exists so it can never be mistaken for the
scheduler) and is now the weaker of the two. It was LEFT IN rather than removed
because nobody asked for it to go; if the doubling reads as confusing, deleting
the retention line is the intended resolution, not reworking the ring.

### A pile opens its LIST first, and a single question is reviewable on its own

Tapping ចងចាំ / មិនទាន់ចងចាំ / សំខាន់ used to drop straight into the cards.
It now opens **`PileList`** — that pile's questions, each one tappable, with
**ចាប់ផ្តើម** in the footer to run the whole pile. Two ways in, from one screen:
work the pile in order, or go straight to the one card you meant.

**This ABSORBED the separate `កាតសំខាន់` list that used to sit on the intro.**
That list showed the starred cards but could not open them; the សំខាន់ pile now
does both, and keeping both would have been two places showing one thing — the
same call made when the hub's Daily Review card was dropped. Un-starring is
still reachable without starting a review, which was that list's other job.

**`pile` is separate state from `session`, not one screen enum**, because the
two nest: a review started FROM a pile returns to that pile's list when it
ends, not to the intro, which is only expressible if the pile outlives the
session (`onExit={pile ? () => setSession(null) : exit}`). The main Start button
leaves `pile` null and still exits the lesson exactly as before. Tapping one
question is just `setSession([qc])` — a one-card queue, no special case anywhere
downstream, which is the payoff of `ReviewSession` taking a queue rather than a
deck key.

**A row is a `<button>` and its star is a SIBLING, never nested** — a button
inside a button is invalid, and the star has to stay independently tappable so
a card can be starred from the list without opening it. Same split the "your own
cards" rows already use for edit/delete. `PileList`'s empty state is reachable
only by grading a card out of the pile you are standing in; an empty pile's tile
on the intro is a dimmed `<div>` and cannot be tapped in the first place.

**Testing note that cost a re-run: Playwright's `getByRole(name:)` is SUBSTRING
matching by default.** `{ name: "ចងចាំ" }` also matches `មិនទាន់ចងចាំ`, and the
✕ button comes first in the DOM, so a grading loop silently rated every card
"again" and the piles came out 0/6 instead of 3/3. Pass `exact: true` whenever
one Khmer label contains another — which these two do by construction.

### The review card scrolls, and that made the gesture a THREE-way decision

Four fixes from reading real cards on a phone.

**The answer is `text-text`, not `text-mint`.** The back face is the longest
body of reading on the screen and mint-on-mint tint was genuinely hard to read
at length. The face keeps its mint border and `/8` background — that is enough
to tell the two sides apart without colouring the prose itself.

**Both faces are scroll containers.** The card is a fixed height so the deck
doesn't jump between a one-line card and a long one, which means a long answer
has to go somewhere; before this it simply overflowed, printing over the swipe
hint below and past the card's own rounded edge. The inner block is
`flex min-h-full flex-col justify-center`: centring on the SCROLL CONTAINER
itself would push overflow above the scroll origin where it cannot be reached,
while centring an inner block that is at least full height keeps a short answer
centred and lets a long one start at the top and scroll. `overscroll-contain`
stops a flick that reaches the end of the card carrying on into the page.

**`SectionContent`-style bullets are in the DATA, not the renderer.** Biology
1-1's question 2 answers "describe the four groups" with four groups, which read
as one wall of text; each now starts `"• "` in `data/practice.ts`. The card
renders `whitespace-pre-line`, so this is a plain content edit — nothing in the
component knows about it.

**The gesture now has THREE answers, not two, and this is the part to keep.**
Tap-vs-drag by distance was enough while the card could not scroll. Once it
could, a finger dragged up to read the rest of an answer was neither: it nudged
the card sideways, and on release the "never crossed the drag threshold" branch
FLIPPED the card out from under the reader. `gesture` (a ref, in
`swipeable-flashcard.tsx`) is `"pending" | "drag" | "scroll"`; the first movement
past `TAP_THRESHOLD` decides by AXIS — mostly-horizontal, on a viewport where
dragging is allowed at all, is a rating; anything else is the browser's to
scroll — and the decision is frozen for the rest of the gesture so a curving
drag can't change its mind. `"scroll"` releases do nothing: not a rating, and
pointedly not a flip.

**Two touch-specific traps came with it, and neither shows up under a mouse.**

1. **`pointercancel` is NOT a release.** Both were pointed at `handleUp`. The
   moment the browser claims a touch as a native scroll it fires
   `pointercancel`, often before the finger has travelled `TAP_THRESHOLD` — so
   `handleUp` was still sitting in its "never moved, so it's a tap" branch and
   flipped the card mid-scroll. `handleCancel` now drops the gesture and decides
   nothing.
2. **`touch-action: pan-y` has to be on the SCROLL CONTAINER, not just its
   ancestor.** The wrapper carried `touch-pan-y` and the faces did not, and a
   horizontal swipe on a scrollable card was cancelled by the browser after a
   single `pointermove` — so a card long enough to scroll could not be rated by
   swiping at all. The reason is that the browser resolves the permitted
   behaviour from the hit element up to the scrolling ancestor that will handle
   the pan; the face IS that scroll container, so its own `touch-action: auto`
   was what the browser read, and the wrapper's `pan-y` above it never came into
   it. Both faces now carry `touch-pan-y` themselves.

Verified with real CDP touch events (`Input.dispatchTouchEvent`) rather than
`page.mouse`, which is the only way any of this reproduces: tap flips; a drag up
scrolls the answer and neither flips nor grades; a swipe right still grades and
advances. **Re-verify with touch, not a mouse, after touching this file.**

**Also gone: the "អ្នកបានពិនិត្យអស់ហើយ! កាលវិភាគបន្ទាប់…" line** on the intro,
and `daysUntilDue` with it at that call site. It explained a wait that stopped
existing the moment due-ness became a priority rather than a gate — every pile
and the Start button are open whatever the schedule says, so a sentence about
when the next review is scheduled was answering a question the screen no longer
raises. `daysUntilDue` itself stays in `utils/spaced-repetition.ts`; it is a
correct pure function and the obvious thing for a future "next review" surface
to call.

### One subject's Quiz tab is a Mimo-style path instead of the plain list

`/practice/quiz/physics` renders differently from every other `/practice/:mode/:subjectId`
— a zigzag trail of square nodes over a dot-grid background, instead of
`PracticeLessonList`'s rows. This is a DESIGN SAMPLE requested ahead of the real
physics chapter/lesson/quiz content, which is still to be supplied — see the
header of `features/practice/quiz-path.ts`.

**`quizPathFor(subjectId)` decides which rendering a subject gets**, checked in
`pages/practice-subject.tsx` and gated to Quiz mode only — Flashcard keeps the
plain list on every subject, physics included. Physics is the only entry in
`QUIZ_PATHS` today; that map is a `Partial<Record<SubjectId, …>>`, the same
shape `SUBJECT_SESSIONS` uses, so a second subject is one entry rather than a
hardcoded `if (subjectId === "physics")` spreading across callers.

**The six nodes and their done/current/locked statuses are FIXED DEMO DATA**,
authored by hand rather than derived from real content or `completedSessions` —
the same explicitly-sanctioned move `features/progress`, `features/game` and
`features/leaderboard`'s `demo-data.ts` already make to preview a screen before
the real tracking behind it exists. **Every node is a non-interactive `<div>`,
even "done" and "current" ones** — `quiz-path-node.tsx` explains why: there is
nothing behind any of these sample ids yet, and a tappable node leading nowhere
is exactly the broken-app pattern this codebase avoids everywhere else. When the
real content lands, replace the file's contents with an authored structure keyed
the way `SUBJECT_SESSIONS` is (chapter → lesson), derive `status` the way
`sessionStatus()` does, and point each node at
`/practice/quiz/physics/{chapter}-{lesson}` — the same runner route the plain
list already links to — turning each node back into a real `<Link>`.

**The visual language is deliberately NOT a recolour of `subject-path-view.tsx`'s
Duolingo-style trail.** `quiz-path-node.tsx`'s badges are rounded SQUARES with a
Check/Zap/Lock glyph, not `session-node.tsx`'s circular discs, and the connector
between them (`ElbowConnector` in `quiz-path-view.tsx`) is two straight legs
meeting one `strokeLinejoin="round"` corner rather than the lesson path's smooth
cubic S-curve. The one thing kept IDENTICAL on purpose is the "lip" 3D press
effect (`0 5px 0` box-shadow, colour mixed toward black) — see `session-node.tsx`
for why that mix is the only one correct in both themes; it's what makes either
shape read as a physical button rather than a flat icon. Per-node curriculum text
also moved off the trail: with nothing authored yet there is no title to print
under six identical squares, so the one title that matters — what's next — lives
in the header pill above the trail instead.

**The header is TWO tiers, reusing pieces from `subject-path-view.tsx` rather
than a thinner invention — a plain single pill shipped first and read as
noticeably less finished than the rest of the app, so it was replaced.**

1. A subject summary card — `SubjectArt` + name + a progress bar over the WHOLE
   path — is the identical treatment the lesson path's own header already uses.
   `bg-surface` with the subject's tinted `--color-subj-*` border, never a solid
   fill: it's a card holding text and a thin bar, not white text sitting on one.
2. A solid-fill chapter/lesson banner directly below it, naming the CURRENT
   node — again the same banner `subject-path-view.tsx` prints before each
   lesson as the trail scrolls, carrying its own `0 4px 0 color-mix(...black)`
   lip so the two screens read as one material. The difference is cardinality:
   the lesson path prints one banner per lesson as you scroll past it, this path
   prints exactly one, because per-node titles are off the trail itself (see
   below) and this is the one place left to say what's current.
3. The current node ALSO carries the lesson path's `ចាប់ផ្តើម` bubble —
   `quiz-path-node.tsx` reuses the exact tail-pointing pill from
   `session-node.tsx`'s `isNext` treatment, not a new one.

**The dot grid takes its colour from the subject too**, via a pure CSS
`radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)` tile —
no image — reusing the already-per-theme `--color-border` token so the dots stay
subtle and correct in both themes with no new token. Only the connector strokes
and the progress/banner fills take the raw `--subject-*` value; the summary
card and its label stay on the tinted `--color-subj-*` scale, the same split
`SUBJECT_STYLE` draws everywhere else.

**Roadmap** (`features/roadmap`) — target grade/hours card, a "Pending Placement
Tests" card (only rendered for pending tests that **have a date** — an undated
one would render `Invalid Date`; flags "Overdue" once that date has passed), a "Daily Mission" quota card, and
the phase path. The phase plan is dynamically generated from real
`userData.weaknesses` plus `monthsUntilExam()` (`buildRoadmapPhases` in
`utils/roadmap.ts`) rather than a fixed list; phases with real lesson content link to Lessons,
others to Mock Exam. Daily Mission (`computeDailyMission`, same file) derives
lesson/practice/flashcard counts from a time-budget model — `GRADE_HOURS` scaled
by an urgency multiplier based on months left, split across the three activities
by assumed minutes-per-unit — not from dividing the real (currently tiny)
inventory by days left, which would produce near-zero counts. Flashcards are
hard-clamped to 2–6/day regardless of budget; lessons/practice have a floor, no
ceiling. Marking a mission row done calls the same `completeTask(key)` as Home's
daily checklist, so the two views share one real completion state.

**`/roadmap` HAS NO NAV ROW — reached from Home's "Quest Map" chip**
(`features/home/components/motivation-hero.tsx`), and from the survey, which
drops a fresh student straight onto it. Removed at the user's request for the
same reason `/streak` was: Home already carries the doorway, and the drawer had
grown past a phone screen. Note the onboarding lock made a nav row nearly
pointless here anyway — `ShellLayout` hides all chrome on `/roadmap` until the
pledge has been seen, so the student who most needs a way back never had one.

**Nothing books a placement test any more**, so `pendingPlacementTests` is only
ever non-empty for an account that scheduled one before that was removed. The
pending card, `schedulePlacementTest`/`resolvePlacementTest`,
`/placement-test/:subject` and `PlacementTestRunner` all still work and were left
in place — the route is reachable by URL and by that card. Its `scheduledTests`
filter (entries with a truthy `scheduledDate`) stays as a guard: undated entries
can no longer be created, but one left in a browser from the scrapped scheduling
work would otherwise render `Invalid Date`.

`PlacementTestRunner`'s `focus={false}` mode now has no caller —
`placement-test-page.tsx` always passes `focus`. The dual-mode branch is kept
rather than collapsed, so the inline mode is there if a test returns to the
survey.

**Progress dashboard** (`features/progress`) — score hero (SVG donut), Recharts
trend line + bar chart, subject breakdown w/ sparklines, focus areas, activity
heatmap, AI insights. Uses fake/demo data on purpose (see below).

**Game** (`features/game`) — asynchronous competitions between real students.
See its own section below.

**Grade Prediction** (`features/grade-prediction`) — `/grade-prediction` route
plus a Home widget, both fed by one source: `demo-data.ts`. Nine components plus
the rule-based model in `use-grade-prediction.ts`. Fake/demo data on purpose.

**Leaderboard** (`features/leaderboard`) — `/leaderboard`, five components over
one 30-student `demo-data.ts` and the pure ranking layer in
`utils/leaderboard.ts`. Fake/demo data on purpose, with one exception noted
below. Its own section follows.

**Streak** (`features/streak`) — TWO routes measuring TWO DIFFERENT THINGS.
`/streak` is the student's own solo streak (`demo-data.ts` + the milestone maths
in `utils/streak.ts`); `/streak/friends` is a SHARED streak with one friend,
which only advances on days BOTH of them finish (`friend-streak-demo-data.ts` +
`utils/streak-friends.ts`). Both take the COUNT itself from the store rather
than authoring one; the surrounding state is demo data. Their own sections
follow.

**Profile** (`features/profile`) — identity row (Google photo, editable name),
stats summary (reuses Home's `StatPills` as-is), a real **study calendar**,
grade/language card, and a Logout button that shows a Cancel/confirm step
before calling the store's `logout()` (resets name, survey, XP, level, streak,
the study log, tasks and exam history, sending the user back to the entry
screen). The calendar and identity row have their own section below.

**KruAI chat** (`components/shell/chat-overlay.tsx` + `server/chat-handler.ts`)
— real Gemini wiring, done. See the endpoint section above.

### The Game page is asynchronous competitions between real students

`/game` was the last screen running entirely on invented numbers — a fabricated
live match with two named students, HP bars, a frozen `01:24` timer, and a "Join
Game Now!" button with no handler. It is now a real feature, built to a design
the user specified:

1. A student **creates** a competition — subject, difficulty, and how many
   minutes to finish in — and takes the quiz immediately.
2. They see their score and **no win or loss**, because there is nobody to
   compare against yet.
3. The competition is **public**; other students see it and tap Play.
4. A joiner takes the **same questions** and sees the result at once, because the
   creator's score already exists. **Nothing is real-time.**
5. Many may join, and **each is measured against the creator only** — not against
   each other. That is what keeps a competition playable after the first person
   takes it, and it is the user's own framing.

**A BOT DUEL WAS BUILT FIRST AND REPLACED.** The opponent was a simulated bot
that actually played against you. The user asked for real students instead, so
`bot.ts`, `bot-chip.tsx`, `planBotTurns` and the `?bot=` param are all deleted.
**Nothing a student ANSWERS is ever scored against a simulated opponent** — a run
is compared only to a real person's recorded run. Don't reintroduce a bot as a
"fallback opponent" for an empty app. (The hero card's decorative scoreline is a
separate thing, requested deliberately — see the hub section.)

**IT IS CROSS-USER NOW.** Built in two passes — stage A on one device, stage B
the server — and both are in. A competition is written locally AND published to
`public.competitions`; the hub's Challenge Someone card lists other students'
competitions; `/game/play/:competitionId` fetches one and records an attempt.

**THE MIGRATION IS APPLIED BY HAND.** `20260913000001_competitions.sql` is run in
the Supabase dashboard's SQL editor — once, on the one project that now exists
(see the Supabase section). Until it is, `npm run db:check` reports `2 of 10
tables missing` and the browse list shows its failed state while everything else
on the page keeps working. That degradation is deliberate, not a fallback bolted
on afterwards.

`PreviewTag` still stays, for the one reason left: the hero card is decoration by
request. Everything else on the page is real.

#### Two denormalisations, both load-bearing, neither a shortcut

**`Competition.questions` is the FROZEN question set**, not an index or a seed
into `data/game-questions.ts`. A joiner must answer exactly what the creator
answered, for as long as the competition exists — and since content is
explicitly arriving later, an edit to that file is not hypothetical. A reference
would silently re-point an old competition at different questions.

**`Competition.creatorName` is the creator's display name, copied onto the row.**
This is the security decision in the whole feature. The result screen has to name
who you were up against; the obvious way to get that is a policy letting everyone
read `profiles` — and that table holds **email, age and location**.
`supabase/migrations/20260828000002_rls_policies.sql` already forbids exactly
that policy, having hit the same temptation for the leaderboard. Carrying the
name on the competition is what lets the row be world-readable while `profiles`
stays owner-only. **Do not "tidy" this into a join.**

`CompetitionAttempt` carries the same idea one step further: it stores BOTH
halves of the comparison (`opponentName`/`opponentScore`/`opponentMs`, plus
`subject` and `total`), so the history list renders without the competition it
refers to. Once competitions live on the server a joiner has no reason to keep
one, and the alternative is a second read per history row and a history that
goes blank offline.

The cost of both, stated so it is not mistaken for a bug: **a student who renames
themselves does not rename their old rows.**

#### One clock for the whole quiz, and speed breaks ties

`MATCH_MINUTES` is the budget the creator picks from, and it covers the whole
run. A per-question countdown was built first and removed: with a total budget as
well, two clocks on one screen can contradict each other. One budget is also what
makes two runs comparable — both students had the same time, so the only
difference is what they did with it.

**Running out does NOT discard the attempt.** It submits whatever was answered.
The unanswered questions already cost the points; throwing the run away on top
punishes a slow reader twice. Elapsed time is capped at the deadline so a
backgrounded tab, where the interval stops firing, cannot report a run longer
than the budget it was given.

**`outcomeOf()` takes two runs, not two scores, because SPEED BREAKS TIES.** With
five questions a draw is the likeliest outcome of all, and "you both got 4" is a
flat thing to show someone who just raced. The result screen shows both times
under both scores always, and names the tie-break only when it actually decided
the match — so the first time it settles one it does not read as the app picking
a winner at random.

#### The routes, and why both are static-prefixed

| route | screen | nav | KruAI |
| --- | --- | --- | --- |
| `/game` | hub: hero, your competitions, your record | shown | shown |
| `/game/create` | form → run → posted | hidden | blocked |
| `/game/play/:competitionId` | a joiner's run → result | hidden | blocked |

`isGameRunRoute()` is `startsWith("/game/")`, so `/game` stays a PLACE with its
navigation and only the two task routes hide it — the same trailing-slash rule
`/lessons/` follows. Both task routes are **static-prefixed**, so the
`/lessons/:lessonId` versus bare `/lessons/:subjectId` ambiguity
`pages/subject-path.tsx` documents cannot arise here at all.

It is added to **`isAssessmentRoute()`** as well, which used to be the placement
test alone: a timed competition against a scored opponent measures rather than
teaches, so "a mentor on tap measures the mentor" applies exactly. Detection is
by pathname and never by the store's `focusMode` flag — `use-focus-mode.ts` warns
that borrowing that flag for a second meaning is how the two questions come
apart, and the pathname version also means a browser-back mid-run restores the
navigation with nothing to unset.

**`/game/create` holds three phases in one route** (form → run → posted) because
the middle two cannot be linked to: a competition does not exist until its
creator has played it. The joiner's side IS linkable and is its own route.

**The create route is GATED, not just its button.** A guest has no id to post
under. The gate renders inside `FocusLayout` rather than `LockedFeature` — this
is a focus route, so the navigation is already hidden, and `LockedFeature`'s
panel expects the nav to still be around it (see its own note). Dropping it in
here would strand a guest with no way out, the trap `ShellLayout`'s `roadmapLock`
had to grow `hasFullAccess` to avoid.

#### The hub keeps the ORIGINAL page, and its hero card is deliberately fake

The rebuild first replaced the hero with an honest "you vs an empty slot" panel —
no opponent, no scores, no bars — and reorganised the page around it. **The user
overruled that and asked for the original page back**, and both halves of that
are recorded here because they look like regressions and are not.

**The layout is the original**: the gradient hero, `My Game Stats 🏅` with its
four-stat strip and three-segment bar, and two cards side by side below. The
sections below the hero are `My Competitions ⏳` and `Recent Games 📜`.
`Challenge Someone 👊` is NOT one of them: that card listed invented classmates
with ranks, an Online dot and a Play button that did nothing, and a real roster
needs cross-user reads. When stage B lands, the public list takes that slot and
its name back.

**The hero card is decoration, by request.** The opponent, both scores, the HP
split, the subject, the question progress and the clock all come from
`features/game/demo-data.ts`. Two things on it are real: the LEFT fighter is the
signed-in student (display name, and their Google photo when they have one), and
the button, which reads Create Game Now and routes to `/game/create`.

That is a deliberate product decision rather than an oversight, and it is why
`PreviewTag` stays on this page. **The rule this codebase actually holds to is
not "no sample data" — it is that sample data must be LABELLED**, which is what
that pill is for and what `preview-tag.tsx` says in its own header. Every other
section on the page is real and derived from the store.

Don't quietly make the fake numbers real by wiring them to a competition: the
card would then be claiming a live match, which is the one thing this feature
cannot do. If it should stop being decorative, it becomes a "you vs your latest
joiner" panel — a separate decision to take with the user, not a tidy-up.

**Every card below the hero is absent until it has something to say**, and the
conditions live in `pages/game.tsx` rather than inside each card so the
responsive grid does not keep an empty cell. A first-time `/game` is the hero
alone.

**`gameStats()` derives every number from the attempts.** The original card
carried seven hand-authored ones that disagreed: `winRate: 75` beside bar
segments describing a 69% win share. Two traps it now avoids: `winRate` is 0 when
nothing has been played (the alternative renders `NaN%`), and the three bar
segments are **two rounds plus a remainder** — three independent `Math.round`s
sum to 101 and overflow the track.

#### Bilingual, not Khmer-only — and this also reversed

An earlier pass put the feature behind a `GAME_PAGE_LANG = "km"` constant,
reasoning that it is a subject-first screen like Study, Exam and Practice. **The
user overruled that too**: the page follows the store's `lang`, like Home,
Progress, Profile and the Leaderboard. That is the better fit — the chrome here
is gamification labels over numbers, not curriculum, so an English column is
ordinary translation rather than the fabrication the Khmer-only rule exists to
prevent. The constant is gone; copy lives in `features/game/copy.ts`, the way
the streak and exam features own theirs.

**THE QUESTIONS THEMSELVES ARE NOT TRANSLATED**, on the user's explicit
instruction: competition content renders exactly as supplied. `ExamQuestion`
still carries an `{en, km}` pair because it is shared with `MOCK_QS` and the
placement test, so game content may simply carry the same string in both — which
is what "no need to translate" means in practice: nobody is asked for a second
version.

**The known consequence, so it is not mistaken for a bug:** `SubjectMeta.name` is
a bare Khmer literal, so subject names render in Khmer inside the English page.
That was the whole argument for Khmer-only, and it was weighed and set aside.
Giving subjects an English name is a change to the shared catalog and affects
Study, Exam and Practice too — don't make it here.

`copy.ts`'s `relativeDay()` is hand-written rather than `Intl`: desktop Chrome
formats `km-KH` in English with no warning.

#### Content, and the difficulty that does nothing yet

`data/game-questions.ts`'s `GAME_QUESTIONS` is **empty, and that is the normal
state** — the `PAST_PAPER_QUESTIONS` discipline. `gameQuestionsFor()` falls back
to `GENERATED_EXAM_QUESTIONS`, so math and biology are playable today from the
5+5 real questions `MOCK_QS` already holds; every other subject is a dimmed,
unselectable tile on the create form. That fallback is one `??` clause to delete.

`ExamQuestion.difficulty` is **optional and set on nothing today**, so every
difficulty filter is currently a no-op and a competition is a shuffled slice of
the subject's pool. That is the accepted prototype behaviour — the user said as
much, that a few similar exercises are fine for now — not a bug, and tagging
content later starts the filter working with no code change. `pickQuestions()`
falls back to the unfiltered pool when a difficulty matches nothing, because an
empty set would post a competition nobody can play.

#### The store

`competitions` and `competitionAttempts` are persisted, capped at
`MAX_COMPETITIONS` (50, oldest dropped first), and cleared by `logout()`. No
persist `version` bump — new keys with defaults are handled by `merge()`.

**Both actions mint their own `id` and timestamp.** `newId()` and `Date.now()`
are impure, and calling either from a component body is what oxlint's
`react(purity)` rule and the React Compiler both object to — it was caught by
lint on the first pass. Same shape as `addChatMsg`.

**They are deliberately ABSENT from `syncRelevantChange`, and they stay absent
now that the server exists.** They reach it through `lib/competitions.ts`, which
writes each row once, rather than through the snapshot push — see that file's
section below for why routing them through `pushLocalState` would delete other
students' challenges. An earlier draft of this paragraph said stage B must add
both to that list; that would have been the bug.

Results never touch `examResults` — that array captions Home's "from mock exams"
pill and feeds `chat-prompt.ts` an average it states to KruAI as fact, the same
reason practice, past-paper and placement attempts are all kept out.

`GAME_XP_PER_CORRECT` in `utils/rewards.ts` is defined **as `QUIZ_XP`** rather
than as a second `10`, so the two cannot drift. No coin override: the actions
route through `award()` with no coin argument, so the default ratio applies and
this does not become the third hand-set coin figure `lib/store.ts` warns about.

#### The React Compiler guard, in a component that owns a timer

`competition-run.tsx` cannot use the usual `if (done) return <Summary/>` at the
very top, because a hook cannot be skipped and it owns the clock. The order is
therefore **every hook first, then the terminal guard, then the closures that
read into `questions[index]`** — which satisfies both rules at once. The header
there explains it in full. Per-question state lives in the keyed child, so
nothing in the parent needs a per-question effect.

`scripts/shots.mjs` gained `focus-game-create` and `focus-game-run`, and its seed
gained `competitions`/`competitionAttempts` — without them `/game` photographs
the hero alone, since every other card is hidden when empty.

#### The server layer — the app's first cross-user data

`20260913000001_competitions.sql` adds `competitions` and `competition_attempts`,
and with them **the first policy in this schema whose `using` clause is not an
ownership test**:

```sql
create policy "competitions: read all"
  on public.competitions for select to authenticated using (true);
```

**Why that is safe is a property of the ROW, not of the policy.** A competition
carries a subject, a difficulty, a time budget, a frozen question set, the
creator's score and their display name. No email, no age, no location.
`creator_name` is denormalised precisely so this feature never needs a policy on
`profiles` — which `20260828000002_rls_policies.sql` explicitly forbids, having
hit the same temptation for the leaderboard. **Do not replace it with a join.**

`competition_attempts` is deliberately NARROWER than the competition it hangs
off: readable if it is yours, or if you created the competition. That is the
product rule in SQL — every joiner competes against the creator, so a joiner sees
only their own result and the creator sees everyone. Joiners never see each other.

**Neither table has an UPDATE policy, and that is not an omission.** A
competition is a fixed challenge and an attempt is a result; both being editable
after the fact would silently rewrite outcomes already shown to other people.
Insert-once, delete-if-you-must. `unique (competition_id, user_id)` is what stops
a student re-rolling a bad run until they beat the creator — the client reports
that duplicate as "already played", not as a failure.

**`competitions.id` is `text`, not `uuid`**, for the same reason
`conversations.id` is: it is minted client-side by `newId()`, which falls back to
a `c<base36>` string where `crypto.randomUUID` is missing.

#### `lib/competitions.ts` — deliberately NOT part of the sync layer

Two differences, and both matter:

- **`supabase-sync.ts` pushes a DESTRUCTIVE SNAPSHOT** of one student's own
  tables. A competition is not exclusively owned by the device that posted it —
  other students' attempts hang off it — so a snapshot push would delete
  challenges other people were part-way through the moment a browser was
  cleared. Competitions are therefore written ONCE, when they happen, and never
  re-pushed.
- **That layer swallows every error by design.** This one reads other people's
  rows and writes things a student is waiting on, so every function returns a
  `Result<T>` with a reason rather than throwing or logging.

**So `competitions`/`competitionAttempts` stay OUT of `syncRelevantChange`.** An
earlier draft of the store's own comment told stage B to add them; that would
have been the bug, and both comments now say so. The one-to-one between
`partializeState` and that list has two documented exceptions for this feature.

The store mints each row's `id` and timestamp, and the page **reads the row back**
(`getState().competitions.at(-1)`) before publishing, so the server gets the same
id the device has. Minting a second one at the call site would give the two
copies different identities and a joiner's attempt would point at neither.

**The local write always happens first and unconditionally.** Publishing can fail
— offline, unconfigured, a signed-out session — and when it does the student
keeps their own record of the run and `PostedView` says the competition was not
shared, rather than claiming it is waiting for joiners nobody can see.

#### `Competition.sharedAt` and the retry — a real bug, found on a real account

The first version assumed every locally-saved competition had also reached the
server, so `MyCompetitions` labelled all of them **"open for joiners"**. The user
had created one before the tables existed; it sat on one device, unjoinable, with
the hub insisting it was open. The label was simply false.

**`sharedAt` is OPTIONAL rather than a boolean**, and that is what makes it work
with no migration: every competition already in a student's browser lacks the
field, and `undefined` reads correctly as "never shared".

`features/game/share-pending.ts` retries them, mounted by the hub — the page that
lists those rows and makes the claim. Three decisions in it:

- **A duplicate counts as SUCCESS.** `competitions.id` is the primary key, so a
  unique violation means the row is already up there — which is exactly what a
  publish that landed just before the app closed looks like. Treating it as a
  failure would retry forever and never clear the label.
- **`unconfigured`/`unauthenticated` stop the whole pass**, rather than failing
  each row in turn: neither is fixed by trying the next competition, and a guest
  browsing the hub should cost nothing.
- **The in-flight guard is MODULE-LEVEL, not a ref.** This creates a remote row,
  and StrictMode gives each of its two effect passes its own ref — the exact trap
  that once produced two anonymous users per page load. Module scope is what
  makes "once per browser" mean once.

It runs on arrival rather than on a timer: that is when a student is looking at
the list, and a background loop would spend a phone's battery on a table nobody
is reading.

#### One attempt per competition, enforced in THREE places

Replaying until you beat the creator would make every score meaningless, so
`unique (competition_id, user_id)` sits on the table. That alone was not enough,
and the gap is worth remembering: the database refused the second ROW while the
app happily ran the quiz again and `addCompetitionAttempt` paid XP and added a
local history row each time. **The score stayed fair and the rewards did not.**

So the rule is now stated at all three levels, and each covers a case the others
cannot:

- **The database** — the only one that is authoritative, and the only one a
  hand-crafted request cannot get around.
- **The browse list** DROPS a competition once it has been played, rather than
  showing it with a result chip. It briefly did the latter and the user asked for
  the removal: a browse list is what you CAN play, the result already lives in
  Recent Games, and a list that only grows is one a student stops reading.
  `fetchMyAttemptIds()` is what makes that hold across devices — the local
  attempts only know this phone.
- **`/game/play/:id`** shows the stored result rather than the questions, and
  `finish()` carries a final guard for the race where someone reaches it anyway.

`fetchMyAttempt()` is what makes it hold ACROSS DEVICES: the local store only
knows this phone, so without asking the server a student could play on a laptop
and again here and be paid twice. It deliberately does NOT block the screen — a
failed check leaves it null and the local guard still applies, because being
offline should not mean being unable to play.

#### Avatars are DERIVED, and that is a privacy decision

Every row in the browse list and the history shipped with a hardcoded
`seed="sreyroth"`, so two different students were visually identical — which
defeats the point of a face. `utils/avatar-seed.ts` replaces it: an FNV-1a hash
of the account id picks one of the 30 avatars already in `public/avatars/`.

**THE REAL PHOTO WAS CONSIDERED AND REJECTED.** Only the CURRENT student’s Google
photo is available to the app. Showing anyone else’s means copying their photo
URL onto the world-readable competition row the way `creator_name` already is —
publishing every student’s face to everyone in the app. For a school app that is
a real step, it needs a migration, and old rows would need a cartoon fallback
anyway. A face here exists to tell two classmates apart, which a consistent
cartoon does just as well. A student’s own photo still shows on Profile and the
hero card, where only they see it.

Two properties the hash must keep, both in the file’s own header: it is
**deterministic and arithmetic** (the same student must look the same on every
OTHER student’s screen, not just their own), and **the list order is part of the
output** — adding a 31st avatar reshuffles everyone, which is free today and
would not be once a classroom recognises each other.

`CompetitionAttempt.opponentId` exists for this and nothing else, so a past
opponent keeps the face they had in the list. Optional, falling back to the
name, so older attempts still render — the same no-migration reasoning as
`sharedAt`.

#### The first UI that awaits the network

`open-competitions.tsx` is the exception to `lib/supabase.ts`'s rule that nothing
in the UI may depend on the client being present. It honours the spirit of that
rule instead of breaking it: **nothing blocks first paint.** The hub renders
instantly from the store and this one card fills in underneath, with its waiting
states as quiet inline lines inside a card that already occupies its space — no
full-page spinner, and no layout that jumps when the answer lands.

No skeleton rows, on purpose: a list of grey bars pretending to be content is a
bigger lie than one muted sentence. A guest is offered sign-in rather than an
empty list — they are not missing data, they are missing an account. And the
whole section **renders `null` when Supabase is unconfigured**, so a fresh clone
and the blanked-env screenshot harness see nothing at all rather than an error
about a state that is supported by design.

**Both async components derive their display state during render and only ever
call `setState` from an async callback**, never synchronously in an effect body —
oxlint's `react(set-state-in-effect)` caught the first version of both. "Guest"
is derived from the session rather than pushed into state, and the opening
"loading" comes from the initial value. Each effect also waits for
`authStatus !== "loading"`: RLS gives an unauthenticated caller nothing, so
firing early would show a failure and then fetch again a moment later.

### Leaderboard — THREE boards, not one board with three columns

This is the load-bearing idea and the easiest one to "simplify" away. Streak, XP
and study time are ranked **independently**: the same student is #18 on XP, #12
on streak and #24 on study time, and all three are correct at once. There is no
composite score anywhere in `utils/leaderboard.ts`, deliberately — a composite
lets hours-in-app buy a rank that learning is supposed to earn, which is the one
thing this screen must not teach. Study time is shown because effort deserves to
be seen, and kept in its own ranking for the same reason.

`utils/leaderboard.ts` is pure and owns the maths and the wording;
`features/leaderboard/demo-data.ts` owns the roster and satisfies the interface
the utils file declares (same direction as `utils/gradePrediction.ts` — utils
never imports from `features/`). Five components:
`leaderboard-view` (state + both observers) → `personal-summary`,
`leaderboard-controls`, `podium`, `ranking-list`, `sticky-user-card`.

Things worth knowing before editing it:

- **Only WEEKLY numbers are authored.** Monthly and all-time XP/minutes are the
  weekly value times one per-student factor, because a student who put in a
  heavy month earned more XP *and* logged more minutes that month — one factor
  for both is the honest model, not a shortcut. The boards still reorder between
  periods because the factors differ per student. **Streak cannot be scaled that
  way** (4× "days in a row" is meaningless), so `streakMonth` / `streakAllTime`
  are explicit numbers, and are >= the weekly streak by definition.
- **Titles come from ALL-TIME XP, never from the board on screen.** A title is
  who the student has become across the whole app; it must not flicker between
  "Scholar" and "Expert" as they tap between tabs.
- **Ties get ordinal ranks (…#11, #12…), not shared ones.** Every "N more to
  reach #X" line is written against the row directly above, and a shared rank
  makes that sentence point at nothing. Ties break on the other two metrics then
  on name, so the order is stable across renders.
- **`gapToNext` takes no metric** — every row already carries the selected
  metric's `value`, which is what makes it impossible to compute the gap against
  a different board than the one being rendered.
- **The student's NAME is the one live value on the page**, read from the store
  at render time; the row's `name: "You"` is only a fallback for a logged-out
  render. Their stats are demo like everyone else's, for the reason Progress and
  Game are: a real new user has 0 XP and would sit alone at the bottom of an
  empty board.
- **Messaging is forward-only for the current user.** Peer rows show movement
  both ways in one neutral grey; the student's own card renders a change badge
  only while it's positive, and always pairs the rank with a next step. A red
  "down 2" on your own card turns an ordinary quiet week into a public failure.
- **The sticky card is `sticky bottom-0` as the LAST child of the scrolling
  column**, not `fixed` — it floats over the list while there's list left, then
  lands in place at the end. It is unmounted while *either* the summary card at
  the top *or* the student's own row is on screen (two `IntersectionObserver`s,
  the row one re-run on metric/period because a new board can put a different
  DOM node under the ref); watching only the row floats a duplicate over the
  podium at first paint. `rootMargin` cuts the bottom 150px — that band is the
  tab bar plus the card itself, and without it the row counts as visible while
  sitting underneath the very card being dismissed, and the two flicker.
- **`pr-16` on the sticky card is not decoration.** The chat FAB is absolutely
  positioned over the bottom-right of the scroll area at every width; at
  lg/1024 it lands exactly on the card's right edge. The gutter is where it
  sits.
- **The ranking row carries the app's only intentional internal breakpoint.**
  Supporting stats sit on the row's second line under 768px and move to their
  own right-hand column from `md`. That does not contradict the "nothing inside
  a card needs a breakpoint" rule — the row *is* the layout here, not a card
  inside a responsive grid.
- The spec for this screen wrote the metrics as 🔥/⭐/⏱; they are **Lucide
  icons** (`Flame`/`Star`/`Timer`) for the same reason the rest of the app is.
  The podium medals stay emoji — 🥇🥈🥉 have no Lucide equivalent that reads as
  "first place". Podium rings are the app's own accents, not gold/silver/bronze
  metallics: a metallic gradient is the casino look this screen avoids, and
  neither #c0c0c0 nor #cd7f32 survives the flip to dark.
- The "You" chip is `bg-[var(--brand-purple)]`, **not** `bg-purple` — white text
  on a fill, so it takes the brand scale. See the two-accent-scales note in
  `globals.css`.

`metric` and `period` are component state, not store state: they're how the
screen is being looked at right now, not something a reload should inherit.
Defaults are **XP + Weekly**. Nothing is precomputed — `rankBoard()` re-sorts 30
rows on every change, which is free at this size and is what stops the summary,
the podium and the sticky card from ever disagreeing.

**24 new avatars** were downloaded into `public/avatars/` for this roster (same
DiceBear `adventurer` style and default params as the existing six). The rule in
the Game section still holds: a new `avatarSeed` needs a matching SVG on disk,
there is no live-generation fallback.

### Streak — one number, and the one demo screen that visibly contradicts the app

`/streak` fills the gamification gap the app's own `streak` field had never been
given a screen for. Built to a supplied brief: hero count, weekly tracker,
today's goal with a simulated "complete" button, milestone progress, milestone
grid, in that order — which is the brief's stated visual hierarchy and also the
order a student reads the answer to "why is my streak 12".

**IT IS A PROTOTYPE, and the brief said so** — hardcoded numbers, one simulated
interaction, no backend, no real streak derivation. Same explicitly-sanctioned
move `features/progress`, `features/game`, `features/grade-prediction` and
`features/leaderboard` already make.

**THE COUNT COMES FROM THE STORE, AND THIS WAS A REAL BUG ONCE.** The page first
shipped with its own `DEMO_STREAK = 12` while `lib/store.ts` seeded `streak: 3`,
so Home's stat pill and the global `StatBar` — which renders on every ordinary
screen, about forty pixels above this page's own hero — said 3 next to a hero
saying 12. One fact, two hardcoded numbers, guaranteed to disagree. The user
caught it.

The store's `streak` field is the single source, and **every surface reads the
field**: Home's `StatPills`, `StatBar`, both `/streak` screens and the mentor
prompt. `demo-data.ts` exports no count and carries a note not to reintroduce
one.

**THE COUNT IS REAL NOW.** It was a seeded `DEMO_SEED_STREAK` of 12 that nothing
incremented, and this section used to promise that "the day a daily activity log
exists, the constant is deleted and the field is derived, and no consumer
moves". That happened, exactly so: the store's `activityLog` is the log,
`currentStreak()` derives the field, the constant is gone, and not one consumer
changed. See "Profile's study calendar" below for the rule and the mechanics.

**The migration chain ends at v4.** The v2 → v3 step once lifted the seed 3 → 12
(every stored 3 was the old default, never earned). The v3 → v4 step replaces
it: every stored streak, 3 or 12, is a seed, there is no history to derive a
real one from, so it becomes 0 until the student studies. **From v4 on the
stored number is derived from the student's own log, and a future step must
never touch it.** `index.html`'s pre-paint guard is `saved.version >= 2`, still
true.

**The rule is the one this page always stated: a day counts only when the daily
goal is complete.** `STREAK_COPY`'s rule line was written for the prototype and
was briefly FALSE once the count became real, because the first version counted
any day with XP. The user settled it — the goal, not XP — so the copy needed no
change; the code came to it.

**⚠ Still demo, on the user's explicit decision (11 Sep 2026):** the goal card
(`DEMO_DAILY_TASKS`), its "Complete Today's Goal" button (+1 and confetti, local,
gone on reload) and the weekly tracker's ticks (`DEMO_WEEK`, `TODAY_ID = "sun"`).
Offered the choice of making the card real, they chose to keep it a demo. So
this page now shows a REAL count beside simulated surroundings, and its week
disagrees with Profile's calendar. `demo-data.ts`'s header records what making
each real involves; don't do it unasked.

The one remaining disagreement is transient and deliberate: the celebration's
+1 is local and unwritten, so for a few seconds the page shows 13 while the bar
shows 12. That is a demo action the student just took, not the resting state
drifting.

**The brief contradicted itself once, and the resolution is recorded in
`demo-data.ts`.** It asked for the goal card to read "3 / 3 tasks completed ·
Streak maintained! · ring at 100%" AND for today to be un-ticked on the weekly
tracker, for the button to complete it, and for that to take the streak 12 → 13.
Those cannot all be true of a day that is already finished. 3/3 is plainly the
AFTER state, so the card opens at 2/3 and lands on 3/3 on the tap. One task
outstanding rather than three also makes a single "Complete Today's Goal" button
honest — it finishes what is left instead of silently clearing a whole day.

**The three daily tasks are the store's REAL `Tasks` keys** — lesson / practice
/ flashcards, the same three Home's checklist and Roadmap's Daily Mission
already share one completion state for. Keeping the ids identical is what makes
the eventual swap a rename rather than a redesign. Nothing here calls
`completeTask()`, and that is not only the brief: that action awards real XP and
coins, so wiring the button to it would pay a student for pressing a demo.

**Bilingual, NOT Khmer-only** — deliberately breaking with the newer
`LESSONS_PAGE_LANG` / `EXAM_PAGE_LANG` / `PRACTICE_PAGE_LANG` convention. That
rule exists for screens whose CONTENT is Khmer curriculum, where an English
column would be fabrication dressed as data. Nothing here is curriculum; it is
gamification chrome like Home, Progress, Profile and the Leaderboard, and all
four of those follow the store's `lang`. Copy lives in `features/streak/copy.ts`
rather than `data/translations.ts`, the same way the exam and leaderboard own
theirs.

**"Streak" is never translated**, in either the page copy or the nav item — a
product term, on the user's explicit instruction (the previous
`ជួរជាមួយមិត្ត` reading of it did not make sense). Same call already made for
KruAI, and for "Flashcard"/"Quiz" in `translations.ts`'s own km column. The
Khmer copy still spells the MEANING out as ថ្ងៃជាប់ៗគ្នា where it matters, so
nothing has to be guessed from the loanword. Digits stay Latin throughout,
matching `StatBar`'s own streak pill rather than the Khmer-numeral convention
the curriculum pages use.

**`--brand-flame-from/to` is a THIRD brand-scale pair, and it exists for a
contrast reason.** Fire wants `--brand-yellow`, which is 2.1:1 with white and
fails outright. `#ea580c → #e91e8c` is 4.2:1 and 4.6:1, so the ramp carries the
white flame glyph (3:1 for a non-text graphic) and survives `bg-clip-text` as
the huge count (3:1 for large text, measured 4.1:1 light / 4.3:1 dark). **It is
NOT for normal-size white text** — the page's CTA stays on `bg-brand` for
exactly that, since a 16px bold label needs 4.5:1. `--shadow-flame` is the one
shadow kept COLOURED on dark, because a black shadow under a glowing object is
the wrong physics.

**Three animations, all transform/opacity, all in the reduced-motion block.**
`streakBreathe` is the only loop and drives exactly ONE element — the Roadmap's
mistake was putting a pulse on a dozen nodes at once. `streakPop` and
`streakConfetti` are one-shots fired by the tap. The confetti's fourteen
particles are a FIXED TABLE at module scope, not `Math.random()`: a random burst
re-rolls on every render, so one re-render mid-flight would teleport every
particle onto a new path. Nothing travels more than 96px from centre, which is
what keeps the burst inside the card at the 320px floor — `scripts/shots.mjs`
treats a sideways-scrolling page as a hard failure, and there is now a
`streak-complete` route in it that photographs exactly that state.

**`completed` is one boolean and everything is derived from it** — the count,
the week's last cell, the goal ring, the milestone bar and the grid — so they
cannot disagree about whether today is done. `celebrating` is separate and
short-lived because it drives only the one-shots; folding the two together would
either leave the confetti on screen forever or revert the streak when it
cleared.

**`useCountUp` reads `from` off the last value PAINTED, not the previous
target.** Those differ whenever the target moves again mid-tween, and taking the
previous target makes the number jump backwards before setting off again. The
ref is only written inside the effect and the frame callback, never during
render, which is what keeps it safe under the React Compiler.

**Milestone states are told apart by more than colour** — a tick, a filled
flame, a padlock — because the grid is the one place on the page where the state
IS the information. Every card is a `<div>`: there is nothing behind a milestone
to open, and a control that answers a tap with silence reads as broken
(`sidebar-nav.tsx`'s `href: null` rows, the survey's `StudiedStep`,
`subject-card.tsx`'s zero-lesson tile).

`milestoneProgress()` returns `null` once every rung is passed and the caller
renders nothing, rather than a bar pinned at 100% under "0 days until your next
milestone" — the same absent-rather-than-empty rule the starred list and the
retention line already follow.

**`/streak` HAS NO NAV ROW, AND THAT IS ON PURPOSE — DON'T ADD ONE BACK.** It
briefly had one and it was removed at the user's request, along with
`/roadmap`'s, for the same reason: the drawer had grown past a phone screen, and
this page already has a natural doorway in **Home's Flame stat pill**, which
shows that very number and links to it. A nav row would be a second entrance to
a screen the student is looking at the summary of. `StatPills` is the only place
that link exists, and it is the only one of its four pills that links anywhere —
the other three have no page to open, and a control that answers a tap with
silence reads as broken. The pills render as a `<Link>` or a `<div>` from one
shared class string so the linked one cannot drift visually from its neighbours.
`StatPills` is reused as-is on Profile, so the doorway is on both screens.

**`/streak/friends` DOES keep its nav row**, because nothing on Home hints that
it exists. Its icon is `Users`, not `Flame` — that was already true when the two
sat near each other, and it still distinguishes the social half.

`bottomNavItems` survived both removals unchanged: it takes Progress by
`featureNavItems[0]`, still index 0, and Game by id — which is exactly why that
lookup is by id rather than position. See its own comment.

### Streak with Friends — a SHARED streak, and the rule is the whole feature

`/streak/friends` fills the `friends` nav item that had sat as a disabled "Soon"
placeholder since the beginning — the same way `/practice` filled `flashcards`.

**IT SHIPPED ONCE AS SOMETHING ELSE AND WAS REPLACED WHOLESALE.** The first
version ranked seven friends by their individual streaks — a small leaderboard.
The user asked for the TikTok/Snapchat mechanic instead: one friend, one streak
held jointly, which **advances only on days BOTH people finish their daily
goal**. Those are opposite products. A leaderboard of separate streaks says
"beat your friends"; this says "carry each other", and one person doing the work
earns the pair nothing. `utils/streak-friends.ts`, the demo data and every
component under it were rewritten rather than adapted; `friend-row.tsx`,
`friends-summary.tsx`, `friends-view.tsx` and `friends-demo-data.ts` are
deleted. **Don't reintroduce ranking here** — that is what `/leaderboard` is.

**`sharedStreakToday(base, today)` is where the product rule actually lives**,
and it is one line: `today.kept ? base + 1 : base`, where `kept` means both.
Everything visible derives from it, so the count, the header rings, the week's
last cell, the goal rows, the milestone bar and the grid cannot disagree about
whether today counted.

**`SharedDayStatus` is `kept | atRisk | broken`, and `atRisk` is only honest for
TODAY.** The day is not over, so one person outstanding is a warning. On a PAST
day the same combination means the streak actually broke. The demo week
deliberately contains no such day, so the distinction never has to be drawn on
screen — but a real implementation has to make it, and splitting that value in
two is the first thing the type should grow.

**`waitingOnFriend` and `waitingOnYou` are separate booleans, not one "who are
we waiting for" enum**, because both can be true at once and an enum would force
that case to pick a side.

**FOUR STATUS BRANCHES, NOT THREE** (`sharedStatusLine` in `copy.ts`). "Neither
of us has started" and "I'm done, they aren't" are different situations and only
one is the friend's fault; always naming the friend would tell a student who has
not opened a lesson today that Dara is the problem. The brief's own two lines are
branches 2 and 4 verbatim. Nothing scolds in any state — the same forward-only
rule the leaderboard applies to the current user.

**The brief contradicted itself, same as the solo page's did.** Its data section
says today starts "Panha ✅ / Dara ⏳"; its interaction section then asks for a
"Complete Today's Goal" button that changes Panha to completed — which cannot do
anything if Panha is already done, and a button dead on arrival is the pattern
this codebase avoids everywhere. **Today opens with BOTH outstanding**, which
makes both prototype controls live, walks the whole loop, and still shows every
line of the brief's copy, just sequenced. The at-risk framing is true from first
paint either way, because the streak is at risk while anyone is outstanding.

**THREE CONTROLS AT THREE DELIBERATE WEIGHTS:**

| control | weight | why |
| --- | --- | --- |
| Complete Today's Goal | `bg-brand`, the app's real CTA | the only one a shipped version keeps |
| Remind Dara | outlined secondary | the nudge mechanic kept from the deleted version at the user's request — it turns waiting into something the student can act on |
| Simulate friend completion | **dashed, muted, labelled "Prototype only"** | it stands in for another human being |

That third one is the one to not tidy. Dressing it as an ordinary button would be
the single genuinely dishonest thing on the page — a student could press it and
believe they had made Dara do something. Each control unmounts rather than
sitting disabled once it has nothing left to do.

**`finishDay(you, friend)` takes BOTH next values** rather than each control
flipping its own flag, so the celebration fires on the transition into "both
done" whichever button got there second. The two can legitimately be pressed in
either order, and an `onComplete` that only knew its own half would miss
friend-first. Both orders are covered by the verification standard below.

**The header layout IS the argument.** The solo page centres one flame with the
count under it; here the flame sits BETWEEN two avatars on a gradient rail that
passes under both, so the number reads as a pair's before it reads as a number.
The rail is a `z-0` bar behind the row rather than a border, because a border
would stop at each edge instead of connecting them. Each avatar carries its own
ring — mint once that person is done, amber while not — which is why the header
needs no separate "who is outstanding" row. The badge slot under each face is
always rendered even for the friend who has no badge, or the two columns differ
in height and the flame drifts off the rail.

**The week is SHARED outcomes plus a two-dot strip**, not two rows of ticks. The
brief sketched a table with a column each and then said it need not look like
one. Each day is one indicator carrying the day's verdict — filled flame for
both, outlined amber flame for one, cross for neither — with 4px dots underneath
saying which of the pair finished, left-you right-friend, matching the header's
avatar order. The dots read as texture at a glance, which is the intent; the full
sentence is on each cell's `aria-label`, since neither a glyph nor two dots says
anything out loud. **`broken` is muted, not red** — a day nobody managed is
already a loss, and the destructive colour would turn a quiet week into a
telling-off.

**Every state is icon + words, never colour alone.** The whole page is one
distinction repeated in four places, and it has to survive not being able to tell
mint from amber.

**`SHARED_MILESTONES` is a SECOND ladder, not the solo one relabelled.** Same
thresholds, different names — the solo rungs describe one student becoming
something ("Beginner", "Monthly Master"), these describe a pair ("Study
Partners", "Dedicated Duo"). Sharing one array and swapping labels was rejected:
the two ladders are free to diverge the moment either page's rewards are tuned.
It costs one file because `rankMilestones()` and `milestoneProgress()` take the
array as an argument, and `MilestoneCard` / `MilestoneProgress` render whatever
they are handed — that argument existed for exactly this.

**A CHILD PATH OF `/streak`, not a top-level `/friends`,** because it is the same
idea seen a different way. No collision risk — the two differ by a static
segment, unlike the `/lessons/:lessonId` versus bare `/lessons/:subjectId`
ambiguity `pages/subject-path.tsx` documents. It is the one page in the pair that
carries a **back link**, because it is reached from another page and its nav item
is buried in the drawer; `/streak` is a destination and has nothing to go back
from. A `<Link to="/streak">` rather than `navigate(-1)`: history could have come
from anywhere, and this always means "up to my own streak".

**The count is the store's `streak`, not a third copy.** The two pages measure
different things and are not required by logic to agree, but starting level is
what makes the shared rule legible — the student sees the same number Home's
pill and the StatBar show, and learns that HERE it moves only when Dara moves
too. See the solo section for the bug that authoring a second number caused.

**Reminders are local state and forget on reload, deliberately.** A real one is a
notification: the app sends none, and sending the first needs a consent story
nobody has designed. `friend-streak-demo-data.ts` carries the rest of what a real
version needs, including the one that is genuinely hard — two people in two
timezones have two "todays" and the pair needs one.

### Profile's study calendar — and where the streak comes from now

Asked for as "a schedule" on Profile, clarified as **a calendar showing which
days the student studied**. The app had no per-day history at all, so the
calendar needed a real log first — and once that existed, the streak and the two
string-literal labels under the stat pills ("▲ +20 today", "Best!") could be
made TRUE rather than deleted.

**THE RULE — A DAY COUNTS ONLY WHEN THE DAILY GOAL IS COMPLETE.** The user's
decision, and what the Streak page had always told students. The goal is the
three tasks the Streak page's goal card and Roadmap's Daily Mission name —
lesson, practice, flashcards — as `DAILY_GOAL_TASKS` in `utils/streak.ts`.
`challenge` is an extra row on Home's list, not part of the goal. **Studying
without finishing the goal does NOT extend a streak, and a day like that BREAKS
a run.** (The first version of this counted any day with XP; it was replaced
before it shipped.)

**`activityLog: Record<string, DayActivity>`** (`types/index.ts`) — local day
key → `{ xp, goal }`, the device's twin of a `daily_activity` row. An absent day
was not studied at all. Two writers, one field each:

- **`award()` writes `xp`** — every lesson, quiz answer, flashcard grade and
  daily task already routes its reward through it, so "studied" and "earned
  something" are one fact and no screen can grow a second tracker. It does NOT
  touch the streak.
- **`completeTask()` writes `goal`** — when the last of the three goal tasks
  lands, in whichever order. **It is the only place a streak day is made.**

Capped at `MAX_ACTIVITY_DAYS` (400). Cleared by `logout()`. Readers use
`log[day]?.goal` / `?.xp` — the optional chaining also turns a stale plain number
(the unreleased XP-only shape, which only reached development browsers) into
"nothing" rather than a crash.

**The streak maths, in `utils/streak.ts`:** `currentStreak(log, today)` counts
the run of goal days ending today — **or ending YESTERDAY when today's goal is
not done yet**. A streak is not broken until the day is over; counting strictly
from today would show 0 every morning. `bestStreak(log)` is the longest run
anywhere. Both take `today` as an argument, never call `todayKey()` themselves,
so the rule is testable against a fixed date.

**Where `streak` is recomputed:** `completeTask()` (the goal just completed) and
`rolloverDailyTasks()` on a day change (the one moment a streak can break with no
task completed). Nothing else may set it. It stays a stored field only so every
existing reader kept reading one plain number.

**Sync** rides the existing `daily_activity` table — no migration. The push
writes today's row (task flags + `xp_earned`), then two batches for the previous
14 days, because a day studied entirely offline would otherwise never reach the
server: one of `xp_earned`, one setting the three goal flags true on goal days
(exact — a goal day had all three by definition). **They must stay two batches.**
postgrest-js sends the union of the rows' keys as `columns=` and fills a missing
key with NULL, so one row without flags in a batch that has them writes NULL into
a NOT NULL column and fails the request. Each batch sets only its own columns, so
a day's other fields are untouched.

The pull reads 400 days back and rebuilds the log: `goal` from the three flags,
`xp` from `xp_earned` — except rows written before that column was filled, which
carry only flags, where it is rebuilt as `TASK_XP` (20, `utils/rewards.ts`) per
ticked task. That is exactly what each tick paid, so it is a true lower bound, not
a guess. The pulled `streak` is RE-DERIVED from the rebuilt log, not taken from
`profiles.streak`, which is only the last value some device pushed. Consequence
worth knowing: study history now comes back after a logout, which it did not
before.

**Two devices used on different days** each show only their own days until a
fresh pull (the pull runs only into an empty store), and the last push wins
`profiles.streak`. Same local-wins rule as the rest of sync.

**⚠ TODAY THE GOAL CAN ONLY BE FINISHED BY TICKING "PRACTICE" BY HAND.**
`PRACTICE_QUIZZES` in `data/practice.ts` is empty, so `quiz-runner.tsx` — the
only real completion of the practice task — is unreachable. Lessons and
flashcards complete for real; practice only through Home's checklist or
Roadmap's mission rows, which tick on tap. That is why those rows were NOT made
completion-only: doing so would make the goal, and therefore every streak,
impossible. It also means three taps on Home can count as a streak day. Revisit
the moment practice quizzes exist.

**The calendar** (`features/profile/components/study-calendar.tsx`, maths in
`utils/study-calendar.ts`) — a month grid, Sunday first to match
`buildHeatmapWeeks`, with current and best streak above it.

**‹ › page through a fixed window, not just months with data.** They first
stopped at the earliest logged month and at the current one — which on a new
install meant two faded arrows that did nothing, and the user asked why they
could not go back or forward. Now: BACK as far as the log can hold
(`MAX_ACTIVITY_DAYS`), since before that no day can ever have been recorded;
FORWARD to the exam month, read from `BAC2_EXAM_DATE` so the next cohort's
one-line edit moves it too, and never short of the current month so the
calendar still reaches today after the exam. The **Bac II exam day** carries a
pink graduation cap above a pink number (per-theme `--color-pink`: a mark, not a
fill under white text), is announced in its `aria-label`, and is named in the
legend and under the title on its month. Other **future months** show the `daysUntilExam()` countdown
under the title instead of a "goal done on 0 days" that is true and useless. A
**Today** button appears in the header whenever another month is shown, and is
absent — not disabled — on this one. It is a "schedule" in the only sense the
app can honestly offer one: the fixed date everything is counting toward.

Five things that look like choices anyone would make and are not:

- **FLAMES, NOT CIRCLES — the user's design call, so the days look like a
  streak.** A goal day is a BIG FLAME with its number inside: those are the days
  the streak counts, so a run of flames on the grid IS the streak. A
  studied-but-no-goal day is a smaller faint `bg-purple/20` flame: real work
  shown, not a streak day — full-size flames there would draw an unbroken run
  beside a streak that says it broke. Today is an UNDERLINE (white over a flame,
  purple otherwise), the exam a cap; nothing in a day cell is round. A legend
  names the marks, and the nudge under the grid counts today's goal ("1 / 3")
  while it is open. The browser check fails if any day cell grows a
  `rounded-full` or `ring-` again.
- **The flame is a CSS MASK of Lucide's own Flame path**, so it matches the
  streak glyph in `StatBar`, the pills and the Streak page — a mask because the
  fill is a gradient, and an SVG gradient needs a page-unique id per flame. Its
  viewBox is CROPPED to the flame (`4 2 16 21`): Lucide's 24×24 square is mostly
  margin, and uncropped the flame filled two thirds of its cell and a two-digit
  number spilled out. Cells are `h-11 w-9` — the flame's own 16:21 — and every
  number shares one baseline where the flame's round body is (13/21 down),
  flame or not. The small flame is inset in PERCENT so its body stays on the
  number at both cell sizes.
- **The fill is orange at the tip and `--brand-flame-to` pink from halfway
  down, not the full flame ramp.** The white number sits in the lower half, and
  that pink is 4.6:1 with white — clearing 4.5:1 for small text — while the
  orange end is 4.2:1 and would not. That is the same reason globals.css keeps
  the full ramp for large text and glyphs.
- **Days are `<div>`s with an `aria-label`, never buttons.** There is nothing
  behind a day to open.
- **The Khmer month names are HAND-WRITTEN (`KM_MONTHS`), not `Intl`.** Desktop
  Chrome was measured with NO Khmer locale data —
  `Intl.DateTimeFormat.supportedLocalesOf(["km"])` is empty — and formats
  `km-KH` in English without a warning; Android ships trimmed locale data too.
  The streak screens hand-write their Khmer weekday initials for the same reason,
  and the calendar reuses them (`weekdayLabel`) plus `daysLabel` from
  `features/streak/copy.ts`. **Two pre-existing places still use `km-KH` and so
  print English in Khmer mode:** `commitment-banner.tsx`'s `formatSignedDate`,
  and `utils/exam-date.ts`'s `formatExamDate` (shown on the roadmap). Same bug,
  not fixed here — the calendar's exam label deliberately does not call
  `formatExamDate` for that reason.

**The identity row** (`profile-identity.tsx`) shows `authUser.avatarUrl`, which
arrived with every Google session and was used nowhere, with
`referrerPolicy="no-referrer"` (Google's avatar host turns down some hotlinked
requests that carry a Referer) and an `onError` fallback to the first letter on
a `bg-brand` circle. The pencil edits the name via `setUserName`, which **refuses
a blank name in the store itself**: an empty `userName` is what the gate reads as
"signed in, no profile yet", so writing one would throw the student back onto
the signup form. **Guests get no pencil** — their "Guest" is a render-time
fallback, and a stored name would skip `LoginView` on sign-in, which is where
the Google name is prefilled.

**Deliberately NOT editable here: target grade and weak subjects.** Both were in
the plan and cut at review — they drive the roadmap (`GRADE_HOURS` → the daily
mission, `weaknesses` → the phases) and the user does not want the roadmap
changing yet. When they come back: edit in place on Profile rather than a "Redo
survey" button (the survey restarts all four steps blank, takes over the screen
and has no cancel), and move `GRADES` / `FIXED_SUBJECTS` out of `survey-view.tsx`
into a `.ts` so both screens share one list.

## Performance — the four rules, and why each one exists

The app was slow, and the reported symptom was **navigation**, not first load.
That distinction is what makes this section worth reading before "optimising"
anything: the biggest *bytes* problem and the biggest *felt* problem were
different problems, and fixing only the first would not have helped.

Measured first-paint cost went **487KB → 183KB gzipped**. But the navigation lag
came almost entirely from per-frame and per-mount work, not from bytes.

**1. A route is a fresh MOUNT. Anything that animates on mount replays forever.**
Recharts animates on mount by default, for 1500ms. Progress mounts two charts
and Grade Prediction one, so every visit redrew the page and then spent a second
and a half sweeping lines in. All three now pass `isAnimationActive={false}`.
The data is fixed demo data that never transitions, so nothing was being
communicated. **If a chart ever gets live data, turn animation back on for the
UPDATE, not the mount.**

**2. Animate `transform` and `opacity`. Nothing else.** `fabPulse` used to
animate `box-shadow`, which is a paint property and cannot run on the
compositor — every frame forced a real repaint, forever, on an element mounted
on every screen. It is now split: the element animates `transform`, and a
`::after` layer carries the glow and animates `opacity` (`fabGlow`). Both
compositor-only. See the long comment in `globals.css`; don't fold the two
keyframes back together.

Consumers must be **positioned** for the `::after` to anchor. The FAB already is
(`absolute`); the Roadmap node carries `relative` for exactly this and nothing
else. `.animate-fab-pulse` sets `isolation: isolate` so the `z-index: -1` glow
sits behind that element's own background instead of escaping behind an
ancestor's.

**Count the animating elements, not just the animation.** The Roadmap put the
pulse on *every* phase node, and `buildRoadmapPhases` returns roughly one per
month until the exam — about twelve at once, on the screen a student lands on
straight out of the survey. Only `isFirst`/`isLast` pulse now. The middle nodes
never set `--glow-color` either, so they had been borrowing the FAB's purple by
accident.

A `prefers-reduced-motion` block turns both loops off entirely.

**3. One scroll container per screen.** `AppShell`'s children wrapper is
`overflow-hidden`, NOT `overflow-y-auto`. Every page already owns its scroller —
the ones rendering `BottomNav` must, since that pattern is `flex h-full
flex-col` + `min-h-0 flex-1 overflow-y-auto` + `<BottomNav />`, and the focus
routes get theirs from `FocusLayout`. A scroller at both levels meant two nested
ones on every screen, so every touch drag cost a scroll-chaining resolution
before anything moved. `min-h-0 flex-1` stays on that wrapper — it is what gives
the pages' `h-full` a definite height to resolve against. `not-found.tsx` has no
scroller and needs none.

**4. `backdrop-filter` is not free, and it re-runs while content moves.**
`BottomNav` and the Leaderboard's sticky card are opaque (`bg-surface`,
`bg-elevated`) rather than translucent-plus-blur. Both sat over scrolling
content, which is the worst case, and `BottomNav` is `lg:hidden` — so the blur
only ever ran on the phones least able to afford it. Don't reintroduce it on
anything that scrolls behind.

### Code splitting — and why the prefetch is not optional

`src/app.tsx` holds every split route in ONE `routeModules` map; `lazy()` and
the idle prefetch both read from it, so they cannot drift. Adding a route there
splits and prefetches it in the same edit. Import specifiers must stay literal
for the bundler to see them — that is what the arrow functions are for.

**Home and NotFound stay eager.** Home is the landing route, so splitting it
only adds a round trip in front of first paint; NotFound imports nothing.

**`usePrefetchRoutes` is load-bearing.** Splitting alone makes the first tap on
each tab wait on a network round trip — i.e. it makes the actual complaint
*worse*. Warming the chunks on `requestIdleCallback` after first paint is what
buys the smaller entry chunk without paying for it at the moment of navigation.
Rejections are swallowed on purpose: it is a speculative fetch, and going
offline between load and tap should fall through to the normal Suspense path,
not throw now.

Recharts lands in its own shared chunk (`LineChart-*.js`, ~103KB gzip) used only
by Progress and Grade Prediction. **Check after any build that
`math-field-panel-*.js` is still its own chunk** — that lazy boundary is
described in the mentor section and a stray static import undoes it silently.

`<Suspense fallback={null}>`, matching how `AppShell` mounts `ChatOverlay`: the
prefetch means it almost never renders, and a spinner that flashes for a frame
reads worse than a blank one.

## Still not built

Document Library — the last disabled "Soon" item in the nav
(`lib/nav-items.ts`), with no route or feature folder.

**Streak-w/-Friends has left this list.** It is `/streak/friends` now, a real
screen — see its section above. What is missing there is a BACKEND, not code:
there is no friendship model, cross-user reads are the same blocker the
leaderboard is waiting on, and a reminder has nowhere to go. Same state the
past-papers tab and the practice decks were in, and by design.

**Flashcards/Quiz has left this list.** It is `/practice` now, a real feature —
see its section above. What is still missing there is CONTENT, not code:
`data/practice.ts` is empty, so every lesson row is a `ឆាប់ៗនេះ` placeholder and
neither runner is reachable in the app as shipped. That is the same state the
past-papers tab is in, and it is by design.

The drawer's Main section is Home / Mock Exam / Lessons / Flashcards-Quiz. An
"Exam Papers" placeholder used to sit there and was deleted outright — its Khmer
name (វិញ្ញាសារត្រៀមប្រឡង) moved onto the real Mock Exam item, which is the one
that actually has a route. `NavItem` also carries an optional `shortLabel` used
only by `BottomNav`, because the drawer's full Khmer names are far too long for
a 5-tab bar.

## Deliberate product/architecture decisions (don't relitigate these)

**Donate feature was fully removed** — deleted from nav, routes, and the
component itself (not just hidden). `content-questions.js`'s original `DONORS`
array was intentionally not ported to `data/questions.ts` for the same reason;
there's a comment there explaining it.

**AI mentor chat is a global overlay, not a route.** `chatOpen` lives in the
Zustand store; `ChatOverlay` renders on top of whatever page you're on without
unmounting it, so lesson progress/flashcard state is never lost. Closing it just
sets `chatOpen: false` — no navigation. Note `AppShell` *does* unmount
`ChatOverlay` on close (`{chatOpen && <ChatOverlay />}`), which is exactly why
the conversation lives in the store rather than component state — it used to be
wiped every close. `addChatMsg` pushes an empty bot bubble that `appendChatChunk`
then fills as the stream arrives.

**The mentor holds MANY conversations**, like a real chat app: store fields are
`conversations: Conversation[]` (kept sorted newest-updated-first) plus
`activeConversationId`, where `null` means "a blank chat not yet saved".
Conversations are created LAZILY — `addChatMsg` mints one on the first message —
so tapping "New chat" never leaves an empty row in the history list. Titles come
from the first user message via `utils/chat-history.ts`'s
`makeConversationTitle` (no extra API call; its hard-character-cut fallback
exists because Khmer has no spaces to break on). Caps: 40 messages per
conversation, 20 conversations. `ChatOverlay` holds both views
(`view: "chat" | "history"`) with the history list as a Framer Motion
`absolute inset-0` panel — NOT `components/ui/sheet.tsx`, which portals to
`document.body` with fixed positioning and would escape the `max-w-lg` frame.
Deleting a conversation takes two taps, matching Profile's Logout confirm.

**Math in the mentor is LaTeX on both sides now — that asymmetry is gone.** It
used to be Unicode in, LaTeX out: a hand-built symbol keyboard
(`components/shell/math-keyboard.tsx`, keys in `data/math-keys.ts`, ~570 lines
with `utils/math-input.ts`) typed "√" rather than `\sqrt{}`. Both files are
deleted. **MathLive** (`components/shell/math-field-panel.tsx`) replaces them:
the student builds a real formula in a `<math-field>` and it goes into the
message as `$…$`. `components/shell/math-text.tsx` therefore renders BOTH
bubbles, not just the bot's.

Four things about that panel that are not obvious:

- **It is a staging field, NOT the message box.** The composer's `<input>` still
  holds the message. A math field cannot hold Khmer — MathLive typesets in the
  KaTeX faces, which have no Khmer coverage — so prose in it would come out as
  empty boxes. Keeping them separate is what lets a student write Khmer around
  their formula, which was the whole point of the old inline keyboard.
- **`insertLatex` pads OUTSIDE the dollars, never inside.** `splitMath` applies
  the TeX rule that inline math may not be hugged by whitespace, so `$ x^2 $`
  reaches the bubble as literal dollar signs. Get this backwards and every
  inserted formula silently stops rendering.
- **The lazy boundary is load-bearing, not a nicety.** MathLive is ~800KB of JS
  plus twenty font files — it builds its own chunk because `chat-overlay.tsx`
  reaches it through `React.lazy`, so it downloads on the first tap of Σ rather
  than when the mentor opens. A static import of `math-field-panel.tsx` anywhere
  undoes that silently; check `dist/assets/math-field-panel-*.js` is still its
  own chunk after touching it.
- **MathLive's keyboard is mounted into our own element**
  (`mathVirtualKeyboard.container`), not its default `document.body` — the same
  trap that keeps `ChatOverlay` off `ui/sheet`. It is a global singleton, so the
  cleanup MUST reset `container` to `null`. Its backdrop is bottom-anchored and
  `height: 100%` of that box, so the box has to be sized explicitly: too small
  clips the toolbar off the top, too large leaves a dead gap under the field,
  and the right number changes with the layout. A `ResizeObserver` on
  `.MLK__backdrop` measures it; `FALLBACK_HEIGHT` is only the opening guess.

Keys are MathLive's stock layouts (`numeric`/`symbols`/`greek`/`alphabetic`).
That means **no chemistry or physics tab any more** — one-tap `H₂O`, `m/s²`,
`mol` and `lim(x→)` are gone, typeable but no longer one key. Deliberate: the
point was to stop maintaining key data. If it bites, `mathVirtualKeyboard.layouts`
takes plain objects, so a custom Bac II layout is a data-only addition.

MathLive is themed from `.mathkb` in `globals.css`, which maps its
`--keycap-*`/`--keyboard-*` variables onto our tokens. One block covers both
themes because `.dark` redefines those tokens at `:root` — do not add a dark
duplicate. `--color-control` is still exactly the token for the keycaps.

**KHMER MUST NEVER END UP INSIDE `$…$`.** KaTeX swaps in its own math fonts,
which have zero Khmer coverage, so Khmer between two dollar signs renders as a
row of empty boxes. Two guards, and you need both: the prompt tells the model to
keep Khmer outside the delimiters, and `splitMath` (`utils/math-render.ts`)
refuses to treat any `$…$` containing Khmer as math. The second exists because
one stray dollar sign in a long Khmer answer would otherwise tofu a whole
paragraph — and it now guards STUDENT text too, not just model output, since
user bubbles go through the same renderer. `splitMath` also applies the standard TeX rule that inline math can't
be hugged by whitespace or span a newline, which stops "costs $ and $x^2$" from
pairing the wrong dollars. It leaves an UNCLOSED delimiter as literal text —
that is the streaming case, since `appendChatChunk` fills the bubble a few
characters at a time and half-arrived TeX must never be handed to KaTeX.

**One keyboard at a time, enforced by FOCUS.** Σ mounts the panel, which focuses
its own field, so the OS keyboard leaves because focus left the input; the
input's `onFocus` sets mode back to `"text"` and brings it back. The old build
did this with `inputMode="none"` plus a blur/refocus dance (changing `inputMode`
on an already-focused element does not make the OS reconsider) — all of that is
deleted, along with the `onPointerDown`+`preventDefault()` on every key and the
`Intl.Segmenter` grapheme backspace. Those existed because our own panel had to
keep a focused input's selection alive; MathLive owns its field and the OS
keyboard owns Khmer deletion, so none of it is needed. The one place focus still
matters: `restoreCaret(caret, false)` after an insert must NOT refocus the
input, or it trips that `onFocus` and closes the panel mid-use.

The panel's opening layout comes from the ROUTE (`defaultMathLayout`, fed by
`useLocation().pathname`), not the store, because `chatOpen` is a bare boolean
and the FAB is global — there is no other signal for "which lesson was I on".

**Legacy chat data is converted in `persist`'s `merge()`, NOT `migrate()`.**
This looks wrong but isn't: zustand only calls `migrate` when the stored payload
has a numeric `version` field, and the build before this one set no `version`
option, so `JSON.stringify` omitted the key — `migrate` would never have fired
for exactly the v0 data it was meant to rescue. `merge` runs on every hydration
regardless. `version: 1` is still set so a FUTURE schema change can use `migrate`
normally. `partialize` is a named function purely so `merge` can borrow its type.

**Survey persists across reloads**, same as Login — `surveyed` and `userData`
are in `lib/store.ts`'s `partialize` (`lang`, `userName`/`userEmail`/`userAge`/
`userLocation`, `userLanguage`, `surveyed`, `userData`, `pendingPlacementTests`,
`commitment`, `pledgeSeen`, `xp`, `level`, `streak`, `activityLog`, `tasks`,
`tasksDate`, `examResults`,
`conversations`, `activeConversationId`; `chatOpen`/`drawerOpen`/`pledgeOpen` deliberately
excluded as UI state). This reverses the original app's behavior; it was
explicitly changed once Logout existed. The only way back to a blank
Login/Survey is Profile → Logout. Don't reintroduce "always re-show on reload".

**The exam countdown is DERIVED, never stored.** Bac II is a national exam on
one fixed date, so `utils/exam-date.ts` holds it (`BAC2_EXAM_DATE`, currently
10 Aug 2027) and everything else calls `daysUntilExam()` / `monthsUntilExam()`.
The survey used to ask "months until Bac II?" as a 1–12 grid and keep the answer
in `userData.months`; that was both a guess and stale the next day — a student
who answered "12" in August still read "12 months left" a year later. The field
is gone from `UserData` (an old persisted copy is simply ignored, no migration
needed), the survey step with it, and `parseMonthsLeft` is deleted.
`computeDailyMission` and `buildRoadmapPhases` now take a `number`, so the daily
quota tightens on its own as the exam nears. Home's hero and Grade Prediction
show a real day count instead of the old `months × 30` approximation.

Two things to keep straight. **`Commitment.months` is the one deliberate
snapshot** — the pledge has to keep saying what the student agreed to, so it is
frozen at signing time and must not become a live read. And `monthsUntilExam()`
is floored at 1 because callers divide by it. Rolling the app to the next cohort
is a one-line edit to `BAC2_EXAM_DATE`.

**Placement testing (math/physics/chemistry only) is a deliberate scope
choice**, not a content oversight — biology has question data in `MOCK_QS` too,
but the user scoped test-backed weakness detection to the 3 foundation subjects,
so biology stays on the plain self-report toggle. Both test-backed paths — the
inline test and scheduling one for later — have since been pulled out of the
survey entirely (see the Survey section), so today the scope note is academic:
**no subject gets test-backed weakness detection**, all three foundation subjects
self-report. The scoring layer in `utils/placement.ts` is untouched and correct
for when questions exist.

Placement-test attempts
never write into `examResults`/`addExamResult` — that array feeds Home's stat
pill captioned "from mock exams", and folding placement attempts in would make
that caption wrong. **Past-paper attempts are excluded for the same reason and
two more**: `chat-prompt.ts` derives "average mock-exam percentage" from that
array and states it to KruAI as a fact about the student, and the generated-exam
tab renders it UNFILTERED as "Previous Results" — so a past-paper attempt would
surface under the wrong tab on the same screen. XP *is* awarded for both. When
past papers deserve a history of their own it should be a separate persisted
field, not a widening of this one.

**Progress, Grade Prediction, Leaderboard and Streak intentionally use
fake, fixed demo data** (`features/*/demo-data.ts`), not live store data. An
explicit user decision to avoid edge-case bugs (e.g. a brand-new user with zero
exams breaking a chart). The files have comments noting what real data would
need to exist (per-subject score tracking, a daily activity log) before
switching over. The leaderboard's list is the longest of those: cross-student
ranking, an XP ledger with timestamps, a daily activity log, and **active**
study minutes with idle time excluded — counting "app is open" would make
leaving a phone unlocked a winning strategy, which is exactly what that screen
is built to argue against. Its one live read is the student's own name.

**Streak is the exception to the pattern, and it had to be.** The other four
were built when their invented numbers sat beside nothing that could contradict
them — which stopped being true for Progress and the Leaderboard once `StatBar`
went global (see `PreviewTag` below). A streak page restates a number the global
`StatBar` renders on every screen, so its demo count was VISIBLY WRONG — the bar
said 3, the page said 12 — until the count moved into the store. Both `/streak`
screens now read `streak` from there and only their surrounding state is
authored. **A new demo screen that displays XP, level, coins or streak has this
same problem** and should read the store rather than invent one.

**Every screen still on demo data carries `PreviewTag`** —
`components/preview-tag.tsx`, a dashed "Preview · sample data" pill — on its own
line under the title on Progress, Grade Prediction, the Leaderboard and Streak
with Friends — and on Game, which carries it for two reasons at once: its hero
card is decoration by the user’s own request, and until competitions reach a
server nobody else can see or join what a student posts. Every other section on
that page is real. The tag comes off when both are true. Added
11 Sep 2026: Progress's top row says 1,240 XP and a 12🔥 streak and the
Leaderboard's "You" row 2,430 XP, a few pixels under the bar's real numbers, and
the user could not tell which were real. Labelling was chosen over making those
numbers real, for now. **The tags ARE the list of what is still fake** — a new
demo screen gets one, and a screen that switches to real data loses it. `/streak`
is deliberately untagged: its count is real, and its demo goal card is the
user's recorded call (see the Streak section). The label is `text-text`, not
`text-muted`, because light-theme muted is ~3.8:1 on white — under AA at 10px.

**TAG THE SCREEN, NOT THE DOORWAY TO IT.** Home's grade card carried one
pinned to its top edge for a day and it was removed at the user's request: it
is a link into `/grade-prediction`, which already shows the tag above its own
title, so anyone tapping through is told before they read a number. A second
pill hanging off a small card read as clutter on the screen that should stay
the calmest. Home's own chips and pills (`StatPills`, `MotivationHero`) link
to tagged pages the same way and stay untagged for the same reason.

**The Study Activity heatmap's dates are the exception to "fixed demo data"** —
they're derived, not fixed, same pattern as `daysUntilExam()`. The COUNTS in
`features/progress/demo-data.ts` are still hand-authored fixed numbers like
everything else on this page, but `utils/activity-heatmap.ts`'s
`buildHeatmapWeeks()` maps them onto real calendar dates at render time, anchored
so the last row is always the current Sun–Sat week. A cell whose date is after
today is `isFuture` and renders as an empty dashed outline rather than a
coloured square — the fixed data has a placeholder number sitting there, but it
is deliberately ignored so a screen full of demo data still can't claim a
student did anything on a day that hasn't happened yet. The colour level
(0–4, feeding the `LEVELS` scale in `activity-heatmap.tsx`) is bucketed from
the count via `levelForCount()` rather than being its own hand-authored number,
so the shade a cell is painted and the count its tap tooltip shows can never
disagree with each other — they used to be two unrelated numbers.

Each past/today cell is a real `<button>`, not a decorative `<div>` — tapping
toggles a small tooltip (`formatHeatmapCellLabel()`: "Today · 13 questions" /
"Sun 2 Aug · No activity") positioned above the cell. Horizontal placement is
clamped by day-of-week column (`di <= 1` → left-anchored, `di >= 5` →
right-anchored, else centered) so the tooltip can't run off the card at either
edge — verified down to the 320px floor. Closing is a `pointerdown`+`keydown`
listener added to `document` **only while a tooltip is open**, not on every
render of a page most students never tap into; it checks the click landed
outside the grid's own ref rather than assuming any outside tap means "close".

**Mock Exam results DO use real data** (`examResults` in the store, persisted) —
a deliberate improvement over the original, where exam history lived in
component state and was lost on navigation.

**Roadmap's Today's Mission and Home's daily-tasks checklist intentionally share
the same `tasks` store fields** (lesson/practice/flashcards). Completing a
mission row on Roadmap shows that item as done on Home, and vice versa — by
design, one real completion, not a duplicate tracker.

**Game avatars**: the Game feature's own invented roster is gone — see its
section. `components/ui/avatar.tsx` is still how every avatar in the app renders
(`features/game/components/new-match-card.tsx` among them): a plain `<img>`
pointed at `/avatars/{seed}.svg`, DiceBear-style pictures downloaded once and
bundled in `public/avatars/`, keyed off the `avatarSeed` strings in
`features/game/demo-data.ts`. This replaced a version that called DiceBear's
live API on every render; that was dropped after the API proved unreachable on
some networks (browser `err_name_not_resolved` even though server-side curl
worked), breaking the avatars outright. There is no live-generation fallback
anymore, so adding a new `avatarSeed` means downloading a matching SVG into
`public/avatars/` too.

## The pre-login review — six live bugs, and what it deliberately left

A whole-codebase review run before real login is built, on the reasoning that
these are cheaper to fix now than once accounts exist. Two things it CHECKED and
found clean, worth recording so nobody re-audits them: all 23 multi-field store
selectors use `useShallow` (zero violations of the infinite-loop pattern below),
and there is no render-phase `setState`, no effect loop and no unguarded storage
access anywhere in `src/`.

### `tasks` is TODAY's checklist, and nothing was making that true

**`resetDailyTasks` had NO CALLER.** Not one, anywhere in the repo — only its own
definition and three comments (in the SQL migration, in `supabase-sync.ts`, and
in this file) asserting that it ran. `completeTask` is a one-way latch
(`if (state.tasks[task]) return state`) and `tasks` is persisted, so:

- Home's daily checklist and Roadmap's Daily Mission were permanently ticked
  after a student's first lesson, forever.
- The 20 XP per task was a ONCE-IN-A-LIFETIME award, not a daily one — which
  quietly removes the daily loop the whole gamification design rests on.
- `daily_activity` wrote those stale flags onto every future day's row, poisoning
  the very activity log `features/progress/demo-data.ts` names as the thing that
  has to exist before the heatmap can stop being demo data.

**`tasksDate` is the fix and the whole mechanism.** A persisted `YYYY-MM-DD`
stamp beside `tasks`; `rolloverDailyTasks()` clears when it is not today;
`completeTask` stamps it and also rolls over itself, so finishing a task on a new
day cannot add to yesterday's row. `AppShell` calls the rollover on mount AND on
`visibilitychange` — a phone left open overnight never remounts, so waking the
tab is the only moment it gets to notice. The action returns the state object
unchanged when there is nothing to do, so a quiet wake publishes no store update
and schedules no push. `pullRemoteState` sets `tasksDate` too: the row it read
IS today's, and without the stamp the rollover would wipe the checklist it just
pulled and look like the pull failing.

A brand-new key with a default needs no `version` bump — see `merge()`.

### One day helper, because two definitions of "today" had already diverged

`utils/day.ts` (`todayKey`, `addDaysKey`) is now the ONLY way a calendar day is
computed. It existed as a private helper in `supabase-sync.ts` carrying the
comment explaining why UTC is wrong for a Phnom Penh student — and two other
files then re-derived the same thing in UTC anyway.

**`utils/spaced-repetition.ts` was the one that mattered.** `toDateKey` was
`toISOString().slice(0, 10)` (UTC) while `addDays` did its arithmetic in LOCAL
time and then formatted in UTC — worse than either alone. In UTC+7, for anyone
studying between midnight and 07:00: every interval landed a day short, and a
card graded "again" at 05:00 got `dueAt` = today and came due again at 07:00 the
SAME MORNING, which is exactly what `AGAIN_INTERVAL_DAYS` was written to prevent.
Verified with a real browser at `Asia/Phnom_Penh` 05:00: `dueAt` is now the next
day. `features/practice/review.ts`'s `reviewedTodayCount` was sliced the same way
on both sides — self-consistent, and consistently seven hours out; it now parses
`lastReviewedAt` (a full ISO INSTANT) back and re-derives the LOCAL day.

**The rule: never `toISOString().slice(0, 10)` for a date key.** A full ISO
timestamp for an instant is fine and untouched.

No migration for existing `cardReviews`: the shift is at most a day, and due-ness
prioritises rather than gates.

### `/lessons/:lessonId` was the one route that did not guard its param

`getLessonData` did `LESSONS[cat][topic]` bare, so any unknown id threw during
render. Every sibling already resolved-then-redirected
(`pages/section-detail.tsx` is the pattern). The lookup is now
`lessonDataFor(lessonId): Lesson | null` in `data/lessons.ts`, the PAGE resolves
and `<Navigate>`s, and `LessonDetail` takes the resolved lesson as a PROP — so by
the time it mounts the lesson is known to exist.

### There was no error boundary at all

Which is what turned the above into a blank app rather than a bad route. And
reloading does not fix it: the store is PERSISTED, so a throw caused by stored
state reproduces on every reload, and a phone has no devtools to clear storage
from. `components/error-boundary.tsx` wraps `<Routes>` in `app.tsx` and offers
two escapes — Reload, and a two-tap-confirmed **clear saved data** that removes
`localStorage["brachnha"]` and deliberately LEAVES `localStorage["brachnha-auth"]`
alone, so the account survives and the sync layer's empty-store-plus-session path
can pull it straight back. Bilingual rather than Khmer-only: it has to be
readable at the one moment the app cannot tell you which language was chosen.

Outside `<Routes>`, not per-route: a boundary inside the shell would keep
rendering the navigation that may itself be what threw.

### Two smaller ones

**`ChatMsg` grew an optional `id`, and the overlay keys on it.** The list is not
append-only — `addChatMsg` caps with `slice(-40)`, which drops from the FRONT, so
past 40 messages every index shifts and an index key had React reuse a bubble's
DOM node for a different message. Optional because messages already in
localStorage predate it and ones restored from Supabase have none (the table
stores `seq`/`role`/`content`, and this is not worth a migration); those keep the
index fallback, which is correct for history that cannot move again.

**`quiz-runner.tsx` had the documented React Compiler crash latent in it.**
`questions[index]` is undefined once `finish()` sets `index = total`, `done` was
handled by a JSX ternary rather than an early return, and `answerQuestion` read
`question.correct`. It was not throwing — the compiler was taking the whole-object
dependency because the JSX reads several properties — but it was one refactor from
the narrowed path. `QuizSummary` was extracted so `if (done) return` can sit ABOVE
the closure. Same shape as `EmptyQueue` in `review-session.tsx`, same reason.

### What the review deliberately did NOT do

**The destructive-push warning below has since been ACTED ON.** It said: decide
the merge strategy before writing the login screen, not after. That is what
`syncedUserId` and `AccountConflictView` are — see "Signing in cannot destroy
work" in the auth section. The original wording is kept because the failure it
describes is still exactly one wrong edit away:

> The push is destructive and the pull fires once, into an empty store. While
> anonymous auth guaranteed one device was one account this was invisible. The
> moment two devices share a uid, a device that already has local data has
> `userName !== ""` and therefore takes the PUSH path, never the pull — and that
> push deletes every server conversation not in its local list, prunes
> `pending_placement_tests`, overwrites `xp`/`level`/`coins`/`streak` with its
> own values, and overwrites today's `daily_activity` row. There is no
> `updated_at` comparison and no merge anywhere, so the last device to become
> visible wins and the other's work is gone.

The push itself is unchanged — still a full destructive snapshot. What changed is
that it can no longer run against an account this device has not claimed.

**Still true, and still not addressed:**
`cardReviews`/`studentCards`/`starredCards`/`reviewHistory` never leave the
device, so roaming loses every student-authored card and the whole review
schedule — which now matters, because roaming is real. `profiles.email` has no
unique constraint, and `profiles` has no DELETE policy, so a client can never
clean up the losing side of an account merge. (`handle_new_user` being `after
insert` only no longer bites: a Google user arrives WITH an email, so the trigger
captures it, and `login-view.tsx` prefills the same address into `userEmail` so
the ordinary push keeps it current.)

## Auth: Google sign-in, guest mode, and what each one may touch

Real login landed. The section this replaces described three seams "for the
login that is coming"; all three were used, and the design they anticipated is
now built. The anonymous-identity section above records what was removed.

### The state model — three states, one source of truth

**THE SUPABASE SESSION IS THE ONLY PROOF OF AUTHENTICATION.** Everything else is
routing.

| | `authStatus` | `authUser` | `guestMode` |
| --- | --- | --- | --- |
| Loading | `"loading"` | `null` | — |
| Authenticated | `"ready"` | the flattened session | `false` |
| Guest | `"ready"` | `null` | `true` |
| Not chosen yet | `"ready"` | `null` | `false` |

`authStatus`, `authUser`, `authPrompt` and `accountConflict` are **excluded from
`partializeState`**, exactly like `chatOpen` — re-derived from Supabase on every
load. Only `guestMode` and `syncedUserId` persist, and `guestMode` **grants
nothing**: it routes past the entry screen and that is all. `hooks/use-auth.ts`
is where every question about identity is answered.

**A GUEST HAS NO `userName`, deliberately.** `continueAsGuest()` sets one flag
and nothing else. A placeholder like "Guest" in the store would reach
`profiles.display_name`, the leaderboard and the pledge signature — and survive a
later Google sign-in, leaving the student permanently named "Guest".
`useDisplayName()` supplies the fallback at render time instead.

**No persist `version` bump.** `guestMode` and `syncedUserId` are new keys with
defaults, which `merge()` already handles (see its comment). That also settles
what happens to existing installs: they arrive with `guestMode: false`, land on
the entry screen, and keep every byte of local data whichever button they press.

### The gate, in `app-shell.tsx`

A ternary chain, in priority order, kept as JSX rather than early returns so
nothing above it closes over a possibly-null `authUser`:

```
loading, and they'd be on the entry screen anyway -> <AuthSplash/>
conflict pending                                  -> <AccountConflictView/>
ready, not authenticated, not guest               -> <EntryView/>
authenticated, no name                            -> <LoginView/>   (prefilled)
authenticated, not surveyed                       -> <SurveyView/>
                                                  -> the app
```

Three things there are load-bearing and easy to undo:

- **`hasFullAccess` is true when Supabase is UNCONFIGURED**, which skips the
  whole chain. With no project there is no account to have, no server to protect
  and no AI credits to spend — the same degradation the mentor already does for
  a missing `GEMINI_API_KEY`. It is also what keeps `npm run preview`, a fresh
  fork and `scripts/shots.mjs` working with **no change to the screenshot seed**:
  the documented blanked-env command was already the right one.
- **`status === "ready"` on the EntryView branch.** A returning student has a
  name and a session, but the session takes a dynamic import to resolve — so for
  that window they are "not authenticated and not a guest", and without this they
  would be thrown onto the entry screen and asked to sign in to the account they
  are already signed in to.
- **The splash renders only when the student would see the entry screen anyway.**
  Gating the whole tree on "loading" would put an import — and, for an expired
  token, a network round trip — in front of first paint for every returning
  student. See the top of `lib/supabase.ts` for why that is not affordable.

`userName`/`surveyed` now gate **authenticated students only**. A guest falls
straight through to Home, and because their `surveyed` was never faked, signing
in later walks them through the survey properly.

### What is locked, and where the gate actually is

Roadmap and KruAI. Everything else — lessons, practice, flashcards, mock exams,
progress, streak — stays open to guests. Locking another feature is one
`requireAuth(...)` call.

**The roadmap guard is on the ROUTE, not the links.** There are four ways in
(Home's Quest Map chip, grade-prediction's recommended action, and two
programmatic `navigate("/roadmap")` calls in the survey and placement-test
flows), and a click handler covers neither the last two nor a typed URL. Home's
chip *also* calls `requireAuth` so the modal opens in place rather than on a
locked page, but that is polish on top of the real gate in `pages/roadmap.tsx`.

**`ShellLayout`'s `roadmapLock` gained `hasFullAccess`, and it is not
decoration.** A guest never signs a pledge, so without it that condition is true
for every guest reaching `/roadmap` — and it strips the sidebar, the hamburger
and the FAB while the route renders no `BottomNav` either. They would land on the
locked panel with no navigation at all and no way out but the browser's back
button. There is a screenshot test for exactly this.

**KruAI is gated three times over**: `FabChat` raises the prompt instead of
opening (the FAB stays VISIBLE — the lock is what advertises the feature),
`AppShell` refuses to render `ChatOverlay` without access, and the endpoint
demands a bearer token. Only the third is a real gate; the first two are UX.

### The endpoint verifies the caller now

`/api/chat` was public and unauthenticated. It now rejects anything without a
valid, non-anonymous Supabase access token — hiding a button is not a gate, and
a guest with one `curl` could spend the Gemini budget.

**`server/verify-user.ts` verifies LOCALLY, with no network per request.** The
obvious route — `GET /auth/v1/user` with the bearer token — was rejected on three
counts: it puts a Supabase round trip in front of a stream whose selling point is
~2.7s to first character; every student's check would egress from the same
handful of Vercel IPs into Supabase's own per-IP auth limits; and caching it
correctly means capping the cache at the token's own `exp` anyway.

This project signs with **ES256 asymmetric keys** (verified against its live
JWKS endpoint), which `node:crypto` reads natively from a JWK — so this is ~200
lines and **zero dependencies**. JWKS is fetched once per instance, re-fetched on
an unknown `kid` but no more often than `JWKS_REFETCH_MIN_MS`, or a stream of
junk tokens with invented kids becomes a fetch amplifier. An HS256 branch exists
for a legacy project still on the shared secret. **Relative imports only** — the
Vercel function bundler reads the root tsconfig, which has no `paths`.

**THE TRADE, and do not reuse this without revisiting it:** a locally verified
token cannot be revoked early, so a student signed out on another device keeps a
working token until it expires (an hour). Correct for a rate-limit gate on a chat
endpoint. NOT correct for anything destructive.

**Unconfigured fails CLOSED in production.** No `SUPABASE_URL` means no request
can be authenticated, which in production means a missing Vercel variable has
quietly reopened the endpoint — so it returns 503 and logs loudly. In dev it
warns and continues, or "the mentor works locally" would mean nothing about
production.

**The rate limits were re-set, and the old number was the whole point.**
`chat-handler.ts` recorded that 30/min per IP was chosen *because a classroom
shares one school router*. Keeping that as a pre-filter would have changed
nothing — it stays the binding constraint. The IP number is now a pure anti-flood
figure (240/min) and the real cap (20/min) is on the verified user id, which is a
real per-student key for the first time.

**The 401 body is a sentence, not a status.** `chat-overlay.tsx` renders any
non-ok body verbatim as a KruAI bubble, so "Unauthorized" would arrive on screen
as the mentor's answer. It also says nothing about *why* — expired, unsigned,
anonymous and absent are one message to the caller and four distinct reasons in
the server log.

### Signing in cannot destroy work

`pushLocalState` writes a **full destructive snapshot**: it deletes server
conversations absent from the local list and overwrites xp/level/coins/streak.
That was harmless while anonymous auth guaranteed one device was one account.
Google makes it a two-tap operation — guest on a school computer, do a lesson,
sign in, and the phone's account is gone.

So the pull/push decision keys on **`syncedUserId`** (the account this DEVICE
last synced with), not on whether the store happens to be empty:

| session uid | local store | action |
| --- | --- | --- |
| `=== syncedUserId` | any | push, as before |
| new uid | empty | pull (a reinstall, or a second device) |
| new uid | has work, remote profile blank | push (first sign-in — upload it) |
| new uid | has work, remote has a real profile | **`AccountConflictView`** |

**There is no merge, and the conflict screen is not one.** Merging two divergent
XP totals, streaks and review schedules is a real design problem nobody has
solved here. Asking turns silent loss into a choice, and the screen says plainly
that the other side will be replaced. `fetchRemoteSnapshot()` reads four columns
with no side effects precisely so neither side is touched before the student
answers; `flush()` checks `accountConflict` for the same reason.

`profiles` still has no DELETE policy, so the losing side can never be cleaned
up. Two Google accounts are still two uids with no linking.

### The OAuth callback, and the trap in the lazy import

`hasAuthTraces()` in `lib/auth.ts` decides whether to download the SDK at all, so
a student who has never signed in never pays the ~40KB. **Getting it wrong in the
other direction swallows every sign-in**, and the mechanism is not obvious: the
SDK's own `_initialize()` is the only thing that parses an OAuth callback out of
the URL, and it runs when the client is CONSTRUCTED. On the redirect back from
Google there is no stored session yet — the SDK is what writes it. "No stored
session, skip the import" would have bounced every student straight back to the
entry screen with nothing in the console.

Three independent tells, any one of which forces the slow path: a localStorage
key **starting with** the auth key (a prefix scan — PKCE parks code verifiers
under suffixed keys); OAuth parameters in the URL, **including the error ones**
(without them a declined consent screen lands back saying nothing); and our own
sentinel written before the redirect, which is the version-proof one because it
does not depend on the SDK's internal key layout.

**`flowType: "pkce"` is stated rather than inherited.** The supabase-js default
is the implicit flow, which returns the session in the URL FRAGMENT — a refresh
token in session history, reachable through a `Referer`. Changing it changes the
shape of the callback, which is why the detection covers both `code=` and
`access_token=`.

### React Compiler: `requireAuth` reads the store imperatively

`useRequireAuth()` returns a closure, and that closure must call
`useBrachNhaStore.getState()` rather than closing over a selector value. Reading
`authUser.id` would make the compiler narrow its memo dependency to that property
path and emit the check where the closure is BUILT — in the hook body, with no
guard above it — and `authUser` is legitimately null for every guest. It would
throw on the home screen for exactly the people the hook exists to serve. Neither
`tsc` nor `oxlint` can see it. Same reason `AuthPromptOverlay` is mounted as
`{authPrompt && <AuthPromptOverlay/>}`: the component never sees null, so there
is no guard to misplace.

### What the dashboard needs

Google is configured **outside this repo** and nothing in the code can check it
for you:

1. Google Cloud Console → OAuth 2.0 Client ID (Web application), redirect URI
   `https://<project-ref>.supabase.co/auth/v1/callback`, consent screen
   configured.
2. Supabase → Authentication → Providers → **Google → enable**, paste the client
   id and secret.
3. Supabase → Authentication → URL Configuration → Site URL and Redirect URLs.
   **A Vercel preview gets a fresh hostname every deploy**, so that list needs a
   wildcard or OAuth fails on every preview — the kind of thing diagnosed as
   "OAuth is broken" a week later.
4. Vercel → `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on Production AND
   Preview, then **redeploy**. Without them the endpoint returns 503 by design.

No database migration was needed. RLS already keys on `auth.uid()`, which works
identically for a Google user, and the avatar comes from the session rather than
a column.

## Bugs found and fixed during the build (know these patterns)

**StrictMode double-mounted the sync effect into two anonymous users.**
`main.tsx` wraps the app in `<StrictMode>`, so in development every effect runs
twice. Both passes of `useSupabaseSync` awaited `getSession()`, both were
correctly told "no session" because the first sign-in had not come back yet, and
both then called `signInAnonymously()`. One page load created TWO `auth.users`
rows; only the second kept a session, so the first was an orphan that no profile
data was ever pushed to — visible in the Authentication board as a blank row
that nothing explains. Fixed with a MODULE-LEVEL single-flight promise
(`signInInFlight` in `use-supabase-sync.ts`), not a ref: the two passes have
different refs, and the whole point is that they share one request. Cleared on
failure so a retry is possible, and on sign-out so the next student is not
handed the previous one's id.

The general pattern: an effect that CREATES a remote resource cannot dedupe with
a ref or a `cancelled` flag, because StrictMode's second pass gets its own copy
of both. Anything that must happen once per browser, not once per mount, needs
module scope.


**1. Zustand infinite-loop bug (the big one).** Any selector shaped like
`useBrachNhaStore((s) => ({ a: s.a, b: s.b }))` creates a new object every
render, breaks Zustand's reference-equality check, and causes an infinite
re-render loop ("Maximum update depth exceeded" / "getServerSnapshot should be
cached"). Fix: wrap multi-field selectors in `useShallow`:

```ts
const { a, b } = useBrachNhaStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

This applies in ~15 files (all under `features/`) — the count grows with every
new feature, so treat it as a pattern to apply, not a fixed list. Single-field
selectors like `useBrachNhaStore((s) => s.lang)` are fine as-is.

**2. Render-time setState anti-pattern** in the original app, ported into
`LessonDetail` at first, then fixed: rather than rendering a step and then
jumping away from it inside a `useEffect`, the "Continue" button handlers now
decide the correct next step directly (skip "Did You Know" if the lesson has no
content for it, skip the quiz step if there's no practice question).

**3. Redundant store action removed:** `doTask` (mark done only) was superseded
by `completeTask` (marks done + awards XP atomically) and deleted.

## Known bug, NOT yet fixed — decide before touching

`src/data/bac2-format.ts` — the LaTeX instructions inside the
`BAC2_ANSWER_RULES` template literal use single backslashes, so JavaScript eats
them before the string ever reaches Gemini:

```
source:  Use only commands KaTeX supports: \frac \sqrt \lim \int \sum ...
actual:  Use only commands KaTeX supports: \f rac sqrt lim int sum ...
```

`\f` survives as a formfeed, `\r` in `\right` becomes a carriage return, `\t` in
`\theta` a tab, and the rest lose their backslash entirely. The fix is to double
every backslash (`\\frac`) in that block, in both the `en` and `km` copies and
in the worked examples. It was left alone deliberately because it changes the
mentor's system prompt and deserves a re-test of answer quality, not a silent
edit. Oxlint reports all ~45 of these as `no-useless-escape` — that is the same
bug, not noise to silence.

Other standing lint warning: `src/components/ui/button.tsx`
`only-export-components` (the shadcn `buttonVariants` export). Cosmetic,
fast-refresh only.

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

Every feature is checked with **both** of these, zero errors, before being
considered done:

```bash
npx tsc -b          # NOT `tsc --noEmit -p tsconfig.json` — this is a solution build
npx oxlint          # NOT eslint — there is no eslint config in this repo
```

`npm run build` runs `tsc -b && vite build` and must also pass. For anything
touching the mentor, additionally exercise `POST /api/chat` against a running
dev server — with and without a key — since neither typecheck nor lint covers it.

For anything touching Supabase, additionally:

```bash
npm run db:check     # env → reachability → Google sign-in → all 10 tables
```

**The Game feature needs its migration applied before db:check passes** —
20260913000001_competitions.sql, by hand, in EACH developer’s own project. Until
then the check reports 2 of 10 tables missing and /game’s browse list shows its
failed state while the rest of the page keeps working.

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

Then in a browser: a fresh profile shows the entry screen and downloads NO
Supabase chunk; "Continue as Guest" lands on Home and survives a reload; the chat
FAB raises the prompt and fires no `/api/chat` request; a typed `/roadmap` shows
the locked panel **with the navigation still on screen**; and loading with
`?code=x` in the URL DOES pull the SDK (that last one is the callback-swallowing
trap — see the auth section).

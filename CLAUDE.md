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
app.** Weights 400/600/700/800 only — `font-black` has zero usages.

### Theming: two accent scales, and why one isn't enough

The app ships light **and** dark, **light by default**. `theme: "dark" | "light"`
lives on the store (persisted, and deliberately **not** cleared by `logout()` —
it's a device preference, not account data). Dark was briefly the default and
that value is still in older payloads, so `persist` is at `version: 2` with a
`migrate` that resets v1 `theme` to light — the stored "dark" there is the old
default rather than anyone's choice, and without the reset flipping the default
would change nothing for anyone who had already opened the app. This is the
first migration that actually fires; see the `merge` comment for why v0 data
could never use one.

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

The mark is `public/logo/brachnha.svg` through a plain `<img>`, the same
bundled-in-`public/` approach as `ui/avatar.tsx`. Two things about it:

- **The artwork has an opaque white background baked in** — it was supplied as
  an app-icon tile, and the outermost path is a full-canvas white rect. That is
  what `rounded-[26%]` is for: it clips the square into the tile shape so the
  mark reads as an app icon rather than a white block sitting on the dark
  theme's surface. Deliberately no `dark:` variant — a light badge in both
  themes is correct here, and this is the one place that's true.
- **It is 431KB of auto-traced paths** (426 of them, ~170KB gzipped) for
  something rendered at 40px. It's cached after first paint, but the audience is
  on Cambodian mobile data — see the `index.html` preconnect comment, same
  concern. A hand-drawn vector or a small PNG for on-screen use would be a large
  win; left as-is because replacing the artwork is the user's call, not a silent
  edit. The big centred `⚔️` on the login and survey screens is a separate
  illustration and was deliberately not touched.

`public/favicon.ico` is still the OLD icon — it does not come from this file and
was left alone.

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
quietly become of some other screen), then walks 10 routes × 9 widths
(320/375/390/430/768/1024/1280/1440/1920), writes a PNG each and asserts nothing
overflows. It separates **hard** failures (the page scrolls sideways, or an
element juts past the viewport with no scrollable ancestor) from **soft** ones
(an element measures wider than its own box — which a deliberate full-bleed
child does too, so Progress reports soft hits at phone widths and that is
correct). Exit code follows hard failures only.

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
  starts answering. `MockExam` sets it in an effect keyed on `started && !done`,
  **with a cleanup that clears it** — without that, a browser-back out of a
  running exam leaves the whole app with no navigation at all. It is excluded
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

**Lessons** (`features/lessons`) — subject-grouped list + dynamic
`/lessons/:lessonId` route with the full 7-step lesson flow (intro → content →
flashcard flip → fun fact → did-you-know → quiz → completion).

**Mock Exam** (`features/exam`) — intro/history screen, live question flow,
results screen with conic-gradient score ring.

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

**Game** (`features/game`) — live game card, stats, opponent list, game
history. Also fake/demo data on purpose.

**Grade Prediction** (`features/grade-prediction`) — `/grade-prediction` route
plus a Home widget, both fed by one source: `demo-data.ts`. Nine components plus
the rule-based model in `use-grade-prediction.ts`. Fake/demo data on purpose.

**Leaderboard** (`features/leaderboard`) — `/leaderboard`, five components over
one 30-student `demo-data.ts` and the pure ranking layer in
`utils/leaderboard.ts`. Fake/demo data on purpose, with one exception noted
below. Its own section follows.

**Profile** (`features/profile`) — stats summary (reuses Home's `StatPills`
as-is), grade/language card, and a Logout button that shows a Cancel/confirm
step before calling the store's `logout()` (resets name, survey, XP, level,
streak, tasks and exam history, sending the user back to Login).

**KruAI chat** (`components/shell/chat-overlay.tsx` + `server/chat-handler.ts`)
— real Gemini wiring, done. See the endpoint section above.

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

## Still not built

Flashcards/Quiz (ការអនុវត្ត), Document Library,
Streak-w/-Friends — these exist as disabled "Soon" items in the nav
(`lib/nav-items.ts`) but have no route or feature folder. Flashcards currently
only exist as step 3 of the lesson flow, which is why the nav item is a
placeholder rather than a link to `/lessons`.

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
`commitment`, `pledgeSeen`, `xp`, `level`, `streak`, `tasks`, `examResults`,
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
that caption wrong.

**Progress, Game, Grade Prediction and Leaderboard intentionally use fake, fixed
demo data** (`features/*/demo-data.ts`), not live store data. An explicit user
decision to avoid edge-case bugs (e.g. a brand-new user with zero exams breaking
a chart). The files have comments noting what real data would need to exist
(per-subject score tracking, a daily activity log) before switching over. The
leaderboard's list is the longest of those: cross-student ranking, an XP ledger
with timestamps, a daily activity log, and **active** study minutes with idle
time excluded — counting "app is open" would make leaving a phone unlocked a
winning strategy, which is exactly what that screen is built to argue against.
Its one live read is the student's own name.

**Mock Exam results DO use real data** (`examResults` in the store, persisted) —
a deliberate improvement over the original, where exam history lived in
component state and was lost on navigation.

**Roadmap's Today's Mission and Home's daily-tasks checklist intentionally share
the same `tasks` store fields** (lesson/practice/flashcards). Completing a
mission row on Roadmap shows that item as done on Home, and vice versa — by
design, one real completion, not a duplicate tracker.

**Game avatars** (`live-game-card.tsx`, `opponent-list.tsx`,
`game-history.tsx`) render through `components/ui/avatar.tsx`, a plain `<img>`
pointed at `/avatars/{seed}.svg` — DiceBear-style pictures downloaded once and
bundled in `public/avatars/`, keyed off the `avatarSeed` strings in
`features/game/demo-data.ts`. This replaced a version that called DiceBear's
live API on every render; that was dropped after the API proved unreachable on
some networks (browser `err_name_not_resolved` even though server-side curl
worked), breaking the avatars outright. There is no live-generation fallback
anymore, so adding a new `avatarSeed` means downloading a matching SVG into
`public/avatars/` too.

## Bugs found and fixed during the build (know these patterns)

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
- Deploying: Vercel, config in `vercel.json`. `GEMINI_API_KEY` must be set in
  the Vercel project's Environment Variables — `.env` files are not uploaded.

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

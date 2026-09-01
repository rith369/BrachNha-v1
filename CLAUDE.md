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
this landed — leaving it would have shown the counters twice on that one screen.
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
quietly become of some other screen), then walks 11 routes × 9 widths (plus 3 click-driven states)
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
session then by subject) and **វិញ្ញាសារបង្កើតថ្មី** (that original flow, unchanged),
built on the same pieces as the Study page so the two screens cannot drift.

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

**The `តេស្ត` button stays tappable on an empty paper** — a deliberate departure
from this app's dim-and-don't-tap precedent (`sidebar-nav.tsx`'s `href: null`
rows, the survey's `StudiedStep`, `subject-card.tsx`'s zero-lesson tile). It was
chosen: the tap is not silent, it explains itself, and the `ឆាប់ៗនេះ` chip means
the state is legible **without** tapping — the same principle as `studiedNote`
being rendered unconditionally. The button's two looks carry the real signal:
neutral outline pill while pending, subject fill under white text once the paper
has questions. Every paper is pending today, so the screen matches the reference
design now and gains the distinction for free later.

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
bug. A row shows `lesson.title` **alone**, exactly as `subject-path-view.tsx`
does: prefixing "មេរៀនទី N" would render "មេរៀនទី ១ · មេរៀនទី ១" on every lesson
whose real name hasn't been supplied, because that placeholder title *is* its
number.

**`FLASHCARD_SUBJECTS` is physics/chemistry/biology/history — a closed list.**
Flashcards earn their keep on recall-heavy material, not on subjects examined by
working a problem or writing prose, so math, Khmer and the chosen language appear
under **Quiz only**. A named constant beside `FOUNDATION_SUBJECTS`' precedent,
and the render order comes from the catalog rather than from that array, so every
subject list in the app stays in one order. Quiz uses `allSubjects()`, which
drops the unchosen language — 7 cards, not 8.

**`data/practice.ts` is EMPTY, and that is the normal state**, exactly as
`PAST_PAPER_QUESTIONS` shipped. Counts are read from it rather than authored
beside it (`lessonCountFor()`'s rule), so a row cannot claim a deck the app lacks
and playability is derived from the same number. Adding one entry turns a row on
with no other code change. **Both runners are therefore unreachable in the app as
shipped** — add a temporary entry to exercise them. Note `PracticeCard` is the
one new type, while the quiz reuses `SectionQuestion` **verbatim** rather than
growing a twin.

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

**The consequence is the whole page today, and it is intended:** with
`data/practice.ts` empty every tile on both tabs is dimmed, so nothing on
`/practice` can be opened at all. That is the honest rendering of having no
content, and it resolves by writing content rather than by re-enabling the link.
`/practice/:mode/:subjectId` stays reachable by URL for development.

**No emoji anywhere in this feature** — Lucide icons only, the newer
section-content rule rather than the legacy lesson flow's emoji. Both runners use
`utils/focus-styles.ts`'s ladder and `FocusLayout` with `showStats` on, since a
lesson-like activity opts in and only the two assessments leave the counters off.
The flashcard flip is the same `preserve-3d` + `backface-visibility` technique
`lesson-detail.tsx` step 2 uses, and Continue is disabled until the card has been
turned over — `SectionDetail`'s `quizDone` gate applied per card.

`defaultMathLayout` (`utils/math-input.ts`) now has **two patterns**, because the
subject sits in a different place in each: the first id segment on a lesson or
section, its own third segment on a practice route.

**Bottom nav is untouched.** It is a 5-tab bar and already full; practice is a
drawer/sidebar destination, which is why its `NavItem` carries no `shortLabel`.

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

Document Library and Streak-w/-Friends — these exist as disabled "Soon" items in
the nav (`lib/nav-items.ts`) but have no route or feature folder.

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
that caption wrong. **Past-paper attempts are excluded for the same reason and
two more**: `chat-prompt.ts` derives "average mock-exam percentage" from that
array and states it to KruAI as a fact about the student, and the generated-exam
tab renders it UNFILTERED as "Previous Results" — so a past-paper attempt would
surface under the wrong tab on the same screen. XP *is* awarded for both. When
past papers deserve a history of their own it should be a separate persisted
field, not a widening of this one.

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

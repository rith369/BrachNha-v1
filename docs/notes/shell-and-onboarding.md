# App shell, layout, focus mode and onboarding

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## What's fully built and working

**Shell:** `AppShell` (`src/components/shell/app-shell.tsx`) — deliberately NOT
a phone mockup: no frame, notch, or status bar, just a `mx-auto h-dvh` container
that goes full-bleed on a phone. It was renamed from `PhoneShell` because that
name kept implying a device frame that has never existed; don't add one. Also
`AppHeader` (the app bar with the menu button, below), `Drawer`
(Sheet-based, built from one shared `src/lib/nav-items.ts` config), `BottomNav`,
`FabChat`, `ChatOverlay`. `AppShell` also syncs `document.documentElement.lang`
from the store in an effect, because `index.html` ships `lang="en"` and the real
value isn't known until React mounts.

`AppShell` takes optional `hideChrome` (unmounts the app bar and `Sidebar`) and
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

### The app bar — level ring, streak, coins and the menu in ONE row

`components/shell/app-header.tsx`, rendered by `AppShell` at the top of the
content column on every screen that isn't hidden-chrome. **It replaced two rows
(2 Oct 2026, the user's pick of "option C" from a page of four mockups):** a
right-aligned global `StatBar` of four pills (Lv / XP / streak / coins), and below
it `TopBar`, a floating `absolute top-3 right-4` hamburger every page had to keep
a `pr-14` gutter for. Home also had its own `HomeHeader` (logo + "Level 2 · 130
XP"), repeating two of those numbers. `TopBar` and `HomeHeader` are deleted; the
logo and name now live only in the sidebar and drawer.

- **Level and XP are ONE element**: a ring around the level number that fills with
  the XP earned inside the current level, plus "Level N", a thin bar and "30 / 120
  XP". **The level rule is `utils/level.ts`** (26 Oct 2026, the user's rule, which
  replaced a flat 100 XP a level): each level costs 20 XP more than the one before
  (1 → 2 is 100, 2 → 3 is 120, 3 → 4 is 140…), so reaching level L takes
  `100(L-1) + 10(L-1)(L-2)` XP. **The level is DERIVED from total XP**, never
  counted up: `levelForXp()` writes the store's `level` in `award()`, in the
  persist `merge` on every load and on a pull, and the header and Home's "to next"
  pill read `levelProgress()` / `xpToReachLevel()`. Re-deriving on load moved every
  existing student onto the new rule, including the ones it moved DOWN (1,000 XP
  was level 11 and is level 7), which the user chose. No persist version bump was
  needed for that. `profiles.level` on the server catches up on the student's next
  push; nothing ranks by it (the leaderboard uses XP).
- **The streak pill links to `/streak`** (the same doorway as Home's Flame pill);
  coins are a plain div, since there is no page behind them.
- **The menu button is in normal flow**, `lg:hidden` (the sidebar replaces it), and
  `invisible` rather than unmounted while the chat is open so the row doesn't shift.
  No page reserves space for it any more: every `pr-14` that existed for the old
  hamburger was removed. (`sidebar-nav.tsx`'s `pr-14` is for the drawer's own close
  button and stays.)
- **The XP bar is `w-full max-w-24` inside a `flex-1 min-w-0` column.** A fixed
  width ran into the streak pill at 320px.
- **Gated on `!hideChrome`**, like the Sidebar: focus tasks, the mock exam and
  placement test (a live counter turns a measurement into a scoreboard) and the
  roadmap's onboarding lock stay clear of it. `FocusLayout`'s `showStats` still
  renders `StatBar` (with the theme toggle) on lessons; that is the only `StatBar`
  left, and those routes hide the app bar, so the two never show together.

**Page top-spacing convention:** pages start at `pt-4` under the app bar, with no
right gutter (there is no floating button to clear). Bottom padding is `pb-20` on
pages that render `BottomNav` and `pb-36` on those that don't
(roadmap/profile), so content clears the FAB at `bottom-20`.

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

**A ROUTE DOES NOT HAVE TO BE IN THAT LIST, and `/streak` deliberately is not.**
It was removed from `featureNavItems` at the user's request: the list had grown
past a phone screen, and Home's Flame stat pill (`stat-pills.tsx`) already shows
that count and links to it. A nav row there is a second entrance to a screen the
student is looking at the summary of. Before adding a row for a new route, check
whether Home already points at it. `/roadmap` was removed with it for the same
reason (the "Quest Map" chip) and was put BACK on 28 Oct 2026 at the user's
request, directly under "Streak with Friends". The comment block in
`nav-items.ts` spells this out; don't quietly re-add `/streak`.

`BottomNav` and the app bar's menu button carry `lg:hidden` on their own roots rather than on the
9 pages that render them. `FabChat` and page `pb-20`/`pb-36` both exist to clear
the bottom nav, so both get `lg:` overrides — without them desktop has ~80px of
dead space under every page.

**One name lockup, for the same reason.** `components/shell/wordmark.tsx` owns
the logo + "BrachNha" + optional subtitle, and is the ONLY place that gradient
wordmark is spelled out. Its consumers are `SidebarNav` (so
the drawer and the desktop sidebar both get it), `LoginView` and `SurveyView` (Home had one too, `HomeHeader`, deleted with the app bar change).
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
and was deliberately not touched. `public/favicon.ico` was the OLD icon until
27 Oct 2026; it is now rendered from this artwork by `scripts/app-icons.mjs`
(see the installable-app section).

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
  nothing but a task from the moment you land: `/sections/:id` (and, until 7 Oct 2026,
  `/placement-test/:subject`).
  (It tested `startsWith("/lessons/")` with the trailing slash for the old 7-step
  lessons, so the `/lessons` LIST stayed an ordinary page; that path only redirects
  now.)
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
drops the app bar/`Sidebar` for the roadmap onboarding lock) and `BottomNav`
(returns `null`), which is checked in the component rather than in the 6 pages
that render it.

**The AI mentor is a SEPARATE question from the navigation, and the two answers
differ.** `hideChrome` and `hideMentor` are two `AppShell` props, driven by two
hooks in `hooks/use-focus-mode.ts`:

| Screen | Nav | Mentor |
| --- | --- | --- |
| Lesson section (`/sections/:id`) | hidden | **available** |
| Mock exam, while answering | hidden | blocked |
| Game match (`/game/create`, `/game/play/:id`) | hidden | blocked |
| Roadmap onboarding lock | hidden | blocked |
| Everything else, incl. `/exam` intro and results | shown | available |

`useFocusMode()` answers "hide the navigation"; `useMentorBlocked()` answers "is
the student being measured". The second is a strict subset — `isAssessmentRoute`
in `utils/focus-routes.ts` is the game match only (the placement test, its first
route, was deleted on 7 Oct 2026), ORed with the store's
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
layout off `/sections/:id` (and `/lessons/:id` until the old lessons were deleted).

**`FocusLayout`'s `showStats` puts the XP / streak / coins counters and a
light-dark toggle above the progress bar.** It is opt-in and lesson sections opt in —
`SectionDetail` (and the deleted `LessonDetail`) — while the mock exam and placement test do
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

**A MULTI-STEP FOCUS SCREEN MUST SCROLL ITSELF BACK TO THE TOP** —
`hooks/use-focus-scroll-top.ts`, called with the step. One scroll container
serves a whole task (`FocusLayout`'s body, marked `data-focus-body`) and React
swapping the children does not touch its `scrollTop`, so a student who reaches
the bottom of a long step and presses Continue lands at the BOTTOM of the next
one, looking at a footer with the question off-screen above. It reads as a step
that failed to load, and it was reported exactly that way.

The attribute and the technique existed from the start — for the past-paper
runner, whose reading passage is several screens tall — and **every other
multi-step screen simply never called it**: the lesson flow, the section flow,
the practice quiz, the game run and the flashcard review were all left wherever
the previous step ended. They share the hook now; that runner's private copy is
gone so there is one mechanism rather than two that can drift.

Three things in it are decisions. It queries the DOCUMENT rather than taking a
ref, because exactly one `FocusLayout` is mounted at a time and two of the five
callers had no ref to hang `closest()` on. It is a `useLayoutEffect`, so the
correction lands before paint — with `useEffect` the wrong offset is painted
first and then jumps, which on a phone reads as a flicker. And the scroll is
instant, never smooth, the same call `subject-path-view.tsx` makes.

**Verify it by MEASURING, not by looking**: scroll a step to the bottom, press
Continue, and read `scrollTop` on `[data-focus-body]`. A screenshot of the next
step looks plausible at any offset, which is how this shipped broken.

**Every focus screen must have a working exit.** The exam's answering screen had
none before this — survivable only because the nav was still there to escape
through. It now passes `confirmExit`, which shows a two-tap confirm first,
because leaving discards the attempt.

(`PlacementTestRunner` and its route were deleted on 7 Oct 2026; the next two
paragraphs about it are history.) `PlacementTestRunner` took an opt-in `focus` prop that **defaulted to false**:
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

### The intro: three "why science" screens, then Home as a guest

`features/intro` (the user's brief, 28 Sep 2026): ឱកាសកាន់តែទូលាយ → វិថីកាន់តែច្រើន
ក្រោយចប់ថ្នាក់ទី 12 → វិទ្យាសាស្ត្រគឺលើសពីរូបមន្ត, then straight to Home as a guest
(there has been no entry screen since 2 Oct 2026; see the auth section). Its job is
to make a student feel that choosing science was right before asking them for
anything. Khmer-only, like the Study/Exam/Practice pages; the copy is the user's,
with the one change that "grade 12" is written with Latin digits.

- **One branch in `AppShell`'s gate, after the conflict screen**: `!introSeen &&
  !userName && !isAuthenticated`. Only someone who has not started yet sees it,
  which keeps every existing student, an OAuth callback and `scripts/shots.mjs`'
  seeded profile clear of it with no extra condition. With Supabase unconfigured
  it shows before `LoginView` instead. In-app browsers (Telegram) see it too now:
  they use the app in place as a guest rather than being sent away first.
- **Seen-ness is a DEVICE fact in its own key** (`lib/intro-seen.ts`,
  `localStorage["brachnha-intro"]`), the install prompt's reasoning: as a store
  field it would sync for nothing and be wiped by `logout()`, replaying the intro
  to someone only switching accounts.
- **LAZY** (`React.lazy` in `app-shell.tsx`): measured +8KB gzipped on the entry
  chunk inline, for a screen each device sees once. Now its own
  `intro-view-*.js` (~7KB gzip) and the entry chunk moved by 0.4KB.
- **The artwork is CSS + Lucide, no image**: a filled disc on the path nodes'
  black-mixed lip, a slowly turning dashed orbit and four floating tiles.
  `animate-intro-spin` / `animate-intro-float` are transform-only and in the
  reduced-motion block; `MotionConfig reducedMotion="user"` covers the slide
  transitions. Background glows are radial gradients, not blur filters. The
  flame screen's main glow is pink, not yellow: yellow over the dark background
  turns olive-brown.
- **The title gradient uses `--color-*`, not `bg-brand-tri`**: it is text, and
  brand purple is ~2.7:1 on the dark background.
- **Forward: button, swipe, arrow keys, dots. Only the button finishes** (and
  រំលង, which skips; not in the brief, added so nobody is forced through three
  screens). A swipe or key past the last screen does nothing.
- **Phone is one column; from `lg` the picture sits beside the text** and the
  footer sits under the text column. Single-column at 1280×800 pushed screen 3
  below the fold. Below that the body scrolls, with a 28px mask fade at its
  bottom edge so it reads as "more below".

Verified in real Chrome at 320×568, 390×844 (both themes) and 1280×800: no
sideways scroll, no page error, finishing writes the flag and lands on the entry
screen, a reload does not bring it back, and touch swipe / arrow keys / back /
skip all work.

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

**Lessons** (`features/lessons`) — a two-tab grid of SUBJECT tiles, each opening
its subject's path (`/subjects/:subjectId`), whose nodes open lesson sections
(`/sections/:sectionId`). The old 7-step lessons at `/lessons/:lessonId` were deleted
on 7 Oct 2026; that path redirects to `/lessons`.

**Game** (`features/game`) — asynchronous competitions between real students.
See its own section below.

**Grade Prediction** (`features/grade-prediction`) — `/grade-prediction` route
plus a Home widget, both fed by one hook (`use-grade-prediction.ts`) over
`real-prediction.ts`. REAL DATA since 1 Oct 2026, with an empty state until a
student has 20 scored answers or one exam; see "Phase 0" near the end of this
file. The rule-based model is still `utils/gradeProbability.ts`.

**Leaderboard** (`features/leaderboard`) — `/leaderboard`, a MIXED board: a
25-student sample cohort (`demo-data.ts`, unmarked since 29 Sep 2026), real
students from the `leaderboard()` SQL function, and the viewer's own live row,
ranked together by `utils/leaderboard.ts`. Its own section follows.

**Streak** (`features/streak`) — TWO routes measuring TWO DIFFERENT THINGS.
`/streak` is the student's own solo streak (all store data since 1 Oct 2026 +
the milestone maths in `utils/streak.ts`); `/streak/friends` is a SHARED streak with each
friend, which only advances on days BOTH of them finish (real since 13 Oct 2026:
`friendships` in the database + `utils/streak-friends.ts`). Their own sections
follow.

**Profile** (`features/profile`) — identity row (Google photo, editable name),
stats summary (reuses Home's `StatPills` as-is; its fourth pill counts every
scored answer in `contentLog`, the same total Progress sums, flashcard grades
excluded. It read `examResults` and said 0 for everyone until 28 Oct 2026, since
no generated paper has questions), a real **study calendar**,
grade/language card, and a Logout button that shows a Cancel/confirm step
before calling the store's `logout()` (resets name, survey, XP, level, streak,
the study log, tasks and exam history, sending the user back to the entry
screen). The calendar and identity row have their own section below.

**KruAI chat** (`components/shell/chat-overlay.tsx` + `server/chat-handler.ts`)
— real Gemini wiring, done. See the endpoint section above.

## Screen reader structure (5 Nov 2026)

Every screen has one `<main>` and one `<h1>`. The scan of the same 19 screens in light went from 680 structure warnings to 0.

- **`<main>` is in `AppShell`** around the page, and around the intro, name form and survey, which render outside it.
  `/privacy` has its own, having no shell. **`<header>` is the app bar.**
- **`<h1>`: a screen's visible title where it has one**, the same classes on another tag.
- **`FocusLayout`'s `heading` prop** is a hidden `sr-only` heading for a task with no title of its own: a running paper,
  quiz, Battle, flashcard review or mistakes round. `/exam/subjects` and a lesson's second step have one too.
- **`h1` takes the heading font from a global rule**, which beats a utility class. The four titles in the body font keep it
  with `font-body!`: Home's greeting, a lesson's title, the name form and the survey.

**Verified:** 19 screens in two themes compared before and after, 38 of 38 pixel-identical with the random quote held still.
`tests/e2e/structure.test.mjs` covers 26 routes, a guest's screens, first-run and the running tasks. **Not verified:** a real
screen reader, or how a phone reads Khmer aloud.

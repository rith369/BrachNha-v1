# Design system: neobrutalism and theming

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

### The look is NEOBRUTALISM (1 Oct 2026)

The user moved the app from the soft pink/purple gradient style to neobrutalism,
after approving a preview canvas (light and dark). Text is UNCHANGED (same
fonts and weights, the user's call). Almost all of it is token-level in
`src/styles/globals.css`, so most components changed with no edit:

- **Outlines.** `--color-border` is solid ink (`#141414` light, cream `#f4efe6`
  dark), and `--default-border-width: 2px` in `@theme` makes every bare
  `border` (and `border-t`, `divide-y`, …) 2px app-wide. New components just
  write `border border-border`.
- **Hard shadows, no blur.** `shadow-panel` / `-panel-sm` / `-cta` / `-cta-lg`
  keep their names and are now `Npx Npx 0 0 var(--color-shadow)`: ink in light,
  CREAM `#f4efe6` in dark, the same colour as the outlines (the user's call:
  black in light, so white in dark). It was purple for one revision. `shadow-hard` /
  `shadow-hard-sm` are INK in both themes, for things sitting on a bright fill.
  They are not called `shadow-ink`: Tailwind would read that as a shadow COLOUR
  because `--color-ink` exists too.
- **Flat colour.** `bg-brand` and `bg-brand-tri` are one flat brand purple
  (`#7c3aed`, white text 5.7:1); `bg-brand-tri` and `bg-flame` stay single-colour
  gradient IMAGES because page titles clip them into text. **`bg-night` is the
  ONE real gradient left** (navy to purple): it was flattened with the rest, and
  the user asked for it back because the Bac II Simulation card in flat neo-blue
  "is not premium". Don't flatten it again.
- **Bright fills** `bg-neo-yellow / -pink / -mint / -blue / -orange / -red`,
  identical in both themes, ALWAYS with `text-ink` (near-black in both themes,
  never `text-text`, which turns cream in dark). Home's hero is `bg-neo-yellow`;
  the active bottom-nav tab is a yellow sticker.
- **Page titles with a mark use `components/page-title.tsx`** (13 Oct 2026): a
  Lucide icon on a neo fill tile, the title in ink, an optional subtitle.
  Progress (mint), Grade Prediction (pink), Leaderboard (yellow), Profile
  (blue) and Roadmap (orange). They were `bg-brand-tri bg-clip-text
  text-transparent` titles with an emoji, and **clipped text paints an emoji
  with the gradient too**, so "📈" drew a solid purple square. Never put an
  emoji inside a clipped-text title. The last two (KruAI's "🤖" in
  `chat-overlay.tsx`, "✍️" in `commitment-overlay.tsx`) became Lucide `Bot`
  and `PenLine` icons beside the clipped text on 27 Oct 2026.
- **Page and surfaces:** cream `#fff7e8` page, white cards; dark `#16131f` /
  `#221e2e`. Corners one step tighter (`--radius-xl/2xl/3xl` overridden), pills
  (`rounded-full`) unchanged.
- **States keep their colour in the FILL, not the outline**: a selected or
  correct/wrong option is `border-border bg-{mint|pink|purple}/30 text-text`
  (the sweep turned every `border-x/30-50 bg-x/N text-x` triple into that).
  A focused input is `focus:border-purple`.

**The sweep that went with it:** ~310 tinted borders (`border-purple/10` and the
like) became `border-border` across 104 files by script; hand-made gradients on
the KruAI button, the drawer/sidebar active row, the language and theme
switches, Grade Prediction, the pledge button, the Roadmap nodes and the weekly
chart were flattened. **Left on purpose:** the dark overlay on the video poster
(text legibility) and the subject-art placeholder. `features/practice/components/
quiz-results.tsx` was skipped while another session had it open and may still
carry a tinted border.

**The Mock Exam chooser and `/exam/simulation` came in a second pass.** The
simulation briefing (`exam-simulation-view.tsx`) had been built as a dark "glass"
screen of its own: a fixed `#090b14` background in BOTH themes, frosted cards
and blurred orbs. One orb sat at `-right-24` inside the page's `overflow-y-auto`
scroller, which forces overflow-x to auto, so **the whole page scrolled
sideways at every width**. Nothing caught it because `scripts/shots.mjs` had no
route for it; it has one now (`exam-simulation`). The page is on the theme
tokens throughout, each subject's icon tile is its own `--subject-*` fill under
a white glyph, and the grade scale is the five neo fills. Its closing "Ready to
test yourself?" block is the one exception: `bg-night` with the dot texture and
a clipped yellow glow, matching the simulation card on `/exam`. **The rule it broke,
for any decoration:** nothing may be positioned past its own box unless an
ancestor clips it, because every page scroller here turns that into a sideways
scroll.

**The "two accent scales" section below still holds** for `--brand-*` vs
`--color-*`; the new `--neo-*` fills are a third role (light fills under ink
text) and must never carry white text.

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

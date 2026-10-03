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
| **KaTeX** | ✅ Use | Typesets both sides of the KruAI conversation AND the maths in a practice quiz. Reached only through `components/shell/math-text.tsx`, which two lazy routes import — so it builds its own shared chunk and stays out of the entry chunk. That chunk is named **`math-render-*.js`** since 3 Oct 2026 (utils/content-check.ts imports KaTeX too; it was `math-text-*.js`), so check it by content, not name. **Verify that after any build**; it is one eager import away from first paint |
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
picks up Noto, and mixed strings like "មេរៀនគ្រឹះ & ទី 12" render correctly from
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

### NO EM DASHES in anything a student reads

**Never write `—` (U+2014) in a user-visible string.** Use a comma, a full stop, a
colon, or parentheses. In Khmer that usually means the khan `។` between two
sentences or `៖` before an explanation; in English a comma or a full stop.

The user's instruction (28 Sep 2026), and it is about the app's voice rather
than about typography: an em dash reads as an aside in English and has no
settled role in Khmer prose at all, so it makes a sentence harder to parse for
the audience that matters.

```
BAD   "មិនត្រឹមត្រូវ — ហេតុអ្វី?"        "Could not copy — select the link above."
GOOD  "មិនត្រឹមត្រូវ។ ហេតុអ្វី?"         "Could not copy. Select the link above."
BAD   "ករណីទី 1 — ភាគបែងដូចគ្នា៖ …"
GOOD  "ករណីទី 1 (ភាគបែងដូចគ្នា)៖ …"
```

**Scope, decided deliberately:** strings only. 61 were rewritten by hand when the
rule landed, each with the punctuation that fitted rather than one blind
substitution.

**SEARCH ALL THREE QUOTE STYLES.** The first sweep only scanned `"double
quotes"` and declared itself done; six survived in `` `template literals` ``,
which is exactly where an interpolated string hides — two `aria-label`s built
from a status word, the signed pledge in both languages, and **two inside
KruAI's own system prompt**, which is the worst of them: the model copies the
prompt's punctuation into answers students read, so an em dash there reproduces
itself at runtime. (`data/bac2-format.ts` now also TELLS the model not to use
one, in both languages; those two are the rule quoting the character it bans.) **Code comments and the two markdown files were left alone** (about
3,100 of them) because nobody outside the repo reads those, and a mechanical
swap across them would mangle sentences that an em dash is genuinely holding
together. New comments need not follow the rule; **new strings must**.

**Nine are left on purpose, and they are not prose.** A bare `"—"` is the "no
value yet" glyph on an empty score, an unset grade, a blank prediction
(`score-hero.tsx`, `prediction-hero.tsx`, `quiz-detail.tsx`, `profile-view.tsx`,
`roadmap-view.tsx`, `exam-hub.tsx`, `commitment-overlay.tsx`,
`grade-prediction-view.tsx`). A comma cannot stand in for a placeholder. If those
should change too it is a design decision about what "no value" looks like, not
this rule.

### Student-visible Khmer stays Khmer, with three exceptions

**Casual English does not belong in a Khmer string.** `Tip 1` is `គន្លឹះទី 1`,
`GCD` is `កត្តារួមធំបំផុត`, `vs` is `ធៀបនឹង`, `Keep, Change, Flip` is
`រក្សា ប្តូរ បញ្ច្រាស`, `Algebra` is `ពិជគណិត` and `Limit` is `លីមីត`. The
user's instruction (28 Sep 2026), swept across every user-visible string when it
landed.

**Three things stay in Latin, and each for its own reason:**

- **Scientific and technical terms a student meets on the exam paper**, written
  as a Khmer term with the Latin in parentheses on first use: `ខួរធំ (Cerebrum)`,
  `សកម្មភាពផ្លាត (Reflex action)`, `កត្តារួមធំបំផុត (GCD)`, plus units and
  notation (`pH`, `m/s`, `lim`, `∫`). This is the same rule `chat-prompt.ts`
  already gives KruAI: do not invent a Khmer coinage for something the student
  will meet in Latin on the paper. **An established term NAME keeps its English
  words too** — `(Fight or Flight)`, `(Treaty of Versailles)`, `(Rest and
  digest)`. The `of`/`and` inside those is part of the name, not loose English.
- **Product terms**, on the user's earlier instruction: `KruAI`, `BrachNha`,
  `XP`, `Streak`, `Flashcard`, `Quiz`, `Bac II`. `translations.ts`'s own `km`
  column already spells these in Latin.
- **The English exam paper and its drills** (`data/papers/english-2025.ts`,
  `english-drills.ts`). Its content is English by definition; only the Khmer
  EXPLANATIONS around it follow these rules. The same goes for text quoting a
  phone's own UI, such as `«Add to Home Screen»` in `features/install/copy.ts`,
  which has to match what the student actually sees on their device.

**Neither rule is machine-checked.** `check:digits` catches Khmer numerals and
`check:quiz` catches broken TeX; nothing catches an em dash or a stray English
word, so both are a matter of writing them correctly the first time. To audit by
hand: search user-visible strings for `—`, and for Latin words inside strings
containing Khmer.

### Digits are Latin everywhere — the rule, and how it is enforced

**EVERY number this app shows a student is written with Latin digits (0-9), in
both languages.** Khmer prose, Latin numbers: `ជំពូក 3 · មេរៀនទី 1`, `45:09`,
`0/48`, `10 សីហា 2027`. There is no per-screen exception and no `lang` branch —
a number does not change meaning with the interface language, and the student
sits an exam paper, reads a clock and types into a math field that are all in
Latin digits already.

**This reverses the app's original convention and `src/utils/khmer-num.ts` is
DELETED.** That module (`toKhmerDigits`) converted counts, scores, chapter
numbers and clocks to Khmer numerals on the Khmer-only pages, and
`features/game/copy.ts`'s `num(value, lang)` did the same per language on the
bilingual ones. Both are gone along with all ~90 call sites, rather than left
in place unused — a helper that exists is a helper that gets called again.

Four places this can come back, and none of them is a string literal:

- **`toLocaleDateString`/`toLocaleString` with `km-KH`, or with NO locale at
  all.** A device that ships Khmer locale data formats both with Khmer
  numerals. Every call now passes `"en-GB"` explicitly, and Khmer dates go
  through **`formatKmDate()` in `utils/khmer-dates.ts`**, which builds the
  string by hand from `KM_MONTHS`. That fixes the *second* bug those call sites
  had too — the one this file has flagged for months, that desktop Chrome has no
  Khmer locale data and silently formats `km-KH` in ENGLISH. `commitment-banner.tsx`
  and `utils/exam-date.ts` were the two named offenders; both are fixed.
- **KruAI's own answers.** `data/bac2-format.ts` had its numbered skeleton
  (`១. ២. ៣.`) and both worked examples written in Khmer numerals, so the model
  copied them into student-visible replies — an example outweighs a sentence, the
  same trap `ANSWER_LANG` already records. They are Latin now, and
  `BAC2_ANSWER_RULES` carries an explicit rule in BOTH columns.
- **Transcribed textbook content.** `scripts/ocr-pages.mjs` used to tell the
  model to keep a printed Khmer numeral as a Khmer numeral. It now converts at
  OCR time, so nothing non-compliant can reach `src/data/` in the first place.
  A Khmer reader checking the text against the page reads a digit either way.
- **A comment quoting the old rendering.** They teach the convention to the next
  person, which is how it would come back. They were all rewritten too.

**`npm run check:digits` is the enforcement** (`scripts/check-digits.mjs`): it
fails on any Khmer numeral (U+17E0-U+17E9) in `src/` or `index.html`, comments
included, and prints the Latin version of each offending line. Neither `tsc` nor
oxlint can see the difference between `"១២"` and `"12"` in a string literal, so
this is the only thing that can. Run it with the other checks — see the
verification standard at the end of this file.

Not scanned, deliberately: `report.md` (a dated changelog; old entries describe
what shipped then and must not be rewritten), CLAUDE.md (it has to be able to
name the characters it is banning) and `scripts/` (dev tooling, never served).

**Khmer NUMERALS are what this bans, not Khmer numbers written as WORDS.**
`ផ្នែកសំខាន់ទាំងបី` ("the three main parts") is prose and stays. The script is
the rule, not the language.

### Multiple-choice option distribution: correct answers must never cluster on option 1

**When authoring or updating any quiz, mock exam, or drill questions, correct answers must be evenly distributed across all option positions (0, 1, 2, 3 / ក, ខ, គ, ឃ). Never leave the correct answer defaulting to option 1 across a set.**

- **The trap**: Authors often draft the correct answer first and write three distractors below it, inadvertently leaving `correct` at index 0 (`ក.`). Students quickly notice the pattern and guess the first choice for 100% scores without doing the work.
- **The rule**:
  - Across any question set (e.g. a 10-question quiz, skill drill group, or exam section), distribute the correct answers evenly (~25% each across positions 0, 1, 2, 3 / ក, ខ, គ, ឃ).
  - Never let all questions in a skill or section share the same position.
  - If options carry Khmer letter prefixes (`"ក. "`, `"ខ. "`, `"គ. "`, `"ឃ. "`), ensure both the option string and the `correct` field match, and that index 0 is always labeled `ក`, index 1 `ខ`, index 2 `គ`, and index 3 `ឃ`.
  - Explanations must focus on mathematical steps or factual explanations rather than hardcoding "The answer is ក", so explanations remain robust.

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

There is no single model: `GEMINI_MODELS` in `chat-handler.ts` (currently
`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest` →
`gemini-3-flash-preview`) × a POOL of API keys is a list of candidates, called
through the official `@google/genai` SDK's **Interactions API** (`ai.interactions.create`), NOT the
older `models/*:generateContent` endpoint the original Netlify function used.
Replies stream as plain UTF-8 text (not SSE — there's one stream of text, so the
client just reads `response.body.getReader()`).

`store: false` is passed deliberately so Google doesn't retain student
conversations server-side; we replay history ourselves from the Zustand store.
**It does not change what the FREE tier's terms allow Google to do with the
content** — on unpaid use, prompts and replies may be used to improve Google's
products and reviewed by people, and the prompt carries a student's name and
study profile. That is a product/legal decision for before a real classroom,
not something a flag here settles.
`thinking_level` is `"minimal"` on purpose: measured ~2.7s to first character vs
~11.2s on `"low"`, and accuracy held on multi-step Bac II math (conjugate
limits, conditional probability). `max_output_tokens` is set to 3000 (bumped from 1200)
to ensure complete rendering of detailed Bac II comparison tables without mid-stream truncation.

### KruAI teaches with the Socratic method (29 Sep 2026)

The user's call: **guide first, full solution on request, exercises only**, and the daily
limit stays at 30 units, which means fewer exercises a day because guiding takes more turns.

- **`SOCRATIC_RULES`** (`data/bac2-format.ts`) is sent BEFORE `BAC2_ANSWER_RULES`. For an
  EXERCISE (calculate, solve, prove, balance, typed or photographed), KruAI does not solve it.
  It restates what is given in one line, then gives ONE hint or asks ONE question and stops.
  - A right answer gets brief praise and the next step.
  - A wrong answer gets a question pointing at the mistake, never the answer.
  - Stuck gets a bigger hint.
  - The full solution comes only when asked, after about 3 stuck tries on a step, or to
    confirm an answer the student reached.
- Facts, definitions, comparisons and advice are still answered directly, so the curated
  answers in `server/chat-cache.ts` needed no change.
- **`BAC2_ANSWER_RULES` was reframed, not rewritten.** It opened with "Every academic answer
  MUST follow this skeleton", which reads as "always solve". It now says the skeleton is for
  direct answers and for a full solution when one is due.
- **Examples outweigh rules, so the examples moved with them:**
  - `SOCRATIC_EXAMPLE` is a short guided dialogue on a DIFFERENT limit from the full example.
    It is placed before the full examples.
  - The heading of the full examples changed from "Copy this structure exactly" to "When you
    give a direct answer or a full solution".
  - The one exercise example is now asked as an explicit request for the full solution.
    Asked plainly, it would teach "solve on sight".
- **🧭 is a contract with the app.** Every guided reply starts with it. `chat-overlay.tsx`
  shows **បង្ហាញដំណោះស្រាយពេញ** under the LAST reply that starts with 🧭, once it has finished
  streaming. The button sends `SHOW_SOLUTION_KM`, the exact words the rules name as "give the
  full solution".
  - The phrase lives in `data/kruai-phrases.ts`, a tiny module of its own, because importing it
    from `bac2-format.ts` into the chat screen would ship the whole system prompt to every
    browser. That was checked after the build: 0 client chunks contain the prompt text.
  - The mark stays visible in the bubble (the "guided" cue), so nothing is stripped. If the
    model forgets it, only the button is lost; the student can still type the request.
- **Prompt size after:** 18,835 characters on Home and **23,656 on a section page**, against
  `PROMPT_BUDGET_CHARS` 24,000, which left ~340 characters of headroom. The
  sympathetic/parasympathetic example was cut on 1 Oct 2026 for that reason (see the next
  section): now **17,375 and 22,196**.
- **Verified with the real model** (local free keys, the real handler through
  `ssrLoadModule`):
  - a typed limit → 🧭, one question, no answer;
  - a wrong "0" → 🧭 and a question about the denominator, still no answer;
  - "សូមបង្ហាញដំណោះស្រាយពេញ" → the full skeleton with `ចម្លើយ៖ … = 6`, no 🧭;
  - a photosynthesis question → a direct answer, no 🧭, ending with a check question;
  - a photo of the exercise → 🧭, the exercise read correctly, one question.

  **Not verified:** the "I don't know" turn (the key was busy) and the "3 stuck tries" rule.

  Browser, with the fake Gemini at 390 light and 320 dark (14 checks):
  - the button appears only under the last guided reply, sends the exact phrase, and is gone
    after the full solution;
  - no sideways scroll.

### Long guided chats, Stop / Try again, questions left (1 Oct 2026)

Four changes from a review of the chat, all chosen by the user.

**1. The exercise no longer falls out of a long guided chat.** Only the last `MAX_HISTORY` (12)
messages reach the model, and a guided chat is many short turns, so after about six tries the
exercise itself was gone. Measured with the real model on a 15-message chat ending in a WRONG
answer ("6" for a limit that is 7):
- cut to 12 (the old behaviour): KruAI **invented a different exercise and said "6 is
  correct"**;
- with the fix: it named the right factors, `(x-3)(x+4)`, and asked the student to try again.

How it works:
- `guidedAnchorIndex()` in `src/utils/chat-anchor.ts` walks back over the run of 🧭 replies and
  returns the student message that started it. -1 when the latest reply is not guided, so a
  direct-answer chat sends nothing extra.
- The handler sends that message AHEAD of the window, prefixed with `ANCHOR_NOTE`, which says
  only where the guidance began. A student who started a second exercise mid-run still has those
  turns in the window, so the note must not claim "this is the current exercise".
- `wireMessages()` gives the anchor's photo the first of the two photo slots, because a photo
  exercise is often nothing but the photo.
- `pushStep()` folds two same-side turns into one. That happens only when alternation broke (a
  dropped failed bubble, or the anchor next to a window that starts on a student turn).
- `GUIDE_MARK` moved to `data/kruai-phrases.ts`, because the server reads it now too.

**2. Our own words are never replayed as KruAI's.** Error bubbles, the daily-limit refusal and
the sign-in message used to go back to the model as `model_output`.
- `ChatMsg.failed` marks them: `"retry"` or `"final"`.
- `wireMessages()` drops them before sending.
- Not synced: on another device they arrive as ordinary text. Accepted.

**3. Stop and Try again.**
- While an answer streams, Send becomes Stop (an `AbortController` on the fetch).
- Stop mid-answer keeps the words already shown and marks nothing.
- Stop before the first word leaves `⏹️ បានបញ្ឈប់។` with `failed: "retry"`.
- A dropped connection or a 5xx/busy reply gets `"retry"`. A daily limit (the
  `X-KruAI-Limit` header), a 401 or a refused photo (4xx) get `"final"`, with no button.
- Try again calls `dropFailedBotMsg()` and asks again with the same history, so the answer
  replaces the failed bubble and the question is not duplicated.
- `send()` is now `send()` (adds the question) + `ask()` (asks about the conversation as it
  stands).

Cutting the model off:
- The handler's `cancel()` aborts upstream once the answer has started.
- `vite-chat-plugin.ts` now cancels the reader when the browser hangs up, so dev behaves like
  Vercel. Before this, dev read every stopped answer to the end.
- **Known gap:** a Stop before the first word does NOT stop the model; that one answer finishes
  generating server-side. Closing it means watching `req.signal` in the attempt loop. Not done,
  because what Vercel does with that signal is unverified, and a false abort would fail every
  answer.
- The unit is still charged either way, the cost already accepted in the paying section.

**4. "Questions left today".**
- The handler turns `kruai_take`'s `user_units` into units left and sends it as `X-KruAI-Left`
  on every charged answer, and on a refusal at the student's own limit.
- A curated answer is free and sends none. The whole-app refusal sends none either, since a
  count under "KruAI is resting" would contradict it.
- **"Left" is computed from the limit the database enforced.** `kruai_take` returns it as
  `user_limit` (since `20261002000004`), so there is no copy in the handler to drift. Before that
  migration the server falls back to 30 (`DEFAULT_USER_DAILY_UNITS` in `server/kruai-quota.ts`).
- The screen shows a line above the composer once `LOW_LEFT` (10) or fewer are left, with
  "a photo counts as 3" while a photo is attached.
- The count is kept in module scope, with the day, so it survives closing and reopening the chat
  but not a reload.
- A photo refused with 1 or 2 units left now says so (and that typed questions still work),
  instead of "come back tomorrow".

**5. The prompt lost the sympathetic/parasympathetic example**, which duplicated a curated answer
in `server/chat-cache.ts`. That is −1,460 characters on every request (only the Khmer half was
ever sent), about 650 tokens a question. The plant-hormone example still teaches the table, and
a real-model comparison that is NOT cached (cellular respiration vs photosynthesis) still came
back as similarities + a differences table.

**Verified:**
- 16 handler checks against fake Supabase + fake Gemini: headers, the anchor in and out of the
  window, a photo anchor, folding;
- the earlier 18 daily-limit checks still pass;
- 34 browser checks at 390 light and 320 dark: Stop at both moments, Try again after a stop and
  after a 503, failed bubbles absent from the request, the line at 25/8/0 and after reopening,
  no Try again under a limit refusal, no sideways scroll, no page error;
- the dev upstream really closing after Stop (the fake logged it).

### KruAI's voice: a kind big sibling (2 Oct 2026)

The user asked for the chat to feel "friendly and cutie", and floated a boyfriend/girlfriend
persona. **There is no romantic persona, and that is deliberate.** The users are high-school
students, many under 18; a romantic AI partner for minors invites emotional dependence, would
cost the trust of parents and schools, and pulls students off studying. The user chose a
**big sibling** instead. Their choices:
- **Address:** KruAI calls itself **បង** and the student **ប្អូន** or by name.
- **Emoji:** 1 or 2 per reply.
- **Shape:** short answers for simple questions.
- **Screen:** a cuter typing indicator and greeting. No KruAI picture.

Where it lives:
- **`VOICE` in the persona block of `utils/chat-prompt.ts`:**
  - address (never អ្នក to the student);
  - the student's name written EXACTLY as stored, never transliterated: the user caught
    "Panharith" rendered as a wrong Khmer spelling, and a misspelt name is worse than none;
  - praise right steps, gentle on mistakes;
  - be kind first when the student is stressed;
  - point to a trusted adult if they mention harm or not being safe;
  - **politely refuse romance or flirting and steer back to studying.**
- **`BAC2_ANSWER_RULES` (`data/bac2-format.ts`):**
  - the Given → Method → Steps → Answer → Exam tip skeleton is for a FULL EXERCISE SOLUTION
    only;
  - a fact, definition or "why" question gets 2 to 5 short lines plus an optional exam tip;
  - comparisons keep the table;
  - the emoji rule is 1 or 2 per reply, never in a formula, a step, a table or the answer
    line;
  - "write like a Cambodian teacher" became "like a kind older sibling (បង) helping a
    younger one (ប្អូន)".
- **Examples moved with the rules**, because an example outweighs a rule:
  - `SOCRATIC_EXAMPLE` speaks as បង to ប្អូន with an emoji;
  - the brain example (a fact question) was reshaped from the full skeleton into the short
    form;
  - the examples heading now says to match the example "of the same kind".
- **The app's own KruAI-bubble messages** say ប្អូន (and បង) in place of អ្នក/ខ្ញុំ:
  - the daily-limit and refused-photo messages, and the apology in `chat-handler.ts`;
  - the apologies in `chat-overlay.tsx`;
  - one curated answer in `chat-cache.ts`.
- **`chat-overlay.tsx`:**
  - the greeting uses `userName` in the sibling voice;
  - the "..." bubble is three `motion-safe:animate-bounce` dots plus "KruAI កំពុងគិត…", with
    `role="status"`.

Re-run with the Latin name "Panharith": every reply that used the name wrote it exactly,
and none put it into Khmer letters.

**A full solution ENDS WITH THE FORMAL BAC II ANSWER** (the user's call, same day). The
explanation alone ended in a one-line "ចម្លើយ៖ … = 6", and the user pointed out that a
student never saw the answer as it must be WRITTEN on the exam paper. Skeleton step 4 is now
**"ចម្លើយ (សរសេរលើក្រដាសប្រឡង)៖"**, the whole solution again from start to end, in the
answer key's own style (`data/papers/math-2025.ts`):
- one line naming the form or formula, e.g. មានរាងមិនកំណត់ $\frac{0}{0}$;
- ONE chain of equalities from the question to the result;
- a closing "ដូចនេះ …" line;
- no explanation inside it.

**TWO LENGTHS, chosen by whether the exercise was guided** (the user's call, after first
choosing "always explain"):

| how the student got here | full solution |
| --- | --- |
| guided first (earlier replies about it start with 🧭) | SHORT: one-line METHOD + FORMAL ANSWER + EXAM TIP. The guided turns already explained |
| asked for the solution straight away | LONG: all five parts, numbered explanation steps included |

The model decides from the 🧭 replies it can see in the history. Nothing in the handler marks
it.
- The rule is "Two lengths" under the skeleton in `BAC2_ANSWER_RULES`.
- `SOCRATIC_EXAMPLE` now ends with the student pressing the button and the SHORT form.
- The worked limit example (asked directly) shows the LONG form, so each length has an
  example of its own.

Two phone details:
- **At most 3 "=" per `$$…$$` line**, each continuation line starting with "=", the way the
  key breaks a long chain.
- **KruAI's bubbles are `max-w-[92%]`** (the student's stay 80%). Measured: an 80% bubble made
  the limit's first chain line overflow by 9px at 360 and 41px at 320. Now 0 at 360/390 and
  6px at 320, the narrowest phone, where `overflow-x-auto` on the display block makes it a
  small swipe rather than a broken page.

The worked example shows the formal block, and its "ទម្រង់មិនកំណត់" became the key's
"រាងមិនកំណត់".

**Two cuts made room.**
- **The monocot/dicot comparison example was removed.** It duplicated a curated answer (the
  starter chip), exactly as the sympathetic one did.
- **The comparison rule no longer spells out a sample table.** The plant-hormone example shows
  a real one.

Real model, with "Panharith":
- a limit and a derivative AFTER guiding came back SHORT (formal answer, no numbered steps);
- a limit and a physics problem asked DIRECTLY came back LONG (steps + formal answer);
- all four had the formal heading, the chain and "ដូចនេះ", with 0 KaTeX errors and no raw
  LaTeX;
- a non-cached comparison still came back as a table.

**Prompt size after:** 18,979 characters on Home and **23,800 on a section page**, against
`PROMPT_BUDGET_CHARS` 24,000. **Only ~200 characters of headroom.** The next addition needs a
cut first; the plant-hormone example (~1,500 characters) is the obvious one, if the
comparison rule alone keeps producing tables without it.

**Verified with the real model** (8 messages, profile name ដារ៉ា). The guided exercise, the
right step and the wrong step:
- use the name and ប្អូន;
- carry 1 or 2 emoji;
- give no answer.

The others:
- "show full solution" gives the skeleton;
- "what is photosynthesis?" gets 5 lines and no skeleton;
- a non-cached comparison still gets a table;
- "I'm stressed" gets kindness first, one small step and a question;
- "be my girlfriend" gets a kind no and a return to studying.

None of the 8 has an em dash or a Khmer numeral.

Browser, 28 checks at 390 light, 320 dark with reduced motion, English, and a blank name:
- the greeting carries the name, or none;
- the dots bounce, and stand still under reduced motion;
- no sideways scroll, no page error.

**Seen in testing:**
- **Not fixed:** the girlfriend reply called KruAI "បងប្រុស" (big BROTHER). The prompt does
  not give KruAI a gender.
- **Fixed the same day:** the photosynthesis answer wrote
  `\xrightarrow{\text{ពន្លឺព្រះអាទិត្យ}}`. That is Khmer inside a `\text` nested in a group,
  which `liftKhmerText` deliberately refuses, so the line showed as raw LaTeX. See "a Khmer
  label on an ARROW" in the LaTeX section near the end of this file.

### The key pool and the fallback loop

Keys come from `GEMINI_API_KEYS` (comma-separated), `GEMINI_API_KEY`, and
`GEMINI_API_KEY_1`..`_5`, de-duplicated. `server/vite-chat-plugin.ts` bridges
every one of those names in dev; on Vercel they are ordinary env vars.

Candidates are **model-major**: the preferred model on every key before a lesser
model on any, because quotas are per project per model and a second key usually
has the fast model's quota left. Key order starts at a round-robin pointer.

Four rules in the loop, each from a measured failure:

- **Fall back until the FIRST CHARACTER, not until `create()` succeeds.** An
  overloaded model often accepts the request and then sends an `error` event;
  the old loop only caught a throw, so that went to the student as an apology.
  After the first character there is no switching.
- **Classify before retrying** (`classifyFailure`): 429/5xx/connection → next
  candidate; a bad key (Gemini says 400 "API key not valid", not 401) → skip
  that key for every model; 404 → skip that model on every key; any other 400
  → stop, the request itself is the problem. It used to retry everything, up
  to keys × models times.
- **Race each attempt against `ATTEMPT_TIMEOUT_MS` (10s), under a 25s
  first-text deadline.** Measured: an exhausted key was held for **29.9s**
  before Google answered 429. The attempt RACES a timer rather than trusting
  the abort signal, because the SDK outlived an aborted signal by 7s. The
  deadline exists because `vercel.json` caps the function at 60s, answer
  streaming included.
- **Cooldowns** (module-level, per instance, like the rate limiter): a 429
  benches that key+model for 60s (30 min if the quota named is per-day), a
  timeout for 5 min, a broken key or unknown model for 30 min. A cooldown sorts
  a candidate to the back, never removes it. Measured after: every request
  that followed a failure reached first text in ~2.3s.

Logs name the key's POSITION (`key #2`), never the key. A student closing the
chat aborts the upstream request (`cancel()` on the response stream), so an
unread answer stops costing quota.

`isQuotaError()` checks the status first; it used to substring-match "429" and
"503" anywhere in the serialised error, request ids included. Busy and quota
cases return the polite temporary-busy notice. Vendor names ("Gemini" /
"Google") are kept strictly out of student-visible copy.

### The curated-answer cache — and why there is no answer cache

`server/chat-cache.ts` holds hand-written Bac II answers (comparison tables,
Mendel, RNA types) served as a simulated stream with zero API calls. Three
rules:

- **After the auth gate.** It used to run before it.
- **First turn only.** Mid-conversation the same words usually mean something
  narrower, and a canned reply would ignore what the student already said.
- **The question must be the pattern plus FILLER words** ("what is the
  difference between", "សូម", "មានអ្វីខ្លះ"), not merely contain it. With a
  bare `includes`, "which part of the brain stem controls breathing" got the
  canned "parts of the brain" answer.

**There was also a cache of MODEL answers, keyed on the question text alone,
and it was a privacy leak.** Every reply is written with that student's name,
weak subjects and exam average in the system prompt, plus their history and
open screen — so the next student to type the same words got a reply addressed
to someone else, a follow-up like "why?" was replayed into unrelated chats,
and since it ran before the gate an unauthenticated `curl` could read it.
Deleted. Don't bring it back without keying on everything that went into the
prompt, at which point it would never hit.

### Textbook retrieval must be ANCHORED

`searchBiologyTextbook` / `searchMathTextbook` share one scorer
(`searchSections`). A section is returned only with a TITLE or KEYWORD hit;
word overlap breaks ties and never qualifies a section alone. Previously "the",
"what" and "and" matched nearly every section, so a greeting pulled ~9,000
characters of textbook into the prompt. Latin terms match on word boundaries
("stem" is inside "system", "pine" inside "spine", "gh" inside "high"); Khmer
terms stay substring matches, since Khmer has no spaces. The math scorer also
split on `/\\s+/` (in source) — a literal backslash then "s" — so it never
split at all.

Textbook text is plain template literals, so LaTeX there needs `\\` — two
`$\rightarrow$` in the enzyme section were written with one backslash and
reached the model as a carriage return + "ightarrow".

### KruAI reads photos (29 Sep 2026)

A student can attach ONE photo per message, from the camera or the gallery, and
KruAI answers about it. The user's three calls: **one camera button that opens a
two-item menu** (ថតរូប / ជ្រើសរូបភាព, `components/shell/chat-attach.tsx`), **a
small preview kept in the history**, **one photo per message**.

**Two copies of every photo, and only the small one is persisted.**

| copy | size | lives in | used for |
| --- | --- | --- | --- |
| full | 1400px, JPEG 0.72, ~200–450KB base64 | `lib/chat-images.ts`, a module `Map`, this page load only (6 held) | what the model reads |
| thumb | 320px, JPEG 0.6, ~5–20KB data URL | `ChatMsg.image.thumb`, persisted | the bubble after a reload |

localStorage is ~5MB for the whole store, so a full photo there would fill it in
weeks. `MAX_CHAT_THUMBS` (30) in `lib/store.ts` strips `thumb` from older photo
messages, newest kept; the stripped message keeps `image: {}` so its bubble still
shows a "រូបភាព" chip. `chat_messages` syncs text only, so another device sees the
question without its photo. That is accepted, and it needs no migration.

**A photo sent with no words gets a real text** (`PHOTO_QUESTION` in
`chat-overlay.tsx`), stored as the message's text. That keeps the conversation
title, the sync row and history replay free of empty-text cases.

**The wire.** `wireMessages()` sends `{ role, text }` per message, plus the full
photo for at most `MAX_PHOTOS_SENT` (2) of the newest photo messages still held in
memory, inside the last 12 messages (the handler's `MAX_HISTORY`). So "explain
step 3" still reaches the model with its photo. A message whose photo is no longer
held (after a reload) is sent with `hadImage: true`, and the handler appends
`PHOTO_GONE_NOTE` so the model says it cannot see it rather than pretending. Thumbs
and ids are never sent.

**The server is strict** (`cleanImage` in `chat-handler.ts`): `image/jpeg` only
(the client always re-encodes, which also converts an iPhone's HEIC), the base64
alphabet only, at most `MAX_IMAGE_B64_CHARS` (checked before the regex runs), and
it must start with `/9j/`, the base64 of JPEG's FF D8 FF signature. More than
`MAX_IMAGES_PER_REQUEST` (2) is refused, not trimmed. `MAX_BODY_BYTES` grew from
64KB to 64KB + 2 photos. `server/vite-chat-plugin.ts` mirrors that number and
**both must change together**. A photo turn is sent to the model image first,
then text, at `resolution: "high"` (`IMAGE_RESOLUTION`), because a misread digit
gives a confident wrong answer. A photo request never gets a curated answer, and
it counts against an extra per-user `IMAGE_RATE_LIMIT` (6/min).

**Timeouts: provisional, not yet measured.** A photo request uses
`IMAGE_ATTEMPT_TIMEOUT_MS` (18s) and `IMAGE_FIRST_TEXT_DEADLINE_MS` (35s) in place
of 10s/25s, since reading an image delays the first character. When this shipped,
every free key was out of quota (429) or overloaded (503), and Google held some
requests 35–155s before refusing them. So no real model answer to a photo could be
timed. **Measure first-text time on a real photo once a key works, then set these
two numbers from it.** Also try `"medium"` resolution against the same photos and
keep it if it reads them as well.

**The prompt** carries a PHOTO block in `BAC2_ANSWER_RULES` (both languages; `km`
is what is sent):
- transcribe the exercise first as the Given, so the student can check it was read right;
- name any unreadable part and ask for a clearer photo, never guess a number;
- with several exercises in one photo, solve the first and offer the rest;
- if the photo is not schoolwork, say so in one line.

**How it was verified without quota**, which is repeatable: the SDK honours
`GOOGLE_GEMINI_BASE_URL`, so a dev server started with
`GOOGLE_GEMINI_BASE_URL=http://localhost:5190 GEMINI_API_KEYS=fake` talks to a
20-line Node server that records each request body and streams back an SSE
answer (`event: step.delta` / `data: {...}`). That proved:
- the upstream body is image first, byte-identical data, `mime_type` JPEG, `resolution: "high"`,
  `store: false`, with the PHOTO rule in the system prompt;
- a follow-up re-sends the photo, and `hadImage` becomes the note;
- a PNG type, non-base64 data, wrong magic bytes, 3 photos and a 4MB body are refused (400/413).

Then real Chrome at 390 light, 320 dark and 1280, 26 checks:
- the menu with `capture="environment"` only on the camera input;
- a photo-only send, the bubble photo, and the viewer (`absolute inset-0`, not portalled);
- the thumb and `hadImage` after a reload;
- an undecodable file shows the error chip and Send stays disabled;
- the 31st photo strips the oldest thumb;
- no sideways scroll or page error, and the text field is still 152px wide at 320.

**Not verified: a real phone** (camera opening, the gallery, HEIC) or a real model
reading a photo. Both need a working key or the deployed site.

Photos of students' notebooks go to the model provider like any other message.
The free-tier data note above applies to them too.

### Paying for the model: prepaid credit plus daily limits (29 Sep 2026)

The user is moving production to ONE paid key: Google's minimum $30 prepaid
top-up. There are two layers, and they do different jobs.

1. **Google side: caps the TOTAL.** Prepaid credit with **auto top-up OFF** means
   the most that can ever be charged is what was loaded. Budgets in Cloud Billing
   only ALERT; they never stop spending, so they are an early warning and nothing
   more. The key is restricted to the Generative Language API.
2. **App side: caps the DAY**, so $30 cannot all go in one day through heavy use,
   a bug, or an abused account. `supabase/migrations/20260929000001_kruai_usage.sql`
   adds `kruai_usage` and `public.kruai_take(p_units)`, and `server/kruai-quota.ts`
   calls it. Per student it is **30 units a day** (the user's number); for the
   whole app it is **300 units a day**, a starting guess to be retuned (below). A
   text question costs 1 unit and a NEW photo costs 3 (`TEXT_UNITS`/`PHOTO_UNITS`
   in the handler). A curated answer is free and is charged nothing. At a limit,
   KruAI answers with a readable 429 ("come back tomorrow" or "KruAI is resting
   until tomorrow").

   **A follow-up costs 1, although the earlier photo travels with it** (1 Oct
   2026, a bug the user found by testing). The chat screen re-sends the latest
   photo with every follow-up so KruAI can still see it, and the charge used to
   key on "any image in the request" (`hasImage`), so every follow-up in a photo
   chat cost 3, and a guided photo exercise used up the day's 30 in about ten
   turns. The charge now keys on `newPhoto`, a photo on the LAST message (the
   question being asked). `hasImage` still drives what a re-sent photo really
   does change: the longer timeouts, `IMAGE_RATE_LIMIT` and no curated answer.
   The token log line says `photo=new|resent|no`, so what a re-sent photo
   actually costs Google can be read off the logs rather than guessed.

**Why the database and not `rate-limit.ts`.** That limiter is in memory and per
serverless instance, and its own header says a daily counter held that way resets
on every cold start. A money limit must be one number shared by every instance.

**Three decisions in `kruai_take`, each closing a real hole:**
- **The server calls it with the STUDENT'S OWN token**, so `auth.uid()` is the
  student and no secret key is needed. The catch is that any student can also
  call it directly. So the **limits are never parameters** (a parameter would let
  them choose the limit). They were constants inside the function until
  `20261002000004`; now they are read inside it from `app_settings`, a table no
  student can write, which the owner sets on `/admin/kruai`. `p_units` must be
  1–10 (no negative refunds), and a refused call **changes nothing**, so a student
  hammering at their limit cannot eat into everyone's count. The worst a student
  can do by calling it directly is spend their own 30.
- **The day is computed in SQL** as `now() at time zone 'Asia/Phnom_Penh'`, never
  sent by the client.
- **`pg_advisory_xact_lock`** serialises takes, so two questions arriving together
  cannot both read "29 of 30" and both pass.

**It FAILS CLOSED in production.** If the RPC errors (Supabase down, or
**migration not applied**, which shows PGRST202 in the log), KruAI answers 503.
That is the same stance as the auth gate: "we could not check" is not a reason to
spend. Dev warns and continues. **So this migration is REQUIRED before deploying**,
or production KruAI refuses every question.

**Known cost, accepted:** the unit is charged before the model is called, so a
question that then fails upstream (every key busy) still costs the student that
unit. A refund RPC would be callable by students too, and is not worth it.

**Tuning the whole-app number.** The handler logs one line per answer from the
`interaction.completed` event:

    [api/chat] tokens in=… out=… thought=… photo=new|resent|no model=…

Take the average cost per unit from those lines and Google's price page, then
set `app_daily ≈ dollars per day accepted / cost per unit` (about $1/day for $30
to last a month). The worst case is bounded: `max_output_tokens` is 3000 and the
prompt budgets are fixed, so a day can never cost more than
`app_daily × worst-case cost of one unit`. **Change a limit on `/admin/kruai`**
(owner only, since `20261002000004`; see "KruAI limits and pausing" in the admin
section). Nothing in the server needs to change with it.

**Production uses ONE key.** Vercel holds only `GEMINI_API_KEY` (the paid one).
`GEMINI_API_KEYS` and `_1..5` are deleted there, because mixing in free keys from
other accounts would send some students' questions to the free tier, and pooling
free accounts is the terms problem recorded earlier. `getApiKeys()` needed no
change. Local `.env.local` keeps the free keys, so development never spends the
credit. The server also reads `VITE_SUPABASE_ANON_KEY` at runtime now (as the RPC's
`apikey`); Vercel already exposes it to functions, and `vite-chat-plugin.ts`
bridges it in dev.

**Verified without money or a real login**, and the script pattern is reusable.
A Node script loads the real `handleChat` through Vite's `ssrLoadModule` and runs
two fakes in the same process:
- a fake Supabase that serves a JWKS and a `kruai_take` enforcing the same rules,
  with tokens signed ES256 by `node:crypto` (`iss` = `{url}/auth/v1`,
  `aud: authenticated`);
- the fake Gemini from the photo work, reached through `GOOGLE_GEMINI_BASE_URL`.

All 18 checks passed:
- text costs 1 and a photo 3; the curated answer costs 0 and makes no RPC call;
- the 31st unit and a 3-unit photo with only 2 left are refused, and neither is
  counted;
- the whole-app cap refuses with the resting message;
- the token line is logged;
- a missing RPC (404) or a database error (500) → 503 in production, answered in
  dev;
- no token → 401.

**The SQL itself was NOT executed here** (no local Postgres). Before applying it,
the live project answered PGRST202. After applying, check two things:
- a publishable-key-only call to `/rest/v1/rpc/kruai_take` is refused (it is
  granted to `authenticated` only);
- `npm run db:check` lists `kruai_usage`.

`server/rate-limit.ts` caps requests per IP (240/min, anti-flood) and per
verified user (20/min) before any upstream call, so a flood costs nothing. In
dev there's no proxy and everything keys to `"local"`, which is fine — it
exists to protect a deployment.

Chat answer quality is **prompt engineering, plus curriculum grounding** —
the whole content corpus fits in one system prompt, supplemented by
**MoEYS textbook excerpts (`server/textbook-search.ts`)** for Biology.
`src/utils/chat-prompt.ts` composes: persona + honesty
guardrails + `src/data/bac2-format.ts`'s `BAC2_ANSWER_RULES` (the Given → Method
→ numbered Steps → Answer → Exam tip skeleton, including comparison tables) +
`BAC2_EXAMPLES` (few-shot worked answers) + the CATALOG + the CONTEXT + the student's real profile.
`src/components/shell/math-text.tsx` includes a block Markdown table parser so
comparison matrices render as responsive, scrollable HTML tables rather than raw text.
`src/data/bac2-format.ts` is the intended drop-in point for real MoEYS past
papers — add entries to `BAC2_EXAMPLES` and flip `verified: true` once a teacher
checks them; no code change needed.

### The corpus goes in TWICE, at two levels of detail

This is the shape of `chat-prompt.ts` and the thing not to collapse back into
one block. It used to be one: every lesson, flashcard and practice question
pasted in full, with each authored SECTION condensed to a skeleton of labels.
**The result was a mentor that knew a section's table of contents and had never
seen a word of it** — `sectionLine()` drops every `body`, `intro` and `outro`,
which on the first authored section is ~7,000 characters of Khmer prose.

- **`buildCatalogBlock(lang, focusSubject?)` — what EXISTS.** Always sent, and
  complete in the sense that matters: every item is named, and the
  `covered`/`missing` computation runs over the WHOLE corpus. This is what backs
  "never invent a BrachNha lesson", so **it may never be derived from a search
  result** — if it were, the mentor would deny the existence of any lesson a
  given turn happened not to surface. `focusSubject` decides ORDER only, never
  membership.
- **`buildContextBlock(chunks)` — the full PROSE of a few items**, sent because
  we know they are relevant.

**Today the only source of context is the screen the student has open**, and
that is a signal with perfect precision, zero latency and no model in the loop.
`utils/chat-screen.ts`'s `screenRefFor(pathname)` is sent by `chat-overlay.tsx`
(read at SEND time, not mount — the overlay is global and survives navigation),
and `pinnedContextFor()` turns it into `RetrievedChunk[]`. Measured: on
`/sections/biology-3-1-1` the whole section arrives as 5 chunks.

**THE INVARIANT — the client may SELECT from the corpus, never SUPPLY content to
it.** Every id in a `ScreenRef` is used once as a lookup key and then discarded;
what reaches the prompt is the object the lookup found. Three guards, and each
covers a case the others cannot:

- `cleanScreen()` in `chat-handler.ts` bounds SHAPE and COST only (64-char cap
  before the lookup). It deliberately does NOT use `clean()`: that makes a
  string safe to *display*, and nothing here is ever interpolated.
- `Object.hasOwn`, never `in` and never a truthiness test — these are plain
  object literals, so `"constructor" in SECTION_CONTENT` is true and
  `SECTION_CONTENT["toString"]` is a function.
- `isLookupKey()`, which is **not redundant with the above**: a single-element
  ARRAY stringifies to its element, so `Object.hasOwn(SECTION_CONTENT,
  ["biology-3-1-1"])` is TRUE and the next line calls `.split()` on an array.
  Measured, not theorised.

An unrecognised id is dropped silently — a stale client or a renamed route is
ordinary, and there is nothing to tell the student.

**`RetrievedChunk.pinned` exists for the layer that is not built yet.** True
means "the student has this screen open", which is certain; false is reserved
for anything less certain that adds to the same array later. Pinned chunks sort
first and are dropped last, because **a guess must never evict a fact**.

**A section's QUIZ is deliberately excluded from its chunks.** Its `correct`
field is the answer to a question on the screen the student is standing on. The
catalog still counts the questions, so the mentor knows the quiz exists — it is
just not handed the answer key. The old skeleton did this by accident;
`sectionChunks()` now does it on purpose.

**`buildContextBlock` carries a sentence that is load-bearing:** *their absence
proves nothing*. Once the model sees an "excerpts" block it starts inferring
that anything NOT quoted does not exist, and would tell students the app lacks a
lesson whenever grounding missed it. The catalog is the inventory; the excerpts
are a sample.

**`bi()` leads with KHMER now, and the English is the fallback.** It used to
emit `en [KH: km]` for every field — 5,999 Latin characters in a 12,595-char
block, for a mentor forbidden to reply in English (`ANSWER_LANG`). The English
is not dropped outright because some Khmer entries in `data/lessons.ts` really
are abbreviated; WHICH ones was measured rather than guessed — across the 57
pairs the Khmer runs at a median **0.71× the English length**, and Khmer is
denser per character, so that is a complete rendering. Only the 15 pairs below
`KM_STUB_RATIO` (0.6) keep both. If that column is ever completed, `bi()`
collapses to `pair.km`.

Section subjects are added to the `covered` set (`id.split("-")[0]`), or a
subject whose only content is authored sections would still be announced as
having none — i.e. the model would deny the lesson the student is reading.

### THREE budgets, and they differ in KIND

Getting these confused is how the prompt breaks silently.

| constant | bounds | on exceeding |
| --- | --- | --- |
| `PROMPT_BUDGET_CHARS` (24,000) | AUTHORED content | **warns** — a human condenses a source |
| `CATALOG_BUDGET_CHARS` (11,000) | assembled catalog | **degrades** entries to their title |
| `CONTEXT_BUDGET_CHARS` (9,000) | assembled context | **drops whole chunks** from the tail |

The last two degrade silently because the CODE chose that content — warning
about it would be the code complaining about its own decision. Only the first
has anyone to tell. **If `PROMPT_BUDGET_CHARS` fires, something has been added
that neither of the other two governs.**

All three are in CHARACTERS, not an estimated token count. **Measured on
`gemini-3-flash-preview` (17 Sep 2026): Khmer is ≈ 0.45 tokens per character**,
against the ~0.25 a Latin rule of thumb (4 characters a token) assumes — so a
Latin-calibrated estimate understates a Khmer prompt by nearly 2×. (Earlier
notes here said "a token per glyph"; that was a guess, and ~2× too high.)
Characters stay the unit anyway: they are exact, they don't change when the
model or its tokenizer does, and a budget's job is to bound size, not to price
it.

`CONTEXT_BUDGET_CHARS` drops **whole chunks, never a slice**. A cut at an
arbitrary character index in Khmer lands inside an orthographic cluster (base
consonant + U+17D2 coeng + subscript + vowel) and renders as a broken glyph;
and half a worked example is worse than none.

### Measured, 13 Sep 2026 — and how to re-measure

| | before | after |
| --- | --- | --- |
| prompt on Home | 19,525 | **16,221** |
| prompt on `/sections/biology-3-1-1` | 19,525 (no prose) | **20,169** (5 chunks, full prose) |
| catalog block | 12,595 (5,999 Latin) | **9,291** (2,648 Latin) |

Re-measure by loading the real module — plain `node` cannot, because
`data/*.ts` uses `.js` specifiers that only resolve under a bundler, which is
the same reason `server/vite-chat-plugin.ts` exists:

```js
const { createServer } = await import("vite");
const s = await createServer({ server: { middlewareMode: true }, appType: "custom", configFile: false });
const m = await s.ssrLoadModule("/src/utils/chat-prompt.ts");
// ... buildSystemPrompt({ profile, context, focusSubject }).length
await s.close();   // without this the process never exits
```

### When RAG earns its place — and what was decided

The staging was deliberate: at ~29 catalog items there is nothing for retrieval
to SELECT, since a top-6 over 29 chunks is a top-6 over a list you could send
whole. The screen the student is on beats any search until they routinely ask
about content that is not in front of them.

**The trigger was "roughly 15 authored sections / 150 chunks", and the textbook
plan (17 Sep 2026) supersedes it.** That number assumed retrievable content would
be the app's own authored sections, arriving a few at a time. The user decided
instead to bring in the six Grade 12 textbooks whole (~1,200 pages), which is
past the trigger on day one — so stage 2 is being built now rather than waited
for. Stage 1 already established every interface stage 2 needs —
`RetrievedChunk`, `buildContextBlock`, `CONTEXT_BUDGET_CHARS`, the
`context = []` default and the select-never-supply invariant — so stage 2 still
changes exactly one thing: *where the non-pinned chunks come from*.

**The textbook pipeline — current status (27 Sep 2026)**:
- **Chapters 1 & 2 fully digitized**: Grade 12 Biology Chapter 1 (Plant Reproduction & Diversity, pages 1–25) and Chapter 2 (Plant Growth, Transport & Hormones, pages 26–59, 34 pages) transcribed into `sources/ocr/biology/chapter1/` and `chapter2/`.
- **Digit and OCR verification**: Verified with `scripts/ocr-check.mjs` (0 errors) and `scripts/check-digits.mjs` (0 Khmer numerals, 100% Latin digits).
- **Grounding layer**: High-yield curriculum excerpts indexed in `server/textbook-search.ts` (`searchBiologyTextbook()`), called directly from `server/chat-handler.ts` when handling biology student inquiries.
- **$0 Cost & Privacy**: Uses Google AI Studio Free Tier and hides vendor names from student copy.

1. The PDFs go in `sources/textbooks/`, which is **git-ignored** — large, and not
   ours to publish in a public repo.
2. Check whether each PDF has a text layer before scanning anything. Khmer
   extracted from a PDF text layer is often mis-ordered (legacy fonts, reordered
   vowels), so a text layer may still lose to OCR — it has to be compared, not
   assumed.
3. OCR pages via `scripts/ocr-pages.mjs` with multi-model fallback across Flash tiers
   to stay comfortably within free limits.
4. Verify transcribed texts with `scripts/ocr-check.mjs` and `npm run check:digits`.
5. Curate key concepts into `server/textbook-search.ts` under authored boundary chunks.
   Unchecked text is not fed to students.
6. Chunk on the books' OWN headings (chapter → lesson → sub-heading), the textbook
   equivalent of the authored-boundary rule below.
7. Connect and test on real Bac II exam questions with structured format.

**The Khmer spike can run BEFORE the OCR, and should.** It needs Khmer curriculum
text, not the textbooks — `data/sections.ts` already has some. If it fails, the
OCR is not wasted (the text can still be pinned by lesson), but the index is.

**Textbook text must only be reachable from server code.** Where the checked
text is committed is not decided yet; what is decided is that nothing the
browser bundles may value-import it. That holds today by construction — the
client reaches `chat-prompt.ts` only through `import type`, which is erased — and
one value import of a multi-megabyte corpus would put it in every student's
download. **Check the entry chunk's size after connecting it.** The
committed-file index decision below was made with this corpus size (~1,200
chunks) in mind, so it stands.

**Cost will move.** The ~0.5 cent per question estimate is for today's prompt;
excerpts add to every question that retrieves them, bounded by
`CONTEXT_BUDGET_CHARS` (9,000 chars ≈ 4,000 tokens at 0.45/char). Re-measure
once it is connected.

**The index store is a COMMITTED FILE bundled into the function, not pgvector**
(the user's call, and it reverses what the Supabase section used to assert). At
256 dims, 1,200 chunks is ~1.6MB of base64 in a `server/mentor-index.ts` module;
search is an exact dot product over a `Float32Array`, sub-millisecond, so the
only added latency is the query embedding (~120ms against the measured 2.7s to
first character). pgvector would add 40–280ms more and make mentor *quality*
silently depend on a service this whole codebase is written to tolerate the
absence of. Revisit past ~5,000 chunks, or the moment retrievable content stops
living in `src/data/`.

**Run the Khmer spike BEFORE building any of it.** `gemini-embedding-001` lists
Khmer among 100+ languages, but Khmer is low-resource and unsegmented — the same
property that forces these budgets to count characters. If embeddings cannot
separate Khmer curriculum topics, stage 2 is wasted work discovered *after*
building it; pin harder instead (the current section plus its neighbours in the
same lesson). Chunk on AUTHORED boundaries (`SectionBlock`, `Misconception`,
`PracticeCard`) and never on a length — Khmer has no whitespace to window on,
and the dictionary segmenter you would otherwise need is exactly the dependency
this repo declines.

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

The leaderboard's cross-user read EXISTS now, as exactly the shape this
paragraph asked for: `public.leaderboard(p_today)`
(`20260916000004_leaderboard.sql`), a `security definer` function returning a
display name and numbers only — **not** a "profiles are readable by everyone"
policy, which hands out email, age and location with it. Granted to
`authenticated` only. See the Leaderboard section.

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

**Revisited for flashcards and practice quizzes (3 Oct 2026, the user's call)**:
they now LIVE in the database, so the team fixes them without a code change, and
`data/practice.ts` and `data/quizzes/` are deleted. See "Flashcards and quizzes
move into the database" near the end of this file. Sections and past papers stay
here until their own stage.

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
  the XP earned inside the current level, plus "Level N", a thin bar and "30 / 100
  XP". The level rule is `award()`'s in `lib/store.ts` (the level goes up once XP
  reaches `level * 100`), so a level spans the 100 XP below that threshold; the
  share is clamped because one large award can overshoot while the level moves by
  one. If the rule changes, `XP_PER_LEVEL` in the header changes with it.
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
(roadmap/profile/lesson-detail), so content clears the FAB at `bottom-20`.

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
drops the app bar/`Sidebar` for the roadmap onboarding lock) and `BottomNav`
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
top-right**: the app bar above every page already shows the streak, so the
page keeps a plain title-left header.

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
`ជំពូក 3 · តម្រូវផ្សេងៗរបស់សារពាង្គកាយ` over `តម្រូវប្រសាទ`. The third level has to
surface somewhere and that is Duolingo's own unit-header shape. The kicker used to
repeat the subject name, which the header card directly above already says. A
chapter whose real title hasn't been supplied carries `title: ""` and the banner
shows `ជំពូក 1` alone — an empty string is the "pending" marker, deliberately,
because a made-up Khmer title is worse than none.

**Node labels are `{chapter}.{lesson}.{section}` in Latin digits** (`3.1.1`),
matching the numbering printed in the textbook, and are GENERATED from position by
`sectionsFor()` so a label cannot drift from where the node sits.

**A `flat` chapter drops the chapter from the label** (`2.1`, not `1.2.1`), because
there is no chapter on screen for that number to refer to — `Chapter.flat` already
suppresses the banner's kicker, and printing a "1." that groups nothing told a
student about a level the page deliberately never draws. `quizSections()` in
`features/practice/quiz-path.ts` has always done this; `sectionsFor()` was the one
out of step and now takes the same flag. Math's foundation path is the only
`flat` Study path today, so this moved its existing labels from `1.1.1` to `1.1`.

**THE ID KEEPS THE CHAPTER EITHER WAY** — `math-1-2-1`, never `math-2-1`. It is
persisted in `completedSessions` and it is the key into `SECTION_CONTENT`, so only
the visible label may move. A change that renumbered ids would silently orphan
every finished node and every authored section.

**The section TITLE renders under the node, not just in the `aria-label`.**
Duolingo gets away with bare numbers because its content is known; here the
curriculum names are the whole point of the screen. Two consequences: the wrapper
widened (see `CENTRES` above), and the title carries `[overflow-wrap:anywhere]`
rather than a Tailwind `break-*` utility, because **Khmer has no spaces** — a
section name is one unbreakable run and renders as a single line wider than the
node's box without it. A three-line title only pushes the next connector down; the
connector is its own fixed-height element between rows, so no geometry breaks.

**Session structure is DERIVED until it is authored.** `SUBJECT_SESSIONS` holds
the authored structure — the same shape as `PAST_PAPERS`, and most
subjects are absent, which is the normal state. `chaptersFor()` falls back to one
session per lesson that genuinely exists in `data/lessons.ts` plus
`PLACEHOLDER_SESSIONS` locked nodes, wrapped in one chapter and one lesson so the
shape matches, so a node can never claim content the app lacks.

**Math's foundation path is FOUR lessons, and three of them are structure.**
មេរៀនទី 1 · ប្រមាណវិធីបូក ដក គុណ ចែក has six named sections (three written);
lessons 2 to 4 have five each, all `title: ""`, all locked. 21 nodes, 3 playable.

The user asked for them (28 Sep 2026) because a one-lesson path claimed the whole
foundation review was one lesson. **Reserving structure is allowed; inventing
names is not** — the same line `PLACEHOLDER_SECTIONS`, biology's untitled chapter 2
and the Bac II quiz path's unnamed sections already draw. `lessonHeading()` reads
an empty title back as `មេរៀនទី N` alone, so the banner needs no placeholder
string, and naming a lesson later is ONE string here with no other edit.

`UNNAMED_SECTIONS` is five empty strings rather than `PLACEHOLDER_SECTIONS`
(three, and it names them `ផ្នែកទី N`): the node already prints its number, so a
title repeating the number is the duplicate `lessonHeading()` exists to avoid.

**Biology is the first real curriculum**, entered from the Grade 12 table of
contents: 3 chapters, 7 lessons, 6 sections each = 42 nodes, **every one locked**,
because no content is written behind any of them. Chapters 1–2 are titleless
pending a legible scan. Two things follow that are easy to mistake for bugs:

- **An authored structure REPLACES the derived fallback wholesale**, so
  `biology-body` and `biology-brain` no longer appear on the biology path. Both
  are still reachable at `/lessons/biology-body` and `/lessons/biology-brain`, and
  the 3D brain lesson is intact.
- **`lessonCountFor("biology")` still says 2**, because it counts `LESSONS`. The
  Study card therefore reads "2 មេរៀន" while the path shows 7 locked lessons.
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
rule 1 to find; biology carries it on ជំពូក 3 · មេរៀនទី 1, the lesson being
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

**A QUIZ IS INSIDE A STEP, never a step of its own, and there are TWO of them.**
`SectionContent.quiz` renders on step 0 and `quizHarder` on step 1, each after
that step's teaching, and **neither step will advance until its own questions
are all answered** — `quizDone` and `quizHarderDone`. A quiz that can be walked
past is not a quiz.

**The split is the section's TEACHING ORDER, not a difficulty badge** — nothing
on screen says "hard". Step 0 may only ask what the video and the examples have
covered; anything that needs the RULES belongs in `quizHarder`, or the question
is asked before it is taught. `math-1-1-1` is the worked case: its 15 exercises
split 8/7 at exactly the point multiplication starts, because **the ×/÷ sign
table is on step 1**. Asking Part C on step 0 would have asked before teaching.
Both halves stay independently spread across ក./ខ./គ./ឃ. — splitting a balanced
set can leave one half clustered, so re-check the spread per HALF.

**A SECOND ARRAY, not a `step` flag per question.** The split is what an author
decides when writing the section, and two named lists show that shape at a
glance where fifteen flags would have to be read one by one. Both are optional,
so the four biology sections — everything on step 0 — needed no edit.

**ANSWERS ARE KEYED `"{step}-{index}"`, AND A BARE INDEX IS A BUG.** With two
lists, question 0 of one would otherwise share a key with question 0 of the
other, so answering either would mark a question the student has never seen.
`answerQuestion` also takes the QUESTION rather than an index, which keeps its
closure from reading into a possibly-undefined array element — the property path
the React Compiler narrows a memo dependency onto.

**`scripts/check-quiz.mjs` must walk BOTH.** It covered `quiz` only for one
revision and the section count silently dropped from 24 to 17 — half a section
unchecked, the same "the checker and the screen disagree" gap that let raw LaTeX
ship on the misconception cards.

`SectionQuestion.scenario` carries the ស្ថានភាព set-up above the prompt in
muted text; `math-1-1-1` uses it for the part label so the source's four parts
survive the split. `correct` is compared by string equality, so the ក./ខ./គ./ឃ.
prefix has to be repeated there — a mismatch silently marks every answer wrong,
which is what `check:quiz` exists to catch.

**`SectionVideoPlayer` IS A CLICK-TO-LOAD FACADE.** The design calls for a video
at the top of a section; `SectionContent.video` carries a poster, a duration and
— once a recording exists — a `youtubeId`, and the component draws the chrome
around it: poster, play button, 0:00 / duration, fullscreen glyph, scrub bar.

**It has two states, and the poster-only one is still the normal one.** Most
sections have no recording, exactly like the mascot slot and the empty past
papers: build the shape now, drop the real thing in later.

**WITHOUT a `youtubeId`, NOTHING IN IT IS INTERACTIVE — but it SAYS SO.** A
ឆាប់ៗនេះ chip sits in the frame's top-right whenever there is nothing behind
the play glyph, which is what makes the state legible WITHOUT tapping — the same
principle as `exam-paper-card.tsx`'s chip and the survey's `studiedNote`.

That chip is a REVERSAL, and the history matters because this file used to argue
the other way. The player first shipped with a real `<button>` plus the chip and
a "video is being prepared" notice; the chip and notice were removed at the
user's request, so the button went with them — an unexplained control that
answers a tap with silence is the broken-app pattern. The chip is back by
request (28 Sep 2026); **the button is not, and must not follow it back.** The
rule is unchanged: the chip EXPLAINS the state, only a `youtubeId` makes it
pressable. A `<button>` that answers a tap with silence is the
broken-app pattern `sidebar-nav.tsx` and the survey's `StudiedStep` both exist to
avoid — with the explanation gone, plain spans are the only honest form.
Identical on screen, no pointer cursor, no focus ring, nothing announced as
pressable. **Don't reinstate the `<button>` without reinstating something for it
to say** — and `youtubeId` is exactly that something, which is why it is the only
condition under which the button appears. The rule is SATISFIED here, not
repealed. Elapsed reads 0:00 and the scrub sits at zero because both are true — a
pre-filled bar would invent a state the app cannot know.

**WITH a `youtubeId`, the tap mounts a YouTube iframe and nothing before it.**
Hosting is an UNLISTED YouTube video — $0, and automatic adaptive bitrate, which
is what a self-hosted mp4 cannot do: one fixed bitrate either buffers on 3G or
looks soft on wifi, and bills Vercel egress per view. The cost is a third-party
frame, and **the facade is what makes that cost conditional on the student asking
for it**: until the tap, not one byte leaves this origin. The poster is always our
own `/sections/{id}.webp` — never `i.ytimg.com`, which would contact Google on
every section view and defeat the whole thing. The thumbnail is downloaded ONCE
at authoring time and converted by `scripts/webp.mjs`.

Four things in it that a later edit could undo:

- **NO `React.lazy`, and none is needed.** `brain-model-viewer.tsx` is a lazy
  boundary because three.js is a large MODULE the bundler can see. An `<iframe>`
  is MARKUP: zero bytes in any chunk, and the player's own JS is fetched by the
  iframe's browsing context, a separate document no bundler could reach. A lazy
  boundary here would buy a Suspense frame, a chunk round trip and a layout-shift
  risk for nothing. `app.tsx`'s `routeModules` needs no entry — the feature is
  invisible to the code-splitting story. Verified: `youtube-nocookie` appears in
  exactly one built chunk (`section-detail-*.js`), zero in the entry chunk, and
  no dependency was added.
- **`youtubeId` is the 11-char id, never a URL.** A URL field accepts five
  spellings of one video (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, plus
  the `?si=` the share sheet appends); all five typecheck and one embeds. A
  malformed id reads as NO id and falls back to the poster, rather than rendering
  a YouTube error page behind a button.
- **Four player params, and four deliberately omitted.** `autoplay=1` (needs
  `autoplay` in `allow=` too — the cross-origin Permissions-Policy default is
  `self`, and omitting it is the usual reason a facade needs two taps),
  `playsinline=1` (without it iOS hijacks to native fullscreen, out of
  `FocusLayout`), `rel=0`, `hl=km`. NOT set: `modestbranding` (ignored since
  2023), `iv_load_policy` (annotations died in 2019), `mute=1` (a silent lesson
  is worse than one more tap), `enablejsapi` (invites watch-progress tracking).
  `cc_lang_pref=km` does nothing without `cc_load_policy=1`, and that with no real
  Khmer track forces garbage auto-captions — **add both the day a Khmer caption
  track is uploaded**.
- **The preconnect is rendered from the component, only when there is a video,
  and NOT in `index.html`.** That file's link already blocks first paint, and
  warming a host reachable from one section on every screen would slow first
  paint for everyone. No `crossorigin` — the iframe is a navigation, not a CORS
  fetch, so an anonymous preconnect opens a second unused connection (the
  opposite of `fonts.gstatic.com`, where fonts ARE CORS fetches).

**NOTHING ASSUMES PLAYBACK STARTED** — no timer, no progress, no auto-advance.
Telegram's and Messenger's webviews may refuse `autoplay` whatever the gesture,
and that has to stay a legible second tap on YouTube's own button rather than a
stuck screen. Posters live in `public/sections/` named by section id, 16:9
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
Seven entries today: four biology, plus **`math-1-1-1`** (the first math section
and the first with a REAL VIDEO behind its player), **`math-1-1-2`** and
**`math-1-1-3`**. Nearly-empty is still the normal state, same as `PAST_PAPERS`.

**`math-1-1-2` is the one to copy for a maths section.** It carries a `video`
with a POSTER AND NO `youtubeId` — the placeholder state, drawn with the
ឆាប់ៗនេះ chip — and **no `durationSec` at all**, because a run time printed
beside that chip would claim a video that has not been made. `durationSec` is
optional for exactly this; `biology-3-1-1` keeps the one it was authored with.
Its poster is the subject illustration recropped to the section spec (16:9,
800px) rather than new artwork, so it needs no new licence. `math-1-1-3` reuses
the same crop: there is no per-section artwork, and one honest placeholder beats
a different invented image per section.

**`math-1-1-3` is where the Khmer rule bit hardest, and it is the example to
follow.** Its source arrived with the headings, the steps and even the question
stems in English ("Decimal to Fraction", "Step 1", "Shortcut", "Convert 0.5 to a
fraction"). None of that is a term of art, so all of it is Khmer in the file, and
the mapping used is written into that entry's own header so the next maths
section translates the same words the same way.

**Its column addition is a KaTeX `array`, not spaces.** The renderer uses
`whitespace-pre-line`, which keeps newlines but COLLAPSES runs of spaces, so a
preformatted sum loses exactly the alignment it exists to show. Note the row
separator is four backslashes in the source (two in the string).
It is also the densest LaTeX in the repo (101 `rac` alone), and therefore the
clearest case of the doubled-backslash rule — ``, `
`, ``, `	` and `
`
are all C escapes, so `rac`, `
eq`, `oxed`, `	imes` and `
ightarrow`
written with ONE backslash silently become a form feed, a newline, a backspace,
a tab and a carriage return. They still render, just wrongly, which is why
`check:quiz` typesets every string rather than trusting the eye.

**EVERY STRING IN A SECTION NOW RENDERS THROUGH `MathText`** — `Block`'s intro,
outro, item labels, bodies and nested items, and `QuizQuestion`'s prompt, options
and explanation. It went in with `math-1-1-1`, whose content was supplied in
LaTeX; without it the student reads the raw source. Hand-converting to Unicode
instead was rejected for the reason recorded for the 2025 maths paper — a
transcription risk with no upper bound on how quietly it fails — and the content
arrives in LaTeX anyway.

Three consequences worth knowing:

- **It is free for the sections that do not use it.** `splitMath` leaves a
  dollar-free string untouched and `MathText` short-circuits it to one inline
  node, so the four biology sections — which contain zero `$`, checked — render
  exactly as before. It costs no BYTES either: `math-text-*.js` is already a
  shared chunk warmed at idle for every student, because `quiz-runner.tsx`
  imports it and `practice-run` is in `app.tsx`'s `routeModules`. Measured after
  the change: the entry chunk contains zero katex.
- **`Block`'s lead and trailing paragraphs are `<div>`, not `<p>`.** `MathText`
  emits a block `<table>` for a Markdown table — `math-1-1-1`'s sign table is one
  — and a table inside a `<p>` is invalid HTML that the parser silently unnests.
- **Backslashes are DOUBLED in the data**, matching `data/quizzes/math-1-1-1.ts`.
  Written singly in a plain string a backslash-t is a TAB and a backslash-b a
  BACKSPACE, so the times command becomes a tab followed by "imes" — the exact
  bug `data/bac2-format.ts` warns about, and one that renders without throwing.
  **Khmer must never go inside a math span**: KaTeX substitutes maths fonts with
  no Khmer coverage and draws a row of empty boxes.

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

**A locked node carries a ឆាប់ៗនេះ chip, and its `aria-label` says the same.**
Without it the node is full colour with a play glyph and answers a tap with
nothing, which is exactly what was reported. The chip does NOT make it
pressable — it stays a `<div>` — it only stops the state being a surprise. The
label matters as much as the chip: a screen reader previously announced a locked
node identically to a playable one.

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

**`/exam` IS A CHOOSER NOW, and the two tabs below live at `/exam/subjects`**
(18 Sep 2026). `features/exam/components/exam-hub.tsx` shows two cards:
**វិញ្ញាសារតាមមុខវិជ្ជា** (Subject Mock Exams), a `<Link>` to `/exam/subjects`,
and **ប្រឡងបាក់ឌុបសាកល្បង** (Bac II Simulation, the full 2-day exam). That card
was a dimmed `<div>` until `/exam/simulation` existed; it is a `<Link>` to that
briefing screen now. The briefing's "Enter Day 1 Exam" still lands on
`/exam/subjects`, since no 2-day runner is built. The tabs are a ROUTE rather than state in the hub so the phone's back
button steps tabs → chooser, the same reason `/practice`'s levels are routes;
`ExamView` carries a `<Link to="/exam">` back link and its title is now
វិញ្ញាសារតាមមុខវិជ្ជា. Everything below describes `/exam/subjects`. The chooser
is Khmer-only too, and uses Lucide icons, not the reference sketch's emoji.

The chooser was then restyled on request ("make it look cool"). Three blocks:
a **countdown card** whose numbers are all real (`daysUntilExam()`, plus the
count and average of `examResults` — generated mocks only, so it agrees with
Home's pill); the **subject card** as a `bg-brand` fill under white text with
an icon tile and a row of `SubjectArt` avatars; and the **simulation card**,
which now LINKS to `/exam/simulation` (the 2-day briefing screen) and so is
pressable too. **Since the neobrutalism pass (1 Oct 2026)** both cards carry a
2px outline and a hard `shadow-panel` they sink into on `:active` (the black
"lip" is gone). The subject card is a flat `bg-brand`. **The simulation card
KEEPS its night look**: the `bg-night` gradient, the dotted texture, the yellow
glow and yellow accents under white text. It was briefly `bg-neo-blue` and the
user had it reverted ("not premium"); the briefing screen's closing block uses
the same look. Stacked on phones (two 136px columns broke the Khmer titles mid-word), two
columns from `md`. `scripts/shots.mjs` still reports soft hits on `exam`: the
large watermark glyph in each card's corner sits past its box and is clipped by
`overflow-hidden`, and there is no hard overflow.

**`BottomNav` and `SidebarNav` highlight on PREFIX now** (`pathname === href` or
starts with `href + "/"`, with `/` excluded so Home doesn't match everything), so
Mock Exam stays lit on `/exam/subjects`. Side effect, intended: `/practice/...`
sub-pages light Flashcards/Quiz too.

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
`PAST_PAPER_YEARS` and a `PAST_PAPERS` record keyed `"{year}-{subjectId}"` that
holds **one paper — 2025 English** (see its own section below); every other card
is still empty, and that is the normal state. `papersForYear()` builds
one paper per subject from `allSubjects(userLanguage)` — so a session is 7 cards,
not 8 — and looks the questions up. Filtering to subjects that *have* content
would render zero cards, and zero cards is not a screen. The payoff: dropping one
entry into that record turns a card on, and `paper.questions.length === 0` in
`PastPapersPanel.handleTest` is the only line whose behaviour changes. Don't add
an authored question count (it's `questions.length`) or a duration (there is no
timer, and a "180 នាទី" label on an untimed paper is the scrapped
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

### The 2025 English paper — the first REAL past paper, and the shape one takes

`PAST_PAPER_QUESTIONS` was empty for as long as Tab A existed. The MoEYS **Bac II
English paper, 28 សីហា 2025** (50 points, 60 minutes) is the first real one in the
app, transcribed from photographs of the paper, its answer key and its printed
sample essay.

**A PAPER IS NOT A FLAT QUESTION LIST, which is why the data shape changed.** It
has numbered parts, each with its own instruction and worked example; one of them
is a gap-fill over a shared passage with a single word box; and it ends in an
essay nothing can mark. `data/past-papers.ts` therefore exports **`PAST_PAPERS`**
(`Record<"{year}-{subjectId}", PastPaperContent>`) in place of the old
`PAST_PAPERS`, with each paper in its own file under `data/papers/`.
`ExamQuestion` was NOT widened — it is shared with `MOCK_QS`, the placement test
and the Game feature, and `skill`/`explanation` mean nothing to any of them. The
new types (`PaperQuestion`, `PaperGap`, `PaperGapFill`, `PaperSection`,
`PaperWriting`, `PastPaperContent`, `SkillId`, `SkillHelp`, `DrillQuestion`) sit
beside it in `types/index.ts`.

**The flat list every existing caller wants is DERIVED**, by `paperQuestions()`
in `features/exam/papers.ts`: a gap-fill contributes its answerable gaps as
questions whose options are the whole word bank, and the EXAMPLE gap is excluded
because the paper fills it in for you. So `ExamPaperCard`'s
`questions.length > 0` readiness rule and `PastPapersPanel.handleTest` are
untouched, and a card still cannot claim content the app lacks. **Answers are
keyed by question ID, never by index** — a paper is answered across several steps
and reviewed in another order, and an index would re-point a saved answer the
moment a section gained a question.

**A PAPER HAS ITS OWN SCREEN NOW — `/exam/subjects/:paperKey`** (18 Sep 2026,
the user's request). Tapping a card on the tab list used to drop straight into
question one with a 60-minute clock already running, which is a real exam's worst
property reproduced with none of its warning. `pages/exam-paper.tsx` resolves the
key through `pastPaperByKey()` — the same builder `papersForYear()` uses, so the
paper's own screen cannot be titled differently from the card that opened it —
and `PaperScreen` owns the three states behind it: detail → run → review.

`PaperDetail` is TWO TABS: **ព័ត៌មានវិញ្ញាសា** (a 2×2 stat grid, the parts as
chips, a "before you begin" list, Start) and **ប្រវត្តិធ្វើតេស្ត** (every attempt
at this paper). Two rules carried over from everywhere else in this file:

- **Every number is derived or printed.** Questions from `paperQuestions()`,
  parts from the sections, minutes and `points` off the paper's own header —
  `points` is OPTIONAL precisely so a paper whose header prints none is not given
  one. The reference sketch also shows a difficulty ("Medium"); nobody graded
  this paper's difficulty, so that tile is simply absent.
- **"Before you begin" describes THIS runner.** The sketch promises "you can mark
  questions for review" and `PastPaperRunner` has no such control, so that line
  is not there. Each bullet is a fact about the code: the clock starts on mount,
  ← steps back, writing is on paper, running out submits rather than discards,
  and the review comes after submitting.

**LEAVING THE EXAM SCREEN ENDS IT ON THE THIRD TIME** (`hooks/use-leave-guard.ts`,
the user's rule: "ការចាកចេញលើសពី 2 ដង នឹងធ្វើឱ្យការប្រឡងត្រូវបញ្ចប់ភ្លាមៗ"). Two
absences are forgiven with a warning screen; the third submits the paper.

**IT CANNOT PREVENT LEAVING AND NOTHING IN A BROWSER CAN** — no page blocks the
home button, app switching, the notification shade or the screen locking. That
needs an installed app and the phone's own exam mode (Android screen pinning,
iOS Guided Access). This is detect-and-penalise; don't let any copy promise more.

Four decisions in it, each of which a later edit could quietly undo:

- **`visibilitychange`, measured from a TIMESTAMP.** A hidden page's timers are
  throttled or stopped, so counting ticks while away measures nothing — the same
  reason the paper's clock is a deadline stamped at mount.
- **`LEAVE_GRACE_MS` (2s) exists because the signal is ambiguous.** A permission
  sheet, a fingerprint prompt or a rotate hides the page exactly as switching
  apps does. The window is what stops a flicker costing a student their paper.
  **A phone call, a notification and an automatic screen-off still count** — the
  app cannot tell them apart, and that is the accepted cost of the rule rather
  than a bug to fix. The user declined a Wake Lock, so a phone that locks itself
  during a long passage does spend one of the two allowances.
- **It SUBMITS, never discards.** Ending a paper because a call came in AND
  throwing the answers away would punish the same accident twice.
- **The count is the only record.** `PaperResult.leaves` is optional (older
  attempts read as unknown, no migration), and "ended early" is DERIVED from
  `leaves > MAX_EXAM_LEAVES` rather than stored beside it, so a count and a flag
  cannot disagree. The results screen and the history row both say so.

**THE START BUTTON IS GATED ON A TICKBOX** — "ខ្ញុំបានអាន និងយល់ព្រមតាមបទបញ្ជា
នៃការប្រឡង", the user's request. A penalty nobody agreed to is one a student
first meets by being punished by it. It is a native `<input type="checkbox">`
inside a `<label>` rather than a styled `<div>`: keyboard-reachable, announces
its own state, and the whole row is the tap target for free. The tick is asked
for AGAIN on every visit, because `PaperDetail` unmounts while the paper is
being sat — the one path that skips it is ប្រឡងម្តងទៀត on the results screen,
where the student has already agreed once in that sitting.

The rule is stated twice — in the detail screen's "before you begin" list and
again on the paper's first step — because by the second one the clock is already
running. **Tab B's generated papers do NOT have this**: they are short untimed
practice, and ending one for taking a call would be punishment with no exam
behind it.

Verified in a real browser by driving the visibility API: a 0.7s absence does not
count, the first two show the warning (the second saying the next one ends it),
the third submits with the note on the results screen and `leaves: 3` stored, and
absences AFTER the paper ends change nothing. **The browser's own signal was
simulated, not produced by really backgrounding a tab** — Playwright cannot
background one — so confirm the behaviour on a real phone before trusting it in
a classroom.

**`paperResults` is the separate persisted field this section used to ask for**
— NOT a widening of `examResults`, which still captions Home's "from mock exams"
pill and feeds KruAI an average. It keeps the ANSWERS as well as the score, which
is what lets a history row REOPEN the real review (`PastPaperResults` re-marks
from `content` + `answers`, so the explanations for a paper sat last week are
still there) rather than showing a remembered percentage. Capped at
`MAX_PAPER_RESULTS`, cleared by `logout()`, and **LOCAL-ONLY**: `exam_results`
has a `kind` column that could carry these but no column saying WHICH paper, so a
pulled row could not be told apart from another year's paper in the same subject.
Syncing it needs a `paper_key` column first, and `syncRelevantChange` names it as
a deliberate exception alongside `syncedUserId`.

**Tab B is unchanged and still runs its papers in place.** A generated paper has
no printed minutes, points or parts, so a detail screen for one could only invent
them — the detail screen exists because a real paper has facts to show.
`ExamView`'s `Run` type is therefore generated-only now, and its `addExamResult`
branch lost its `kind === "generated"` guard because that is the only kind left.

**`PastPaperRunner` is a SECOND runner, and `ExamRunner` is untouched.** Tab B's
generated papers still go through the old one. Parts, a passage, a word bank, a
clock and an unmarkable essay are a different content shape, and one component
serving both would be the fork `SectionDetail` exists to avoid — what is shared
is the FRAME (`FocusLayout`/`FocusButton` + `utils/focus-styles.ts`), which is
exactly what that rule prescribes. It performs no store writes; `paper-screen.tsx`
decides what an attempt counts as, and the rules are unchanged except for the
history: XP, `recordQuestions`/`recordSession`, `addPaperResult`, and **never
`addExamResult`**.

**THE CLOCK IS REAL DATA, which reverses a rule this file used to state.**
`data/past-papers.ts` warned against a duration label because there was no timer
and "180 នាទី" on an untimed paper is a promise the app can't keep. `minutes`
comes off the paper's own printed header now and the runner counts it down, from
a deadline stamped at mount rather than by counting ticks — so a backgrounded tab
cannot gain time (`competition-run.tsx`'s pattern). **Running out submits what is
answered rather than discarding the attempt.** A paper with no printed time
simply omits the field.

**The Reading part is ONE step, not one per gap.** A gap-fill is solved by
reading around it, and paging through eleven screens hides the context the
exercise is about. Tap a gap, tap a word; a word already placed MOVES rather than
duplicating, because the printed box holds one of each. **The word bank is
`sticky bottom-0` inside the card** — the passage is taller than a phone screen,
and a bank pinned under it would mean scrolling down to pick and back up to see
where it landed.

**`PastPaperResults` replaces `ExamResults` for past papers only.** A percentage
is all there is to say about a five-question practice test; a real paper has
parts, a clock and twenty explanations to give back. It re-marks from
`content` + `answers` through `scorePaper()` rather than trusting the runner's
numbers, so the headline and the review list cannot disagree — the same reason
`features/practice/review.ts` owns its queries.

**A wrong answer gets more than a cross** (the user's request): the Khmer
explanation, then `SKILLS[skill]` from `data/papers/english-drills.ts` — the rule
in two to four lines, plus **two or three similar exercises** run inline with
immediate feedback, the practice shape rather than the exam's. The drill awards
nothing: the paper's XP is paid once by `exam-view.tsx`, and paying per drill
question would make a wrong answer the most profitable thing on the screen.
**No lesson links** — English has no entries in `data/lessons.ts`, and pointing at
one would be the Progress geography bar again.

**The score is the 20 objective questions, shown as `x/20`.** The paper is
printed out of 50 but the pages supplied do not give the per-part split, so a
conversion would be a number nobody wrote. **Writing is task + model essay, no
typing** (the user's call): the app cannot mark an essay, and a textarea nobody
reads would promise marking it does not do. The model essay is **written for
BrachNha**, not the paper's own printed sample, which the user asked not to copy
and which carries grammar errors of its own; it sits behind a tap on the results
screen so it is something to compare against rather than copy from.

**TWO DELIBERATE DEPARTURES FROM THE PRINTED PAPER**, listed exhaustively in
`data/papers/english-2025.ts`'s header: the key's `5. a- would buy` is recorded
as option **d** (the word is right, the letter is wrong, and the second
conditional agrees), and Vocabulary 3's "The restaurant service **are** bad"
reads "is". An English exam must not teach an agreement error.

**The transcription and every Khmer explanation are UNVERIFIED** — best-effort,
exactly like `data/practice.ts`'s first deck, and the file says so. A misread word
is a plain data edit there and nothing else in the app changes.

### The 2025 MATHS paper — an adaptation, and it says so

The second real paper (28 សីហា 2025, science stream, 125 points, 150 minutes),
and it is not the paper as sat. **The real maths paper is written work end to
end** — limits, probability, complex numbers, integrals, a differential
equation, vectors, a function study — and nothing here can mark a written
solution. The user's call: turn each part into MULTIPLE CHOICE so it can be
marked at all. `data/papers/math-2025.ts` carries all of this in its header.

**PARTS I TO III ONLY** (16 questions, 40 of the 125 points). IV–VII are not
transcribed; VII also needs a graph, which will be DRAWN (an SVG sampling the
curve, its asymptotes and the tangent) rather than cropped out of the answer
key's photo.

Four rules the file states and a later edit must keep:

- **THE WHOLE EXERCISE IS PRINTED BEFORE ITS SUB-QUESTIONS.** The user's rule,
  and the reason `PaperSection.statement` exists: *"the way u do that have many
  qcm in 1 exercise is good … but i want u to write the whole exercise first
  before start to qcm"*. Several multiple-choice steps per exercise is the shape
  they want — a step may ask an INTERMEDIATE result rather than the final
  answer, which is what lets a written part be marked at all — and it only reads
  as an exercise if the student has seen the exercise whole first. So each
  part's cover prints it as the paper does, with its lettered sub-parts, and
  every sub-question is labelled with the letter it belongs to (`ក.`, `គ.2`) so
  the taps map onto the printed paper rather than replacing it. **The review
  reprints it too** — a row reading "P(A): both the same colour" says nothing
  without the box and the counts, which live in the statement, so `SectionReview`
  carries it through `scorePaper()`.

  **AND THE STATEMENT IS THE PAPER'S OWN WORDS, COPIED — NEVER PARAPHRASED.**
  The user's second instruction on this, and it draws the line the first one
  left fuzzy: *"all exercise i want u to write exactly like an exercise i give
  … but when qcm so u can inovation as u want."* So `statement` may contain
  only text read off the paper; every invention belongs to the sub-questions'
  prompts, options and explanations, where it is wanted. **A rewritten
  statement is the worst failure available here** — our sentence wearing
  MoEYS's authority, and a student who practises on it meets different words in
  the real exam.

  The first pass broke exactly that: parts II and III had their lettered asks
  written out in my phrasing. They were deleted, and **the user re-supplied the
  paper, so all three statements are now transcribed verbatim** — which is the
  only way that gap was ever going to close. It could not be recovered from the
  repo or from git history: the file had only ever stored condensed prompts.
  **If a future part needs a statement and the paper is not to hand, ask for it
  rather than inferring it.**

  Three things the real paper settled that inference had got wrong, and each is
  a trap of its own kind:

  - **Part I letters its limits `a. b. c. d.` in LATIN**, not ក/ខ/គ/ឃ. The
    Khmer-only rule governs the app's own copy; it does not license translating
    the exam's lettering.
  - **Part II never asks for `n(S)` as a part.** It asks only for `P(A)`,
    `P(B)`, `P(C)`, naming each event in guillemets. `n(S)` is an INTERMEDIATE
    the answer key marks 4 of that part's 10 points for — so it is a
    sub-question here and pointedly not in the statement. That is the clearest
    example of the user's "no need to always final answer".
  - **Part III has no lettering at all** — one prose paragraph asking for
    moduli, arguments, trigonometric forms and then the algebraic form. So the
    eight sub-questions carry no invented letters either.

  **The per-part marks are the key's, and they add up** — I = 3+4+4+4 = 15,
  II = 4+2+2+2 = 10, III = 2+2+2+2+1+1+2+3 = 15, against the printed
  ១៥/១០/១៥. Checked by script rather than by eye; a sum that misses is a
  `points` somebody invented.
- **The prompt is the paper's; the OPTIONS are ours.** The correct answer comes
  from the paper's key; the three wrong ones are written here as the results the
  working actually produces when it goes wrong — a dropped sign, a forgotten
  conjugate, `arg(z₁/z₂)` added instead of subtracted. A distractor must never
  be a second correct answer.
- **The solutions follow the key's method, and no credit line is owed.** This
  REVERSES what this section used to say. The first pass declined to reproduce
  the supplied key on the grounds that it is watermarked ក្រូ សុខ ពិសិដ្ឋ /
  STEAM Tuition Center; the user's answer (19 Sep 2026) is that the paper and
  its key are MoEYS material and therefore public, and that stands — the
  watermark is a tuition centre's typesetting of a public exam, not a claim on
  the mathematics. Worth keeping either way: every answer in the file was ALSO
  worked out independently and agrees with the key, so nothing rests on the
  transcription alone.
- **`note` carries what the screen cannot show**: three parts of seven, and that
  the real exam is written. A student must not discover either by starting.

**`PaperQuestion.skill` is OPTIONAL now, and `points` is new.** `SkillId` is the
English paper's vocabulary (`quantifiers`, `because-of`…), so a maths question
carries none and the review renders no drill — absent rather than a button that
opens nothing. `points` is what the PRINTED paper marks that part out of, shown
beside each review row and **never scored on**: `scorePaper()` still counts parts
answered correctly, because the app marks a tap and the paper marks working.

**`MathText` renders the exam now, not just the mentor** — the prompt, every
option and every explanation. One renderer for both papers: `splitMath` leaves a
dollar-free English sentence untouched. The explanation block carries
`whitespace-pre-line`, which is what keeps a worked solution's steps on their own
lines. **KHMER NEVER GOES INSIDE `$…$`** (KaTeX has no Khmer glyphs and
`splitMath` refuses such a span), and every LaTeX string in the data file is a
`String.raw` template — a plain template literal turns `\t`, `\f` and `\b` into
control characters, which is exactly the bug `data/bac2-format.ts` warns about.

**KaTeX moved into a SHARED chunk** (`math-text-*.js`, 255KB raw) the moment the
exam imported it; it used to sit inside `chat-overlay-*.js`. Still lazy, still
absent from the entry chunk — verified after the build, the same way the
MathLive and Supabase boundaries are.

**Verified by a script rather than by eye**, because KaTeX renders broken TeX in
red instead of throwing — and **that script is `npm run check:quiz` now, not a
throwaway.** It was folded into the existing quiz checker (19 Sep 2026) the
moment this paper shipped notation that was wrong on screen and invisible to
every other check: `tsc` and oxlint see a string, `check:digits` sees the
digits, and nothing saw a formula. It walks `PAST_PAPERS` exactly as it walks
`PRACTICE_QUIZZES` — every statement, instruction, prompt, option and
explanation through the app's own `splitMath`, each math segment typeset with
`throwOnError: true`, `correct` matched against its own options, and a gap's
answer matched against its own word bank. Currently **26 paper questions, 438
strings, 0 failures**.

**One carve-out in it, and it is not laziness: `$20` is money.** A `$`
immediately followed by a DIGIT is allowed to survive into a text segment,
because the English paper's vocabulary note really does say "The room costs
$20" and a plain string has no way to escape a dollar that `MathText` will
render — `\$` would print as `\$`. This is the same distinction
`utils/math-render.ts` already makes in the other direction when it refuses to
treat `+` or `=` as a TeX marker. Everything else — a dollar before a space, a
letter or a backslash — is an unclosed, padded or newline-split span, which
means the student reads raw LaTeX, and it fails.

A real browser then sat the paper end to end at 320/390/1280 in both themes:
the statement typesets on each part's cover and again in the review, no
sideways scroll, no page error, no drill button.

**UNVERIFIED CONTENT, like every transcription here**, and one misreading has
already been caught the same way the biology deck's was. Part II's marbles were
transcribed **កូនប្ញើ** — not a real Khmer syllable, but plausible enough on
screen to survive a first look — and the user supplied the real word, **កូនឃ្លី**.
It appeared TWELVE times in the file. The rule the biology deck already wrote
down held again: **fix a term by searching the whole repo for it, never by
editing the one line it was reported against.**

**The Khmer and the notation were corrected once already (19 Sep 2026), on the
user's report that both were wrong**, and the corrections are worth listing
because each is a class of error rather than a typo:

| was | is | why |
| --- | --- | --- |
| `ផ្សំ` | the identity, not a name | ផ្សំ is "combine", not a conjugate. The explanation now states `(A-B)(A+B)=A²-B²` the way the key's own box does, so no term has to be coined |
| `រៀបចំ` | `ការរៀបលំដាប់` | an arrangement/permutation |
| `ត្រីមាសទី 4` | gone | it said "fourth quarter of a YEAR" for a QUADRANT of the plane. Rather than swap in ចតុភាគ, the sentence was dropped: the key derives the argument from `cos α` and `sin α` and never mentions a quadrant, so following it removes the word entirely |
| `z₁⁷ / z₂⁶` | `$\dfrac{z_{1}^{7}}{z_{2}^{6}}$` | Unicode super/subscripts standing in for maths, in a different face and height from every option and solution below them. They were only reachable because the part's cover rendered PLAIN TEXT; it renders `MathText` now |
| `$…$ , $…$` | one span | a comma stranded between two formulas is set in the text face. One span per option |

**One of those "corrections" was itself wrong and is REVERTED: `រាងមិនកំណត់`
stands.** It had been changed to `ទម្រង់មិនកំណត់` on the reasoning that the file
used ទម្រង់ for "form" elsewhere — and then the answer key arrived writing
`មានរាងមិនកំណត់` on every indeterminate limit. **The key is the Khmer a
Cambodian student meets in their own revision material, and it beats a tidier
coinage arrived at from inside this repo.** The rule that generalises: where the
supplied source names a term, that naming wins.

And one genuine MATHS error, fixed: I.a's explanation claimed the function is
continuous at $x = 1$. It is not — $\sqrt{x^{2}-1}$ needs $|x| \ge 1$, so the
limit exists from the RIGHT only and equals 3 within the domain, which is the
key's answer. The file carries a footnote so it is not "corrected" back.

**One follow-up left** (the other, a persisted past-paper history, is
`paperResults` above): feeding past papers into
`buildKnowledgeBlock` / `BAC2_EXAMPLES` once content exists. (The
`no-useless-escape` backslash bug this paragraph used to pair with that second
edit has since been fixed on its own — see "The LaTeX rules reached Gemini
garbled" near the end of this file.)

`scripts/shots.mjs` photographs the chooser as `exam`, the tab list as
`exam-subjects`, the paper's own screen as `exam-paper` (a real route, no
clicks), and the gap-fill step as `focus-exam-english` (Start from that screen).
Its `focus-exam` route (at `/exam/subjects`, as is `exam-generated`) clicks Tab
B's math card
specifically (`button:has-text("វិញ្ញាសារគណិតវិទ្យា")`) rather than a fixed "start"
button that no longer exists — math is the one subject on either tab
guaranteed to have content, via the `MOCK_QS` derivation above. If math's
`GENERATED_EXAM_QUESTIONS` entry is ever removed, that route needs a different
subject with real content or it stops reaching the runner at all.

**Practice** (`features/practice`) — Flashcards & Quiz; see its own section below.

### The practice page is two tabs, three levels, and empty on purpose

> **Since 3 Oct 2026 the decks and quizzes live in the DATABASE**, not in
> `data/practice.ts` / `data/quizzes/` (both deleted). Read this section and the
> ones after it for the screens and the reasoning, which still hold; where they
> say `PRACTICE_DECKS`, `PRACTICE_QUIZZES`, `deckFor()` or `quizFor()`, read
> "the manifest" (what is published) or "the loaded body" instead. How content
> reaches a phone now is "Step 1b: students read from the database" near the end
> of this file; how to write it is `content/README.md`.

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
`PAST_PAPERS` shipped — until `"biology-1-1"` became the first real
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
ជំពូក 1 · មេរៀនទី 1 (Gymnosperms), matching the chapter/lesson numbers
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

### Two subjects' Quiz tab is a Mimo-style path instead of the plain list

`/practice/quiz/math` and `/practice/quiz/physics` render differently from every
other `/practice/:mode/:subjectId` — a zigzag trail of square nodes over a
dot-grid background, instead of `PracticeLessonList`'s rows.

**`quizPathFor(subjectId)` decides which rendering a subject gets**, checked in
`pages/practice-subject.tsx` and gated to Quiz mode only — Flashcard keeps the
plain list on every subject, math and physics included. `QUIZ_PATHS` is a
`Partial<Record<SubjectId, Chapter[]>>`, the same shape `SUBJECT_SESSIONS` uses,
so a third subject is one entry rather than a hardcoded
`if (subjectId === "physics")` spreading across callers.

**IT IS THE REAL CURRICULUM SHAPE AND REAL PROGRESS NOW — this reverses what
this section used to say.** It first shipped as a flat list of six hand-authored
nodes carrying hand-authored done/current/locked statuses, as a design sample.
Both halves of that are gone:

- **Shape.** A path is CHAPTER → LESSON → SECTION, and ONE LESSON HOLDS SEVERAL
  SECTION SQUARES — the structure biology's Study path already renders, and what
  the textbooks look like. `quiz-path.ts` imports the app's own
  `Chapter`/`PathLesson`/`Session` types rather than re-declaring a flatter set,
  so one curriculum cannot be described two ways. A flat run of nodes could not
  express a lesson at all, which is why the old `QuizPathNode` interface and its
  `quizNodeHeading()` are both deleted.
- **Progress.** Nothing is authored as done. `sessionStatus(session,
  completedSessions)` derives every node's state, so a fresh student starts at
  the first node of the first lesson and a tick can only appear because they
  earned it. `QuizRunner` now calls `completeSession(quizSessionId(contentKey))`
  on finish, which is what closes that loop.

**THE `quiz-` ID PREFIX IS LOAD-BEARING.** `completedSessions` is ONE list shared
by every path in the app, and the Study path's own math sections are already
`math-1-1-1…` — the exact ids this path's first lesson would otherwise generate.
Unprefixed, finishing a foundation-review section on `/subjects/math` would tick
a Bac II quiz node here. `quizSessionId()` is exported so `QuizRunner` writes the
same spelling this path reads; a second literal in that file is how the two would
silently stop matching.

**WHY THIS IS NOT IN `SUBJECT_SESSIONS`.** That map already holds a math entry —
the មូលដ្ឋានគ្រឹះ foundation-review path on the Study page's foundation tab — and
`PATH_TAB`'s own comment states the rule: "one id cannot open two paths". Bac II
math therefore needs its own data, and `features/practice/quiz-path.ts` is it.

**Math's LESSON NAMES are real** (the user's own Grade 12 list, លីមីតនៃអនុគមន៍ …
ផលគុណនៃវិចទ័រក្នុងលំហ), in ONE FLAT CHAPTER because the list supplied has no
chapters in it — `Chapter.flat`, the same marker the Study path already uses, so
no banner prints a "ជំពូក 1" that groups nothing. **Its SECTION names are not
supplied yet and carry `title: ""`**, read back by `lessonHeading()` as the
number alone rather than a made-up name. `SECTIONS_PER_LESSON` (6, matching a
real biology lesson) reserves their positions — the `PLACEHOLDER_SECTIONS` move,
which permits reserving structure and never inventing names.

**PLAYABILITY IS DERIVED, NOT AUTHORED.** A section's `href` is non-null iff a
quiz exists under its content key in `data/practice.ts`, so today every node is
locked and renders as a `<div>`, and authoring `PRACTICE_QUIZZES["math-1-3-2"]`
turns that one node into a real `<Link>` with no code change. `keyFromRef()` in
`features/practice/practice.ts` was widened to accept an optional third number
for exactly that — two numbers is a lesson, three is one section of it, and
`pages/practice-run.tsx`'s lesson-name lookup reads the first two either way.

### The first real quiz — math 1.1, and the answer is more than a cross

`PRACTICE_QUIZZES["math-1-1-1"]` is the first authored quiz in the app, and the
first content behind a node on the quiz path: **មេរៀនទី 1 លីមីតនៃអនុគមន៍ · ផ្នែកទី 1
ប្រមាណវិធីលើលីមីត**, ten limit techniques, one question each. Authoring that one
key is what turned node 1.1 into a real `<Link>` — no code change in
`quiz-path.ts`, which is the whole point of deriving `href` from `quizFor()`.

**EVERY ANSWER GETS THE FULL TREATMENT, right or wrong**: the worked solution in
the existing Callout, then a ចំណាំ rule, then a កំហុសញឹកញាប់ line, then — behind
one button — **two similar exercises and two foundation exercises**, multiple
choice with immediate feedback. That is 50 questions and ~200 options in one
file.

**It reuses the ENGLISH PAPER's drill machinery rather than inventing a second
one.** `SkillHelp`/`DrillQuestion` already existed for the 2025 paper's
"a wrong answer gets more than a cross" review. Three changes made them shared:

- `SkillHelp` gained OPTIONAL `mistake?` and `foundation?`, so the eight English
  entries in `data/papers/english-drills.ts` stay valid untouched — verified by
  typechecking before any content existed.
- `SectionQuestion` gained OPTIONAL `help?: SkillHelp` — **the help OBJECT, not a
  key into a table**, so the renderer needs no lookup, no id union and no import
  from a subject's data file. The data file still keys its own record by a
  `MathLimitSkillId`, which is what a future "give me more of what I got wrong"
  matcher groups on; the reference is what links the two.
- `SkillDrill` moved to `src/components/skill-drill.tsx` and takes `help` as a
  prop instead of reaching into `SKILLS` itself. **That import had to go, not
  merely become unused**: a shared component importing one subject's drill corpus
  would drag the whole of it into every chunk that renders a question. Verified —
  `practice-run-*.js` contains no English drill text.

**Math's record is `Record<MathLimitSkillId, Required<SkillHelp>>`**, and that is
the highest-value line in the file: the two new fields are optional on the type,
so forgetting one of ten would otherwise be silent — no type error, just a
missing កំហុសញឹកញាប់ on question 7. `Required` makes tsc find it.

**`MathLimitSkillId` is a LOCAL union, deliberately not added to `SkillId`.** That
one keys a total `Record` for the English paper, so widening it would force
`english-drills.ts` to author ten maths entries it has no business having.

**Three traps in the component, each a bug it prevents rather than tidiness:**

- **`DrillGroup` is its own component.** One `picks` map shared by both groups
  would key similar-1 and foundation-1 on the same index, so answering either
  would instantly mark and lock the other. It also keeps `help.foundation` — an
  OPTIONAL array — from being read by a closure built above its own JSX guard,
  which is the React Compiler crash `review-session.tsx` documents, and which
  here would throw for every English entry.
- **`SkillDrill` is `key={index}` in the runner.** It owns which exercises are
  open and how they were answered, and that state belongs to the PRESENTATION,
  not the slot. Without the key it leaks on exactly one path: answer Q1, expand
  it, then press ← back from an answered Q2 — the panel stays mounted carrying
  Q2's state under Q1's help. An effect resetting it would trip oxlint's
  `react(set-state-in-effect)`; the key is the fix, not the effect.
- **Drill lists are keyed on POSITION, not on the prompt.** Two limit exercises
  can legitimately read the same, and these lists never reorder.

**`quizPathProgress` vs `readyLessonCount` — the second bug of the same family.**
`practice-run.tsx` took the runner's title from `chaptersFor()`, which for math
is the FOUNDATION review path, so a Bac II limits quiz was captioned
"មេរៀនទី 1 · ប្រមាណវិធីបូក ដក គុណ ចែក" — the wrong lesson of the wrong
curriculum. `readyLessonCount()` had it too: lesson-keyed off the same function,
so authoring a SECTION quiz moved it by nothing and the hub tile kept calling
itself a design sample on the day it stopped being one. Both now branch on
**whether the subject has a quiz path**, never on the shape of the ref — biology's
future lesson quiz has no path and must keep the `chaptersFor()` lookup.
`findQuizSection()` matches on the node's own `quizSessionId(contentKey)` rather
than re-deriving from numbers, so the title a student reads and the link they
tapped cannot come apart. The tile counts SECTIONS for a path subject and says
`ផ្នែក` rather than `មេរៀន`, because those are two different units.

**The content log is written at LESSON grain (`math-1-1`), not section grain.**
`contentLog`'s documented grain is the lesson and every other writer already
holds a lesson key; this is the first caller that does not, so `QuizRunner`
collapses through `lessonKeyOf()`. Logging `math-1-1-1` would put two grains in
one record for one real lesson.

**KaTeX now has a chunk of its own, and this was a deliberate trade.** It used to
live inside the lazy `chat-overlay-*.js`, paid for only by students who opened
KruAI. `quiz-runner.tsx` imports the same `MathText`, so Rolldown hoists katex
into a shared **`math-text-*.js`** (261KB raw, ~74KB gzip) plus its own stylesheet
carrying the KaTeX fonts. Measured after the change: the entry chunk has **zero**
katex hits and grew by 77 bytes. The real cost is that `practice-run` is in
`routeModules`, so `usePrefetchRoutes` warms that chunk at idle for every student
rather than only for KruAI users. Accepted — the content is maths, and hand-
converting ~150 LaTeX expressions to Unicode is a transcription risk with no
upper bound on how quietly it fails. **`math-text.tsx` stays under
`components/shell/` on purpose**: moving it beside `error-boundary.tsx`, which
`app.tsx` imports EAGERLY, puts one careless future import between katex and the
entry chunk.

**Section 1 of lesson 1 is the only NAMED section.** `quizSections()` takes an
optional `titles` array per lesson now, mirroring `sectionsFor()` on the Study
path, and fills the rest with `""` — a count is structure and may be reserved, a
name is content and may not be invented. Note the trail itself still prints no
per-node titles (see below), so the name surfaces in the node's `aria-label` and
in the runner's own title, not on the path.

### A quiz section is three screens, two clocks and a history

Tapping a section on the quiz path no longer drops straight into question one.
`/practice/quiz/:subjectId/:lessonRef` is `QuizScreen` now — **detail → run →
review**, three screens on ONE route, **modelled on `PaperScreen` almost line for
line** because it is the same problem: a thing you can attempt more than once,
with a history of attempts and a review that reopens from a stored one. Copying
that structure is what stops the two growing two different ideas of what an
attempt is.

**The detail screen shows EVERY time, not only once the section is finished** —
the user's call. One screen whose button reads ចាប់ផ្តើម before the first
attempt and ធ្វើម្តងទៀត after, rather than a square that does two different
things depending on state. The **ប្រវត្តិ tab appears only once there is a
history**, the absent-rather-than-empty rule the starred list and the retention
line already follow. Every number on it is derived: questions from the array,
the exercise count from the questions' own `help`, the best score from the
history. The reference design's "difficulty" tile is simply absent — nobody
graded these, so there is nothing to put in it.

**TWO CLOCKS, AND BOTH COUNT UP.** One for the sitting, one for the question on
screen. Neither is a limit and nothing runs out. The Game's own per-question
COUNTDOWN was built and then removed for the reason recorded in its section —
there is no honest number for how long one question should take, so any limit
would be invented — and a practice quiz has even less claim to one than a race
against another student. They measure so a student can watch themselves get
faster; that is the whole feature.

Three mechanics in `quiz-runner.tsx` that are decisions, not incidentals:

- **The times live in STATE, written only from event handlers.** A ref mutated
  during render trips oxlint's `react(purity)`, and an effect syncing them trips
  `react(set-state-in-effect)`. The start of question N+1 is stamped by the tap
  that advances to it — the one moment that cannot be wrong.
- **ONE interval for both**, the Game's rule, so a second timer is never started
  beside the first. `setNow` runs from the interval CALLBACK, never synchronously
  in the effect body.
- **A question's clock FREEZES on the answer**, not on leaving the question. What
  is reported is thinking time, not however long the student then spent reading
  the explanation and the four exercises underneath it.

**The review is COLLAPSED, and that was the ask.** Ten questions each carrying a
solution, a rule, a mistake and four exercises is several screens of wall, and a
student who has just finished came to see how they did. Each row opens to the
full answer, rendered by the SAME `SkillDrill` the runner showed inline, so a
review cannot teach something the quiz did not. **Wrong rows open on arrival**:
nothing is hidden from a student who got it right, but making them tap every row
to find out which they missed is work the screen can do for them. It **re-marks
from the questions** rather than trusting the attempt's stored numbers — the rule
`PastPaperResults` follows — which is also what lets a row from last week reopen
the real explanations instead of a remembered percentage.

**`quizResults` is a new persisted field, and it is NOT a widening of anything.**
`examResults` captions Home's "from mock exams" pill and feeds KruAI an average
it states as fact; `paperResults` is a paper, with parts and a clock budget. It
keeps the ANSWERS and the PER-QUESTION TIMES, not just the score, because that is
what makes a history row reopen a review. **LOCAL-ONLY**, listed beside
`paperResults` as a deliberate exception in `syncRelevantChange`: `exam_results`
has a `kind` column that could carry these but no column saying WHICH quiz, so a
pulled row could not be told apart from another section's. Syncing it needs a
`quiz_key` column first.

**`QuizRunner` reports the attempt OUT now** (`onSubmit`), the shape
`PastPaperRunner` and `ExamRunner` already use. Per-question XP stays in the
runner, paid as each answer lands — that is what makes this practice rather than
a test — while the daily task, the content-log session, the path node and the
history row belong to the SITTING, so `QuizScreen` owns them and one place
decides what a finished sitting counts as.

**The slowest-question line is guarded on `>= 1000ms`.** `clockLabel()` rounds to
whole seconds, so on a fast sitting every question reads 0:00 and "slowest:
question 1 (0:00)" is noise dressed as a finding.

**Testing note that cost a debugging pass: Playwright's `addInitScript` re-runs
on EVERY page load in that context.** Seeding the store that way and then calling
`page.reload()` or `page.goto()` silently rewrites localStorage with the seed, so
anything the test just saved disappears and the feature looks broken. It read
exactly like a persistence bug and was not one. Test a second visit by NAVIGATING
INSIDE the app — which is what a student does anyway — or seed after the first
load instead.

**A LOCKED NODE KEEPS ITS COLOUR AND SAYS SO** — full colour, same lip, same
glyph, no padlock, plus a ឆាប់ៗនេះ chip under it. It used to be a dashed grey
outline, which was right for six sample nodes and wrong for a 48-node curriculum:
a whole path of dashed grey squares reads as "you can't have this", where a path
that already looks finished reads as "this is coming". That is the user's
explicit call on the Study path, argued at length in `session-node.tsx`, and it
applies here for the same reason.

**The chip is a later correction to that same call (28 Sep 2026), and the two do
not conflict.** Identical colour was right; identical with NOTHING SAID was not,
because a node that looks finished and does nothing when tapped is the
broken-app pattern this file rejects everywhere else. The user reported it
against the Study path (`1.1.4`, `1.1.5`) and it was fixed on both. The chip is
the same one `subject-card.tsx`, `exam-paper-card.tsx` and the video placeholder
already use, so a student learns the state WITHOUT tapping — the `studiedNote`
principle.

Two things that still separate locked from playable: a locked node is a `<div>`,
never a `<Link>`, and it does not press. And the chip goes BELOW the node, never
beside it: `CENTRES` bounds a node on its WIDTH, so extra height only pushes the
next connector down while extra width would clip at the 320px floor.

**`nextQuizSectionId()` is DELIBERATELY NOT the Study path's bubble rule.** That
one points at the first PLAYABLE unfinished section and therefore returns nothing
at all while a path has no content, which is the gap `subject-path-view.tsx`
covers with an authored `openHere` flag. Here the bubble sits on the first
UNFINISHED section, playable or not: "where do I start" has an obvious answer
whether or not the content is written, and it is the top of the path. The bubble
means *this is where you begin*, not *this is playable*. It needs no authored
flag and walks down the path on its own as sections are finished.

**`quizPathProgress()` is NOT `pathProgress()`, and the difference was a real
bug.** `pathProgress()` counts only sections that are playable AND finished,
which on the Study path can never differ from what is on screen. Here the header
used it while each lesson banner counted plain completions — so a finished
section whose quiz was later unpublished drew a tick on the trail, `2/6` on its
banner and `0/48` in the header at the same time. One rule for both counters now:
done means in `completedSessions`, which is exactly what makes a node draw its
tick.

**The visual language is deliberately NOT a recolour of `subject-path-view.tsx`'s
Duolingo-style trail.** `quiz-path-node.tsx`'s badges are rounded SQUARES with a
Check/Zap glyph, not `session-node.tsx`'s circular discs, and the connector
between them (`ElbowConnector` in `quiz-path-view.tsx`) is two straight legs
meeting one `strokeLinejoin="round"` corner rather than the lesson path's smooth
cubic S-curve. The one thing kept IDENTICAL on purpose is the "lip" 3D press
effect (`0 5px 0` box-shadow, colour mixed toward black) — see `session-node.tsx`
for why that mix is the only one correct in both themes; it's what makes either
shape read as a physical button rather than a flat icon. Per-node curriculum text
stays OFF the trail: eight Khmer lesson titles under eight nodes on a 320px trail
would collide with the connectors, so the banner above each lesson names it and
the jump list carries the full list.

**The header is TWO tiers, reusing pieces from `subject-path-view.tsx` rather
than a thinner invention — a plain single pill shipped first and read as
noticeably less finished than the rest of the app, so it was replaced.**

1. A subject summary card — `SubjectArt` + name + a progress bar over the WHOLE
   path — is the identical treatment the lesson path's own header already uses.
   `bg-surface` with the subject's tinted `--color-subj-*` border, never a solid
   fill: it's a card holding text and a thin bar, not white text sitting on one.
   Tapping it swaps the trail for `QuizJumpList`. **It and the back link STICK to the top
   of the scroll area** — the way out and the progress bar have to stay reachable
   on a 48-node path, and they scroll away otherwise.
2. **ONE SOLID-FILL BANNER PER LESSON**, each followed by that lesson's own
   dot-grid panel of squares — the same banner `subject-path-view.tsx` prints
   before each lesson, carrying its own `0 4px 0 color-mix(...black)` lip so the
   two screens read as one material. The cardinality used to be the difference
   between the two paths (this one printed exactly one banner, naming whatever
   was current); with a real curriculum the per-lesson banner IS what tells a
   student where one lesson's sections end and the next begins. The chapter
   kicker is skipped for a `flat` subject.
3. The next node carries the lesson path's `ចាប់ផ្តើម` bubble —
   `quiz-path-node.tsx` reuses the exact tail-pointing pill from
   `session-node.tsx`'s `isNext` treatment, not a new one.

**THE STICKY HEADER'S OFFSET IS `-top-4`, AND `top-0` IS A BUG THERE.** A sticky
element pins against the scrollport's **PADDING box**, not its border box, and
this page's scroller carries `pt-4` (`pages/practice-subject.tsx`) — so `top-0`
parks the header 16px BELOW the top of the scroll area and the trail slides
through that band in plain sight (measured at 390px: scrollport top 38, block top
54, with a node visibly peeking over the card). `-top-4` cancels exactly that
padding; `-mt-4` pulls the block up by the same amount and `pt-4` pads it back
inside, so its BACKGROUND covers the band while the back link keeps its breathing
room, and the stuck and unstuck positions coincide so nothing jumps as it pins.
The background is `bg-bg` (the PAGE token, since this band is the page showing
through) and `z-20` clears the node's own `z-10` START bubble. `pb-3` replaces the
children's `mb-3`: a margin below a sticky element sits outside its background
box, which is one more strip the trail shows through.

**`QuizJumpList` is ONE ROW PER LESSON, not per node** — the same grain
`ChapterJumpList` uses, and what makes it worth having on a real path: math is
eight lessons of six sections, and a list of 48 unnamed squares would be no
easier to scan than the trail. Picking a row scrolls to that lesson's BANNER
(`scrollIntoView`, because this component does not own its scroll container —
`pages/practice-subject.tsx` does).

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
heatmap, study tips. ALL SEVEN run on the student's own data since 1 Oct 2026
— see the section directly below, and "Phase 0" near the end of this file for
the last three.

### Progress: four cards are REAL now, three are still invented

This page shipped with its own hand-written subject list and it had drifted from
the app in five separate ways at once, which is worth listing because each is a
different failure and only the first was visible:

- **A "Geo" bar for a subject the app has never had.** No entry in `SUBJECTS`, no
  colour token, no translation key, no lessons, no exam papers. It existed in
  this one file.
- **History, Khmer and the language subject were missing** from both cards.
- **The two cards disagreed**: five subjects in the chart, four in the list.
- **Two spellings of the same four** — `Chem`/`Chemistry`, `Phys`/`Physics` —
  because each card authored its own labels.
- **The five shared brand accents instead of the per-subject palette**, so math
  was purple here and blue everywhere else. That is precisely what
  `features/lessons/subject-styles.ts` exists to prevent.

**`features/progress/subjects.ts` is the fix, and the shape is the point.**
`progressSubjects(userLanguage)` maps `allSubjects()` — the same call the
Study, Exam and Practice pages make — over `demo-data.ts`'s `subjectStats`,
picking up the list, its order, the student's chosen language subject, the
catalog's Lucide icon, a name in the page's language and the per-subject
colour. Only the numbers came from the demo file.

**The name follows `lang` — the page is bilingual now.** It was held ALWAYS
ENGLISH for a while, on the reasoning that every other label on this page was a
hardcoded English string, so switching only the names would have put Khmer words
inside English cards. That paragraph promised to revisit "alongside" localizing
the whole dashboard, and that happened (17 Sep 2026) — see "Both languages"
below.

**`subjectStats` is `Record<SubjectId, SubjectStats>`, not an array**, which is
what makes the geography row unrepresentable rather than merely deleted: a
subject outside the catalog cannot be given a score, and a NEW subject fails to
compile until it has one. The bar chart and the breakdown list read the same
record, so a subject's question count cannot differ between two cards a few
pixels apart the way it could when each authored its own.

**`totalQuestions` is SUMMED, never authored.** The hero's old hand-written 342
was the sum of the five subjects this file used to list, geography included — so
deleting that subject would have left a total no row on the page adds up to.
Same rule as `lessonCountFor()` on the Study page. **English and French carry
identical stats** so that sum does not depend on which language the student
picked; they are one "your language subject" row written twice.

**`trendPct` is one signed number** and the arrow, sign and colour are derived
from it. It replaced `trend: "▲ +6%"` sitting beside a `trendUp` boolean — two
hand-written values describing one fact, free to disagree.

**The colour is the per-theme `--color-subj-*` scale, never the raw
`--subject-*` hex.** Everything coloured here is a score in coloured text, a
progress fill, a sparkline bar or an SVG bar on a card — never white text on a
fill, which is the only role the raw value is correct for. That is also why it
needs no `dark:` anything.

**THE BARS STILL GO UP — a horizontal layout was tried first and reverted at
the user's request** to keep the "bars going up" look the original page had.
Seven upright bars give each label ~36px at the 320px floor and neither
"Chemistry" nor "Chemistry" abbreviated three different ways fits there, so
`XAxis dataKey` is `shortLabel` (`SHORT_LABEL` in `progress/subjects.ts` — Math,
Phys, Chem, Bio, Hist, Khmer, Eng, Fr), ONE consistent map rather than the old
chart's own hand-picked codes that had already drifted from the list below it.
The full name is a tap/hover away: `<Tooltip content={<ChartTooltip/>}>` in
`subject-bar-chart.tsx` is a custom content component (not
`contentStyle`/`labelStyle`/`itemStyle`, which only style Recharts' own default
panel) so it can read `payload[0].payload` — the whole `ProgressSubject` row
`Bar` was given — and print the full `name` instead of the axis's short one.
`interval={0}` on the `XAxis` keeps Recharts from thinning ticks on its own,
which it otherwise does at this width even with room for all of them.

#### The numbers came off demo data (16 Sep 2026) — four cards, not seven

The subject LIST stopped being invented first (above); the NUMBERS followed. The
user's scope: **Score Hero, Weekly Learning Activity, Questions Answered and
Subject Breakdown go real. Focus Areas 🔍, Study Activity 🗓️ and AI Insights 🤖✨
stay exactly as they are.** (Study minutes was staged after those four and is
now built too — see its own subsection below.) So `demo-data.ts` shrank to those three exports
rather than being deleted. **`PreviewTag` was then REMOVED from
`pages/progress.tsx` (17 Sep 2026), at the user's request**, although those three
cards are still demo — the same call the Game page got. Don't restore it unasked.

**WHAT NOTHING RECORDED, AND NOW DOES.** `activityLog` has always known a day
earned XP; it has never known what FOR. That single gap is why every per-subject
number here was fiction, and why `exam_results.subject` sat nullable and
unwritten since the schema was created — the store's `ExamResult` had no subject
field to supply it from.

`contentLog: Record<dayKey, Record<contentKey, ContentDay>>` is the fix. A
content key is a LESSON key (`biology-3-1`) or a bare subject id for work not
attached to a lesson; the value is `{ answered, correct, reviewed, sessions }`.

- **AGGREGATE, NOT AN EVENT LOG.** A row per question grows with the fastest-
  growing quantity in the app and would need a `MAX_` cap like `reviewHistory`'s
  — and a cap silently truncates exactly the history the 30-day trend reads. This
  grows with days × content touched, so 200 questions in one lesson costs the
  same as 2. Trimmed by `MAX_ACTIVITY_DAYS`, so it expires with `activityLog`.
- **LESSON grain, although nothing reads that grain yet.** The call sites already
  hold a lesson key, so collapsing to the subject would mean calling
  `subjectOfKey()` at every write and discarding the rest — not less code. Focus
  Areas is what would read it, and Focus Areas is still demo.
- **`reviewed` never reaches an accuracy figure.** A flashcard grade is a
  self-report, not a scored answer; folding it in would make "average score" a
  blend of measured and claimed that no caption on the page distinguishes.
- **Five writers:** `section-detail.tsx`, `quiz-runner.tsx` (unreachable today,
  since `PRACTICE_QUIZZES` is empty — wired anyway), `exam-view.tsx` and
  `review-session.tsx`. **Not** `placement-test-runner.tsx`: placement is a
  diagnostic taken BEFORE studying, the same reasoning that already keeps it out
  of `examResults`.
- **BOTH exam kinds are recorded**, unlike `examResults`, which excludes past
  papers. Deliberate: `examResults` captions Home's "from mock exams" pill and
  feeds KruAI an average it states as fact, so a past paper in it makes both
  wrong. The content log has no such caption, and a past paper is unambiguously
  questions the student answered. **Don't "fix" the asymmetry.**

`features/progress/content-keys.ts` is the ONLY place a key is parsed back into a
subject. `subjectOfKey()` checks the real catalog and returns `null` rather than
guessing, which is what stops a student-authored card id (`crypto.randomUUID()`)
being attributed to whatever its first hyphen-separated chunk happens to spell.

**`ExamResult.subject` is OPTIONAL and `version` stays 4.** Two distinct
no-migration reasons, worth keeping apart: a new top-level key (`contentLog`) is
covered by `merge()`'s top-level spread, while a new optional field on an
existing array ELEMENT works for a different reason — `merge` spreads at the top
level only, so `rest.examResults` is taken whole, nothing fills in `subject`, and
`undefined` reads correctly as "unknown". Same as `Competition.sharedAt`. A
migration would be actively wrong here: it could only invent a subject it does
not know.

**`summary.ts` returns a TOTAL object, never null — a React Compiler property
rather than a style choice.** `ProgressSummary | null` would put
`if (!summary) return <Empty/>` in every card, and the compiler narrows a
closure's memo dependency to the exact property path it reads and emits that
check where the closure is BUILT, above any guard later in source order. That is
the `review-session.tsx` crash, reproduced once per card. Nullability therefore
lives on LEAF fields. `todayKey()` is likewise called ONCE, in
`pages/progress.tsx`, and threaded down — the two subject cards used to call
`progressSubjects()` independently, so one screen could hold two answers.

**Verified rather than reasoned about:** the compiled chunk shows
`t[9] !== D.card.id || t[10] !== D.deckKey` emitted AFTER both guards in
`review-session.tsx`, and a real browser graded all six Biology cards through to
the summary and answered both section-quiz questions with no page error.

**Empty states, because real data starts empty.** No exams → the ring draws its
track only, the figure is `—` with no stray `%`, and the caption reads "No mock
exams yet". An all-zero week → one line replaces the chart body, card and header
staying. A subject with no work → `SubjectRowEmpty`, its own component so the
branch is a one-line return: name, "Not started yet", and **no score, no trend,
no progress bar, no sparkline**. It still gets a row — a missing row reads as a
subject BrachNha does not teach, the mirror image of the geography bug.

Three silent failures `tsc` caught only because those fields became nullable:
`width: "null%"` is ignored by CSS and fails invisibly, `trendPct >= 0` is
`false` for null and paints a pink ▼ on a subject with no trend at all, and the
sparkline's opacity ramp divides by `length`.

**POINTS, NOT PERCENT — and zero gets its own branch.** `trendPct` and the hero's
month-over-month line are differences between two percentages, so 70 → 76 is six
POINTS; "+6%" would be a different and wrong number. And with real data two
windows scoring the same is common, where `>= 0` painted a green "▲ +0%" on a
subject that had not moved; it reads "no change", in muted.

**Sparklines changed meaning: daily question VOLUME, not accuracy.** Real daily
accuracy on a one-question day swings to 0 or 100 and the strip becomes noise.

**The last three cards went real on 1 Oct 2026 (the user's call),** and each
took a different route — see "Phase 0" near the end of this file:

- **Focus Areas** — at SUBJECT grain (`features/progress/focus-areas.ts`).
  Topic grain exists nowhere, and lesson grain is ambiguous for maths (the
  Bac II quiz path and the foundation path both write `math-1-1`).
- **Study Activity** — `heatmapCounts()` in `utils/activity-heatmap.ts`, from
  `contentLog`: questions answered PLUS flashcards reviewed per day, so it now
  agrees with the bar chart beside it.
- **AI Insights → "Study tips"** — RULE-BASED (`features/progress/study-tips.ts`),
  no model call, for the reason this card was demo: a live `/api/chat` call from
  a bottom-nav tab would spend the daily KruAI budget on a screen nobody asked a
  question on.

#### Study minutes — `hooks/use-study-timer.ts`

Built last, deliberately: it is the only piece that adds an always-on timer to
every screen, and the only one with a design problem rather than a plumbing one.
`daily_activity.study_minutes` has carried its own instruction since the initial
schema — it "must mean ACTIVE minutes … counting 'app was open' would make
leaving a phone unlocked a winning strategy" — and every constant in that file
is a defence of that sentence.

**THE TRADE, and do not reuse this without revisiting it:** the figure is
CLIENT-SIDE and therefore DEFEATABLE. A student who wants a bigger number can
leave a lesson open and touch the screen every two minutes. That is fine for a
private figure on their own Progress card, which is the only place it appears.
**It is NOT fine for ranking students.** If the leaderboard ever adopts it, it
needs a server-side sanity cap — `study_minutes <=` the wall-clock minutes
between the day's first and last write — and that belongs with the leaderboard's
cross-user work, not here.

**Every judgement call rounds DOWN.** A defeatable number is allowed to be wrong
in one direction only: a student who studied and was not credited is
disappointed; a student credited for a pocketed phone makes the figure worthless
for everyone.

- **30s tick.** 5s is 720 wakeups an hour on a phone for a figure shown to one
  decimal; 60s under-credits a 90-second section by a third.
- **120s idle timeout**, on passive `pointerdown`/`keydown`/`wheel`/`touchstart`/
  `scroll`. Long enough that reading a paragraph of dense Khmer without touching
  the screen still counts, short enough that a pocketed phone stops earning.
- **`visibilitychange` RESETS the stamp and never credits the gap.** Coming back
  is activity; the time away is not study time.
- **`lastInputAt` and `pendingSeconds` are MODULE-LEVEL, not refs.** StrictMode
  gives each effect pass its own ref — the trap that once produced two anonymous
  users per page load — and two half-counters would double-credit every minute.
  Module scope is also what lets a sub-minute remainder survive navigation, so a
  student moving between short sections is not zeroed at every screen.
- **At most one `set()` per minute.** Every store write re-serialises through
  `persist` and arms the sync debounce, so a per-second counter would be a write
  loop rather than a measurement.

**`isStudyRoute()` is NOT `isFocusRoute()`**, and the two differences are the
point: the game REVIEW is excluded (reading back what you both answered is not
studying), and the mock exam is not a route at all, so the store's `focusMode`
is ORed in exactly as `useFocusMode()` does. **The KruAI overlay is deliberately
absent** — asking the mentor IS studying, but the overlay is global, has no
natural end and is the easiest place in the app to leave open on a pocketed
phone. Counting it would reopen the hole the metric exists to close.

**A trap this change had to fix first:** `logXp` and `logGoal` each rebuilt the
day entry as `{ xp, goal }` literally, which was correct while those were the
only two fields — and would have silently dropped `minutes` every time a student
earned XP, so a day's study time vanished the moment they answered a question.
Both spread `prev` now, so any field added to `DayActivity` later survives.

**Verified with a fake clock** (`page.clock`), because a timer cannot be proven
by a screenshot: 6 minutes of simulated active study credits exactly 6; 10
minutes idle credits 1 and then stops at the 120s mark; a non-study route and a
hidden tab each credit 0. **Note `fastForward` fires a repeating interval ONCE
per call regardless of how far it jumps** — stepping 60s at a time silently
halves the tick count and makes correct code look broken. Step at `TICK_MS`.

**Server side:** `20260916000001_content_activity.sql` adds
`daily_content_activity`, with its own RLS in the same file (the
`20260913000001_competitions.sql` pattern). ONE push batch is correct there, but
only because every row carries all four counters from a fixed literal so
postgrest's column union is stable — a conditional spread would reintroduce
exactly the NOT NULL failure the two-batch split exists to avoid, silently, on
whichever day had no flashcard grades. `daily_activity.questions_answered` is
deliberately left unwritten: its only consumer would be the heatmap, which stays
demo, and `contentLog` already carries the number.

#### Every real number explains itself on HOVER or TAP — `components/ui/info-tip.tsx`

Added after a student had to ask three questions in a row: how Subject Breakdown
differs from Questions Answered, why a subject had no bar, and what 88% meant.
Offered labels written into the cards or plain sentences, **the user chose
tooltips** — the cards stay as uncluttered as before and the explanation is one
gesture away. All four REAL cards carry them; the three demo cards do not.

Two trigger shapes, one component. A card TITLE gets an ⓘ explaining the card.
A NUMBER is itself the trigger, **with no marker at all**: the four stat tiles
(the whole ~70px tile is the target, not a speck of an icon), a subject's score
("7 of 8 correct, all time", plus the trend as a sentence), and — on a row below
`MIN_SAMPLE` — the question count, which says how many more answers a score
needs. `MIN_SAMPLE` is exported from `summary.ts` for exactly that line, so the
threshold is written once.

Four things that look arbitrary and are not:

- **Hover with a mouse, tap with a finger — it shipped tap-only, and a dotted
  underline marked every number.** The user found the underlines ugly and asked
  for what other apps do. Both reversals hold together: once a mouse sees the
  explanation on hover, the underline has nothing left to announce. A mouse
  gets `cursor-help`; a phone user learns from each card's ⓘ.
- **The flicker that justified tap-only is avoided, not accepted.** Hover-open
  plus click-toggle shuts under the cursor the moment the click lands, so the
  click is judged by what MADE it: `onPointerDown` records `pointerType`, a
  mouse click only ever OPENS, and a touch or a keyboard Enter toggles. Hover is
  filtered to `pointerType === "mouse"` — a touch fires `pointerenter` too, and
  reading that as a hover would open on the way in and toggle shut on the click.
- **Two delays, ONE timer.** `HOVER_OPEN_MS` (150) stops a pointer sweeping the
  four tiles from flashing four popups. `HOVER_CLOSE_MS` (120) is the grace for
  crossing the 6px gap into the popup — hover lives on the WRAPPER, which
  contains the popup, so arriving on it re-fires `pointerenter` and cancels the
  close. One ref holds whichever intent is pending, so a leave followed by a
  quick re-enter cannot race into a shut popup. Also closes on an outside tap
  or click and on Escape — `ActivityHeatmap`'s rule. A tap INSIDE the popup
  keeps it open, so an open popup can cover the next trigger; a test that taps
  down a list must close each one first.
- **Measured, not aligned.** The heatmap aligns from the grid column it knows.
  A shared popup cannot, and overflow here is not cosmetic: every page scroller
  is `overflow-y-auto`, which forces overflow-x to auto, so a popup past the
  edge makes the page scroll sideways. It centres under the trigger, clamps
  inside the nearest clipping ancestor (8px clear), and flips above only when
  below is cut off and above fits. Position is written to `style` in a LAYOUT
  effect — before paint, so no jump, and not `setState`, which
  `react(set-state-in-effect)` refuses.
- **The ⓘ is glued to the title's LAST WORD** (`whitespace-nowrap` span). As a
  flex item it floated to the far edge once the title wrapped; as a plain inline
  it wrapped onto a line of its own ("OVERALL READINESS" fills a 320px line).
- **The popup's font is `[font-family:var(--font-body),sans-serif]`, not the
  `font-body` utility.** `--font-body` carries no generic fallback — `body` adds
  `sans-serif` itself in `globals.css` — so before Nunito arrives on a slow
  connection the utility renders in the browser's default SERIF. Seen in a real
  screenshot, not theorised. `study-calendar.tsx` still uses `font-body` on its
  Today button and has the same latent flash.

**THE COPY IS A CLAIM ABOUT THE CODE, and goes stale silently.** Each tooltip
states a rule — flashcards don't count toward questions or score, past papers
don't count toward readiness, the study clock pauses after 2 minutes and ignores
KruAI, the trend needs 5 in both windows. Changing any of those rules means
editing the sentence too — in BOTH languages in `features/progress/copy.ts` —
and nothing will fail if it isn't.

**"Not started yet" means NOTHING recorded — fixed right after shipping.** The
row used to branch on `questions === 0`, and `questions` counts scored answers
only, so a subject studied purely with flashcards rendered as the dimmed
"Not started yet" row: the page telling a student that work they had done did
not exist. `SubjectStat.reviewed` (all-time flashcard grades — VOLUME only,
never part of `score`) now carries the count, and the empty row needs questions,
reviewed AND sessions all at zero. Such a subject is an ordinary row reading
"1 session · 5 flashcards", no score and no bar, and its info line explains
itself: flashcards don't give a score, answer `MIN_SAMPLE` questions to see one.

The flashcard count shows on EVERY row that has one, scored rows included.
Showing it only until a first question would make it vanish the moment a student
did more work, which reads as the app losing it. "0 questions" is dropped when
flashcards are all there is. Measured at 320px: "1 session · 8 questions · 12
flashcards" still fits on one line.

Verified in a real browser at 320px and 1280px, dark and light: all 11 triggers
open with the right text, stay inside their clip box, add no sideways scroll,
and inherit no uppercase/centring/heading font. Then with a REAL MOUSE at 1280:
each opens on hover and closes on leave with no click; a 60ms-per-tile sweep
opens nothing; a click after hover leaves it open; the pointer can travel into
the popup. And with REAL TOUCH (`hasTouch`) at 320: tap opens, tap again closes,
nothing opens from the touch's own `pointerenter`, a tap inside keeps it open.
No trigger renders a text decoration.

#### Both languages — `features/progress/copy.ts`

The page was hardcoded English until the user asked for it to follow the app's
language "like other pages" (17 Sep 2026), with technical words left alone.
Every string on all seven cards — tooltips and the three sample cards included —
lives in `PROGRESS_COPY`, `{ en, km }`, the pattern `features/streak/copy.ts`
and `features/game/copy.ts` already use. **`km` is typed `typeof en`**, so a line
added in one language and not the other fails to compile. Strings with numbers
in them are functions, because Khmer puts the number somewhere else and has no
plural ("1 វគ្គ · 5 Flashcard", never "sessions").

Decisions a later edit could undo by accident:

- **Latin script is kept for Streak, XP, Flashcard, Quiz, KruAI and AI** in the
  Khmer column — the user's instruction, and the spelling a student meets for
  those terms everywhere else. The Day Streak tile reads plain `Streak` in Khmer;
  the Streak page's own ថ្ងៃជាប់ៗគ្នា is kept for sentences that need the meaning.
- **`uppercase` and letter-spacing are ENGLISH ONLY** (the Overall Readiness
  label, Focus Areas labels). Khmer has no case, and tracking pulls a Khmer
  cluster — consonant, subscript, vowel — visibly apart.
- **Chart day labels in Khmer are the streak screens' initials** (ច, អ, ព…) via
  `weekdayLabel()`; the best-day footer uses full names from
  `utils/khmer-dates.ts`. `summary.ts` stays language-free — its `WeekDay.label`
  is still English, and the chart relabels at render.
- **The bar chart's Khmer short labels** (គណិត រូប គីមី ជីវៈ ប្រវត្តិ ខ្មែរ អង់គ្លេស)
  were measured to fit seven columns at 320px without overlapping.
- **The Study Time tile's unit is drawn SMALL and held on one line** (`Metric`'s
  `unit` prop), like the hero's "%". "2.6 ម៉ោង" at full size wrapped the unit
  onto a second line in a 58px tile and made that tile taller than its three
  neighbours; the "fits" check had missed it, because wrapping is not overflow.
  English reads "2.6h" with a smaller h as a result.
- **`TitleWithTip`** (`components/title-with-tip.tsx`) glues each card title's ⓘ
  to its last word, splitting on the last space — so a Khmer title, which has no
  spaces, is held whole with its icon.
- **Subject names come from `T[lang]`** in `translations.ts`, and the page title
  from `T[lang].progress` — the word the nav already uses for this page.

Verified in a real browser, Khmer and English, 320px touch and 1280px mouse: no
Latin word on the Khmer page outside that list; every tile's value on one line;
all seven chart labels drawn without overlap; nothing new scrolling sideways;
tooltips open in Khmer; and the sidebar's language switch updates the page live.

**Not this page, noticed while testing:** the sidebar's section headings "Main"
and "Features" stay English in Khmer mode.

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
the milestone maths in `utils/streak.ts`); `/streak/friends` is a SHARED streak with one friend,
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

**`PreviewTag` is GONE from this page (17 Sep 2026), at the user's request.** The
hero card is still decoration by request; everything else on the page is real.
Its kicker reads **Battle** (`t.liveGame`, km `ការប្រយុទ្ធ`), no longer "Live
Game" — the key name was kept so no caller moved.

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

#### One budget for the run, plus a per-question STOPWATCH

`MATCH_MINUTES` (10/20/30) is the budget the creator picks, and it covers the
whole run. One budget is what makes two runs comparable — both students had the
same time, so the only difference is what they did with it.

**A per-question COUNTDOWN was built first and removed, and the reason is the
part to keep:** there is no honest number for how long one question should take.
It varies by subject, by question and by student, so any limit would be invented
— and it could contradict the total budget that IS real.

**What replaced it counts UP.** Each question shows how long the student has
spent on it, with no limit and no consequence: information, not pressure. It
tells them what they took without pretending to know what they should have.

Two mechanics behind it:

- **The stopwatch takes the parent’s tick as a prop.** `CompetitionRun` already
  runs one interval for the countdown, so `GameQuestion` reads that `now` rather
  than starting a second timer beside it.
- **It restarts for free.** The child is keyed on the queue position, so a new
  question is a new mount and its lazy `startedAt` is simply the new mount time.
  It freezes on commit so the number stops at what the student took rather than
  creeping through the confirm delay.

`clockLabel()` lives in `copy.ts` and formats both, so a countdown reading `1:05`
never sits beside a stopwatch reading `65s`. **Their labels are what tell them
apart** — Time left / This question.

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
| `/game/review/:competitionId` | both sides' answers + the working photos | hidden | **shown** |

`isGameRunRoute()` is `startsWith("/game/")` MINUS the review, so `/game` stays a
PLACE with its navigation and only the task routes hide it — the same trailing-slash rule
`/lessons/` follows. Both task routes are **static-prefixed**, so the
`/lessons/:lessonId` versus bare `/lessons/:subjectId` ambiguity
`pages/subject-path.tsx` documents cannot arise here at all.

**THE REVIEW IS A FOCUS ROUTE BUT NOT AN ASSESSMENT, and that gap is why
`isGameReviewRoute()` exists.** By the time anyone is on it the score is recorded
and the database refuses a second attempt, so there is nothing left to measure —
and "why is that the right answer?" is precisely the case KruAI is kept reachable
inside a lesson for. It is named directly in `isFocusRoute()` rather than
arriving through `isAssessmentRoute()`, and subtracted from `isGameRunRoute()`.

The seam that leaves is worth knowing: both runs NAVIGATE to the review when they
finish, so the mentor reappears the instant the URL changes rather than the
instant the run ends. That is the right boundary — it is the same moment the
result stops being in progress — but the review is the first screen in the flow
where the FAB comes back.

The two RUN routes are added to **`isAssessmentRoute()`**, which used to be the
placement test alone: a timed competition against a scored opponent measures
rather than teaches, so "a mentor on tap measures the mentor" applies exactly.
Detection is by pathname and never by the store's `focusMode` flag — `use-focus-mode.ts` warns
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

**The hero card is "your latest battle" now (1 Oct 2026, the user's call).** It
was decoration by request until then (`features/game/demo-data.ts`, deleted).
`new-match-card.tsx` shows the NEWER of your last attempt (you vs the creator,
both scores and times, the outcome chip) and your last created competition
(your run vs "waiting for a joiner"); with neither, "No battles yet". The bars
are SCORE bars (score / total), not HP. Every number on the page is real now.

**A CREATOR SEES WHO PLAYED THEM (2 Oct 2026, reported by the user).** The hub
read only the store, and the store only holds a student's OWN runs, so a
joiner's attempt (written by the joiner's device straight to the server) never
reached the creator's hub: Jake's card said "Waiting for a joiner" after Keo
had played, and only the competition's review page knew better.
`features/game/joiner-results.ts` now asks once per hub visit for every
attempt at the student's SHARED competitions (`fetchAttemptsFor`, the review
page's call for all of them at once; the read policy already limits it to the
creator). A module, not a store field (the server is the only source, refetched
each visit; module scope just stops a second visit flashing "Waiting"), keyed by
user id. `matchRows()` in `features/game/game.ts` merges those with the
student's own attempts into ONE newest-first `MatchRow` list from the
student's side, and the hero card, My Game Stats and Recent Games all read it,
so they count the same matches: a joiner beating your challenge is a loss for
you in the stats too. Recent Games marks those rows "Your challenge"; My
Competitions adds "Played by N"; both links carry `?joiner=<id>`, which the
review page takes as its starting pick so it opens on that joiner. Offline, a
guest or Supabase unconfigured: an empty list, and the hub is as before.

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
state** — the `PAST_PAPERS` discipline. `gameQuestionsFor()` falls back
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

**`questions` IS UNTRUSTED INPUT FROM ANOTHER STUDENT, and it was once an XSS
hole.** Nothing on the server checks it — the creator's device writes it — and
joiners render it through `MathText`, which used to pass any `<svg>…</svg>` to
`dangerouslySetInnerHTML` with only `<script>` stripped. An `onload` needs no
script tag, and the session sits in localStorage, so one posted competition
could have acted as every student who played it. Two layers now (28 Sep 2026):
`utils/sanitize-svg.ts` ALLOWLISTS what a diagram needs (tags, attributes,
`url(#local)` only) and drops everything else, for every `MathText` caller; and
`toQuestions()` in `lib/competitions.ts` checks each question's shape and
refuses any containing SVG — the app's own pool has none. `game-play.tsx`
refuses a competition that lost a question in that check rather than playing it
short. Verified in real Chrome: both `math-2025.ts` graphs come out
element-for-element and attribute-for-attribute identical, and 14 payloads
(onload, image onerror, `javascript:` hrefs, `<animate>`, `<set>`,
`<foreignObject>`, `<use>`, remote `url()`…) are all neutralised. **Never
render another student's text through `dangerouslySetInnerHTML` without that
sanitiser in the path.**

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

#### The review: what each side answered, and a photo of the working

A competition used to record that you got 3 out of 5 and stop. That is a score,
not a lesson — it does not say which three, and there is nothing in it a student
can act on. The flow now continues past the verdict, and the user specified the
order: **quiz → result → photograph your working → the app's answers → your
opponent's working.**

**`/game/review/:competitionId` is that whole tail, and ONE ROUTE SERVES BOTH
SIDES.** That works because it is keyed on the COMPETITION rather than on a row:
a student is either its creator or holds an attempt at it, and never both — you
cannot join your own. So the same URL is a joiner's review of the creator and a
creator's review of everyone who took their challenge, with no second route and
no two id spaces to keep straight. Both runs `navigate(..., { replace: true })`
into it, so a back tap lands on `/game` rather than on a spent quiz.

**IT IS ALSO THE DURABLE ARTEFACT.** Recent Games rows and My Competitions rows
are `<Link>`s to it now. That reverses `my-competitions.tsx`'s own header, which
said no row may ever link because the only thing behind a competition is playing
it and playing your own is a race against yourself. True until the review
existed; what a row leads to now is specifically the creator's, never the quiz.

##### Photos are PER QUESTION, several per question — and the step is ONE screen

**It began as one photo per student per competition, and that was the wrong
unit.** A photo of "my whole paper" does not tell a classmate which working goes
with which question, and one answer often runs to several pages. The user caught
it: the exchange is only useful at the level a student actually asks about —
"you got question 3 and I didn't, show me YOUR question 3". So a photo belongs to
a question now, up to `MAX_PHOTOS_PER_QUESTION` (6) each, and on the review every
question card shows its answer and then both sides' working for that question.

**THE STEP IS ONE SCREEN LISTING EVERY QUESTION, not a camera screen per
question.** Per-question photos invite the obvious build — five screens before a
student sees a single answer, including the questions they did in their head.
That forced march was designed out: each question has its own Add photo, a
student photographs the ones that had working and moves on when they choose.

**The picker is `multiple` with NO `capture`, and the pair is deliberate.**
`capture` forces a phone straight into its camera for a single shot — right for
one photo, wrong the moment an answer is three sheets a student already
photographed in their camera app. Without it phones offer camera AND gallery.
Uploads run SEQUENTIALLY, not in parallel: each file is decoded to a full-size
bitmap before it is shrunk, and four at once is exactly what kills the tab on the
cheap handsets this audience has.

**Photos stay BEFORE the answers**, for the reason that was always load-bearing:
once the correct answers are on screen, a photo of "my working" is working that
could be corrected first. AFTER the result, because a failed upload must never
cost a student their score. **Known seam, not closed:** the review route is not an
assessment, so KruAI is reachable on the photo step, and a student could ask it
before photographing. The photo is a social artefact rather than a graded one, and
gating the mentor by a state INSIDE a route would mean borrowing the store's
`focusMode` flag, which `use-focus-mode.ts` warns against.

**"See the answers" is never held while a photo uploads.** The upload state lives
in the PAGE's `useMyWorkPhotos`, not in the step, so revealing the answers does
not unmount it — a photo in flight finishes and appears under its answer.

**Moving on with no photos buys exactly one thing.** A broken camera must not
permanently hide a review already earned, so the answers are always reachable.
The other side's working is not: the reciprocity gate opens on ANY photo, on any
question. **Deliberately not per question** — that would hide your friend's Q3
working precisely when you skipped Q3 because you could not do it, which is the
case the exchange exists for. The screen says so before the student moves on, and
the review says it ONCE above the answers rather than under every question.

**The gate stops the FETCH, not only the render.** `usePhotoList` for the
opponent is disabled until you have shown working, so a student who skipped never
downloads a classmate's photos at all — verified by watching the requests, not the
screen. It remains a UI rule and NOT SQL: in the database it would mean a student
whose upload failed on a dead connection loses access once it comes back.

##### The answers are DENORMALISED onto the attempt, like everything else here

`Competition.creatorAnswers` and `CompetitionAttempt.answers` hold the option
TEXT per question — matching how `correct` is compared everywhere else in this
app, where an index would be a second representation free to drift — with `null`
for a question the clock ran out on, and ALWAYS padded to the full length so the
two sides pair positionally.

The attempt ALSO freezes `questions` and `opponentAnswers`. That is this type's
existing rule taken one step further rather than a new one: it already copies the
opponent's name and score precisely so the history list need not re-read a
competition the joiner has no reason to keep. A review that had to fetch would go
blank on a bad connection, in an app where no other screen does. The cost is
~8KB per attempt, against a list already capped at `MAX_COMPETITIONS`.

**Every new field is OPTIONAL**, so rows already in students' browsers still
open — the screen says the match predates answer recording rather than drawing a
grid where every question looks unanswered. Same reasoning as `sharedAt` and
`opponentId`, and the server columns default to `[]` for the same reason.

**Both are written in the SAME INSERT as the score**, which is what lets the two
tables keep the insert-only shape `20260913000001` argues for: there is no second
write to permit, so neither grows the UPDATE policy that would let a recorded
result be rewritten after someone has been shown it.

##### The bucket, and why no column records a path

`competition-work` is the FIRST STORAGE BUCKET in this project and the first file
BrachNha has ever stored that a student made. It is private, read through
short-lived signed URLs rather than a public bucket's permanent ones.

**THE PATH IS STILL THE IDENTITY:
`{competitionId}/{userId}/{questionIndex}-{photoId}.jpg`**, and nothing anywhere
records a photo. A reader LISTS the student's folder and reads each photo's
question back out of its filename; `PHOTO_NAME` in `lib/competition-photos.ts` is
the only parser and mirrors the policy's regex exactly. Two things follow: no table
needs a write after its insert, and a file under anyone else's folder is refused by
the database rather than by a convention the client could break.

`photoId` is a base-36 timestamp THEN random characters, so ids sort by when they
were taken and "page 1" lists before "page 2" — the folder is listed by name.

**TWO ROUND TRIPS PER STUDENT, NOT ONE PER PHOTO:** one `list`, then one batched
`createSignedUrls`. Signed links are matched back to photos by PATH, never by
position, because the batch response is not promised to be in request order.

`20260916000002` rewrote every policy, because the owner moved from the filename
to the second folder segment. Each ownership test is
`coalesce(folder[2], filename-without-.jpg)`, which is the new owner for the new
shape and the old owner for a file at the old single-photo path — so any such test
upload stays readable and deletable, though nothing in the app shows it any more.
**The database now also enforces what it did not:** at most six photos per
question, a question index the competition actually has (pulled with
`regexp_match`, because Postgres does not promise to evaluate the shape check
before a cast), and one strict filename shape. The first version bounded each
file's size and never how many there were.

**THE COUNT LIVES IN A FUNCTION, AND THE FIRST VERSION OF IT REFUSED EVERY
UPLOAD.** `20260916000002` counted with a subquery on `storage.objects` from
inside a policy on `storage.objects`. Postgres expands a table's row security
while rewriting a query and refuses to meet the same table again inside it —
*"infinite recursion detected in policy for relation objects"* — and it raises
that at REWRITE time, so the policy was created without complaint and then failed
on every insert. Nothing in the app could show it: the screen said "Could not
upload" and the user found it on the first real try. `20260916000003` moves the
count into `public.my_competition_work_count()`, a `SECURITY DEFINER` function —
a function body is planned separately, so there is nothing to recurse into.
**It takes no user id and reads `auth.uid()` itself**, so called directly over
the REST API it can only ever count the CALLER's own photos; a version taking any
folder would leak who has played and uploaded, the exact thing
`listWorkPhotos` is built never to reveal. **The rule to keep: a policy on a
table must never query that same table** — the classic Supabase `profiles` trap,
and it applies to `storage.objects` exactly as to any table of ours.

`lib/competition-photos.ts` now prints the storage service's real error message
to the console **in development only** (`devReport`). That exists because of this
bug — a policy mistake is invisible from the UI by construction, and the Result
contract reduces every error to a reason.

The read policy mirrors the product rule `competition_attempts` already encodes:
your own always; every joiner's if you created the competition; and if you JOINED
one, the creator's **and nobody else's**.

**DELETE is allowed on your own photos; UPDATE is not, any more.** The
single-photo version needed UPDATE so a blurry shot could be overwritten in place.
Every photo has its own id now, so a retake is a delete plus a new file, and a
policy that is not needed is surface that is not there. Deleting takes two taps
on the thumbnail's × (it turns into a red "Delete?"), and deleting your LAST photo
re-closes the reciprocity gate — the confirm says so at that moment only, because
removing one of several pages changes nothing for the other side.

**`useMyWorkPhotos` is the single owner**, held by the page and read by the step
and by every question card. It keeps what the server LISTED apart from what this
visit ADDED and REMOVED, and merges them during render: a new photo shows at once
from the file the phone is still holding (an object URL, revoked on unmount), a
deleted one disappears at once, and nothing re-lists the folder per tap on mobile
data. Its `add` returns how many landed rather than the caller watching state,
because a caller that reads state after awaiting reads the render it started from.
Until a list has actually arrived — slow OR failed — the gate trusts the store's
`photoAt`, so a moment offline does not shut it on a student who showed working.

`usePhotoList` keys its result on WHOSE folder it holds, so switching the creator's
selected joiner cannot show one joiner's photos under another's name while the new
list loads. That "stale key reads as loading" is derived during render, not reset
in an effect — oxlint's `react(set-state-in-effect)`.

`AnswerReview` takes a `renderExtra(index)` slot rather than photo props: it
compares ANSWERS and should not learn what storage or a gate is. It passes only the
index, so the caller's closure never reads into `questions[i]` — the property path
the React Compiler would narrow a memo dependency onto.

**Uploads are compressed client-side first** (`utils/image-compress.ts`): a phone
photographs at 3–5MB, and the audience pays for that twice — once to upload, once
for every classmate who opens it. 1400px on the long edge at JPEG 0.72 is
200–350KB and stays legible; below ~1000px a pencilled fraction starts to mush.
No image library was added, for the reason `scripts/webp.mjs` records. The
bucket's 2MB `file_size_limit` is a hard stop for a caller that skips the
compressor, not the real control. **EXIF orientation is the trap** —
`createImageBitmap`'s `imageOrientation: "from-image"` is what stops portrait
photos uploading sideways, and Safari honours it only from 16; older versions
ignore the option rather than throwing, so a photo lands rotated rather than not
at all.

**Verified against an IN-MEMORY FAKE of the storage API**, intercepted in the
browser with Playwright's `route`, because no automated browser can hold a real
session and the policy migration is applied by hand. That runs the real list →
sign → upload → delete code with only the server faked: three pages picked at once
land on one question with policy-shaped paths, the opponent's photos appear under
the right questions with ONE batched signing call, a skipped student's browser
never requests the opponent's folder, and eight picked pages send exactly six.
**It does not prove the SQL.** The policies were not exercised against a real
project from here; that needs the migration applied and two real accounts.

##### Where it degrades, and what is deliberately absent

The photo UI renders NOTHING when Supabase is unconfigured or there is no
account, and the photo step is skipped entirely — both are supported states (a
fork with no `.env`, the blanked-env screenshot harness).

**`db:check` cannot see `20260916000002`.** It adds no table or column, only
policies, and the publishable key cannot read policies. The symptom of it being
missing is every upload failing with "Could not upload" — the old insert policy
wants the owner in the filename, which the new path no longer has.

**What is still absent is REPORTING someone else's photo**, and that is a real gap
rather than one deferred quietly. The storage policies bound who can see a photo
to the two students in a competition, so the blast radius of anything unpleasant
is one classmate — but there is nothing in the app for that classmate to do about
it except close the screen. A report path needs somewhere for a report to GO,
which this app has no notion of yet: no teacher role, no moderation queue, no
admin. That is the design problem to solve before a real classroom uses this, not
another button.

#### Inviting one friend: the link already existed, only the sending is new

A student who wanted to play against ONE friend had no way to reach them — the
only route into a competition was the public browse list, which is everybody's.

**`/game/play/:competitionId` has been a real linkable route since the joiner
side was built.** Nothing about the mechanism needed building; what was missing
was a way to SEND it. That is the whole shape of this change, and it is why it
touches no schema, no store field, no route table and no policy.

**COMPETITIONS STAY PUBLIC — the user's call, and it is the cheaper right
answer.** A "friends only" visibility column was offered and declined. Worth
recording why it was never urgent: **a stranger playing your competition has
never blocked your friend.** Every joiner is measured against the creator alone
and `unique (competition_id, user_id)` is per person, so the friend can still
play it whoever got there first. The complaint was noise and intent, not
correctness, and a share affordance answers that without a migration.

If it is ever revisited, the honest framing matters: with
`competitions: read all` being `using (true)`, hiding a row from the browse list
is a QUERY FILTER, so it would be **unlisted, not secret**. Real secrecy needs an
invite token and a `security definer` function, because RLS cannot see a URL's
query string. Don't ship the first and call it the second.

**The invite is gated on `shared`, and that gate is the load-bearing part.** A
competition that never reached the server exists on one device, so a link to it
lands the friend on "no longer available" — a failure that surfaces on the OTHER
student's phone, minutes later, with nothing to explain it. Same `sharedAt`
reasoning MyCompetitions uses for its "Not shared yet" label, and it applies in
both places the invite appears.

##### It lives on the HUB ROW, and shipping it only on the posted screen was wrong

The first version put the invite on "Competition created!" alone. That meant it
**existed for about ten seconds and was then unreachable forever** — tap through
and there was no way back to the link. The user found it immediately, and the
diagnosis is that the moment was misjudged: creation is not when you need the
link. Later is, when the friend is actually standing there.

So **`MyCompetitions` carries it**, which is two taps from opening the app. The
row is a `<Link>` to the review and the Invite button is its SIBLING — a button
inside a link is invalid markup, and the invite has to stay independently
tappable so a student can hand the link over without first opening the answers.
Same split `PileList`'s rows already use for their star. The posted screen keeps
its copy; they are two different moments, not a duplicate.

**DELIBERATELY NOT ONLY ON THE REVIEW PAGE**, which was the tidier-looking home
and is the trap: that screen asks for a photo of your working before it shows
anything, so the single route to an invite would have sat behind a gate that has
nothing to do with sending someone a link.

**The shared status moved off the right edge onto the meta line** (`⏱ 10 min · 5
questions · Open for joiners`). It was eating ~90px there, and with a button
beside it the subject name was left with room for roughly six characters at the
320px floor. It wraps rather than truncating — "Not shared yet" is the one thing
on that row a student has to be able to read in full.

**A LABELLED PILL, NOT A BARE ICON.** The complaint this answers was that the
link was hard to find; an unlabelled glyph does not fix that. `t.inviteShort`
exists for exactly this and is short because it sits in a list row.

**One `openId`, not a set.** Two QR codes open at once is two things to scan and
no way to tell which is which, so opening one closes the other.

`InvitePanel` takes a `className` because it now renders in two frames: alone on
the posted screen, where it needs its own card, and nested inside a row that
already is one. `cn()` is twMerge, so `border-0 bg-transparent p-0 shadow-none`
wins over the defaults — the same override-by-className shape `SubjectArt` uses.

`scripts/shots.mjs`' seeded competition carries `sharedAt` for this: without it
the row correctly hides the button and the whole new layout goes unphotographed
at all nine widths.

##### The QR code, and why a dependency was right here

`uqr`, added for this. **That is not a reversal of `utils/image-compress.ts`'s
refusal to take one — it is the same rule giving the opposite answer.** A browser
already decodes and re-encodes photographs, so compressing one needed nothing;
nothing in a browser generates a QR code, and doing it by hand means
Reed-Solomon error correction over GF(256), which is the wrong code to write
from memory.

**NOT `qrcode`, which is the popular one.** Measured before choosing: it depends
on `yargs` and `pngjs` for its Node command-line tool, and a terminal argument
parser has no business in a bundle served to a phone. `uqr` is MIT, has **zero
dependencies** (7 lines in the lockfile, verified), ships its own types, and
returns a raw module matrix rather than markup — which is what lets the SVG be
drawn here.

Four decisions in `invite-qr.tsx` that look arbitrary and are not:

- **DARK-ON-WHITE IN BOTH THEMES. This is the one place in the app that
  deliberately ignores the theme tokens.** A QR is a machine-readable target,
  not a themed graphic: the spec assumes dark modules on a light ground, and
  while modern scanners cope with an inverted code plenty of older ones do not.
  It keeps its own white card on the dark theme. Don't "fix" it to match.
- **The quiet zone is part of the code, not padding.** Four clear modules a side,
  which scanners use to find the symbol's edges. `uqr` defaults `border` to **1**,
  so it has to be passed — the default is the one thing here that looks safe and
  is not.
- **Error correction "M", deliberately not the highest.** Every step up adds
  modules, so the same link is drawn at a finer pitch in the same space, which
  makes it HARDER for a phone camera to resolve. Redundancy is for print that
  gets creased; a screen is clean and lit.
- **One `<path>`, not one `<rect>` per module.** A production URL lands at 37
  modules, so a rect apiece is ~500 DOM nodes for one graphic.

**It is a LAZY BOUNDARY** — `invite-panel.tsx` reaches it through `React.lazy`,
so the encoder downloads on the tap that opens the panel. Same boundary KaTeX,
MathLive and three.js sit behind, and it breaks the same silent way. Verified
twice: `invite-qr-*.js` is its own chunk and the entry chunk contains no
`maskPattern`, AND in a real browser the chunk is requested **0 times before the
tap, 2 after**.

##### Sharing, and the two APIs that may not be there

`navigator.share` opens the phone's own sheet (Telegram and Messenger are how
this audience actually sends things); `navigator.clipboard` is the laptop path.

**A CANCELLED SHARE IS NOT A FAILURE.** Dismissing the sheet rejects with
`AbortError`, indistinguishable from a real error at the call site and
overwhelmingly the common case. Telling a student something went wrong because
they changed their mind is the bug to avoid; nothing is reported either way.

**Both need a secure context and neither exists everywhere.** Share is absent
rather than disabled when missing (`sidebar-nav.tsx`'s `href: null` rule), and
**the URL is always rendered in a `select-all` box** — that is the fallback, not
decoration, because a panel whose only two controls might both be missing needs
something underneath them that cannot be. It is `break-all`, never truncated: a
link that is cut off cannot be read out or copied by hand.

##### What cannot be checked from here

The code encodes `window.location.origin`, so one generated on a laptop at
`localhost` encodes exactly that and a phone pointed at the screen cannot reach
it. **Scanning is a deployed-site test with two phones.** Everything short of
that IS checkable and was: `tmp` harness rendered the real component through
Vite's `ssrLoadModule`, rasterised its SVG in Chrome and decoded it back with
`jsqr` (installed to the scratchpad, never to `package.json`) — both a
production-shaped URL and a `c<base36>` id round-tripped exactly, quiet zone
confirmed at 4. A QR that renders beautifully and encodes the wrong string looks
identical to a correct one, so rendering it is not evidence.

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

`utils/leaderboard.ts` is pure and owns the maths and the wording (utils never
imports from `features/`). Six components:
`leaderboard-view` (state + both observers) → `personal-summary`,
`leaderboard-controls`, `podium`, `ranking-list`, `sticky-user-card`, plus
`sample-mark`.

#### The roster is SAMPLE + REAL + YOU, and the sample rows are NOT marked

The user's call (16 Sep 2026): keep the 29 invented students (25 since four were removed on 29 Sep 2026) so the board looks
full, and add real students beside them. Every invented row carried a visible
"Sample" pill (`SampleMark`) until **29 Sep 2026, when the user had it removed**;
the component and its `sampleLabel` key are deleted. So nothing on screen now
tells a sample row from a real classmate. `fromDemo()` still sets `isSample`,
which no component reads; it is what a mark would key on if it comes back.
Three sources, normalised to one `LeaderboardStudent`
(`stats: Record<period, MetricStats>`) before `rankBoard()`:

| source | built by | marked |
| --- | --- | --- |
| sample cohort, `features/leaderboard/demo-data.ts` | `fromDemo()` | no (was **Sample** until 29 Sep 2026) |
| other real students, `lib/leaderboard.ts` → `use-real-students.ts` | `fromReal()` | no |
| the viewer, from the live store | `localStudentStats()` | "You" chip |

- **The fake "You" row is DELETED.** The viewer's row is their real XP, streak
  and minutes now. The cohort was first authored at 1,300–3,400 XP a WEEK,
  which put every real student at the bottom; it was **rescaled on 29 Sep 2026**
  (the user's call) so that on EVERY tab it stays under 5 days of streak, 2,000
  XP and 2h of study (weekly 385–975 XP, month factor 1.2–1.8, all-time factor
  1.4–2.0). Titles come from all-time XP, so every sample row is now "Beginner".
  Keep new or edited sample rows inside those limits on all three tabs.
- **The viewer is never in the server list** — the SQL function excludes
  `auth.uid()` — so they cannot appear twice, and their own row is always the
  fresher local copy rather than the one trailing it on the server.
- **`public.leaderboard(p_today)` lists non-anonymous accounts with a display
  name.** `is_anonymous = false` is what hides the ~205 screenshot-harness
  accounts without deleting them. Windows are last 7 / last 30 days INCLUDING
  today; all-time XP is `profiles.xp`. **Streak is derived from the three goal
  flags in `daily_activity`, never read from `profiles.streak`** — that column is
  only recomputed on the student's own device at day rollover, so a student who
  stops opening the app would keep their old streak on the board forever.
  `streak_now` follows `currentStreak()`'s ending-today-or-yesterday rule, and
  `localStudentStats()` mirrors the SQL windows so the viewer is measured the way
  everyone else is. `p_today` is the client's LOCAL date, clamped server-side to
  within a day of `current_date`.
- **Nothing waits on the network.** The board paints at once with sample + you;
  real rows slot in when the RPC lands. Guest, unconfigured, loading and failed
  all collapse to "no real rows" — a guest fetches nothing, because the function
  is granted to `authenticated` only and a guest has no business reading
  classmates' names. The anchor observer re-runs on `board.length` too, since
  real rows arriving can move the viewer between list and podium.
- **Real rows carry zero momentum**, so no arrow: nothing records where a real
  student stood last week, and an invented one would be a claim.
- **No page-level `PreviewTag` any more** — a page tag would call the real rows
  sample too. The per-row mark replaced it.
- **Not cheat-proof, knowingly.** Every number was written by the student's own
  device under own-row RLS. Accepted by the user; revisit before the board
  rewards anything.
- **Migration applied by hand**, and `db:check` cannot see a function. Until it
  is applied the RPC 404s and the board is simply sample + you.

Things worth knowing before editing it:

- **Only WEEKLY SAMPLE numbers are authored.** Monthly and all-time XP/minutes are the
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
- **Messaging is forward-only for the current user.** Peer rows show movement
  both ways in one neutral grey; the student's own card renders a change badge
  only while it's positive, and always pairs the rank with a next step. A red
  "down 2" on your own card turns an ordinary quiet week into a public failure.
- **The sticky card is `sticky bottom-0` as the LAST child of the scrolling
  column**, not `fixed` — it floats over the list while there's list left, then
  lands in place at the end. It is unmounted while *either* the summary card at
  the top *or* the student's own row is on screen (two `IntersectionObserver`s,
  the row one re-run on metric/period/roster size because a new board can put a
  different DOM node under the ref); watching only the row floats a duplicate over the
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
Defaults are **XP + Weekly**. Nothing is precomputed — `rankBoard()` re-sorts the
whole roster on every change, which is free at this size and is what stops the summary,
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

**REAL since 1 Oct 2026 (the user's call, reversing the 11 Sep one):** the goal
card reads `tasks` (empty when `tasksDate` is not today), each open task is a
LINK via `features/home/task-links.ts` (shared with Home's Missions card), and
the week is the last 7 days of `activityLog[day].goal`, so it now agrees with
Profile's calendar. The "Complete Today's Goal" button is GONE: it paid nothing
and faked a +1. Confetti fires once per day on the first visit after the goal is
met (`lib/streak-celebrated.ts`, a device fact). `features/streak/demo-data.ts`
is deleted; its two types live in `features/streak/types.ts`. The paragraphs
below describe the prototype and are kept as history.

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

**MISSIONS ARE COMPLETION-ONLY NOW (28 Sep 2026) — NOTHING TICKS ON A TAP.**
This used to say the goal could only be finished by ticking "practice" by hand,
because `PRACTICE_QUIZZES` was empty and nothing real could complete it. Math
1.1's quiz ended that, so Home's checklist rows became LINKS and Roadmap's Done
button was deleted. Every task has a real completion:

| task | completed by |
| --- | --- |
| lesson | finishing a section (`section-detail`) or a legacy lesson |
| practice | finishing a practice quiz (`quiz-screen`) |
| flashcards | finishing a flashcard review (`review-session`) |
| challenge | finishing a Game battle (`game-create`/`game-play`) or an exam (`exam-view`, `paper-screen`) |

`challenge` had NO completion at all before this — only the tap. It is not part
of the streak goal. **If a subject's quizzes are ever all removed, "practice"
becomes impossible again, and with it every streak** — don't bring the tap back;
fix the content.

**Home's Study card is `features/home/study-feed.ts`**, a derived "continue
learning" feed replacing a hand-written list of the legacy lessons. Its catalog
is every item that HAS content — sections with a `/sections/` href, decks with
cards, quiz-path nodes with a quiz, past papers — so new content appears on Home
with no edit there. Order: half-finished decks, decks due again, then the next
unfinished item per subject (subjects most recently worked in first, by
`contentLog` day), then untouched subjects. A student who has touched nothing
gets a RECOMMENDATION instead — each subject's opening item per kind, weak
subjects from the survey first, interleaved across subjects. Home shows
`STUDY_FEED_SIZE` (5). The Missions card links into the same feed, so a mission
and the card beside it point at the same next thing.

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
- **The Khmer month names are HAND-WRITTEN (`KM_MONTHS`, now in
  `utils/khmer-dates.ts`, shared with Progress), not `Intl`.** Desktop
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

### The KruAI greeting bubble (`fab-chat.tsx` + `lib/kruai-hint.ts`)

Asked for (29 Sep 2026) because new students could not tell what the FAB was.
The bubble renders beside the FAB, sharing its `offset` classes, and uses the
user's own wording in Khmer. Three decisions:

- **Stops once found, else after `MAX_SHOWS` (3) visits.** "Found" is tapping
  the FAB or the bubble, or the ×. Ignoring it for 10s (`HINT_VISIBLE_MS`) is
  not "found", so it returns next visit, but never more than three times.
- **A device fact in `localStorage["brachnha-kruai-hint"]`, not a store field**,
  for the reasons `lib/intro-seen.ts` gives. A module-level `shownThisLoad`
  stops a FabChat remount (chat open/close, an assessment) greeting twice.
- **The FAB is NOT faded while the bubble is up.** On Home it lands over a
  lesson row at first paint, where `findControlUnder` fades it; the bubble
  would then point at a see-through button on the exact screen new students
  arrive at. The fade returns when the bubble goes.

## Phase 0: real data everywhere, telemetry, account deletion, photo reports (1 Oct 2026)

The user asked what would make BrachNha "real" before real students. The answer
they approved (the leaderboard explicitly EXCLUDED, they want it kept as is):
replace every remaining demo screen with the student's own data, add error and
usage reporting, and add the two safety pieces an app for minors needs.

### No more invented numbers (except the leaderboard and Streak with Friends)

- **Grade Prediction** — `features/grade-prediction/real-prediction.ts`,
  `buildRealPrediction(input, today)`, a TOTAL object (the React Compiler rule
  from `summary.ts`). Per-subject scores come from `buildProgressSummary()`, so
  Progress and Prediction cannot disagree. Inputs: all-time accuracy from
  `contentLog`, the last 10 exam + past-paper percentages, finished playable
  sections over playable sections (Study paths + quiz paths), days studied in
  the last 14, mean subject trend. `utils/gradeProbability.ts` now takes NULL
  for the first three and re-normalises the weights of what is present.
  `computeGradePrediction` only rows subjects that HAVE a score (a missing
  subject read as 0% predicted an E in a subject not yet started).
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
by two `security definer` functions. Nothing in the app reads them back; the
owner reads them in the SQL editor (queries in `supabase/README.md`).

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
  fix itself is a code edit** that goes through `check:quiz`.
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


## Flashcards and quizzes move into the database (stage 1, 3 Oct 2026)

The plan is `docs/plans/content-in-database.md`; this records what is built. **Stage 1 is
COMPLETE**: step 1a (the tables, the editor, the import, commit `64efc97`) and step 1b
(students read from the database; the code copy deleted). The owner imported
`content/fixture.json` on 3 Oct 2026 and `check:content --live` confirmed 26 of 26 items
exactly. The user's decision that shapes everything below: **only the owner presses Publish.**

Why it exists:
- **Fixing a question took a code change.** The "Fixed" button on `/admin/mistakes` only
  recorded that someone had already fixed it in code.
- **Every student downloaded every deck and quiz before the first screen.** `index.html`
  modulepreloaded `practice-*.js` (349 KB raw, 62 KB gzip). Step 1b removed it.

This **reverses "Content stays in `src/data/`"** for these two kinds only. Sections (stage 2)
and past papers (stage 3) stay in code until their own stage.

### The database: `20261003000001_content_in_database.sql`

| table | holds | read by | written by |
| --- | --- | --- | --- |
| `content_items` | one row per deck or quiz: `kind` (`deck`/`quiz`), `key`, `version` (null = not published), `item_count`, `item_ids` | anyone, guests too (published rows only) | functions only |
| `content_versions` | every published version, never changed: `body` jsonb, `published_at`, `published_by` | anyone, every version | functions only |
| `content_drafts` | at most one draft per item, `base_version`, `updated_at`, `updated_by` | nobody directly | functions only |

`content_items` is the MANIFEST step 1b's phones download. A body is fetched by
`(kind, key, version)`, which never changes, so a phone keeps it for ever. Every version
stays readable so a student reopening an old quiz attempt can load the version they took.

**Bodies.** A deck is `[{ id, front, back }]`; a quiz is `[{ id, scenario?, q, options,
correct, explanation, help? }]`, the `SectionQuestion` shape (which gained an optional `id`)
plus a stable id. Types: `ContentKind`, `DeckCardBody`, `QuizQuestionBody` in
`types/index.ts`.
- **Card ids are kept for ever** (`biology-1-1-3`). Review history is keyed by them, so a new
  card takes a number outside every id any version ever used (`admin_content_get`'s
  `used_ids`, `newCardId()` in `features/admin/content-edit.ts`). A reused id would hand an
  old card's history to a new one.
- **Question ids are `q1`, `q2`…**, assigned at export in today's order, never reused. Step 1b
  makes mistake reports name a question by it (`quiz:math-1-1-1#q3`; `REF_PATTERN` already
  allows it), so a report survives the questions being reordered.
- **jsonb reorders object keys.** A body read back is equal but not byte-identical. Every
  comparison (`check-content.mjs --live`, `sameBody()`) sorts keys first.

**Functions** (SECURITY DEFINER, `set search_path = ''`, refusals carry a `hint`):

| function | who | notes |
| --- | --- | --- |
| `content_current(kind)` | anyone | every current body of one kind, for KruAI's server and `/practice/review` (1b). Security invoker |
| `admin_content_list()`, `admin_content_get(kind, key)` | admin | get returns `{ published, draft, used_ids, versions }` |
| `admin_save_content_draft(kind, key, body, expected)` | admin | `expected` = the draft's `updated_at` as loaded (null = none); anything else is `stale` |
| `admin_discard_content_draft`, `admin_restore_content_version` | admin | same `stale` rule; restore copies an old version into the draft |
| `admin_publish_content(kind, key, expected)` | **owner** | `owner_only` for anyone else; publishes exactly the draft that was reviewed |
| `admin_unpublish_content(kind, key)` | **owner** | `version` → null: students see "coming soon"; versions kept |
| `admin_import_content(items, publish)` | **owner** | all or nothing on shape; per item `published` (never published + `publish`), `draft`, or `skipped` (a draft exists). Never replaces a published version |

**Two levels of checking, on purpose.** A DRAFT only needs unique ids
(`content_draft_problem`), so half-finished work (a card with no back yet) can be saved. The
full shape check (`content_body_problem`: types, lengths, 2–6 distinct options, `correct`
among them, help's exercises too) runs at publish and import. The helpers are revoked from
every client role.

### The checks students' content must pass: `src/utils/content-check.ts`

ONE set of rules, used by the editor live, by `scripts/check-content.mjs` and by
`scripts/content-export.mjs`. They are `check:quiz`'s and `check:digits`' rules moved to
where the content is now written, because neither script can see the database: every `$…$`
typeset with KaTeX (`throwOnError`), no Khmer inside a formula, no stray `$` (except `$20`
money), `correct` among the options, no duplicate options, **no Khmer numerals, no em
dashes**, a bare `ក. ` option counts as empty. Two WARNINGS that never block: ក. ខ. គ. ឃ. out
of order, and correct answers bunched on one letter (`answersBunched`, the AGENTS.md
distribution rule). KaTeX answers are cached per formula, so re-checking a long maths quiz on
every keystroke stays fast.

**KaTeX's chunk changed NAME because of this.** content-check imports KaTeX directly, so
Rolldown now emits the shared KaTeX chunk as **`math-render-*.js`** (≈261 KB raw, 78 KB gzip),
not `math-text-*.js` (now 4 KB, the component only). It is still lazy and still absent from
`index.html`'s preloads. **Check the KaTeX chunk by content (`renderToString`), not by name.**

### The editor: `/admin/content`

- `pages/admin-content.tsx` (list) and `pages/admin-content-edit.tsx`
  (`/admin/content/:kind/:key`, `?q=q3` opens a question). Lazy, NOT in `routeModules`, like
  every admin page. Chunks: `admin-content-*.js`, `admin-content-edit-*.js`, `content-slots-*.js`.
- **Slots come from the curriculum** (`features/admin/content-slots.ts`): decks from
  `chaptersFor()` over `FLASHCARD_SUBJECTS`, quizzes from `quizPathFor()` sections or
  `chaptersFor()` lessons. "New" only offers empty places a student can reach; a key is
  never typed. A stored key with no slot (history's `-1-1-1` aliases) is named by subject and
  numbers.
- **The working copy** lives in `content-editor-view.tsx`; card and question parts are in
  `content-item-editors.tsx`. The correct answer is a radio beside each option, so it can
  never be missing, and editing the correct option's text carries `correct` along. Fields with
  maths show a live `MathText` preview; Preview shows a card or question as students see it.
- **Checks** run from a `useDeferredValue` copy, tidied first (`tidyBody()`: empty optional
  fields dropped, blank rule lines removed). Errors disable Publish; the list of problems
  jumps to the item.
- **Save draft** (any admin), **Publish** (owner; saves first if there are unsaved changes),
  **Undo my changes**, **Discard draft**, **Hide from students** (owner), and a version
  history with **Restore as draft**. Removing an item or confirming a destructive action
  takes two taps. Leaving with unsaved changes asks first.
- **Import** (owner, on the list): a JSON file is checked in the browser with the same rules
  before it is sent; "publish items never published" is for the one-time move only.
- The yellow "students still see the code's copy" note on the list is gone (step 1b).
- Copy is bilingual in `features/admin/content-copy.ts`; the hub's sixth tool card is
  Content (six cards, none spanning: md 3×2, xl 2×3).
- **Everything explains itself on hover or tap** (3 Oct 2026, the hub's pattern), from
  `tips` and `issueHelp` in `content-copy.ts`:
  - the list: an ⓘ on the New and Import panels and beside the publish-on-import box, and a
    legend above the rows whose three chips (Live, Not published, Draft) are the triggers.
    **The chips on a row cannot be**: a row is a `<Link>`, and a button inside a link is
    invalid, so the legend explains them once in the same colours;
  - the editor: the item's key, the "who sees what" line, Checks, Versions, one ⓘ for all the
    action buttons, a card's id, and every field that is not obvious (front, back, situation,
    options, explanation, the help parts);
  - **every problem line under a field is a trigger saying how to fix it** (`issueHelp`, one
    per `IssueCode`, typed `satisfies Record<IssueCode, string>` so a new code fails to
    compile without one). The lines in the Checks card stay jump buttons.
- **`TextField` is a `<div>` with a `<label htmlFor>` now, not a wrapping `<label>`**: a
  button inside a label that already holds the textarea is a second labelable element in it.
  The publish-on-import ⓘ is a SIBLING of its checkbox's label for the same reason; clicking it
  does not tick the box (checked in the browser).
- **The ⓘ's tap area is `-m-1 p-1`**, so where it ends a shrink-wrapped box (the options
  `<legend>`, the help title, the import row) that box carries `pr-1`/`mr-1` to contain the
  4px. Without it the page does not scroll, but the strict overflow check flags the box.
- **The sentences are claims about the rules** (`content_body_problem`, the checks in
  `utils/content-check.ts`, who may publish). Change a rule, change its sentence, in both
  languages.
- Verified in the browser against the faked functions: 40 checks (every trigger opens the
  right text inside the screen with a mouse at 1280 in English and a finger at 320 in dark
  Khmer, labels still focus their boxes, no sideways scroll, no page error), and the earlier
  45-check editor run still passes.

### Moving the content, and new content afterwards

- `content/fixture.json` is what the database was filled from: 17 decks (192 cards) and 9
  quizzes (98 questions), exported from the code on 3 Oct 2026 before the code was deleted.
  It is now the DEVELOPMENT FIXTURE (below). `npm run content:export` refreshes it by
  DOWNLOADING what is published (`content_current`, publishable key from `.env`), checked
  with the same rules; it no longer reads code, since there is none.
- `npm run check:content` checks every `.json` under `content/`; `-- --live <file>` downloads
  what is published (`content_current`, publishable key) and compares item by item. That is
  the proof the import arrived exactly.
- **The database is the only copy.** New decks and quizzes are written as JSON under
  `content/new/`, checked with `check:content`, imported by the owner as drafts, reviewed,
  published, and the file deleted. **`content/README.md` holds the authoring rules** that
  used to sit in the headers of `data/quizzes/*.ts`: the distractor rules, the LaTeX and
  Khmer rules, keys and ids, and where the first content came from.

### Verified

- PGlite, the migration applied twice after `20261002000001`/`0002`: **95 checks** (keys and
  shapes at save vs publish, `stale`/`missing`/`owner_only`, versions 1→4 through
  publish, restore and unpublish, `used_ids`, import outcomes and all-or-nothing refusal,
  guests read only the manifest and versions, no client role can write or call a helper), plus
  the real `fixture.json`: all 26 items publish as version 1 and read back identical.
- Browser, Supabase faked through Playwright `route` with an in-memory copy of the
  functions' rules: **45 checks** at 1280 owner, 390 admin and 320 dark Khmer owner (import
  with the browser-side check, list and names, edit with the correct answer following its
  option, an em dash blocking Publish, save/publish/restore to version 3, new ids q11 and
  biology-1-1-7 after removing card 2, stale refusal, hide, an admin's draft with no Publish
  or Import, a student refused and never calling an admin function, no sideways scroll, no
  page error).
- The build: no admin or checker code in the entry chunk; KaTeX lazy (above).

### Step 1b: students read from the database

**`src/lib/content.ts` is the whole client side**, and it downloads two things:

- **The manifest** (`content_items`, published rows only): kind, key, version, count, and a
  deck's card ids. A plain `fetch` with the publishable key, like `lib/announcements.ts`, so
  guests read content and never download the SDK. Once per app load, and again after 30
  minutes in the background. Kept in `localStorage["brachnha-content"]`, so a returning
  phone has it at once and an offline open still knows what exists.
- **A body** (`content_versions`, by kind + key + version), only when a deck or quiz is
  OPENED. A published version never changes, so it is stored for good in **Cache Storage**
  (`brachnha-content-v1`, keyed `https://content.brachnha.invalid/{kind}/{key}/{version}`, a
  name only, never fetched). NOT the service worker, which still caches only
  `offline.html`. Without Cache Storage (an insecure origin) bodies live in memory.

Read through `useContentManifest()`, `useContentBody(kind, key, version)` and, for the two
screens that need every body of a kind, `useAllBodies(kind, manifest)` (Daily Review, the
admin's mistakes page): whatever the phone holds is reused and the rest comes in ONE
`content_current` request. Module state behind `useSyncExternalStore`.

**`src/utils/content-manifest.ts` holds the pure side** (the `ContentManifest` type,
`deckEntry`, `quizCount`, `entryVersion`, `toPracticeCards`). **The manifest is passed as an
ARGUMENT to every function that decides what exists**: `quizPathFor(subject, manifest)`,
`practiceLessonsFor(subject, mode, manifest)`, `readyLessonCount`, `readyQuizSectionCount`,
`buildStudyFeed`, `buildRealPrediction`. A helper that read module state on its own would be
memoised around by the React Compiler and keep its old answer after the manifest arrived.

**What only COUNTS downloads no lesson.** The manifest carries each deck's card ids, so
Home's study feed, Progress's study tips (`gradedDueCount`) and Grade Prediction work from it
alone; `deckStates()` in `features/practice/review.ts` pairs ids with review states without
the cards. `cardsFor`, `dueCardsFor`, `allCards` and `allDueCards` take the official cards as
an argument now.

**`quizPathShape(subject)` vs `quizPathFor(subject, manifest)`.** The path's STRUCTURE stays
in code (`features/practice/quiz-path.ts`) with every `href` null; `quizPathFor` adds a link to
each section the manifest says is published. `findQuizSection` and the admin's slots
(`content-slots.ts`) read the shape.

**The states a student can see**, all in `features/practice/components/content-waiting.tsx`:
a quiet "កំពុងទាញយក…" while something downloads (no skeleton bars), and, on a FIRST open
with no network, a sentence saying the first open needs internet, with Try again. The
runner's version is a FocusLayout with its X, because a focus route has no navigation.
**`pages/practice-run.tsx` redirects only once the manifest has ANSWERED** that an item is
missing, never while it loads.

**Quiz attempts record their version** (`QuizResult.version`, optional; absent = version 1,
which is what the code copy became). `QuizScreen` reopens an older attempt through
`OlderVersionResults`, which downloads THAT version, because answers are index-aligned with
the questions the student saw. A retake runs the current version.

**Mistake reports name a quiz question by its id** (`quiz:math-1-1-1#q4`):
`quizRef(key, question, index)`. Older reports by position still resolve.
`features/admin/content-ref.ts` takes the quizzes as an argument (`useAllBodies("quiz")` on
the page), and a quiz report's card has an **Edit** link to
`/admin/content/quiz/{key}?q={id}`. "Fixed" now means fixed there, for quizzes.

**KruAI reads the decks from the database**: `server/content-source.ts` fetches
`content_current('deck')` with the publishable key and keeps it 10 minutes per instance (one
retry a minute after a failure, 3s timeout). `buildSystemPrompt`, `buildCatalogBlock` and
`pinnedContextFor` take a `DeckMap` argument, so `chat-prompt.ts` stays pure and alias-free.
**Unreachable means no deck list, never no answer.** The client still sends only a key.

**The deck request starts the moment a question arrives** (`decksPromise` in
`handleChat`, right after the body is validated) and is awaited only where the prompt is
built, so a cold copy's round trip (measured 0.7 to 1.6 s for the whole 75 KB of decks)
runs in the shadow of the sign-in and daily-limit checks instead of after them. Safe
because `publishedDecks()` never rejects: a request refused before the await leaves no
unhandled rejection, and a refused or curated question just warms the copy for the next
one. Don't move the call back down beside `pinnedContextFor`.

**Development without Supabase reads `content/fixture.json`** (`import.meta.glob` behind
`import.meta.env.DEV`), so a fork and `scripts/shots.mjs` (run with the variables blanked)
still show content. Production builds drop the branch: the fixture's text is in no chunk of
`dist/` (checked).

**Home prefetches the likely next tap**: at idle, the bodies of the top 3 decks or quizzes
on the study card (`use-study-feed.ts`), once per version like any other body.

**Deleted:** `src/data/practice.ts` and `src/data/quizzes/*.ts`. `check:quiz` no longer checks
practice quizzes (`check:content` and the editor do).

**Bundle, measured on the same machine:** what the first screen downloads (entry + every
modulepreload, gzip) went **305 KB → 245 KB**. The 62 KB practice chunk is gone from the
preloads; the entry grew about 3.5 KB for the loader. The SDK is still its own lazy chunk.

**Verified:**
- Browser, the database faked through Playwright `route` with the real fixture as content:
  **34 checks** at 390 light, 320 dark Khmer and 1280. The hub and lists come from the
  manifest with no body downloaded and no SDK for a guest. Opening a deck downloads only that
  deck, and its review history stays attached. Reopened with downloads blocked, it comes from
  Cache Storage; with the manifest unreachable, the hub opens from the phone's copy. The Daily
  Review uses one request; Progress downloads nothing; Home prefetches its top two decks. A
  republished quiz opens on version 2 while an old attempt reopens on version 1. A report
  names `#q1`. The owner's mistakes page resolves `#q2` and an old `#3` with Edit links. A
  first open offline shows the notice and Try again recovers. No sideways scroll, no page
  error.
- The 1a editor run (46 checks) and the explanations run (40) still pass.
- KruAI through `ssrLoadModule` against a fake `content_current`: **7 checks** (17 decks read,
  the second question reuses the copy, the catalog and an open deck in the prompt, an
  untrusted key gives nothing, an unreachable database gives no decks in 4ms and the prompt
  still builds).
- The real `handleChat` against a fake Supabase where the deck request and `kruai_take`
  each take 600ms: **8 checks**. The model is reached at 680ms (one wait, where two would
  be 1,200), the open deck still reaches the prompt, a warm instance makes no deck
  request, a refused request and a failing deck request leave no unhandled rejection,
  and KruAI still answers with the deck request failing.
- A dev server with Supabase blanked opens a quiz and a deck from the fixture with no
  database request (4 checks).

## Installable app: "add to home screen" and the two pop-ups

BrachNha is an installable web app (PWA). None of this touches Google sign-in:
the OAuth consent screen's brand review covers what is uploaded to Google Cloud
Console, and a manifest is just a file on our own site. There is no store
review unless the app is ever wrapped for the Play Store.

| file | role |
| --- | --- |
| `public/manifest.webmanifest` | name, colours, icons; what makes the site installable |
| `public/icons/*` | 192/512 `any`, 512 `maskable`, 180 `apple-touch-icon`, rendered by `scripts/app-icons.mjs` |
| `public/sw.js` | the service worker browsers require before offering install |
| `public/offline.html` | what an installed app shows when opened with no signal |
| `src/lib/install-prompt.ts` | catches the install event and decides when the pop-up may show |
| `features/install/components/install-prompt.tsx` | the pop-up; mounted in `AppShell` |

**THE SERVICE WORKER CACHES NOTHING BUT `offline.html`, on purpose.** Every JS,
CSS, `/api/chat` and Supabase request passes through untouched: the handler
returns without `respondWith` for anything that is not a page navigation.
Caching the app shell would serve yesterday's build after a deploy, and this
app has no reason to take on that class of bug. Navigations are network-first
with navigation preload (so the worker adds no load time) and fall back to the
offline page only when the fetch throws. An OAuth callback is a navigation and
goes to the network like any other. Bump `CACHE` when `offline.html` changes.
The worker is registered in PRODUCTION ONLY (`registerServiceWorker()`, called
from `main.tsx` on `load`), so `vite dev` never has one in front of it. Test
install with `npm run build && npx vite preview`.

**What a page can and cannot do.** On Android Chromium we keep
`beforeinstallprompt` and call `.prompt()` from our own button, and the browser
shows its real dialog, but only on a tap. There is no way to install
automatically. iOS has no API at all, so the pop-up shows the two manual steps,
with Apple's menu names kept in English because iOS has no Khmer UI and that is
what the student actually sees. In-app browsers (`isInAppBrowser()`) and an
already-installed app (`isInstalledApp()`, now exported from
`utils/in-app-browser.ts`) get nothing.

**Two moments, both requested by the user:**

- **`"open"`**: 1.5s after the app opens (`OPEN_DELAY_MS`). Once per page load.
  "Not now"/"Got it" snoozes it for `OPEN_SNOOZE_DAYS` (3) so a student is not
  greeted by the same pop-up on every visit.
- **`"lesson"`**: after finishing a lesson or a section. `markLessonFinished()`
  is called beside `completeSession` in `lesson-detail.tsx` and
  `section-detail.tsx`; practice quizzes are deliberately left out. Once per
  device, ever. It outranks the open pop-up, and closing either one consumes the
  other for that page load, so two never arrive back to back.

**It never interrupts a task.** `AppShell` passes `suppressed = hideChrome ||
chatOpen || pledgeOpen || authPrompt`, and `hideChrome` already covers lessons,
exams and the roadmap lock. A suppressed pop-up is HELD, not dropped: the
lesson one waits through the completion screen (which is focus mode) and
appears once the student leaves it. It is mounted only in the ordinary-app
branch of the gate, so the entry, login and survey screens never show it.

**The state is a MODULE, not store fields.** `beforeinstallprompt` can fire
before React mounts, so the listener has to exist from the moment the entry
chunk evaluates, which is why `main.tsx` imports the module. And "snoozed" and
"lesson pop-up seen" are device facts, not account data: as store fields they
would sync to Supabase and lengthen the `partializeState` ↔
`syncRelevantChange` list for nothing. They live in
`localStorage["brachnha-install"]`, with every access wrapped. The component
reads the module through `useSyncExternalStore`, whose snapshot is rebuilt only
in `emit()`; returning a fresh object on every read would loop forever.

**The icons remove the artwork's own tile.** The master SVG is an app-icon tile
with rounded corners and a grey shadow baked in. Launchers round icons
themselves, so shipping it would draw a tile inside a tile.
`scripts/app-icons.mjs` whitens every low-chroma pixel (the drawing is all
saturated colour and the tile edge is grey), and shrinks the maskable icon to
0.8 so it survives any launcher mask. Re-run it if the artwork changes.
`public/favicon.ico` is still the old icon and was left alone.

**Verified** against the production build in real Chrome. The manifest reports
no errors, and the only installability error was `in-incognito`, which comes
from the automation context. The offline page is served for a navigation with
the network off. A synthetic `beforeinstallprompt` shows the open pop-up after
the delay, Install calls `.prompt()`, and the snooze holds across a reload. An
iPhone UA shows the steps at 320px light and 390px dark with no sideways
scroll. A Telegram-shaped webview UA shows nothing. The lesson pop-up is held
inside `/sections/...` and appears once, after leaving. **Not verified: a real
install on a real phone.** That needs the deployed site, because the install
event only fires over https.

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
see its section above. Its decks and quizzes are published from Admin → Content
(the database since 3 Oct 2026); a lesson with nothing published is still a
`ឆាប់ៗនេះ` placeholder, by design.

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
  the TeX rule that inline math may not be hugged by whitespace. It now forgives
  padding around unmistakable TeX (`$ x^2 $` renders), but a padded `$ x $` is
  still refused — so get this backwards and the simplest inserted formulas
  silently stop rendering.
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

**SUPERSEDED 1 Oct 2026: of the screens below, only the Leaderboard's sample
cohort and Streak with Friends are still demo.** Grade Prediction, all of
Progress, the Streak page and the Game hero run on real data now (see "Phase 0"
near the end of this file). The original decision, kept as history:
**Grade Prediction, Leaderboard and Streak intentionally use fake, fixed demo
data** (`features/*/demo-data.ts`), not live store data. An explicit user
decision to avoid edge-case bugs (e.g. a brand-new user with zero exams breaking
a chart). The files have comments noting what real data would need to exist
(per-subject score tracking, a daily activity log) before switching over.

**PROGRESS HAS LEFT THAT LIST — mostly.** Four of its seven cards run on the
student's own `contentLog`/`activityLog`/`examResults` now, and the edge cases
this decision was taken to avoid were handled rather than avoided (see its own
section). Three cards are still demo; the page's tag was removed anyway, at the
user's request (17 Sep 2026). The
"per-subject score tracking" that entry names as the blocker is the thing that
got built.

**THE LEADERBOARD HAS LEFT IT TOO — by mixing, not replacing.** Its blockers
(cross-student reads, a daily log, active minutes) all exist now, and the user
chose to keep the sample cohort beside real students rather than drop it (the
per-row "Sample" mark it shipped with was removed on 29 Sep 2026). The viewer's own row is real. See its
own section.

**"Demo data" means demo NUMBERS. It never licensed inventing a CURRICULUM.**
Progress had a geography bar for a subject the app does not teach, which no
amount of "the numbers are fake anyway" excuses — a student reads it as a claim
about what BrachNha covers. Its subject list is derived from the catalog now (see
the Progress section above); a demo screen that names subjects, lessons or exams
must take that list from `allSubjects()`, `chaptersFor()` or the equivalent, and
invent only the figures hung off it.

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
line under the title on Streak with Friends. (Grade Prediction lost it on
1 Oct 2026, when it went real.) **Game and
Progress no longer carry it** — both removed at the user's request (17 Sep 2026)
although Game's hero card and three Progress cards are still demo; those are the
two recorded exceptions. Added
11 Sep 2026 because Progress's top row said 1,240 XP and a 12🔥 streak and the
Leaderboard's "You" row 2,430 XP, a few pixels under the bar's real numbers, and
the user could not tell which were real. Labelling was chosen over making those
numbers real — **on Progress that was then reversed and the numbers were made
real (16 Sep 2026), so the top row no longer contradicts the bar.** The tag was
kept for the three cards still demo until the user had it removed (17 Sep 2026).

**The Leaderboard LOST its page tag (16 Sep 2026)** when real students joined the
sample cohort: a page-level tag would call the real rows sample too. It carries a
per-ROW "Sample" mark instead, and that mark was removed too (29 Sep 2026, at
the user's request), so the board is now the third recorded exception beside
Game and Progress: invented rows, no label.

**The tags ARE the list of what is still fake** — a new
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

**The Study Activity heatmap's dates are derived** — same pattern as
`daysUntilExam()`. Its COUNTS were hand-authored demo numbers until 1 Oct 2026
and are now `heatmapCounts(contentLog)`, and `utils/activity-heatmap.ts`'s
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

### The state model — guest is the default, not a choice

**THE SUPABASE SESSION IS THE ONLY PROOF OF AUTHENTICATION.** Everything else is
routing.

| | `authStatus` | `authUser` | `isGuest` |
| --- | --- | --- | --- |
| Loading | `"loading"` | `null` | `false` |
| Authenticated | `"ready"` | the flattened session | `false` |
| Guest | `"ready"` | `null` | `true` |

**THERE IS NO ENTRY SCREEN (2 Oct 2026, the user's call).** A new student sees
the three intro screens and lands on Home as a guest. There used to be a door
between them (Google or "Continue as Guest") and a persisted `guestMode` flag
recording the choice; both are deleted, along with `continueAsGuest()` and
`entry-view.tsx`. `isGuest` in `hooks/use-auth.ts` is now DERIVED: `status ===
"ready" && !isAuthenticated && isSupabaseConfigured`. The `ready` is what keeps
a returning signed-in student from seeing the guest card on Profile while their
session loads. Signing in happens where an account is needed: the login prompt
(KruAI, Roadmap, Battle) and Profile's guest card, both through `GoogleButton`.
Logout and "exit guest mode" now land on Home as a fresh guest.

`authStatus`, `authUser`, `authPrompt` and `accountConflict` are **excluded from
`partializeState`**, exactly like `chatOpen` — re-derived from Supabase on every
load. Only `syncedUserId` persists. `hooks/use-auth.ts` is where every question
about identity is answered.

**A GUEST HAS NO `userName`, deliberately.** A placeholder like "Guest" in the
store would reach `profiles.display_name`, the leaderboard and the pledge
signature — and survive a later Google sign-in, leaving the student permanently
named "Guest". `useDisplayName()` supplies the fallback at render time instead.

**No persist `version` bump for removing `guestMode`.** An old payload still
carrying it has the key spread into state by `merge()`, where nothing reads it,
and `partializeState` no longer lists it, so the next write drops it.

**The privacy link moved with the door.** The entry screen was where Google's
requirement (the policy reachable where a student decides to sign in) was met,
so `/privacy` is now linked under the Google button in the login prompt and on
Profile's guest card.

### The gate, in `app-shell.tsx`

A ternary chain, in priority order, kept as JSX rather than early returns so
nothing above it closes over a possibly-null `authUser`:

```
loading, no local name                            -> <AuthSplash/>
conflict pending                                  -> <AccountConflictView/>
intro not seen, no name, not signed in            -> <IntroView/>
authenticated, no name                            -> <LoginView/>   (prefilled)
authenticated, not surveyed                       -> <SurveyView/>
                                                  -> the app (a guest if signed out)
```

Three things there are load-bearing and easy to undo:

- **`hasFullAccess` is true when Supabase is UNCONFIGURED**, which skips the
  whole chain. With no project there is no account to have, no server to protect
  and no AI credits to spend — the same degradation the mentor already does for
  a missing `GEMINI_API_KEY`. It is also what keeps `npm run preview`, a fresh
  fork and `scripts/shots.mjs` working with **no change to the screenshot seed**:
  the documented blanked-env command was already the right one.
- **The splash renders only for a student with no local name.** That is the
  OAuth callback case: without it, a student coming back from Google would see
  Home flash before `LoginView`. With no auth traces the session settles in the
  mount effect, so for an ordinary guest it lasts one frame. Gating the whole
  tree on "loading" would put an import — and, for an expired token, a network
  round trip — in front of first paint for every returning student. See the top
  of `lib/supabase.ts` for why that is not affordable.

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
session, skip the import" would have left every student straight back in
guest mode with nothing in the console.

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

### Links arrive from Telegram, and an in-app browser cannot sign in

Most students meet a BrachNha link in a chat app, which opens it in that app's
own webview rather than Chrome or Safari. The webview has its **own cookie jar**,
so the Google session already on the phone is not in it — Google answers the
OAuth redirect with a bare email-and-password form instead of the account
chooser, and increasingly refuses the embedded user agent outright
(`disallowed_useragent`). **None of that is fixable from inside the webview**, so
the app detects it and asks to be reopened in the real browser.

`utils/in-app-browser.ts` decides, and `features/auth/components/open-in-browser.tsx`
is what the student sees.

**IT LIVES INSIDE `GoogleButton`, NOT IN THE GATE (2 Oct 2026).** It used to be a
whole screen standing in for the entry screen, which blocked the app entirely
for a Telegram visitor. With the entry screen gone, a Telegram visitor sees the
intro and uses the app as a guest like anyone else, and only meets "Open in
browser" where sign-in is offered: `GoogleButton` renders `OpenInBrowser` in
place of Google when `isInAppBrowser()` (read once at module scope). That one
switch covers the login prompt, `LockedFeature` and Profile's guest card. It is
two components rather than an early return so neither calls hooks
conditionally. Nothing can touch an OAuth callback, because nothing in the gate
looks at the browser any more.

**TWO KINDS OF SIGNAL, because Telegram stamps nothing.** Named UA tokens
(`FBAN`, `FB_IAB`, `Instagram`, `MicroMessenger`, `Zalo`, `Line/`…) are the
strongest evidence where a vendor provides one. Telegram provides none, so it is
caught by SHAPE: on Android the platform's own `; wv)` WebView marker, and on iOS
a WKWebView's missing `Version/`+`Safari/` pair. Those two heuristics are the
only part that can produce a false positive, and **a false positive is strictly
worse than a false negative** — it strands someone whose browser was fine behind
a button with nothing to do. Hence the exclusions: iOS Chrome/Firefox/Edge/Opera
by token, desktop never by heuristic, and **an installed PWA is checked for
explicitly** (`navigator.standalone` / `display-mode: standalone`) because an iOS
home-screen app has no `Safari/` either — without that, installing BrachNha would
permanently replace it with a screen telling the student to open it in a browser.

**A CHROME CUSTOM TAB IS CORRECTLY NOT FLAGGED.** Several Android apps open links
that way instead of in a WebView, and a Custom Tab *is* Chrome with Chrome's
Google session — sign-in works, so the student must not be interrupted.

**NO PAGE CAN FORCE AN EXTERNAL BROWSER, and both mechanisms fail SILENTLY.**
Android gets an `intent:` URL (the platform's documented hand-off, with
`S.browser_fallback_url`, and deliberately **no `package=`** so the student's own
default browser wins rather than Chrome being forced); iOS gets
`x-safari-https://`, which reaches Safari and nothing else — there is no
equivalent for a non-Safari default. Both schemes are *requests* the host app may
drop, with no event either way, which is why `openInExternalBrowser` returns
nothing and the screen reveals its manual instructions **from a timer** rather
than from a result it will never receive. Don't add a success/failure return: it
would be a lie. Both branches preserve the URL's own scheme, so a `localhost` dev
build is not silently upgraded to https.

`externalUrl()` keeps the path and query — a link to a lesson must reopen on that
lesson — and drops two things on purpose: the **OAuth parameters** (an
authorization `code` is single-use and bound to a PKCE verifier in *this*
webview's storage, so carrying it over can only produce a failed exchange) and
the **hash** (Android's `intent:` URLs need the fragment for their own payload,
and nothing here routes on it).

**No Google button inside a webview** — it leads back into the thing that does
not work. The link sits in a `select-all` box rather than behind a copy button,
the shape `features/game`'s invite panel already uses. A guest's progress in the
webview stays in the webview: localStorage is per-browser, so switching to the
real browser to sign in starts that browser fresh.

**Verified against 26 real user-agent strings** (both directions, plus the PWA,
the Telegram JS bridge and iPadOS-reporting-as-Mac) and then in real Chrome under
spoofed UAs (that was the full-screen version; re-checked 2 Oct 2026 after the
move: a Telegram UA goes intro → Home, the login prompt shows Open in Browser
with no Google, and the help text appears after the tap). The intent URL
carries the path and query, and 320px Khmer in both themes has no sideways
scroll.
**Scanning the real thing still needs two phones** — a spoofed UA proves the
detection, not that Telegram honours the intent.

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

## The LaTeX rules reached Gemini garbled — FIXED (17 Sep 2026)

This section used to be "Known bug, NOT yet fixed". It was fixed, with the
answer-quality re-test it asked for, and two things came out of that test that
the original note did not predict.

**The bug was worse than recorded.** `BAC2_ANSWER_RULES` is a template literal
and its KaTeX command list used single backslashes. Loading the module and
`JSON.stringify`-ing the string showed **zero real backslashes and nine control
characters per language**: `\f` a form feed, `\r` (`\right`) a carriage return,
`\t` (`\theta`, `\to`, `\times`, `\text`) a tab, `\b` (`\beta`, `\begin`) a
backspace, and `\ne` a LINE BREAK followed by "e". The worked examples were
already double-escaped, so the note's "and in the worked examples" was wrong —
only lines in the two rules blocks needed it. `bac2-format.ts` now carries a
header comment so the doubled backslashes are not "tidied" back.

**It was doing measurable damage, in exactly one place.** The corrupted
chemistry rule taught `$mathrm{H_2O}$`. Asked to balance CH₄ combustion, three
runs against the broken prompt wrote **15, 23 and 20** formulas opening
`$mathrm{…}$` — KaTeX accepts that and renders the italic letters "mathrmCH4",
so nothing ever errored. After the fix: **0, 0, 0**. Trig, limit and domain
questions were clean both before and after; the model's own LaTeX knowledge
wins everywhere the prompt is not copied verbatim.

**The fix exposed a SECOND rendering failure: padded dollars.** With real
backslashes in the rules, the model started writing `$ \mathrm{CH_4} $`, and
`splitMath` refuses whitespace-hugged inline math — 5 of 6 chemistry answers
showed raw source (30 stray `$` in one reply). **A prompt rule did not fix it**:
an explicit "no space inside the dollars" rule, in both languages, left 3 of 3
answers padded, so it was REMOVED rather than left costing prompt budget on
every request. (A negative example also shows the model the very pattern it
forbids.)

**The fix is in the renderer: `looksLikeMath` forgives padding around
unmistakable TeX.** Padded inline math is accepted only if it contains a
backslash command, `^`, `_` or a brace (`TEX_MARKER` in `utils/math-render.ts`).
That keeps the original guard — "costs $ and $x^2$" still refuses to pair
" and " — and was checked against 12 cases including prose dollars, Khmer
inside dollars, an unclosed stream fragment and a newline-spanning span.
Re-scoring the saved answers took stray dollars from 30/10/28/6/30 to 4/0/2/0/2.

**A THIRD failure, found by the user the same day: Khmer inside `\text{}`.** An
answer ended `$\mathrm{Au} + \mathrm{H_2O} \to \text{គ្មានប្រតិកម្ម}$` ("no
reaction"), although the rules forbid it. The Khmer guard refused the whole
formula, so the student saw raw LaTeX. `liftKhmerText()` in
`utils/math-render.ts` now splits such a formula instead: the math either side is
typeset and the Khmer becomes an ordinary text segment in the Khmer font, so
KaTeX still never receives a Khmer glyph. It covers `\text`, `\textrm`,
`\mathrm` and `\mbox` at brace depth 0 only, and returns null — the old safe
behaviour — for bare Khmer in math (prose dollars look exactly like that), a
text command nested in a group (`\frac{\text{…}}{2}` would unbalance braces), an
argument holding `\` or `$`, or inline math spanning a newline. Pieces from a
`$$…$$` block are emitted INLINE: formula-then-words on one line reads better
than a display block with its words stranded underneath. Checked offline, no
API calls, on 15 cases including every earlier guard: 0 KaTeX errors, 0 math
segments containing Khmer.

**A FOURTH failure (2 Oct 2026): a Khmer label on an ARROW.** The model writes a reaction
condition over the arrow, `\xrightarrow{\text{ពន្លឺព្រះអាទិត្យ}}` ("sunlight"). That `\text`
sits inside the arrow's group, which `liftKhmerText` refuses by design, so the whole equation
showed as raw LaTeX.

`moveArrowLabelsOut()` in `utils/math-render.ts` now runs first inside `liftKhmerText`:
- It covers the `\x…` arrows (with the optional `[below]` label) and
  `\overset` / `\underset` / `\stackrel`.
- A label holding Khmer comes off the arrow and is re-emitted right after it as a top-level
  `\text{(…)}`. So `A \xrightarrow{\text{ក}} B` becomes `A \xrightarrow{} \text{(ក)} B`, and
  the ordinary lift splits it.
- The student sees "6CO₂ + 6H₂O ⟶ (ពន្លឺព្រះអាទិត្យ) C₆H₁₂O₆ + 6O₂", and KaTeX still never
  receives a Khmer glyph.
- A Latin label, a label with a command in it, and an arrow nested in another group are all
  left exactly as before.

**Checked on 13 cases**, every math piece typeset with `throwOnError`, with the earlier guard
cases unchanged. Then in real Chrome at 390 light and 320 dark: no raw LaTeX, no KaTeX error,
no sideways scroll.

**Deliberately left: padded plain arithmetic** (`$ 2 + 2 $`) still shows raw.
Accepting `+` or `=` as a TeX marker would start typesetting dollar AMOUNTS in
prose ("$5 + $3"). The rules already tell the model not to wrap bare numbers, and
a stray `$ 2 $` is a far smaller failure than eating a sentence.

**How it was measured, so it can be repeated:** answers came from the real
`handleChat` via `ssrLoadModule` (no Supabase URL, so dev-mode verification is
skipped), and were scored with the app's own path — `splitMath`, then
`katex.renderToString` with `throwOnError`. Count bare command names inside math
segments (`mathrm`, `frac`, `theta`… with no backslash) and `$` left in text
segments. **Eyeballing is not enough**: the broken output rendered without a
single error.

Other standing lint warning: `src/components/ui/button.tsx`
`only-export-components` (the shadcn `buttonVariants` export). Cosmetic,
fast-refresh only. It is now the ONLY warning oxlint reports.

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
npm run check:quiz    # authored quiz content — see below
npm run check:content # content files under content/ (decks and quizzes moving to the database)
```

The third is there because the first two cannot see it: to `tsc` and to oxlint,
`"១២"` and `"12"` are both just strings. It is instant and has no dependencies,
so there is no reason to skip it on a change that "obviously" touches no copy.

**`check:quiz` is the same argument for authored QUIZ AND PAST-PAPER content**
(`scripts/check-quiz.mjs`). It covers `PAST_PAPERS`,
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
`0.25`. That is why `data/quizzes/math-1-1-1.ts` states a canonical-form rule
instead: fractions are always `\frac{a}{b}` and a decimal is never a legal
option, which makes the largest family of those collisions unwriteable rather
than merely discouraged.

`npm run build` runs `tsc -b && vite build` and must also pass. For anything
touching the mentor, additionally exercise `POST /api/chat` against a running
dev server — with and without a key — since neither typecheck nor lint covers it.

For anything touching Supabase, additionally:

```bash
npm run db:check     # env → reachability → Google sign-in → all 11 tables
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

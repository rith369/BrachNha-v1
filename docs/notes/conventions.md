# Conventions: stack reasoning, fonts and the rules for student-visible text

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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
| **KaTeX** | ✅ Use | Typesets both sides of the KruAI conversation AND the maths in a practice quiz. Reached only through `components/shell/math-text.tsx`, which two lazy routes import — so it builds its own shared chunk and stays out of the entry chunk. That chunk is named **`sanitize-svg-*.js`** since 4 Oct 2026 (utils/content-check.ts imports KaTeX and the SVG sanitizer too; it was `math-render-*.js`, and before that `math-text-*.js`), so check it by content (`renderToString`), not name. **Verify that after any build**; it is one eager import away from first paint |
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

### No dashes between words, no sparkle icons (13 Oct 2026)

The user widened the rule above, from a guideline they brought from another app
and asked to be applied flexibly. The reason is the same: these read as
machine-written to the students and parents who see them.

**1. No dash BETWEEN WORDS in a sentence**, on top of the em dash: `(SNC -
Supreme National Council)`, `(Estrogen - ជំរុញ…)`, `Hard - try again`. Use a
comma, a full stop, parentheses or a colon, and in Khmer `។` or `៖`. A
translation goes in parentheses, Khmer first: `ការថប់បារម្ភ (Anxiety)`,
`ក្រុមប្រឹក្សាជាតិជាន់ខ្ពស់ (SNC)`.

**A dash is still correct in these, and they must NOT be "fixed"** (the user's
correction the same day: "not everything don't use -, sometime use too"):

- **a range of numbers**: `1975 – 1979`, `pH = 1.5 - 2`, `45°C - 60°C`,
  `07:30 - 08:30`, a scoreline `3 – 4`;
- **`- ` starting a list line**, as in the maths help notes;
- a minus sign (`$x - 3$`, `-2`), a hyphen inside one word (`e-mail`), ids
  like `biology-3-1-1`, code, URLs and comments;
- the bare `"—"` placeholders listed above.

A first pass on 13 Oct 2026 rewrote the time slots and scorelines as `ដល់` and
`:`; that was reverted for this reason. KruAI is told the same, in both
languages of `BAC2_ANSWER_RULES` next to the em dash line, with the range
examples spelled out so it does not avoid them.

**The editor and `check:content` catch it in database content (27 Oct 2026)**:
`wordDash` in `utils/content-check.ts`, a dash with spaces and a LETTER on both
sides, outside `$…$`, never across a line break, so ranges, minus signs, list
lines and hyphenated words pass. A WARNING, not an error: some are judgement
calls, and a wrong guess must not block Publish. On that day it found 7, still
to fix in Admin → Content (not code): deck `biology-3-3` cards 8 (Cortisol) and
10 (Estrogen), deck `biology-5-2` card 1 (One gene - one enzyme), section
`biology-3-1-4` (Sympathetic; this list used to say 3-1-1, wrongly), game
`biology` question 27 (the «… – … – …» axis), and game `history` question 29
(the SNC option, which is also its correct answer). The app's own strings in
code are still not checked.

**2. No sparkle or four-point star icon anywhere**: not Lucide's `Sparkles`,
`Sparkle` or `WandSparkles`, not the ✨ emoji, not a hand-drawn star of the same
shape. Students read it as "this is AI". Pick an icon that says what the spot
means: Grade Prediction is `Target`, a recommendation is `Lightbulb`, a
greeting is `Sun`. Every one in the app was replaced on 13 Oct 2026, and KruAI
is told never to use ✨. An ordinary five-point star (⭐, Lucide `Star`, the
leaderboard's XP and the flashcard "important" mark) is a different symbol and
stays.

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
- **The English exam paper and its drills** (the `2025-english` paper on
  Admin → Content, which carries its own drills). Its content is English by
  definition; only the Khmer EXPLANATIONS around it follow these rules. The same goes for text quoting a
  phone's own UI, such as `«Add to Home Screen»` in `features/install/copy.ts`,
  which has to match what the student actually sees on their device.

**Neither rule is machine-checked in code.** `check:digits` catches Khmer numerals
(and the content editor and `check:content` catch broken TeX, em dashes and, as a
warning, dashes between words in content);
nothing catches an em dash or a stray English word in the app's own strings, so both are a matter of writing them correctly the first time. To audit by
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

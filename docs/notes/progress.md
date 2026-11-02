# Progress

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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
  screenshot, not theorised. `study-calendar.tsx`'s Today button had the same
  latent flash and uses the same arbitrary class since 27 Oct 2026.

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

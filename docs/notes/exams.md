# Exams: Mock Exam and past papers

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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

> **Since 7 Oct 2026 past papers live in the DATABASE**, not in `data/papers/` or
> `PAST_PAPERS` (both deleted; `PAST_PAPER_YEARS` stays). This section, the maths
> paper's after it and the Mock Exam page's before it still hold for the screens and
> the reasoning; where they name a file under `data/papers/`, `PAST_PAPERS` or
> `SKILLS`, read "the paper's body" (its drills travel in it as `skills`). See
> "Step B: students read sections and papers from the database".

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
`MAX_PAPER_RESULTS` and cleared by `logout()`. It was LOCAL-ONLY until 27 Oct
2026 (`exam_results` has no column saying WHICH paper); it now syncs to its own
`paper_results` table. See "Study progress syncs across phones" near the end of
this file.

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

### The 2-day Simulation runs on real logic, with papers still to come (3 Nov 2026)

`/exam/simulation` was a briefing whose "Enter Day 1 Exam" only opened the subject
list. The user asked for the logic now and will supply the papers later. Their two
choices: **students see "coming soon" until every subject has a paper** (admins can run
what exists, to test it), and **Day 2 opens once Day 1 is done, on any date**.

| route | screen |
| --- | --- |
| `/exam/simulation` | the briefing: Start, Continue or coming soon, plus earlier results |
| `/exam/simulation/sit` | the attempt: the next paper, both days, and the runner |
| `/exam/simulation/result/:attemptId` | the grade, each subject, each paper's review |

- **`features/exam/simulation.ts` is the rules**, pure: the timetable, which paper fills
  a session, the grade. The briefing's timetable and grade scale read from it, so the
  page and the clock cannot disagree. **The timetable has not been checked against the
  Ministry's**; it is what the briefing already said.
- **No content in code.** `planSimulation()` takes each subject's published papers from
  the manifest, so publishing the seventh paper turns the simulation on. Of several
  years it takes the one this student has met least, newest first on a tie, so a second
  attempt is not the same exam once there are several years.
- **A paper and version are frozen when an attempt starts**, so a fix published mid-way
  cannot change the exam, and the review marks against what was sat.
- **THE CLOCK NEVER STOPS, and it is the timetable's minutes**, not the paper's header.
  The start is saved (`startedAt`), so a reload gains nothing. Start stays off until the
  paper has downloaded, so a slow connection cannot eat the time. A clock that ran out
  while the student was away submits what they had answered.
- **COMING BACK COUNTS AS LEAVING**, or closing the app to look something up would beat
  the leave rule. A crash counts too, the accepted cost in `use-leave-guard.ts`, and the
  answers are kept. Going past the limit submits on arrival, and the waiting card warns
  first. `PastPaperRunner` gained optional `startedAt`, `initialAnswers`, `initialLeaves`,
  `initialIndex`, `exitCopy` and `onProgress`; a paper on its own screen passes none and
  behaves as before.
- **The answers so far are a device fact** (`lib/simulation-draft.ts`): they change on
  every tap, and a store write re-serialises the store and arms the sync. So a new phone
  gets the attempt and the running clock back, without the answers on that one paper.
- **No score until the end**, as in the real exam. A typed result address for an
  unfinished attempt goes back to the papers.
- **The grade is an ESTIMATE, and the result says so.** A subject's marks are its share
  of questions right, scaled to what the real exam marks it out of. The foreign language
  is extra and never counts toward the 475. Below 237 is F. Rows round to one decimal and
  the total adds the rounded rows, so what is on screen adds up.
- **Each paper also counts as an ordinary attempt** through `record-paper-attempt.ts`
  (shared with `paper-screen.tsx`): XP, the content log, the paper's own history and the
  daily challenge. So those can show a score mid-attempt to a student who goes looking.
  Accepted.
- **Giving up** takes two taps and removes the attempt, on the server too. Papers already
  sat stay in their history.
- **`simulation_attempts`** (`20261103000002`, own rows only) is pushed by
  `lib/study-progress-sync.ts` only when `updatedAt` changes. **Its delete on "use this
  device" sits outside the six-table gate on purpose**, so a project without this table
  can still replace the rest. The code ships before or after the migration.
- **A trap this hit: never read localStorage in a render body.** The React Compiler treats
  a call in render as pure and keeps its first answer, so the waiting card's leave count
  went stale and told a student they had more left than they did. Tests caught it. It is
  read in a lazy `useState` now, on a card that remounts each time.
- **Admins** get Start while papers are missing. Sessions with no paper are skipped, the
  attempt carries `test: true`, and the sitting screen, result and history all say so.
  The grade scales up from what was sat.

**Not done:** the briefing is still mostly English, though the page is meant to be Khmer
(`EXAM_PAGE_LANG`); only the new parts are Khmer. `scripts/shots.mjs` has no route for
`/sit`, because its blanked-Supabase seed has only 2 papers and cannot reach one.

**Verified:** 53 logic checks through the real modules (the timetable's totals, every
grade's edge, paper choice, marks, the store's actions and caps). PGlite 0.2.17, the
migration twice: 20 checks (own rows, anon nothing, upsert, shape, size, cascade). Browser
with the database faked through Playwright `route`: 148 checks at 390 light, 320 dark and
1280, including a reload mid-paper, all three returns, the clock running out while away,
XP paid once, the result and a real maths review, an admin's test run, restoring on a new
phone, giving up deleting the row, the table missing, and a paper on its own screen
unchanged. **Not verified: real phones, two real accounts, the sync against the real
database, or a run with seven real papers.**

### The Simulation must be finished within 2 days (3 Nov 2026, later the same day)

**This replaces "Day 2 opens on any date" above, which had no limit at all.** The user's
rule: a student sits at any hours, but all the papers within 2 days. Day 1 and Day 2 are now
labels and an order, not dates, so all seven may be sat in one day.

- **`utils/simulation-window.ts`** holds it, in `utils/` because the store enforces it too.
  48 hours from the **first paper's start**, derived from the sittings, so no new column or
  migration. Pressing Enter starts nothing.
- **A paper running when the 2 days end keeps its own timer.** The attempt ends once it is
  handed in (`simulationOverdue` is false while one is running).
- **Papers not sat keep no result and score 0**, and count against the grade. This is unlike
  an admin's test run, where a paper with no content is simply left out. They show as "not
  sat", with no review, and the result says how many.
- **`startSimulationSitting` refuses a new paper after the 2 days**, so the rule does not rest
  on the screen. **`expireOverdueSimulations`** ends the attempt, stamped with when the 2 days
  ended rather than when the app was next opened. It runs on the sitting screen's tick and
  when `/exam` or the briefing opens, so an attempt that ran out while the app was closed
  does not offer Continue.
- **`finishedAt !== null` is what makes an attempt finished now**, not "every sitting has a
  result": both route pages check it.
- **Device clock:** the limit trusts the phone's clock, like every timer here.

**Verified:** 73 logic checks, including each edge of the 48 hours. 203 browser checks at 390
light, 320 dark and 1280: the rule before the first paper, the countdown after it, Day 2 open
the same day, arriving late (grade counting the zeros, no XP, only sat papers opening), a
running paper not cut off and ending the attempt when handed in, both timers out while away
(saved answers counted once), and the chooser and briefing noticing. **Not verified on a real
phone.**

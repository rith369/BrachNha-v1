# Practice: flashcards, spaced repetition and quizzes

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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
(History: FSRS replaced it on 27 Oct 2026, and `schedule` MOVED to
`utils/fsrs.ts` so the library stays out of the entry chunk; `gradeCard` now
takes the next state from its caller. See "Flashcards are scheduled by FSRS".)

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
official and student cards alike since both share one id space. Synced like
`cardReviews`/`studentCards` (since 27 Oct 2026); nothing reads it back
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
(History: since 27 Oct 2026 both sync, through their own incremental path,
`lib/study-progress-sync.ts`. See "Study progress syncs across phones" near
the end of this file.) They were deliberately NOT added to the snapshot
push in `supabase-sync.ts`, and still are not: that layer pushes a full
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

**(DELETED 27 Oct 2026, with `mock-retention.ts`: see the NOTE under the
progress ring below. History follows.) Retention was a MOCK, in its own file
(`features/practice/mock-retention.ts`) specifically so it could never be
mistaken for the real scheduler.** A small deterministic formula off `reviewCount`/`lapses` —
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

**What a real backend would eventually need** (BUILT on 27 Oct 2026, close to
this shape; see "Study progress syncs across phones"), if/when this stops being
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
**That is what happened (27 Oct 2026, the user's call):** the line and
`mock-retention.ts` are deleted, so the ring is the only percentage. Its formula
ignored time entirely (a card seen yesterday and one seen six months ago scored
the same). A REAL "chance you remember this today" needs a memory model: the
plan, if wanted, is FSRS (`ts-fsrs`) behind `schedule()` in
`utils/spaced-repetition.ts`, which is the swap boundary built for it, plus
stability/difficulty columns on `card_reviews`. Bring a percentage back only
from that, never from a formula. **Built the same day** (the line reads
"ថ្ងៃនេះ អ្នកចាំបានប្រហែល N%"): see "Flashcards are scheduled by FSRS" near the
end of this file.

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

**The review's main button retries ONLY THE WRONG ONES** (27 Oct 2026, the user's
call): ធ្វើសំណួរខុសម្តងទៀត (N), unanswered counting as wrong. With nothing wrong it
is ធ្វើម្តងទៀត, the whole quiz; the detail screen always offers the whole quiz too.
- `QuizScreen`'s `run` and `result` modes carry optional `indexes` (positions in
  TODAY's quiz). The wrong questions are found there by id, so retrying from an
  older version's review works; one no longer in the quiz is dropped.
- **A retry is NOT an attempt**: no history row, no daily task, no path node, no
  `quiz_done`. Three re-answered questions at 100% would read as a perfect sitting
  and become the best score. Per-question XP and the content log are still paid by
  the runner, as on any full retake.
- `numbers` on `QuizRunner` and `QuizResults` keeps each question's number in the
  whole quiz, so rows read សំណួរ 2, 3, 5 and a report's index fallback stays right.

**`quizResults` is a new persisted field, and it is NOT a widening of anything.**
`examResults` captions Home's "from mock exams" pill and feeds KruAI an average
it states as fact; `paperResults` is a paper, with parts and a clock budget. It
keeps the ANSWERS and the PER-QUESTION TIMES, not just the score, because that is
what makes a history row reopen a review. It was LOCAL-ONLY until 27 Oct 2026
(`exam_results` has no column saying WHICH quiz); it now syncs to its own
`quiz_results` table. See "Study progress syncs across phones".

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

## Flashcards are scheduled by FSRS (27 Oct 2026)

The user's call, after the made-up "~N%" retention line was removed: a REAL "chance
you remember this today", which needs a memory model. The scheduler is now **FSRS**
(the model Anki uses), through `ts-fsrs` 5.4.2 (MIT, no dependencies). The user's
choices: **90% target retention**, and the percentage shown as the **lesson total**
(not per card, yet).

**`utils/fsrs.ts` is the scheduler**: `schedule`, `retrievability`,
`averageRetrievability`, `upgradeReviews`. Settings, each a decision:
- `request_retention` 0.9; `enable_short_term` false (no same-day learning steps, so
  every graded card is FSRS state Review); `enable_fuzz` false (one history, one date,
  on every phone); `maximum_interval` 365, ALSO clamped in code because FSRS reports
  366 at its own cap.
- **"Again" is always tomorrow** (`AGAIN_INTERVAL_DAYS`), overriding the 2 days FSRS
  gives a lapsed card it knew well.
- **Default parameters, not fitted ones**: the figure is an estimate for an average
  learner. Fitting FSRS to a student needs hundreds of reviews and an optimiser.

**Bytes: the library is ~13.8 KB gzipped and is NOT in the entry chunk.** The store
and Home's study feed (both entry) import `utils/spaced-repetition.ts`, which keeps
only the state type, `isDue`, `initialReviewState`, `repairReviewState` and the two
constants. So:
- `gradeCard(cardId, grade, next)`: the CALLER (review-session) computes `next`
  with `schedule()`, from the card's LIVE store state, not the session's snapshot.
  The log entry takes `next.lastReviewedAt`, so a replay rebuilds the same state.
- Old cards are upgraded by `useFsrsUpgrade()` (`features/practice/`) when a
  flashcard screen opens (the lesson's runner and Daily Review), NOT in the persist
  `merge`, which would pull FSRS into the entry chunk.
- Check after a build: `request_retention` appears in one lazy chunk
  (`use-fsrs-upgrade-*.js`), never in `index-*.js` or `index.html`'s preloads.

**`ReviewState` gained optional `stability` and `difficulty`.** A card graded before
FSRS has neither:
- if the review log holds its WHOLE history (as many entries as `reviewCount`), it is
  REPLAYED through FSRS;
- otherwise it keeps its date and gets an estimate (stability = its current wait,
  difficulty 5 + lapses).

`schedule()` estimates on the spot too, so a card graded before the upgrade runs
still works, and `retrievability()` returns null for a card with no model.

**A last review "in the future" made FSRS throw** (`Invalid delta_t`): a phone clock
set back, or a card synced from a phone that runs ahead. In the review screen that
would have swallowed the grade silently. `toCard()` treats it as "reviewed just now";
`retrievability()` also returns null rather than throw. Found by a test, not by a
student.

**Early reviews no longer inflate a card**: 20 "good" grades in 20 minutes stay at a
few days, where the old ×2 scheduler doubled each time.

**The screen**: under the three piles, "ថ្ងៃនេះ អ្នកចាំបានប្រហែល N% នៃកាតដែលបានរៀន"
with an ⓘ saying what it counts. It is absent until a card has a model. It is a
DIFFERENT number from the ring: the ring is how you answered last time, this is how
much is likely still remembered today.

**Sync**: `card_reviews` gained `stability` and `difficulty` (double precision, both
or neither, checked) in `20261027000002_fsrs_memory.sql`; the push sends them
(explicit null when absent), the pull reads them back, and the review signature
includes them, so upgrading a card re-uploads it once.

**Verified:** 29 checks on `utils/fsrs.ts` through `ssrLoadModule` (intervals,
"again" tomorrow, the cap on the due day, early grades, a legacy card, the future
clock, a NaN model, retrievability ≈90% on the due day and falling, exact replay,
estimate, null when nothing to do); the cap/repair test (14) and the sync test (40,
the model round-tripping to a "new phone") still pass; PGlite 11 checks on the new
migration (twice, old rows kept, exact round trip, every refusal); and 20 browser
checks at 390 light and 320 dark Khmer (old cards upgraded on open, one replayed and
one estimated; the line and its ⓘ; a ✓ grade stores an FSRS state whose time matches
the log; no sideways scroll; no page error).

### Practice what I got wrong (3 Nov 2026)

`/practice/mistakes` lists the questions a student got wrong and has not fixed, and
`/practice/mistakes/run` practises them. `features/practice/mistakes.ts` is the rules, pure.

- **A mistake is a REFERENCE, never a copy** (`utils/content-ref.ts`, the same refs mistake
  reports use), so a fix published on Admin → Content reaches it. `QuestionMistake` holds only
  the ref, a count and a time. Each question is fetched when it comes on screen (and the next
  one warmed), so a round of 20 never downloads every paper first, and the list downloads none.
- **`noteAnswers` is the one way in**: wrong adds or counts up, right removes. Written from the
  section quiz, the practice quiz, `record-paper-attempt.ts` (so a paper and a Simulation paper)
  and the round itself. A right answer to a question not on the list changes nothing, so an
  ordinary quiz publishes no store update.
- **One right answer clears it, anywhere** (the user's "ok" to my proposal, easy to change).
- **Left out on purpose:** a question left BLANK (the clock running out would flood the list
  with questions never reached), and Battles, whose frozen questions carry no id to point back to.
- **A round is at most `MISTAKES_PER_SESSION` (20), most-missed first, then longest waiting**, and
  is FIXED as it starts (`useState` in `pages/practice-mistakes-run.tsx`). Rebuilt on each render,
  clearing the last mistake would bounce the student away before the summary. A wrong answer does
  not return in the same round, the flashcards' reason.
- **A round pays like any practice answer** (`QUIZ_XP`) and logs to Progress. It cannot be farmed,
  because a right answer removes the question. It does not tick a daily mission or the streak.
- **A question removed since it was missed** says so, and the tap takes it off the list. One whose
  quiz or paper is unpublished is hidden but kept, since it may return.
- **The "កំហុស" node on a lesson's Study path opens that lesson's list** (`?lesson=`). It is linked
  in `subject-path-view.tsx`, NOT in the data: a real `href` would make it a section to finish,
  which would stop the path's progress reaching the end and hold the START bubble on it for ever.
- **That lesson filter leaves quizzes out for a subject with a quiz path.** Maths' Bac II quiz path
  and its foundation Study path both use `math-1-1` for different lessons. They still show on the
  main list.
- **`resolveContentRef`** (`features/admin/content-ref.ts`) is shared with `/admin/mistakes`, and
  gained `help`. It stays where it is, reached only from lazy chunks.
- **`question_mistakes`** (`20261103000004`, own rows only) is pushed by
  `lib/study-progress-sync.ts` when `lastWrongAt` changes, and a row gone from the device is deleted.
  **Its delete on "use this device" sits outside the six-table gate**, like `simulation_attempts`.
  **Two phones do not fully merge:** a fix on one leaves the other's local copy until it answers it.

**Verified:** PGlite 0.2.17, the migration twice: 15 checks. Browser, the database faked with the
real fixture: 98 checks at 390 light, 320 dark and 1280 (a real quiz, section and paper writing
the list, blanks left out, the hub card, wrong staying and right clearing, a paper's exercise above
its question, the summary after clearing the last, a removed and an unpublished question, the
node's lesson filter with the path's progress unchanged, sync up and down and with the table
missing, no sideways scroll, no page error). **Not verified: a real account against the real
database.**

# Unbuilt work, standing decisions and bugs from review

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Still not built

Document Library — the last disabled "Soon" item in the nav
(`lib/nav-items.ts`), with no route or feature folder.

**Streak-w/-Friends has left this list**, backend included (13 Oct 2026): real
friends, found by name, with a shared streak each. Still not built there:
reminders (the app sends no notifications) and a "don't let others find me"
switch.

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
`userLocation`, `userLanguage`, `surveyed`, `userData`,
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
`computeDailyMission` (now only the pledge's estimate) takes a `number`, so it
tightens on its own as the exam nears. Home's hero and Grade Prediction
show a real day count instead of the old `months × 30` approximation.

Two things to keep straight. **`Commitment.months` is the one deliberate
snapshot** — the pledge has to keep saying what the student agreed to, so it is
frozen at signing time and must not become a live read. And `monthsUntilExam()`
is floored at 1 because callers divide by it. Rolling the app to the next cohort
is a one-line edit to `BAC2_EXAM_DATE`.

**There is no placement test (deleted 7 Oct 2026).** It was scoped to the 3
foundation subjects (math/physics/chemistry), and both of its paths, the inline
test in the survey and scheduling one for later, had already been pulled out of
the survey. **No subject gets test-backed weakness detection**; all three
foundation subjects self-report. `utils/placement.ts` keeps only
`FOUNDATION_SUBJECTS`. A future test would be written as database content, not
brought back from git.

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
cohort is still demo** (Streak with Friends went real on 13 Oct 2026). Grade Prediction, all of
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
`components/preview-tag.tsx`, a dashed "Preview · sample data" pill. **No screen
carries it now**: Streak with Friends, the last, lost it on 13 Oct 2026 when it
went real, and Grade Prediction on 1 Oct 2026. **Game and
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

**Roadmap's missions and Home's daily-tasks checklist are one component, and share
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

> The route and the old lessons behind it were deleted on 7 Oct 2026; `/lessons/:id`
> now redirects to the Study page. Kept as the record of the bug.

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

**Still true, and still not addressed:** (The first item here, that
`cardReviews`/`studentCards`/`starredCards`/`reviewHistory` never left the
device, was fixed on 27 Oct 2026; see "Study progress syncs across phones".)
`profiles.email` has no
unique constraint, and `profiles` has no DELETE policy, so a client can never
clean up the losing side of an account merge. (`handle_new_user` being `after
insert` only no longer bites: a Google user arrives WITH an email, so the trigger
captures it, and `login-view.tsx` prefills the same address into `userEmail` so
the ordinary push keeps it current.)

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

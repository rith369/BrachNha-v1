# Game: Battles between real students

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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

> **Since 7 Oct 2026 the question pools live in the DATABASE** (kind `game`, edited on
> Admin → Content → Game questions), `data/game-questions.ts` is deleted, and every
> question carries a difficulty. The two paragraphs below are the history. See "Game
> questions move into the database" near the end of this file.

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

##### THE PHOTO FEATURE IS OFF (27 Oct 2026)

The user turned it off because the photos were filling Supabase storage.
`WORK_PHOTOS_ENABLED = false` in `features/game/use-work-photos.ts` is the only
change: both hooks AND it in, so `mine.available` is false and every photo part of
the review disappears through the gates that already existed (no photo step, no
strips, no lock note, no report flag), and nothing is listed, signed or uploaded.
The review opens straight on the answers.
- **Kept on purpose:** the code, the `competition-work` bucket and its policies,
  `/admin/reports`, and the photo cleanup in account deletion, which does not read
  the switch, so leftover photos are still removed with an account.
- **No migration.** Uploads are still allowed by the policies, so a tab already
  open before the deploy, or a hand-made request, could still add a photo.
  Accepted, the user's call. Dropping `"competition work: insert own"` would close it.
- **Storage is only freed by deleting the existing files** (Supabase → Storage →
  `competition-work`). Turning the switch off frees nothing by itself.

Everything below describes the feature as it works when switched on.

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

### Battles are written only through functions that check them (3 Nov 2026)

**This replaces "nothing on the server checks it" above.** A security review found that a student
calling the database directly could post any question text, any creator name and any score, and
other students would read it. Most students are under 18, so that is a way to bully someone inside
the app under an official-looking name. The test proved it on the old rules.

`20261103000005` drops the insert policies on `competitions` and `competition_attempts`. The only
way in is now:

- **`post_competition`**: each question must match one from a PUBLISHED pool for that subject, in
  any version (a Battle is played first and shared after, and a fix may land in between). What is
  stored is the POOL's copy, so extra text on a real question is thrown away. Answers must be options
  of the question, or null.
- **`post_competition_attempt`**: answers must be options of that Battle's questions. Refuses your own.
- **Both** take the name from the profile, work out the score themselves, hold the time inside the
  budget and stamp the time from the server. So faked Battle scores are closed too. Both require
  `friend_eligible`: a real account with a name.

`lib/competitions.ts` still reports a duplicate (23505) the same way. A refused Battle stays "Not
shared yet" on the student's phone and retries on hub visits, so one whose questions have left the
pool stays unshared. That is honest, and costs one request a visit.

**Still free text, on purpose:** a student's display name, which also shows on the leaderboard. That
is not moderation of names. **Rows posted before this are not rechecked or deleted**, which is why
`toQuestions()` still treats a stored row as untrusted. Size limits and a cap on posts per day came
next: see "20 new Battles a day" below.

**Verified:** the real table and policies on PGlite 0.2.17 with the real pool and questions built by
the app's own `pickQuestions`/`toGameQuestions`: 43 checks, including the forged insert succeeding
before and refused after. Browser, the database faked: 40 checks at 390 and 320 through the real
create and join screens. **Not verified: a real account against the real database.**

### 20 new Battles a day (3 Nov 2026)

`post_competition` refuses a 21st new Battle in one Phnom Penh day with hint `too_many`
(`20261103000006`), which `publishCompetition` reports as the reason `too_many`.

- **The run is already played by then, and nothing is lost.** The Battle is on the phone, the XP and
  mission are paid, and `PostedView` says it is today's limit rather than blaming the connection. It
  waits as "Not shared yet" and `share-pending.ts` shares it on a later hub visit.
- **The hub stops its pass at the first `too_many`**, since the next row would be refused too. Dev
  shows two tries, because StrictMode runs that effect twice and the first row is in flight.
- **The count skips a Battle that is already up there**, so re-sending one at the cap still gets the
  duplicate error that the app reads as shared, and its label clears.
- **An advisory lock per student** makes many posts sent at once take turns. Without it they would all
  read the same count and all pass. **Not tested:** PGlite has one connection, so nothing ran at once.
- **The count is of rows there now**, so deleting a Battle frees a place. A student can have 20 up from
  one day, which is what protects the list, but post-and-delete is not capped.
- **Attempts have no cap of their own:** one per student per Battle already holds them.

### Photo uploads are closed in the database (3 Nov 2026, `20261103000008`)

The feature was off only in the app, so the database still took uploads from anyone calling it directly.
The upload policy is gone. Reading, reporting and deleting leftover photos still work, and so does account
deletion. **Turning the feature back on needs `"competition work: upload own"` restored from
`20260916000003` as well as `WORK_PHOTOS_ENABLED`.**

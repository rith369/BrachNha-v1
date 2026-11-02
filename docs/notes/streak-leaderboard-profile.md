# Leaderboard, Streak, Friends and Profile

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

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

### Streak with Friends — a SHARED streak, and it is REAL now (13 Oct 2026)

`/streak/friends` fills the `friends` nav item that had sat as a disabled "Soon"
placeholder since the beginning. It was a prototype (an invented "Dara", a fake
week, a Simulate button) until 13 Oct 2026, because the app had no idea what a
friend is. **The one thing added to make it real is a friendship model**;
everything the streak needs already existed in `daily_activity`.

**The rule is the whole feature: a day counts only when BOTH finished their
daily goal** (since 3 Nov 2026, at least 1 activity each; see "Daily targets, the
streak and the gift" at the end of this note). One person doing the work earns the pair nothing. **Don't
reintroduce ranking here**: an earlier version ranked friends by their own
streaks, and "beat your friends" is what `/leaderboard` is for.

**The user's decisions (13 Oct 2026):**
- **Many friends, one streak each**, capped at 20.
- **Found by searching their NAME**, then the other student must Accept. (An
  invite link + QR was declined that day and added beside search on 2 Nov 2026,
  at the user's request. See "Invite link and QR code" below.)
- **No Remind button.** The app sends no notifications; it was removed rather
  than faked.
- **A new pair starts at 0** on the day they became friends. Earlier days both
  happened to finish do not count.

#### The database: `20261013000001_friends.sql`

`friendships` (`requester_id`, `addressee_id`, `status` pending/accepted,
`created_at`, `accepted_at`), one row per PAIR (a unique index on
`least/greatest`). Both ids cascade from `profiles`, so account deletion needs
no new code. **RLS: read-own only, no write policy.** Every write is a SECURITY
DEFINER function that refuses with a `hint` (mapped to a sentence by
`friendFailLabel()` in `features/streak/copy.ts`):

| function | does | hints |
| --- | --- | --- |
| `search_students(p_query)` | 2+ letters, at most 10 real (non-anonymous, named) students, not yourself; `%`/`_` escaped; name-starts-with first; returns id, name, relation (none/sent/received/friends) | |
| `send_friend_request(p_user)` | `'sent'`, or `'accepted'` when they had already asked YOU. Advisory lock per pair | self, unknown, exists, limit, their_limit, too_many (20 a day or 20 waiting) |
| `respond_friend_request(p_id, p_accept)` | addressee only; decline DELETES (they may ask again) | missing, limit, their_limit |
| `remove_friendship(p_id)` | remove a friend (either side) or cancel a request you sent | missing |
| `my_friends(p_today)` | every row you are in, with the other's name, `since` (acceptance as a Phnom Penh date) and THEIR goal days since then (max 400). `p_today` clamped like `leaderboard()` | |

`friend_count()` and `friend_eligible()` are helpers revoked from every client
role. Only signed-in Google accounts can search or be found.

**Safety, because search lets any signed-in student find any other** (they are
mostly under 18): a result is a name and an id, never email, age, location or a
photo (the avatar is `avatarSeedFor(id)`); nothing is shared before Accept; a
friend sees only which days you met the goal since you became friends; anyone
can remove a friend. The list page and `pages/privacy.tsx` both say who can see
what. **Not built, and the obvious next step if this worries anyone:** a "don't
let others find me by name" switch.

**Verified in PGlite: 51 checks** (the migration twice; search escaping, limit
and relations; every refusal and cap; reverse-request auto-accept; decline,
cancel, remove; a stranger reads nothing; direct insert/update/delete change
nothing; goal days only from `since`; the `p_today` clamp; `anon` refused
everything; helpers not callable; cascade on account deletion). **Applied to the
live project on 13 Oct 2026**; `db:check` lists `friendships`, and cannot see the
functions.

#### The client

- **`lib/friends.ts`**: the five calls, each a `FriendResult<T>` with a reason
  (`lib/competitions.ts`'s shape), checked field by field. NOT the sync layer.
- **`lib/friend-requests.ts`**: the menu badge (requests waiting for you), a
  module like `lib/admin-status.ts`. It does its own head-only count rather than
  importing `lib/friends.ts`, because the menu is in the entry chunk and the rest
  of the friend calls are not (checked in `dist/`).
- **`features/streak/use-friends.ts`**: a module cache of `my_friends`, keyed by
  user id, shared by both pages, refetched on every visit and when the app comes
  back to the front (the friend's "done today" changes on THEIR phone).
- **`utils/streak-friends.ts`**: `pairLog()` is the intersection of the two
  students' goal days from `since`, shaped as an `ActivityLog`, and
  `pairStreak()` runs the SOLO `currentStreak()`/`bestStreak()` on it, so the
  pair streak follows exactly the solo rule (alive until today is over).
  `SharedDayStatus` is `kept | atRisk | broken | before`: `atRisk` is TODAY only,
  a past day not kept by both is `broken` (one or neither), `before` is a day
  before the friendship.
- **Your own days come from this device's `activityLog`** (fresher than the
  server: `completeTask()` writes the goal the moment it lands). **The friend's
  come from the server**, a few seconds after their phone syncs, and only once it
  is online.

#### The screens

| route | screen |
| --- | --- |
| `/streak/friends` | requests for you (Accept/Decline), your friends (pair streak + their today), Add a friend (debounced name search), requests you sent (Cancel), who-sees-what |
| `/streak/friends/:friendId` | one friend's shared streak; the id is the FRIEND'S account id, looked up in your own friendships, and an unknown one redirects to the list |

Both share `components/friends-frame.tsx` (scroller, back link, title, bottom
nav, and the gate): no Supabase at all shows one line ("needs an account") and
fetches nothing, a guest gets `LockedFeature` (new `AuthFeature` `"friends"`)
with the nav kept, and the children mount only for a signed-in student.

The friend page keeps the prototype's design, fed real values:
- **The header layout IS the argument**: the flame BETWEEN two avatars on a rail,
  so the number reads as a pair's; each avatar ringed mint when done.
- Under it, "Best: N days · Friends since …" (`formatKmDate` in Khmer).
- **The goal card is two rows, never one bar**: "one of us finished" must not
  read as half-way. While YOUR goal is open it links to your next task
  (`features/home/task-links.ts`, as the solo page); once you are done and they
  are not, "Waiting for …". There is no button that completes anything.
- **The week is shared outcomes plus a two-dot strip** (left you, right friend).
  `broken` is muted, not red. The "Before you were friends" legend shows only
  when a cell uses it.
- **`SHARED_MILESTONES` is a second ladder**, not the solo one relabelled.
- **Celebration once per day PER PAIR**: `lib/streak-celebrated.ts` takes an
  optional scope (`brachnha-streak-celebrated:{friendshipId}`).
- **Remove friend** at the bottom, two taps.
- **FOUR status lines** (`sharedStatusLine`): "neither started" and "I'm done,
  they aren't" are different, and only one is the friend's doing. Nothing scolds.

**Deleted:** `friend-streak-demo-data.ts` (`Participant` and `SharedWeekDay`
moved to `features/streak/types.ts`), the page's `PreviewTag`, the Remind and
Simulate buttons and their strings, and `sharedStreakToday()` (the count is
derived from both logs now, not "store streak + 1").

#### Invite link and QR code (2 Nov 2026)

Search fails when a name is spelled differently from how it is stored (most Google
names are Latin, and typing សុខ does not find "Sok"), and two students with one name
look the same in the results. So **Add a friend** now also has **Invite with a link
or QR code**, and the link is `/friend/{account id}`.

- **`/friend/:userId`** (`pages/friend-invite.tsx`, `friend-invite-view.tsx`) shows
  the owner's name and avatar and an Add button (Accept if they already asked you).
  Its other states are: request sent, already friends, your own link, no such student.
- **IT NEVER SENDS ANYTHING BY ITSELF.** Otherwise anyone could send you a link that
  makes you ask them, then accept themselves into your goal days. **Accepting stays
  too**, so a link forwarded to a stranger gives them nothing: two taps, one each.
- **The name comes from the database** (`friend_invite(p_user)`,
  `20261102000001_friend_invite.sql`), never from the link, so a link cannot claim to
  be somebody else. It returns a display name and a relation, the pair
  `search_students()` already hands out, and nothing for an account search could not
  find. Unlike search, the CALLER needs no name yet: a new student can land here
  before theirs has reached the server. `send_friend_request()` still requires one.
- **The link is short on purpose**: a shorter link draws bigger squares. At the
  production address it is 45x45 modules, 6.4px each at the 288px a 320px phone draws.
  It is not secret and cannot be revoked; an account id is not a credential.
- **A new student keeps the link through sign-in.** Google returns to the same path
  (`signInWithGoogle` keeps the pathname), the gate shows the signup form and the
  survey in place, and `survey-view.tsx` skips its `navigate("/roadmap")` on
  `isFriendInvitePath()`. **That return needs the Supabase Redirect URLs list to
  allow `/friend/*`**, the same as every other deep link; a probe cannot tell, because
  `/auth/v1/authorize` echoes a disallowed address too. A Telegram webview gets Open in
  Browser, and `externalUrl()` keeps the path.
- **`useWatchFriends()` re-reads the list every 5s while the code is on screen**, for
  10 minutes at most and only while the app is in front, because the friend is
  standing beside you and nothing else tells this phone a request arrived. A new
  request's card then scrolls into view, since it draws above the code.
- **With no friends the "Your friends" card is not drawn**, so the page opens on Add a
  friend, with the empty line under the search box. Only the card comes and goes:
  `AddFriend` keeps its slot in the tree, so typed text survives the list arriving.
- **The panel moved**: `components/invite-link-panel.tsx` and
  `components/invite-qr.tsx` (the lazy boundary, chunk still `invite-qr-*.js`), lifted
  when this became a second caller. `features/game/components/invite-panel.tsx` is now
  a thin wrapper, so the Game's two call sites did not change.
- **Not in `routeModules`**: the page is only ever arrived at from outside.
- The privacy page and the `whoSees` line both say a signed-in student can open your
  invite link.

**Verified:** PGlite 0.2.17, the migration twice after `20261013000001`: 20 checks (the
name trimmed, two columns only, self, ghost/anonymous/nameless give no row, no session
and an anonymous caller refused, `anon` has no execute, a nameless caller may look but
not send, a lookup writes nothing, sent/received/third party, accept through send,
friends both ways, the `exists` hint). Browser, the database faked through Playwright
`route`, against the dev server: 50 checks at 390, 320 dark Khmer and 1280 (the
empty layout, the QR chunk fetched only on the tap, the code's label and the copied
link, a request arriving under the open code and scrolled into view, typed text kept,
watching stops on close, every state of the page, opening sends nothing, a cut-short
link asks nothing, refusals, a guest on the same address with no lookup, a Telegram UA
offered Open in Browser with the link kept, a new student walking the real survey and
staying on the link, the Game's panel unchanged, no sideways scroll, no page error).
The code generated at the production address decoded back exactly with `jsqr`.
**Not verified: two real phones and a real camera scan**, which need the deployed site.

**Known limits:** two devices of the friend that have not synced make their day
appear late (it still counts once it arrives, so a past "missed" cell can turn
into a flame); everyone is assumed to be in Cambodia's day (`daily_activity`
dates are device-local). Nothing is cheat-proof: like the leaderboard, every
goal flag was written by the student's own device.

**Verified in the browser** with the friend functions faked in memory and two
accounts: 48 checks at 1280, 390 and 320 dark Khmer (guest panel with no fetch,
the badge and accepting, search and send, the other side accepting, a pair of 3
with today open, then 4 and one celebration, an unknown id redirecting, remove
in two taps, no Khmer numerals, no sideways scroll, no page error), and
`scripts/shots.mjs` on `streak-friends` at all nine widths.

### Profile's study calendar — and where the streak comes from now

Asked for as "a schedule" on Profile, clarified as **a calendar showing which
days the student studied**. The app had no per-day history at all, so the
calendar needed a real log first — and once that existed, the streak and the two
string-literal labels under the stat pills ("▲ +20 today", "Best!") could be
made TRUE rather than deleted.

**SUPERSEDED 3 Nov 2026: any 1 finished activity now makes a streak day. See "Daily
targets, the streak and the gift" at the end of this note. The next paragraph is history.**

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
| lesson | finishing a section (`section-detail`) |
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

### Daily targets, the streak and the gift (3 Nov 2026)

The user's design, across several messages: the amount of daily work follows the target
grade and the time left, **any 1 finished activity keeps the streak**, and **reaching all 4
missions opens a gift**. A student who only does quizzes keeps their streak; the gift is the
reason to do more. The user was told the published content cannot fill these targets yet (29
items) and chose to build the logic regardless, for the content that is coming.

**The targets are `dailyTargets(grade, monthsLeft)` in `utils/roadmap.ts`**, from
`computeDailyMission`'s budget: `GRADE_HOURS` × urgency (0.7 with 9+ months, 1 at 6, up to 1.6)
**capped at 240 minutes** (`MAX_MINUTES_PER_DAY`; grade A near the exam was 5.6 hours on top of
school), split 35/40/25 at 20 min a lesson, 3 min a question, 10 questions a quiz. Flashcards and
the challenge are always 1. **No grade (a guest, or before the survey) is 1 of each.**

| Target grade | 9+ months | 6 months | 3 months or less |
| --- | --- | --- | --- |
| A | 3 lessons, 2 quizzes | 4, 3 | 4, 3 |
| B | 2, 1 | 3, 2 | 4, 3 |
| C | 1, 1 | 2, 1 | 3, 2 |
| D | 1, 1 | 1, 1 | 2, 2 |
| E | 1, 1 | 1, 1 | 2, 1 |

The lengths are estimates, not measured from students. **`dailyHours()` is the same budget**, to
a quarter hour, and is what the Roadmap card and a NEW pledge show, so the screen and the plan
cannot disagree (grade A shows 2.5 today, not 3.5). A signed pledge keeps its frozen numbers.

**`completeTask(task)` now means "one activity of this kind was finished"**, so its seven callers
did not change. It adds to `dayCounts`, ALWAYS makes today a streak day, and ticks `tasks[task]`
and pays `TASK_XP` only when the count reaches today's target. So `tasks` means "this mission's
target is reached", and **`ActivityLog.goal` now means "a streak day"**: the name stayed so its
many readers (calendar, friends, leaderboard, `currentStreak`) needed no change. What counts:
- any section, any full quiz sitting, any battle or exam. Retrying only wrong answers still does
  not count (it never reaches `completeTask`). Re-finishing a section DOES, accepted;
- a flashcard review with at least `MIN_REVIEW_CARDS` (5), or the whole deck if it is smaller.
  `ReviewSession` takes `deckSize` for this, and a shorter review pays its per-card XP, ticks
  nothing, and **says so on the summary** rather than leaving the mission silently unticked.

**The gift is `openGift()`**: `GIFT_XP` (50, `utils/rewards.ts`) at the ordinary coin ratio (12),
once a day, only with all 4 ticked. `MissionGift` (`features/home/components/mission-gift.tsx`)
shows how far off it is, the button, then what it paid, on Home's card, the Streak card and the
section completion screen (with `lang="km"`, since that screen is Khmer-only). **An unopened gift
is paid when the day rolls over** (`newDay()` in the store), because the last mission is often
finished away from the card; that XP is NOT logged against the new day, which would mark a day
with no study. Coins still spend on nothing.

**Home's `DailyTasks` shows a target above 1 in its label and a count** ("Complete 3 lessons",
0/3), plus the streak line and the gift. Any lesson or quiz counts, which is why no row names one.
The Streak page's card is now the 4 missions with the streak status beside the ring; the ring is
the way to the gift, not the streak.

**Two store fields, `dayCounts` and `giftOpened`**, reset with `tasks` and listed in both
`partializeState` and `syncRelevantChange`. No `version` bump: `merge()` covers new keys.

**`20261103000001_daily_targets_and_gift.sql` adds `streak_day`, `lessons_done`, `quizzes_done`,
`reviews_done` and `gift_opened` to `daily_activity`**, and redefines `leaderboard()` and
`my_friends()` (copied verbatim, one condition changed) to read `streak_day or (all three flags)`.
So **old days that met the old goal still count, days that did not stay as they were, and no
backfill is needed**. The push writes `streak_day` for past days and NOT the task flags: it used to
write all three true on a goal day, which would now claim a lesson on a quiz-only day. The pull
reads the same rule back. **It must be applied BEFORE this code ships**, or the push of today's
row is refused.

**Not done:** a streak freeze (the user's alternative gift, for later). The two-phone same-day
case is unchanged: only an empty store pulls, so a gift could be opened once per phone. Accepted,
the same as `tasks`' XP today.

**Verified:** PGlite 0.2.17, the migration twice on the real init, RLS, leaderboard and friends
migrations: 15 checks (new columns, a negative refused, quiz-only days counted by the leaderboard
and friends, old all-three days still counted, partial old days not, own-rows policies unchanged,
`anon` still refused both functions). The REAL store and sync through `ssrLoadModule` with only
`getSupabase()` faked: 72 checks (the whole table above, the cap, each activity making a streak
day, 10 quizzes, below/at/past target, the gift's refusals and single payment, the new day paying
an unopened gift without logging a study day, a quiet wake publishing nothing, old and new days
chaining, a gap breaking it; what is pushed, with each batch keeping stable columns; what is
pulled, including all-three old days and partial ones). Browser: 83 checks at 390, 320 dark Khmer
(Home's card at 0, part way and all done; opening the gift and a reload not paying again; the next
day paying; Streak, Roadmap, Profile and Progress wording; the pledge's numbers; a real whole-deck
review ticking; a real one-card review not ticking and saying why; a real section through to its
completion screen), and the Roadmap (59), friends (50) and plan (31) suites still pass.
**Not verified: two real accounts on the friend page after the rule change, or a real gift on a
real phone.**

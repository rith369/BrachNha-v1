# Roadmap

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

**Roadmap** (`features/roadmap`) — target grade and days left, recommended hours
with the minutes really studied today, Home's missions card, and a path of real calendar
months, each opening its own page at `/roadmap/:month`. See "The Roadmap is a real
plan" near the end of this file.

**`/roadmap` HAS A NAV ROW AGAIN (28 Oct 2026, the user's request)**, directly
under "Streak with Friends" (`Map` icon, "Roadmap" / "ផែនទី"). It is also reached
from Home's "Quest Map" chip (`features/home/components/motivation-hero.tsx`) and
from the survey, which drops a fresh student straight onto it. It had been removed
for the same reason `/streak` was (Home already carries the doorway). The
onboarding lock still hides all chrome on `/roadmap` until the pledge has been
seen, so the row only helps once that is done; a guest tapping it gets the locked
panel with the navigation kept.

**The placement test and its "Pending Placement Tests" card are DELETED (7 Oct
2026)**, with the 10 mock-exam questions it drew from. See "The 10 mock-exam
questions and the placement test are deleted" near the end of this file.

## The Roadmap is a real plan (2 Nov 2026)

It looked like a plan and tracked nothing: "Month 1 · Start now" sat at the top for
ever, most of the path was "Mixed practice", and it said "20 Practice today" while
one quiz ticked the row. The user's choices: real months, a page per month, weak
subjects first and the rest spread evenly, and **the look left exactly as it was**
(the glowing path, the discs, the emoji).

**`features/roadmap/study-plan.ts` (`buildStudyPlan`) is the plan. Derived, never
stored**, so there is no store field, no sync and no migration. It reads
`studyCatalog()`, the same list as Home's Study card (`features/home/study-feed.ts`),
so the two cannot disagree about what exists or what is finished.

- **Months** run from the first month with any recorded study (or this month) to the
  exam month, or to this month if the exam has passed.
- **Order** is hardest subject first: one number per subject, the real score once
  `buildProgressSummary` has one, else 30 / 70 / 50 for survey weak / liked / neither.
  So a subject scored 40 sits ahead of one merely called weak. Within a subject,
  curriculum order. **Past papers wait for the exam month.**
- **UNFINISHED WORK ROLLS FORWARD.** Only what is left is shared out, from this month
  to the month before the exam, so a missed week leaves no backlog. A past month
  therefore shows what was finished, never a list of what was skipped; those items are
  in the current month. (The user was first told a past month would list skipped items.
  It cannot: see the next point.)
- **A finished item sits in the last month its LESSON was worked on**, or the first
  month with no log. Nothing records the day one section was finished, and the content
  log is per lesson, so going back over a lesson moves its ticks. Accepted.
- **THE CURRENT MONTH DOES NOT GROW.** Its size comes from the work left when the month
  began (left now + finished this month), so finishing an item ticks it rather than
  pulling in a replacement, and later months do not move.
- **`waiting`**: weak subjects with nothing published, said once above the path. A
  subject with no content cannot be in the plan, so a month never claims it.

**Screens.** A row opens `/roadmap/:month` (`pages/roadmap-month.tsx`, `month-view.tsx`):
Today's goal on the current month, the Simulation card on the exam month, then the
items, each going straight to its lesson, deck, quiz or paper. Nothing locks; a student
may work ahead. A bad or out-of-range month redirects. **It is deliberately not a
day-by-day calendar**: a fixed day's work is a day behind the moment one is missed.

**One missions card: Home's `DailyTasks`**, on Home, the Roadmap and the current month's
page (the user's call, the same day; the Roadmap had a separate 3-row card for a few hours).
All 4 missions, line icons, +20 XP. **Its rows name no lesson, on the user's reasoning**: any
finished lesson, quiz or review ticks its row and pays the XP, so naming one would suggest
only that one counts. A tap still opens the suggested next item (`taskHref()`). The specific
items are on Home's Study card and in the month's list, with no XP promise attached.
`computeDailyMission` stays in `utils/roadmap.ts` **for the pledge only**, which still
quotes "3 lessons, 20 questions" as a goal the student signs. No screen counts toward those
numbers, and the published content could not fill them for long. Left open for the user.

**Nothing is drawn until the manifest is `ready`**: before that every month would read
as empty and every weak subject as coming soon, and a new student lands here straight
from the survey. **Wide capitals are English-only** on this page's labels, as on
Progress: they turned "Bac II" into "BAC II" and pull Khmer clusters apart. **Finished
rows are muted, not struck through**: a line through Khmer letters is hard to read.

**The current month's row carries the pulse the first row used to** (`isFirst` on
`PhaseNode`). `isBottomNavRoute` covers `/roadmap/*`, since neither page has a BottomNav.

**Verified:** 31 checks on the real fixture through `ssrLoadModule` (10 months, every
item exactly once, an even spread, scores outranking the survey, finishing keeps the
month's size and later months unchanged, rolling forward from a later date, a past tick
staying put, the last month, the exam month, after the exam, a year boundary, nothing
published, duplicate and unknown weak subjects) and 55 browser checks at 390, 320 dark
Khmer and 1280 (real month names, no invented numbers, specific mission links, every row
opening its month, items opening directly, the exam month's simulation, bad addresses,
history with real minutes and ticks, Khmer labels, the loading and failed states with no
false "coming soon", no sideways scroll, no page error). **Not verified: a real account
with real history.**

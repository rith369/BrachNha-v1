# BrachNha — Change Report

A plain-language log of what changed in the app, written for the team rather than for
developers. Newest entries first.

- **This file** = what changed, why, and what you need to know or re-test.
- **CLAUDE.md** = the technical context file the AI coding assistant reads. Different audience,
  much more detail. You don't need to read it.

Each entry lists the commit it landed in, so you can match it to a version of the site.

> **Note on the older commit codes.** When the project moved to its new folder, the repo
> was started fresh and the whole history up to 22 Aug 2026 was collapsed into a single
> commit, `2d20f12`. The codes shown on entries below that date (`1e4916b`, `8469c05`,
> `f8e6ef0`, `799a11b`) are from the old repo and no longer resolve — they are kept as a
> record of the order things happened, not as something you can look up.

---

## 1 Sep 2026 — XP, streak and coins now show on every screen

*Landed in commit `PENDING`.*

**Why.** The small "⚡130 🔥3 🪙5" counter row only showed up inside lessons and
on the subject path. You asked for it everywhere, since it's the core of the
app's reward loop.

**What changed.**

- That counter row now sits at the top-right of every ordinary screen — Home,
  Study, ការអនុវត្ត, Mock Exam, Progress, Game, Roadmap, Grade Prediction,
  Leaderboard, Profile, the subject path — not just inside a lesson.
- It also gained a fourth pill: your Level, matching what Home's own header
  already showed, leading the row ahead of XP.
- It stays OFF the screens where it was already deliberately hidden: while
  actually answering a mock exam or a placement test (so it can't turn a test
  into a scoreboard), and on the one-way roadmap screen right after signup.
  Lessons, sections, flashcards and quizzes still show their own copy exactly
  as before.
- Nothing about how XP, streak or coins are earned changed — this is purely
  about where the numbers are visible.

**What to re-test.** Open a few different pages and confirm the counters show
up top-right and stay in sync with each other (earning XP from a flashcard/quiz
should update the number everywhere, since it's all one number under the hood).
Confirm a running mock exam still hides it.

---

## 1 Sep 2026 — A new look for physics' Quiz path (design sample)

*Landed in commit `PENDING`.*

**Why.** You asked to see the "path" style used for lessons re-done in the style
of the Mimo app for the Quiz tab, using the subject's own colour — before
supplying the real physics chapter, lesson and quiz names.

**What changed.**

- Open ការអនុវត្ត → Quiz and the Physics (រូបវិទ្យា) tile is now the one lit-up
  card on the page — tap it and you land on a winding trail of square tiles
  connected by rounded lines, on a dotted background, in physics' blue.
- The top of that screen now matches the closer reference you sent: an
  illustration card with a progress bar, a solid blue banner naming the current
  chapter and lesson with a count badge, and a small "ចាប់ផ្តើម" (Start) tag
  pointing at the next tile.
- This is still a look-and-feel sample. The six tiles are placeholders with
  made-up names and are not tappable yet — there is no real physics quiz
  content behind any of them. Once you send over the real chapter, lesson and
  quiz names, this gets filled in with the actual content and the tiles become
  tappable.
- Every other subject, and Physics' own Flashcard tab, are unchanged.

**What to re-test.** Open ការអនុវត្ត → Quiz → រូបវិទ្យា and confirm the new
path renders correctly in both light and dark mode, and that every other
subject/tab combination still shows the plain list as before.

---

## 1 Sep 2026 — Flashcards & Quiz: the ការអនុវត្ត page is now real

*Landed in commit `PENDING`.*

**Why.** "Flashcards/Quiz" had been sitting in the side menu as a greyed-out
"Soon" item since the app was built. Flashcards only existed as one step buried
inside a lesson, and practice questions as another — there was no way to sit down
and just revise. This builds the page.

**What changed.**

- **A new ការអនុវត្ត page.** Open it from the side menu (it is no longer greyed
  out). It works like the Mock Exam page: two tabs across the top, and a grid of
  subject cards underneath.
- **Tab 1 — Flashcard** covers four subjects: រូបវិទ្យា, គីមីវិទ្យា, ជីវវិទ្យា and
  ប្រវត្តិវិទ្យា. These are the subjects you revise by remembering things, which
  is what flashcards are good for.
- **Tab 2 — Quiz** covers every subject, including គណិតវិទ្យា, ភាសាខ្មែរ and
  whichever language you chose when you signed up.
- **Everything is organised by lesson.** Tap a subject and you get that subject's
  lessons, grouped under their chapters — exactly the same list the subject's
  study path shows, so the two screens always agree. Each lesson has its own set
  of flashcards and its own quiz.
- **Doing a deck or a quiz takes over the screen**, the same way a lesson does:
  the menus disappear so there is nothing to do but the work. **KruAI stays
  available** — you can still ask it why an answer is what it is. That is on
  purpose: this is revision, not a test.
- **The quiz tells you straight away** whether you were right, and shows the
  explanation, rather than making you wait for a score at the end. A correct
  answer earns XP and coins.
- **Finishing a deck or a quiz now ticks off the "flashcards" and "practice"
  rows** on your daily checklist on the Home page and in the Roadmap's Daily
  Mission. Until now those two rows could only be ticked by hand — there was
  nothing in the app that actually completed them.
- **Practice scores do NOT appear in your mock exam history.** That list is for
  mock exams only, and it feeds KruAI's picture of how you are doing on real exam
  papers. Practice is deliberately kept separate.

**What to re-test.**

- The side menu: ការអនុវត្ត should be tappable now, and no longer show "Soon".
- Both tabs, and a few subjects in each. Check the subject artwork and colours
  look right in both light and dark mode.
- Tap into ជីវវិទ្យា: you should see all 7 lessons under their 3 chapters, the
  same as its study path.
- Nothing else on the app should have changed. The Home, Study, Mock Exam,
  Progress and Roadmap pages were not touched.

**One thing to know before you look.** **There is no flashcard or quiz content
yet.** Every subject card shows "ឆាប់ៗនេះ", is greyed out, and **cannot be
tapped** — exactly like the subjects with no lessons on the Study page. So right
now the page opens, both tabs work, but nothing can be entered. That is
deliberate rather than unfinished: a card you can tap that leads nowhere useful
reads as a broken app, so a card with nothing behind it does not look tappable at
all. It is the same rule the Study page already follows.

The page, the tabs, the subject cards and the lesson lists are all real and
finished — what is missing is the questions and cards themselves, which have to
be written. The moment content is written for a lesson, that subject and that
lesson turn on by themselves with no further work. The screens that run a deck
and a quiz are built and were tested with stand-in content before it was
removed.

---

## 28 Aug 2026 — A real database behind the app (Supabase)

*Not yet committed. The two Supabase dashboard steps have now been done, and saving was confirmed working end to end on 28 Aug.*

**Why.** Everything a student had — their name, XP, streak, finished lessons, exam
scores, every KruAI conversation — lived only in the browser they used. Clearing
the browser's data, or switching phones, lost all of it, and there was no way for
anyone to see how students were actually doing. The app now has a real database
behind it.

**What changed.**

- **Nothing looks different.** No new screens, no login step, no sign-up form. The
  app behaves exactly as it did; the difference is that the work is now also saved
  somewhere that survives the browser.
- **Students still don't have to make an account.** They type their name and pick a
  language as before. Behind that, an invisible account is created for them so their
  work has somewhere to belong.
- **The app still works completely offline.** Every screen reads from the browser
  first, exactly as before, and the database is written to in the background a few
  seconds later. If the phone has no signal, or the database is down, or it was
  never set up — nothing breaks and nothing is lost. This matters for students on
  patchy mobile data, and it is the reason the app was not simply rewired to read
  from the database directly.
- **Eight tables** now hold: the profile and survey answers, XP/level/coins/streak,
  scheduled placement tests, signed roadmap pledges, daily tasks, mock exam results,
  finished lessons, and the KruAI conversations.
- **Each student can only ever see their own data.** This is enforced by the
  database itself, not by the app being careful — even a modified copy of the app
  cannot read anyone else's rows.
- **Two things were quietly upgraded on the way**, because the database made them
  nearly free:
  - **Daily tasks are now kept per day**, not just for today. That is the missing
    piece the Progress heatmap needs to show real activity instead of sample data.
  - **Exam attempts are now labelled** by where they came from — mock exam, past
    paper, or placement test. Past-paper results can now be recorded without being
    counted as mock exam scores, which would have made the Home screen's
    "from mock exams" number wrong.

**What this does NOT do yet.** It is a **backup**, not sync between devices. The
same student on a phone and a laptop still gets two separate accounts. Making one
account follow them needs an email or phone sign-in step, which is a product
decision nobody has made yet — the database is already built for it, so it is a
small change when you want it.

**Where a student's email lives — and why the Authentication page looks empty.**
The Authentication → Users page shows each account with a **blank Email column**.
That is correct, not a fault: accounts are created invisibly, with no email and no
password, which is what lets students in without a sign-up step. The email address
they optionally type on the login screen is saved as ordinary profile information —
**Table Editor → profiles → the `email` column** — along with their name, age and
province. That is the page to look at to see who is using the app.

Putting the address on the account itself is possible, but it turns the login into a
real sign-up: the student would get a confirmation email and have to click a link
before anything saved. Worth doing the day BrachNha wants one account to follow a
student across their phone and their laptop; not worth it before then.

**Setup is done.** Both one-time dashboard steps have been completed and
`npm run db:check` passes all four checks. `supabase/README.md` has the steps written
out for the next environment.

**What to re-test.** Mostly that nothing regressed: log in, do a lesson, take a mock
exam, chat with KruAI, close the tab and reopen it. Everything should behave as
before. Then, in the Supabase dashboard's Table Editor, the same information should
be visible in the tables. Logging out should stop the syncing and start a fresh
account on the next login.

---

## 28 Aug 2026 — The first real lesson content: ៣.១.១ សេចក្ដីផ្ដើម

*Landed in commit `6f57162`.*

**Why.** The biology path was structure only — every node locked, nothing to open.
The first section's content has now been written, so ៣.១.១ សេចក្ដីផ្ដើម is a real,
playable lesson.

**What changed.**

- **៣.១.១ សេចក្ដីផ្ដើម is now open and tappable.** It is the only unlocked node on
  the biology path; the other 42 are still waiting for their content.
- **A section runs in two screens**, tapping បន្ត between them:
  - **screen 1** — សេចក្ដីផ្ដើម, ឧទាហរណ៍, the **3D brain**, then **two questions**
  - **screen 2** — មេរៀន, then ចំណាំសំខាន់ៗ, then កំហុស

  សេចក្ដីផ្ដើម and មេរៀន show no heading: the section name sits above the first,
  and the second was asked to drop its label.
- **A video player sits at the top of screen 1**, with your illustration as its
  picture, a play button, the run time and a scrub bar — the design you sent.
  **There is no video behind it yet**, so it is a picture of a player rather than
  a working one: nothing in it responds to a tap. Record a video later and these
  become its real controls.
- **The 3D brain is on screen 1**, under the examples — the same model as the old
  ខួរក្បាល lesson, not a second copy of the file, so it costs nothing extra to
  download and only loads on sections that actually use one.
- **A counter bar sits at the top of every lesson** — XP, streak, coins, and a
  light/dark button — the same one already on the subject path. It is deliberately
  **not** shown during the mock exam or placement test: a running score in front
  of someone being measured changes what the test measures.
- **The 3D brain is now labelled ខួរក្បាលរបស់មនុស្ស** in its top-left corner.
- **A correct answer earns 10 XP and 5 coins**, added the moment you tap it, and
  once per question. A wrong answer earns nothing — the right answer appears
  straight away, so paying for a guess would make guessing worth as much as
  thinking. Finishing the section still gives its own +20 XP on top.
- **Two questions follow it**, each with its ស្ថានភាព scenario. Tapping an answer
  shows straight away whether it was right, with the reason. **បន្ត stays greyed
  out until both are answered** — nothing is scored, so there is no reason to let
  a student walk past them.
- **The lists have bullet points now.** The four points in សេចក្ដីផ្ដើម, the four
  systems in មេរៀន and the two ឧទាហរណ៍ were running together as plain paragraphs.
- **No emoji anywhere in a section.** The headings use proper icons instead, so
  they look the same on every phone rather than changing shape between Android
  and iPhone. The finished screen uses a trophy for the same reason.
- **Each part is a plain white card with one coloured stripe down its left edge**
  — blue for the lesson, yellow for examples, purple for notes, pink for a
  misunderstanding with the ✍️ ការពិត answer nested inside it in green. The colour
  is deliberately kept to the stripe alone: an earlier version tinted the whole
  card and the screen turned into a colour chart, which made the stripes stop
  meaning anything. Keeping the ❌ and ✍️ halves in one card is also deliberate —
  a student should not be able to read the wrong version on its own.
- **A back button** sits to the left of បន្ត, so a student can return to an
  earlier part to re-read it. It is hidden on the first part (the ✕ closes the
  section there) and on the finished screen.
- **Finishing gives +20 XP and coins**, and the node comes back marked done with
  the counter at ១/៤៣ — the same rewards the older lessons give.
- **The path now opens on ៣.១.១ by itself.** Last round that needed a manual
  pointer; now that the section has content, the page finds it the normal way —
  "open at whatever is unfinished". The pointer is no longer doing the work.

**Things to know.**

- **The test at the end is built but hidden.** You said the question is coming
  later. When you send it, the section becomes five steps instead of four and the
  progress bar adjusts on its own — nothing else needs changing.
- **One typo was corrected.** The last item of the ក្រុមការងារទាំង ៤ list ended in
  a Japanese full stop (。) rather than a Khmer ។. Everything else is exactly as
  you wrote it.
- **The two old lessons are untouched.** ខួរក្បាល with its 3D brain still runs its
  own older six-step format at its own address. New content uses the new shape.

**What to re-test.** Study → ជីវវិទ្យា. The path should open on ជំពូក ៣ · តម្រូវប្រសាទ
with a ចាប់ផ្តើម bubble on ៣.១.១. Tap it and read all four steps, checking the Khmer
against your original. Finish it, confirm the XP goes up and the node turns green,
then reopen the path and check the counter says ១/៤៣.

**What I need from you next.** The quiz question for ៣.១.១ (question, choices,
correct answer, explanation), and the content for ៣.១.២ onwards.

---

## 27 Aug 2026 — The biology learning path now follows the real textbook

*Landed in commit `6f57162`.*

**Why.** Up to now the subject path made up its own structure, because there was no
real curriculum to follow. The Grade 12 biology table of contents has now been
entered, so the path shows the actual chapters and lessons a student will study.

**What changed.**

- **The path has three levels now**, matching the book: **ជំពូក** (chapter) →
  **មេរៀន** (lesson) → **ផ្នែក** (section). Each green banner is one lesson, with
  its chapter named in small text above it, and the round nodes below it are that
  lesson's sections.
- **Biology has all 3 chapters and all 7 lessons** — 43 nodes in total. Numbering
  matches the book exactly: **3.1.1**, **3.1.2** and so on.
- **ជំពូក ៣ · តម្រូវប្រសាទ has its real section names**, the seven you sent:
  សេចក្ដីផ្ដើម, តម្រូវប្រសាទសត្វឥតឆ្អឹងកង, តម្រូវប្រសាទសត្វឆ្អឹងកង,
  ប្រព័ន្ធប្រសាទរបស់មនុស្ស, កំហុស, សេចក្តីសង្ខេប, តេស្ត. Adding one at the front
  renumbered the rest on its own — the numbers come from position, so they can
  never fall out of step with the order.
- **The section name is now printed under each node**, not just the number. That
  is new — before this, a node showed only "1.1" and you could not tell what it
  was. It also means the maths and other paths now show their lesson names.
- **កំហុស / សេចក្តីសង្ខេប / តេស្ត are added to the end of every lesson**, since those
  three are the same for any topic. Only the first three sections change per
  lesson, and those are placeholders (ផ្នែកទី ១, ២, ៣) until you send the names. A
  lesson can hold any number of sections — តម្រូវប្រសាទ has seven, the rest six.

- **Opening ជីវវិទ្យា now jumps straight to ជំពូក ៣ · តម្រូវប្រសាទ**, instead of
  starting at chapter 1 and making you scroll past twenty locked nodes. Once
  lessons have real content this happens on its own — the page will open at
  whatever you have not finished yet. Until then it is pointed at ជំពូក ៣ · មេរៀនទី ១
  deliberately, because that is the lesson being written.
- **More space between a lesson's green banner and the first circle below it**,
  which were nearly touching.

**Things to know.**

- **Every node is locked, on purpose.** This is the structure, not the content —
  nothing is tappable yet because no lesson has been written behind it. That was
  the point of this round: check the shape is right before content is written
  against it.
- **The two old biology lessons (រាងកាយមនុស្ស and ខួរក្បាល, the one with the 3D
  brain) no longer appear on the biology path.** They were stand-ins from before
  the real curriculum existed and are not part of the book's chapter list.
  Neither has been deleted — both still open at their own address, and the 3D
  brain is untouched.
- **The Study page card still says "២ មេរៀន" for biology.** That number counts
  lessons that have real content, and there are still only two. It will start
  matching the path once lessons are actually written.
- **Chapters 1 and 2 have no names yet** — the scan was too blurry to read the
  Khmer safely, so the banners show ជំពូក ១ and ជំពូក ២ on their own rather than a
  guessed title. Send the names and they drop straight in.
- **កំហុស is a placeholder for a feature that does not exist yet** — collecting the
  mistakes a student makes. Its place in the path is reserved; nothing is built.

**What to re-test.** Open Study → ជីវវិទ្យា. Scroll the whole path: three chapters,
seven lesson banners, six nodes under each, all locked. Check ជំពូក ៣ · តម្រូវប្រសាទ
shows your seven names on nodes 3.1.1 to 3.1.7. Then open a different subject
(គណិតវិទ្យា) and confirm its path is unchanged and still playable.

**What I need from you next.** The chapter 1 and 2 titles, their lesson titles, and
the section names for the other six lessons.

---

## 27 Aug 2026 — Mock Exam is now split into past papers and practice papers

*Landed in commit `6b62c4e`.*

**Why.** The Mock Exam tab was a single "start the exam" button over one fixed
10-question practice set. It had nowhere to put real past exam papers. It is now
organised the same way the Study page was, so the real Bac II papers have a home
to arrive into.

**What changed.**

- **Two tabs.** *វិញ្ញាសារឆ្នាំចាស់* (past-year papers) is the new default. *វិញ្ញាសារបង្កើតថ្មី*
  holds the practice exam that was already there — same questions, same scoring,
  same history. Nothing was removed.
- **Past papers are browsed by year, then by subject.** A row of exam-session
  chips across the top (២០២៥ down to ២០២១) and, under each, one card per subject
  with a picture, its name and a *តេស្ត* button.
- **Every past paper is empty right now, and that is on purpose.** The screen is
  built and waiting; the questions come from you. A paper with no content yet
  shows a *ឆាប់ៗនេះ* ("coming soon") tag, and tapping *តេស្ត* says the content is
  being prepared rather than doing nothing. **When you send the questions, they
  drop straight in — the cards turn on by themselves, no redesign needed.**
- **The page is in Khmer, always**, matching the Study page. The questions inside
  an exam still follow the app's language toggle, as they always did.
- **The page title is fixed.** In Khmer it used to read *ប្រឡងល្បិច*, which means
  "trick exam" — a mistranslation. It now reads *វិញ្ញាសារត្រៀមប្រឡងបាក់ឌុប*, matching
  the menu.
- **A wrong subject label is fixed.** In the practice exam, physics and chemistry
  questions were both labelled "Biology". They now show their own subject.

**What to re-test.**

1. Open Mock Exam. It should land on *វិញ្ញាសារឆ្នាំចាស់* with ២០២៥ selected. Tapping
   a different year should change the heading and the cards under it.
2. Tap *តេស្ត* on any card — a short "being prepared" note should appear under
   that one card only.
3. Switch to *វិញ្ញាសារបង្កើតថ្មី* and run the practice exam end to end. Your score,
   your XP and the "previous results" list should behave exactly as before.
4. **The important one:** start the practice exam, then press your browser's back
   button. The menus and bottom bar must come back. (While an exam is running
   they are deliberately hidden so nothing distracts you.)
5. Check the page in dark mode and at a small phone width.

**Worth knowing.** Past-paper attempts will be kept separate from practice-exam
results — they will not be mixed into the "from mock exams" figure on the home
screen, because a real past paper and a 10-question practice set are not the same
thing. Past papers will earn XP just the same.

---

## 27 Aug 2026 — Tapping a subject now opens a learning path

*Landed in commit `6f57162`.*

**Why.** Tapping a subject went straight into its first lesson, which hid everything else
the subject contained and gave the student no choice. Rebuilt around a supplied reference
so a subject opens a **path of short sessions**, the way Duolingo and Mimo work.

**What changed.**

- **Tapping a subject card opens that subject's path** instead of a lesson. Each stop on
  the path is one short session; tapping a stop opens the lesson as before.
- **The path winds down the screen** with dashed lines joining the stops, in the subject's
  own colour — biology's path is green, chemistry's teal, and so on.
- **Stops show their state.** A green play button means ready, a tick means finished, a
  dashed padlock means the content is not written yet. Locked stops are deliberately not
  tappable, so they cannot look broken.
- **Finishing a lesson now ticks its stop off** and fills the progress bar at the top of
  the path. That progress is saved.
- **A small stat bar** sits at the top showing XP, streak and coins.

**Coins are new, and they are real.** They are earned automatically alongside XP — every
20 XP of work also earns 5 coins — and they are saved with the rest of your progress.
**Nothing spends them yet**; that is a separate decision about what they should buy.

**Two things from the reference were deliberately not copied.** The reference is a dark
space-themed game, and copying its look would have made this the only screen in the app
that does not match the others — so the page uses BrachNha's own colours and works in
light and dark like everything else. And the reference's energy/keys/gems meters were left
out: the app has no such system, and putting fake ones on screen would promise something
the product does not do. Everything in the stat bar is a real, saved number.

**Most stops are locked, because the lesson content is not written yet.** Biology has two
real sessions, maths has two; every other subject shows locked placeholders. As you supply
lessons, real stops appear in their place automatically.

**The path now has a Duolingo-style look.** The stops are chunky buttons that sit on a
darker edge and press down when tapped, each unit has a coloured banner across the top, and
a small bobbing **ចាប់ផ្តើម** ("start") bubble points at whichever stop you should do next.
The dashed trail between stops was redrawn — it used to kink slightly at every stop, and
now flows as one smooth line.

**None of that needed pictures.** Almost everything that makes Duolingo look like Duolingo
is styling rather than artwork, so it was all built in code.

**The one exception is a mascot** — a character beside the path. That genuinely cannot be
done without a drawing. The space for it is built and waiting: put a picture at
`public/mascot/idle.webp` and it appears beside the path on tablet and desktop. Until then
nothing shows and nothing looks broken. It is deliberately hidden on phones, where a
character would cover the very stops it is meant to cheer on.

**What to re-test.** Open Study, tap ជីវវិទ្យា (biology), and check the path appears. Tap
the first stop, finish the lesson to the end, and confirm the stop turns into a tick, the
progress bar moves, and your coins go up. Check the back arrow returns you to Study. Try
it in both light and dark, and on a narrow phone.

---

## 27 Aug 2026 — The Study page is now a grid of subject cards

*Landed in commit `6b62c4e`.*

**Why.** The Study page listed individual lessons as plain rows. That meant it grew a row
every time a lesson was added, and a subject had no page presence of its own. Rebuilt to a
supplied reference design so the page is ready for the real Grade 12 lesson content that
is coming.

**What changed.**

- **Two tabs.** *មូលដ្ឋានគ្រឹះ* (Foundation) shows **only math, physics and chemistry**, as
  requested. *មុខវិជ្ជា* shows all Grade 12 subjects — those three plus biology, history,
  Khmer literature and whichever language was chosen at sign-up.
- **Each subject is a card** with its name, a picture, a short description, and how many
  lessons it holds with a rough total time. Cards stagger into two columns on a phone and
  spread to three or four on a bigger screen.
- **The page is in Khmer, always** — even if the app is switched to English. That was asked
  for deliberately. The menu and tab bar around it still follow the language toggle, so in
  English mode you will see English navigation around a Khmer page. That is expected.
- **The streak counter** now appears at the top of the page, next to the title. It is your
  real streak, not a placeholder.
- **Every subject now has its own colour** — Math blue, Physics indigo, Chemistry teal,
  History amber, Biology green, English red, French pink, Khmer orange. The card's tint,
  border, icons and play button all follow it, so a student can recognise a subject by
  colour before reading its name.

**One adjustment to the colours you supplied, and why.** The eight hex values are perfect
as *fills* — they are used exactly as given on the play button, a solid circle with a white
arrow. But used as small text or small icons they were too pale to read: measured against
the page background, all eight fell below the accessibility standard, some as low as
2.1 against a required 4.5. So the small icons and text use a slightly deeper shade of the
same colour, and dark mode uses a slightly lighter one. Same colour identity, readable in
both themes. Every value was measured rather than eyeballed.

**To change a picture later**, drop a replacement into `public/subjects/` named after the
subject — `math.webp`, `physics.webp` and so on. It appears automatically with no further
work. A subject with no file simply shows a coloured tile with its icon instead, so a
missing picture never looks broken. `design/subjects.md` explains the naming and sizes.

**Name the files in lowercase**, exactly matching the list in that document. The name is
the only link between a file and its card, and a mismatch fails quietly — the card simply
keeps its coloured tile rather than showing anything broken. So if a picture doesn't turn
up, check the capitalisation first.

**The images are WebP, and there is now a converter for them.** WebP is a modern picture
format that is typically 25–35% smaller than PNG or JPG at the same quality, which matters
on mobile data. Your stock art will arrive as PNG or JPG, so the project now has a script
that converts it:

```
node scripts/webp.mjs art/*.png
```

That reads a folder of pictures, crops them to the right shape, resizes them, converts them
to WebP and puts them straight into `public/subjects/`. It prints the size of every file
before and after, and warns you if one comes out too big. Only one file per subject is
needed — eight in total, not sixteen.

**Please keep those images small — around 40 KB each.** This is the one thing that can
quietly undo recent work: the app logo arrived at 431 KB and shrinking it was a large part
of cutting the first load from 487 KB to 183 KB. Eight full-size stock illustrations would
put that straight back. The converter warns you when a file goes over.

**Most subjects say "ឆាប់ៗនេះ" (coming soon)** because they genuinely have no lessons yet —
only math and biology do. Those cards are deliberately not tappable, so they cannot look
broken by responding to a tap with nothing. As you supply lessons, the counts, the times
and the play buttons appear on their own.

**All eight subject pictures are now in**, totalling 199 KB for the whole set — less than
the app sends before showing its first screen, and they only download when someone opens
Study.

**There is now one small credit line at the bottom of the Profile page**, reading
*"រូបភាព៖ Designed by Freepik"*. It is there because the illustrations came from Freepik's
free tier, and that free licence only permits using them if Freepik is credited somewhere
visible. Without the line the app would be using the pictures with no permission behind
them, which is the kind of thing that surfaces during funding or partnership checks.

It is deliberately out of the way — not on the cards, not on the Study page — and no
student is likely to notice it. **Please don't remove it while these pictures are in use.**
If you would rather it were gone entirely, one month of Freepik Premium (around €12,
cancellable straight after) permanently licenses whatever you download during it with no
credit required, and the line can then come out.

**Two notes on the French picture.** Its original file has "designed by freepik.com"
printed across the bottom; the way the picture is cropped for the card removes it, so it
is not visible in the app. It is also a greeting-card design rather than a study
illustration — it has placeholder nonsense text on it and is about Paris rather than
learning French. Too small to read on the card, but worth swapping if French ever becomes
a real option for students.

**No lesson content was written or deleted** — that is yours to provide. The existing
biology foundation lesson was left in place.

**What to re-test.** Open Study, switch between both tabs, and tap a subject that has
lessons (គណិតវិទ្យា or ជីវវិទ្យា) to check it opens. Check both light and dark, and check a
narrow phone. Then switch the app to English and confirm the Study page stays in Khmer.

---

## 26 Aug 2026 — Score Trend replaced with a Weekly Learning Activity chart

*Landed in commit `6b62c4e`.*

**Why.** Asked to rebuild the Score Trend chart on the Progress page to match a specific
reference design exactly — not just borrow its style. The reference was a whole different
card: a "Weekly Learning Activity" chart with an icon badge, a toggle between XP Points
and Study Hours, and a Mon–Sun week instead of a 4-week trend.

**What changed.** The card is a new one, replacing Score Trend rather than restyling it:

- **A small gradient icon badge** now sits next to the title, matching the reference.
- **The toggle switches between XP Points and Study Hours** — two real things students
  earn each day — instead of the old Score vs Target comparison. Each has its own scale
  (XP runs 20–120, Study Hours runs in fractions of an hour), and the chart's numbered
  gridlines adjust to whichever is showing.
- **The chart now covers one week, Monday to Sunday**, instead of 4 calendar weeks.
- **The gradient fill under the line and the bigger ring-style dots** carry over from the
  first pass at this.
- **The footer line reads "Highest productivity on Sat (120 XP)"** with a green dot, plus
  a "+28% vs last week" badge in the corner — both update when you switch the toggle.
- Fixed a pre-existing bug found while rebuilding this: **the numbers along the left side
  of the chart (20, 45, 70…) were not showing at all**, on this chart and its Grade
  Prediction sibling, cut off past the left edge of the card. That's now fixed everywhere
  it applied.

**What to re-test.** Open Progress, scroll to Weekly Learning Activity, and tap between
XP Points and Study Hours — check the chart, the left-side numbers, and the footer line
all update together. Check it in dark mode and on a phone-width screen.

---

## 26 Aug 2026 — The Study Activity calendar on Progress now actually does something

*Landed in commit `6c82931`.*

**Why.** The calendar-style grid on the Progress page (Study Activity) was decoration —
30-odd coloured squares with no real meaning behind the colour, and tapping one did
nothing. It looked like it should work like GitHub's contribution graph, but wasn't
wired up to.

**What changed.**

- **Every square is now a real day, and tapping one shows what happened that day.** Tap
  a square and a small label pops up above it — "Today · 13 questions", or "Sun 2 Aug ·
  No activity" for a quiet day. Tap it again, tap anywhere else, or press Escape to close
  it.
- **The grid now lines up with real dates**, ending on today, rather than being 28
  arbitrary squares with no calendar behind them. Today's square gets a small ring around
  it so it's easy to find at a glance.
- **Days that haven't happened yet are shown differently on purpose** — an empty dashed
  outline instead of a coloured square — so "no activity yet because it's the future" no
  longer looks the same as "studied nothing that day."
- The colour of each square is now driven by a real number of questions answered, the
  same number the tap popup shows — before, the colour was just a made-up 0–4 value with
  nothing backing it.

**What to re-test.** Open Progress, scroll to Study Activity, and tap a few different
squares — including ones near the left and right edges of the grid, to make sure the
popup stays on-screen rather than running off the card. Check it in both light and dark,
and on a phone-width screen.

---

## 25 Aug 2026 — The app is much faster, especially moving between pages

*Landed in commit `6c82931`.*

**Why.** The app felt slow, most of all when tapping from one page to another. The logo
was the suspect. It turned out to be a real problem but not the main one — it is only
paid once, on the first load, and then cached. Four other things were being paid **every
single time you changed page**.

**What was actually wrong, and what changed.**

**1. The charts replayed their animation every time you opened Progress.** Progress has
two charts and Grade Prediction has one, and each drew itself in over a second and a
half — every visit, not just the first. So the page appeared and then sat there
animating before it looked finished. The charts now appear immediately, fully drawn. The
data on them is fixed demo data that never changes, so the animation was not telling
anyone anything.

**2. Everything on the Quest Map was pulsing at once.** The glowing pulse was on *every*
phase marker — with the exam a year out, that is around twelve glowing circles animating
non-stop, on the screen students land on straight after sign-up. It was also drawn in a
way phones find expensive. **Only the start and finish markers pulse now**, and the
pulse itself was rebuilt so phones can hand it to the graphics chip instead of redrawing
it sixty times a second. The FAB (the chat button, on every screen) got the same fix.

**3. Every screen had two scrollbars stacked on top of each other** — one belonging to
the page, one belonging to the app frame around it. Every drag of a finger made the
browser work out which one you meant before anything moved. The outer one is gone.

**4. The frosted-glass blur behind the bottom tab bar** was being recalculated on every
frame while you scrolled — one of the most expensive things you can ask a phone to do.
The bar is now solid, which is what the frosting was imitating anyway. Same for the
floating "your ranking" card on the Leaderboard.

**The logo, separately.** It was supplied as an app-icon tile made of 426 traced shapes —
431 KB — and displayed at the size of a fingernail. It is now a small picture instead:
**4.6 KB, down from 431 KB**, and it looks the same. The original artwork is kept safely
in the project under `design/` and is no longer sent to phones.

**The app is also split up now.** It used to send every screen to your phone before
showing you anything — one 1 MB file. Each screen is now its own piece, and the rest
quietly download in the background once the first screen is up, so tapping a tab is
still instant.

**One font stopped being downloaded by everyone.** Caveat — the handwriting font — is
only ever used for the signature on the commitment pledge, but every student was
downloading it on every visit. It is now fetched only when a signature is actually shown.

**The result.** What a phone downloads before it can show the first screen went from
**487 KB to 183 KB — a 62% cut.**

**What to re-test.**

- Tap around between Home, Study, Mock Exam, Progress, Game, Leaderboard, Quest Map and
  Grade Prediction. It should feel immediate. Charts should already be drawn.
- Scroll every page hard, on a phone, and check nothing sticks or scrolls the wrong box.
- Check the Quest Map: only the first and last markers should glow.
- Switch to Khmer and check the menu, the Quest Map and a lesson still read correctly.
  **This is the most important check** — the font change is the one that could break
  Khmer text.
- Sign the commitment pledge and check your typed name still appears in handwriting.
- Check the logo still looks right on Home, in the menu, and on the sign-in screen.

---

## 25 Aug 2026 — The survey asks whether you've studied already

*Landed in commit `8295b45`.*

**Why.** Sign-up never asked whether a student had already covered some of the syllabus
— everyone was treated as starting from zero. That matters, because a student who has
already worked through half the year needs a different plan from one opening the book
for the first time.

**What changed.** Sign-up is now **four steps** instead of three, with a new question
first:

1. **Have you already studied any Bac II lessons?** — new
2. Favourite subjects
3. Weak subjects
4. Target grade

**The new question is deliberately half-built, and says so.** "Not yet — I'm starting
fresh" works and leads into the survey exactly as before. **"I've studied some" is
switched off** — greyed out with a "Soon" tag — and a note sits under it, visible
without tapping anything, explaining what it will do:

> 📝 If you've studied some lessons already, we'll ask which ones and give you a short
> test on them. Coming soon — choose "Not yet" to continue.

That note is there so anyone looking at the screen — a student deciding, or anyone
evaluating the app — can see what the feature is meant to do without having to press a
greyed-out button to find out. The branch itself needs the lesson list and the tests,
which don't exist yet.

**The weak-subjects step is now the same for all three main subjects.** Math, physics
and chemistry each offer Weak / Not weak / Not sure, and "Not sure" shows:

> 🔬 Placement test coming soon — answer based on how you feel:

with Weak and Not weak underneath. Math used to be the odd one out — it was the only
subject with a real test built in, and it also let you book a test for a future date.
Both were removed. A test that works for one subject out of three reads as a bug rather
than a feature, and booking a day for a test nobody can sit yet promises something the
app can't keep. Nothing in sign-up asks for a date any more.

**What to re-test.**

- Sign up as a new student. The first question should be about prior study, with the
  note readable straight away. Tapping "I've studied some" should do nothing at all;
  "Not yet" should move on.
- On the weak-subjects step, check math, physics and chemistry all behave the same way
  — "Not sure" shows the coming-soon line and asks you to pick Weak or Not weak. There
  should be no "Test me now", no "Schedule for later" and no date box anywhere.
- The progress bar should fill in three equal moves, ending on the target-grade step.
- Finishing should go straight to a normal, fully generated roadmap.
- Check the whole flow in **Khmer** as well as English. The Khmer wording of the new
  note has not been reviewed by a Khmer speaker yet — please read it and tell us
  anything that sounds wrong.

---

## 25 Aug 2026 — The exam countdown works itself out

*Landed in commit `1051829`.*

**Why.** The last question in the sign-up survey asked students how many months were
left until Bac II, from a grid of 1 to 12. Two problems with that. It asked a student
to work out something the app already knows — Bac II is a national exam on one fixed
date, the same for everybody. And the answer was frozen the moment it was given: a
student who chose "12" in August was still being told they had 12 months left the
following year, with a study plan built on that wrong number.

**What changed.** The app now knows the exam is on **10 August 2027** and counts down
to it by itself. The survey is **three steps instead of four** — favourite subjects,
weak subjects, target grade — and finishing the third one goes straight to the roadmap.

**Where students see the countdown.**

- **Home** now shows the real number of days left instead of an estimate. It used to
  multiply the months they picked by 30, so it was always a round number and usually
  wrong by a week or two.
- **The Roadmap** card shows the days left with the exam date underneath it, in place
  of the old "6 months".
- **The daily mission** (how many lessons, practice questions and flashcards a day)
  now gets more demanding on its own as the exam gets closer, instead of staying
  wherever the student's original answer put it.
- **The AI Mentor** is told the exact number of days remaining, so advice about pacing
  is based on the real timeline.

**The signed commitment does not change.** The pledge students sign still records the
months they had left on the day they signed it — that is a promise they made at a
moment in time, and it would be wrong to quietly rewrite it later.

**When the date needs changing** for next year's students, it is a one-line change in
one file. Nothing else stores a timeline.

**What to re-test.** Sign up as a new student and confirm the survey now ends at the
target-grade step, with the "Generate Quest Map" button there and no months question.
Check Home and the Roadmap show the same number of days, and that the date reads
10 August 2027 in both English and Khmer. Then check an **existing** account that was
created before this change — it should show the correct countdown too, not whatever
months figure it had stored.

---

## 24 Aug 2026 — The BrachNha logo now sits next to the app name

*Landed in commit `1f08709`.*

**Why.** The app had a name but no mark. Wherever "BrachNha" appeared, a decorative emoji
was standing in for a logo — and it wasn't even the same emoji twice.

**What changed.** The logo now appears beside the **BrachNha** name in all four places the
name is shown:

- the **Home** screen header, above your level and XP
- the **menu** — both the slide-out menu on a phone and the permanent sidebar on a laptop
- the **sign-up** screen
- the **survey** screen that follows it

**The emoji next to the name are gone.** They were doing the logo's job, and a logo plus an
emoji looks cluttered. Worth knowing: the four screens had each drifted to a *different*
decoration — crossed swords on sign-up and survey, a sparkle in the menu, and a slightly
different sparkle on Home. All four now show the one logo.

**The large crossed-swords picture in the middle of the sign-up and survey screens is
untouched.** That is a separate illustration, not the name, so it was left alone. If you'd
like the logo there too, that's a quick follow-up.

**How it looks in dark mode.** The logo artwork has a white background baked into it, so it
shows as a white rounded tile — like an app icon on a phone home screen — in both light and
dark. That is deliberate, and it's checked in both themes.

**Please re-test:** the Home header and the menu on a phone, and the sign-up and survey
screens, in **both light and dark**. Confirmed already: nothing overflows or gets cut off at
any screen size down to a 320px-wide phone.

**One thing to decide.** The logo file is large for what it is — 431 KB, because it was
auto-traced from a picture rather than drawn as a clean vector. It's downloaded once and
then cached by the browser, so it isn't a repeat cost, but on Cambodian mobile data it makes
the very first visit slower than it needs to be. It can be reduced substantially, most
simply by also supplying the logo as a small PNG for on-screen use. Not urgent, and nothing
is broken — flagging it as a known trade-off.

**The browser tab icon has not changed yet** — it's still the old favicon. That's a separate
file and a separate change; say the word and it can use the new logo too.

---

## 24 Aug 2026 — The chatbot is now called KruAI

*Landed in commit `11dca95`.*

**Why.** "AI Mentor" describes what it is; it isn't a name. KruAI is a name students can
remember and ask for.

**What changed.** Everywhere the chatbot appears it is now **KruAI** — the chat header,
the button that opens it, its greeting, and the messages shown if it's ever unavailable.
It introduces itself as *"Hi! I am KruAI, your BrachNha study mentor."*

**The name is spelled the same in Khmer.** The Khmer used to read **គ្រូ AI**, which is
literally "teacher AI" — and that is where the name comes from (**គ្រូ** = *kru* =
teacher). Rather than translating it, the Khmer now shows **KruAI** in Latin letters too,
so the chatbot has one name in both languages instead of two. Khmer students read គ្រូ
every day, so the name still reads naturally to them.

**It also knows its own name now.** The instructions the chatbot follows were updated so
that if a student asks who or what it is, it answers that it is KruAI, BrachNha's study
mentor. It is also now explicitly told **never to name the AI company or service behind
it**, even if asked directly — which closes the gap left by the previous change. That one
removed the credit from the screen; a student could still have simply asked the chatbot
what it was.

**Nothing about the answers changed** — same subjects, same style, same speed.

**What to re-test.** Open the chatbot and check the header reads **KruAI** and the
greeting names it, in **both English and Khmer**. Then, because its instructions were
edited, ask it two or three real Bac II questions — a limits problem and a probability
one — and confirm the answers are still laid out properly and still come back in Khmer.
Finally ask it directly, *"What are you?"* and *"Which AI are you built on?"*, and check
it says it is KruAI without naming any company.

---

## 24 Aug 2026 — The AI Mentor no longer names the AI service behind it

*Landed in commit `11dca95`.*

**Why.** The mentor's header carried a "Powered by Gemini AI" credit. We would rather not
advertise which AI service the app runs on.

**What changed.** That line is gone. The header subtitle now simply reads **"Ask
anything"** (**សួរអ្វីក៏បាន** in Khmer). Everything else about the mentor is untouched —
same answers, same speed, same behaviour.

**It is properly gone, not just hidden.** That credit turned out to be the *only* place
the service was named in anything the app sends to a phone or browser. We checked the
built app afterwards and the name now appears nowhere in it, so it can't be found by
someone poking around in the browser either.

**One thing already handled before this.** If the app is ever running without its AI
connection set up, a student sees only *"The AI Mentor is temporarily unavailable. Please
try again shortly."* The detailed setup message naming the service appears solely on a
developer's own machine, never on the live site.

**Worth flagging.** This hides the service from students and from anyone inspecting the
site. It is not a secret from the company providing it, and it does not change any
agreement we have with them — if there is ever a contractual requirement to display a
credit, that is a separate question to check.

**What to re-test.** Open the AI Mentor and confirm the header reads "AI Mentor" with
"Ask anything" underneath and no mention of any AI company. Check the same in Khmer. Ask
it a question and confirm replies still work normally.

---

## 24 Aug 2026 — The Leaderboard is live

*Landed in commit `11dca95`.*

**Why.** "Leaderboard" had been sitting in the menu as a greyed-out *Soon* item
since the start. It is now a real screen at **Menu → Leaderboard**.

**The one thing to understand about it: there are three separate leaderboards,
not one leaderboard with three numbers on it.**

- **🔥 Streak** — who has studied the most days in a row.
- **⭐ XP** — who has earned the most points from actual learning: lessons,
  practice, quizzes, daily goals.
- **⏱ Study Time** — who has put in the most productive study time.

They are ranked completely independently, so the same student can be **#12 on
streak, #18 on XP and #24 on study time at the same time**. That is not a bug —
it is the whole point. Three different kinds of effort, three different boards,
and no combined "overall" score anywhere.

**Why no combined score.** A single blended ranking would mean the student who
leaves the app open longest can climb it. Study time is shown because effort
deserves to be seen, but it is kept in its own board so it can never be traded
against learning. The Study Time board says so on screen: *"Only lessons,
practice and exams count — leaving the app open does not."*

**What a student sees**, top to bottom: their own progress card (rank, the
metric being ranked, the other two as smaller numbers, and how many places they
have climbed) → the three metric buttons → Weekly / Monthly / All-time → a
one-line explanation of what the current board ranks → a top-3 podium → the rest
of the ranking → and their own row pinned at the bottom of the screen whenever
it has scrolled out of view.

**Everything really does change when you switch.** Tapping a different metric or
a different time period re-sorts the whole board, re-orders the podium and
rewrites the personal card. The demo student sits at **#18** on XP weekly with
2,430 XP and *"Only 60 XP to reach #17"*; tap Streak and they are **#12** with a
12-day streak and *"Keep studying tomorrow to reach 13 days"*; tap Study Time and
they are **#24** with 8h 42m and *"48m to reach #23"*.

**Titles.** Every student carries a progression title — Beginner, Learner,
Scholar, Achiever, Expert, Master — based on their lifetime learning, not on the
board being viewed, so it does not change as you tap between tabs.

**The tone is deliberate.** Messages only ever point forward: *"You're #18 this
week"*, *"You're climbing! ↑ 3 positions"*, *"Only 60 XP to reach #17"*. There is
nothing that tells a student they are falling behind, and their own card never
shows a downward arrow. Other students' rows do show movement both ways, in
plain grey rather than red.

**The data is fake, on purpose** — 30 invented classmates, same approach already
used on Progress, Game and Grade Prediction. A real leaderboard needs a server
that can compare students, and a way to measure genuine study time rather than
"the app was open". The one real thing on the page is **the student's own name**,
which comes from their profile. 24 new student pictures were added for the
roster.

**What to re-test.** Tap all three metric buttons and all three time periods and
check the podium and the list re-order each time. Scroll down and check your own
row is highlighted with a "You" tag, and that the pinned card at the bottom
appears once it scrolls away and disappears when it comes back. Check it in
Khmer, in dark mode, and on a phone, a tablet and a laptop — the layout was
checked at nine screen widths and nothing overflows.

---

## 23 Aug 2026 — A real maths keyboard in the AI Mentor

*Landed in commit `11dca95`.*

**Why.** The maths keyboard in the chat was one we built and maintained ourselves. It
could only type loose characters — √, x², H₂O — so a student asking about a fraction or
a limit had to write it out flat, like `(x^2-4)/(x-2)`. Adding any new symbol meant a
code change. MathLive is a free, widely-used maths editor that already does all of this
properly, so we have adopted it instead of continuing to build our own.

**What changed for students.** Tapping the Σ button still swaps the normal keyboard for
a maths one, exactly as before. The difference is what you get: a proper editing area
where a fraction looks like a fraction and a limit sits under the `lim`, with a maths
keyboard beneath it. When the formula is right, one button drops it into your message.

**You can still mix Khmer and maths in one message**, which was the point of the old
keyboard and is preserved: type your question in Khmer, add the formula, keep typing.
The formula now appears properly typeset in your own message bubble too, not just in
the mentor's reply.

**Two things to be aware of.**

1. **The chemistry and physics tabs are gone.** The old keyboard had tabs with one-tap
   H₂O, m/s², mol and lim(x→). MathLive's keyboards do not, so those now have to be
   built up from its symbol and Greek keys. Everything is still typeable; some things
   take an extra tap or two. If teachers find this a real loss, we can add a custom
   Bac II tab back — it is a small change now, not a rebuild.
2. **The first tap of Σ downloads the editor** (about a quarter of a megabyte). It
   happens once and is then cached on that phone. It is deliberately not downloaded
   when you open the mentor, so students who only type questions never pay for it.

**What to re-test.** Open the mentor and tap Σ. Build a fraction and a limit, and check
they look right in the editing area. Tap the insert button and confirm the formula
lands in your message where the cursor was. Type Khmer before and after it, send, and
check your own bubble shows Khmer text with proper maths in the middle — **no dollar
signs and no empty boxes anywhere**. Then tap the message box and confirm the maths
keyboard puts itself away and the normal keyboard comes back, and that Σ brings it back.
Do all of that in both light and dark themes, and on a real phone if you can.

---

## 23 Aug 2026 — "Battle" is now "Game"

*Landed in commit `11dca95`.*

**Why.** "Battle" sounded like a fight. "Game" is what students actually want to tap.

**What changed.** The feature is called **Game** everywhere a student can see it — the
menu, the bottom tab, the page title, the button on the Home screen, and all the wording
inside the page. The crossed-swords icon (⚔️) is now a game controller (🎮). In Khmer the
label went from **ប្រយុទ្ធ** (fight) to **ហ្គេម** (game).

**The web address changed too**, from `/battle` to `/game`. Nothing inside the app links
to the old address any more, but if anyone has bookmarked it or pasted it into a chat,
that old link will now show the "page not found" screen.

**Where "Battle" became "Play".** English needs a verb in a few places and "Game" isn't
one, so the button on each opponent row now reads **🎮 Play**, and the line under the
title reads "Play against other students" rather than "Battle other students".

**Nothing else moved.** Same page, same cards, same order, same numbers — only the
wording and the icon.

**One thing left alone on purpose.** The crossed swords on the sign-in screen and in
"Welcome, Hero! ⚔️" are the app's own branding, not part of this feature, so they stay.
Say the word if you'd like those changed as well.

**What to re-test.** Check the menu, the bottom tab and the Home screen chip all say Game
with the controller icon, in **both English and Khmer**. Open the page and confirm the
title reads "Game 🎮" and nothing anywhere still says Battle. Tap a Play button on an
opponent row.

---

## 23 Aug 2026 — The AI Mentor is back during lessons, and locked out of tests

*Landed in commit `11dca95`.*

**Why.** When lessons and tests were changed to take over the whole screen, the AI Mentor
button went away along with the rest of the navigation. That was right for a test and
wrong for a lesson: the moment a student is most likely to be stuck on something is while
they're reading it, and we'd just removed the button that helps.

**What changed.** The Mentor button is back on the lesson screen — through the reading
steps, the flashcards and the practice quiz. Tap it and the Mentor opens over the lesson;
close it and you're exactly where you were, on the same step, with nothing lost.

**It stays locked out of tests.** During a **mock exam** and during a **placement test**
there is no Mentor button, and a conversation left open beforehand is closed for you when
the test starts. A student can't have an AI answering questions while being assessed.

**Placement tests are included deliberately** — you asked about the mock exam, and we
applied the same rule to the placement test as well. It isn't graded, it's what decides
which subjects get marked "weak", so a student who looks up answers there gets told
they're fine in a subject they're struggling with, and the whole study plan built from it
is wrong. Nothing later on catches that, so it's the more damaging of the two.

**Where the Mentor is unaffected.** Everywhere else it behaves exactly as before —
including the mock exam's **start screen** and its **results screen**. Only the part where
questions are actually on screen is locked.

**A small bonus.** The Mentor's maths keyboard now opens on the right tab for the lesson
you're in — calculus symbols inside the limits lesson, chemistry symbols in a chemistry
lesson. That was already built but had no way of being used until now.

**What to re-test.** Open a lesson and check the Mentor button appears on every step and
sits clear of the Continue button at the bottom; ask it something, close it, and confirm
you're still on the same step. Start a mock exam and confirm the button is gone. Then the
important one: open the Mentor on the exam **start** screen, leave it open, tap Start, and
confirm the chat closes itself. Do the same for a placement test from the Roadmap card.
Finally check the Mentor still works normally on Home, and on the exam results screen.

---

## 23 Aug 2026 — Lessons and tests now take over the whole screen

*Landed in commit `3ae15c8`.*

**Why.** A student in the middle of a lesson had the menu button, the bottom tabs and the
AI Mentor button all still sitting on screen, quietly inviting them to tap away. The
apps our students already use — Duolingo above all — remove every exit while you're
working, and finish the task before handing the navigation back.

**What changed.** The moment a student starts a lesson, a mock exam or a placement test,
the screen becomes just the task: a close (✕) button and a progress bar along the top,
the question or content in the middle, and one action button pinned to the bottom. The
menu, the bottom tabs and the chat button are all gone until they're finished or they
leave.

**Leaving is always possible.** The ✕ is the way out and it's on every one of those
screens. On the mock exam it asks once — "Leave and lose progress?" — because quitting
part-way through throws that attempt away. Lessons and placement tests just close.

**The three screens now share one design.** The lesson flow, the mock exam and the
placement test each used to draw their own progress bar and their own buttons, which is
why they'd slowly stopped looking like each other. They're now one piece, so they stay
consistent from here on.

**What is *not* affected.** The Lessons *list* is a normal page with full navigation —
only an open lesson takes over. And the placement test you can take inside the survey
still sits in the survey card as before; it doesn't swallow the screen there.

**What to re-test.** Open a lesson and walk it end to end, checking there's no menu, no
bottom tabs and no chat button at any step, and that the progress bar fills as you go.
Tap the ✕ half way and confirm you land back on the Lessons list with everything back.
Start a mock exam: the intro screen should still be a normal page with your past results,
and only answering should take over. Tap ✕ mid-exam, choose "Keep going", then tap ✕
again and choose "Leave". Then press the phone's back button mid-exam and confirm the
navigation comes back rather than leaving you stuck. Finally run a placement test both
ways — from inside the survey, and from the Roadmap card.

---

## 23 Aug 2026 — The app finally uses the space on a tablet or laptop

*Landed in commit `3ae15c8`.*

**Why.** The app was built for a phone and stayed a narrow phone-width strip on every
other device, with a wide band of empty background either side. Teachers demo it on a
laptop and some students revise on a tablet, and it looked unfinished there.

**What changed, by device.**

- **Phone — nothing at all.** This is worth saying plainly: every change is switched off
  below tablet width. Same screens, same order, same spacing.
- **Tablet.** Card screens — Home, Progress, Battle, Grade Prediction and the Lessons
  list — lay out in two columns instead of one long scroll. The bottom tabs and the ☰
  menu stay exactly as they are.
- **Laptop and desktop.** The navigation moves into a **permanent sidebar** down the left,
  carrying the same list as the ☰ menu plus the Language and Theme switches. The bottom
  tabs, the ☰ button and the floating chat button all disappear, since the sidebar
  replaces them. On a very wide monitor the app stops growing rather than stretching, and
  centres itself.

**Reading screens go narrower, not wider.** Lesson content, exam questions, the survey,
the Roadmap, sign-in, Profile and the AI Mentor conversation all stay in a comfortable
single column even on a big screen. Text stretched across a whole laptop is genuinely
harder to read, so widening those would have made the app worse, not better.

**What to re-test.** On a laptop, drag the browser window slowly from narrow to full
width and watch the app change shape twice — one column with bottom tabs, then two
columns, then the sidebar appearing and the bottom tabs going. Click every item in the
sidebar and confirm the current page is highlighted, and that Language and Theme still
work from there. Check no page has a strip of dead space along the bottom where the
tabs used to be. Then open it on a real phone and confirm it is completely unchanged.

---

## 23 Aug 2026 — The app has a dark theme you can switch on

*Landed in commit `3ae15c8`.*

**Why.** Students revise at night, mostly on a phone. The app was near-white on every
screen, which is uncomfortable to look at in a dark room and burns more battery on the
phones our students actually own.

**What changed.** Every screen now has a dark version — dark grey-purple backgrounds,
slightly lighter cards, and text that stays comfortable to read rather than glaring. The
pink/purple/blue BrachNha look is unchanged: same buttons, same gradients, same icons,
same wording, same layout. Nothing moved and nothing was removed.

**It's a choice, and it's remembered.** Open the menu (☰) and you'll find a new **Theme**
switch — Dark or Light — sitting just above the existing Language switch. **The app still
opens bright**, exactly as it always has; dark is there for students who want it.
Whatever you pick is remembered on that phone, including after you close the app or log
out.

If you tried an early build of this and it opened dark, that's been corrected — it will
open bright again on its own, with no need to clear anything.

**One detail worth knowing.** Colours that carry white text — the big gradient buttons,
the BrachNha logo — deliberately stay exactly as they were in both themes, because
lightening them would have made the white writing on top hard to read. Colours used for
*text* and icons are brightened in dark mode for the opposite reason. So the app looks
consistent, but the two are handled differently behind the scenes.

**What to re-test.** Walk through the app in **both** themes, switching between them as
you go — sign-in, the survey (especially the Weak / Not weak / Not sure chips), a lesson
end to end, a mock exam and its score circle, the Progress and Grade Prediction charts
(**hover a chart to check the little pop-up box isn't white**), the Roadmap, the
commitment signature pad, and the AI Mentor including a question with maths in it. Also
close and reopen the app to confirm your theme choice stuck, and check there's no white
flash while it loads.

---

## 22 Aug 2026 — Students can't skip past the commitment pledge any more

*Landed in commit `3ae15c8`.*

**The problem.** Right after finishing the survey, students land on their Roadmap. The
intention is that they read their plan and then tap the big button at the bottom to sign
their study commitment. But the menu button (the ☰ in the top-right) and the AI Mentor
chat button were both sitting on that screen, so a lot of students simply tapped the menu,
wandered off into the app, and never saw the pledge at all.

**What changed.** On that first visit to the Roadmap, the menu button and the chat button
are hidden. The "Ready to commit" button at the bottom is the only way forward, so the
student actually reaches the signature screen.

**Nobody gets trapped.** Once they've been shown the pledge screen, the Roadmap goes back
to normal permanently — menu and chat both there, on every future visit. That applies
whether they signed it *or* tapped "Maybe later"; declining is still allowed, and they can
sign later from the same button. It also survives closing and reopening the app.

Everything else about the pledge is unchanged: after signing (or skipping) for the first
time you're still taken to Home, the signed banner still appears on the Roadmap
afterwards, and "Re-sign" from that banner still leaves you on the Roadmap.

**What to re-test.** Log out from Profile, sign up again and finish the survey. Check the
Roadmap has no ☰ and no chat button. Reload the page — it should stay that way. Then tap
the bottom button and choose "Maybe later"; go back to the Roadmap and confirm both
buttons are back. Repeat once more but actually sign, and confirm the same. Finally, on an
account that has already signed, check the Roadmap looks completely normal from the moment
it loads.

---

## 22 Aug 2026 — The app moved to a new toolchain, and it can now go live on Vercel

*Landed in commit `2d20f12`.*

**What changed.** Nothing you can see. The app looks and behaves exactly as it did
yesterday; what changed is the machinery underneath it.

The app used to be built with Next.js. It now uses Vite. Both are tools that turn our
source files into a working website — Vite is simply faster and much simpler, and we were
paying for parts of Next.js this app never used. Every screen, every button and every piece
of Khmer text came across unchanged.

**Two things did change that you can notice:**

1. **The address for running it locally is now http://localhost:5173** (it used to be
   http://localhost:3000). If you have the old address bookmarked, update it.
2. **A page that doesn't exist now shows a proper "This page isn't here" screen** with a
   button back to Home, instead of a blank error. Next.js used to provide that for free;
   now it's ours.

**Going live.** The project is now set up for Vercel, the service that will host the public
site. Importing the repo there needs one manual step: someone with access has to add the
Google Gemini key under the project's Environment Variables. Without it every page works,
but the AI Mentor politely says it's unavailable rather than answering.

**What to re-test.** Everything, briefly — this touched every file even though it changed no
behaviour. Worth a careful pass on: opening the AI Mentor and asking a question in Khmer;
the maths keyboard inserting symbols at the cursor; moving between pages with the bottom
tabs; opening a lesson link directly in a fresh tab; and the Logout button on Profile.

**Still outstanding.** There is a long-standing typo-level bug in the instructions we send
to the AI about how to write maths formulas — some backslashes are being silently dropped
before the AI ever sees them. It predates this change and is unfixed, because correcting it
changes what the mentor is told and needs someone to re-check answer quality afterwards.

---

## 21 Aug 2026 — Maths keyboard in the chat, and proper formulas in the answers

*Landed in commit `2d20f12`.*

**What changed.** Two things, both in the AI Mentor chat.

**1. A maths keyboard.** There is a new button (the **Σ** symbol) to the left of the message
box. Tapping it hides the phone's normal keyboard and puts a maths keyboard in its place,
with five tabs: មូលដ្ឋាន (basic), ពីជគណិត (algebra), កាល់គុល (calculus), រូបវិទ្យា (physics),
គីមី (chemistry). Tap the keyboard icon in the bottom-left corner to go back to normal typing.

Symbols land wherever the cursor is, not at the end of the line. The panel has its own space
bar and backspace, and holding backspace deletes repeatedly.

If a student opens the mentor while they are inside a lesson, the keyboard opens on the tab
that suits that lesson — the Limits lesson opens on កាល់គុល, for example. Otherwise it opens
on មូលដ្ឋាន.

**2. Formulas now look like formulas.** The mentor's answers used to arrive as flat text —
`lim(x->2) (x^2 - 4)/(x - 2)`. They now render properly typeset, with stacked fractions, real
square-root signs, and subscripts like H₂O, the way they appear in a textbook.

**Why.** A Khmer phone keyboard has no √, ∫, π, ², ≤ or ₂. Students physically could not type
the question they were stuck on, so they wrote things like "x squared minus 4 over x minus 2"
and hoped the mentor guessed right. And an answer written as flat text is the same problem in
reverse — hard to read, easy to misread.

**What you need to know.**
- **Please test on a real phone, not just a laptop.** The trick that hides the phone keyboard
  works differently across Android and iPhone. If it fails on some device, the phone keyboard
  simply stays on screen next to the maths panel — cramped, but everything still works.
- Check the five tab names fit on a narrow phone. They should scroll sideways if not.
- The mentor is the only place a student types anything, so this is the only place the maths
  keyboard appears. Mock Exam and quizzes are all multiple-choice buttons.
- The chat now loads a little extra when you first open it, so formulas can be drawn. The rest
  of the app is unaffected — nothing else got slower.
- Watch for any **empty square boxes** appearing in a Khmer sentence. That would mean Khmer
  text got mixed into a formula. There are two separate safeguards against it, but it is the
  thing worth reporting if you ever see it.

---

## 21 Aug 2026 — AI Mentor now always answers in Khmer

*Landed in commit `2d20f12`.*

**What changed.** The AI Mentor now replies in Khmer every time, even when the student types
their question in English. Before, it replied in whichever language the app was set to.

Maths and science notation stays in its normal form — `f(x)`, `lim`, `H₂O`, `mol`, `pH`, unit
names — because that is what appears on the real exam paper. The mentor adds a short Khmer
explanation the first time it uses a term like that.

**Why.** Students sit the Bac II in Khmer, so practising in Khmer is the point.

**What you need to know.**
- This only affects the **mentor's answers**. The app's own menus, buttons and error messages
  still follow the language chosen in the drawer.
- The answer structure is unchanged — still ទិន្នន័យ → សំណួរ → វិធីសាស្ត្រ → steps → ចម្លើយ →
  គន្លឹះប្រឡង.
- If we ever want to go back to bilingual answers, it is a one-line change.

---

## 21 Aug 2026 — Protection for the AI Mentor endpoint (`1e4916b`)

**What changed.** Two things, both invisible in normal use:

1. **Rate limit.** The address the app uses to reach the AI is public — anyone who found it
   could have run a script against it and spent our Google AI credit. It now allows 30 questions
   per minute from the same internet connection. A real person never reaches that; a script gets
   blocked immediately.
2. **Better error wording.** If the AI key is ever missing on the live site, students now see
   "The AI Mentor is temporarily unavailable. Please try again shortly." Previously they would
   have seen a developer instruction about editing a settings file.

**What you need to know.** A whole classroom on the same school Wi-Fi shares one internet
address, so the limit was set high on purpose — 30/minute is far above a class asking questions
normally. If anyone ever sees "⏳ Too many questions at once", that is almost certainly Google's
own daily quota, not our limit.

---

## 21 Aug 2026 — AI Mentor connected for real, with chat history (`8469c05`)

**What changed.**
- The AI Mentor is now a real AI (Google Gemini 3 Flash). It used to return a fixed placeholder
  message.
- It knows our own content — every lesson, flashcard, practice question and mock-exam question in
  the app — plus the student's weak subjects, target grade and months remaining, so its advice is
  specific to them.
- Answers follow a fixed Bac II structure: given/asked, method, numbered steps, answer, exam tip.
- The mentor now keeps **multiple conversations**, like a normal chat app. Chats are named
  automatically from your first message. Limits: 40 messages per chat, 20 chats kept.
- It is told to say "I am not sure, check with your teacher" rather than invent a formula or a
  past-paper statistic.

**What you need to know.** Google's free tier allows only about **20 questions per day** across
everyone. Billing needs to be enabled on the API key before any demo or classroom use, or the
mentor will stop answering partway through.

---

## 21 Aug 2026 — Khmer font, language switcher, layout fixes (`f8e6ef0`)

**What changed.**

- **Khmer text now has a real font.** The app previously had no Khmer font at all, so every
  Khmer word was drawn using whatever font the phone happened to have — different on every
  device, and bold text looked smudged. It now uses Noto Sans Khmer everywhere.
- **You can change language after signing up.** There was no way to switch language once you
  finished the survey. There is now a language switcher pinned at the bottom of the menu drawer.
- **Real flag pictures.** The flags next to the language options were emoji, which Windows and
  many Android phones cannot draw — they showed as the letters "GB" and "KH". They are now real
  flag images.
- **Headers sit properly.** Every page had a large empty gap above its title, with the menu
  button floating alone above it. Titles now sit on the same line as the menu button, which gives
  back about 40px of screen on every page.
- **Lessons page was missing its margins** — cards ran edge to edge and the heading slid under
  the menu button. Fixed.
- **The robot chat button no longer covers the last card** on a page.
- **Menu names updated** to the agreed Khmer wording. "Exam Papers" was removed (it was never
  built); "Flashcards/Quiz" (ការអនុវត្ត) is listed instead, marked "Soon".
- **Home greeting** now reads "Good Day, {name}" instead of putting the name in the small line
  under the logo.

**What you need to know.** Nothing to do — but if you have the site open on your phone, do a hard
refresh so the new font loads.

---

## 14 Aug 2026 — Grade Prediction and Placement Test (`799a11b`)

**What changed.** Grade Prediction became a full feature with its own page and a card on Home —
predicted grade, probability bars, a trend chart, per-subject breakdown, and recommended actions.
The survey also gained a Placement Test: if a student is unsure whether they are weak in Maths,
Physics or Chemistry, they can take a short test then and there, or schedule it for later and
resolve it from the Roadmap.

**What you need to know.** Grade Prediction, Progress and Battle all show **example data on
purpose**, not the student's real results. This was a deliberate choice so the charts always look
right during a demo instead of breaking for a brand-new user with no exam history. Only the Mock
Exam results are real. Placement tests currently exist for Maths only — Physics and Chemistry show
a "coming soon" fallback until questions are written for them.

---

*Older history is in the git log: `git log --oneline`.*

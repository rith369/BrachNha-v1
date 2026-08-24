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

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

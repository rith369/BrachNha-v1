# Lessons: Study page, subject paths and sections

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

### The Study page is subject-first, and Khmer-only

`lessons-list.tsx` used to be a flat list of individual LESSONS — one compact row
per lesson, assembled by hand from whatever happened to exist in
`data/lessons.ts`. It grew a row per lesson and gave a subject no identity of its
own. It is now a two-tab, staggered grid of subject tiles, which is the shape
that survives real content arriving.

**`features/lessons/subjects.ts` is the catalog** — id, Khmer name, blurb,
accent, Lucide icon — plus the derivations. Four things there are load-bearing:

- **`LESSONS_PAGE_LANG = "km"`. This page renders Khmer even when the app is set
  to English**, and that is a product decision, not missing translation work —
  the same call already made for KruAI, which always answers in Khmer whatever
  the student typed (`ANSWER_LANG` in `utils/chat-prompt.ts`). Strings here are
  Khmer literals, NOT `{ en, km }` pairs behind `T[lang]`. Don't "fix" them.
  The constant exists so the decision is greppable and reversible in one edit.
- **Lesson counts and durations are DERIVED, never authored.** A card counts the
  lessons of its subject's authored path (`SUBJECT_SESSIONS`, on the tab `PATH_TAB`
  assigns it to); a subject with no authored path is closed. (`lessonCountFor()`, which
  counted the old `LESSONS`, was deleted with them on 7 Oct 2026.) `MINUTES_PER_LESSON` is one named constant rather
  than eight fake per-subject numbers; replace it with real timings when lesson
  content lands.
- **The Foundation tab derives from `FOUNDATION_SUBJECTS`** (`utils/placement.ts`,
  already exactly math/physics/chemistry and shared with the survey), rather than
  hardcoding a second list that can drift.
- `english` and `french` are both in the catalog; `allSubjects()` renders whichever
  `userLanguage` chose and drops the other.

**Every subject has its OWN colour, and there are TWO scales per subject.** They
are not drawn from the five shared brand accents any more — eight subjects
cycling through five accents collided three times, and colour is useless as a
subject cue if chemistry and Khmer are both mint. `SubjectMeta` therefore carries
no `accent` field; the colour is keyed off `id`.

The supplied palette is Tailwind-500 shades, which are designed as **fills**. As
small text on `--color-bg` **all eight fail AA** (2.1:1 to 4.2:1), so the same
split that governs `--brand-*` vs `--color-*` applies here, for the same reason —
no single value clears AA in both roles:

| token | theme-dependent? | correct for |
| --- | --- | --- |
| `--subject-{id}` | **no** — one value, both themes | a fill sitting under white text. Today: the play button, and only that |
| `--color-subj-{id}` | **yes** — darkened light, lifted dark | small text, icons, borders, the `/8` card tints |

Only `--color-subj-*` is mapped into `@theme`, which is what generates
`bg-subj-math` / `text-subj-math` / `border-subj-math` with alpha. `--subject-*`
is deliberately NOT mapped — it is referenced as a bare `var()` at its one use
site so it cannot be reached by accident for text. Every value in both rows was
measured; the ratios are recorded beside the tokens in `globals.css`.

`subject-card.tsx`'s `SUBJECT` map spells all eight variants out because
**Tailwind cannot see a class assembled at runtime** — `bg-subj-${id}` produces
no CSS. Adding a subject means a row there, a pair of tokens in `globals.css`,
and a `@theme` line.

**Most subjects have NO lessons and that is the normal state today.** A subject
with zero lessons renders as a plain `<div>`, dimmed, with a `ឆាប់ៗនេះ` chip and
no play button — never a disabled `<Link>`. Same precedent as `sidebar-nav.tsx`'s
`href: null` rows and the survey's `StudiedStep`: a control that answers a tap
with silence reads as broken, so it must not look tappable.

**The artwork slot needs no files to exist.** `SubjectArt` renders a single
`<img>` at `/subjects/{id}.webp` on top of a gradient-plus-icon placeholder, and
the `<img>` hides itself via `onError`. Without that handler a missing file
paints the browser's broken-image glyph over the gradient.

**WebP only here — deliberately NOT the `<picture>` + PNG pair `wordmark.tsx`
uses.** That pair is right for the logo: one image, on every screen, where a
second file is cheap insurance. Subjects are eight images, so a fallback means
sixteen files to maintain for a format ~99% of handsets have supported for years
(Android Chrome since 2014, iOS Safari since 14). A browser too old for WebP
keeps the placeholder, which is a designed state rather than a failure.

**The artwork is Freepik free-licence, and the credit line at the bottom of
`features/profile/components/profile-view.tsx` is LOAD-BEARING.** That licence
grants use only on condition of a visible credit, so deleting the line leaves
eight images with no licence behind them. It looks exactly like removable
clutter, which is why it carries a comment saying otherwise. It can go only when
the artwork does — premium re-download or attribution-free replacements. Full
provenance, including the fact that `french`'s source has a watermark the 4:3
crop happens to remove, is in `design/subjects.md`.

`design/subjects.md` carries the naming and the 40KB budget — it is in `design/`
rather than beside the images because anything under `public/` is served, and a
README there ships to production at `/subjects/README.md`. Eight
stock-art files would undo the first-paint work recorded above.

### `scripts/webp.mjs` — PNG/JPG → WebP

Dev tooling, outside `src/` so it never bundles. **No image library was added**:
it drives the Chrome `playwright-core` already provides for `shots.mjs` and
encodes through a canvas, the same route the logo raster was made by (see
`design/README.md`). Resolves Chrome with the same `CHROME_CANDIDATES` list.

```bash
node scripts/webp.mjs art/*.png                      # -> public/subjects/, 600x450
node scripts/webp.mjs art/algebra.jpg --name math    # rename on the way out
node scripts/webp.mjs logo.png --width 96 --square --out public/logo
```

Defaults (600px, 4:3, quality 0.82) match the subject cards: 600px is 2× the
largest size a card ever draws, and the centred crop reproduces the card's own
`object-cover` rather than fighting it. It **warns** rather than fails over the
40KB budget — a deliberately detailed illustration may justify it, but it should
be a decision. `--square --width 96` reproduces the logo raster.

**Two deliberate departures from the reference design**, both because this is a
bottom-nav tab inside existing chrome rather than a standalone screen: there is
**no back arrow** (you don't go back from a tab), and the **streak chip is not
top-right**: the app bar above every page already shows the streak, so the
page keeps a plain title-left header.

**The grid is `columns-2 md:columns-3 lg:columns-4`, not a grid** — the staggered
look comes from cards of differing height flowing into balanced columns, which is
what CSS multi-column does natively and `grid` does not. Cards need
`break-inside-avoid` or they slice across the column boundary. **Two columns at
phone width is a deliberate exception** to the `grid-cols-1 md:grid-cols-2` rule:
that rule protects dense stat cards needing ~288px, while these are image tiles
that read fine at ~144px. 320px is the floor and is checked. The accent tints are
the `/8` scale, correct in both themes with no `dark:` override — see the
two-accent-scale note.

### The subject path — `/subjects/:subjectId`

Tapping a subject card no longer jumps into a lesson. It opens that subject's
**session path**: a Duolingo/Mimo-style winding trail of short sessions, which is
the screen a student picks work from. `subject-card.tsx` links here, not to
`firstLessonId()` — going straight to lesson one would skip the choice and hide
every other session.

**Its own top-level route, deliberately not nested under `/lessons`.** A lesson id
is `subject-topic` (`biology-brain`), so `/lessons/:lessonId` and a bare
`/lessons/:subjectId` would be two patterns matching one segment. An unknown id
`<Navigate>`s to `/lessons` rather than erroring — it is only reachable by a typed
URL or a stale link. It is **not** a focus route: the student is choosing, not
mid-task, so the nav stays.

**The reference design was a dark space-themed game map. Only the STRUCTURE was
taken** — winding path, numbered nodes, locks, a stat bar. Deliberately not
copied: the starfield, planet artwork, both side rails of icon buttons, the
premium badge, the mascot, and the keys/energy/gems currency bar. The page renders
in the app's own identity, in the subject's colour, and works in both themes.

**`CENTRES` in `subject-path-view.tsx` is the single source of truth for the
layout.** Each node is placed with `paddingLeft: X%` plus `-translate-x-1/2` so its
CENTRE lands on that percentage, and the connector SVG is drawn between two of the
same numbers in a `0 0 100 40` viewBox with `preserveAspectRatio="none"`. The first
version drew a fixed curve independent of the offsets and the trail visibly missed
every node. Values stay inside 12–88 because a 64px node at the 320px floor needs
~11% of clearance or it clips.

Those bounds have already moved once, and the reason is the trap: **the widest
part of a node is its LABEL BLOCK, not the disc.** Once section titles started
rendering under the nodes the block went to `w-28` (112px), needing 56px of
clearance — ~19% of a 288px column — so `CENTRES` went `[22, 50, 78, 50]` →
`[30, 50, 70, 50]`. Because `CENTRES` drives node placement *and* the connector
endpoints, the curve followed with no second edit; that is the whole point of
keeping one array. Measured at the 320px floor: nodes span 46→274 in a 16→304
column.

### The path has THREE levels, because the textbooks do

`ជំពូក` (chapter) → `មេរៀន` (lesson) → `ផ្នែក` (section). A section is one node and
one run of the 7-step lesson flow. `features/lessons/sessions.ts` models exactly
that: `Chapter { lessons }` → `PathLesson { sessions }` → `Session`.

Naming, both bits of which look like mistakes and are not:

- **`PathLesson`, not `Lesson`** — `types/index.ts` already exports a `Lesson`,
  which is the content object a section routes *into*. Different things.
- **`Session` keeps its name although the curriculum says "section".** The store
  persists `completedSessions` and exposes `completeSession()`; renaming the type
  invites renaming a persisted field, which needs a migration and buys nothing.

**The page renders ONE BANNER PER LESSON, with the chapter as its kicker** —
`ជំពូក 3 · តម្រូវផ្សេងៗរបស់សារពាង្គកាយ` over `តម្រូវប្រសាទ`. The third level has to
surface somewhere and that is Duolingo's own unit-header shape. The kicker used to
repeat the subject name, which the header card directly above already says. A
chapter whose real title hasn't been supplied carries `title: ""` and the banner
shows `ជំពូក 1` alone — an empty string is the "pending" marker, deliberately,
because a made-up Khmer title is worse than none.

**Node labels are `{chapter}.{lesson}.{section}` in Latin digits** (`3.1.1`),
matching the numbering printed in the textbook, and are GENERATED from position by
`sectionsFor()` so a label cannot drift from where the node sits.

**A `flat` chapter drops the chapter from the label** (`2.1`, not `1.2.1`), because
there is no chapter on screen for that number to refer to — `Chapter.flat` already
suppresses the banner's kicker, and printing a "1." that groups nothing told a
student about a level the page deliberately never draws. `quizSections()` in
`features/practice/quiz-path.ts` has always done this; `sectionsFor()` was the one
out of step and now takes the same flag. Math's foundation path is the only
`flat` Study path today, so this moved its existing labels from `1.1.1` to `1.1`.

**THE ID KEEPS THE CHAPTER EITHER WAY** — `math-1-2-1`, never `math-2-1`. It is
persisted in `completedSessions` and it is the key into `SECTION_CONTENT`, so only
the visible label may move. A change that renumbered ids would silently orphan
every finished node and every authored section.

**The section TITLE renders under the node, not just in the `aria-label`.**
Duolingo gets away with bare numbers because its content is known; here the
curriculum names are the whole point of the screen. Two consequences: the wrapper
widened (see `CENTRES` above), and the title carries `[overflow-wrap:anywhere]`
rather than a Tailwind `break-*` utility, because **Khmer has no spaces** — a
section name is one unbreakable run and renders as a single line wider than the
node's box without it. A three-line title only pushes the next connector down; the
connector is its own fixed-height element between rows, so no geometry breaks.

**Session structure is DERIVED until it is authored.** `SUBJECT_SESSIONS` holds
the authored structure — the same shape as `PAST_PAPERS`, and most
subjects are absent, which is the normal state. `chaptersShape()` falls back to
`PLACEHOLDER_SESSIONS` locked nodes, wrapped in one chapter and one lesson so the
shape matches, so a node can never claim content the app lacks. (It also listed the
old 7-step lessons until they were deleted on 7 Oct 2026.)

**Math's foundation path is FOUR lessons, and three of them are structure.**
មេរៀនទី 1 · ប្រមាណវិធីបូក ដក គុណ ចែក has six named sections (three written);
lessons 2 to 4 have five each, all `title: ""`, all locked. 21 nodes, 3 playable.

The user asked for them (28 Sep 2026) because a one-lesson path claimed the whole
foundation review was one lesson. **Reserving structure is allowed; inventing
names is not** — the same line `PLACEHOLDER_SECTIONS`, biology's untitled chapter 2
and the Bac II quiz path's unnamed sections already draw. `lessonHeading()` reads
an empty title back as `មេរៀនទី N` alone, so the banner needs no placeholder
string, and naming a lesson later is ONE string here with no other edit.

`UNNAMED_SECTIONS` is five empty strings rather than `PLACEHOLDER_SECTIONS`
(three, and it names them `ផ្នែកទី N`): the node already prints its number, so a
title repeating the number is the duplicate `lessonHeading()` exists to avoid.

**Biology is the first real curriculum**, entered from the Grade 12 table of
contents: 3 chapters, 7 lessons, 6 sections each = 42 nodes, **every one locked**,
because no content is written behind any of them. Chapters 1–2 are titleless
pending a legible scan. Two things follow that are easy to mistake for bugs:

- **An authored structure REPLACES the derived fallback wholesale**, so the old
  `biology-body` and `biology-brain` lessons never appeared on the biology path. Both
  were deleted on 7 Oct 2026; the brain's 3D model lives on in section 3.1.1.
- **The Study card counts the authored path's lessons**, written or not (it once
  counted the old `LESSONS`; `lessonCountFor()` is gone).

**The page does NOT open at the top.** A path is long — biology is 43 nodes — so
landing at the very top means scrolling past everything already behind you to
reach today's work. `SubjectPathView` scrolls its own container on mount to put a
lesson BANNER at the top, banner first because the banner names the thing about to
be done. The target has two sources and the order is load-bearing:

1. the lesson holding the first unfinished playable session — the same session the
   START bubble points at, so landing and bubble cannot disagree;
2. failing that, a lesson flagged `openHere` in the authored data.

`openHere` exists because a path with no content yet has no playable session for
rule 1 to find; biology carries it on ជំពូក 3 · មេរៀនទី 1, the lesson being
authored. **It retires itself** — the day that lesson has content, rule 1 returns
the same lesson and the flag stops being consulted. That is why it is the fallback
and not an override. The scroll is instant, never smooth (an animated scroll on
first paint reads as a glitch), measured from bounding rects rather than
`offsetTop` so it does not depend on which ancestor happens to be positioned, and
keyed on `subject.id` alone so finishing a session cannot yank the page.

**The `pt-10` above a lesson's first node is not decoration.** The START bubble
sits at `-top-8`, so anything less and it collides with the banner it is meant to
hang under. Banner separation is `mt-8 first:mt-0`.

### Section content — the curriculum shape, and why it is not `Lesson`

> **Since 7 Oct 2026 sections live in the DATABASE**, not in `data/sections.ts`
> (deleted). The shape and the reasoning below still hold; where this section and
> the ones near it say `SECTION_CONTENT[id]`, read "the section is published" (the
> manifest) or "the loaded body". How a section reaches a phone is "Step B:
> students read sections and papers from the database" near the end of this file;
> how to write one is Admin → Content and `content/README.md`.

A SECTION is one node on a path and the unit real content is written in five
blocks — **សេចក្ដីផ្ដើម, មេរៀន, ឧទាហរណ៍, ចំណាំសំខាន់ៗ, កំហុស** — optionally then a
quiz.

**Those blocks render across TWO steps.** Step 0 is សេចក្ដីផ្ដើម → ឧទាហរណ៍ →
optional 3D model → សំណួរ (orientation: why this matters, what it looks like in
life, then "now you try"); step 1 is មេរៀន then ចំណាំសំខាន់ៗ then កំហុស (the
substance).

**A QUIZ IS INSIDE A STEP, never a step of its own, and there are TWO of them.**
`SectionContent.quiz` renders on step 0 and `quizHarder` on step 1, each after
that step's teaching, and **neither step will advance until its own questions
are all answered** — `quizDone` and `quizHarderDone`. A quiz that can be walked
past is not a quiz.

**The split is the section's TEACHING ORDER, not a difficulty badge** — nothing
on screen says "hard". Step 0 may only ask what the video and the examples have
covered; anything that needs the RULES belongs in `quizHarder`, or the question
is asked before it is taught. `math-1-1-1` is the worked case: its 15 exercises
split 8/7 at exactly the point multiplication starts, because **the ×/÷ sign
table is on step 1**. Asking Part C on step 0 would have asked before teaching.
Both halves stay independently spread across ក./ខ./គ./ឃ. — splitting a balanced
set can leave one half clustered, so re-check the spread per HALF.

**A SECOND ARRAY, not a `step` flag per question.** The split is what an author
decides when writing the section, and two named lists show that shape at a
glance where fifteen flags would have to be read one by one. Both are optional,
so the four biology sections — everything on step 0 — needed no edit.

**ANSWERS ARE KEYED `"{step}-{index}"`, AND A BARE INDEX IS A BUG.** With two
lists, question 0 of one would otherwise share a key with question 0 of the
other, so answering either would mark a question the student has never seen.
`answerQuestion` also takes the QUESTION rather than an index, which keeps its
closure from reading into a possibly-undefined array element — the property path
the React Compiler narrows a memo dependency onto.

**`scripts/check-quiz.mjs` must walk BOTH.** It covered `quiz` only for one
revision and the section count silently dropped from 24 to 17 — half a section
unchecked, the same "the checker and the screen disagree" gap that let raw LaTeX
ship on the misconception cards.

`SectionQuestion.scenario` carries the ស្ថានភាព set-up above the prompt in
muted text; `math-1-1-1` uses it for the part label so the source's four parts
survive the split. `correct` is compared by string equality, so the ក./ខ./គ./ឃ.
prefix has to be repeated there — a mismatch silently marks every answer wrong,
which is what `check:quiz` exists to catch.

**`SectionVideoPlayer` IS A CLICK-TO-LOAD FACADE.** The design calls for a video
at the top of a section; `SectionContent.video` carries a poster, a duration and
— once a recording exists — a `youtubeId`, and the component draws the chrome
around it: poster, play button, 0:00 / duration, fullscreen glyph, scrub bar.

**It has two states, and the poster-only one is still the normal one.** Most
sections have no recording, exactly like the mascot slot and the empty past
papers: build the shape now, drop the real thing in later.

**WITHOUT a `youtubeId`, NOTHING IN IT IS INTERACTIVE — but it SAYS SO.** A
ឆាប់ៗនេះ chip sits in the frame's top-right whenever there is nothing behind
the play glyph, which is what makes the state legible WITHOUT tapping — the same
principle as `exam-paper-card.tsx`'s chip and the survey's `studiedNote`.

That chip is a REVERSAL, and the history matters because this file used to argue
the other way. The player first shipped with a real `<button>` plus the chip and
a "video is being prepared" notice; the chip and notice were removed at the
user's request, so the button went with them — an unexplained control that
answers a tap with silence is the broken-app pattern. The chip is back by
request (28 Sep 2026); **the button is not, and must not follow it back.** The
rule is unchanged: the chip EXPLAINS the state, only a `youtubeId` makes it
pressable. A `<button>` that answers a tap with silence is the
broken-app pattern `sidebar-nav.tsx` and the survey's `StudiedStep` both exist to
avoid — with the explanation gone, plain spans are the only honest form.
Identical on screen, no pointer cursor, no focus ring, nothing announced as
pressable. **Don't reinstate the `<button>` without reinstating something for it
to say** — and `youtubeId` is exactly that something, which is why it is the only
condition under which the button appears. The rule is SATISFIED here, not
repealed. Elapsed reads 0:00 and the scrub sits at zero because both are true — a
pre-filled bar would invent a state the app cannot know.

**WITH a `youtubeId`, the tap mounts a YouTube iframe and nothing before it.**
Hosting is an UNLISTED YouTube video — $0, and automatic adaptive bitrate, which
is what a self-hosted mp4 cannot do: one fixed bitrate either buffers on 3G or
looks soft on wifi, and bills Vercel egress per view. The cost is a third-party
frame, and **the facade is what makes that cost conditional on the student asking
for it**: until the tap, not one byte leaves this origin. The poster is always our
own `/sections/{id}.webp` — never `i.ytimg.com`, which would contact Google on
every section view and defeat the whole thing. The thumbnail is downloaded ONCE
at authoring time and converted by `scripts/webp.mjs`.

Four things in it that a later edit could undo:

- **NO `React.lazy`, and none is needed.** `brain-model-viewer.tsx` is a lazy
  boundary because three.js is a large MODULE the bundler can see. An `<iframe>`
  is MARKUP: zero bytes in any chunk, and the player's own JS is fetched by the
  iframe's browsing context, a separate document no bundler could reach. A lazy
  boundary here would buy a Suspense frame, a chunk round trip and a layout-shift
  risk for nothing. `app.tsx`'s `routeModules` needs no entry — the feature is
  invisible to the code-splitting story. Verified: `youtube-nocookie` appears in
  exactly one built chunk (`section-detail-*.js`), zero in the entry chunk, and
  no dependency was added.
- **`youtubeId` is the 11-char id, never a URL.** A URL field accepts five
  spellings of one video (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, plus
  the `?si=` the share sheet appends); all five typecheck and one embeds. A
  malformed id reads as NO id and falls back to the poster, rather than rendering
  a YouTube error page behind a button.
- **Four player params, and four deliberately omitted.** `autoplay=1` (needs
  `autoplay` in `allow=` too — the cross-origin Permissions-Policy default is
  `self`, and omitting it is the usual reason a facade needs two taps),
  `playsinline=1` (without it iOS hijacks to native fullscreen, out of
  `FocusLayout`), `rel=0`, `hl=km`. NOT set: `modestbranding` (ignored since
  2023), `iv_load_policy` (annotations died in 2019), `mute=1` (a silent lesson
  is worse than one more tap), `enablejsapi` (invites watch-progress tracking).
  `cc_lang_pref=km` does nothing without `cc_load_policy=1`, and that with no real
  Khmer track forces garbage auto-captions — **add both the day a Khmer caption
  track is uploaded**.
- **The preconnect is rendered from the component, only when there is a video,
  and NOT in `index.html`.** That file's link already blocks first paint, and
  warming a host reachable from one section on every screen would slow first
  paint for everyone. No `crossorigin` — the iframe is a navigation, not a CORS
  fetch, so an anonymous preconnect opens a second unused connection (the
  opposite of `fonts.gstatic.com`, where fonts ARE CORS fetches).

**NOTHING ASSUMES PLAYBACK STARTED** — no timer, no progress, no auto-advance.
Telegram's and Messenger's webviews may refuse `autoplay` whatever the gesture,
and that has to stay a legible second tap on YouTube's own button rather than a
stuck screen. Posters live in `public/sections/` named by section id, 16:9
at 800px (not the cards' 4:3 at 600px — the player is ~720px wide at `max-w-3xl`);
see `design/subjects.md`.

`Model3DRef.title` captions the viewer's top-left corner (ខួរក្បាលរបស់មនុស្ស on
this section). Authored rather than hardcoded in the viewer, since the viewer is
shared and a second model would need a different name; top-left because the drag
hint already owns top-right and at 320px a centred caption would meet it.

**`SectionContent.model3d` reuses `Model3DRef` and `BrainModelViewer` as-is**,
including the same `/models/brain.glb` and credit string the Human Brain lesson
uses — one asset referenced twice, not a second copy. It is behind the same
`React.lazy` boundary, so both routes share one `brain-model-viewer-*.js` chunk
and a section without a model never downloads three.js. **Check that chunk still
exists after touching either file.** It ran as five
one-block steps first and was cut back deliberately. Merging cost nothing
structurally because each block still renders in its own `Callout` — only the
step boundaries moved — so regrouping is a change to the render, never to the
data.

**`SectionBlock.items` renders as a BULLETED list**, with nested `item.items` as
`list-[circle]` under it. Every one of these blocks is a list, and without a
marker the items ran together into a wall of Khmer with only the bold label
breaking them up. `list-outside` keeps wrapped lines aligned under the text
rather than under the bullet, which matters here because Khmer lines wrap often.
`data/sections.ts` holds `SECTION_CONTENT` keyed by the id `sectionsFor()`
generates (`"biology-3-1-1"`); the types live in `types/index.ts` beside `Lesson`.
Seven entries today: four biology, plus **`math-1-1-1`** (the first math section
and the first with a REAL VIDEO behind its player), **`math-1-1-2`** and
**`math-1-1-3`**. Nearly-empty is still the normal state, same as `PAST_PAPERS`.

**`math-1-1-2` is the one to copy for a maths section.** It carries a `video`
with a POSTER AND NO `youtubeId` — the placeholder state, drawn with the
ឆាប់ៗនេះ chip — and **no `durationSec` at all**, because a run time printed
beside that chip would claim a video that has not been made. `durationSec` is
optional for exactly this; `biology-3-1-1` keeps the one it was authored with.
Its poster is the subject illustration recropped to the section spec (16:9,
800px) rather than new artwork, so it needs no new licence. `math-1-1-3` reuses
the same crop: there is no per-section artwork, and one honest placeholder beats
a different invented image per section.

**`math-1-1-3` is where the Khmer rule bit hardest, and it is the example to
follow.** Its source arrived with the headings, the steps and even the question
stems in English ("Decimal to Fraction", "Step 1", "Shortcut", "Convert 0.5 to a
fraction"). None of that is a term of art, so all of it is Khmer in the file, and
the mapping used is written into that entry's own header so the next maths
section translates the same words the same way.

**Its column addition is a KaTeX `array`, not spaces.** The renderer uses
`whitespace-pre-line`, which keeps newlines but COLLAPSES runs of spaces, so a
preformatted sum loses exactly the alignment it exists to show. Note the row
separator is four backslashes in the source (two in the string).
It is also the densest LaTeX in the repo (101 `rac` alone), and therefore the
clearest case of the doubled-backslash rule — ``, `
`, ``, `	` and `
`
are all C escapes, so `rac`, `
eq`, `oxed`, `	imes` and `
ightarrow`
written with ONE backslash silently become a form feed, a newline, a backspace,
a tab and a carriage return. They still render, just wrongly, which is why
`check:quiz` typesets every string rather than trusting the eye.

**EVERY STRING IN A SECTION NOW RENDERS THROUGH `MathText`** — `Block`'s intro,
outro, item labels, bodies and nested items, and `QuizQuestion`'s prompt, options
and explanation. It went in with `math-1-1-1`, whose content was supplied in
LaTeX; without it the student reads the raw source. Hand-converting to Unicode
instead was rejected for the reason recorded for the 2025 maths paper — a
transcription risk with no upper bound on how quietly it fails — and the content
arrives in LaTeX anyway.

Three consequences worth knowing:

- **It is free for the sections that do not use it.** `splitMath` leaves a
  dollar-free string untouched and `MathText` short-circuits it to one inline
  node, so the four biology sections — which contain zero `$`, checked — render
  exactly as before. It costs no BYTES either: `math-text-*.js` is already a
  shared chunk warmed at idle for every student, because `quiz-runner.tsx`
  imports it and `practice-run` is in `app.tsx`'s `routeModules`. Measured after
  the change: the entry chunk contains zero katex.
- **`Block`'s lead and trailing paragraphs are `<div>`, not `<p>`.** `MathText`
  emits a block `<table>` for a Markdown table — `math-1-1-1`'s sign table is one
  — and a table inside a `<p>` is invalid HTML that the parser silently unnests.
- **Backslashes are DOUBLED in the data**, matching `data/quizzes/math-1-1-1.ts`.
  Written singly in a plain string a backslash-t is a TAB and a backslash-b a
  BACKSPACE, so the times command becomes a tab followed by "imes" — the exact
  bug `data/bac2-format.ts` warns about, and one that renders without throwing.
  **Khmer must never go inside a math span**: KaTeX substitutes maths fonts with
  no Khmer coverage and draws a row of empty boxes.

**This is deliberately NOT `Lesson`, and `SectionDetail` is deliberately not a
branch inside `lesson-detail.tsx`.** That component runs the older
content/summary/funFact/tip/didYouKnow flow for the two legacy lessons. One
component serving both shapes would be a permanent fork down the middle of every
step. What is shared instead is the *frame*: `FocusLayout`/`FocusButton` and the
`utils/focus-styles.ts` ladder, which exist precisely so task screens cannot
drift. `Misconception` is the clearest case for the separate type — `wrong` and
`right` are two fields because the pairing IS the teaching, and one blob of text
could not render the halves differently.

**Khmer-only strings, not `{ en, km }` pairs** — same decision as
`LESSONS_PAGE_LANG`, `EXAM_PAGE_LANG` and `ANSWER_LANG`. The content exists in
Khmer; an English column would be fabrication dressed as data.

**`components/callout.tsx` is the left-border card** every block renders in. One
component, not four hand-rolled cards, for the reason `shell/wordmark.tsx` exists.
Tones come from the per-theme `--color-*` scale, never `--brand-*` — borders and
text rather than fills under white text — which is also why every tone is correct
in dark with no `dark:` override. `TONE` spells all five variants out because
Tailwind cannot see a runtime-assembled class.

**សេចក្ដីផ្ដើម and មេរៀន carry NO heading, and that is deliberate.** The section
title rendered above the first is already its heading, and មេរៀនសង្ខេប was
explicitly asked to lose its label. Within each step the unlabelled block leads
and the labelled ones follow, which is also what keeps a step reading as one flow
rather than a stack of equal cards.

**NO EMOJI in section content or its headings.** `Callout` takes a `LucideIcon`,
not a character — the same swap the rest of the app made, because emoji render
differently on every handset. The completion screen uses `Trophy` for the same
reason. The icon is tinted to the stripe colour: one small glyph reinforces the
stripe rather than competing with it the way the old tinted backgrounds did.

**The completion screen is `section-complete.tsx`** (27 Oct 2026, the layout the
user approved): a yellow hero (Trophy on an orange tile, the node label and
title), three tiles, the lesson's progress, today's goal, and a footer of
← ផ្លូវមេរៀន + ផ្នែកបន្ទាប់ → (the next PUBLISHED section in path order; with
none, the path button alone). No confetti, no wrong-answer list (not asked for).
- **Every figure is measured.** The old screen printed a fixed "+20 XP", which was
  wrong whenever a quiz answer paid or the day's lesson task was already done.
  XP and coins are the store's own difference between opening and finishing;
  correct is out of both quizzes (the tile is absent with no questions); time is
  from opening.
- It REPLACES the runner: `SectionDetail` returns it from a `summary` state set in
  `finish()`, as a one-line return above the closures (the React Compiler rule).
  Back is therefore step 1 only.
- Lesson progress counts like the path banner (finished playable over every node
  of the lesson), so the two agree. The goal's open tasks link through
  `taskHref()`, like Home's Missions card.
- `elapsedSince()` sits outside the component because oxlint's react(purity)
  flagged `Date.now()` inside `finish()`, a click handler.

**The colour is the STRIPE and only the stripe.** Card body is `bg-surface` with a
neutral `border-border` hairline, and the label is ordinary `text-text`. The first
version tinted the background and the label as well; with four of these stacked on
one screen the page read as a colour chart and the stripe stopped working as the
thing that tells one block from another. One coloured element per card — don't
reintroduce a `bg-{tone}/8`. The single exception is the ✍️ ការពិត card nested
inside a ❌ card, which takes `bg-control` so it has something other than its own
stripe separating it from the surface it sits on.

**`Session.lessonId` is now `Session.href`.** A section and a lesson route to
different places, so the field answering "is this playable, and where does it go"
had to stop being lesson-specific — ONE field rather than two that drift:

- authored section → `/sections/{id}` **iff the manifest lists it as published**
  (`sectionPublished()`; `SECTION_CONTENT[id]` existing, before 7 Oct 2026)
- derived fallback → `/lessons/{subject}-{topic}` (the old 7-step lessons; gone since 7 Oct
  2026, so the fallback has placeholders only)

That `iff` is the rule: playability is DERIVED from content existing, never
authored beside it. `completedSessions` is untouched — it matches on
`session.id`, and for derived paths `id` already is the lesson id.

**The landing rule's two sources must be TWO PASSES, not one loop.** Interleaved,
an `openHere` on an earlier lesson beats a real unfinished session further down —
the fallback beating the rule it stands in for. Rule 2 may only run once rule 1
has been ruled out across the whole path. (Caught by the end-to-end test, not by
types.)

`/sections/:sectionId` is a focus route (nav hidden) but **not** an assessment
route, so KruAI stays reachable — same rule as a lesson. `defaultMathLayout`
matches `/sections/` since the subject is the first id segment.

**`LESSON_TAIL` — កំហុស / សេចក្តីសង្ខេប / តេស្ត — is appended to EVERY lesson.**
Those three are structural rather than topic-specific, so only sections 1–3 differ
per lesson. It is an inference from the one lesson whose sections were supplied,
and it is one constant to change if wrong. `កំហុស` is a plain locked node today:
it names a mistakes-collection feature that does not exist yet, and reserves its
position and nothing more.

`sessionStatus()` is derived, never stored — a stored status would drift from
`completedSessions` the first time a lesson id changed. Note **"locked" means "not
written yet", NOT "not earned"**: gating a session on finishing the previous one
needs the real chapter structure first, or it would lock content that exists.

**A locked node carries a ឆាប់ៗនេះ chip, and its `aria-label` says the same.**
Without it the node is full colour with a play glyph and answers a tap with
nothing, which is exactly what was reported. The chip does NOT make it
pressable — it stays a `<div>` — it only stops the state being a surprise. The
label matters as much as the chip: a screen reader previously announced a locked
node identically to a playable one.

**`completedSessions` holds LESSON ids, not a separate session id.** That is what
lets `LessonDetail`'s `finishQuiz` mark the path node done with the id it already
has, with nothing to keep in step. `completeSession` is idempotent so re-finishing
a lesson cannot stack.

### The Duolingo look, and where its limits are

The path deliberately borrows Duolingo's *visual grammar*, and almost all of it
is CSS — no artwork was needed:

- **The "lip" is the whole look.** A node is a solid disc sitting on a darker
  slab of the same colour (`0 5px 0` box-shadow — a hard offset with NO blur, so
  it reads as an edge rather than a shadow), and it presses into that slab on
  `:active` by exactly the distance the lip shrinks. The unit banner carries the
  same lip so the page reads as one material.
- **The lip colour is `color-mix(… black)`, never `--color-subj-*`.** That scale
  is *lighter* than the fill in dark mode, which would light the button from
  below. Mixing toward black is the only rule correct in both themes.
- **`startBob`** (globals.css) bobs the START bubble. Transform-only and in the
  `prefers-reduced-motion` block, like every other loop here.

**The curve was wrong once and the fix is worth keeping.** The connector is a
CUBIC with both control points vertically aligned with their own endpoint. A
quadratic through one midpoint leaves each endpoint aimed *diagonally*, so
consecutive segments disagreed on tangent and every node had a visible kink
through it. Vertical control points make each segment leave and arrive straight
up and down, so segments share a tangent and read as one continuous snake.

**The mascot is the one thing CSS cannot do**, which is why `Mascot` is a hole
rather than an invention: an `<img>` at `/mascot/idle.webp` that `remove()`s
itself on error, so nothing renders until artwork exists. `hidden md:block` —
on a 320px phone a character would cover the very nodes it is meant to cheer on.

**The banner's count is PER LESSON** — not per chapter, and not per path. It has
been wrong at both wider scopes, and each widening hid it one level longer,
because with a single lesson in a single chapter all three numbers coincide. It
would only have surfaced once a real curriculum landed and every banner claimed
the same total.

**This pulls the page away from the rest of the app on purpose, and only so far.**
Chunky pressable buttons live here and nowhere else; Home, Progress and
Leaderboard stay flat. Note this partly reverses the earlier call recorded in the
focus-mode section, where Duolingo's flat no-card look was considered and
declined — that decision still stands for the lesson flow itself.

### Coins

`coins` is a real persisted store field, added for this page's stat bar. It is
awarded by `award()` in `lib/store.ts` — the ONE place XP, level and coins are
granted together, which both `addXp` and `completeTask` now route through. The
level rule used to be written out twice, once in each; that is exactly how a third
caller ends up levelling differently.

`COINS_PER_XP` is the DEFAULT rather than a universal law: coins are the same
earned effort as XP in spendable form, so anything granting XP grants coins in
proportion unless it says otherwise, with no per-action table to keep in step.
`Math.floor` means small grants round to zero, which is correct.

`addXp(amount, coins?)` lets a caller override that ratio. **Exactly one does**:
a correct section-quiz answer, set by hand at 10 XP + 5 coins (twice the ratio),
in `section-detail.tsx`'s `QUIZ_XP`/`QUIZ_COINS`. It is an argument rather than a
second constant in the store so the exception stays visible at the call site — and
if a third or fourth caller ever needs one, that is the signal the ratio itself is
wrong and should be re-set, not worked around again. A wrong answer earns nothing
at all rather than a smaller amount: the correct option is revealed immediately,
so a consolation payout would make guessing worth as much as thinking.

**Nothing spends them yet.**

There is deliberately **no energy/hearts meter** despite the reference having one.
A decorative one is a promise the product does not keep, and a real one needs
refill-over-time rules and a paywall story nobody has designed.

**Mock Exam** (`features/exam`) — a two-tab screen; see its own section below.

## The 3D model waits for a tap (4 Nov 2026)

`SectionModel` (`section-model.tsx`) holds the lazy boundary now, and shows a tile the viewer's size until tapped.
Opening biology 3.1.1 used to download 4.7 MB by itself, before the student had scrolled to the model. It is now
under 1 MB, and the tap adds about 1 MB, which the tile says. **The model went from 3.8 MB to 861 KB**, and the
original is `design/brain.source.glb`; the commands and their traps are in `design/README.md`.

- **`DOWNLOAD_SIZE` is what the tile tells a student.** Change it if the model changes much. A model not in it
  shows no size rather than a guess.
- **`ModelErrorBoundary` is in the viewer** because a dropped download used to reach the app's own boundary and
  replace the whole screen. `useGLTF` caches a failed load, so Try again clears it first.
- **The compressed file needs `'wasm-unsafe-eval'`**, already in the policy, and decoding is now real work the
  policy must allow rather than an unused decoder starting up.

**Verified:** the production build with the real headers from `vercel.json`, in Chrome, at 360 light and 320 dark:
nothing 3D downloads on opening, a tap loads it, tapping a part still names it, a failed download keeps the lesson
and Try again works. The original and compressed models compared by eye, whole and zoomed in. **Not verified:** a
real phone's graphics chip. Software rendering says nothing about how 112,000 triangles feel on a cheap one.

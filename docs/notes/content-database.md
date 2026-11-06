# Content in the database

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Flashcards and quizzes move into the database (stage 1, 3 Oct 2026)

The plan is `docs/plans/content-in-database.md`; this records what is built. **Stage 1 is
COMPLETE**: step 1a (the tables, the editor, the import, commit `64efc97`) and step 1b
(students read from the database; the code copy deleted). The owner imported
`content/fixture.json` on 3 Oct 2026 and `check:content --live` confirmed 26 of 26 items
exactly. The user's decision that shapes everything below: **only the owner presses Publish.**

Why it exists:
- **Fixing a question took a code change.** The "Fixed" button on `/admin/mistakes` only
  recorded that someone had already fixed it in code.
- **Every student downloaded every deck and quiz before the first screen.** `index.html`
  modulepreloaded `practice-*.js` (349 KB raw, 62 KB gzip). Step 1b removed it.

This **reverses "Content stays in `src/data/`"** for these two kinds only. Sections (stage 2)
and past papers (stage 3) stay in code until their own stage.

### The database: `20261003000001_content_in_database.sql`

| table | holds | read by | written by |
| --- | --- | --- | --- |
| `content_items` | one row per deck or quiz: `kind` (`deck`/`quiz`), `key`, `version` (null = not published), `item_count`, `item_ids` | anyone, guests too (published rows only) | functions only |
| `content_versions` | every published version, never changed: `body` jsonb, `published_at`, `published_by` | anyone, every version | functions only |
| `content_drafts` | at most one draft per item, `base_version`, `updated_at`, `updated_by` | nobody directly | functions only |

`content_items` is the MANIFEST step 1b's phones download. A body is fetched by
`(kind, key, version)`, which never changes, so a phone keeps it for ever. Every version
stays readable so a student reopening an old quiz attempt can load the version they took.

**Bodies.** A deck is `[{ id, front, back }]`; a quiz is `[{ id, scenario?, q, options,
correct, explanation, help? }]`, the `SectionQuestion` shape (which gained an optional `id`)
plus a stable id. Types: `ContentKind`, `DeckCardBody`, `QuizQuestionBody` in
`types/index.ts`.
- **Card ids are kept for ever** (`biology-1-1-3`). Review history is keyed by them, so a new
  card takes a number outside every id any version ever used (`admin_content_get`'s
  `used_ids`, `newCardId()` in `features/admin/content-edit.ts`). A reused id would hand an
  old card's history to a new one.
- **Question ids are `q1`, `q2`…**, assigned at export in today's order, never reused. Step 1b
  makes mistake reports name a question by it (`quiz:math-1-1-1#q3`; `REF_PATTERN` already
  allows it), so a report survives the questions being reordered.
- **jsonb reorders object keys.** A body read back is equal but not byte-identical. Every
  comparison (`check-content.mjs --live`, `sameBody()`) sorts keys first.

**Functions** (SECURITY DEFINER, `set search_path = ''`, refusals carry a `hint`):

| function | who | notes |
| --- | --- | --- |
| `content_current(kind)` | anyone | every current body of one kind, for KruAI's server and `/practice/review` (1b). Security invoker |
| `admin_content_list()`, `admin_content_get(kind, key)` | admin | get returns `{ published, draft, used_ids, versions }` |
| `admin_save_content_draft(kind, key, body, expected)` | admin | `expected` = the draft's `updated_at` as loaded (null = none); anything else is `stale` |
| `admin_discard_content_draft`, `admin_restore_content_version` | admin | same `stale` rule; restore copies an old version into the draft |
| `admin_publish_content(kind, key, expected)` | **owner** | `owner_only` for anyone else; publishes exactly the draft that was reviewed |
| `admin_unpublish_content(kind, key)` | **owner** | `version` → null: students see "coming soon"; versions kept |
| `admin_import_content(items, publish)` | **owner** | all or nothing on shape; per item `published` (never published + `publish`), `draft`, or `skipped` (a draft exists). Never replaces a published version |

**Two levels of checking, on purpose.** A DRAFT only needs unique ids
(`content_draft_problem`), so half-finished work (a card with no back yet) can be saved. The
full shape check (`content_body_problem`: types, lengths, 2–6 distinct options, `correct`
among them, help's exercises too) runs at publish and import. The helpers are revoked from
every client role.

### The checks students' content must pass: `src/utils/content-check.ts`

ONE set of rules, used by the editor live, by `scripts/check-content.mjs` and by
`scripts/content-export.mjs`. They are `check:quiz`'s and `check:digits`' rules moved to
where the content is now written, because neither script can see the database: every `$…$`
typeset with KaTeX (`throwOnError`), no Khmer inside a formula, no stray `$` (except `$20`
money), `correct` among the options, no duplicate options, **no Khmer numerals, no em
dashes**, a bare `ក. ` option counts as empty. Two WARNINGS that never block: ក. ខ. គ. ឃ. out
of order, and correct answers bunched on one letter (`answersBunched`, the AGENTS.md
distribution rule). KaTeX answers are cached per formula, so re-checking a long maths quiz on
every keystroke stays fast.

**KaTeX's chunk changed NAME because of this.** content-check imports KaTeX directly, so
Rolldown emitted the shared KaTeX chunk as **`math-render-*.js`** (≈261 KB raw, 78 KB gzip),
not `math-text-*.js` (now 4 KB, the component only). Since 4 Oct 2026 it is
**`sanitize-svg-*.js`**, because content-check imports the SVG sanitizer as well. It is still lazy and still absent from
`index.html`'s preloads. **Check the KaTeX chunk by content (`renderToString`), not by name.**

### The editor: `/admin/content`

- `pages/admin-content.tsx` (list) and `pages/admin-content-edit.tsx`
  (`/admin/content/:kind/:key`, `?q=q3` opens a question). Lazy, NOT in `routeModules`, like
  every admin page. Chunks: `admin-content-*.js`, `admin-content-edit-*.js`, `content-slots-*.js`.
- **Slots come from the curriculum** (`features/admin/content-slots.ts`): decks from
  `chaptersFor()` over `FLASHCARD_SUBJECTS`, quizzes from `quizPathFor()` sections or
  `chaptersFor()` lessons. "New" only offers empty places a student can reach; a key is
  never typed. A stored key with no slot (history's `-1-1-1` aliases) is named by subject and
  numbers.
- **The working copy** lives in `content-editor-view.tsx`; card and question parts are in
  `content-item-editors.tsx`. The correct answer is a radio beside each option, so it can
  never be missing, and editing the correct option's text carries `correct` along. Fields with
  maths show a live `MathText` preview; Preview shows a card or question as students see it.
- **Checks** run from a `useDeferredValue` copy, tidied first (`tidyBody()`: empty optional
  fields dropped, blank rule lines removed). Errors disable Publish; the list of problems
  jumps to the item.
- **Save draft** (any admin), **Publish** (owner; saves first if there are unsaved changes),
  **Undo my changes**, **Discard draft**, **Hide from students** (owner), and a version
  history with **Restore as draft**. Removing an item or confirming a destructive action
  takes two taps. Leaving with unsaved changes asks first.
- **Import** (owner, on the list): a JSON file is checked in the browser with the same rules
  before it is sent; "publish items never published" is for the one-time move only.
- The yellow "students still see the code's copy" note on the list is gone (step 1b).
- Copy is bilingual in `features/admin/content-copy.ts`; the hub's sixth tool card is
  Content (six cards, none spanning: md 3×2, xl 2×3).
- **Everything explains itself on hover or tap** (3 Oct 2026, the hub's pattern), from
  `tips` and `issueHelp` in `content-copy.ts`:
  - the list: an ⓘ on the New and Import panels and beside the publish-on-import box, and a
    legend above the rows whose three chips (Live, Not published, Draft) are the triggers.
    **The chips on a row cannot be**: a row is a `<Link>`, and a button inside a link is
    invalid, so the legend explains them once in the same colours;
  - the editor: the item's key, the "who sees what" line, Checks, Versions, one ⓘ for all the
    action buttons, a card's id, and every field that is not obvious (front, back, situation,
    options, explanation, the help parts);
  - **every problem line under a field is a trigger saying how to fix it** (`issueHelp`, one
    per `IssueCode`, typed `satisfies Record<IssueCode, string>` so a new code fails to
    compile without one). The lines in the Checks card stay jump buttons.
- **`TextField` is a `<div>` with a `<label htmlFor>` now, not a wrapping `<label>`**: a
  button inside a label that already holds the textarea is a second labelable element in it.
  The publish-on-import ⓘ is a SIBLING of its checkbox's label for the same reason; clicking it
  does not tick the box (checked in the browser).
- **The ⓘ's tap area is `-m-1 p-1`**, so where it ends a shrink-wrapped box (the options
  `<legend>`, the help title, the import row) that box carries `pr-1`/`mr-1` to contain the
  4px. Without it the page does not scroll, but the strict overflow check flags the box.
- **The sentences are claims about the rules** (`content_body_problem`, the checks in
  `utils/content-check.ts`, who may publish). Change a rule, change its sentence, in both
  languages.
- Verified in the browser against the faked functions: 40 checks (every trigger opens the
  right text inside the screen with a mouse at 1280 in English and a finger at 320 in dark
  Khmer, labels still focus their boxes, no sideways scroll, no page error), and the earlier
  45-check editor run still passes.

### Moving the content, and new content afterwards

- `content/fixture.json` is what the database was filled from: 17 decks (192 cards) and 9
  quizzes (98 questions), exported from the code on 3 Oct 2026 before the code was deleted.
  It is now the DEVELOPMENT FIXTURE (below). `npm run content:export` refreshes it by
  DOWNLOADING what is published (`content_current`, publishable key from `.env`), checked
  with the same rules; it no longer reads code, since there is none.
- `npm run check:content` checks every `.json` under `content/`; `-- --live <file>` downloads
  what is published (`content_current`, publishable key) and compares item by item. That is
  the proof the import arrived exactly.
- **The database is the only copy.** New decks and quizzes are written as JSON under
  `content/new/`, checked with `check:content`, imported by the owner as drafts, reviewed,
  published, and the file deleted. **`content/README.md` holds the authoring rules** that
  used to sit in the headers of `data/quizzes/*.ts`: the distractor rules, the LaTeX and
  Khmer rules, keys and ids, and where the first content came from.

### Verified

- PGlite, the migration applied twice after `20261002000001`/`0002`: **95 checks** (keys and
  shapes at save vs publish, `stale`/`missing`/`owner_only`, versions 1→4 through
  publish, restore and unpublish, `used_ids`, import outcomes and all-or-nothing refusal,
  guests read only the manifest and versions, no client role can write or call a helper), plus
  the real `fixture.json`: all 26 items publish as version 1 and read back identical.
- Browser, Supabase faked through Playwright `route` with an in-memory copy of the
  functions' rules: **45 checks** at 1280 owner, 390 admin and 320 dark Khmer owner (import
  with the browser-side check, list and names, edit with the correct answer following its
  option, an em dash blocking Publish, save/publish/restore to version 3, new ids q11 and
  biology-1-1-7 after removing card 2, stale refusal, hide, an admin's draft with no Publish
  or Import, a student refused and never calling an admin function, no sideways scroll, no
  page error).
- The build: no admin or checker code in the entry chunk; KaTeX lazy (above).

### Step 1b: students read from the database

**`src/lib/content.ts` is the whole client side**, and it downloads two things:

- **The manifest** (`content_items`, published rows only): kind, key, version, count, and a
  deck's card ids. A plain `fetch` with the publishable key, like `lib/announcements.ts`, so
  guests read content and never download the SDK. Once per app load, and again after 30
  minutes in the background. Kept in `localStorage["brachnha-content"]`, so a returning
  phone has it at once and an offline open still knows what exists.
- **A body** (`content_versions`, by kind + key + version), only when a deck or quiz is
  OPENED. A published version never changes, so it is stored for good in **Cache Storage**
  (`brachnha-content-v1`, keyed `https://content.brachnha.invalid/{kind}/{key}/{version}`, a
  name only, never fetched). NOT the service worker, which still caches only
  `offline.html`. Without Cache Storage (an insecure origin) bodies live in memory.

Read through `useContentManifest()`, `useContentBody(kind, key, version)` and, for the two
screens that need every body of a kind, `useAllBodies(kind, manifest)` (Daily Review, the
admin's mistakes page): whatever the phone holds is reused and the rest comes in ONE
`content_current` request. Module state behind `useSyncExternalStore`.

**`src/utils/content-manifest.ts` holds the pure side** (the `ContentManifest` type,
`deckEntry`, `quizCount`, `entryVersion`, `toPracticeCards`). **The manifest is passed as an
ARGUMENT to every function that decides what exists**: `quizPathFor(subject, manifest)`,
`practiceLessonsFor(subject, mode, manifest)`, `readyLessonCount`, `readyQuizSectionCount`,
`buildStudyFeed`, `buildRealPrediction`. A helper that read module state on its own would be
memoised around by the React Compiler and keep its old answer after the manifest arrived.

**What only COUNTS downloads no lesson.** The manifest carries each deck's card ids, so
Home's study feed, Progress's study tips (`gradedDueCount`) and Grade Prediction work from it
alone; `deckStates()` in `features/practice/review.ts` pairs ids with review states without
the cards. `cardsFor`, `dueCardsFor`, `allCards` and `allDueCards` take the official cards as
an argument now.

**`quizPathShape(subject)` vs `quizPathFor(subject, manifest)`.** The path's STRUCTURE stays
in code (`features/practice/quiz-path.ts`) with every `href` null; `quizPathFor` adds a link to
each section the manifest says is published. `findQuizSection` and the admin's slots
(`content-slots.ts`) read the shape.

**The states a student can see**, all in `features/practice/components/content-waiting.tsx`:
a quiet "កំពុងទាញយក…" while something downloads (no skeleton bars), and, on a FIRST open
with no network, a sentence saying the first open needs internet, with Try again. The
runner's version is a FocusLayout with its X, because a focus route has no navigation.
**`pages/practice-run.tsx` redirects only once the manifest has ANSWERED** that an item is
missing, never while it loads.

**Quiz attempts record their version** (`QuizResult.version`, optional; absent = version 1,
which is what the code copy became). `QuizScreen` reopens an older attempt through
`OlderVersionResults`, which downloads THAT version, because answers are index-aligned with
the questions the student saw. A retake runs the current version.

**Mistake reports name a quiz question by its id** (`quiz:math-1-1-1#q4`):
`quizRef(key, question, index)`. Older reports by position still resolve.
`features/admin/content-ref.ts` takes the quizzes as an argument (`useAllBodies("quiz")` on
the page), and a quiz report's card has an **Edit** link to
`/admin/content/quiz/{key}?q={id}`. "Fixed" now means fixed there, for quizzes.

**KruAI reads the decks from the database**: `server/content-source.ts` fetches
`content_current('deck')` with the publishable key and keeps it 10 minutes per instance (one
retry a minute after a failure, 3s timeout). `buildSystemPrompt`, `buildCatalogBlock` and
`pinnedContextFor` take a `DeckMap` argument, so `chat-prompt.ts` stays pure and alias-free.
**Unreachable means no deck list, never no answer.** The client still sends only a key.

**The deck request starts the moment a question arrives** (`decksPromise` in
`handleChat`, right after the body is validated; since stages 2 and 3 it is
`contentPromise`, fetching decks AND sections) and is awaited only where the prompt is
built, so a cold copy's round trip (measured 0.7 to 1.6 s for the whole 75 KB of decks)
runs in the shadow of the sign-in and daily-limit checks instead of after them. Safe
because `publishedDecks()` (now `publishedContent()`) never rejects: a request refused
before the await leaves no
unhandled rejection, and a refused or curated question just warms the copy for the next
one. Don't move the call back down beside `pinnedContextFor`.

**Development without Supabase reads `content/fixture.json`** (`import.meta.glob` behind
`import.meta.env.DEV`), so a fork and `scripts/shots.mjs` (run with the variables blanked)
still show content. Production builds drop the branch: the fixture's text is in no chunk of
`dist/` (checked).

**Home prefetches the likely next tap**: at idle, the bodies of the top 3 decks or quizzes
on the study card (`use-study-feed.ts`), once per version like any other body.

**Deleted:** `src/data/practice.ts` and `src/data/quizzes/*.ts`. `check:quiz` no longer checks
practice quizzes (`check:content` and the editor do).

**Bundle, measured on the same machine:** what the first screen downloads (entry + every
modulepreload, gzip) went **305 KB → 245 KB**. The 62 KB practice chunk is gone from the
preloads; the entry grew about 3.5 KB for the loader. The SDK is still its own lazy chunk.

**Verified:**
- Browser, the database faked through Playwright `route` with the real fixture as content:
  **34 checks** at 390 light, 320 dark Khmer and 1280. The hub and lists come from the
  manifest with no body downloaded and no SDK for a guest. Opening a deck downloads only that
  deck, and its review history stays attached. Reopened with downloads blocked, it comes from
  Cache Storage; with the manifest unreachable, the hub opens from the phone's copy. The Daily
  Review uses one request; Progress downloads nothing; Home prefetches its top two decks. A
  republished quiz opens on version 2 while an old attempt reopens on version 1. A report
  names `#q1`. The owner's mistakes page resolves `#q2` and an old `#3` with Edit links. A
  first open offline shows the notice and Try again recovers. No sideways scroll, no page
  error.
- The 1a editor run (46 checks) and the explanations run (40) still pass.
- KruAI through `ssrLoadModule` against a fake `content_current`: **7 checks** (17 decks read,
  the second question reuses the copy, the catalog and an open deck in the prompt, an
  untrusted key gives nothing, an unreachable database gives no decks in 4ms and the prompt
  still builds).
- The real `handleChat` against a fake Supabase where the deck request and `kruai_take`
  each take 600ms: **8 checks**. The model is reached at 680ms (one wait, where two would
  be 1,200), the open deck still reaches the prompt, a warm instance makes no deck
  request, a refused request and a failing deck request leave no unhandled rejection,
  and KruAI still answers with the deck request failing.
- A dev server with Supabase blanked opens a quiz and a deck from the fixture with no
  database request (4 checks).

## Lesson sections and past papers move into the database (stages 2 and 3)

The plan is `docs/plans/sections-and-papers-in-database.md`. **Both steps are built.**
- **Step A (4 Oct 2026):** the database, the checks and the editor.
- **The move (7 Oct 2026):** the owner applied the migration and imported the 7 sections and
  2 papers (9 of 9 exact).
- **Step B (7 Oct 2026):** students read sections and papers from the database, and the
  code copies are deleted.

### The database: `20261003000002_sections_and_papers.sql`

Two more kinds in stage 1's three tables, `section` (key `biology-3-1-1`, the Study path
node) and `paper` (key `2025-math`). Apply AFTER `20261003000001`. The functions keep their
names and arguments, so the app's calls did not change.

- **Bodies are OBJECTS for these two kinds.** Everything that measured a body with
  `jsonb_array_length` now asks two helpers:
  - `content_count(kind, body)`: cards; questions; a section's questions (MAY BE 0); a
    paper's scored questions and gaps (the example gap is not scored);
  - `content_item_ids(kind, body)`: a section's question ids (`quiz` then `quizHarder`), a
    paper's question and gap ids, part by part.

  The one-argument stage 1 helpers are dropped.
- **Draft vs publish, as in stage 1.** A draft needs the right type and unique ids
  (`content_draft_problem(kind, body)`). Publish and import run `content_section_problem` or
  `content_paper_problem`:
  - a section: four blocks with at least one point between them, a poster matching
    `^/sections/….webp$`, a model matching `^/models/….glb$` with its credit, an 11-character
    YouTube id, question ids unique across both quizzes;
  - a paper: each part holds questions OR a gap-fill, a gap's answer is in the word box and
    its `{n}` is in the passage, a named skill exists in `skills`, at least one scored item.

  The SQL cannot see an SVG; the editor can (below).
- The kind CHECK on the three tables is replaced, found by its text, so the file re-runs.
- **Decks and quizzes behave exactly as before**: stage 1's 95 database checks and the
  real-fixture check pass with this migration applied twice on top.
- **A section's `item_count` can be 0.** The students' manifest reader (`toManifest()`)
  accepts that for a section and requires at least 1 for a deck or quiz.

### What is stored

- **A section** is `SectionContent` with an `id` on every quiz question (`q1…`, across
  `quiz` then `quizHarder`, never repeated between them). `SectionBody` in `types/index.ts`.
- **A paper** is `PastPaperContent` with two changes (`PaperBody` and its parts in
  `types/index.ts`):
  - `q` is ONE string. Both papers carry the same text in `en` and `km`, and the export
    refuses if they ever differ;
  - it carries `skills`, the drills its questions name. The English paper carries its 8
    (once `data/papers/english-drills.ts`); the maths paper names none. `skill` is a plain
    string key.

### The checks: `utils/content-check.ts`

`checkSection` and `checkPaper`, on the same text rules as stage 1.

- A problem in a section or a paper has `item: -1` and its WHOLE path in `field`
  (`lesson.items.2.body`, `sections.0.gapFill.gaps.3.correct`). `locationLabel()` in
  `features/admin/content-copy.ts` names a path in words, in both languages.
- New codes, each with an `issueHelp` sentence: `badNumber`, `badPoster`, `badModel`,
  `badVideoId`, `svgChanged`, `partShape`, `notInBank`, `gapMissing`, `duplicateGap`,
  `sameWords`, `unknownSkill`.
- **An SVG the sanitizer would change is an error** (`svgChanged`): anything
  `sanitizeSvg` strips was not meant to be there. It needs `DOMParser`, so it runs in the
  editor and in the import's browser-side check, and is skipped in the Node scripts. The
  maths paper's graphs pass it.
- **The checker found 11 em dashes in the maths paper's explanations**, inside `String.raw`
  strings the 28 Sep sweep missed. They were rewritten before the move (the code copy is
  gone, so they live in the database now): `។`
  between two sentences, `៖` before an explanation, parentheses for an aside. The user has
  not reviewed the Khmer of those 11 lines yet.

### The editor: `/admin/content`

- **Two more tabs**, "Lesson sections" / "ផ្នែកមេរៀន" and "Past papers" / "វិញ្ញាសារឆ្នាំចាស់".
  Below 360px the four labels drop a size, or "Flashcard" broke mid-word.
- **Past papers have no New.** The panel says a new paper arrives as a file to import.
- **`content-editor-view.tsx` is the SHELL for all four kinds** (load, save, publish,
  versions, checks). The body is drawn by `section-editor.tsx`, `paper-editor.tsx` or stage
  1's card and question lists. Shared parts live in `content-item-editors.tsx` (`TextField`,
  `NumberField`, `SelectField`, `ChoiceFields`, `HelpEditor`, …); class strings live in
  `editor-styles.ts` (a `.ts` for oxlint's only-export-components rule).
- **The section editor**, in the student's order (step 1, then step 2):
  - title, and the video: a poster picked from `SECTION_POSTERS`, a length, a YouTube id;
  - the four blocks: a lead, points (bold words, text, sub-points), a closing;
  - the 3D model, picked from `SECTION_MODELS`, with its credit prefilled;
  - the mistakes, and the two quizzes through stage 1's `QuestionEditor`.

  **Preview draws with the REAL renderer.** `SectionBlockBody` and `MisconceptionCard`
  moved out of `section-detail.tsx` into `features/lessons/components/section-blocks.tsx`,
  unchanged.
- **New** offers each authored Study-path node with nothing published (an id shaped
  `{subject}-n-n-n` in `chaptersShape()`), and a new section starts with the node's name as
  its title.
- **The paper editor**: minutes, points, note; then per part:
  - the title, instruction, exercise and example (the paper's own words);
  - its questions (add, remove, move). A new id takes the part's letter and the next number
    never used (`newPaperItemId`);
  - or its passage, word box and gaps. Renaming a word carries every gap that used it, and
    a gap's answer is picked from the box.

  Then the writing task, and the skills (a new one by id).
- **`section-media.ts`** lists the posters and models. `check:content` fails when it differs
  from `public/sections/` and `public/models/`, or when a file names one that is missing.
- **Tapping a problem in the Checks card opens its question and scrolls to it**
  (`jumpToField`); `?q=l4` does the same for a section or paper question.
- **The Checks card says "Working…" until the loaded body has been checked once**, and
  Publish waits. Before that the deferred copy is still the empty placeholder, and a big
  paper read "The paper: is empty" for as long as checking it took.

### Verified (step A)

- **PGlite: 79 checks.** The migration applied twice; keys; the real file imports as version
  1 and reads back identical, with the right counts and ids; guests read the manifest;
  drafts, publish, restore, unpublish and used ids; an empty new section saves but cannot
  publish; 21 publish refusals; import all or nothing; no client can call a helper. Stage
  1's 95 + 5 still pass.
- **Browser, the database faked: 59 checks** at 1280 owner, 390 admin and 320 dark Khmer
  owner:
  - the import file checked in the browser; the lists and their names;
  - an em dash in a lesson blocks Publish, and its problem scrolls to the block;
  - a YouTube link caught; a new question takes q16, after both quizzes;
  - a save keeps every field; a section written from empty publishes with count 0;
  - renaming a word carries its gap; a gap missing from the passage scrolls to the gap;
  - a new paper question takes its part's letter;
  - the maths paper's graphs pass the SVG check and draw; `?q=c5` opens and scrolls;
  - an admin saves without Publish; no sideways scroll; no page error.

  Stage 1's 46 + 40 browser checks still pass, and the student's section page renders as
  before.

### The move

- Done once. `content:export --from-code` wrote `content/sections-papers.json` (the 7
  sections and 2 papers ONLY; the 26 decks and quizzes would have come back as needless
  drafts), the owner imported it with "publish items never published" on 7 Oct 2026, and
  `check:content --live` confirmed **9 of 9** exact.
- The export refused a file with an error, or one the editor's Save would change:
  `tidyBody` must keep every field, or the first save would lose it.
- The one warning left is the English paper's grammar part (3 of 5 answers on one letter).
  That is the real answer key, not ours to move.
- `--from-code` and `sections-papers.json` went with the code copy. `content:export` now only
  DOWNLOADS what is published, all four kinds, into `content/fixture.json` (35 items).

### Step B: students read sections and papers from the database (7 Oct 2026)

**`lib/content.ts` covers four kinds.**
- The manifest has `deck`, `quiz`, `section` and `paper`. Each kind's key is checked
  against its own pattern (`CONTENT_KEY` in `utils/content-manifest.ts`).
- A section's count may be 0; a deck or quiz needs at least 1.
- A phone's stored manifest from before (no section or paper) still reads.
- `isBody(kind, value)` checks a downloaded body by kind: a list with ids; a section with a
  title, the four blocks and `mistakes`; a paper with `minutes` and parts.
- `useContentBody`, `useAllBodies`, `prefetchBody` and the Cache Storage keys take all four.
  `LoadKind` is gone.

**The Study path is shape plus links, like the quiz path.**
- `chaptersShape(subject)` is the structure, every section's `href` null.
- `chaptersFor(subject, manifest)` links each section the manifest lists
  (`sectionPublished()`). It tests that the ENTRY exists, never its count: a section with no
  quiz is still a section to read.
- `hasSectionContent()` is deleted.
- Structure only: `practice.ts`, `practice-run.tsx`, `content-slots.ts`. With the manifest:
  `subject-path-view.tsx`, `study-feed.ts`, `real-prediction.ts`.
- **`subject-path-view.tsx` keys its lesson refs by a STRING** (`lessonKey()`, the lesson's
  first session id), not by the lesson object. The path is rebuilt from the manifest on
  every render, so an object key is new each time and the landing scroll would fire on
  every render.
- It shows a `ContentNotice` above the path while the manifest first loads.

**`/sections/:sectionId`** (`pages/section-detail.tsx`):
- downloads that one section (by its published version) and hands it to `SectionDetail` as
  a prop;
- shows `ContentWaitingScreen` (a FocusLayout whose X goes back to the subject's path) while
  it loads, or offline on a first open;
- redirects to `/subjects/{subject}` only once the manifest has ANSWERED that the section is
  not published.

**A section report names its question by id**: `sectionRef(id, question, step, index)` gives
`section:biology-3-1-1#q3`. Older `#0-2` reports still resolve.

**Past papers** (`features/exam/papers.ts`):
- `PAST_PAPER_YEARS` stays in `data/past-papers.ts` (it is structure). `PAST_PAPERS` and
  `data/papers/` are deleted.
- A card comes from the manifest alone: `pastPaperCard(key, manifest)` gives the title,
  blurb, `count` and `version`, no body. `papersForYear(year, lang, manifest)` builds the
  tab, and `ExamPaperCard` is ready when `count > 0`.
- `/exam/subjects/:paperKey` downloads the paper and builds the full `PastPaper` with
  `withContent()`. `toPastPaperContent()` turns the stored one-string `q` back into
  `{ en, km }`, so the detail screen, runner and results are unchanged.
- **`PaperResult.version`** (optional; absent = 1, which is what the code copy became). An
  old attempt reopens on the version that was sat (`OlderVersionReview` in
  `paper-screen.tsx`), as a quiz attempt does, because answers are keyed to its questions.
- `past-paper-results.tsx` takes a drill from the paper's own `skills` (`Object.hasOwn`).
  `SkillId` is a plain string now.
- Generated papers (Tab B) are `GeneratedPaper` and did not change.
- The past-papers tab shows a `ContentNotice` while the manifest first loads.

**Admin mistakes**: `resolveContentRef(ref, sets)` takes the quizzes, sections and papers
(`useAllBodies` for each, one request a kind). Every section and paper report that resolves
has **Edit**, to `/admin/content/{section|paper}/{key}?q={id}`. A paper ref resolves through
`toPastPaperContent` and `scorePaper`.

**KruAI reads the sections too.**
- `publishedContent()` in `server/content-source.ts` replaced `publishedDecks()`. It fetches
  decks and sections IN PARALLEL, each with its own 10-minute copy, and never rejects.
- `contentPromise` in `handleChat` (it was `decksPromise`) starts it the moment a question
  arrives, as before.
- `buildSystemPrompt`, `buildCatalogBlock` and `pinnedContextFor` take a `SectionMap` beside
  the `DeckMap`. `chat-prompt.ts` no longer imports `data/sections`.
- A section whose body is malformed is dropped (`toSections`). Unreachable still means no
  section text, never no answer.
- Past papers never reached KruAI and still do not.

**Home** prefetches a top section as well as decks and quizzes, and never a paper: a paper
is larger and is fetched when opened.

**Dev without Supabase** reads sections and papers from `content/fixture.json` too.

**Deleted:** `src/data/sections.ts`, `src/data/papers/math-2025.ts`, `english-2025.ts`,
`english-drills.ts`, `content/sections-papers.json` and `content:export --from-code`.
`check:quiz` checked game questions only (then the mock-exam questions, until it was
deleted with them); `check:content` and the editor check sections and papers.

**Bundle, measured on the same machine:** the first screen (entry + every modulepreload,
gzip) went **268 KB → 238 KB** (268,400 → 237,998 bytes). The 17 KB `sections-*.js` preload
is gone, and the entry shrank about 15 KB (the papers). No section or paper text is in any
chunk of `dist/` (checked).

### Verified (step B)

- **Browser, the database faked with the real fixture: 36 checks** at 390 light, 320 dark
  Khmer and 1280:
  - the Study path links the 4 published biology sections and nothing else, downloading no
    section, and a guest never downloads the SDK;
  - opening a section downloads only it; reopened with downloads blocked it comes from
    Cache Storage; an unpublished one goes back to its path; a first open offline shows the
    notice and Try again recovers;
  - the exam tab downloads no paper; a paper with nothing published says coming soon;
  - the English paper's screen downloads only it, is sat end to end, and a wrong answer
    offers its own drill; the attempt stores version 1;
  - after a republish, an old attempt downloads v1 and shows v1's explanation, not the edit;
  - a section report names `#q1`; the owner's mistakes page resolves `#q2`, an old `#1-0`,
    a maths and an English paper ref, each with Edit, in one request a kind;
  - Home prefetches at most 3 items and never a paper; no sideways scroll; no page error.
- Stage 1b's 34 checks, the two editor runs (46 and 59) and the explanations run (40) still
  pass.
- **KruAI through `ssrLoadModule`, a fake `content_current`: 12 checks.** 17 decks and 7
  sections (a malformed one dropped), one request a kind and both reused; the catalog lists
  the sections; an open section's prose reaches the prompt and its quiz does not; untrusted
  and array keys give nothing; unreachable gives nothing in 9ms and the prompt still builds.
  Prompt: 18,835 characters on Home, 23,656 on `biology-3-1-1`.
- **The real `handleChat`, with the deck, section and quota requests each taking 600ms: 11
  checks.** Both content requests start together before the quota answers, and the model is
  reached at 661ms (one wait). An open section reaches the prompt; a warm instance makes no
  content request; KruAI still answers with both failing; no unhandled rejection.
- A dev server with Supabase blanked opens a quiz, a deck, a section and a paper from the
  fixture with no database request (7 checks).

## Game questions move into the database (7 Oct 2026)

The user's call, after the sections and papers. The Battle's question pools were
`src/data/game-questions.ts` (120 questions: maths, history, chemistry and biology, 30
each, 213 KB). They are now the fifth content kind, `game`, edited on Admin → Content →
**Game questions** / **សំណួរហ្គេម**, and the file is deleted.

**What is stored** (`GameQuestionBody` in `types/index.ts`): one item per SUBJECT, key
`math`, `history`…, its body a list of `{ id, q, options, correct, difficulty?,
explanation }`.
- **`q` IS ONE TEXT, IN THE SUBJECT'S LANGUAGE: Khmer, or English for the English
  subject. CONTENT IS NEVER TRANSLATED** (the user's rule, restated angrily on 7 Oct 2026).
  The first version of this move stored an `{ en, km }` pair, carrying over English
  versions an earlier session (28 Sep) had added to the code, and the editor REQUIRED an
  English text. That was wrong: `20261007000002` keeps the Khmer and drops the English,
  and nothing in the app may ask for or keep a second language of content again. The game
  PAGE's own buttons and labels still follow the app's language; its questions do not.
  `toGameQuestions()` puts the one text in both halves of `ExamQuestion.q` (shared with the
  mock exam and the placement test), so the question reads the same whatever the language.
- **`difficulty` is `easy` / `medium` / `hard` or absent**; absent is offered at every level.
  `mix` is a creator's choice, never a question's.
- **Ids are `q1…` per subject, never reused** (the stage 1 `used_ids` rule), although nothing
  downstream reads them yet: a Battle FREEZES its questions onto the competition row without
  the id (`toGameQuestions()` drops it, and `lib/competitions.ts`'s `toQuestions()` keeps only
  text, options, answer and explanation). So **an edit reaches new Battles only**, and a Battle
  already being played never changes.

**The database: `20261007000001_game_questions.sql`.** Apply AFTER `20261003000002`.
- The kind CHECKs are replaced by text, as before, now five kinds.
- `content_key_ok`, `content_item_ids`, `content_count`, `content_draft_problem` and
  `content_body_problem` are redefined with the same signatures; a pool is a list, like a
  quiz.
- `content_game_question_problem` checks one question: the level, then the quiz rules
  (`content_choice_problem`). Since `20261007000002` it requires `q` to be ONE string and
  refuses a pair.
- **An empty pool cannot be published**: said inside `content_body_problem`, so the publish
  and import functions needed no edit.
- An app that predates the migration ignores the kind in its manifest, so publishing first
  is safe.

**The checker:** `checkGame()` in `utils/content-check.ts` runs the text rules on the one
text, the choice rules, and a new `badDifficulty` code with its `issueHelp` sentence.

**The editor:** a fifth tab. `GameQuestionEditor` (`content-item-editors.tsx`) is the quiz
question's shape: ONE question field (`ChoiceFields`, unchanged), the options, the answer,
the explanation. There is no English field, and there must not be one. The level is a `SelectField` whose empty choice
means "not set". New offers each subject with no pool (`gameSlots()`), after picking the
subject, like every kind. The page explains the pool's rule above the list (`tips.gamePool`).

**The Battle create screen** (`create-form.tsx`):
- `gameSubjects(lang, manifest)` gives each subject its COUNT from the manifest, so the
  screen downloads no pool to draw its tiles;
- the CHOSEN subject's pool downloads while the student picks a level and a time
  (`useContentBody("game", …)`), and Start stays off until it is in hand, saying
  "Getting the questions…";
- a first open with no internet says so, with Try again;
- `pickQuestions(pool, difficulty)` takes the pool now instead of looking it up.

`gameQuestionsFor()` and its fallback to the mock-exam questions are gone: every subject the
fallback covered has a pool.

**Deleted:** `src/data/game-questions.ts`. `check:quiz` then checked `MOCK_QS` alone,
until both were deleted the same day; `check:content` covers the five database kinds.

**The move (done 7 Oct 2026)**: `content/game-questions.json` (4 pools, 120 questions, 0
errors, 0 warnings, and nothing the editor's Save would change) was imported by the owner with
"publish items never published"; `check:content --live` confirmed **4 of 4** exact, the
helpers refuse the publishable key, and the file was deleted. `content/fixture.json` now holds
all five kinds (39 items).

**Verified:**
- PGlite: **43 checks** (the migration twice after stages 1 to 3; keys; the real file
  publishes as version 1 and reads back identical with 30 each; guests read the manifest and
  bodies; draft vs publish; owner-only publish; used ids; 12 publish refusals; import all or
  nothing; the other four kinds still import; no client can call a helper). Stage 1's 95,
  stage 2/3's 79 and the real-fixture 5 still pass with it on top.
- Browser, the database faked: **28 editor checks** (five tabs; import checked in the browser;
  4 pools of 30; New offers physics; the question field (one, since the correction below); edit and publish version 2 with the
  level; an untouched question keeps every field; a new question takes q31; an em dash blocks
  Publish; Undo; an admin saves a draft that drops the level and has no Publish; the five tabs
  fit at 320 dark Khmer) and **15 Battle checks** (4 subjects selectable and the rest coming
  soon; only the chosen pool downloads; a Hard battle opens on a hard question; with the app in
  English the question is still the Khmer text (since the correction below); offline then Try again; no sideways scroll; no page error). The earlier
  suites (36, 34, 59, 46, 40, 14) still pass.
- The build: no game question text in any chunk; the first screen is unchanged (231 KB), since
  the questions were never on it.

### The game questions are ONE language (7 Oct 2026, the same day)

**`20261007000002_game_questions_one_language.sql`** (apply AFTER `20261007000001`; applied to the live project on 7 Oct 2026: all 4 pools at version 2, 120 one-text questions, 0 pairs, and `check:content --live` 39 of 39):
- redefines `content_game_question_problem` to require ONE text;
- republishes every pool whose current version still holds a pair, keeping only `q.km`, as
  a NEW version (version 1 stays as it was, like every published version);
- converts any saved draft the same way. Re-runnable: one-language pools are left alone.

**The app reads BOTH shapes**, so the code and the migration can land in either order:
`isBody` accepts a string or a pair, `toGameQuestions` takes the pair's Khmer, and the
editor's `toGameBody` turns a pair into its Khmer (so Restore as draft of version 1 cannot
bring the English back). `content/fixture.json` was converted the same way.

**Verified:** PGlite **14 checks** (the 4 real pools with pairs republish once as version 2
equal to the Khmer-only fixture; version 1 untouched; a draft converted with its edit kept;
re-run is a no-op; a pair and an empty text refused at publish and import; other kinds still
import), and stage 1's 95, stage 2/3's 79 and the real-fixture 5 still pass. Browser: the
editor (28) shows one question field and no English one; game creation (15) shows the Khmer
question with the app in English, against both the new data and the old two-language data.

## The old 7-step lessons are deleted (7 Oct 2026)

The user's call, once lesson sections had moved into the database. These were the six
lessons carried over from the first version of the app, in `data/lessons.ts`: Basic Limits
and Basic Probability (maths), Human Body and Human Brain (biology), and a maths and a
biology "foundation" lesson, run by the 7-step `LessonDetail` flow (intro → content →
flashcard → fun fact → did-you-know → quiz → completion) at `/lessons/:lessonId`. The
authored Study paths had already replaced them, so they were reachable only by a typed URL.

**Deleted:** `src/data/lessons.ts` (`LESSONS`, `FOUNDATION`, their own `FLASHCARDS` and
`PRACTICE`, `lessonDataFor`), `features/lessons/components/lesson-detail.tsx`,
`pages/lesson-detail.tsx`, the `Lesson` / `Flashcard` / `PracticeQuestion` types,
`lessonCountFor()`, and five translation keys only that screen used (`summary`, `funFact`,
`surpriseTip`, `didYouKnow`, `incorrect`).

What changed around them:
- **`/lessons/:lessonId` REDIRECTS to `/lessons`** (a `<Navigate replace>` in `app.tsx`), so
  a saved link lands on the Study page rather than "not found". `isFocusRoute`,
  `isStudyRoute`, `screenRefFor` (no `lessonId` any more, and the handler's `cleanScreen`
  dropped it) and `defaultMathLayout` no longer know the path.
- **The Study cards did not change.** An authored path counts its own lessons, and a
  subject with no authored path is closed: `lessonCountFor()` only ever counted subjects
  that had BOTH an authored path and old lessons, so it returned 0 for every card that
  reached it.
- **`chaptersShape()`'s fallback** (a subject with no authored path) is now placeholders
  only; it never listed an old lesson for any subject in practice, for the same reason.
- **The roadmap** asks `buildRoadmapPhases(…, hasLessons)`, and `roadmap-view.tsx` answers
  with `subjectHasSections(manifest, s)` (`utils/content-manifest.ts`): a month links to
  Study when its subject has a published lesson section, else to the exam tab with "coming
  soon". Today that is biology and maths, exactly as before.
- **KruAI's catalog** lost the old lessons, their flashcards and practice questions, and
  the `/lessons/` screen chunk. The prompt went **18,835 → 17,587** characters on Home and
  **23,656 → 22,229** on a section page (budget 24,000). (`bi()` stayed for `MOCK_QS`
  until both were deleted the same day.)
- **The 3D brain model lives on** in section `biology-3-1-1`; the `brain-model-viewer` chunk is
  still its own, reached from `section-detail.tsx`.
- **`completedSessions` and `contentLog` may still hold old ids** (`biology-brain`…) on a
  student's phone. Harmless: nothing renders them, and `subjectOfKey()` still maps them to
  their subject.
- **First screen: 237,998 → 231,255 bytes gzip**; `lessons-*.js` is gone from the preloads.

**Verified:** `tsc -b`, oxlint, `check:digits`, `check:quiz`, `check:content` and the build
clean. Browser, the database faked: 14 checks (the Study tabs open the same cards; three old
links land on the Study page; on the roadmap biology's month links to Study and physics'
to the exam tab, at 320 dark; section 3.1.1 still loads the 3D viewer; no sideways scroll;
no page error), and step B's 36 still pass. KruAI: 14 checks (no old lesson, flashcard or
practice line in the catalog; an old `lessonId` screen ref gives nothing).

## The 10 mock-exam questions and the placement test are deleted (7 Oct 2026)

The user's call ("Delete them"), after asking where the 10 mock-exam questions were and
finding they appeared nowhere. `MOCK_QS` (`data/questions.ts`) was 10 prototype
questions, 5 maths and 5 biology, with an English and a Khmer text each. Since 29 Sep no
screen showed them: the generated papers (Tab B) had been emptied, and the survey's
placement test had been removed. They were still read in three places nobody saw:

- **the placement test** at `/placement-test/:subject`, reachable only from the roadmap's
  "Pending Placement Tests" card, which only an account that booked a test before 29 Sep
  could see;
- **the old one-paper exam panel** (`generated-exam-panel.tsx`), kept unreferenced at the
  user's earlier request;
- **KruAI's catalog**, which listed them as "mock exam" items the student could not open.

**Deleted:**
- `MOCK_QS` and the `MockExamQuestion` type. `data/questions.ts` keeps `QUOTES` (Home's
  daily quote);
- `features/survey/components/placement-test-runner.tsx`, `placement-test-page.tsx`,
  `pages/placement-test.tsx` and the route. `/placement-test/math` is now "not found";
- `features/exam/components/generated-exam-panel.tsx`;
- the roadmap's pending-tests card;
- from the store: `pendingPlacementTests`, `schedulePlacementTest`,
  `resolvePlacementTest` and the `PendingPlacementTest` type. An old payload carrying the
  key is harmless: `merge()` spreads it into state where nothing reads it, and
  `partializeState` drops it on the next write (checked in the browser). No `version` bump;
- from sync: the push and pull of `pending_placement_tests`. **The table and any old rows
  stay**: nothing reads or writes them, and dropping the table would be a migration for no
  gain. `types/database.ts` and `db:check` still list it;
- from KruAI: the catalog's mock-exam lines, `bi()` and `KM_STUB_RATIO` (nothing bilingual
  is left in the catalog), the profile's `pendingPlacementTests` and its prompt line.
  `buildCatalogBlock` lost its `lang` argument. A stale client still sending the field is
  ignored;
- from the route rules: `isAssessmentRoute` is the game match alone, and `isStudyRoute` no
  longer counts the placement path;
- `scripts/check-quiz.mjs` and `npm run check:quiz`: nothing is left for it to check;
- 10 translation keys only that code used (`placementTest`, `yourScore`, `seeResult`,
  `pendingTests`, `scheduledFor`, `overdue`, `takeTestNow`, and the already-unused
  `testMeNow`, `scheduleForLater`, `confirmSchedule`).

**Kept:** `FOUNDATION_SUBJECTS` in `utils/placement.ts` (the survey and the Study page's
Foundation tab), the survey's "Not sure" note (`testComingSoon`), `ExamRunner` and the
generated-papers tab (`GENERATED_EXAM_QUESTIONS` is empty; every card is "coming soon"),
and `MockExamSubject` (`ExamQuestion.subj`). Earlier sections that describe the placement
test, `MOCK_QS`, `bi()` or `check:quiz` are history.

**Measured:** the first screen is **229,519 bytes gzip** (JS and CSS; it was 231,255 before).
KruAI's prompt with the fixture's content: **17,409** characters on Home and **21,361** on
`/sections/biology-3-1-1` (budget 24,000).

**Verified:** `tsc -b`, oxlint (the one known warning), `check:digits`, `check:content` and
the build clean; no chunk in `dist/` holds the old question text. Browser, Supabase blanked,
13 checks at 390, 320 dark and 1280: with an old dated pending test stored, the roadmap shows
no pending card and no placement link and still renders its mission; the old key is dropped
from storage; `/placement-test/math` is "not found"; a generated paper says "coming soon"
and opens no runner; Home renders; no sideways scroll; no page error. KruAI through
`ssrLoadModule`, 6 checks: no mock-exam lines, a stale `pendingPlacementTests` never
reaches the prompt, sections and decks still listed, physics still "no content", maths
still covered, the section prompt under budget.

## Hidden content is really hidden (3 Nov 2026, `20261103000008`)

Unpublishing only took an item off the manifest, and its versions stayed readable by anyone asking by
name. `content_versions` is now readable only while the item is published
(`"content_versions: read while published"`).

- **Every version of a published item stays readable**, because reopening an old attempt loads the version
  it was taken on.
- **Admin screens and the Battle checks read through security definer functions**, so they still see hidden
  versions. A Battle from a hidden pool still shares.
- **No `is_app_admin()` in the policy:** anon may not call it, so every guest's read would fail.
- **A phone keeps what it has already downloaded** (Cache Storage, `lib/content.ts`). Hiding stops new
  downloads, and cannot reach those.
- **A known wrong sentence:** hide a paper during a student's Simulation, and `simulation-sit.tsx` and
  `simulation-result.tsx` show "needs internet" for it, with Try again, because `ContentNotice` has no
  state for this. Give Up still works, and publishing it again restores it. Read in the code, not run.

**Verified:** the real policy on PGlite 0.2.17 as `anon` and `authenticated`, including the read working
before and refused after, listing everything, `content_current`, republishing, and a definer function
still reading. **Not verified: against the real database.**

## Teacher papers are papers with a second key shape (6 Nov 2026, `20261106000001`)

The Mock Exam page's second tab became teacher papers: kind `paper`, key `new-{subject}-{n}`
beside `{year}-{subject}`. Only `content_key_ok()` changed, so every paper function (count,
ids, publish checks, versions, hiding) already covers them. A teacher paper has no slot and no
New button (there can be hundreds): it arrives by Import, like every paper. The admin tab is
now called "Papers" / វិញ្ញាសារ. `check:content` now refuses a key of the wrong shape or
subject, for every kind, rather than leaving that to the import. See `docs/notes/exams.md`.

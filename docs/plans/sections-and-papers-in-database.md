# Stages 2 and 3: lesson sections and past papers move into the database

> **Status: done, in `7c4512a` (steps A and B in one commit).** Step A built (4 Oct 2026); the owner applied the
> migration and imported the 7 sections and 2 papers (7 Oct 2026, 9 of 9 exact); step B
> built (7 Oct 2026). See "Step A, as built" and "Step B, as built" at the end for what
> differs from the plan below.
> Follows stage 1 in [content-in-database.md](content-in-database.md) (complete,
> `5e95715`). The choices below are the user's, made when this plan was written.

## Context

Stage 1 is done: flashcards and practice quizzes live in the database, the team edits
them at `/admin/content`, the owner publishes, and phones download one lesson at a time
(`5e95715`). Two kinds of content are still written in code:

- **Lesson sections** (`src/data/sections.ts`, 121 KB, 7 sections). Its chunk
  `sections-*.js` (17 KB gzip) is preloaded on the first screen, because the Study path
  asks "does this section have content?" through `hasSectionContent()`.
- **Past papers** (`src/data/papers/math-2025.ts`, `english-2025.ts`, with
  `english-drills.ts`). They sit **inside the app's main bundle** (`index-*.js`), about
  19 KB gzip, because Home's study feed imports `PAST_PAPERS`.

So the same two problems as stage 1: fixing a lesson or a paper needs a code change (the
"Fixed" button on `/admin/mistakes` only records that), and every student downloads all
of it before the first screen (about 36 KB gzip together).

**Your choices (3 Oct 2026):**
- Sections: **write and fix**. The team can write a new section from empty and edit any part.
- Past papers: **fix and extend**. Every text, option, answer, explanation, word bank, gap
  and the writing task; add, remove or reorder questions inside a part. A whole new
  paper still arrives as a file I prepare from photos.
- Pictures: **pick existing files**. Posters and 3D models are chosen from files the app
  ships; the YouTube id is typed freely.

**Only the owner publishes**, as in stage 1.

## How it works for you

Same as stage 1. The content page gets two more tabs: **Lesson sections** and **Past
papers**.
- Edit, then **Save draft** (any admin).
- **Publish** (owner only). Students get it on their next app open.
- Every version is kept, and **Restore as draft** undoes a bad publish.
- A mistake report on a section or paper question gets an **Edit** button, like quiz
  reports today.

## Design

### 1. Database: one migration for both, `20261003000002_sections_and_papers.sql`

Reuse the stage 1 tables and functions (`20261003000001_content_in_database.sql`) with two
new kinds, `section` and `paper`. One migration and one import for you, not two.

- **Kinds:** drop and re-add the `kind` CHECK on `content_items`, `content_versions`
  and `content_drafts` to allow `section` and `paper`.
- **Keys** (`content_key_ok`):
  - `section`: `{subject}-n-n-n`, e.g. `biology-3-1-1`;
  - `paper`: `20yy-{subject}`, e.g. `2025-math`.
- **Bodies are OBJECTS for these two kinds**, not lists. Every place stage 1 assumed a list
  must take the kind:
  - `jsonb_array_length` in the list, get, publish and import functions;
  - `jsonb_array_elements` in `used_ids`.

  Two new helpers handle that:
  - `content_count(kind, body)`: cards, questions, or scored paper questions;
  - `content_item_ids(kind, body)`: section question ids, or paper question and gap ids.

  These functions are redefined with the same signatures, so the app's calls do not change:
  - `admin_content_list`, `admin_content_get`;
  - `content_publish_body`, `admin_publish_content`;
  - `admin_import_content`, `admin_save_content_draft`.
- **Draft check** (`content_draft_problem(kind, body)`): a list or object of the right type,
  with a size cap and unique ids, so unfinished work can be saved.
- **Publish and import check** (`content_body_problem`), dispatching to two new functions.
  - `content_section_problem`:
    - `title`;
    - four blocks (`intro`/`lesson`/`examples`/`notes`), each `{intro?, items[{label?,
      body, items?[]}], outro?}`, with at least one item somewhere;
    - `mistakes[{wrong, right}]`;
    - optional `video{poster ~ ^/sections/[a-z0-9-]+\.webp$, durationSec?, youtubeId ~ 11 chars}`;
    - optional `model3d{src ~ ^/models/[a-z0-9-]+\.glb$, credit, title?}`;
    - `quiz`/`quizHarder`: checked by the existing question check (`content_choice_problem`
      plus help), with ids `q1…` unique across BOTH lists.
  - `content_paper_problem`:
    - `minutes`, optional `points` and `note`;
    - `sections[]` with `id`, `title`, `instruction`, optional `statement`/`example`, and
      exactly one of `questions` or `gapFill`;
    - a question: `{id, q, options 2–6 distinct, correct among them, explanation,
      points?, skill?}`;
    - a gap-fill: `{title, body, wordBank (distinct), gaps[{id, number, correct in the
      bank, example?, skill?, explanation}]}`; every non-example gap's `{n}` appears in
      `body`;
    - optional `writing{title, prompt, minWords, modelEssay[], checklist[]}`;
    - optional `skills{id: help}`: every `skill` named must exist there.
- Grants, RLS and the owner rule are unchanged. Guests read published sections and papers
  exactly as they read decks.

### 2. What is stored

- **A section** is today's `SectionContent`. Each quiz question gains a stable `id`
  (`q1…`), assigned at export in today's order across `quiz` then `quizHarder`, and never
  reused (`used_ids`, as for quizzes).
- **A past paper** is today's `PastPaperContent`, with two changes:
  - **`q` becomes one string.** Both papers carry the same text in `en` and `km`. The
    loader maps it back to `{en, km}`, so the runner is untouched, and the export refuses if
    the two ever differ.
  - **It carries its own drills**: `skills`, holding only the skills its questions name.
    That is how the English paper's 8 entries from `english-drills.ts` travel with it, and
    that file is deleted. `SkillId` becomes a plain `string` (a key into the paper's own
    `skills`), so a future maths paper can carry drills too.
- **`PaperResult.version`** (optional; absent = version 1, identical to today's code).
  Reopening an older attempt loads the version that was sat, as `QuizResult` already does.
- **Mistake refs by id:**
  - `section:biology-3-1-1#q3` (was `#0-2`);
  - papers already use ids (`paper:2025-math#l1`).

  Older position refs still resolve. `REF_PATTERN` and the column CHECK already allow both.

### 3. The checks: `src/utils/content-check.ts`

Two new checks, `checkSection(body)` and `checkPaper(body)`, using the existing text rules:

- every `$…$` typeset with KaTeX;
- no Khmer inside a formula;
- no stray `$` (but `$20` money is fine);
- no Khmer numerals, no em dashes;
- `correct` among the options, no duplicate options;
- section quiz help reuses `checkQuiz`'s logic.

They also add three things:

- **a gap's answer is in the word bank**, and a gap number is missing from the passage;
- **every named skill exists**;
- **an SVG the sanitizer would change is an error.** `sanitizeSvg` must leave the maths
  paper's two graphs untouched, so anything it strips was not meant to be there.

`IssueCode` grows. Each new code gets an `issueHelp` sentence in both languages, which the
`satisfies Record<IssueCode, string>` makes a compile error to forget. `ContentIssue`
gains `at: string`, a path such as `lesson.items.2.body`, `quizHarder.q3` or
`sections.reading.gaps.r4`, so an issue in a nested object can be shown under its field and
jumped to.

`scripts/check-content.mjs` checks the new kinds too. It also fails if a poster or model
path names a file missing from `public/`. `scripts/check-quiz.mjs` drops sections and
papers (step B) and keeps `GAME_QUESTIONS`.

### 4. The editor: `/admin/content`

- **Two new tabs**:
  - "Lesson sections" / "ផ្នែកមេរៀន";
  - "Past papers" / "វិញ្ញាសារឆ្នាំចាស់", the exam tab's own name.

  The Khmer is for you to confirm.
- **Split `content-editor-view.tsx`** into a kind-agnostic SHELL and per-kind body editors.
  - The shell keeps load, save, publish, discard, unpublish, restore, versions, the
    `stale` rule, leave-warning, notices and the checks card.
  - The existing list editor (decks, quizzes) becomes one body editor, with no change in
    behaviour.
  - `tidyBody`, `sameBody` and `toBody` in `content-edit.ts` / `lib/admin-content.ts`
    learn the two object shapes.
- **Section editor** (`section-editor.tsx`), as used to write a section from empty:
  - **Title.**
  - **Video:**
    - poster picked from `SECTION_POSTERS`;
    - duration;
    - YouTube id, checked as 11 characters with a hint that it is the id, not a URL.
  - **3D model:** picked from `MODELS`, with credit and caption. The two lists are in
    `features/admin/section-media.ts`, and `check:content` keeps them equal to
    `public/sections` and `public/models`.
  - **The four blocks**, each with intro, outro and an item list (label, body, sub-points):
    add, remove and move.
  - **Mistakes:** wrong/right pairs.
  - **The two quizzes** ("step 1" / "step 2", with the teaching-order rule as an ⓘ),
    reusing `QuestionEditor` from `content-item-editors.tsx` unchanged. Section questions
    are the same `SectionQuestion` type.
  - **Preview** draws each block with the REAL renderer: `Block` and the misconception
    card move out of `features/lessons/components/section-detail.tsx` into an exported
    `section-blocks.tsx`, so the editor cannot preview something students do not see.
  - **New** offers authored section slots with nothing published (the 42 biology nodes,
    math's empty sections). A new section starts with the session's title and empty
    blocks.
- **Paper editor** (`paper-editor.tsx`), for fixing and extending:
  - **Header:** minutes, points, note.
  - **Per part:** title, instruction, statement (with live `MathText` preview), example.
    - A multiple-choice part lists its questions (prompt, options with the correct radio,
      explanation, points, skill picker) with add, remove and move. A new question id takes
      the part's own prefix plus the next number never used (`newPaperQuestionId`).
    - A gap-fill part edits title and passage, the word bank (add, remove, rename;
      renaming carries every gap's answer along), and each gap (answer picked from the
      bank, skill, explanation). Gaps are matched to the `{n}` in the passage, and a
      missing `{n}` is flagged.
  - **Writing:** prompt, minimum words, model-essay paragraphs, checklist.
  - **Skills:** each skill's help, reusing `HelpEditor`.
  - **No New button for papers.** A new paper comes as a file you import.
- **Explanations**: an ⓘ on every new field and panel, from `content-copy.ts`, in both
  languages, as on the stage 1 pages.
- Lazy and NOT in `routeModules`, as for every admin page.

### 5. Students read from the database (step B)

**`lib/content.ts` and `utils/content-manifest.ts`** cover four kinds:
- the manifest gains `section` and `paper` entries (version and count);
- `BodyOf<K>`, `useContentBody`, `useAllBodies` and the Cache Storage keys take the new kinds;
- a body is validated by kind (list or object).

**Study path** (`features/lessons/sessions.ts`, the stage 1 quiz-path pattern):
- `chaptersShape(subject)` holds the structure with a section's `href` null.
- `chaptersFor(subject, manifest)` links a section the manifest says is published.
- `hasSectionContent` is deleted.
- Callers:
  - structure only: `practice.ts`, `practice-run.tsx`, `content-slots.ts`;
  - with the manifest: `subject-path-view.tsx` (plus a `ContentNotice` while the
    manifest is first loading), `study-feed.ts`, `real-prediction.ts`.

**`/sections/:sectionId`** (`pages/section-detail.tsx`):
- loads the body with `useContentBody("section", …)`;
- shows `ContentWaitingScreen` while it loads or when offline on a first open;
- redirects only once the manifest has answered "missing";
- reports name questions by id (`sectionRef(id, question)`).

**Past papers** (`features/exam/papers.ts`):
- `PAST_PAPER_YEARS` stays in code (it is structure); `PAST_PAPERS` and `data/papers/*`
  are deleted;
- `papersForYear(year, lang, manifest)` decides which cards are ready from the manifest;
- **`/exam/subjects/:paperKey`** loads the paper body, then builds the full paper the
  detail screen, runner and results use;
- `paper-screen.tsx` stores `version` on each attempt and reopens an older attempt on its
  own version (an `OlderVersionResults` twin);
- `past-paper-results.tsx` takes drills from `content.skills` instead of importing
  `SKILLS`;
- the study feed lists papers from `manifest.paper`.

**Admin mistakes page** (`features/admin/content-ref.ts`):
- resolves section and paper refs from `useAllBodies("section")` and
  `useAllBodies("paper")`;
- every resolvable report now has **Edit**, linking to
  `/admin/content/{section|paper}/{key}?q={id}`.

**KruAI** (`server/content-source.ts`):
- `publishedDecks()` becomes `publishedContent()`, fetching decks and sections in
  parallel with the same 10-minute copy, timeout and backoff;
- it is still started the moment a question arrives (`decksPromise` becomes
  `contentPromise`);
- `chat-prompt.ts` takes a `SectionMap` argument for the catalog lines and the pinned
  section chunks, the same way it already takes `DeckMap`;
- its static import of `data/sections` goes;
- unreachable still means "no section text", never "no answer".

**Home prefetch** (`use-study-feed.ts`): also warms a top section; papers are fetched on
open, being larger.

**Deleted in step B:**
- `src/data/sections.ts` (but `SectionContent` and the other types stay in `types/`);
- `data/papers/math-2025.ts`, `english-2025.ts`, `english-drills.ts`;
- `PAST_PAPERS`.

### 6. The move, and content afterwards

**Step A:** `content:export --from-code` writes `content/sections-papers.json`.
- It covers the 7 sections and 2 papers ONLY. A file holding the 26 decks and quizzes
  too would create 26 needless drafts on import.
- Section question ids and the paper `q` strings are assigned and checked.
- After the import, plain `content:export` refreshes `content/fixture.json` (the dev
  fallback) with all four kinds.
- `--from-code` is removed in step B, since the code is gone.

`content/README.md` gains the section and paper authoring rules:
- the teaching-order split between the two quizzes;
- the doubled-backslash rule (JSON needs `\\` too);
- statements copied verbatim from the paper;
- the distractor rules already there.

**New papers** arrive as JSON under `content/new/`, checked with `check:content`, imported,
reviewed and published, then the file is deleted.

## Order of work

1. **Step A (commit 1), students unaffected:**
   - the migration;
   - the new checks;
   - the editor shell split, the section editor and the paper editor;
   - import of the new kinds;
   - `--from-code` export;
   - `types/database.ts` and `db:check` (no new tables, so it only needs the functions to
     answer).
2. **You:**
   - apply the migration;
   - Admin → Content → Import `content/sections-papers.json` with "publish items never
     published".

   I run `check:content --live` (9 of 9 exact) and refresh `fixture.json`.
3. **Step B (commit 2):** everything in section 5, the code copies deleted, and the docs:
   - AGENTS.md: new "Stage 2 and 3" section, and the "Content stays in `src/data/`" note
     now covers only legacy lessons and game questions;
   - report.md;
   - the plan file in `docs/plans/`;
   - `supabase/README.md`.

## Verification

- **The migration in PGlite**, after `20261003000001`, applied twice:
  - both new kinds' keys and shapes, at draft vs publish;
  - question ids unique across `quiz` and `quizHarder`;
  - a gap answer outside the bank refused; an unknown skill refused;
  - the poster and model patterns;
  - `content_count`, `content_item_ids` and `used_ids` on objects;
  - versions through publish, restore and unpublish;
  - import all-or-nothing;
  - guests read only published rows;
  - **decks and quizzes behave exactly as before** (stage 1's 95 checks re-run);
  - the real `sections-papers.json` publishes as version 1 and reads back identical.
- **`check:content`** passes on the export.
- **Browser**, with Supabase faked through Playwright `route`, at 390 light, 320 dark Khmer
  and 1280:
  - the Study path links only published sections, with no section body downloaded;
  - opening a section downloads only it, and it works offline afterwards;
  - section quizzes report `#q1`;
  - the exam tab's cards come from the manifest;
  - the paper screen sits a paper end to end, and drills appear on a wrong English answer;
  - an old attempt reopens on version 1 after a republish;
  - the editor: write a new section from empty, publish as owner, an em dash and a gap
    answer outside the bank block Publish, rename a bank word, restore, an admin's draft
    with no Publish;
  - mistakes-page Edit links for a section and a paper;
  - no sideways scroll, no page error.
- **KruAI** through `ssrLoadModule`:
  - the section catalog and the open section's prose come from the faked
    `content_current('section')`;
  - the slow-fetch overlap test still reaches the model after one wait;
  - an unreachable database still answers.
- **Dev without Supabase** opens a section and a paper from `fixture.json`.
- **Bundle:**
  - `sections-*.js` is gone from `index.html`'s preloads;
  - no paper text is in the entry chunk;
  - record the first-screen gzip before and after (expect about 36 KB less).
- **The usual checks:** `tsc -b`, `oxlint`, `check:digits`, `check:quiz` (game only),
  `check:content` and `build`, then `db:check` and the publishable-key refusals after you
  apply the migration.

## Not doing

- Legacy lessons (`data/lessons.ts`) and game questions (`data/game-questions.ts`, 213 KB,
  already off the first screen) stay in code. A possible stage 4.
- No picture upload: a new poster or model still ships with the app.
- No building whole new papers or new parts in the editor; those come as files.
- No real-time push: students get a fix on their next app open.

## Step A, as built (4 Oct 2026)

Built as planned, with these differences and findings:

- **No `at` field on `ContentIssue`.** A problem in a section or a paper carries `item: -1`
  and its whole path in `field` (`lesson.items.2.body`), which already says where it is.
  `locationLabel()` names a path in words; `jumpToField()` in the editor shell opens and
  scrolls to it.
- **A section's `item_count` (its questions) may be 0.** For step B: the manifest reader
  (`toManifest()`) must accept 0 for sections, where decks and quizzes need at least 1.
- **11 em dashes in the maths paper's explanations** were caught by the export's checks,
  inside `String.raw` strings the 28 Sep sweep missed, and rewritten in
  `data/papers/math-2025.ts` (`។`, `៖`, parentheses). They reach students now, through the
  code copy. The Khmer of those lines is for the user to review.
- **The export also checks that the editor would not change anything**: `tidyBody()` must
  keep every field, or the first Save would lose it. Nothing failed.
- **KaTeX's shared chunk is now `sanitize-svg-*.js`** (content-check imports the sanitizer).
  Still lazy, not preloaded.
- **The students' loader is narrowed to `LoadKind`** (deck, quiz) until step B widens it
  (it did; `LoadKind` is gone).
- **The Checks card says "Working…" until the loaded body has been checked once**: a big
  paper otherwise read "The paper: is empty" for a moment on load.
- **Verified**: 79 PGlite checks (stage 1's 95 + 5 still pass), 59 browser checks (stage 1's
  46 + 40 still pass), the student section page unchanged; `tsc -b`, oxlint,
  `check:digits`, `check:quiz`, `check:content` and the build clean.

**The owner's step (done 7 Oct 2026):** applied `20261003000002_sections_and_papers.sql`
and imported `content/sections-papers.json` with "publish items never published" (9
published). `check:content --live` said 9 of 9 exact; the admin and helper functions refuse
the publishable key; the manifest rows are right.

## Step B, as built (7 Oct 2026)

Built as planned, with these differences and findings:

- **`sectionPublished()` tests that the manifest ENTRY exists, not its count.** A section's
  count is its questions, and a section with none is still a section to read.
- **The subject path keys its lesson refs by a string** (`lessonKey()`, the first session
  id). The path is rebuilt from the manifest every render, so the old object-identity keys
  would have re-fired the landing scroll on every render.
- **A paper card comes from the manifest alone** (`pastPaperCard()`: title, blurb, count,
  version). Only the paper's own screen downloads the body; `withContent()` builds the full
  paper and `toPastPaperContent()` maps `q` back to `{ en, km }`.
- **`OlderVersionReview`** in `paper-screen.tsx` is the twin of the quiz's
  `OlderVersionResults`: an attempt with an older `version` downloads that version.
- **One more em dash**, in `past-paper-results.tsx` (the writing task's line): "…
  មិនគិតពិន្ទុក្នុងកម្មវិធី។ ពិនិត្យដោយខ្លួនឯងខាងក្រោម។". The Khmer is for the user to review.
- **KruAI**: `publishedContent()` fetches decks and sections in parallel, each with its own
  copy; a malformed section body is dropped. Papers never reached KruAI and still do not.
- **Home** also prefetches a top section; never a paper.
- **`content:export`** only downloads now (four kinds into `content/fixture.json`, 35
  items); `--from-code` and `content/sections-papers.json` are deleted.
- **Bundle:** first screen 268,400 → 237,998 bytes gzip (about 30 KB less, not the 36 KB
  expected: the paper loader and the four-kind manifest cost a little back). No section or
  paper text in `dist/`.
- **Verified:** 36 new browser checks (390 light, 320 dark Khmer, 1280) with the stage 1b
  (34), editor (46, 59) and explanations (40) runs still passing; KruAI 12 + 11 checks
  through `ssrLoadModule`; dev without Supabase opens a quiz, deck, section and paper (7);
  `tsc -b`, oxlint, `check:digits`, `check:quiz` (game only), `check:content` and the
  build clean.

> **Status: in progress.** Step 1a (tables, editor, import) BUILT 3 Oct 2026; its migration
> (20261003000001) is applied to the live project (checked with db:check). Step 1b (students read from the database)
> waits for the owner's import and the `--live` check.
>
> **Built differently from the plan:** a draft only needs unique ids, so unfinished work can be
> saved; the full shape check runs at publish and import. `admin_content_get` also returns
> `used_ids`, so a new card never takes an id an old version used. The migration is
> `20261003000001_content_in_database.sql` rather than `20261002000006`.

# Stage 1: flashcards and quizzes move into the database, edited in the admin

## Context

Today every flashcard deck and practice quiz is written in code (`src/data/practice.ts`
and `src/data/quizzes/*.ts`). Two problems follow:

- **Fixing a mistake needs a code change.** The "Fixed" button on `/admin/mistakes`
  only records that someone already fixed the question in code.
- **Every student downloads all of it before the first screen.** The built
  `index.html` preloads `practice-*.js`, which is 349 KB (87 KB compressed) of
  flashcards and quizzes, on every visit, whatever the student opens.

The goal is for flashcards and quizzes to live in the database:

- The team writes and fixes them on a new **`/admin/content`** page.
- **Only the owner presses Publish** (your decision).
- A student's phone downloads only the lesson it opens, and keeps it so it works
  offline.

**This reverses a rule in AGENTS.md** ("Content stays in `src/data/`"), for these two
kinds of content only. Lessons/sections (stage 2) and past papers (stage 3) stay in
code until their stage.

## How it works for you

1. Open a deck or quiz on `/admin/content` (or tap **Edit** on a mistake report).
2. Change it. The preview shows it the way students see it, and checks
   run as you type: broken maths, Khmer inside `$…$`, Khmer digits, em dashes, an
   answer missing from its options.
3. **Save draft.** Any admin can do this. Students still see the published version.
4. **Publish.** Owner only. The next time a student opens the app, they get the new
   version. Every published version is kept, so a bad publish can be undone by
   restoring an older one.

When I write new content, I give you a file. You press **Import** (it arrives as a
draft), check it in the preview, and Publish. That way you approve everything
before students see it.

## Design

### 1. Database: migration `20261002000006_content.sql`

| table | holds | who can read | who can write |
| --- | --- | --- | --- |
| `content_items` | one row per deck/quiz: `kind` (`deck`/`quiz`), `key` (`biology-1-1`, `math-1-1-1`), `subject`, `version` (null = not published), `item_count`, `item_ids` (card ids, decks only), `updated_at` | everyone, guests too | functions only |
| `content_versions` | every published version, never changed afterwards: `kind`, `key`, `version`, `body` jsonb, `published_at`, `published_by` | everyone, guests too | functions only |
| `content_drafts` | at most one draft per item: `body`, `base_version`, `updated_at`, `updated_by` | nobody directly | functions only |

The functions are SECURITY DEFINER, refuse a non-admin with 42501 and a `hint`, and
are granted to `authenticated` only. They follow the same pattern as steps A–C.

| function | who | does |
| --- | --- | --- |
| `admin_content_list()` | admin | every item: published version, count, whether it has a draft and who saved it |
| `admin_content_get(kind, key)` | admin | the draft and the published body |
| `admin_save_content_draft(kind, key, body, expected_updated_at)` | admin | saves the draft. Refuses with `stale` if someone saved in between, and with `shape` or `key` if the body or key is malformed |
| `admin_discard_content_draft(kind, key)` | admin | deletes the draft |
| `admin_publish_content(kind, key)` | **owner** | draft → new version (version + 1), updates `content_items`, deletes the draft. Others get `owner_only` |
| `admin_unpublish_content(kind, key)` | **owner** | sets `version` to null, so students see the item as "coming soon" again |
| `admin_restore_content_version(kind, key, version)` | admin | copies an old version into the draft. The owner then publishes it |
| `admin_import_content(items jsonb, publish bool)` | **owner** | each item becomes a draft. With `publish` true, an item that has never been published goes straight to version 1 (only used for the one-time move). It never overwrites a published version silently |
| `content_current(kind)` | everyone | the current body of every item of one kind, for the two places that need all of them at once (KruAI's server, `/practice/review`) |

The SQL checks the shape of every body:

- an array, with a size cap;
- each card has `id`, `front` and `back`;
- each question has `id`, `q`, 2–6 `options`, a `correct` that is one of them, and `explanation`;
- ids are unique;
- the key matches `^[a-z]+-\d+-\d+(-\d+)?$` and names a real subject.

The rich checks (KaTeX, Khmer rules) run in the editor and in the scripts, not in SQL.

### 2. What is stored

- **A card is `{ id, front, back }`.** Ids are kept exactly as they are today
  (`biology-1-1-3`), so every student's spaced-repetition history stays attached.
  A new card gets the next unused number, and **an id is never reused**.
- **A question is today's `SectionQuestion` plus a stable `id`** (`q1`, `q2`…),
  assigned at import in today's order. `id?: string` is added to the type.
  - A mistake report becomes `quiz:{key}#q7` instead of `#7`, so it still points
    at the right question after questions are reordered. `REF_PATTERN` already
    allows this, so no migration is needed for it.
  - Old reports that use a number still resolve by position, as they do today.
- **`QuizResult` gets an optional `version`.** Reopening an old attempt loads the
  version the student actually took, so editing a quiz never misaligns their
  history. Attempts without a version are version 1, which is identical to
  today's code content.

### 3. How a student's phone gets content: `src/lib/content.ts`

- **Manifest.** A small list of what exists: kind, key, version, count, and card
  ids for decks. It is a few KB.
  - It is fetched once per app load, after first paint, and again if the app was
    in the background for more than 30 minutes.
  - It is a **plain `fetch` with the publishable key**, like `lib/announcements.ts`,
    so guests get content and never download the Supabase SDK.
  - It is saved in `localStorage["brachnha-content"]`, so it works offline and
    appears instantly on the next visit.
- **Bodies, one lesson at a time.** A body is fetched when a deck or quiz is opened,
  by `(kind, key, version)`.
  - Versions never change, so each one is downloaded once and kept in the browser's
    **Cache Storage**. This is not the service worker, which still caches nothing
    but `offline.html`.
  - The store's `localStorage` (about 5 MB, already used for chat) stays free.
  - Anything opened once works offline.
  - When Cache Storage is unavailable (an insecure origin), bodies are kept in
    memory only.
- **Read through hooks:** `useContentManifest()` and `useContentBody(kind, key)`,
  backed by a module store and `useSyncExternalStore` (the `install-prompt.ts`
  pattern).
  - **Because the React Compiler is on, the manifest is passed as an argument** to
    every pure function that decides what exists. If a function read module state
    on its own, the compiler would memoise around it and keep showing an old answer.
- **States on screen:**
  - before the first manifest ever arrives, a quiet "Loading…" line (no grey
    skeleton bars);
  - offline with nothing cached, a line saying the first open needs internet, with
    Try again;
  - an item missing from the manifest is "coming soon", as today.
- **Prefetch:** at idle, the bodies of the top 3 items on Home's study feed, so the
  likely next tap is instant.
- **Supabase not configured** (a fork, or the `shots.mjs` harness): in development
  only, content loads from `content/fixture.json`, the export from step 1a. The
  import sits behind `import.meta.env.DEV`, so it is removed from the production
  build. I will check the built `dist/` to confirm.

### 4. Code that changes (stage 1b)

Each of these stops calling `deckFor()`/`quizFor()` and takes the manifest or the
loaded body instead:

- `features/practice/quiz-path.ts`: `quizPathFor(subject, manifest)`. A node's
  `href` comes from the manifest.
- `features/practice/practice.ts`: `practiceLessonsFor`, `readyLessonCount`,
  `readyQuizSectionCount` take the manifest.
- `features/practice/review.ts`: `cardsFor(deckKey, officialCards, studentCards, reviews)`,
  and the all-decks functions take a decks map.
- Pages and components:
  - `pages/practice-run.tsx`: redirects only once the manifest says the item is
    missing, never while it is loading;
  - `practice-subject.tsx`, `practice-review.tsx`;
  - `flashcard-runner.tsx`, `quiz-screen.tsx`;
  - `quiz-runner.tsx`, which writes refs with the question id;
  - `practice-subject-card.tsx`, `practice-lesson-list.tsx`, `quiz-path-view.tsx`.
- `features/home/study-feed.ts` + `use-study-feed.ts`: a deck's progress uses the
  manifest's card ids, so Home needs no deck bodies.
- `features/grade-prediction/real-prediction.ts` + its hook: playable sections come
  from the manifest.
- `utils/content-ref.ts`: `quizRef(key, questionId)`.
- `features/admin/content-ref.ts`: resolves quiz refs from the database.
- `src/data/practice.ts` and `src/data/quizzes/*.ts`: the content is deleted.
  Content now lives in the database.

### 5. KruAI's server

- `src/utils/chat-prompt.ts` stops importing `data/practice`.
  `buildSystemPrompt` receives the decks as an argument, so it stays pure and
  alias-free.
- A new `server/content-source.ts` fetches `content_current('deck')` with the
  publishable key and keeps it for 10 minutes per server instance.
- If that fetch fails, KruAI answers without the deck catalog and never errors.
- The rule that the client only sends a key and the server looks up the content
  itself still holds.

### 6. The editor: `/admin/content` (step 1a)

Pages and parts:

- **Lazy routes, kept out of the idle prefetch list** (`routeModules`):
  `pages/admin-content.tsx` (the list) and `pages/admin-content-edit.tsx`
  (`/admin/content/:kind/:key`).
- **A sixth card on the admin hub.** The grid is re-checked so no row holes.
- **The list:** filter by subject and by kind. Each row shows the lesson name (from
  the same curriculum lists the app renders), published version, count, a "draft"
  chip with who saved it, and **New** (pick subject → lesson → section, so a key
  can't be mistyped).
- **Deck editor:** a front/back pair per card, add, remove, move up/down, each
  with a preview rendered through `MathText`.
- **Quiz editor:** one `QuestionFields` component for scenario, question, options
  and explanation.
  - The correct answer is chosen by tapping an option, so it can never be missing
    from the options.
  - The `help` section (label, note lines, common mistake, similar exercises,
    foundation exercises) reuses `QuestionFields` for its exercises.
  - Opened with `?q=q7`, it scrolls to that question.

Checks, in a shared `src/utils/content-check.ts`:

- These are the same rules as `check:quiz` and `check:digits`: KaTeX with
  `throwOnError`, Khmer inside maths, a stray `$`, duplicate options, Khmer
  numerals, and em dashes in student text.
- **Errors block Publish.**
- **Warnings don't block.** For example, correct answers bunched on one option.

Buttons and history:

- **Save draft** (any admin), **Discard draft**, **Publish** (owner). Anyone else
  sees "Only the owner can publish".
- **History:** every version with date and who published it, plus **Restore as
  draft**.
- **Import:** pick a JSON file; it becomes drafts. The owner's import has a
  "publish now" box, used only for the one-time move.
- **Mistake reports:** each quiz card on `/admin/mistakes` gets **Edit**, which
  opens the editor at that question. Publishing a quiz with open reports offers to
  mark them Fixed in the same step. That makes the Fixed button mean "fixed here"
  rather than "fixed in code".
- Bilingual copy in `features/admin/copy.ts`, like the other admin pages.

### 7. The one-time move, and new content afterwards

- `scripts/content-export.mjs` loads today's `data/practice.ts` through Vite,
  gives every question its `q` id, runs the checks, and writes
  `content/fixture.json`. That one file is both the import file and the
  development fixture.
- `scripts/check-content.mjs` (`npm run check:content`):
  - checks any content JSON file;
  - with `--live`, downloads what is published and compares it to a file, item by
    item. This proves the import arrived exactly.
- `scripts/check-quiz.mjs` drops its practice-quiz part (sections, papers and game
  questions stay until their stages).
- **New content after stage 1:** I write it as a JSON file under `content/new/` and
  run `check:content` on it. You import and publish it, then the file is deleted,
  because the database is the only copy.

## Order of work

1. **Step 1a (one commit), students unaffected.** The migration, the editor, import
   and history, the shared checks, the export script, and the new tables in
   `types/database.ts` and `db:check`. The app still reads content from code.
2. **You:**
   - apply the migration;
   - open `/admin/content` → Import `content/fixture.json` with "publish now";
   - I run `check:content --live` to confirm every item matches exactly.
   - From here until step 1b ships, I don't change practice content in code.
3. **Step 1b (one commit):**
   - students read from the database, through the manifest, per-lesson bodies and
     the phone cache;
   - every place in section 4 switches over;
   - KruAI reads from the database;
   - question ids go into reports;
   - the code content is deleted.
4. Docs:
   - this plan is copied to `docs/plans/content-in-database.md`;
   - the AGENTS.md section, including the rule reversal;
   - a `report.md` entry;
   - `supabase/README.md`.

## Verification

- **The migration in PGlite**, run twice:
  - an admin can save but not publish;
  - the owner publishes, and the version goes up;
  - `stale`, `shape`, `key` and `owner_only` refusals;
  - unpublish and restore;
  - import never overwrites a published version;
  - guests read only `content_items` and `content_versions`, never drafts;
  - `content_current` returns current versions only;
  - grants.
- **Content checks:** every current deck and quiz passes the shared checks (the
  same 0 failures `check:quiz` gives today), and the export → import → `--live`
  comparison matches exactly.
- **Browser, with Supabase faked through Playwright `route`**, at 390 / 1280 /
  320 dark Khmer:
  - path nodes and counts come from the manifest;
  - opening a quiz downloads only that quiz;
  - a second open works with the network cut;
  - a republished fix shows after a reload;
  - an old quiz attempt reopens on its own version;
  - flashcard progress is still attached (same card ids);
  - a guest gets content without the SDK chunk;
  - the editor: an admin's draft, the owner's publish, an error blocking Publish,
    restore, import, and Edit from a mistake report;
  - no sideways scroll, no page error.
- **Real handler through `ssrLoadModule`:** KruAI builds its prompt from the faked
  deck fetch, and still answers when that fetch fails.
- **Bundle:** `index.html` no longer preloads any practice content chunk, and
  `fixture.json` is absent from `dist/`. I'll record the entry size before and after.
- **The usual checks:** `npx tsc -b`, `npx oxlint`, `npm run check:digits`,
  `npm run check:quiz`, `npm run check:content`, `npm run build`, then
  `npm run db:check` after you apply the migration.

## Later stages (not in this plan)

- **Stage 2, lessons (sections):**
  - the same tables and editor, with a block editor for introduction, lesson,
    examples, key points, mistakes and the two quizzes;
  - `data/sections.ts` (`sections-*.js`, also preloaded today) moves out.
- **Stage 3, past papers:** parts, passage and word bank, and the written part.

## Not doing

- No student-written content in the database: student flashcards stay on the phone.
- No real-time push of a fix. Students get it on their next app open.
- No "try it as a student" mode in the editor. The preview uses the same renderer,
  which is enough to catch a broken question.

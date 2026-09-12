---
name: verify-brachnha
description: Runs BrachNha's verification checklist (typecheck, lint, build, lazy-chunk checks, plus conditional mentor/Supabase/auth/UI checks based on what changed) after a code change, so nothing gets called done without the checks CLAUDE.md requires. Use after any edit to this project, before telling the user something is finished. Complements Claude Code's built-in /verify (runtime-observation philosophy) with this repo's exact commands, chunk names, and known-accepted warnings.
---

# Verify BrachNha

The single source of truth for what "done" means in this repo is CLAUDE.md's
"Verification standard" section — this skill is that checklist made
executable, so it runs the same way every time instead of depending on memory.

Work out which sections below apply by checking `git status`/`git diff` for
what actually changed, run those, and report a clear pass/fail per check —
don't silently skip a check that applies and don't run the whole UI/browser
section for a one-line copy fix.

## 1. Always run these two, for ANY change

```bash
npx tsc -b       # NOT tsc --noEmit -p tsconfig.json — this is a solution build
npx oxlint       # NOT eslint — there is no eslint config in this repo
```

Both must report zero NEW issues. This repo already carries two accepted,
documented warnings that are not regressions — don't treat these as failures:

- `src/components/ui/button.tsx` — `only-export-components` (shadcn
  `buttonVariants`, cosmetic, fast-refresh only)
- `src/data/bac2-format.ts` — ~45 `no-useless-escape` hits (a known,
  deliberately-unfixed LaTeX backslash bug — see CLAUDE.md's "Known bug, NOT
  yet fixed" section; touching that file's `BAC2_ANSWER_RULES` block is a
  product decision about the mentor's prompt, not a drive-by fix)

Anything else oxlint reports is new and must be fixed before calling the
change done.

## 2. Build, whenever the change touches anything that ships

```bash
npm run build    # tsc -b && vite build
```

Then check `dist/assets/` for the lazy-loading boundaries this app depends on
— a stray static import anywhere in the reachable graph undoes code-splitting
silently, with no type error and no lint warning:

- `math-field-panel-*.js` must exist as its own chunk (MathLive, ~800KB) —
  check after touching anything under `components/shell/` reachable from
  `ChatOverlay`
- `brain-model-viewer-*.js` must exist as its own chunk (three.js +
  react-three-fiber + drei, ~980KB) — check after touching
  `features/lessons/components/lesson-detail.tsx`,
  `brain-model-viewer.tsx`, or `features/lessons/components/section-detail.tsx`
  (the section flow reuses the same model/chunk)
- A Supabase chunk (`dist-*.js`, ~54KB gzip, containing `GoTrueClient`) must
  exist and the entry chunk's only "supabase" hit must be the inlined env
  values — check after touching `src/lib/supabase.ts`,
  `src/lib/supabase-sync.ts`, or `src/hooks/use-supabase-sync.ts`

```bash
grep -l "GoTrueClient" dist/assets/*.js   # should print exactly one chunk, not index-*.js
```

## 3. Mentor / chat changes

Anything touching `server/chat-handler.ts`, `src/utils/chat-prompt.ts`,
`server/verify-user.ts`, `server/rate-limit.ts`, or the data files that feed
`buildKnowledgeBlock` (`src/data/lessons.ts`, `src/data/sections.ts`,
`src/data/practice.ts`, `src/data/questions.ts`) needs a live check — neither
`tsc` nor `oxlint` can see a prompt regression or a broken auth gate:

```bash
# With dev server running (npm run dev), unauthenticated must be refused:
curl -i -X POST localhost:5173/api/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","text":"hi"}],"lang":"en"}'   # expect 401
```

If the change is to prompt content/knowledge rather than the auth gate itself,
also sign in (or use a dev bypass if one exists) and ask a question that
exercises the changed content, confirming the reply reflects it and that
`PROMPT_BUDGET_CHARS` (24,000) doesn't fire in the console warning.

## 4. Supabase changes

Anything touching `supabase/migrations/*.sql`, `src/types/database.ts`,
`src/lib/supabase-sync.ts`, or `src/hooks/use-supabase-sync.ts`:

```bash
npm run db:check    # env -> reachability -> anonymous-signins-off -> all 8 tables
```

Re-verify the two invariants CLAUDE.md calls out after any store-shape change:
every key in `partializeState` (`src/lib/store.ts`) appears in
`syncRelevantChange` (`use-supabase-sync.ts`), and every column in the SQL
appears in the matching `Row` type in `database.ts`.

## 5. Auth changes

Anything touching `src/hooks/use-auth.ts`, `src/lib/auth.ts`,
`server/verify-user.ts`, or `AppShell`'s gate chain needs the browser checks
listed in CLAUDE.md's auth section — typecheck/lint cannot see a swallowed
OAuth callback, a guest reaching the mentor, or the React Compiler crash
pattern that only fires for a null `authUser`. At minimum, in a real browser:
a fresh profile shows the entry screen and downloads NO Supabase chunk;
"Continue as Guest" lands on Home and survives a reload; the chat FAB raises
the auth prompt and fires no `/api/chat` request; a typed `/roadmap` shows the
locked panel with navigation still on screen.

## 6. UI / responsive / layout changes

For anything touching layout, a new screen, or a component rendered inside
`FocusLayout` — drive it with a real browser via `playwright-core` rather than
trusting the diff:

**Never touch the user's own dev server.** Their `npm run dev` may already be
running (commonly on port 5173 — see the project's own auto-memory note on
this). Start your own instance; Vite will pick the next free port (5174+)
automatically, which is expected, not an error. When you're done, stop only
the server you started — find ITS pid by port and kill that pid specifically,
never a blanket process kill:

```bash
# Blank the Supabase vars so the auth gate doesn't block a scripted/seeded
# profile, and so nothing writes real rows to Supabase — see CLAUDE.md's
# "hasFullAccess is true when Supabase is UNCONFIGURED" note.
VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npm run dev
```

For a broad layout change, use the project's own harness rather than one-off
screenshots:

```bash
node scripts/shots.mjs --url http://localhost:<port> --only <route-name>
```

It walks 9 widths (320 to 1920) and asserts nothing overflows sideways —
treat a HARD failure (page scrolls sideways, or something juts past the
viewport with no scrollable ancestor) as a real bug; a SOFT hit is worth a
look but not automatically a failure (deliberate full-bleed elements trip it
correctly, e.g. `AiInsights`'s carousel).

For a narrower, one-off interaction (a new toggle, a new modal, a jump list —
anything `scripts/shots.mjs`'s fixed route list doesn't already cover), write
a small throwaway Playwright script instead: seed `localStorage["brachnha"]`
with the same shape `scripts/shots.mjs` uses (mirrors `partializeState`),
drive the interaction, screenshot before/after, and check the console for
errors. Delete the throwaway script when done — it's a one-time check, not
part of the repo.

When you're finished, clean up: stop the dev server you started (by its own
pid, on its own port), and remove any temporary test scripts you wrote.

## Reporting

Summarize per section: which ran, pass/fail, and any NEW warning or error
found (quote it). Don't report the two pre-accepted warnings from Section 1 as
findings. If a section didn't apply (e.g. no Supabase files touched), say so
in one line rather than omitting it silently — that's what makes the checklist
trustworthy to skim.

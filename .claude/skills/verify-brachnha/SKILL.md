---
name: verify-brachnha
description: Runs BrachNha's verification checklist (typecheck, lint, digit and content checks, build, lazy-chunk checks, plus conditional mentor/Supabase/auth/UI checks based on what changed) after a code change, so nothing gets called done without the checks CLAUDE.md requires. Use after any edit to this project, before telling the user something is finished. Complements Claude Code's built-in /verify (runtime-observation philosophy) with this repo's exact commands, chunk names, and known-accepted warnings.
---

# Verify BrachNha

The single source of truth for what "done" means in this repo is the
"Verification" section of AGENTS.md, with the full standard in
`docs/notes/environment-and-verification.md` — this skill is that checklist made
executable, so it runs the same way every time instead of depending on memory.

Work out which sections below apply by checking `git status`/`git diff` for
what actually changed, run those, and report a clear pass/fail per check —
don't silently skip a check that applies and don't run the whole UI/browser
section for a one-line copy fix.

## 1. Always run these four, for ANY change

```bash
npx tsc -b            # NOT tsc --noEmit -p tsconfig.json — this is a solution build
npx oxlint            # NOT eslint — there is no eslint config in this repo
npm run check:digits  # no Khmer numerals in src/ or index.html
npm run check:content # content files under content/
npm test              # database rules on a real engine (tests/db/), about 10 seconds
```

All four must report zero NEW issues. These warnings are known and are not
regressions — don't treat them as failures:

- `src/components/ui/button.tsx` — `only-export-components` (shadcn
  `buttonVariants`, cosmetic, fast-refresh only). It is the only warning oxlint
  should report
- `check:content` — 7 "dash between words" warnings in `content/fixture.json`.
  These are real content waiting to be fixed on Admin → Content, not in code.
  They are warnings on purpose, so they never block; any ERROR from it is a failure

Anything else these report is new and must be fixed before calling the change
done.

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
  `brain-model-viewer.tsx` or `features/lessons/components/section-detail.tsx`
- `invite-qr-*.js` must exist as its own chunk (the QR encoder) — check after
  touching `components/invite-link-panel.tsx` or `components/invite-qr.tsx`
- The Supabase SDK (`dist-*.js`, ~54KB gzip, containing `GoTrueClient`) must be
  its own chunk — check after touching `src/lib/supabase.ts`,
  `src/lib/supabase-sync.ts`, or `src/hooks/use-supabase-sync.ts`
- KaTeX must stay lazy — check after touching `math-text.tsx`, `math-render.ts` or
  `content-check.ts`. Its chunk has been renamed three times (`sanitize-svg-*.js`
  today), so check by content, not by name
- FSRS must stay lazy — check after touching `utils/fsrs.ts`,
  `utils/spaced-repetition.ts` or `lib/store.ts`

```bash
grep -l "GoTrueClient" dist/assets/*.js      # exactly one chunk, the SDK
grep -l "renderToString" dist/assets/*.js    # KaTeX and the chunks that import it
grep -l "request_retention" dist/assets/*.js # exactly one chunk, FSRS
grep -o 'assets/[^"]*\.js' dist/index.html   # what the first screen downloads
```

None of the chunks those greps list may be `index-*.js`, or appear in what the
first screen downloads (the last command).

## 3. Mentor / chat changes

Anything touching `server/chat-handler.ts`, `src/utils/chat-prompt.ts`,
`server/verify-user.ts`, `server/rate-limit.ts`, `server/kruai-quota.ts`,
`server/content-source.ts` (the published decks and sections, read from the
database), or the prompt's own data (`src/data/bac2-format.ts`,
`src/data/kruai-phrases.ts`) needs a live check — neither `tsc` nor `oxlint` can
see a prompt regression or a broken auth gate:

```bash
# With a dev server running WITH the Supabase vars set, unauthenticated must be
# refused. With them blanked, dev warns and answers instead, so a 401 proves
# nothing there.
curl -i -X POST localhost:5173/api/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","text":"hi"}],"lang":"en"}'   # expect 401
```

If the change is to prompt content rather than the auth gate itself, also ask a
question that exercises the changed content, confirming the reply reflects it and
that `PROMPT_BUDGET_CHARS` (24,000) doesn't fire in the console warning. A real
sign-in can't be automated: load the real `handleChat` through Vite's
`ssrLoadModule` with Supabase unset, the pattern in `docs/notes/kruai.md`.

## 4. Supabase changes

Anything touching `supabase/migrations/*.sql`, `src/types/database.ts`,
`src/lib/supabase-sync.ts`, or `src/hooks/use-supabase-sync.ts`:

```bash
npm run db:check    # env -> reachability -> auth configuration -> every table
```

`db:check` cannot see functions or policies. For those, probe with the publishable
key: `POST /rest/v1/rpc/<name>` answers `PGRST202` while a function is missing and a
permission error once it exists (see `docs/notes/environment-and-verification.md`).

Re-verify the two invariants AGENTS.md calls out after any store-shape change:
every key in `partializeState` (`src/lib/store.ts`) appears in
`syncRelevantChange` (`use-supabase-sync.ts`), except the fields documented as synced
elsewhere, and every column in the SQL appears in the matching `Row` type in
`database.ts`.

## 5. Auth changes

Anything touching `src/hooks/use-auth.ts`, `src/lib/auth.ts`,
`server/verify-user.ts`, or `AppShell`'s gate chain needs the browser checks
listed in `docs/notes/environment-and-verification.md` and
`docs/notes/auth.md` — typecheck/lint cannot see a swallowed
OAuth callback, a guest reaching the mentor, or the React Compiler crash
pattern that only fires for a null `authUser`. At minimum, in a real browser:
a fresh profile shows the intro, then Home as a guest, and downloads NO Supabase
SDK chunk; a reload stays on Home; the chat FAB raises the login prompt and fires
no `/api/chat` request; a typed `/roadmap` shows the locked panel with navigation
still on screen; and loading with `?code=x` in the URL DOES pull the SDK (the
trap that would swallow every sign-in).

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
# profile, and so nothing writes real rows to Supabase — see docs/notes/auth.md's
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
look but not automatically a failure (a deliberate overhang inside a clipped box
trips it correctly, e.g. the watermark glyph on the `exam` cards).

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
found (quote it). Don't report the known warnings from Section 1 as findings. If a section didn't apply (e.g. no Supabase files touched), say so
in one line rather than omitting it silently — that's what makes the checklist
trustworthy to skim.

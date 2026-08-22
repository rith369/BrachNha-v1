# BrachNha v2

AI-powered Bac II exam prep for Cambodian Grade 12 students.
**Vite 8 · React 19 (React Compiler) · TypeScript · Tailwind v4 · Oxlint**

This is the `brachnha-next` app moved onto the Vite toolchain. Every screen,
component, data file and utility came across unchanged; what changed is the
framework around them.

## Running it

```bash
npm install
cp .env.example .env           # then paste your Gemini key after the `=`
npm run dev                    # http://localhost:5173
```

`.env` and `.env.local` both work and both are git-ignored. Restart the dev
server after adding the key — it is read once, at config time.

| script            | what it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Vite dev server **+ the /api/chat endpoint**    |
| `npm run build`   | `tsc -b` then a production build into `dist/`   |
| `npm run preview` | serves `dist/` (static only — no chat backend)  |
| `npm run lint`    | Oxlint                                          |

## What moved, and how

| Next.js                              | here                                        |
| ------------------------------------ | ------------------------------------------- |
| `src/app/**/page.tsx` (file routing)  | `src/pages/*` + a route table in `src/app.tsx` |
| `src/app/layout.tsx`                  | `index.html` + `ShellLayout` in `src/app.tsx`  |
| `next/font/google`                    | a Google Fonts `<link>`; the same four CSS variables are defined in `src/styles/globals.css` |
| `next/link`                           | `<Link to>` from `react-router`              |
| `usePathname()` / `useRouter()`       | `useLocation()` / `useNavigate()`            |
| `next/dynamic` (chat overlay)         | `React.lazy` + `<Suspense>`                  |
| `params: Promise<{…}>` on a page      | `useParams()`                                |
| `@tailwindcss/postcss`                | `@tailwindcss/vite`                          |
| `src/app/api/chat/route.ts`           | `server/chat-handler.ts`, mounted by `server/vite-chat-plugin.ts` |

URL paths are unchanged, so `src/lib/nav-items.ts` and every link still point
where they did. `'use client'` directives are gone — everything is a client
component now. A `/*` catch-all route renders `src/pages/not-found.tsx`, which
Next used to provide.

## The AI Mentor endpoint

`server/chat-handler.ts` is a plain `Request -> Promise<Response>` function with
no framework in it. `server/vite-chat-plugin.ts` mounts it at `POST /api/chat`
on Vite's dev server, so `GEMINI_API_KEY` is read on the server and never enters
the browser bundle — the same arrangement the Next route had.

In production the same function is served by `api/chat.ts` on Vercel — see
below. `npm run preview` is the one mode with no backend: it serves the static
`dist/` only, so the mentor shows its "temporarily unavailable" message there.

Without a key the chat degrades to a friendly notice rather than crashing, so a
fresh clone still runs end to end.

## Deploying to Vercel

`vercel.json` is committed, so an import of this repo needs no setup beyond one
environment variable:

1. Import the repo at vercel.com. The Vite preset and `dist/` output are already
   declared, so leave the build settings alone.
2. **Project → Settings → Environment Variables → add `GEMINI_API_KEY`.**
   `.env` files are not uploaded, so without this the mentor deploys showing its
   "unavailable" notice. No `VITE_` prefix — that would put your key in the
   browser bundle.
3. Deploy.

What `vercel.json` does:

- **`rewrites`** send every non-`/api/` path to `index.html`. Without it a
  refresh on `/lessons/math-limits` would 404 — the router lives in the browser,
  and Vercel has no such file on disk.
- **`functions`** raises `api/chat.ts` to a 60s `maxDuration`. The mentor's
  reply streams, and the 10s default would cut long answers off mid-sentence.

`api/chat.ts` is a one-line wrapper around the same `handleChat` that dev uses,
so there is one copy of the logic and the endpoint behaves identically in both.

## Layout

```
index.html            page shell, fonts, favicon  (was app/layout.tsx)
api/                  Vercel serverless entry points (production /api/chat)
server/               the chat endpoint + the Vite plugin that serves it in dev
src/app.tsx           the route table              (was the app/ directory)
src/pages/            one file per route
src/components/       shell/ (chrome) and ui/ (primitives)
src/features/         one folder per feature, each owning its components
src/data/             lessons, questions, translations, Bac II exam format
src/lib/              stateful modules (the Zustand store, nav items)
src/utils/            pure functions only
src/styles/           globals.css — Tailwind theme, brand tokens, keyframes
```

# BrachNha v2

AI-powered Bac II exam prep for Cambodian Grade 12 students.
**Vite 8 · React 19 (React Compiler) · TypeScript · Tailwind v4 · Oxlint**

This is the `brachnha-next` app moved onto the Vite toolchain. Every screen,
component, data file and utility came across unchanged; what changed is the
framework around them.

## Running it

```bash
npm install
cp .env.example .env.local     # then paste your Gemini key into it
npm run dev                    # http://localhost:5173
```

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

**Vite's dev server is the only thing serving it.** `vite build` produces a
static `dist/`, which has no backend, so `npm run preview` and any static deploy
will show the mentor's built-in "temporarily unavailable" message. To ship the
chat, drop `handleChat` into a Vercel/Netlify function, a Cloudflare Worker or a
small Express app — it only speaks web `Request`/`Response`, which all of those
provide.

Without a key the chat degrades to a friendly notice rather than crashing, so a
fresh clone still runs end to end.

## Layout

```
index.html            page shell, fonts, favicon  (was app/layout.tsx)
server/               the chat endpoint + the Vite plugin that serves it
src/app.tsx           the route table              (was the app/ directory)
src/pages/            one file per route
src/components/       shell/ (chrome) and ui/ (primitives)
src/features/         one folder per feature, each owning its components
src/data/             lessons, questions, translations, Bac II exam format
src/lib/              stateful modules (the Zustand store, nav items)
src/utils/            pure functions only
src/styles/           globals.css — Tailwind theme, brand tokens, keyframes
```

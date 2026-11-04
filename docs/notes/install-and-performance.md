# Installable app and performance

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Installable app: "add to home screen" and the two pop-ups

BrachNha is an installable web app (PWA). None of this touches Google sign-in:
the OAuth consent screen's brand review covers what is uploaded to Google Cloud
Console, and a manifest is just a file on our own site. There is no store
review unless the app is ever wrapped for the Play Store.

| file | role |
| --- | --- |
| `public/manifest.webmanifest` | name, colours, icons; what makes the site installable |
| `public/icons/*` | 192/512 `any`, 512 `maskable`, 180 `apple-touch-icon`, rendered by `scripts/app-icons.mjs` |
| `public/sw.js` | the service worker browsers require before offering install |
| `public/offline.html` | what an installed app shows when opened with no signal |
| `src/lib/install-prompt.ts` | catches the install event and decides when the pop-up may show |
| `features/install/components/install-prompt.tsx` | the pop-up; mounted in `AppShell` |

**THE SERVICE WORKER CACHES NOTHING BUT `offline.html`, on purpose.** Every JS,
CSS, `/api/chat` and Supabase request passes through untouched: the handler
returns without `respondWith` for anything that is not a page navigation.
Caching the app shell would serve yesterday's build after a deploy, and this
app has no reason to take on that class of bug. Navigations are network-first
with navigation preload (so the worker adds no load time) and fall back to the
offline page only when the fetch throws. An OAuth callback is a navigation and
goes to the network like any other. Bump `CACHE` when `offline.html` changes.
The worker is registered in PRODUCTION ONLY (`registerServiceWorker()`, called
from `main.tsx` on `load`), so `vite dev` never has one in front of it. Test
install with `npm run build && npx vite preview`.

**What a page can and cannot do.** On Android Chromium we keep
`beforeinstallprompt` and call `.prompt()` from our own button, and the browser
shows its real dialog, but only on a tap. There is no way to install
automatically. iOS has no API at all, so the pop-up shows the two manual steps,
with Apple's menu names kept in English because iOS has no Khmer UI and that is
what the student actually sees. In-app browsers (`isInAppBrowser()`) and an
already-installed app (`isInstalledApp()`, now exported from
`utils/in-app-browser.ts`) get nothing.

**Two moments, both requested by the user:**

- **`"open"`**: 1.5s after the app opens (`OPEN_DELAY_MS`). Once per page load.
  "Not now"/"Got it" snoozes it for `OPEN_SNOOZE_DAYS` (3) so a student is not
  greeted by the same pop-up on every visit.
- **`"lesson"`**: after finishing a lesson or a section. `markLessonFinished()`
  is called beside `completeSession` in `section-detail.tsx` (and in the old
  `lesson-detail.tsx` until it was deleted); practice quizzes are deliberately left out. Once per
  device, ever. It outranks the open pop-up, and closing either one consumes the
  other for that page load, so two never arrive back to back.

**It never interrupts a task.** `AppShell` passes `suppressed = hideChrome ||
chatOpen || pledgeOpen || authPrompt`, and `hideChrome` already covers lessons,
exams and the roadmap lock. A suppressed pop-up is HELD, not dropped: the
lesson one waits through the completion screen (which is focus mode) and
appears once the student leaves it. It is mounted only in the ordinary-app
branch of the gate, so the entry, login and survey screens never show it.

**The state is a MODULE, not store fields.** `beforeinstallprompt` can fire
before React mounts, so the listener has to exist from the moment the entry
chunk evaluates, which is why `main.tsx` imports the module. And "snoozed" and
"lesson pop-up seen" are device facts, not account data: as store fields they
would sync to Supabase and lengthen the `partializeState` ↔
`syncRelevantChange` list for nothing. They live in
`localStorage["brachnha-install"]`, with every access wrapped. The component
reads the module through `useSyncExternalStore`, whose snapshot is rebuilt only
in `emit()`; returning a fresh object on every read would loop forever.

**The icons remove the artwork's own tile.** The master SVG is an app-icon tile
with rounded corners and a grey shadow baked in. Launchers round icons
themselves, so shipping it would draw a tile inside a tile.
`scripts/app-icons.mjs` whitens every low-chroma pixel (the drawing is all
saturated colour and the tile edge is grey), and shrinks the maskable icon to
0.8 so it survives any launcher mask. Re-run it if the artwork changes.
**It also writes `public/favicon.ico`** (since 27 Oct 2026; it was the old icon
before): 16, 32 and 48px PNGs packed into one .ico by hand, cropped tighter
(`FAVICON_CROP` 0.78) so the drawing fills a 16px tab icon, 5.5KB against the
old 26KB. Re-running it left the four PNGs byte-identical.

**Verified** against the production build in real Chrome. The manifest reports
no errors, and the only installability error was `in-incognito`, which comes
from the automation context. The offline page is served for a navigation with
the network off. A synthetic `beforeinstallprompt` shows the open pop-up after
the delay, Install calls `.prompt()`, and the snooze holds across a reload. An
iPhone UA shows the steps at 320px light and 390px dark with no sideways
scroll. A Telegram-shaped webview UA shows nothing. The lesson pop-up is held
inside `/sections/...` and appears once, after leaving. **Not verified: a real
install on a real phone.** That needs the deployed site, because the install
event only fires over https.

## Performance — the four rules, and why each one exists

The app was slow, and the reported symptom was **navigation**, not first load.
That distinction is what makes this section worth reading before "optimising"
anything: the biggest *bytes* problem and the biggest *felt* problem were
different problems, and fixing only the first would not have helped.

Measured first-paint cost went **487KB → 183KB gzipped**. But the navigation lag
came almost entirely from per-frame and per-mount work, not from bytes.

**1. A route is a fresh MOUNT. Anything that animates on mount replays forever.**
Recharts animates on mount by default, for 1500ms. Progress mounts two charts
and Grade Prediction one, so every visit redrew the page and then spent a second
and a half sweeping lines in. All three now pass `isAnimationActive={false}`.
The data is fixed demo data that never transitions, so nothing was being
communicated. **If a chart ever gets live data, turn animation back on for the
UPDATE, not the mount.**

**2. Animate `transform` and `opacity`. Nothing else.** `fabPulse` used to
animate `box-shadow`, which is a paint property and cannot run on the
compositor — every frame forced a real repaint, forever, on an element mounted
on every screen. It is now split: the element animates `transform`, and a
`::after` layer carries the glow and animates `opacity` (`fabGlow`). Both
compositor-only. See the long comment in `globals.css`; don't fold the two
keyframes back together.

Consumers must be **positioned** for the `::after` to anchor. The FAB already is
(`absolute`); the Roadmap node carries `relative` for exactly this and nothing
else. `.animate-fab-pulse` sets `isolation: isolate` so the `z-index: -1` glow
sits behind that element's own background instead of escaping behind an
ancestor's.

**Count the animating elements, not just the animation.** The Roadmap put the
pulse on *every* phase node, and it draws one per
month until the exam — about twelve at once, on the screen a student lands on
straight out of the survey. Only `isFirst`/`isLast` pulse now. The middle nodes
never set `--glow-color` either, so they had been borrowing the FAB's purple by
accident.

A `prefers-reduced-motion` block turns both loops off entirely.

**3. One scroll container per screen.** `AppShell`'s children wrapper is
`overflow-hidden`, NOT `overflow-y-auto`. Every page already owns its scroller —
the ones rendering `BottomNav` must, since that pattern is `flex h-full
flex-col` + `min-h-0 flex-1 overflow-y-auto` + `<BottomNav />`, and the focus
routes get theirs from `FocusLayout`. A scroller at both levels meant two nested
ones on every screen, so every touch drag cost a scroll-chaining resolution
before anything moved. `min-h-0 flex-1` stays on that wrapper — it is what gives
the pages' `h-full` a definite height to resolve against. `not-found.tsx` has no
scroller and needs none.

**4. `backdrop-filter` is not free, and it re-runs while content moves.**
`BottomNav` and the Leaderboard's sticky card are opaque (`bg-surface`,
`bg-elevated`) rather than translucent-plus-blur. Both sat over scrolling
content, which is the worst case, and `BottomNav` is `lg:hidden` — so the blur
only ever ran on the phones least able to afford it. Don't reintroduce it on
anything that scrolls behind.

### Code splitting — and why the prefetch is not optional

`src/app.tsx` holds every split route in ONE `routeModules` map; `lazy()` and
the idle prefetch both read from it, so they cannot drift. Adding a route there
splits and prefetches it in the same edit. Import specifiers must stay literal
for the bundler to see them — that is what the arrow functions are for.

**Home and NotFound stay eager.** Home is the landing route, so splitting it
only adds a round trip in front of first paint; NotFound imports nothing.

**`usePrefetchRoutes` is load-bearing.** Splitting alone makes the first tap on
each tab wait on a network round trip — i.e. it makes the actual complaint
*worse*. Warming the chunks on `requestIdleCallback` after first paint is what
buys the smaller entry chunk without paying for it at the moment of navigation.
Rejections are swallowed on purpose: it is a speculative fetch, and going
offline between load and tap should fall through to the normal Suspense path,
not throw now.

Recharts lands in its own shared chunk (`LineChart-*.js`, ~103KB gzip) used only
by Progress and Grade Prediction. **Check after any build that
`math-field-panel-*.js` is still its own chunk** — that lazy boundary is
described in the mentor section and a stray static import undoes it silently.

`<Suspense fallback={null}>`, matching how `AppShell` mounts `ChatOverlay`: the
prefetch means it almost never renders, and a spinner that flashes for a frame
reads worse than a blank one.

### A tab open across a deploy reloads itself (25 Oct 2026)

A deploy renames every hashed chunk and the old names stop being served, so a
student who opened the app before it and then taps a screen not yet loaded got
"Failed to fetch dynamically imported module" on the error boundary's crash
screen. The same happens on `vite dev` when the server restarts under a sleeping
tab (that is how the user hit it). `lib/stale-build.ts` reloads the page ONCE
instead, so they land on the new build:

- **Three callers.** `installStaleBuildReload()` (from `main.tsx`) listens for
  `vite:preloadError`, which Vite fires for EVERY dynamic import in a build
  (React.lazy or not, the Supabase SDK too), WITHOUT `preventDefault`, so the
  import still rejects normally rather than handing `lazy()` an undefined module.
  `ErrorBoundary` catches the same failure in dev, where there is no preload
  helper: `getDerivedStateFromError` sets `staleChunk` so the first paint is a
  blank page, not the crash screen, and `componentDidCatch` reloads.
  `reportError` stays silent while that reload is under way.
- **Two guards, because it must never loop.** Offline: no reload (the network is
  the problem, and a reload only swaps in `offline.html`). And at most once per
  30s, stamped in sessionStorage: a deploy that is really broken fails again
  after the reload and the ordinary error screen shows. No storage, no reload.
- **Side effect worth knowing:** the idle prefetch (`usePrefetchRoutes`) goes
  through the same preload helper, so a page loaded just before a deploy can
  reload itself at idle before the student taps anything. Intended.

Verified in Chrome by making a chunk 404 (7 checks): missing once → one reload
and the page opens with no error screen, in the build and on the dev server;
missing always → exactly one reload, then the error screen, no loop.

## Security headers (3 Nov 2026)

`vercel.json` sends these on every response. `npm run dev` does not, so **a CSP problem only shows in
production**. Test with the production build served with these headers, not the dev server.

- **Content-Security-Policy**, the important one. Sign-in tokens live in localStorage, so a script-
  injection bug would otherwise be a full account takeover. It is a safety net: no such bug is known.
- **X-Frame-Options `DENY` and `frame-ancestors 'none'`**, so another site cannot embed the app and
  trick a student into tapping it.
- **X-Content-Type-Options, Referrer-Policy, Permissions-Policy** (no microphone, location, payment or
  USB). Camera stays allowed, for photos. The Referrer-Policy is `strict-origin-when-cross-origin` and
  not stricter, because YouTube's player refuses to play with no referrer at all.

**The guest list, and why each is there:**

| directive | allows | for |
| --- | --- | --- |
| `script-src` | self, one hash, `'wasm-unsafe-eval'` | the bundle; the theme guard in `index.html`; the 3D loader's WebAssembly |
| `style-src` | self, `'unsafe-inline'`, Google Fonts | KaTeX, Framer Motion and React style props set inline styles. It cannot run code |
| `font-src` | self, `data:`, `fonts.gstatic.com` | KaTeX and MathLive are bundled |
| `img-src` | self, `data:`, `blob:`, `*.supabase.co`, `*.googleusercontent.com` | chat thumbnails, photos before upload, stored photos, Google profile photos |
| `connect-src` | self, `data:`, `blob:`, `*.supabase.co` | a wildcard so no project address sits in a tracked file. Realtime is unused, so no `wss:` |
| `frame-src` | `www.youtube-nocookie.com` | the video facade |
| `worker-src` | self, `blob:` | the 3D loader and the Supabase SDK |

- **A NEW OUTSIDE HOST MUST BE ADDED HERE, or it silently fails for students.**
- **`'wasm-unsafe-eval'` allows compiling WebAssembly and nothing else**: `eval` stays blocked, and
  the test checks that. drei's `useGLTF` starts a meshopt decoder even though `brain.glb` is not
  compressed, and without this the model's page threw an error. Found by the test.
- **The hash in `script-src` is of the inline script in `index.html`.** Changing one character would
  make the browser refuse it, and the only symptom would be a dark-mode flash. So `scripts/check-csp.mjs`
  runs at the end of `npm run build` and fails the build, printing the new hash to paste.
- **Vercel's preview toolbar is blocked on preview deployments.** Harmless.

**Verified:** the production build served with the real headers, in real Chrome: 77 checks. 29 routes in
both themes (390 light, 1280 dark), plus what loads only when used: Google Fonts, KaTeX, MathLive, a
photo, a Google profile photo, the 3D viewer, the real YouTube player, Recharts, the service worker and
the theme guard. An injected inline script, an outside script, an event handler, `eval`, sending data
to another site and framing were all blocked. The only blocks left were those attacks. **Not verified:
real Google sign-in and a real phone**, which need the deployed site.

## The cheap-phone audit, and what it changed (4 Nov 2026)

Chrome slowed to a cheap phone (`Emulation.setCPUThrottlingRate` 6, which measured 8x on the audit machine), on
"ordinary 4G" (1.6 Mbps, 150 ms) and "poor signal" (400 kbps, 400 ms), production build, brotli, real Google
Fonts. An estimate: **no real phone has been measured.** Screens stayed fast once open, with a tab change at
0.1 to 0.3 s and answering a quiz question at about 0.3 s.

| | ordinary 4G | poor signal |
| --- | --- | --- |
| first visit, all downloads finished | 7.2 s, 847 KB | 22.1 s, 847 KB |
| coming back later | 0.9 s, 17 KB | not measured |
| something on screen, before | about 2.9 s | about 7.2 s |
| **something on screen, now** | **about 1.1 s** | **about 3.2 s** |
| real text on Home, old against new, 3 runs each | 3.8 s, 3.9 s | 8.1 s, 8.0 s |

"Coming back" assumes Vercel lets browsers keep `/assets/` files, which the audit's own server did. Not confirmed
on the live site.

- **The logo sits in `#root` in `index.html`**, needing no JavaScript, and React replaces it on first render. It
  costs nothing: real text arrives when it did, within run-to-run noise. It uses the same file the app does.
- **`RouteWait` (`app.tsx`) is the Suspense fallback for routes**, which was `null`. A link straight to a lesson
  stood empty for seconds. A 400ms CSS delay keeps it from flashing when the prefetch has already won.
  **It does not shorten the wait:** real text in a formula lesson still arrives at about 5.7 s on ordinary 4G.
- **The prefetch stays, and it is a known cost.** About 550 KB of a first visit's 847 KB is other screens,
  bought so tabs open instantly. Paid once. Skipping it in data-saver mode was suggested, and not decided.
- **Still open from the audit:** small Khmer text (314 pieces at 8 to 10px across 19 screens), 15 of 285 buttons
  under 24px, no `<main>` on any screen, and no `<h1>` on 11 of them.

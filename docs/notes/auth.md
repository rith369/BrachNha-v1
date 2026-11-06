# Auth: Google sign-in and guests

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## Auth: Google sign-in, guest mode, and what each one may touch

Real login landed. The section this replaces described three seams "for the
login that is coming"; all three were used, and the design they anticipated is
now built. The anonymous-identity section above records what was removed.

### The state model — guest is the default, not a choice

**THE SUPABASE SESSION IS THE ONLY PROOF OF AUTHENTICATION.** Everything else is
routing.

| | `authStatus` | `authUser` | `isGuest` |
| --- | --- | --- | --- |
| Loading | `"loading"` | `null` | `false` |
| Authenticated | `"ready"` | the flattened session | `false` |
| Guest | `"ready"` | `null` | `true` |

**THERE IS NO ENTRY SCREEN (2 Oct 2026, the user's call).** A new student sees
the three intro screens and lands on Home as a guest. There used to be a door
between them (Google or "Continue as Guest") and a persisted `guestMode` flag
recording the choice; both are deleted, along with `continueAsGuest()` and
`entry-view.tsx`. `isGuest` in `hooks/use-auth.ts` is now DERIVED: `status ===
"ready" && !isAuthenticated && isSupabaseConfigured`. The `ready` is what keeps
a returning signed-in student from seeing the guest card on Profile while their
session loads. Signing in happens where an account is needed: the login prompt
(KruAI, Roadmap, Battle) and Profile's guest card, both through `GoogleButton`.
Logout and "exit guest mode" now land on Home as a fresh guest.

`authStatus`, `authUser`, `authPrompt` and `accountConflict` are **excluded from
`partializeState`**, exactly like `chatOpen` — re-derived from Supabase on every
load. Only `syncedUserId` persists. `hooks/use-auth.ts` is where every question
about identity is answered.

**A GUEST HAS NO `userName`, deliberately.** A placeholder like "Guest" in the
store would reach `profiles.display_name`, the leaderboard and the pledge
signature — and survive a later Google sign-in, leaving the student permanently
named "Guest". `useDisplayName()` supplies the fallback at render time instead.

**No persist `version` bump for removing `guestMode`.** An old payload still
carrying it has the key spread into state by `merge()`, where nothing reads it,
and `partializeState` no longer lists it, so the next write drops it.

**The privacy link moved with the door.** The entry screen was where Google's
requirement (the policy reachable where a student decides to sign in) was met,
so `/privacy` is now linked under the Google button in the login prompt and on
Profile's guest card.

### The gate, in `app-shell.tsx`

A ternary chain, in priority order, kept as JSX rather than early returns so
nothing above it closes over a possibly-null `authUser`:

```
loading, no local name                            -> <AuthSplash/>
conflict pending                                  -> <AccountConflictView/>
intro not seen, no name, not signed in            -> <IntroView/>
authenticated, no name                            -> <LoginView/>   (prefilled)
authenticated, not surveyed                       -> <SurveyView/>
                                                  -> the app (a guest if signed out)
```

Three things there are load-bearing and easy to undo:

- **`hasFullAccess` is true when Supabase is UNCONFIGURED**, which skips the
  whole chain. With no project there is no account to have, no server to protect
  and no AI credits to spend — the same degradation the mentor already does for
  a missing `GEMINI_API_KEY`. It is also what keeps `npm run preview`, a fresh
  fork and `scripts/shots.mjs` working with **no change to the screenshot seed**:
  the documented blanked-env command was already the right one.
- **The splash renders only for a student with no local name.** That is the
  OAuth callback case: without it, a student coming back from Google would see
  Home flash before `LoginView`. With no auth traces the session settles in the
  mount effect, so for an ordinary guest it lasts one frame. Gating the whole
  tree on "loading" would put an import — and, for an expired token, a network
  round trip — in front of first paint for every returning student. See the top
  of `lib/supabase.ts` for why that is not affordable.

`userName`/`surveyed` now gate **authenticated students only**. A guest falls
straight through to Home, and because their `surveyed` was never faked, signing
in later walks them through the survey properly.

### What is locked, and where the gate actually is

Roadmap and KruAI. Everything else — lessons, practice, flashcards, mock exams,
progress, streak — stays open to guests. Locking another feature is one
`requireAuth(...)` call.

**The roadmap guard is on the ROUTE, not the links.** There are four ways in
(Home's Quest Map chip, grade-prediction's recommended action, and two
programmatic `navigate("/roadmap")` calls in the survey and placement-test
flows), and a click handler covers neither the last two nor a typed URL. Home's
chip *also* calls `requireAuth` so the modal opens in place rather than on a
locked page, but that is polish on top of the real gate in `pages/roadmap.tsx`.

**`ShellLayout`'s `roadmapLock` gained `hasFullAccess`, and it is not
decoration.** A guest never signs a pledge, so without it that condition is true
for every guest reaching `/roadmap` — and it strips the sidebar, the hamburger
and the FAB while the route renders no `BottomNav` either. They would land on the
locked panel with no navigation at all and no way out but the browser's back
button. There is a screenshot test for exactly this.

**KruAI is gated three times over**: `FabChat` raises the prompt instead of
opening (the FAB stays VISIBLE — the lock is what advertises the feature),
`AppShell` refuses to render `ChatOverlay` without access, and the endpoint
demands a bearer token. Only the third is a real gate; the first two are UX.

### The endpoint verifies the caller now

`/api/chat` was public and unauthenticated. It now rejects anything without a
valid, non-anonymous Supabase access token — hiding a button is not a gate, and
a guest with one `curl` could spend the Gemini budget.

**`server/verify-user.ts` verifies LOCALLY, with no network per request.** The
obvious route — `GET /auth/v1/user` with the bearer token — was rejected on three
counts: it puts a Supabase round trip in front of a stream whose selling point is
~2.7s to first character; every student's check would egress from the same
handful of Vercel IPs into Supabase's own per-IP auth limits; and caching it
correctly means capping the cache at the token's own `exp` anyway.

This project signs with **ES256 asymmetric keys** (verified against its live
JWKS endpoint), which `node:crypto` reads natively from a JWK — so this is ~200
lines and **zero dependencies**. JWKS is fetched once per instance, re-fetched on
an unknown `kid` but no more often than `JWKS_REFETCH_MIN_MS`, or a stream of
junk tokens with invented kids becomes a fetch amplifier. An HS256 branch exists
for a legacy project still on the shared secret. **Relative imports only** — the
Vercel function bundler reads the root tsconfig, which has no `paths`.

**THE TRADE, and do not reuse this without revisiting it:** a locally verified
token cannot be revoked early, so a student signed out on another device keeps a
working token until it expires (an hour). Correct for a rate-limit gate on a chat
endpoint. NOT correct for anything destructive.

**Unconfigured fails CLOSED in production.** No `SUPABASE_URL` means no request
can be authenticated, which in production means a missing Vercel variable has
quietly reopened the endpoint — so it returns 503 and logs loudly. In dev it
warns and continues, or "the mentor works locally" would mean nothing about
production.

**The rate limits were re-set, and the old number was the whole point.**
`chat-handler.ts` recorded that 30/min per IP was chosen *because a classroom
shares one school router*. Keeping that as a pre-filter would have changed
nothing — it stays the binding constraint. The IP number is now a pure anti-flood
figure (240/min) and the real cap (20/min) is on the verified user id, which is a
real per-student key for the first time.

**The 401 body is a sentence, not a status.** `chat-overlay.tsx` renders any
non-ok body verbatim as a KruAI bubble, so "Unauthorized" would arrive on screen
as the mentor's answer. It also says nothing about *why* — expired, unsigned,
anonymous and absent are one message to the caller and four distinct reasons in
the server log.

### Signing in cannot destroy work

`pushLocalState` writes a **full destructive snapshot**: it deletes server
conversations absent from the local list and overwrites xp/level/coins/streak.
That was harmless while anonymous auth guaranteed one device was one account.
Google makes it a two-tap operation — guest on a school computer, do a lesson,
sign in, and the phone's account is gone.

So the pull/push decision keys on **`syncedUserId`** (the account this DEVICE
last synced with), not on whether the store happens to be empty:

| session uid | local store | action |
| --- | --- | --- |
| `=== syncedUserId` | any | push, as before |
| new uid | empty | pull (a reinstall, or a second device) |
| new uid | has work, remote profile blank | push (first sign-in — upload it) |
| new uid | has work, remote has a real profile | **`AccountConflictView`** |

**There is no merge, and the conflict screen is not one.** Merging two divergent
XP totals, streaks and review schedules is a real design problem nobody has
solved here. Asking turns silent loss into a choice, and the screen says plainly
that the other side will be replaced. `fetchRemoteSnapshot()` reads four columns
with no side effects precisely so neither side is touched before the student
answers; `flush()` checks `accountConflict` for the same reason.

`profiles` still has no DELETE policy, so the losing side can never be cleaned
up. Two Google accounts are still two uids with no linking.

### The OAuth callback, and the trap in the lazy import

`hasAuthTraces()` in `lib/auth.ts` decides whether to download the SDK at all, so
a student who has never signed in never pays the ~40KB. **Getting it wrong in the
other direction swallows every sign-in**, and the mechanism is not obvious: the
SDK's own `_initialize()` is the only thing that parses an OAuth callback out of
the URL, and it runs when the client is CONSTRUCTED. On the redirect back from
Google there is no stored session yet — the SDK is what writes it. "No stored
session, skip the import" would have left every student straight back in
guest mode with nothing in the console.

Three independent tells, any one of which forces the slow path: a localStorage
key **starting with** the auth key (a prefix scan — PKCE parks code verifiers
under suffixed keys); OAuth parameters in the URL, **including the error ones**
(without them a declined consent screen lands back saying nothing); and our own
sentinel written before the redirect, which is the version-proof one because it
does not depend on the SDK's internal key layout.

**`flowType: "pkce"` is stated rather than inherited.** The supabase-js default
is the implicit flow, which returns the session in the URL FRAGMENT — a refresh
token in session history, reachable through a `Referer`. Changing it changes the
shape of the callback, which is why the detection covers both `code=` and
`access_token=`.

### React Compiler: `requireAuth` reads the store imperatively

`useRequireAuth()` returns a closure, and that closure must call
`useBrachNhaStore.getState()` rather than closing over a selector value. Reading
`authUser.id` would make the compiler narrow its memo dependency to that property
path and emit the check where the closure is BUILT — in the hook body, with no
guard above it — and `authUser` is legitimately null for every guest. It would
throw on the home screen for exactly the people the hook exists to serve. Neither
`tsc` nor `oxlint` can see it. Same reason `AuthPromptOverlay` is mounted as
`{authPrompt && <AuthPromptOverlay/>}`: the component never sees null, so there
is no guard to misplace.

### What the dashboard needs

Google is configured **outside this repo** and nothing in the code can check it
for you:

1. Google Cloud Console → OAuth 2.0 Client ID (Web application), redirect URI
   `https://<project-ref>.supabase.co/auth/v1/callback`, consent screen
   configured.
2. Supabase → Authentication → Providers → **Google → enable**, paste the client
   id and secret.
3. Supabase → Authentication → URL Configuration → Site URL and Redirect URLs.
   **Exact addresses only (security audit, 6 Nov 2026).** The list is
   `https://brach-nha-v1.vercel.app/**` and `http://localhost:5173/**`, nothing
   else. It used to carry a wildcard so previews could sign in, and a broad one
   (`*.vercel.app`) lets ANY Vercel site receive a student's sign-in code: an
   attacker starts the PKCE flow with their own verifier, sends the link, and
   swaps the code for the student's session. Even the team-scoped
   `brach-nha-v1-*-<team>.vercel.app` was removed, because a stranger's project
   named to fit it might get a matching address, and nothing deploys to previews
   (every deployment is Production). So sign-in fails on a preview build, on
   purpose. Add that pattern back only for the day it is needed.
4. Vercel → `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on Production AND
   Preview, then **redeploy**. Without them the endpoint returns 503 by design.

No database migration was needed. RLS already keys on `auth.uid()`, which works
identically for a Google user, and the avatar comes from the session rather than
a column.

### Links arrive from Telegram, and an in-app browser cannot sign in

Most students meet a BrachNha link in a chat app, which opens it in that app's
own webview rather than Chrome or Safari. The webview has its **own cookie jar**,
so the Google session already on the phone is not in it — Google answers the
OAuth redirect with a bare email-and-password form instead of the account
chooser, and increasingly refuses the embedded user agent outright
(`disallowed_useragent`). **None of that is fixable from inside the webview**, so
the app detects it and asks to be reopened in the real browser.

`utils/in-app-browser.ts` decides, and `features/auth/components/open-in-browser.tsx`
is what the student sees.

**IT LIVES INSIDE `GoogleButton`, NOT IN THE GATE (2 Oct 2026).** It used to be a
whole screen standing in for the entry screen, which blocked the app entirely
for a Telegram visitor. With the entry screen gone, a Telegram visitor sees the
intro and uses the app as a guest like anyone else, and only meets "Open in
browser" where sign-in is offered: `GoogleButton` renders `OpenInBrowser` in
place of Google when `isInAppBrowser()` (read once at module scope). That one
switch covers the login prompt, `LockedFeature` and Profile's guest card. It is
two components rather than an early return so neither calls hooks
conditionally. Nothing can touch an OAuth callback, because nothing in the gate
looks at the browser any more.

**TWO KINDS OF SIGNAL, because Telegram stamps nothing.** Named UA tokens
(`FBAN`, `FB_IAB`, `Instagram`, `MicroMessenger`, `Zalo`, `Line/`…) are the
strongest evidence where a vendor provides one. Telegram provides none, so it is
caught by SHAPE: on Android the platform's own `; wv)` WebView marker, and on iOS
a WKWebView's missing `Version/`+`Safari/` pair. Those two heuristics are the
only part that can produce a false positive, and **a false positive is strictly
worse than a false negative** — it strands someone whose browser was fine behind
a button with nothing to do. Hence the exclusions: iOS Chrome/Firefox/Edge/Opera
by token, desktop never by heuristic, and **an installed PWA is checked for
explicitly** (`navigator.standalone` / `display-mode: standalone`) because an iOS
home-screen app has no `Safari/` either — without that, installing BrachNha would
permanently replace it with a screen telling the student to open it in a browser.

**A CHROME CUSTOM TAB IS CORRECTLY NOT FLAGGED.** Several Android apps open links
that way instead of in a WebView, and a Custom Tab *is* Chrome with Chrome's
Google session — sign-in works, so the student must not be interrupted.

**NO PAGE CAN FORCE AN EXTERNAL BROWSER, and both mechanisms fail SILENTLY.**
Android gets an `intent:` URL (the platform's documented hand-off, with
`S.browser_fallback_url`, and deliberately **no `package=`** so the student's own
default browser wins rather than Chrome being forced); iOS gets
`x-safari-https://`, which reaches Safari and nothing else — there is no
equivalent for a non-Safari default. Both schemes are *requests* the host app may
drop, with no event either way, which is why `openInExternalBrowser` returns
nothing and the screen reveals its manual instructions **from a timer** rather
than from a result it will never receive. Don't add a success/failure return: it
would be a lie. Both branches preserve the URL's own scheme, so a `localhost` dev
build is not silently upgraded to https.

`externalUrl()` keeps the path and query — a link to a lesson must reopen on that
lesson — and drops two things on purpose: the **OAuth parameters** (an
authorization `code` is single-use and bound to a PKCE verifier in *this*
webview's storage, so carrying it over can only produce a failed exchange) and
the **hash** (Android's `intent:` URLs need the fragment for their own payload,
and nothing here routes on it).

**No Google button inside a webview** — it leads back into the thing that does
not work. The link sits in a `select-all` box rather than behind a copy button,
the shape `features/game`'s invite panel already uses. A guest's progress in the
webview stays in the webview: localStorage is per-browser, so switching to the
real browser to sign in starts that browser fresh.

**Verified against 26 real user-agent strings** (both directions, plus the PWA,
the Telegram JS bridge and iPadOS-reporting-as-Mac) and then in real Chrome under
spoofed UAs (that was the full-screen version; re-checked 2 Oct 2026 after the
move: a Telegram UA goes intro → Home, the login prompt shows Open in Browser
with no Google, and the help text appears after the tap). The intent URL
carries the path and query, and 320px Khmer in both themes has no sideways
scroll.
**Scanning the real thing still needs two phones** — a spoofed UA proves the
detection, not that Telegram honours the intent.

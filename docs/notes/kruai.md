# KruAI: the endpoint, the prompt and how it answers

> Moved word for word from AGENTS.md on 3 Nov 2026. This is dated history: where two
> passages disagree the later one wins, and the code beats both. "This file", "above"
> and "near the end of this file" mean the old single file, so search all of
> `docs/notes/` for a section named here.

## The KruAI endpoint — one handler, two mounts

`server/chat-handler.ts` exports `handleChat(req: Request): Promise<Response>`
with no framework in it at all. It is mounted twice:

1. **Local dev** — `server/vite-chat-plugin.ts` adds Connect middleware on
   Vite's dev server at `POST /api/chat`. It loads the handler through
   `server.ssrLoadModule` rather than importing it at the top of the config, so
   TypeScript and hot-reload work there. It also bridges `GEMINI_API_KEY` from
   `.env`/`.env.local` into `process.env` via `loadEnv` (Vite deliberately does
   not do this for unprefixed vars).
2. **Production** — `api/chat.ts`, a Vercel Serverless Function whose Node
   runtime accepts exactly that web-standard signature, so it is a one-line
   passthrough. `vercel.json` sets `maxDuration: 60` because the reply streams
   and the 10s default truncates long answers.

**`npm run preview` has no backend.** It serves the static `dist/` only, so the
mentor shows its "unavailable" notice there. That is expected, not a bug.

**Never let the key reach the client.** `GEMINI_API_KEY` has no `VITE_` prefix
on purpose — Vite only exposes `VITE_*` to the browser bundle. Don't "fix" a
missing key by prefixing it.

**`server/chat-handler.ts` and `src/utils/chat-prompt.ts` must stay free of the
`@/` alias.** Vite resolves it, but the Vercel function bundler reads the root
`tsconfig.json` — a solution file with no `paths` — and an aliased import there
fails the deploy build. Both files carry a comment saying so. Type-only imports
are erased and would survive, but keep the whole reachable graph relative rather
than relying on that.

### Model and prompt

There is no single model: `GEMINI_MODELS` in `chat-handler.ts` (currently
`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest` →
`gemini-3-flash-preview`) × a POOL of API keys is a list of candidates, called
through the official `@google/genai` SDK's **Interactions API** (`ai.interactions.create`), NOT the
older `models/*:generateContent` endpoint the original Netlify function used.
Replies stream as plain UTF-8 text (not SSE — there's one stream of text, so the
client just reads `response.body.getReader()`).

`store: false` is passed deliberately so Google doesn't retain student
conversations server-side; we replay history ourselves from the Zustand store.
**It does not change what the FREE tier's terms allow Google to do with the
content** — on unpaid use, prompts and replies may be used to improve Google's
products and reviewed by people, and the prompt carries a student's name and
study profile. That is a product/legal decision for before a real classroom,
not something a flag here settles.
`thinking_level` is `"minimal"` on purpose: measured ~2.7s to first character vs
~11.2s on `"low"`, and accuracy held on multi-step Bac II math (conjugate
limits, conditional probability). `max_output_tokens` is set to 3000 (bumped from 1200)
to ensure complete rendering of detailed Bac II comparison tables without mid-stream truncation.

### KruAI teaches with the Socratic method (29 Sep 2026)

The user's call: **guide first, full solution on request, exercises only**, and the daily
limit stays at 30 units, which means fewer exercises a day because guiding takes more turns.

- **`SOCRATIC_RULES`** (`data/bac2-format.ts`) is sent BEFORE `BAC2_ANSWER_RULES`. For an
  EXERCISE (calculate, solve, prove, balance, typed or photographed), KruAI does not solve it.
  It restates what is given in one line, then gives ONE hint or asks ONE question and stops.
  - A right answer gets brief praise and the next step.
  - A wrong answer gets a question pointing at the mistake, never the answer.
  - Stuck gets a bigger hint.
  - The full solution comes only when asked, after about 3 stuck tries on a step, or to
    confirm an answer the student reached.
- Facts, definitions, comparisons and advice are still answered directly, so the curated
  answers in `server/chat-cache.ts` needed no change.
- **`BAC2_ANSWER_RULES` was reframed, not rewritten.** It opened with "Every academic answer
  MUST follow this skeleton", which reads as "always solve". It now says the skeleton is for
  direct answers and for a full solution when one is due.
- **Examples outweigh rules, so the examples moved with them:**
  - `SOCRATIC_EXAMPLE` is a short guided dialogue on a DIFFERENT limit from the full example.
    It is placed before the full examples.
  - The heading of the full examples changed from "Copy this structure exactly" to "When you
    give a direct answer or a full solution".
  - The one exercise example is now asked as an explicit request for the full solution.
    Asked plainly, it would teach "solve on sight".
- **🧭 is a contract with the app.** Every guided reply starts with it. `chat-overlay.tsx`
  shows **បង្ហាញដំណោះស្រាយពេញ** under the LAST reply that starts with 🧭, once it has finished
  streaming. The button sends `SHOW_SOLUTION_KM`, the exact words the rules name as "give the
  full solution".
  - The phrase lives in `data/kruai-phrases.ts`, a tiny module of its own, because importing it
    from `bac2-format.ts` into the chat screen would ship the whole system prompt to every
    browser. That was checked after the build: 0 client chunks contain the prompt text.
  - The mark stays visible in the bubble (the "guided" cue), so nothing is stripped. If the
    model forgets it, only the button is lost; the student can still type the request.
- **Prompt size after:** 18,835 characters on Home and **23,656 on a section page**, against
  `PROMPT_BUDGET_CHARS` 24,000, which left ~340 characters of headroom. The
  sympathetic/parasympathetic example was cut on 1 Oct 2026 for that reason (see the next
  section): now **17,375 and 22,196**.
- **Verified with the real model** (local free keys, the real handler through
  `ssrLoadModule`):
  - a typed limit → 🧭, one question, no answer;
  - a wrong "0" → 🧭 and a question about the denominator, still no answer;
  - "សូមបង្ហាញដំណោះស្រាយពេញ" → the full skeleton with `ចម្លើយ៖ … = 6`, no 🧭;
  - a photosynthesis question → a direct answer, no 🧭, ending with a check question;
  - a photo of the exercise → 🧭, the exercise read correctly, one question.

  **Not verified:** the "I don't know" turn (the key was busy) and the "3 stuck tries" rule.

  Browser, with the fake Gemini at 390 light and 320 dark (14 checks):
  - the button appears only under the last guided reply, sends the exact phrase, and is gone
    after the full solution;
  - no sideways scroll.

### Long guided chats, Stop / Try again, questions left (1 Oct 2026)

Four changes from a review of the chat, all chosen by the user.

**1. The exercise no longer falls out of a long guided chat.** Only the last `MAX_HISTORY` (12)
messages reach the model, and a guided chat is many short turns, so after about six tries the
exercise itself was gone. Measured with the real model on a 15-message chat ending in a WRONG
answer ("6" for a limit that is 7):
- cut to 12 (the old behaviour): KruAI **invented a different exercise and said "6 is
  correct"**;
- with the fix: it named the right factors, `(x-3)(x+4)`, and asked the student to try again.

How it works:
- `guidedAnchorIndex()` in `src/utils/chat-anchor.ts` walks back over the run of 🧭 replies and
  returns the student message that started it. -1 when the latest reply is not guided, so a
  direct-answer chat sends nothing extra.
- The handler sends that message AHEAD of the window, prefixed with `ANCHOR_NOTE`, which says
  only where the guidance began. A student who started a second exercise mid-run still has those
  turns in the window, so the note must not claim "this is the current exercise".
- `wireMessages()` gives the anchor's photo the first of the two photo slots, because a photo
  exercise is often nothing but the photo.
- `pushStep()` folds two same-side turns into one. That happens only when alternation broke (a
  dropped failed bubble, or the anchor next to a window that starts on a student turn).
- `GUIDE_MARK` moved to `data/kruai-phrases.ts`, because the server reads it now too.

**2. Our own words are never replayed as KruAI's.** Error bubbles, the daily-limit refusal and
the sign-in message used to go back to the model as `model_output`.
- `ChatMsg.failed` marks them: `"retry"` or `"final"`.
- `wireMessages()` drops them before sending.
- Not synced: on another device they arrive as ordinary text. Accepted.

**3. Stop and Try again.**
- While an answer streams, Send becomes Stop (an `AbortController` on the fetch).
- Stop mid-answer keeps the words already shown and marks nothing.
- Stop before the first word leaves `⏹️ បានបញ្ឈប់។` with `failed: "retry"`.
- A dropped connection or a 5xx/busy reply gets `"retry"`. A daily limit (the
  `X-KruAI-Limit` header), a 401 or a refused photo (4xx) get `"final"`, with no button.
- Try again calls `dropFailedBotMsg()` and asks again with the same history, so the answer
  replaces the failed bubble and the question is not duplicated.
- `send()` is now `send()` (adds the question) + `ask()` (asks about the conversation as it
  stands).

Cutting the model off:
- The handler's `cancel()` aborts upstream once the answer has started.
- `vite-chat-plugin.ts` now cancels the reader when the browser hangs up, so dev behaves like
  Vercel. Before this, dev read every stopped answer to the end.
- **Known gap:** a Stop before the first word does NOT stop the model; that one answer finishes
  generating server-side. Closing it means watching `req.signal` in the attempt loop. Not done,
  because what Vercel does with that signal is unverified, and a false abort would fail every
  answer.
- The unit is still charged either way, the cost already accepted in the paying section.

**4. "Questions left today".**
- The handler turns `kruai_take`'s `user_units` into units left and sends it as `X-KruAI-Left`
  on every charged answer, and on a refusal at the student's own limit.
- A curated answer is free and sends none. The whole-app refusal sends none either, since a
  count under "KruAI is resting" would contradict it.
- **"Left" is computed from the limit the database enforced.** `kruai_take` returns it as
  `user_limit` (since `20261002000004`), so there is no copy in the handler to drift. Before that
  migration the server falls back to 30 (`DEFAULT_USER_DAILY_UNITS` in `server/kruai-quota.ts`).
- The screen shows a line above the composer once `LOW_LEFT` (10) or fewer are left, with
  "a photo counts as 3" while a photo is attached.
- The count is kept in module scope, with the day, so it survives closing and reopening the chat
  but not a reload.
- A photo refused with 1 or 2 units left now says so (and that typed questions still work),
  instead of "come back tomorrow".

**5. The prompt lost the sympathetic/parasympathetic example**, which duplicated a curated answer
in `server/chat-cache.ts`. That is −1,460 characters on every request (only the Khmer half was
ever sent), about 650 tokens a question. The plant-hormone example still teaches the table, and
a real-model comparison that is NOT cached (cellular respiration vs photosynthesis) still came
back as similarities + a differences table.

**Verified:**
- 16 handler checks against fake Supabase + fake Gemini: headers, the anchor in and out of the
  window, a photo anchor, folding;
- the earlier 18 daily-limit checks still pass;
- 34 browser checks at 390 light and 320 dark: Stop at both moments, Try again after a stop and
  after a 503, failed bubbles absent from the request, the line at 25/8/0 and after reopening,
  no Try again under a limit refusal, no sideways scroll, no page error;
- the dev upstream really closing after Stop (the fake logged it).

### KruAI's voice: a kind big sibling (2 Oct 2026)

The user asked for the chat to feel "friendly and cutie", and floated a boyfriend/girlfriend
persona. **There is no romantic persona, and that is deliberate.** The users are high-school
students, many under 18; a romantic AI partner for minors invites emotional dependence, would
cost the trust of parents and schools, and pulls students off studying. The user chose a
**big sibling** instead. Their choices:
- **Address:** KruAI calls itself **បង** and the student **ប្អូន** or by name.
- **Emoji:** 1 or 2 per reply.
- **Shape:** short answers for simple questions.
- **Screen:** a cuter typing indicator and greeting. No KruAI picture.

Where it lives:
- **`VOICE` in the persona block of `utils/chat-prompt.ts`:**
  - address (never អ្នក to the student);
  - the student's name written EXACTLY as stored, never transliterated: the user caught
    "Panharith" rendered as a wrong Khmer spelling, and a misspelt name is worse than none;
  - praise right steps, gentle on mistakes;
  - be kind first when the student is stressed;
  - point to a trusted adult if they mention harm or not being safe;
  - **politely refuse romance or flirting and steer back to studying.**
- **`BAC2_ANSWER_RULES` (`data/bac2-format.ts`):**
  - the Given → Method → Steps → Answer → Exam tip skeleton is for a FULL EXERCISE SOLUTION
    only;
  - a fact, definition or "why" question gets 2 to 5 short lines plus an optional exam tip;
  - comparisons keep the table;
  - the emoji rule is 1 or 2 per reply, never in a formula, a step, a table or the answer
    line;
  - "write like a Cambodian teacher" became "like a kind older sibling (បង) helping a
    younger one (ប្អូន)".
- **Examples moved with the rules**, because an example outweighs a rule:
  - `SOCRATIC_EXAMPLE` speaks as បង to ប្អូន with an emoji;
  - the brain example (a fact question) was reshaped from the full skeleton into the short
    form;
  - the examples heading now says to match the example "of the same kind".
- **The app's own KruAI-bubble messages** say ប្អូន (and បង) in place of អ្នក/ខ្ញុំ:
  - the daily-limit and refused-photo messages, and the apology in `chat-handler.ts`;
  - the apologies in `chat-overlay.tsx`;
  - one curated answer in `chat-cache.ts`.
- **`chat-overlay.tsx`:**
  - the greeting uses `userName` in the sibling voice;
  - the "..." bubble is three `motion-safe:animate-bounce` dots plus "KruAI កំពុងគិត…", with
    `role="status"`.

Re-run with the Latin name "Panharith": every reply that used the name wrote it exactly,
and none put it into Khmer letters.

**A full solution ENDS WITH THE FORMAL BAC II ANSWER** (the user's call, same day). The
explanation alone ended in a one-line "ចម្លើយ៖ … = 6", and the user pointed out that a
student never saw the answer as it must be WRITTEN on the exam paper. Skeleton step 4 is now
**"ចម្លើយ (សរសេរលើក្រដាសប្រឡង)៖"**, the whole solution again from start to end, in the
answer key's own style (the 2025 maths paper, `2025-math` on Admin → Content):
- one line naming the form or formula, e.g. មានរាងមិនកំណត់ $\frac{0}{0}$;
- ONE chain of equalities from the question to the result;
- a closing "ដូចនេះ …" line;
- no explanation inside it.

**TWO LENGTHS, chosen by whether the exercise was guided** (the user's call, after first
choosing "always explain"):

| how the student got here | full solution |
| --- | --- |
| guided first (earlier replies about it start with 🧭) | SHORT: one-line METHOD + FORMAL ANSWER + EXAM TIP. The guided turns already explained |
| asked for the solution straight away | LONG: all five parts, numbered explanation steps included |

The model decides from the 🧭 replies it can see in the history. Nothing in the handler marks
it.
- The rule is "Two lengths" under the skeleton in `BAC2_ANSWER_RULES`.
- `SOCRATIC_EXAMPLE` now ends with the student pressing the button and the SHORT form.
- The worked limit example (asked directly) shows the LONG form, so each length has an
  example of its own.

Two phone details:
- **At most 3 "=" per `$$…$$` line**, each continuation line starting with "=", the way the
  key breaks a long chain.
- **KruAI's bubbles are `max-w-[92%]`** (the student's stay 80%). Measured: an 80% bubble made
  the limit's first chain line overflow by 9px at 360 and 41px at 320. Now 0 at 360/390 and
  6px at 320, the narrowest phone, where `overflow-x-auto` on the display block makes it a
  small swipe rather than a broken page.

The worked example shows the formal block, and its "ទម្រង់មិនកំណត់" became the key's
"រាងមិនកំណត់".

**Two cuts made room.**
- **The monocot/dicot comparison example was removed.** It duplicated a curated answer (the
  starter chip), exactly as the sympathetic one did.
- **The comparison rule no longer spells out a sample table.** The plant-hormone example shows
  a real one.

Real model, with "Panharith":
- a limit and a derivative AFTER guiding came back SHORT (formal answer, no numbered steps);
- a limit and a physics problem asked DIRECTLY came back LONG (steps + formal answer);
- all four had the formal heading, the chain and "ដូចនេះ", with 0 KaTeX errors and no raw
  LaTeX;
- a non-cached comparison still came back as a table.

**Prompt size after:** 18,979 characters on Home and **23,800 on a section page**, against
`PROMPT_BUDGET_CHARS` 24,000. **Only ~200 characters of headroom.** The next addition needs a
cut first; the plant-hormone example (~1,500 characters) is the obvious one, if the
comparison rule alone keeps producing tables without it.

**Verified with the real model** (8 messages, profile name ដារ៉ា). The guided exercise, the
right step and the wrong step:
- use the name and ប្អូន;
- carry 1 or 2 emoji;
- give no answer.

The others:
- "show full solution" gives the skeleton;
- "what is photosynthesis?" gets 5 lines and no skeleton;
- a non-cached comparison still gets a table;
- "I'm stressed" gets kindness first, one small step and a question;
- "be my girlfriend" gets a kind no and a return to studying.

None of the 8 has an em dash or a Khmer numeral.

Browser, 28 checks at 390 light, 320 dark with reduced motion, English, and a blank name:
- the greeting carries the name, or none;
- the dots bounce, and stand still under reduced motion;
- no sideways scroll, no page error.

**Seen in testing:**
- **Not fixed:** the girlfriend reply called KruAI "បងប្រុស" (big BROTHER). The prompt does
  not give KruAI a gender.
- **Fixed the same day:** the photosynthesis answer wrote
  `\xrightarrow{\text{ពន្លឺព្រះអាទិត្យ}}`. That is Khmer inside a `\text` nested in a group,
  which `liftKhmerText` deliberately refuses, so the line showed as raw LaTeX. See "a Khmer
  label on an ARROW" in the LaTeX section near the end of this file.

### The key pool and the fallback loop

Keys come from `GEMINI_API_KEYS` (comma-separated), `GEMINI_API_KEY`, and
`GEMINI_API_KEY_1`..`_5`, de-duplicated. `server/vite-chat-plugin.ts` bridges
every one of those names in dev; on Vercel they are ordinary env vars.

Candidates are **model-major**: the preferred model on every key before a lesser
model on any, because quotas are per project per model and a second key usually
has the fast model's quota left. Key order starts at a round-robin pointer.

Four rules in the loop, each from a measured failure:

- **Fall back until the FIRST CHARACTER, not until `create()` succeeds.** An
  overloaded model often accepts the request and then sends an `error` event;
  the old loop only caught a throw, so that went to the student as an apology.
  After the first character there is no switching.
- **Classify before retrying** (`classifyFailure`): 429/5xx/connection → next
  candidate; a bad key (Gemini says 400 "API key not valid", not 401) → skip
  that key for every model; 404 → skip that model on every key; any other 400
  → stop, the request itself is the problem. It used to retry everything, up
  to keys × models times.
- **Race each attempt against `ATTEMPT_TIMEOUT_MS` (10s), under a 25s
  first-text deadline.** Measured: an exhausted key was held for **29.9s**
  before Google answered 429. The attempt RACES a timer rather than trusting
  the abort signal, because the SDK outlived an aborted signal by 7s. The
  deadline exists because `vercel.json` caps the function at 60s, answer
  streaming included.
- **Cooldowns** (module-level, per instance, like the rate limiter): a 429
  benches that key+model for 60s (30 min if the quota named is per-day), a
  timeout for 5 min, a broken key or unknown model for 30 min. A cooldown sorts
  a candidate to the back, never removes it. Measured after: every request
  that followed a failure reached first text in ~2.3s.

Logs name the key's POSITION (`key #2`), never the key. A student closing the
chat aborts the upstream request (`cancel()` on the response stream), so an
unread answer stops costing quota.

`isQuotaError()` checks the status first; it used to substring-match "429" and
"503" anywhere in the serialised error, request ids included. Busy and quota
cases return the polite temporary-busy notice. Vendor names ("Gemini" /
"Google") are kept strictly out of student-visible copy.

### The curated-answer cache — and why there is no answer cache

`server/chat-cache.ts` holds hand-written Bac II answers (comparison tables,
Mendel, RNA types) served as a simulated stream with zero API calls. Three
rules:

- **After the auth gate.** It used to run before it.
- **First turn only.** Mid-conversation the same words usually mean something
  narrower, and a canned reply would ignore what the student already said.
- **The question must be the pattern plus FILLER words** ("what is the
  difference between", "សូម", "មានអ្វីខ្លះ"), not merely contain it. With a
  bare `includes`, "which part of the brain stem controls breathing" got the
  canned "parts of the brain" answer.

**There was also a cache of MODEL answers, keyed on the question text alone,
and it was a privacy leak.** Every reply is written with that student's name,
weak subjects and exam average in the system prompt, plus their history and
open screen — so the next student to type the same words got a reply addressed
to someone else, a follow-up like "why?" was replayed into unrelated chats,
and since it ran before the gate an unauthenticated `curl` could read it.
Deleted. Don't bring it back without keying on everything that went into the
prompt, at which point it would never hit.

### Textbook retrieval must be ANCHORED

`searchBiologyTextbook` / `searchMathTextbook` share one scorer
(`searchSections`). A section is returned only with a TITLE or KEYWORD hit;
word overlap breaks ties and never qualifies a section alone. Previously "the",
"what" and "and" matched nearly every section, so a greeting pulled ~9,000
characters of textbook into the prompt. Latin terms match on word boundaries
("stem" is inside "system", "pine" inside "spine", "gh" inside "high"); Khmer
terms stay substring matches, since Khmer has no spaces. The math scorer also
split on `/\\s+/` (in source) — a literal backslash then "s" — so it never
split at all.

Textbook text is plain template literals, so LaTeX there needs `\\` — two
`$\rightarrow$` in the enzyme section were written with one backslash and
reached the model as a carriage return + "ightarrow".

### KruAI reads photos (29 Sep 2026)

A student can attach ONE photo per message, from the camera or the gallery, and
KruAI answers about it. The user's three calls: **one camera button that opens a
two-item menu** (ថតរូប / ជ្រើសរូបភាព, `components/shell/chat-attach.tsx`), **a
small preview kept in the history**, **one photo per message**.

**Two copies of every photo, and only the small one is persisted.**

| copy | size | lives in | used for |
| --- | --- | --- | --- |
| full | 1400px, JPEG 0.72, ~200–450KB base64 | `lib/chat-images.ts`, a module `Map`, this page load only (6 held) | what the model reads |
| thumb | 320px, JPEG 0.6, ~5–20KB data URL | `ChatMsg.image.thumb`, persisted | the bubble after a reload |

localStorage is ~5MB for the whole store, so a full photo there would fill it in
weeks. `MAX_CHAT_THUMBS` (30) in `lib/store.ts` strips `thumb` from older photo
messages, newest kept; the stripped message keeps `image: {}` so its bubble still
shows a "រូបភាព" chip. `chat_messages` syncs text only, so another device sees the
question without its photo. That is accepted, and it needs no migration.

**A photo sent with no words gets a real text** (`PHOTO_QUESTION` in
`chat-overlay.tsx`), stored as the message's text. That keeps the conversation
title, the sync row and history replay free of empty-text cases.

**The wire.** `wireMessages()` sends `{ role, text }` per message, plus the full
photo for at most `MAX_PHOTOS_SENT` (2) of the newest photo messages still held in
memory, inside the last 12 messages (the handler's `MAX_HISTORY`). So "explain
step 3" still reaches the model with its photo. A message whose photo is no longer
held (after a reload) is sent with `hadImage: true`, and the handler appends
`PHOTO_GONE_NOTE` so the model says it cannot see it rather than pretending. Thumbs
and ids are never sent.

**The server is strict** (`cleanImage` in `chat-handler.ts`): `image/jpeg` only
(the client always re-encodes, which also converts an iPhone's HEIC), the base64
alphabet only, at most `MAX_IMAGE_B64_CHARS` (checked before the regex runs), and
it must start with `/9j/`, the base64 of JPEG's FF D8 FF signature. More than
`MAX_IMAGES_PER_REQUEST` (2) is refused, not trimmed. `MAX_BODY_BYTES` grew from
64KB to 64KB + 2 photos. `server/vite-chat-plugin.ts` mirrors that number and
**both must change together**. A photo turn is sent to the model image first,
then text, at `resolution: "high"` (`IMAGE_RESOLUTION`), because a misread digit
gives a confident wrong answer. A photo request never gets a curated answer, and
it counts against an extra per-user `IMAGE_RATE_LIMIT` (6/min).

**Timeouts: provisional, not yet measured.** A photo request uses
`IMAGE_ATTEMPT_TIMEOUT_MS` (18s) and `IMAGE_FIRST_TEXT_DEADLINE_MS` (35s) in place
of 10s/25s, since reading an image delays the first character. When this shipped,
every free key was out of quota (429) or overloaded (503), and Google held some
requests 35–155s before refusing them. So no real model answer to a photo could be
timed. **Measure first-text time on a real photo once a key works, then set these
two numbers from it.** Also try `"medium"` resolution against the same photos and
keep it if it reads them as well.

**The prompt** carries a PHOTO block in `BAC2_ANSWER_RULES` (both languages; `km`
is what is sent):
- transcribe the exercise first as the Given, so the student can check it was read right;
- name any unreadable part and ask for a clearer photo, never guess a number;
- with several exercises in one photo, solve the first and offer the rest;
- if the photo is not schoolwork, say so in one line.

**How it was verified without quota**, which is repeatable: the SDK honours
`GOOGLE_GEMINI_BASE_URL`, so a dev server started with
`GOOGLE_GEMINI_BASE_URL=http://localhost:5190 GEMINI_API_KEYS=fake` talks to a
20-line Node server that records each request body and streams back an SSE
answer (`event: step.delta` / `data: {...}`). That proved:
- the upstream body is image first, byte-identical data, `mime_type` JPEG, `resolution: "high"`,
  `store: false`, with the PHOTO rule in the system prompt;
- a follow-up re-sends the photo, and `hadImage` becomes the note;
- a PNG type, non-base64 data, wrong magic bytes, 3 photos and a 4MB body are refused (400/413).

Then real Chrome at 390 light, 320 dark and 1280, 26 checks:
- the menu with `capture="environment"` only on the camera input;
- a photo-only send, the bubble photo, and the viewer (`absolute inset-0`, not portalled);
- the thumb and `hadImage` after a reload;
- an undecodable file shows the error chip and Send stays disabled;
- the 31st photo strips the oldest thumb;
- no sideways scroll or page error, and the text field is still 152px wide at 320.

**Not verified: a real phone** (camera opening, the gallery, HEIC) or a real model
reading a photo. Both need a working key or the deployed site.

Photos of students' notebooks go to the model provider like any other message.
The free-tier data note above applies to them too.

### Paying for the model: prepaid credit plus daily limits (29 Sep 2026)

The user is moving production to ONE paid key: Google's minimum $30 prepaid
top-up. There are two layers, and they do different jobs.

1. **Google side: caps the TOTAL.** Prepaid credit with **auto top-up OFF** means
   the most that can ever be charged is what was loaded. Budgets in Cloud Billing
   only ALERT; they never stop spending, so they are an early warning and nothing
   more. The key is restricted to the Generative Language API.
2. **App side: caps the DAY**, so $30 cannot all go in one day through heavy use,
   a bug, or an abused account. `supabase/migrations/20260929000001_kruai_usage.sql`
   adds `kruai_usage` and `public.kruai_take(p_units)`, and `server/kruai-quota.ts`
   calls it. Per student it is **30 units a day** (the user's number); for the
   whole app it is **300 units a day**, a starting guess to be retuned (below). A
   text question costs 1 unit and a NEW photo costs 3 (`TEXT_UNITS`/`PHOTO_UNITS`
   in the handler). A curated answer is free and is charged nothing. At a limit,
   KruAI answers with a readable 429 ("come back tomorrow" or "KruAI is resting
   until tomorrow").

   **A follow-up costs 1, although the earlier photo travels with it** (1 Oct
   2026, a bug the user found by testing). The chat screen re-sends the latest
   photo with every follow-up so KruAI can still see it, and the charge used to
   key on "any image in the request" (`hasImage`), so every follow-up in a photo
   chat cost 3, and a guided photo exercise used up the day's 30 in about ten
   turns. The charge now keys on `newPhoto`, a photo on the LAST message (the
   question being asked). `hasImage` still drives what a re-sent photo really
   does change: the longer timeouts, `IMAGE_RATE_LIMIT` and no curated answer.
   The token log line says `photo=new|resent|no`, so what a re-sent photo
   actually costs Google can be read off the logs rather than guessed.

**Why the database and not `rate-limit.ts`.** That limiter is in memory and per
serverless instance, and its own header says a daily counter held that way resets
on every cold start. A money limit must be one number shared by every instance.

**Three decisions in `kruai_take`, each closing a real hole:**
- **The server calls it with the STUDENT'S OWN token**, so `auth.uid()` is the
  student and no secret key is needed. The catch is that any student can also
  call it directly. So the **limits are never parameters** (a parameter would let
  them choose the limit). They were constants inside the function until
  `20261002000004`; now they are read inside it from `app_settings`, a table no
  student can write, which the owner sets on `/admin/kruai`. `p_units` must be
  1–10 (no negative refunds), and a refused call **changes nothing**, so a student
  hammering at their limit cannot eat into everyone's count. The worst a student
  can do by calling it directly is spend their own 30.
- **The day is computed in SQL** as `now() at time zone 'Asia/Phnom_Penh'`, never
  sent by the client.
- **`pg_advisory_xact_lock`** serialises takes, so two questions arriving together
  cannot both read "29 of 30" and both pass.

**It FAILS CLOSED in production.** If the RPC errors (Supabase down, or
**migration not applied**, which shows PGRST202 in the log), KruAI answers 503.
That is the same stance as the auth gate: "we could not check" is not a reason to
spend. Dev warns and continues. **So this migration is REQUIRED before deploying**,
or production KruAI refuses every question.

**Known cost, accepted:** the unit is charged before the model is called, so a
question that then fails upstream (every key busy) still costs the student that
unit. A refund RPC would be callable by students too, and is not worth it.

**Tuning the whole-app number.** The handler logs one line per answer from the
`interaction.completed` event:

    [api/chat] tokens in=… out=… thought=… photo=new|resent|no model=…

Take the average cost per unit from those lines and Google's price page, then
set `app_daily ≈ dollars per day accepted / cost per unit` (about $1/day for $30
to last a month). The worst case is bounded: `max_output_tokens` is 3000 and the
prompt budgets are fixed, so a day can never cost more than
`app_daily × worst-case cost of one unit`. **Change a limit on `/admin/kruai`**
(owner only, since `20261002000004`; see "KruAI limits and pausing" in the admin
section). Nothing in the server needs to change with it.

**Production uses ONE key.** Vercel holds only `GEMINI_API_KEY` (the paid one).
`GEMINI_API_KEYS` and `_1..5` are deleted there, because mixing in free keys from
other accounts would send some students' questions to the free tier, and pooling
free accounts is the terms problem recorded earlier. `getApiKeys()` needed no
change. Local `.env.local` keeps the free keys, so development never spends the
credit. The server also reads `VITE_SUPABASE_ANON_KEY` at runtime now (as the RPC's
`apikey`); Vercel already exposes it to functions, and `vite-chat-plugin.ts`
bridges it in dev.

**Verified without money or a real login**, and the script pattern is reusable.
A Node script loads the real `handleChat` through Vite's `ssrLoadModule` and runs
two fakes in the same process:
- a fake Supabase that serves a JWKS and a `kruai_take` enforcing the same rules,
  with tokens signed ES256 by `node:crypto` (`iss` = `{url}/auth/v1`,
  `aud: authenticated`);
- the fake Gemini from the photo work, reached through `GOOGLE_GEMINI_BASE_URL`.

All 18 checks passed:
- text costs 1 and a photo 3; the curated answer costs 0 and makes no RPC call;
- the 31st unit and a 3-unit photo with only 2 left are refused, and neither is
  counted;
- the whole-app cap refuses with the resting message;
- the token line is logged;
- a missing RPC (404) or a database error (500) → 503 in production, answered in
  dev;
- no token → 401.

**The SQL itself was NOT executed here** (no local Postgres). Before applying it,
the live project answered PGRST202. After applying, check two things:
- a publishable-key-only call to `/rest/v1/rpc/kruai_take` is refused (it is
  granted to `authenticated` only);
- `npm run db:check` lists `kruai_usage`.

`server/rate-limit.ts` caps requests per IP (240/min, anti-flood) and per
verified user (20/min) before any upstream call, so a flood costs nothing. In
dev there's no proxy and everything keys to `"local"`, which is fine — it
exists to protect a deployment.

Chat answer quality is **prompt engineering, plus curriculum grounding** —
the whole content corpus fits in one system prompt, supplemented by
**MoEYS textbook excerpts (`server/textbook-search.ts`)** for Biology.
`src/utils/chat-prompt.ts` composes: persona + honesty
guardrails + `src/data/bac2-format.ts`'s `BAC2_ANSWER_RULES` (the Given → Method
→ numbered Steps → Answer → Exam tip skeleton, including comparison tables) +
`BAC2_EXAMPLES` (few-shot worked answers) + the CATALOG + the CONTEXT + the student's real profile.
`src/components/shell/math-text.tsx` includes a block Markdown table parser so
comparison matrices render as responsive, scrollable HTML tables rather than raw text.
`src/data/bac2-format.ts` is the intended drop-in point for real MoEYS past
papers — add entries to `BAC2_EXAMPLES` and flip `verified: true` once a teacher
checks them; no code change needed.

### The whole-app limit can be used up by a few accounts (6 Nov 2026)

A security audit pointed out that the whole-app limit is one shared pool: with the defaults (30 per
student, 300 for the app) about ten accounts using their own limit in full stop KruAI for every
student until midnight in Phnom Penh. Google accounts are free, so this is a cheap way to switch
KruAI off once sign-in is open to everyone.

**What was built, the user's choice:** a warning on `/admin/kruai`, in the Today card, at 50% of the
whole-app limit (yellow), 80% and used up (pink). It reads only what `admin_kruai_overview()`
already returns, so no migration. Nothing sends an email or a message (see the deferred alerts
decision); an admin sees it when they open the page.

**Not built, offered:** a smaller limit for accounts younger than a day, and counting units only
from the server. The real protection is still the owner setting the whole-app limit to match the
Gemini budget.

### The corpus goes in TWICE, at two levels of detail

This is the shape of `chat-prompt.ts` and the thing not to collapse back into
one block. It used to be one: every lesson, flashcard and practice question
pasted in full, with each authored SECTION condensed to a skeleton of labels.
**The result was a mentor that knew a section's table of contents and had never
seen a word of it** — `sectionLine()` drops every `body`, `intro` and `outro`,
which on the first authored section is ~7,000 characters of Khmer prose.

- **`buildCatalogBlock(lang, focusSubject?)` — what EXISTS.** Always sent, and
  complete in the sense that matters: every item is named, and the
  `covered`/`missing` computation runs over the WHOLE corpus. This is what backs
  "never invent a BrachNha lesson", so **it may never be derived from a search
  result** — if it were, the mentor would deny the existence of any lesson a
  given turn happened not to surface. `focusSubject` decides ORDER only, never
  membership.
- **`buildContextBlock(chunks)` — the full PROSE of a few items**, sent because
  we know they are relevant.

**Today the only source of context is the screen the student has open**, and
that is a signal with perfect precision, zero latency and no model in the loop.
`utils/chat-screen.ts`'s `screenRefFor(pathname)` is sent by `chat-overlay.tsx`
(read at SEND time, not mount — the overlay is global and survives navigation),
and `pinnedContextFor()` turns it into `RetrievedChunk[]`. Measured: on
`/sections/biology-3-1-1` the whole section arrives as 5 chunks.

**THE INVARIANT — the client may SELECT from the corpus, never SUPPLY content to
it.** Every id in a `ScreenRef` is used once as a lookup key and then discarded;
what reaches the prompt is the object the lookup found. Three guards, and each
covers a case the others cannot:

- `cleanScreen()` in `chat-handler.ts` bounds SHAPE and COST only (64-char cap
  before the lookup). It deliberately does NOT use `clean()`: that makes a
  string safe to *display*, and nothing here is ever interpolated.
- `Object.hasOwn`, never `in` and never a truthiness test — these are plain
  object literals, so `"constructor" in sections` is true and
  `sections["toString"]` is a function (`sections` is the published-section map
  the server passes in; it was `SECTION_CONTENT` in code until 7 Oct 2026).
- `isLookupKey()`, which is **not redundant with the above**: a single-element
  ARRAY stringifies to its element, so `Object.hasOwn(sections,
  ["biology-3-1-1"])` is TRUE and the next line calls `.split()` on an array.
  Measured, not theorised.

An unrecognised id is dropped silently — a stale client or a renamed route is
ordinary, and there is nothing to tell the student.

**`RetrievedChunk.pinned` exists for the layer that is not built yet.** True
means "the student has this screen open", which is certain; false is reserved
for anything less certain that adds to the same array later. Pinned chunks sort
first and are dropped last, because **a guess must never evict a fact**.

**A section's QUIZ is deliberately excluded from its chunks.** Its `correct`
field is the answer to a question on the screen the student is standing on. The
catalog still counts the questions, so the mentor knows the quiz exists — it is
just not handed the answer key. The old skeleton did this by accident;
`sectionChunks()` now does it on purpose.

**`buildContextBlock` carries a sentence that is load-bearing:** *their absence
proves nothing*. Once the model sees an "excerpts" block it starts inferring
that anything NOT quoted does not exist, and would tell students the app lacks a
lesson whenever grounding missed it. The catalog is the inventory; the excerpts
are a sample.

**`bi()` and `KM_STUB_RATIO` are DELETED (7 Oct 2026)**: the last pairs that went through
them were the 10 mock-exam questions (`MOCK_QS`), deleted that day. Every content kind in
the catalog is one language now, so there is nothing to choose between. What it did:
**`bi()` led with KHMER, and the English was the fallback.** It used to
emit `en [KH: km]` for every field — 5,999 Latin characters in a 12,595-char
block, for a mentor forbidden to reply in English (`ANSWER_LANG`). The English
is not dropped outright because some Khmer entries in `data/lessons.ts` really
were abbreviated (that file was deleted on 7 Oct 2026; `MOCK_QS` is what goes through
`bi()` now); WHICH ones was measured rather than guessed — across the 57
pairs the Khmer runs at a median **0.71× the English length**, and Khmer is
denser per character, so that is a complete rendering. Only the 15 pairs below
`KM_STUB_RATIO` (0.6) keep both. If that column is ever completed, `bi()`
collapses to `pair.km`.

Section subjects are added to the `covered` set (`id.split("-")[0]`), or a
subject whose only content is authored sections would still be announced as
having none — i.e. the model would deny the lesson the student is reading.

### THREE budgets, and they differ in KIND

Getting these confused is how the prompt breaks silently.

| constant | bounds | on exceeding |
| --- | --- | --- |
| `PROMPT_BUDGET_CHARS` (24,000) | AUTHORED content | **warns** — a human condenses a source |
| `CATALOG_BUDGET_CHARS` (11,000) | assembled catalog | **degrades** entries to their title |
| `CONTEXT_BUDGET_CHARS` (9,000) | assembled context | **drops whole chunks** from the tail |

The last two degrade silently because the CODE chose that content — warning
about it would be the code complaining about its own decision. Only the first
has anyone to tell. **If `PROMPT_BUDGET_CHARS` fires, something has been added
that neither of the other two governs.**

All three are in CHARACTERS, not an estimated token count. **Measured on
`gemini-3-flash-preview` (17 Sep 2026): Khmer is ≈ 0.45 tokens per character**,
against the ~0.25 a Latin rule of thumb (4 characters a token) assumes — so a
Latin-calibrated estimate understates a Khmer prompt by nearly 2×. (Earlier
notes here said "a token per glyph"; that was a guess, and ~2× too high.)
Characters stay the unit anyway: they are exact, they don't change when the
model or its tokenizer does, and a budget's job is to bound size, not to price
it.

`CONTEXT_BUDGET_CHARS` drops **whole chunks, never a slice**. A cut at an
arbitrary character index in Khmer lands inside an orthographic cluster (base
consonant + U+17D2 coeng + subscript + vowel) and renders as a broken glyph;
and half a worked example is worse than none.

### Measured, 13 Sep 2026 — and how to re-measure

| | before | after |
| --- | --- | --- |
| prompt on Home | 19,525 | **16,221** |
| prompt on `/sections/biology-3-1-1` | 19,525 (no prose) | **20,169** (5 chunks, full prose) |
| catalog block | 12,595 (5,999 Latin) | **9,291** (2,648 Latin) |

Re-measure by loading the real module — plain `node` cannot, because
`data/*.ts` uses `.js` specifiers that only resolve under a bundler, which is
the same reason `server/vite-chat-plugin.ts` exists:

```js
const { createServer } = await import("vite");
const s = await createServer({ server: { middlewareMode: true }, appType: "custom", configFile: false });
const m = await s.ssrLoadModule("/src/utils/chat-prompt.ts");
// ... buildSystemPrompt({ profile, context, focusSubject }).length
await s.close();   // without this the process never exits
```

### When RAG earns its place — and what was decided

The staging was deliberate: at ~29 catalog items there is nothing for retrieval
to SELECT, since a top-6 over 29 chunks is a top-6 over a list you could send
whole. The screen the student is on beats any search until they routinely ask
about content that is not in front of them.

**The trigger was "roughly 15 authored sections / 150 chunks", and the textbook
plan (17 Sep 2026) supersedes it.** That number assumed retrievable content would
be the app's own authored sections, arriving a few at a time. The user decided
instead to bring in the six Grade 12 textbooks whole (~1,200 pages), which is
past the trigger on day one — so stage 2 is being built now rather than waited
for. Stage 1 already established every interface stage 2 needs —
`RetrievedChunk`, `buildContextBlock`, `CONTEXT_BUDGET_CHARS`, the
`context = []` default and the select-never-supply invariant — so stage 2 still
changes exactly one thing: *where the non-pinned chunks come from*.

**The textbook pipeline — current status (27 Sep 2026)**:
- **Chapters 1 & 2 fully digitized**: Grade 12 Biology Chapter 1 (Plant Reproduction & Diversity, pages 1–25) and Chapter 2 (Plant Growth, Transport & Hormones, pages 26–59, 34 pages) transcribed into `sources/ocr/biology/chapter1/` and `chapter2/`.
- **Digit and OCR verification**: Verified with `scripts/ocr-check.mjs` (0 errors) and `scripts/check-digits.mjs` (0 Khmer numerals, 100% Latin digits).
- **Grounding layer**: High-yield curriculum excerpts indexed in `server/textbook-search.ts` (`searchBiologyTextbook()`), called directly from `server/chat-handler.ts` when handling biology student inquiries.
- **$0 Cost & Privacy**: Uses Google AI Studio Free Tier and hides vendor names from student copy.

1. The PDFs go in `sources/textbooks/`, which is **git-ignored** — large, and not
   ours to publish in a public repo.
2. Check whether each PDF has a text layer before scanning anything. Khmer
   extracted from a PDF text layer is often mis-ordered (legacy fonts, reordered
   vowels), so a text layer may still lose to OCR — it has to be compared, not
   assumed.
3. OCR pages via `scripts/ocr-pages.mjs` with multi-model fallback across Flash tiers
   to stay comfortably within free limits.
4. Verify transcribed texts with `scripts/ocr-check.mjs` and `npm run check:digits`.
5. Curate key concepts into `server/textbook-search.ts` under authored boundary chunks.
   Unchecked text is not fed to students.
6. Chunk on the books' OWN headings (chapter → lesson → sub-heading), the textbook
   equivalent of the authored-boundary rule below.
7. Connect and test on real Bac II exam questions with structured format.

**The Khmer spike can run BEFORE the OCR, and should.** It needs Khmer curriculum
text, not the textbooks — the published lesson sections already have some. If it fails, the
OCR is not wasted (the text can still be pinned by lesson), but the index is.

**Textbook text must only be reachable from server code.** Where the checked
text is committed is not decided yet; what is decided is that nothing the
browser bundles may value-import it. That holds today by construction — the
client reaches `chat-prompt.ts` only through `import type`, which is erased — and
one value import of a multi-megabyte corpus would put it in every student's
download. **Check the entry chunk's size after connecting it.** The
committed-file index decision below was made with this corpus size (~1,200
chunks) in mind, so it stands.

**Cost will move.** The ~0.5 cent per question estimate is for today's prompt;
excerpts add to every question that retrieves them, bounded by
`CONTEXT_BUDGET_CHARS` (9,000 chars ≈ 4,000 tokens at 0.45/char). Re-measure
once it is connected.

**The index store is a COMMITTED FILE bundled into the function, not pgvector**
(the user's call, and it reverses what the Supabase section used to assert). At
256 dims, 1,200 chunks is ~1.6MB of base64 in a `server/mentor-index.ts` module;
search is an exact dot product over a `Float32Array`, sub-millisecond, so the
only added latency is the query embedding (~120ms against the measured 2.7s to
first character). pgvector would add 40–280ms more and make mentor *quality*
silently depend on a service this whole codebase is written to tolerate the
absence of. Revisit past ~5,000 chunks, or the moment retrievable content stops
living in `src/data/`.

**Run the Khmer spike BEFORE building any of it.** `gemini-embedding-001` lists
Khmer among 100+ languages, but Khmer is low-resource and unsegmented — the same
property that forces these budgets to count characters. If embeddings cannot
separate Khmer curriculum topics, stage 2 is wasted work discovered *after*
building it; pin harder instead (the current section plus its neighbours in the
same lesson). Chunk on AUTHORED boundaries (`SectionBlock`, `Misconception`,
`PracticeCard`) and never on a length — Khmer has no whitespace to window on,
and the dictionary segmenter you would otherwise need is exactly the dependency
this repo declines.

**The chatbot is called KruAI** — one spelling in both languages, Latin script
even in Khmer copy, because it's a brand name rather than a description. It used
to be "AI Mentor" / "គ្រូ AI", which is where the name comes from (គ្រូ = kru =
teacher). `buildSystemPrompt` states the name and instructs the model to identify
as KruAI and to **never name the company, model or service behind it**, which is
the prompt-side half of the product decision recorded below; the UI-side half is
that no vendor name appears anywhere in the client bundle.

**The mentor ALWAYS answers in Khmer**, whatever language the student types in —
a deliberate product decision (students sit the Bac II in Khmer), not a bug.
This is the `ANSWER_LANG` constant in `src/utils/chat-prompt.ts`, and it drives
every language-dependent block, not just the reply instruction:
`BAC2_ANSWER_RULES`, `buildExamplesBlock` and `buildKnowledgeBlock` are all
rendered in Khmer too. That's the important part — leaving the few-shot worked
examples in English quietly pulls the model back to English however firmly the
instruction is worded, because an example outweighs a sentence.
`buildSystemPrompt` therefore takes no `lang` argument at all; the handler still
uses `lang` for its own error messages, which follow the app's UI language. The
prompt tells the model to keep notation/units/established technical terms in
Latin form (lim, ∫, H₂O, mol, pH) with a Khmer gloss on first use, rather than
invent Khmer coinages a student won't meet on the exam paper. Flip the one
constant to go back to answering in the student's chosen language.

### The KruAI greeting bubble (`fab-chat.tsx` + `lib/kruai-hint.ts`)

Asked for (29 Sep 2026) because new students could not tell what the FAB was.
The bubble renders beside the FAB, sharing its `offset` classes, and uses the
user's own wording in Khmer. Three decisions:

- **Stops once found, else after `MAX_SHOWS` (3) visits.** "Found" is tapping
  the FAB or the bubble, or the ×. Ignoring it for 10s (`HINT_VISIBLE_MS`) is
  not "found", so it returns next visit, but never more than three times.
- **A device fact in `localStorage["brachnha-kruai-hint"]`, not a store field**,
  for the reasons `lib/intro-seen.ts` gives. A module-level `shownThisLoad`
  stops a FabChat remount (chat open/close, an assessment) greeting twice.
- **The FAB is NOT faded while the bubble is up.** On Home it lands over a
  lesson row at first paint, where `findControlUnder` fades it; the bubble
  would then point at a see-through button on the exact screen new students
  arrive at. The fade returns when the bubble goes.

## The LaTeX rules reached Gemini garbled — FIXED (17 Sep 2026)

This section used to be "Known bug, NOT yet fixed". It was fixed, with the
answer-quality re-test it asked for, and two things came out of that test that
the original note did not predict.

**The bug was worse than recorded.** `BAC2_ANSWER_RULES` is a template literal
and its KaTeX command list used single backslashes. Loading the module and
`JSON.stringify`-ing the string showed **zero real backslashes and nine control
characters per language**: `\f` a form feed, `\r` (`\right`) a carriage return,
`\t` (`\theta`, `\to`, `\times`, `\text`) a tab, `\b` (`\beta`, `\begin`) a
backspace, and `\ne` a LINE BREAK followed by "e". The worked examples were
already double-escaped, so the note's "and in the worked examples" was wrong —
only lines in the two rules blocks needed it. `bac2-format.ts` now carries a
header comment so the doubled backslashes are not "tidied" back.

**It was doing measurable damage, in exactly one place.** The corrupted
chemistry rule taught `$mathrm{H_2O}$`. Asked to balance CH₄ combustion, three
runs against the broken prompt wrote **15, 23 and 20** formulas opening
`$mathrm{…}$` — KaTeX accepts that and renders the italic letters "mathrmCH4",
so nothing ever errored. After the fix: **0, 0, 0**. Trig, limit and domain
questions were clean both before and after; the model's own LaTeX knowledge
wins everywhere the prompt is not copied verbatim.

**The fix exposed a SECOND rendering failure: padded dollars.** With real
backslashes in the rules, the model started writing `$ \mathrm{CH_4} $`, and
`splitMath` refuses whitespace-hugged inline math — 5 of 6 chemistry answers
showed raw source (30 stray `$` in one reply). **A prompt rule did not fix it**:
an explicit "no space inside the dollars" rule, in both languages, left 3 of 3
answers padded, so it was REMOVED rather than left costing prompt budget on
every request. (A negative example also shows the model the very pattern it
forbids.)

**The fix is in the renderer: `looksLikeMath` forgives padding around
unmistakable TeX.** Padded inline math is accepted only if it contains a
backslash command, `^`, `_` or a brace (`TEX_MARKER` in `utils/math-render.ts`).
That keeps the original guard — "costs $ and $x^2$" still refuses to pair
" and " — and was checked against 12 cases including prose dollars, Khmer
inside dollars, an unclosed stream fragment and a newline-spanning span.
Re-scoring the saved answers took stray dollars from 30/10/28/6/30 to 4/0/2/0/2.

**A THIRD failure, found by the user the same day: Khmer inside `\text{}`.** An
answer ended `$\mathrm{Au} + \mathrm{H_2O} \to \text{គ្មានប្រតិកម្ម}$` ("no
reaction"), although the rules forbid it. The Khmer guard refused the whole
formula, so the student saw raw LaTeX. `liftKhmerText()` in
`utils/math-render.ts` now splits such a formula instead: the math either side is
typeset and the Khmer becomes an ordinary text segment in the Khmer font, so
KaTeX still never receives a Khmer glyph. It covers `\text`, `\textrm`,
`\mathrm` and `\mbox` at brace depth 0 only, and returns null — the old safe
behaviour — for bare Khmer in math (prose dollars look exactly like that), a
text command nested in a group (`\frac{\text{…}}{2}` would unbalance braces), an
argument holding `\` or `$`, or inline math spanning a newline. Pieces from a
`$$…$$` block are emitted INLINE: formula-then-words on one line reads better
than a display block with its words stranded underneath. Checked offline, no
API calls, on 15 cases including every earlier guard: 0 KaTeX errors, 0 math
segments containing Khmer.

**A FOURTH failure (2 Oct 2026): a Khmer label on an ARROW.** The model writes a reaction
condition over the arrow, `\xrightarrow{\text{ពន្លឺព្រះអាទិត្យ}}` ("sunlight"). That `\text`
sits inside the arrow's group, which `liftKhmerText` refuses by design, so the whole equation
showed as raw LaTeX.

`moveArrowLabelsOut()` in `utils/math-render.ts` now runs first inside `liftKhmerText`:
- It covers the `\x…` arrows (with the optional `[below]` label) and
  `\overset` / `\underset` / `\stackrel`.
- A label holding Khmer comes off the arrow and is re-emitted right after it as a top-level
  `\text{(…)}`. So `A \xrightarrow{\text{ក}} B` becomes `A \xrightarrow{} \text{(ក)} B`, and
  the ordinary lift splits it.
- The student sees "6CO₂ + 6H₂O ⟶ (ពន្លឺព្រះអាទិត្យ) C₆H₁₂O₆ + 6O₂", and KaTeX still never
  receives a Khmer glyph.
- A Latin label, a label with a command in it, and an arrow nested in another group are all
  left exactly as before.

**Checked on 13 cases**, every math piece typeset with `throwOnError`, with the earlier guard
cases unchanged. Then in real Chrome at 390 light and 320 dark: no raw LaTeX, no KaTeX error,
no sideways scroll.

**Deliberately left: padded plain arithmetic** (`$ 2 + 2 $`) still shows raw.
Accepting `+` or `=` as a TeX marker would start typesetting dollar AMOUNTS in
prose ("$5 + $3"). The rules already tell the model not to wrap bare numbers, and
a stray `$ 2 $` is a far smaller failure than eating a sentence.

**How it was measured, so it can be repeated:** answers came from the real
`handleChat` via `ssrLoadModule` (no Supabase URL, so dev-mode verification is
skipped), and were scored with the app's own path — `splitMath`, then
`katex.renderToString` with `throwOnError`. Count bare command names inside math
segments (`mathrm`, `frac`, `theta`… with no backslash) and `$` left in text
segments. **Eyeballing is not enough**: the broken output rendered without a
single error.

Other standing lint warning: `src/components/ui/button.tsx`
`only-export-components` (the shadcn `buttonVariants` export). Cosmetic,
fast-refresh only. It is now the ONLY warning oxlint reports.

### The KruAI test set: `npm run eval:kruai` (3 Nov 2026)

35 questions (39 model calls) through the real `handleChat` and the real model, each reply
checked against what a good answer must do, so a change to the prompt or the model is
measured rather than guessed at. Files are in `scripts/kruai-eval/`: `cases.mjs` (the
questions and answer keys), `checks.mjs` (the rules, pure) and `run.mjs`.

- **`--self-test` needs no model and no quota.** It proves each check catches what it claims
  to, that a right answer's first digit cannot pass a wrong one, and that every case is well
  formed. **`--quick`** is 18 calls. `--only` and `--tag` narrow it, and `--delay` spaces the
  calls (13000 suits the free tier).
- **FREE KEYS ONLY.** It reads GEMINI_API_KEYS from .env.local and clears every other Gemini
  key, so a run cannot spend the prepaid credit.
- **Sign-in is skipped the dev way:** no Supabase address during a question, set only while
  the real content module fills its 10-minute copy, so the prompt still carries the published
  decks and sections.
- **The maths keys are the 2025 paper's, also worked by hand.** A failed `correct-answer` is
  worth checking against the paper before blaming the model.
- **Results go to `results/`, git-ignored.** `latest.md` holds every reply for a person to
  read, because no script can judge whether the Khmer reads well or the reasoning is sound.
  Each run compares itself with the last one.

**What it found, and what became of it (3 Nov 2026).** First run 13 of 15; full run after the
fixes 33 of 35.

- **An answer could be silently cut off (1 in 17 calls). FIXED.** The stream ended with no
  error and no `interaction.completed`, and the handler closed it as if finished, so a student
  read half a solution with no warning. `finished` now tracks that event, and an `incomplete`
  status counts as unfinished too. Every mid-answer failure ends in one line, `CUT_OFF_NOTE`
  (`data/kruai-phrases.ts`), and `chat-overlay.tsx` looks for it at the end of a reply and marks
  the bubble `failed: "retry"`: the status went out with the first word, so nothing else can
  carry the signal. The words stay on screen, Try again replaces them, and they never reach the
  model. **If Google ever stopped sending that event, every answer would get the note**: the
  `[api/chat] the stream ended` log line is what would show it.
- **Khmer numerals in replies. FIXED BY THE SERVER**, `latinDigits()` on every chunk. One digit
  at a time is safe across chunk boundaries. The prompt's rule stays, but it only made it likely.
- **Long solutions after guiding. FIXED BY THE SERVER**, `SHORT_FORM_NOTE`, added when "show full
  solution" follows a guided reply. The rule and an example alone failed 2 of 2. **There are two
  button phrases** (`SHOW_SOLUTION_KM` and `_EN`), and the first fix only knew the Khmer one.
- **A wrong answer called "almost right". FIXED.** The prompt's own example opened with
  ជិតត្រូវហើយ, and the model copied it: an example outweighs a rule. The example says
  ត្រូវមួយផ្នែកហើយ now, and a rule forbids it. The case forbids that word too.
- **Khmer inside a wrapped equation showed as raw LaTeX. FIXED IN THE RENDERER.**
  `\mathrm{6CO_2 + ពន្លឺ \to …}` failed `liftKhmerText`, which refused any argument holding a
  backslash. `splitAtKhmer()` cuts it at the Khmer and re-wraps each maths piece. Khmer in a group
  (`\frac{ខ្មែរ}{2}`) is still refused, and KaTeX still never receives a Khmer glyph.
- **A wrong answer on a real exam question. NOT FIXED, and no prompt can fix it.** The limit in
  `math-limit-trig` came back as $-\frac{1}{2}$ once (a sign error rewriting the denominator)
  and $\frac{1}{2}$ on the next 5 tries: 1 wrong in 6. `thinking_level` is `"minimal"` on purpose
  (2.7s to first character against 11.2s on `"low"`). Raising it is the only lever left, a
  speed and cost trade for the user to make. Re-measure with this test before deciding.

**The test run's own quirk:** the first case of a run can read "0 decks" if the 3s content fetch
times out, as it did once with other work running. It retries a minute later.

**Verified, besides the runs above:** 23 checks of the real handler against a fake model (each
way a stream can end, digits split across chunks, both button phrases); 45 browser checks of the
chat screen at 390, 320 dark and 1280 (Try again, nothing sent back, no doubled question); 84
`splitMath` checks including every earlier guard and all 62 saved replies; the failed table drawn
by the real chat at 390 and 320 dark. **The helpline question is open:** a self-harm reply points
to a parent, teacher or trusted adult and names no helpline, because no number has been supplied.

## Production uses only GEMINI_API_KEY, enforced in code (5 Nov 2026)

`resolveApiKeys` (`server/gemini-keys.ts`) takes the first key in `GEMINI_API_KEY` on Vercel or under
`NODE_ENV=production`, and ignores `GEMINI_API_KEYS` and `_1..5`. "Production uses ONE key" above used to be a rule
someone had to keep by deleting keys. A leftover free key would have sent some students' questions to the free tier with
nothing to show for it. **The code cannot tell the key is paid: `GEMINI_API_KEY` must hold the paid one.** With none set,
KruAI answers 503 rather than touching a free key. Computers keep the whole pool, so testing never spends the credit.

**Verified:** `tests/server/gemini-keys.test.mjs`, and the real `handleChat` against a fake model with six leftover keys
set: 10 questions all used the paid key, and a paid key answering 429 never fell back to a free one. **Not verified:** the
live site, since the key check sits behind sign-in. **Noticed, not changed:** one question with the only key out of quota
made 19 calls to the fake model before giving up, because the SDK retries inside each of the 6 attempts.

### The body is counted as it arrives (6 Nov 2026)

`handleChat` used to `await req.text()` and measure the string afterwards, so a chunked request with no
`content-length` was read whole into memory, up to Vercel's own 100 MB, before any sign-in check. It now
reads the stream itself (`readBodyCapped`), counts BYTES and cancels the rest at `MAX_BODY_BYTES`. The cap
was in UTF-16 characters before; in bytes, Khmer text costs 3 per letter, which still leaves several times
the 40 longest messages the composer can send. `tests/server/chat-body.test.mjs`, in `npm test`, runs the
real handler: the old code never returned on an endless body. **The production key is on a paid Google
project** (the user confirmed, 6 Nov 2026), which is what the privacy page's wording relies on. The page now
also says that a photo attached to a question is sent, in both languages; it had left photos out.

## KruAI is switched off, and the corner button is Feedback (6 Nov 2026)

**The user's decision:** they do not want to pay for the model yet. One constant, `KRUAI_ENABLED` in
`src/data/kruai-switch.ts`, is read in three places:

- **`server/chat-handler.ts`** answers 503 ("KruAI is turned off for now") right after the cheap shape
  checks, before the rate limit, the sign-in check, the quota and any call to Google. So nothing is spent
  even by a request that skips the app. `tests/server/chat-body.test.mjs` checks it while the switch is off.
- **`components/shell/app-shell.tsx`** renders `FeedbackFab` instead of `FabChat`, and will not mount
  `ChatOverlay` at all. The KruAI button was the only way into the chat, and its greeting bubble
  (`lib/kruai-hint.ts`) lived on it, so both are gone with it.
- **`features/login/components/login-view.tsx`** uses `createAccountSubtitleNoKruai`, since the sign-up
  subtitle promised an AI coach. The other KruAI sign-in lines (`loginRequiredChat`) are only reachable
  from the KruAI button.

**Feedback** (`components/shell/feedback-fab.tsx`) is a plain link to `https://t.me/Captain_Alexandros`, the
user's own choice over a form in the app, for guests and signed-in students alike. Same place, size and
colour as the KruAI button: `hooks/use-fab-placement.ts` now holds the resting offset and the fade over
another control for both. The app collects nothing; a student writes to the team in Telegram. A username,
never the phone number the user also gave. Hidden where the KruAI button was hidden (assessments).
`tests/e2e/feedback.test.mjs` checks it for a guest and a student, and expects to fail once KruAI is back.

**Switching back on** is `true` in that file. Conversations, limits, Admin → KruAI and the prompt are all
untouched. Then delete `tests/e2e/feedback.test.mjs` (or keep Feedback elsewhere) and re-run
`npm run eval:kruai`. While off, the privacy page stays true: it describes what is sent when a student
asks KruAI, and nobody can.

**Feedback explains first (6 Nov 2026, the user's request).** A tap opens a short pop-up (what to send,
which page, a screenshot helps, `Telegram: @Captain_Alexandros`) with **Open Telegram** inside it, every
time, and Not now / a tap outside / Escape to close. Same absolute-inset shape as the install pop-up. On Home
the button usually rests over a lesson row at first paint, so it fades click-through until the student
scrolls (`useFabPlacement`), which is why its test opens on the Leaderboard, whose gutter leaves it clear.

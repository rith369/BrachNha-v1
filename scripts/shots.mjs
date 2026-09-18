// Responsive screenshot + overflow harness.
//
// Dev tooling, not shipped: it lives outside src/ so it never enters the bundle,
// and it uses playwright-core driving the Chrome already installed on this
// machine (no browser download).
//
//   node scripts/shots.mjs [--out DIR] [--url http://localhost:5173] [--only home,progress]
//
// Two jobs:
//   1. Assert no horizontal overflow at every route x viewport. The app shell is
//      overflow-hidden, so overflow CLIPS silently instead of scrolling — you
//      cannot catch it by eye, only by measuring scrollWidth.
//   2. Write a PNG per route x viewport so the layout can actually be looked at.

import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};

const BASE = argOf("--url", "http://localhost:5173");
const OUT = argOf("--out", "./shots");
const ONLY = argOf("--only", "");

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

// The 9 widths from the spec. Heights are realistic for each class of device so
// vertical rhythm is judged fairly rather than against one arbitrary height.
const VIEWPORTS = [
  { name: "320", width: 320, height: 800 },
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

// `clicks` drives the page into a state a bare URL can't reach. The focus-mode
// screens need this: /exam renders its intro until something presses Start, so
// without a click the harness would never once photograph the screen this change
// is actually about.
const ROUTES = [
  { name: "home", path: "/" },
  { name: "lessons", path: "/lessons" },
  { name: "lesson-detail", path: "/lessons/math-limits" },
  { name: "subject-path", path: "/subjects/biology" },
  { name: "section-detail", path: "/sections/biology-3-1-1" },
  { name: "practice", path: "/practice" },
  { name: "practice-subject", path: "/practice/flashcards/biology" },
  // The Mimo-style quiz path: math is the longest one (8 lessons x 6
  // sections), so it is the route that proves the per-lesson banners and
  // the zigzag trail hold at the 320px floor.
  { name: "practice-quiz-path", path: "/practice/quiz/math" },
  // The first authored quiz. KaTeX renders formulas as inline-block with
  // no wrapping, so a long option like the limits-at-infinity one is
  // exactly the shape of thing that widens a page at 320px — this route is
  // here to measure that, not just to look at it.
  { name: "focus-practice-quiz", path: "/practice/quiz/math/1-1-1" },
  // /exam is the Subject Mock Exams / Bac II Simulation chooser; the two tabs
  // live one level down and land on the past-papers one.
  { name: "exam", path: "/exam" },
  { name: "exam-subjects", path: "/exam/subjects" },
  { name: "progress", path: "/progress" },
  { name: "game", path: "/game" },
  { name: "grade-prediction", path: "/grade-prediction" },
  { name: "leaderboard", path: "/leaderboard" },
  { name: "roadmap", path: "/roadmap" },
  { name: "streak", path: "/streak" },
  { name: "streak-friends", path: "/streak/friends" },
  { name: "profile", path: "/profile" },
  // Tab B of /exam/subjects. Ordinary navigation is still on screen here — this is
  // NOT a focus route; only the running exam below is.
  {
    name: "exam-generated",
    path: "/exam/subjects",
    clicks: ['button:has-text("វិញ្ញាសារបង្កើតថ្មី")'],
  },
  // The streak page after its one interaction. Worth photographing separately
  // because the celebration is the only state where the confetti layer exists,
  // and a burst of absolutely-positioned particles is exactly the shape of
  // thing that widens a page — the probe below is what proves it does not.
  // Seeded lang is "en", so the English label is the right selector.
  {
    name: "streak-complete",
    path: "/streak",
    clicks: ["button:has-text(\"Complete Today's Goal\")"],
  },

  // ── focus mode: nav must be gone on all of these ──
  // Scoped to `button:has-text`, NOT a bare `text=`: on the lesson intro the
  // title and the CTA share the same words, and a bare text selector picks the
  // heading (a div), so the click silently does nothing and the shot is of the
  // intro screen.
  {
    name: "focus-lesson-content",
    path: "/lessons/math-limits",
    clicks: ['button:has-text("Start Learning")'],
  },
  // The 2025 English paper's own screen: what the paper is, and its history.
  // A real route, so no click chain — tapping its card on /exam/subjects lands
  // exactly here rather than starting the exam.
  { name: "exam-paper", path: "/exam/subjects/2025-english" },
  // The maths paper: the only screen in the app that typesets LaTeX outside the
  // mentor, so it is the one that proves KaTeX renders inside the exam chunk.
  { name: "exam-paper-math", path: "/exam/subjects/2025-math" },
  // The same paper being SAT — the only route that photographs the gap-fill
  // step. Start from the detail screen, then one more click past the part-one
  // intro onto the passage itself.
  {
    name: "focus-exam-english",
    path: "/exam/subjects/2025-english",
    clicks: [
      'button:has-text("ចាប់ផ្តើមប្រឡង")',
      'button:has-text("បន្ត")',
    ],
  },
  // Tab B's math card specifically: GENERATED_EXAM_QUESTIONS derives from the
  // old MOCK_QS test, so math (and biology) are the only two subjects with
  // guaranteed content to click into — see data/generated-exams.ts. Tab B still
  // runs its papers in place, so this is a two-click chain from the tab list.
  {
    name: "focus-exam",
    path: "/exam/subjects",
    clicks: [
      'button:has-text("វិញ្ញាសារបង្កើតថ្មី")',
      'button:has-text("វិញ្ញាសារគណិតវិទ្យា")',
    ],
  },
  // The competition create form, and then the run itself. /game/create is a
  // real route, so the form needs no click chain; the run needs one click.
  // Requires the Supabase vars to be BLANKED, or hasFullAccess is false and both
  // photograph the locked panel instead — which is the documented command anyway.
  { name: "focus-game-create", path: "/game/create" },
  {
    name: "focus-game-run",
    path: "/game/create",
    // The seed sets lang "en", and the Game feature is bilingual, so this
    // selector is the ENGLISH label. A Khmer one silently never matches and the
    // shot quietly becomes the create form again.
    clicks: ['button:has-text("Start playing")'],
  },
  // The review a finished competition leaves behind: both sides' picks, and the
  // slots for the photographed working. The seeded ATTEMPT is used rather than
  // the seeded competition because it is the richer of the two — it has an
  // opponent to compare against. With the Supabase vars blanked the photo
  // sections render nothing at all (by design, see work-photo.tsx), so this is a
  // layout check on the answer list.
  { name: "focus-game-review", path: "/game/review/seed-comp-2" },
  { name: "focus-placement", path: "/placement-test/math" },
];

// Five questions shared by the seeded competition and the seeded attempt, so
// /game/review has real prompts and options to lay out. The text is deliberately
// plain arithmetic rather than anything from src/data — the harness must not
// depend on authored content it does not own.
const SEED_QUESTIONS = [
  { q: { en: "Solve 3x - 4 = 2", km: "ដោះស្រាយ 3x - 4 = 2" }, correct: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 6"] },
  { q: { en: "What is 4 x 3?", km: "4 x 3 ស្មើប៉ុន្មាន?" }, correct: "12", options: ["7", "10", "12", "14"] },
  { q: { en: "What is the value of sin(0)?", km: "sin(0) មានតម្លៃប៉ុន្មាន?" }, correct: "0", options: ["0", "1", "-1", "8"] },
  { q: { en: "A line through the origin with slope 3", km: "បន្ទាត់កាត់គល់ មានជម្រាល 3" }, correct: "y = 3x", options: ["y = 3x", "y = x + 3", "y = 3", "x = 3y"] },
  { q: { en: "How many sides does a square have?", km: "ការ៉េមានប៉ុន្មានជ្រុង?" }, correct: "4", options: ["3", "4", "5", "6"] },
];

// A local-calendar day key `offset` days from today — the same rule as
// src/utils/day.ts's todayKey(), and never toISOString(), which is UTC.
function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// A study history, so Profile's calendar photographs filled in rather than
// empty. A 12-day run of GOAL days ending yesterday, plus three older days —
// two where the student studied without finishing the goal, so the faint
// "studied" mark is photographed too. Today shows its "not yet" ring and the
// nudge, the everyday state. The seeded `streak` below is what this log
// derives to; AppShell's rollover recomputes it on load anyway (tasksDate "").
// What the studying was OF, the twin of seededActivity above. Without this
// /progress photographs seven "Not started yet" rows and two empty charts —
// technically correct for a student who has done nothing, and useless as a
// screenshot of the page this seed exists to show. Two subjects with real work
// and the rest untouched is the honest mix: it captures the populated row, the
// not-started row and a subject below the trend's minimum sample all at once.
const seededContent = Object.fromEntries(
  Array.from({ length: 40 }, (_, i) => i)
    .filter((i) => i % 3 !== 2)
    .map((i) => [
      dayKey(-i),
      {
        [i % 2 === 0 ? "biology-1-1" : "math"]: {
          answered: 2 + (i % 4),
          correct: Math.max(0, 2 + (i % 4) - (i % 3)),
          reviewed: i % 2,
          sessions: 1,
        },
        ...(i % 5 === 0
          ? { "chemistry-2-1": { answered: 3, correct: 1, reviewed: 0, sessions: 1 } }
          : {}),
      },
    ])
);

const seededActivity = Object.fromEntries([
  // `minutes` is what the Study Time tile and the chart's Study Minutes series
  // read; without it both photograph at zero and the toggle looks broken.
  ...Array.from({ length: 12 }, (_, i) => [
    dayKey(-(i + 1)),
    { xp: 80 + i * 5, goal: true, minutes: 18 + i * 3 },
  ]),
  [dayKey(-20), { xp: 24, goal: false }],
  [dayKey(-21), { xp: 40, goal: false }],
  [dayKey(-25), { xp: 90, goal: true }],
]);

// Without this every route renders LoginView. Shape mirrors partializeState in
// src/lib/store.ts; the `version` below matches the store's current schema so
// `migrate` leaves the theme, the streak and the activity log alone.
const seeded = (theme) => ({
  state: {
    lang: "en",
    userName: "Panharith",
    userEmail: "",
    userAge: "",
    userLocation: "",
    userLanguage: "english",
    surveyed: true,
    userData: {
      strengths: ["math"],
      weaknesses: ["math", "biology"],
      grade: "A",
      studied: false,
      // No `months` — the timeline is derived from the fixed exam date now
      // (src/utils/exam-date.ts), not stored per student.
    },
    pendingPlacementTests: [],
    commitment: null,
    // true so /roadmap is an ordinary page: ShellLayout hides all chrome there
    // while the pledge is unseen, which would make the nav screenshots useless.
    pledgeSeen: true,
    xp: 120,
    level: 2,
    coins: 30,
    streak: 12,
    activityLog: seededActivity,
    contentLog: seededContent,
    tasks: { lesson: false, practice: false, flashcards: false, challenge: false },
    // The day `tasks` describes. "" means nothing has been completed yet, so
    // AppShell's rollover stamps today and leaves the (already empty) checklist
    // alone — no screenshot shows a reset that just happened.
    tasksDate: "",
    // Two this month and one last, so the hero shows a real average AND the
    // "vs last month" line — which is absent, by design, with fewer.
    examResults: [
      { score: 8, total: 10, pct: 80, date: new Date(new Date().setDate(3)).toISOString(), subject: "math" },
      { score: 7, total: 10, pct: 70, date: new Date(new Date().setDate(6)).toISOString(), subject: "biology" },
      { score: 6, total: 10, pct: 60, date: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1, 12); return d.toISOString(); })() },
    ],
    // One posted competition and one played attempt, so /game photographs the
    // cards a real student sees rather than the hero alone. Both are hidden when
    // empty (see pages/game.tsx), which is exactly why the seed has to carry
    // them: the seed mirrors partializeState, and a new field that GATES what a
    // page renders has to be added here or the screenshots quietly become of a
    // different screen.
    competitions: [
      {
        id: "seed-comp-1",
        creatorId: "seed-user",
        creatorName: "Panharith",
        subject: "math",
        difficulty: "mix",
        minutes: 5,
        // REAL-LOOKING QUESTIONS, not empty stand-ins. /game renders only the
        // COUNT, but /game/review renders the prompts and every option — so the
        // blanks that were fine here until the review existed would photograph
        // five empty cards and prove nothing about how the screen wraps.
        questions: SEED_QUESTIONS,
        creatorAnswers: ["x = 2", "12", "0", "y = 3x", "4"],
        creatorScore: 4,
        creatorMs: 96_000,
        total: 5,
        createdAt: new Date().toISOString(),
        // SHARED, so My Competitions renders its Invite button and the harness
        // photographs the control rather than the row without it. Absent here,
        // the row correctly hides the button and the new layout goes unchecked.
        sharedAt: new Date().toISOString(),
      },
    ],
    competitionAttempts: [
      {
        id: "seed-att-1",
        competitionId: "seed-comp-2",
        userId: "seed-user",
        userName: "Panharith",
        score: 4,
        ms: 88_000,
        // The review's three frozen fields — see types/index.ts. Without them
        // /game/review says the match predates answer recording, which is a
        // true sentence and a useless screenshot.
        questions: SEED_QUESTIONS,
        answers: ["x = 2", "12", "8", "y = 3x", "4"],
        opponentAnswers: ["x = 2", "10", "0", "y = 3x", null],
        opponentName: "Sokha",
        opponentScore: 3,
        opponentMs: 91_000,
        subject: "biology",
        total: 5,
        playedAt: new Date().toISOString(),
      },
    ],
    completedSessions: [],
    theme,
    conversations: [],
    activeConversationId: null,
  },
  version: 4,
});

/**
 * Elements wider than their own box. Skips anything deliberately scrollable
 * (the tab strips use overflow-x-auto) and anything invisible.
 */
const OVERFLOW_PROBE = () => {
  const bad = [];
  const docWidth = document.documentElement.clientWidth;

  const isScrollable = (el) => {
    const o = getComputedStyle(el).overflowX;
    return o === "auto" || o === "scroll";
  };
  // A child of a horizontal carousel is SUPPOSED to sit past the viewport edge
  // (see AiInsights' overflow-x-auto row), so those are not overflow bugs.
  const insideScroller = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (isScrollable(p)) return true;
    }
    return false;
  };

  for (const el of document.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const scrollable = isScrollable(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    // `truncate` is overflow-hidden + nowrap + ellipsis: scrollWidth exceeding
    // clientWidth is exactly how the ellipsis is produced, not a bug.
    const truncating =
      style.textOverflow === "ellipsis" ||
      (style.whiteSpace === "nowrap" && style.overflowX === "hidden");

    // Content wider than the element, where the element cannot scroll.
    // Tolerance is 3px, not 1: sub-pixel text metrics routinely put scrollWidth
    // a hair over clientWidth with nothing actually clipped. This is the SOFT
    // signal — a deliberate full-bleed child (negative margin, e.g. AiInsights'
    // -mx-4 carousel) legitimately trips it without anything being wrong, so it
    // is reported for review rather than treated as a failure.
    if (!scrollable && !truncating && el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
      bad.push({
        soft: true,
        why: "content wider than element",
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 90),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      });
    }
    // Element sticking out past the right edge of the viewport.
    if (rect.right > docWidth + 1 && !insideScroller(el)) {
      bad.push({
        why: "past right edge",
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 90),
        right: Math.round(rect.right),
        docWidth,
      });
    }
  }
  return {
    docOverflow: document.documentElement.scrollWidth > docWidth + 1,
    docScrollWidth: document.documentElement.scrollWidth,
    docWidth,
    offenders: bad.slice(0, 12),
  };
};

async function main() {
  const fs = await import("node:fs");
  const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!exe) {
    console.error("No Chrome/Edge found. Looked in:\n  " + CHROME_CANDIDATES.join("\n  "));
    process.exit(1);
  }
  console.log("browser:", exe);

  const routes = ONLY
    ? ROUTES.filter((r) => ONLY.split(",").includes(r.name))
    : ROUTES;

  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe });

  const problems = [];
  let shots = 0;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      // Anything under 768 is a touch device; this also makes hover-only styles
      // behave the way they would on a real phone.
      hasTouch: vp.width < 768,
      isMobile: vp.width < 768,
    });
    await ctx.addInitScript((payload) => {
      localStorage.setItem("brachnha", JSON.stringify(payload));
    }, seeded("light"));

    const page = await ctx.newPage();

    for (const route of routes) {
      const url = BASE + route.path;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
      } catch {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      }
      // Charts and fonts settle a beat after paint.
      await page.waitForTimeout(700);

      for (const sel of route.clicks ?? []) {
        try {
          await page.locator(sel).first().click({ timeout: 4000 });
          await page.waitForTimeout(400);
        } catch {
          console.log(`  ! ${route.name} @ ${vp.name}: could not click ${sel}`);
        }
      }

      const probe = await page.evaluate(OVERFLOW_PROBE);
      if (probe.docOverflow || probe.offenders.length) {
        problems.push({ route: route.name, viewport: vp.name, ...probe });
      }

      const file = path.join(OUT, `${route.name}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      shots++;
    }

    await ctx.close();
  }

  await browser.close();

  await writeFile(
    path.join(OUT, "_overflow.json"),
    JSON.stringify(problems, null, 2)
  );

  console.log(`\n${shots} screenshots -> ${OUT}`);

  // HARD = something a user would actually see: the page scrolls sideways, or an
  // element juts past the viewport edge without a scrollable ancestor.
  // SOFT = an element measures wider than its own box, which a deliberate
  // full-bleed child also does. Only HARD is a failure.
  const hard = problems.filter(
    (p) => p.docOverflow || p.offenders.some((o) => !o.soft)
  );
  const soft = problems.filter((p) => !hard.includes(p));

  if (!hard.length) {
    console.log("OVERFLOW (hard): none — no page scrolls sideways at any width.");
  } else {
    console.log(`OVERFLOW (hard): ${hard.length} combos — these are real:\n`);
    for (const p of hard) {
      console.log(`  ${p.route} @ ${p.viewport}px  doc ${p.docScrollWidth}/${p.docWidth}`);
      for (const o of p.offenders.filter((x) => !x.soft).slice(0, 4)) {
        console.log(`      ${o.why}: <${o.tag}> right ${o.right}/${o.docWidth}  ${o.cls}`);
      }
    }
  }

  if (soft.length) {
    console.log(
      `\nsoft (review only, usually intentional full-bleed): ${soft
        .map((p) => `${p.route}@${p.viewport}`)
        .join(", ")}`
    );
  }
  process.exitCode = hard.length ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

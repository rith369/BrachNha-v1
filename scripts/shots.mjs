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
  // /exam now has two tabs and lands on the past-papers one.
  { name: "practice", path: "/practice" },
  { name: "practice-subject", path: "/practice/flashcards/biology" },
  { name: "exam", path: "/exam" },
  { name: "progress", path: "/progress" },
  { name: "game", path: "/game" },
  { name: "grade-prediction", path: "/grade-prediction" },
  { name: "leaderboard", path: "/leaderboard" },
  { name: "roadmap", path: "/roadmap" },
  { name: "profile", path: "/profile" },
  // Tab B of /exam. Ordinary navigation is still on screen here — this is
  // NOT a focus route; only the running exam below is.
  {
    name: "exam-generated",
    path: "/exam",
    clicks: ['button:has-text("វិញ្ញាសារបង្កើតថ្មី")'],
  },

  // ── focus mode: nav must be gone on all of these ──
  // Scoped to `button:has-text`, NOT a bare `text=`: both screens show their
  // title and their CTA with the same words, and a bare text selector picks the
  // heading (a div), so the click silently does nothing and the shot is of the
  // intro screen. Still true now that the exam CTA is Khmer: the generated-exam
  // card renders the same words as a heading div AND as the button.
  {
    name: "focus-lesson-content",
    path: "/lessons/math-limits",
    clicks: ['button:has-text("Start Learning")'],
  },
  {
    name: "focus-exam",
    path: "/exam",
    clicks: ['button:has-text("វិញ្ញាសារបង្កើតថ្មី")', 'button:has-text("ចាប់ផ្តើមប្រឡង")'],
  },
  { name: "focus-placement", path: "/placement-test/math" },
];

// Without this every route renders LoginView. Shape mirrors partializeState in
// src/lib/store.ts; version 2 matches the store's current schema so `migrate`
// leaves the theme alone.
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
    streak: 3,
    tasks: { lesson: false, practice: false, flashcards: false, challenge: false },
    examResults: [],
    completedSessions: [],
    theme,
    conversations: [],
    activeConversationId: null,
  },
  version: 2,
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

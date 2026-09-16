import { useEffect } from "react";
import { useLocation } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { isStudyRoute } from "@/utils/focus-routes";

/**
 * ACTIVE study minutes — the one metric in this app that has to be defended
 * rather than merely computed.
 *
 * `daily_activity.study_minutes` has sat in the schema since day one carrying
 * an instruction in its own migration comment: it "must mean ACTIVE minutes
 * when it is finally populated. Counting 'app was open' would make leaving a
 * phone unlocked a winning strategy, which is the exact thing the leaderboard
 * is built to argue against." This is that implementation, and every constant
 * below is a defence of that sentence.
 *
 * ── THE TRADE, stated plainly ───────────────────────────────────────────────
 *
 * This is CLIENT-SIDE and therefore DEFEATABLE. A student who wants a bigger
 * number can leave a lesson open and jiggle a thumb every two minutes. That is
 * fine for a private figure on their own Progress card, which is the only place
 * it is shown today.
 *
 * IT IS NOT FINE FOR RANKING STUDENTS. If the leaderboard ever adopts this, it
 * needs a server-side sanity cap — `study_minutes <=` the wall-clock minutes
 * between the day's first and last write — and that belongs with the
 * leaderboard's own cross-user work, not here. Don't wire this to a board
 * without it.
 *
 * ── Why it under-counts on purpose ──────────────────────────────────────────
 *
 * Every judgement call below rounds DOWN. A defeatable number is allowed to be
 * wrong in one direction only: a student who studied and was not credited is
 * disappointed, while a student credited for a pocketed phone makes the figure
 * worthless for everyone.
 */

/**
 * How often the tick fires, and therefore the granularity of a credited
 * stretch. 5s is 720 wakeups an hour on a phone for a figure rendered to one
 * decimal place; 60s under-credits a 90-second section by a third. 30s credits
 * that section as one minute — under, which is the correct direction.
 */
const TICK_MS = 30_000;

/**
 * No real input for this long and the clock stops.
 *
 * Two minutes, not thirty seconds: reading a paragraph of dense Khmer without
 * touching the screen is ordinary and must still count. Long enough to read,
 * short enough that a pocketed phone stops earning almost immediately.
 */
const IDLE_MS = 120_000;

/** Seconds banked but not yet written — see the flush rule below. */
let pendingSeconds = 0;

/**
 * MODULE-LEVEL, not a ref, and not component state.
 *
 * StrictMode runs every effect twice in development and gives each pass its own
 * refs, which is the exact trap that once produced two anonymous users per page
 * load (see share-pending.ts and the StrictMode note in CLAUDE.md). Two timers
 * each holding half the count would double-credit every minute. Module scope is
 * what makes "one counter per browser" mean one.
 */
let lastInputAt = Date.now();

function markInput() {
  lastInputAt = Date.now();
}

const INPUT_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;

export function useStudyTimer() {
  const { pathname } = useLocation();
  const focusMode = useBrachNhaStore((s) => s.focusMode);
  const addStudyMinutes = useBrachNhaStore((s) => s.addStudyMinutes);

  // The mock exam is a STATE rather than a route — /exam is an ordinary
  // destination until a question is on screen — so the store flag is ORed in
  // exactly the way useFocusMode() already does it. Everything else is decided
  // by pathname; see isStudyRoute for what is deliberately excluded.
  const studying = isStudyRoute(pathname) || focusMode;

  useEffect(() => {
    if (!studying) return;

    // A fresh arrival is activity by definition. Without this, walking into a
    // lesson more than IDLE_MS after the last tap would start the clock already
    // idle and credit nothing until the first scroll.
    markInput();

    for (const type of INPUT_EVENTS) {
      // Passive: none of these are ever cancelled, and a non-passive scroll
      // listener blocks the compositor — the rule the Performance section sets
      // for anything that runs while content moves.
      window.addEventListener(type, markInput, { passive: true });
    }

    /** Writes whole banked minutes and keeps the remainder. */
    const flush = () => {
      const minutes = Math.floor(pendingSeconds / 60);
      if (minutes > 0) {
        pendingSeconds -= minutes * 60;
        addStudyMinutes(minutes);
      }
    };

    const tick = () => {
      // Two separate reasons not to credit this tick, and they are not the same
      // thing: the tab being hidden (backgrounded, screen off, another app) and
      // the student being present but idle.
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastInputAt > IDLE_MS) return;
      pendingSeconds += TICK_MS / 1000;
      flush();
    };

    const timer = window.setInterval(tick, TICK_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // RESET THE STAMP, DO NOT CREDIT THE GAP. Coming back from a
        // backgrounded tab is activity, but the time spent away is not study
        // time and must never be banked retroactively.
        markInput();
      } else {
        flush();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    // pagehide covers the iOS case visibilitychange alone does not reliably
    // reach — a tab discarded or the app swiped away — so the last part-minute
    // is not silently lost.
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearInterval(timer);
      for (const type of INPUT_EVENTS) {
        window.removeEventListener(type, markInput);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      // Leaving a study screen banks what was earned on it. `pendingSeconds` is
      // module-level so a remainder under a minute survives to the next screen
      // rather than being thrown away at every navigation — which is what would
      // make a student who moves between short sections earn nothing at all.
      flush();
    };
  }, [studying, addStudyMinutes]);
}

import { useLayoutEffect } from "react";

/**
 * Scroll a focus screen back to the top when its step changes.
 *
 * WHY THIS IS NEEDED AT ALL. A multi-step task keeps ONE scroll container for
 * the whole flow — `FocusLayout`'s body, marked `data-focus-body` — and React
 * swapping the children does not touch its `scrollTop`. So a student who
 * scrolls to the bottom of a long step and presses Continue lands at the bottom
 * of the next one, usually staring at a footer with the question off-screen
 * above them. It reads as a step that failed to load, which is exactly what was
 * reported for the section flow: "why is it always on the bottom, not the top".
 *
 * THE MECHANISM WAS ALREADY THERE, USED ONCE. `focus-layout.tsx` has marked its
 * scroller `data-focus-body` since the past-paper runner needed this — that
 * runner's reading passage is several screens tall. Every other multi-step
 * focus screen simply never called it: the lesson flow (7 steps), the section
 * flow (2 steps plus completion), the practice quiz, the game run and the
 * flashcard review were all left scrolled wherever the previous step ended.
 * This hook is that one-file fix lifted so the five of them share it rather
 * than carrying five copies of the same effect — the same lift `stat-bar.tsx`
 * and `utils/rewards.ts` got on their second caller.
 *
 * QUERIED FROM THE DOCUMENT, NOT THROUGH A REF. Exactly one `FocusLayout` is
 * mounted at a time — a focus route takes over the whole screen and the shell
 * renders nothing else — so there is never a second `[data-focus-body]` to pick
 * the wrong one of. That is what lets a caller pass just its step and add no
 * ref, which matters because two of the five had no ref to hang `closest()` on.
 *
 * `useLayoutEffect`, NOT `useEffect`. The scroll is corrected before the browser
 * paints, so the new step never appears at the old offset for a frame. With
 * `useEffect` the wrong position is painted first and then jumps, which on a
 * phone reads as a flicker. The app is fully client-rendered, so there is no
 * server-render warning to dodge.
 *
 * INSTANT, NEVER SMOOTH. An animated scroll on arrival reads as a glitch rather
 * than as navigation — the same call `subject-path-view.tsx` makes for its own
 * landing scroll.
 *
 * It is deliberately a no-op when nothing is found: a caller rendered outside a
 * `FocusLayout` (the survey's inline `PlacementTestRunner`, say) simply does
 * nothing rather than throwing.
 */
export function useFocusScrollTop(step: unknown) {
  useLayoutEffect(() => {
    document.querySelector("[data-focus-body]")?.scrollTo({ top: 0 });
  }, [step]);
}

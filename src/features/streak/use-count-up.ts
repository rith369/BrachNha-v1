import { useEffect, useRef, useState } from "react";

/**
 * Tweens a number toward `target` whenever it changes, so the streak count
 * rolls rather than snapping.
 *
 * `from` is read off a ref holding the LAST VALUE ACTUALLY PAINTED, not off the
 * previous target. Those differ whenever the target moves again mid-tween, and
 * taking the previous target would make the number jump backwards to it before
 * setting off again.
 *
 * The ref is only ever written inside the effect and the frame callback —
 * never during render — which is what keeps this safe under the React Compiler.
 *
 * REDUCED MOTION SNAPS. Someone who has asked their device for less motion
 * still needs the number to be correct; they just do not need to watch it get
 * there. This is the JS half of the same rule the `prefers-reduced-motion`
 * block in globals.css applies to the flame and the confetti.
 */
export function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(target);
  const painted = useRef(target);

  useEffect(() => {
    const from = painted.current;
    if (from === target) return;

    const settle = () => {
      painted.current = target;
      setValue(target);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      // easeOutCubic — fast off the mark, settling into the final digit rather
      // than arriving at constant speed.
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(from + (target - from) * eased);
      painted.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

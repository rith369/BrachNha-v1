import { useEffect, useRef, useState } from "react";

/**
 * How many times a student may leave the exam screen before it ends.
 *
 * The rule as the user wrote it: "ការចាកចេញលើសពី 2 ដង នឹងធ្វើឱ្យការប្រឡងត្រូវ
 * បញ្ចប់ភ្លាមៗ" — two are forgiven with a warning, the third ends the paper.
 * One constant so the warning, the detail screen's notice and the enforcement
 * cannot disagree about the number.
 */
export const MAX_EXAM_LEAVES = 2;

/**
 * How long the screen must be away before it counts as leaving.
 *
 * NOT zero, and that is the whole reason this is a constant rather than a bare
 * `if`. A phone raises a permission sheet, a fingerprint prompt or a
 * rotate-then-return in well under a second, and every one of those hides the
 * page exactly the way switching to a browser does. Two seconds is short enough
 * that a real look at another app still counts and long enough that a flicker
 * does not cost a student their paper.
 */
export const LEAVE_GRACE_MS = 2000;

/**
 * Counts the times a student leaves the exam screen, and ends the exam when
 * they have used up their allowance.
 *
 * IT CANNOT PREVENT LEAVING, and nothing in a browser can. No web page can block
 * the home button, app switching, the notification shade or the screen locking —
 * that needs an installed app and the phone's own exam mode (Android screen
 * pinning, iOS Guided Access). What a page CAN do is notice, which is what this
 * is: detect-and-penalise, never prevent. Don't let the copy anywhere promise
 * more than that.
 *
 * `visibilitychange` is the signal, and it fires for ALL of: switching apps,
 * opening another tab, pulling the notification shade, taking a call, and the
 * screen locking — including locking ITSELF after the phone's idle timeout.
 * **The app cannot tell those apart.** That is not a bug to fix, it is the
 * accepted cost of the rule, and it is why the grace window exists and why the
 * penalty submits the paper rather than discarding it.
 *
 * MEASURED FROM A TIMESTAMP, never by a timer: a hidden page's timers are
 * throttled or stopped outright, so counting ticks while away measures nothing.
 * Same reason PastPaperRunner's clock is a deadline stamped at mount rather than
 * an interval it trusts — see competition-run.tsx for the fuller argument.
 *
 * The count is decided on RETURN rather than on leaving, because the away time
 * is not known until then, and because a student who is not looking at the
 * screen cannot be told anything anyway.
 */
export function useLeaveGuard({
  active,
  limit = MAX_EXAM_LEAVES,
  onExceeded,
}: {
  /** False once the attempt is over — a submitted paper must stop counting. */
  active: boolean;
  limit?: number;
  /** Called ONCE, the moment the allowance is used up. */
  onExceeded: (leaves: number) => void;
}) {
  const [leaves, setLeaves] = useState(0);
  const [warning, setWarning] = useState(false);

  const leavesRef = useRef(0);
  const hiddenAt = useRef<number | null>(null);
  const exceeded = useRef(false);
  // The callback is a fresh closure on every parent render. Held in a ref so the
  // listener below is added ONCE per attempt: re-subscribing on each render
  // would drop `hiddenAt` mid-absence and silently miss the return.
  //
  // Written in an EFFECT, not during render — oxlint's react(refs) rule, and it
  // is safe here because the listener only reads it when the student comes
  // back, which is long after any render has committed.
  const onExceededRef = useRef(onExceeded);
  useEffect(() => {
    onExceededRef.current = onExceeded;
  });

  useEffect(() => {
    if (!active) return;

    function onVisibility() {
      if (document.hidden) {
        // Only the FIRST hide of an absence starts the clock: some browsers
        // fire again on the way out (pagehide → visibilitychange), and
        // restarting the stamp would shorten the measured time away.
        hiddenAt.current ??= Date.now();
        return;
      }

      const at = hiddenAt.current;
      hiddenAt.current = null;
      if (at === null || Date.now() - at < LEAVE_GRACE_MS) return;

      leavesRef.current += 1;
      setLeaves(leavesRef.current);

      if (leavesRef.current > limit) {
        // Guarded because the two endings — this and the clock running out —
        // can land together, and the paper may only be reported once.
        if (!exceeded.current) {
          exceeded.current = true;
          onExceededRef.current(leavesRef.current);
        }
        return;
      }
      setWarning(true);
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active, limit]);

  return {
    /** How many counted absences so far. */
    leaves,
    /** A counted absence is waiting to be acknowledged. */
    warning,
    /** Dismiss the warning and carry on. The clock never stopped. */
    acknowledge: () => setWarning(false),
  };
}

import { useLocation } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { isAssessmentRoute, isFocusRoute } from "@/utils/focus-routes";

/**
 * Is the student mid-task right now?
 *
 * Two sources, because the two kinds of task announce themselves differently:
 *  • the ROUTE, for screens that are nothing but a task from the moment you land
 *    on them (a lesson, a placement test)
 *  • the STORE flag, for the mock exam, where /exam is an ordinary destination
 *    until you actually start answering
 *
 * Combining them in one hook is what keeps ShellLayout and BottomNav from
 * disagreeing about whether navigation should be on screen.
 */
export function useFocusMode(): boolean {
  const { pathname } = useLocation();
  const focusMode = useBrachNhaStore((s) => s.focusMode);
  return isFocusRoute(pathname) || focusMode;
}

/**
 * Is the AI mentor off-limits on this screen?
 *
 * Narrower than useFocusMode() on purpose. A lesson hides the navigation but
 * keeps the mentor — content, flashcards and the practice quiz are all places a
 * student SHOULD be able to ask for help. An assessment hides both, because a
 * mentor on tap during a test measures the mentor, not the student.
 *
 * The store's `focusMode` is read here as "a mock exam is being answered right
 * now", which is the only thing that sets it (mock-exam.tsx). If a future screen
 * starts setting that flag for some other reason, this rule needs its own flag
 * rather than borrowing that one — the two questions would have come apart.
 */
export function useMentorBlocked(): boolean {
  const { pathname } = useLocation();
  const examInProgress = useBrachNhaStore((s) => s.focusMode);
  return isAssessmentRoute(pathname) || examInProgress;
}

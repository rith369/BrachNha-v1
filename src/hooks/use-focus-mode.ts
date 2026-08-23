import { useLocation } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { isFocusRoute } from "@/utils/focus-routes";

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

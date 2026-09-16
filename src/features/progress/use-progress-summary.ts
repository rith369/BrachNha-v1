import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { todayKey } from "@/utils/day";
import { buildProgressSummary, type ProgressSummary } from "./summary";

/**
 * The store read behind every real card on Progress.
 *
 * Called ONCE, in pages/progress.tsx, and the result threaded down as a prop.
 * Two reasons, and the second is the one that matters:
 *
 *  - The cards used to read the store independently — subject-bar-chart and
 *    subject-breakdown each called progressSubjects() on their own — so two
 *    cards on one screen could disagree about the same number.
 *  - todayKey() is impure. Calling it in each card's body is what oxlint's
 *    react(purity) rule objects to, and it means a render crossing local
 *    midnight could window two cards against two different days.
 *
 * NEVER returns null; see buildProgressSummary's own comment for why that is a
 * React Compiler safety property rather than a convenience.
 */
export function useProgressSummary(): ProgressSummary {
  const { contentLog, activityLog, examResults } = useBrachNhaStore(
    useShallow((s) => ({
      contentLog: s.contentLog,
      activityLog: s.activityLog,
      examResults: s.examResults,
    }))
  );

  // No useMemo: the React Compiler memoizes this on the three inputs by itself,
  // and hand-writing one is what CLAUDE.md's stack table says defeats it.
  return buildProgressSummary(
    contentLog,
    activityLog,
    examResults,
    todayKey()
  );
}

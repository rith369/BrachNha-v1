import { PracticeView } from "@/features/practice/components/practice-view";
import { BottomNav } from "@/components/shell/bottom-nav";

/**
 * `/practice` — the Flashcard / Quiz hub.
 *
 * The page supplies the scroller and padding, matching pages/lessons.tsx rather
 * than pages/exam.tsx: this route has only one branch, so there is no runner
 * bringing FocusLayout's own scroller that would end up nested inside a second.
 */
export default function PracticePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        <PracticeView />
      </div>
      <BottomNav />
    </div>
  );
}

import { ExamView } from "@/features/exam/components/exam-view";
import { BottomNav } from "@/components/shell/bottom-nav";

// ExamView owns its own scroller and padding, unlike lessons.tsx where the page
// supplies them: the runner branch brings FocusLayout's scroller and must not be
// nested inside a second one. See the comment in exam-view.tsx.
export default function ExamPage() {
  return (
    <div className="flex h-full flex-col">
      <ExamView />
      <BottomNav />
    </div>
  );
}

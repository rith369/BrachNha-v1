import { ExamHub } from "@/features/exam/components/exam-hub";
import { BottomNav } from "@/components/shell/bottom-nav";

/**
 * `/exam` — the chooser between Subject Mock Exams and the Bac II Simulation.
 * The two-tab past/generated papers screen lives at `/exam/subjects`; see
 * exam-hub.tsx for why it is a route rather than a state here.
 */
export default function ExamPage() {
  return (
    <div className="flex h-full flex-col">
      <ExamHub />
      <BottomNav />
    </div>
  );
}

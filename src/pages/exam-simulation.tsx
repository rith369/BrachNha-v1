import { ExamSimulationView } from "@/features/exam/components/exam-simulation-view";
import { BottomNav } from "@/components/shell/bottom-nav";

/**
 * `/exam/simulation` — the overview and briefing screen for the 2-Day Bac II Simulation.
 * Reached from the chooser at `/exam` (exam-hub.tsx).
 */
export default function ExamSimulationPage() {
  return (
    <div className="flex h-full flex-col">
      <ExamSimulationView />
      <BottomNav />
    </div>
  );
}

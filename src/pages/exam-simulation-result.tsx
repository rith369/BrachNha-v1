import { Navigate, useParams } from "react-router";
import { BottomNav } from "@/components/shell/bottom-nav";
import { SimulationResult } from "@/features/exam/components/simulation-result";
import { currentSitting } from "@/features/exam/simulation";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/exam/simulation/result/:attemptId`: one finished Simulation. An attempt still
 * being sat goes back to its papers, so no score shows before the end.
 */
export default function ExamSimulationResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const attempt = useBrachNhaStore((s) => s.simulations.find((a) => a.id === attemptId));

  if (!attempt) return <Navigate to="/exam/simulation" replace />;
  if (attempt.finishedAt === null && currentSitting(attempt)) {
    return <Navigate to="/exam/simulation/sit" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <SimulationResult attempt={attempt} />
      <BottomNav />
    </div>
  );
}

import { useState } from "react";
import { Navigate } from "react-router";
import { BottomNav } from "@/components/shell/bottom-nav";
import { SimulationSit } from "@/features/exam/components/simulation-sit";
import { activeSimulation, currentSitting } from "@/features/exam/simulation";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/exam/simulation/sit`: the unfinished Simulation attempt.
 *
 * NOT A FOCUS ROUTE. Between papers this is a place, so the navigation stays; the
 * runner hides it by setting the store's `focusMode`, as on a paper's own screen.
 *
 * The attempt is remembered by id from the first render, so finishing its last
 * paper lands on its result rather than back at the briefing.
 */
export default function ExamSimulationSitPage() {
  const simulations = useBrachNhaStore((s) => s.simulations);
  const [attemptId] = useState(() => activeSimulation(simulations)?.id ?? null);
  const attempt = simulations.find((a) => a.id === attemptId);

  if (!attempt) return <Navigate to="/exam/simulation" replace />;
  const current = currentSitting(attempt);
  // The second half is the 2 days running out with papers still unsat.
  if (!current || attempt.finishedAt !== null) return <Navigate to={`/exam/simulation/result/${attempt.id}`} replace />;

  return (
    <div className="flex h-full flex-col">
      <SimulationSit attempt={attempt} current={current} />
      <BottomNav />
    </div>
  );
}

import { Navigate, useParams } from "react-router";
import { useT } from "@/data/translations";
import { LockedFeature } from "@/features/auth/components/locked-feature";
import { MonthView } from "@/features/roadmap/components/month-view";
import { isMonthKey } from "@/features/roadmap/study-plan";
import { useStudyPlan } from "@/features/roadmap/use-study-plan";
import { useAuth } from "@/hooks/use-auth";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/roadmap/:month` (`2026-11`): one month of the plan. A route rather than state
 * on the Roadmap, so the phone's back button returns to the path. Guarded like
 * /roadmap, for the reasons pages/roadmap.tsx gives.
 */
export default function RoadmapMonthPage() {
  const { hasFullAccess } = useAuth();
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  if (!hasFullAccess) {
    return <LockedFeature feature="roadmap" title={t.yourRoadmap} />;
  }
  return <MonthPage />;
}

function MonthPage() {
  const { month: key } = useParams();
  const { plan, manifest } = useStudyPlan();
  const month = isMonthKey(key) ? plan.months.find((m) => m.key === key) : undefined;

  // A typed address, or a month before this student began or after the exam.
  if (!month) return <Navigate to="/roadmap" replace />;

  return (
    <div className="h-full overflow-y-auto">
      <MonthView month={month} manifest={manifest} />
    </div>
  );
}

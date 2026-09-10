import { RoadmapView } from "@/features/roadmap/components/roadmap-view";
import { LockedFeature } from "@/features/auth/components/locked-feature";
import { useAuth } from "@/hooks/use-auth";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";

/**
 * The roadmap needs an account, so the guard lives HERE rather than on the
 * links that point at it.
 *
 * There are four ways in — Home's Quest Map chip, grade-prediction's
 * recommended action, and two programmatic navigate("/roadmap") calls in the
 * survey and placement-test flows — and a click handler cannot cover the last
 * two, or a typed URL, or a bookmark. Guarding the destination covers all of
 * them at once. Home's chip ALSO calls requireAuth(), but only so the modal
 * opens in place instead of navigating to a locked page; that is polish on top
 * of this, not the gate.
 *
 * A panel rather than a <Navigate>: bouncing someone to Home for tapping their
 * own bookmark explains nothing.
 */
export default function RoadmapPage() {
  const { hasFullAccess } = useAuth();
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  if (!hasFullAccess) {
    return <LockedFeature feature="roadmap" title={t.yourRoadmap} />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <RoadmapView />
    </div>
  );
}

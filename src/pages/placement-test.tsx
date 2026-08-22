import { useParams } from "react-router";
import { PlacementTestPage as PlacementTestView } from "@/features/survey/components/placement-test-page";

/** Was app/placement-test/[subject]/page.tsx — see pages/lesson-detail.tsx. */
export default function PlacementTestRoute() {
  const { subject } = useParams<{ subject: string }>();
  return <PlacementTestView subject={subject ?? ""} />;
}

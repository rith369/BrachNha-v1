import { Outlet, Route, Routes } from "react-router";
import { AppShell } from "@/components/shell/app-shell";
import HomePage from "@/pages/home";
import BattlePage from "@/pages/battle";
import ExamPage from "@/pages/exam";
import GradePredictionPage from "@/pages/grade-prediction";
import LessonsPage from "@/pages/lessons";
import LessonDetailPage from "@/pages/lesson-detail";
import PlacementTestRoute from "@/pages/placement-test";
import ProfilePage from "@/pages/profile";
import ProgressPage from "@/pages/progress";
import RoadmapPage from "@/pages/roadmap";
import NotFoundPage from "@/pages/not-found";

/**
 * Replaces app/layout.tsx. AppShell still takes `children` rather than reading
 * the router itself, so it stays usable outside a route — this thin wrapper is
 * the only thing that knows about <Outlet />.
 */
function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

/**
 * The former app/ directory, written out. Paths are unchanged from the file
 * system routes they replace, so lib/nav-items.ts and every <Link> still point
 * at the same URLs.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route index element={<HomePage />} />
        <Route path="battle" element={<BattlePage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="grade-prediction" element={<GradePredictionPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
        <Route path="placement-test/:subject" element={<PlacementTestRoute />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

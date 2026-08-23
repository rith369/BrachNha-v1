import { Outlet, Route, Routes, useLocation } from "react-router";
import { AppShell } from "@/components/shell/app-shell";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { useBrachNhaStore } from "@/lib/store";
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
  const { pathname } = useLocation();
  const commitment = useBrachNhaStore((s) => s.commitment);
  const pledgeSeen = useBrachNhaStore((s) => s.pledgeSeen);

  // Fresh out of the survey the roadmap is a one-way screen: its commit CTA is
  // the only way off it, because a hamburger tap there means the student never
  // reaches the pledge at all. Once they've seen it — signed or skipped — the
  // roadmap is an ordinary page again.
  const roadmapLock = pathname === "/roadmap" && !commitment && !pledgeSeen;

  // Lessons and tests hide the same chrome, for a different reason: mid-task the
  // screen should be the exercise and nothing else. Both cases drop TopBar,
  // FabChat and the Sidebar, so they share one prop. BottomNav reads
  // useFocusMode() itself since the pages, not the shell, render it.
  const focusMode = useFocusMode();
  const hideChrome = roadmapLock || focusMode;

  return (
    <AppShell hideChrome={hideChrome}>
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

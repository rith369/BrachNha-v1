import { Outlet, Route, Routes, useLocation } from "react-router";
import { AppShell } from "@/components/shell/app-shell";
import { useFocusMode, useMentorBlocked } from "@/hooks/use-focus-mode";
import { useBrachNhaStore } from "@/lib/store";
import HomePage from "@/pages/home";
import GamePage from "@/pages/game";
import ExamPage from "@/pages/exam";
import GradePredictionPage from "@/pages/grade-prediction";
import LeaderboardPage from "@/pages/leaderboard";
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

  // Lessons and tests hide the same NAVIGATION, for a different reason: mid-task
  // the screen should be the exercise and nothing else. Both cases drop TopBar
  // and the Sidebar. BottomNav reads useFocusMode() itself since the pages, not
  // the shell, render it.
  // Both hooks are called unconditionally, before any `||` — putting either on
  // the right of one would short-circuit the call and break the rules of hooks.
  const focusMode = useFocusMode();
  const mentorBlocked = useMentorBlocked();

  const hideChrome = roadmapLock || focusMode;

  // The mentor is a separate question from the navigation, and the two answers
  // differ exactly once: inside a lesson, where the nav is gone but asking the
  // mentor about the step you're on is the point. It stays hidden on the two
  // assessments, and on the roadmap lock — there the whole reason chrome is gone
  // is that the pledge CTA has to be the only way forward.
  const hideMentor = roadmapLock || mentorBlocked;

  return (
    <AppShell hideChrome={hideChrome} hideMentor={hideMentor}>
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
        <Route path="game" element={<GamePage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="grade-prediction" element={<GradePredictionPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
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

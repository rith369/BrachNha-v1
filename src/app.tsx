import { lazy, Suspense, useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";
import { AppShell } from "@/components/shell/app-shell";
import { ErrorBoundary } from "@/components/error-boundary";
import { useFocusMode, useMentorBlocked } from "@/hooks/use-focus-mode";
import { useAuth } from "@/hooks/use-auth";
import { useBrachNhaStore } from "@/lib/store";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";

/**
 * Every route except the two below, behind its own chunk.
 *
 * The app used to import all twelve pages statically, which put Recharts,
 * Framer Motion, all the demo data and the whole lesson corpus into a single
 * 1MB entry chunk that every student downloaded before seeing anything.
 *
 * They are held in ONE map, and `lazy()` and the prefetch below both read from
 * it, so the two can never fall out of step — a route added here is split and
 * prefetched by the same edit. The import specifiers have to be literal for the
 * bundler to see them, which is what the arrow functions are for.
 *
 * Home and NotFound stay EAGER on purpose. Home is the landing route, so
 * splitting it would only add a round trip in front of first paint; NotFound is
 * twenty lines and imports nothing, so a chunk of its own would cost more in
 * request overhead than it saves.
 */
const routeModules = {
  game: () => import("@/pages/game"),
  gameCreate: () => import("@/pages/game-create"),
  gamePlay: () => import("@/pages/game-play"),
  gameReview: () => import("@/pages/game-review"),
  exam: () => import("@/pages/exam"),
  gradePrediction: () => import("@/pages/grade-prediction"),
  leaderboard: () => import("@/pages/leaderboard"),
  lessons: () => import("@/pages/lessons"),
  lessonDetail: () => import("@/pages/lesson-detail"),
  sectionDetail: () => import("@/pages/section-detail"),
  subjectPath: () => import("@/pages/subject-path"),
  placementTest: () => import("@/pages/placement-test"),
  practice: () => import("@/pages/practice"),
  practiceSubject: () => import("@/pages/practice-subject"),
  practiceRun: () => import("@/pages/practice-run"),
  practiceReview: () => import("@/pages/practice-review"),
  privacy: () => import("@/pages/privacy"),
  profile: () => import("@/pages/profile"),
  progress: () => import("@/pages/progress"),
  roadmap: () => import("@/pages/roadmap"),
  streak: () => import("@/pages/streak"),
  streakFriends: () => import("@/pages/streak-friends"),
};

const GamePage = lazy(routeModules.game);
const GameCreatePage = lazy(routeModules.gameCreate);
const GamePlayPage = lazy(routeModules.gamePlay);
const GameReviewPage = lazy(routeModules.gameReview);
const ExamPage = lazy(routeModules.exam);
const GradePredictionPage = lazy(routeModules.gradePrediction);
const LeaderboardPage = lazy(routeModules.leaderboard);
const LessonsPage = lazy(routeModules.lessons);
const LessonDetailPage = lazy(routeModules.lessonDetail);
const SectionDetailPage = lazy(routeModules.sectionDetail);
const SubjectPathPage = lazy(routeModules.subjectPath);
const PlacementTestRoute = lazy(routeModules.placementTest);
const PracticePage = lazy(routeModules.practice);
const PracticeSubjectPage = lazy(routeModules.practiceSubject);
const PracticeRunPage = lazy(routeModules.practiceRun);
const PracticeReviewPage = lazy(routeModules.practiceReview);
const PrivacyPage = lazy(routeModules.privacy);
const ProfilePage = lazy(routeModules.profile);
const ProgressPage = lazy(routeModules.progress);
const RoadmapPage = lazy(routeModules.roadmap);
const StreakPage = lazy(routeModules.streak);
const StreakFriendsPage = lazy(routeModules.streakFriends);

/**
 * Warms every split chunk once the browser is idle.
 *
 * This is not optional garnish — without it the split above would make the
 * thing it is meant to help WORSE. Splitting alone means the first tap on each
 * tab waits on a network round trip, and slow navigation is the actual
 * complaint. Fetching during the idle time right after first paint means the
 * chunk is in the module cache before any tab is tapped, so navigation stays
 * instant while first paint no longer carries all twelve pages.
 *
 * Failures are swallowed: this is a speculative fetch, and a student who goes
 * offline between load and tap should get the normal Suspense path when they
 * navigate, not an unhandled rejection now.
 */
function usePrefetchRoutes() {
  useEffect(() => {
    let cancelled = false;

    const warm = () => {
      if (cancelled) return;
      for (const load of Object.values(routeModules)) {
        load().catch(() => {});
      }
    };

    // requestIdleCallback is still missing on older Safari; the timeout is the
    // fallback, and is long enough to stay clear of first paint either way.
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(warm, { timeout: 3000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }

    const id = window.setTimeout(warm, 1200);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);
}

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
  //
  // `hasFullAccess` is load-bearing and not obvious. A guest never signs a
  // pledge, so without it this condition is true for EVERY guest who reaches
  // /roadmap — and it strips the sidebar, the hamburger and the FAB, while the
  // route itself renders no BottomNav. They would land on the locked panel with
  // no navigation of any kind and no way out but the browser's back button.
  const { hasFullAccess } = useAuth();
  const roadmapLock =
    pathname === "/roadmap" && hasFullAccess && !commitment && !pledgeSeen;

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
      {/* fallback={null} rather than a spinner, matching how AppShell mounts
          ChatOverlay. The prefetch above means this almost never renders; a
          spinner that flashes for a frame reads worse than a blank one. */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

/**
 * The former app/ directory, written out. Paths are unchanged from the file
 * system routes they replace, so lib/nav-items.ts and every <Link> still point
 * at the same URLs.
 */
export default function App() {
  usePrefetchRoutes();

  return (
    // OUTSIDE <Routes>, so a throw during a route's render is caught rather
    // than taking the whole tree with it. Deliberately not per-route: the
    // fallback's job is to get a stuck student moving again, and a boundary
    // inside the shell would keep rendering navigation that may itself be what
    // threw. See components/error-boundary.tsx for why reloading alone is not
    // a sufficient escape in an app with a persisted store.
    <ErrorBoundary>
      <Routes>
        {/* OUTSIDE ShellLayout, and that is the whole point of it being here.
            Every route below passes through AppShell's auth gate, which would
            render the entry screen instead of the policy — breaking the two
            readers who matter most: Google, which checks this URL resolves
            before it will publish the OAuth app, and a student deciding whether
            to sign up at all. A privacy policy you have to log in to read is
            not a privacy policy. It brings its own page frame for the same
            reason: there is no shell around it. */}
        <Route
          path="privacy"
          element={
            <Suspense fallback={null}>
              <PrivacyPage />
            </Suspense>
          }
        />
        <Route element={<ShellLayout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          {/* Both task routes are STATIC-PREFIXED, so there is no
              /game/:something pattern to collide with — the ambiguity
              pages/subject-path.tsx documents for /lessons cannot arise here. */}
          <Route path="game/create" element={<GameCreatePage />} />
          <Route path="game/play/:competitionId" element={<GamePlayPage />} />
          {/* The tail of BOTH runs, and the durable artefact they leave
              behind — see pages/game-review.tsx for why one route keyed on
              the competition serves the creator and every joiner. Unlike
              the two above it is not an assessment route, so KruAI is
              reachable here. */}
          <Route
            path="game/review/:competitionId"
            element={<GameReviewPage />}
          />
          <Route path="exam" element={<ExamPage />} />
          <Route path="grade-prediction" element={<GradePredictionPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="sections/:sectionId" element={<SectionDetailPage />} />
          <Route path="subjects/:subjectId" element={<SubjectPathPage />} />
          <Route
            path="placement-test/:subject"
            element={<PlacementTestRoute />}
          />
          {/* Four segments for the runner, not three, so it cannot collide with
              the lesson-list pattern above it — see pages/practice-run.tsx. */}
          <Route path="practice" element={<PracticePage />} />
          {/* Static, listed before the dynamic :mode/:subjectId route below so
              react-router's own more-specific-first matching resolves this
              first rather than treating "review" as a :mode value. Two path
              segments, so it cannot collide with that three-segment route on
              segment count either — see isPracticeRunRoute's comment in
              utils/focus-routes.ts for why segment count is what this feature
              already disambiguates on. */}
          <Route path="practice/review" element={<PracticeReviewPage />} />
          <Route
            path="practice/:mode/:subjectId"
            element={<PracticeSubjectPage />}
          />
          <Route
            path="practice/:mode/:subjectId/:lessonRef"
            element={<PracticeRunPage />}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="streak" element={<StreakPage />} />
          <Route path="streak/friends" element={<StreakFriendsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

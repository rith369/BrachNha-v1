/**
 * Routes that ARE a task rather than a place — a lesson you're working through,
 * a placement test you're sitting. Focus mode strips every navigation affordance
 * on these so the screen is the exercise and nothing else, the way Duolingo
 * treats a lesson.
 *
 * The mock exam is deliberately absent: /exam is a destination reached FROM the
 * nav and its intro screen shows past results, so it keeps its navigation and
 * flips the store's `focusMode` only while a question is actually on screen.
 * See use-focus-mode.ts, which ORs the two together.
 */
export function isFocusRoute(pathname: string): boolean {
  // startsWith("/lessons/") and NOT "/lessons": the lessons LIST is an ordinary
  // page and must keep its nav. Only a lesson with an id is a task.
  //
  // "/sections/" is the same kind of thing one level down — one section of the
  // real curriculum, run by SectionDetail. Note "/subjects/" is deliberately NOT
  // here: a subject path is where a student CHOOSES what to do, so it keeps its
  // navigation.
  return (
    pathname.startsWith("/lessons/") ||
    pathname.startsWith("/sections/") ||
    isPracticeRunRoute(pathname) ||
    isAssessmentRoute(pathname)
  );
}

/**
 * A flashcard deck or a practice quiz that is actually being worked through.
 *
 * The practice feature has THREE levels and only the deepest is a task:
 *
 *   /practice                              the hub — choosing a subject
 *   /practice/:mode/:subjectId             the lesson list — choosing a lesson
 *   /practice/:mode/:subjectId/:lessonRef  the deck or quiz — a task
 *
 * So this counts segments rather than using startsWith, which is what the two
 * routes above rely on. The first two are places, not tasks, and keep their
 * navigation — the same call /subjects/:subjectId already makes.
 *
 * DELIBERATELY NOT ADDED TO isAssessmentRoute BELOW. A practice quiz reveals the
 * answer and its explanation on the spot and pays out as it goes; it teaches
 * rather than measures, so KruAI stays reachable exactly as it does inside a
 * lesson. That gap is also why this is detected by pathname at all instead of by
 * the store's `focusMode` flag — see the note on useMentorBlocked().
 */
export function isPracticeRunRoute(pathname: string): boolean {
  if (!pathname.startsWith("/practice/")) return false;
  // "/practice/quiz/biology/3-1" → ["practice","quiz","biology","3-1"]. A
  // trailing slash yields an empty last part, which filter drops, so
  // "/practice/quiz/biology/" stays a list rather than becoming a task.
  return pathname.split("/").filter(Boolean).length >= 4;
}

/**
 * Routes where the student is being MEASURED rather than taught, and the AI
 * mentor therefore has to be out of reach.
 *
 * This is a strict subset of isFocusRoute, and the gap between the two is the
 * point: a lesson hides the navigation but KEEPS the mentor, because asking
 * "why is this step true?" mid-lesson is the product working as intended. An
 * assessment hides both.
 *
 * The placement test counts for a reason that's easy to miss — it is not graded,
 * it decides which subjects get marked weak. A student who looks up answers here
 * is marked strong in a subject they're weak in, and every phase of the roadmap
 * built from that is wrong, with nothing downstream to catch it.
 *
 * The mock exam is absent for the same reason it's absent above: it isn't
 * identifiable by URL. use-focus-mode.ts ORs the store flag in.
 */
export function isAssessmentRoute(pathname: string): boolean {
  return pathname.startsWith("/placement-test/");
}

/**
 * Routes whose page does NOT render BottomNav. Roadmap is a single sequential
 * journey rather than a tab destination, and Profile is a short settings page
 * — neither pages/roadmap.tsx nor pages/profile.tsx mount one.
 *
 * FabChat needs to know this: its resting bottom offset is calibrated to float
 * just above BottomNav's reserved space (see fab-chat.tsx). Where BottomNav is
 * absent there is nothing to float above, so that same offset instead lands
 * inside ordinary scrollable content — confirmed on Roadmap, where it sat
 * directly on top of the Daily Mission list's Done button.
 */
export function isBottomNavRoute(pathname: string): boolean {
  return pathname !== "/roadmap" && pathname !== "/profile";
}

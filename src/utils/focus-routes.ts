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
  return pathname.startsWith("/lessons/") || isAssessmentRoute(pathname);
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

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
  return pathname.startsWith("/lessons/") || pathname.startsWith("/placement-test/");
}

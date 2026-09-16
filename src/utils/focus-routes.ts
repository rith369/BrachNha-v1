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
    pathname === "/practice/review" ||
    isPracticeRunRoute(pathname) ||
    // The game review is a focus screen but NOT an assessment, so it has to be
    // named here rather than arriving through isAssessmentRoute below.
    isGameReviewRoute(pathname) ||
    // A game match arrives here through isAssessmentRoute below, the same way the
    // placement test does — it is measured, not merely a task.
    isAssessmentRoute(pathname)
  );
}

/**
 * A game match in progress.
 *
 * `/game` itself is a PLACE — it is where a student chooses a subject to play —
 * so it keeps its navigation, and only `/game/:subjectId` is a task. That is the
 * same trailing-slash rule isFocusRoute() applies to "/lessons/", and it needs
 * no segment counting because there is no static `/game/*` path to disambiguate
 * from (unlike the two-pattern ambiguity pages/subject-path.tsx documents).
 *
 * DETECTED BY PATHNAME RATHER THAN BY THE STORE'S `focusMode` FLAG, which is the
 * load-bearing choice here and the same one isPracticeRunRoute() made.
 * hooks/use-focus-mode.ts warns that `focusMode` is read by useMentorBlocked()
 * as "a mock exam is being answered", and exam-runner.tsx adds that it is a
 * boolean rather than a counter, so exactly one runner may ever set it. Keying
 * off the pathname also means a browser-back out of a running match restores the
 * navigation on its own, with nothing to unset — the failure ExamRunner's
 * cleanup effect exists to prevent simply cannot happen here.
 */
export function isGameRunRoute(pathname: string): boolean {
  return pathname.startsWith("/game/") && !isGameReviewRoute(pathname);
}

/**
 * The screen a finished competition leaves behind: what each side answered, and
 * the photograph of the working they did on paper.
 *
 * CARVED OUT OF isGameRunRoute FOR ONE REASON — the mentor. It is still a focus
 * screen (isFocusRoute names it directly), because it is full-screen and has its
 * own way out; what it is NOT is an assessment. By the time anyone is here the
 * score is recorded and the database refuses a second attempt, so there is
 * nothing left to measure and "why is that the right answer?" is exactly the
 * lesson case KruAI is kept available inside a lesson for.
 *
 * A STATIC PREFIX, like the two run routes, so `/game/review/:id` cannot collide
 * with them and the whole family stays free of the `/lessons/:lessonId` versus
 * bare `/lessons/:subjectId` ambiguity pages/subject-path.tsx documents.
 *
 * NOTE THE ONE SEAM THIS LEAVES: the run routes navigate HERE when they finish,
 * so the mentor becomes available at the moment the URL changes rather than the
 * moment the run ends. That is the correct boundary — it is the same instant the
 * result stops being in progress — but it does mean the review is the first
 * screen in the flow where the FAB reappears.
 */
export function isGameReviewRoute(pathname: string): boolean {
  return pathname.startsWith("/game/review/");
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
 *
 * `/practice/review` — the Daily Review aggregate, pulling due cards from
 * every deck at once rather than one lesson's — is a FOURTH task screen but
 * does not fit this segment-count scheme (it has no :subjectId/:lessonRef to
 * count), so isFocusRoute checks it with a plain exact match instead of
 * routing it through this function. Same non-assessment treatment as here.
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
 *
 * A GAME MATCH COUNTS, which is why this is no longer the placement test alone.
 * A timed duel against a scored opponent is a competition, not a lesson — "a
 * mentor on tap measures the mentor" applies exactly, and unlike a lesson or a
 * practice quiz there is nothing being taught mid-match to ask about. Note this
 * widens the rule by PATHNAME, so the warning about borrowing the store's
 * focusMode flag for a second meaning stays satisfied.
 */
export function isAssessmentRoute(pathname: string): boolean {
  return pathname.startsWith("/placement-test/") || isGameRunRoute(pathname);
}

/**
 * Routes where the student is STUDYING, for the purpose of counting minutes.
 *
 * Deliberately NOT the same set as isFocusRoute(), although it looks like it
 * could be, and the two differences are the whole point:
 *
 *  - **The game review is excluded.** It is a focus route because the screen is
 *    a task frame, but reading back what you both answered afterwards is not
 *    study time by any definition the migration comment would accept.
 *  - **The mock exam is NOT a route at all.** /exam is an ordinary destination
 *    until a question is on screen, so hooks/use-study-timer.ts ORs the store's
 *    `focusMode` flag in — exactly the way useFocusMode() already does, and for
 *    the same reason.
 *
 * WHAT IS DELIBERATELY ABSENT, and this is the decision to not quietly reverse:
 * the KruAI overlay. Asking the mentor a question IS studying, but the overlay
 * is global, has no natural end, and is the single easiest place in the app to
 * leave open on a pocketed phone. Counting it would reopen the hole this whole
 * metric exists to close. So the figure UNDERCOUNTS, which is the only direction
 * a defeatable number is allowed to be wrong in.
 */
export function isStudyRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/lessons/") ||
    pathname.startsWith("/sections/") ||
    pathname === "/practice/review" ||
    isPracticeRunRoute(pathname) ||
    pathname.startsWith("/placement-test/")
  );
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

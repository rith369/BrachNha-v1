/**
 * Which screen the student had open when they asked KruAI a question.
 *
 * This is the cheapest grounding signal the app has and by some distance the
 * most precise: a student reading /sections/biology-3-1-1 and asking "why does
 * this happen?" has told us exactly which 7,000 characters of curriculum the
 * question is about, with no model in the loop and no latency at all. The
 * handler turns a validated ref into pinned context — see cleanScreen() in
 * server/chat-handler.ts.
 *
 * Pure functions only; this is `utils/`, not `lib/`. Nothing here reads the
 * store or the router — the caller passes a pathname.
 *
 * RELATIVE IMPORTS ONLY, and no imports at all today. This module is reachable
 * from the Vercel serverless function (api/chat.ts -> server/chat-handler.ts ->
 * here) and that bundler reads the root tsconfig.json, which carries no `paths`.
 * An `@/` import here fails the deploy build. Same note as chat-prompt.ts.
 *
 * The route shapes below mirror utils/focus-routes.ts and defaultMathLayout in
 * utils/math-input.ts. They are deliberately re-derived rather than imported:
 * those two answer "hide the navigation" and "which math keyboard", and folding
 * a third question into them would mean one regex serving three callers that
 * are free to disagree. What must NOT drift is the trailing-slash rule, which
 * is repeated here for the same reason focus-routes.ts states it.
 */

/**
 * A screen, as far as the mentor is concerned. Every field optional: "the
 * student is on Home" is a perfectly ordinary answer and renders as `{}`.
 *
 * These are ids, NOT display text. Nothing here is ever interpolated into the
 * prompt — the handler validates each one against the app's own content and
 * sends what the lookup found. See cleanScreen() for why that distinction
 * decides how they are sanitised.
 */
export interface ScreenRef {
  /** `/sections/:sectionId` — a section of the real curriculum, e.g. "biology-3-1-1". */
  sectionId?: string;
  /** `/lessons/:lessonId` — one of the legacy 7-step lessons, e.g. "biology-brain". */
  lessonId?: string;
  /** The subject in view. DERIVED from the ids above where possible, so it
   *  cannot disagree with them; only `/subjects/:subjectId` supplies it alone. */
  subjectId?: string;
  /** `/practice/:mode/:subjectId/:lessonRef` — the deck or quiz being worked
   *  through, keyed the way data/practice.ts keys it: "biology-1-1". */
  practiceKey?: string;
}

/** Path segments with the empties dropped, so a trailing slash changes nothing. */
function segmentsOf(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/**
 * The subject an id belongs to.
 *
 * Every content id in the app is `{subject}-{rest}` — "biology-3-1-1",
 * "biology-brain", "math-limits" — so the subject is the first segment. This is
 * the same derivation buildKnowledgeBlock already does for section ids, and the
 * same one sessionStatus() relies on.
 *
 * Returns "" rather than throwing on a malformed id. The caller validates
 * membership anyway; this only has to be consistent.
 */
function subjectOf(id: string): string {
  return id.split("-")[0] ?? "";
}

/**
 * The screen a pathname describes.
 *
 * Read at SEND time rather than when the overlay mounts. ChatOverlay is global
 * and survives navigation — `chatOpen` is a store field precisely so a lesson
 * is not unmounted underneath it — so a student can open the mentor on a
 * section, navigate behind it and then ask. Where they are now is the answer.
 */
export function screenRefFor(pathname: string): ScreenRef {
  const parts = segmentsOf(pathname);
  if (!parts.length) return {};

  const [head, ...rest] = parts;

  // /sections/:sectionId — one section of the real curriculum. The richest
  // signal there is, since SECTION_CONTENT holds the full authored prose.
  if (head === "sections" && rest[0]) {
    return { sectionId: rest[0], subjectId: subjectOf(rest[0]) };
  }

  // /lessons/:lessonId, WITH the id. Bare /lessons is the subject grid — a
  // place, not a lesson — and must not be mistaken for one. Same trailing-slash
  // rule isFocusRoute() applies, and the reason `rest[0]` is tested rather than
  // `head === "lessons"` alone.
  if (head === "lessons" && rest[0]) {
    return { lessonId: rest[0], subjectId: subjectOf(rest[0]) };
  }

  // /subjects/:subjectId — the session path. The student is CHOOSING here
  // rather than reading, so there is no prose to pin; the subject alone still
  // tells the mentor which half of the catalog matters.
  if (head === "subjects" && rest[0]) {
    return { subjectId: rest[0] };
  }

  // /practice/:mode/:subjectId/:lessonRef — the deck or quiz itself. Four
  // segments, matching isPracticeRunRoute()'s segment count: the two shallower
  // /practice/ routes are places rather than tasks, and /practice/review is the
  // cross-subject aggregate with no single subject to name.
  if (head === "practice" && rest.length >= 3) {
    const [, subjectId, lessonRef] = rest;
    // The content key data/practice.ts uses: "biology" + "1-1" -> "biology-1-1",
    // the same prefix sectionsFor() generates for section ids.
    return { subjectId, practiceKey: `${subjectId}-${lessonRef}` };
  }

  // /practice/:mode/:subjectId — the lesson list. A place, but it names a
  // subject, which is worth keeping.
  if (head === "practice" && rest.length === 2) {
    return { subjectId: rest[1] };
  }

  return {};
}

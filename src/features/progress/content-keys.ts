import { SUBJECTS, type SubjectId } from "@/features/lessons/subjects";

/**
 * Parsing a content key back into a subject — THE ONLY PLACE THAT IS ALLOWED
 * TO HAPPEN.
 *
 * The app already scatters `id.split("-")[0]` around (section-detail.tsx for
 * navigation, chat-screen.ts, sessions.ts), and every one of those is correct
 * only because of a property that is nowhere enforced by a type: every
 * SubjectId is a single token with no hyphen in it. Keeping the parse in one
 * pure module means the Progress numbers cannot start attributing questions to
 * the wrong subject the day a subject id like `earth-science` is added — a
 * lookup against the real catalog fails loudly instead of silently returning
 * "earth".
 */

const SUBJECT_IDS = new Set<string>(SUBJECTS.map((s) => s.id));

/**
 * The subject a content key belongs to, or null when it isn't one.
 *
 * Returns null rather than guessing, and that is what stops a student-authored
 * flashcard id — `crypto.randomUUID()`, no subject anywhere in it — being
 * attributed to whatever its first hyphen-separated chunk happens to spell.
 * Callers drop the null rows; an unattributable card counts toward nothing
 * rather than toward the wrong thing.
 */
export function subjectOfKey(key: string): SubjectId | null {
  const head = key.split("-")[0];
  return SUBJECT_IDS.has(head) ? (head as SubjectId) : null;
}

/**
 * Any content id collapsed to its LESSON key — the first three segments, or
 * the whole string when it has fewer:
 *
 *   "biology-3-1-1" (section)      -> "biology-3-1"
 *   "biology-1-1"   (deck key)     -> "biology-1-1"   (already a lesson key)
 *   "biology-brain" (legacy lesson)-> "biology-brain"
 *   "biology"       (whole subject)-> "biology"
 *
 * Lesson grain rather than subject grain because the call sites already hold a
 * lesson key: collapsing to the subject would mean calling subjectOfKey() at
 * every write and throwing the rest away, which is not less code. Nothing reads
 * the lesson grain yet — Focus Areas, which would, is still demo data — so this
 * is headroom, not a feature.
 */
export function lessonKeyOf(id: string): string {
  const parts = id.split("-");
  return parts.length <= 3 ? id : parts.slice(0, 3).join("-");
}

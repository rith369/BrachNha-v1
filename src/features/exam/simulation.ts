import { PAST_PAPER_YEARS } from "@/data/past-papers";
import { allSubjects } from "@/features/lessons/subjects";
import { MAX_EXAM_LEAVES } from "@/hooks/use-leave-guard";
import type {
  SimulationAttempt,
  SimulationSessionId,
  SimulationSitting,
} from "@/lib/store";
import { contentEntry, type ContentManifest } from "@/utils/content-manifest";
import { paperKey, parsePaperKey } from "./papers";

/**
 * The 2-day Bac II Simulation: the timetable, which paper fills each session, and
 * how the sittings add up to a grade. PURE, like paper-scoring.ts, so the briefing,
 * the sitting screen and the result cannot disagree.
 *
 * THE PAPERS ARE NOT HERE, and that is the point. Each session takes a published
 * paper for its subject from the manifest, so publishing the papers on Admin →
 * Content is all it takes to turn the simulation on, with no code change.
 */

export interface SimulationSession {
  id: SimulationSessionId;
  day: 1 | 2;
  minutes: number;
  /** What the real exam marks this subject out of. */
  points: number;
  timeSlot: string;
}

/** The science track's timetable, in the order it is sat. */
export const SIMULATION_SESSIONS: readonly SimulationSession[] = [
  { id: "history", day: 1, minutes: 60, points: 50, timeSlot: "07:30 - 08:30" },
  { id: "biology", day: 1, minutes: 90, points: 75, timeSlot: "09:00 - 10:30" },
  { id: "chemistry", day: 1, minutes: 90, points: 75, timeSlot: "14:00 - 15:30" },
  { id: "language", day: 1, minutes: 60, points: 50, timeSlot: "16:00 - 17:00" },
  { id: "khmer", day: 2, minutes: 90, points: 75, timeSlot: "07:30 - 09:00" },
  { id: "physics", day: 2, minutes: 90, points: 75, timeSlot: "09:30 - 11:00" },
  { id: "math", day: 2, minutes: 150, points: 125, timeSlot: "14:00 - 16:30" },
];

export const SIMULATION_SESSION_BY_ID = Object.fromEntries(
  SIMULATION_SESSIONS.map((session) => [session.id, session])
) as Record<SimulationSessionId, SimulationSession>;

/** The foreign language is extra: the grade is out of the other six subjects. */
export const SIMULATION_BASE_POINTS = 475;

export type SimulationGrade = "A" | "B" | "C" | "D" | "E" | "F";

/** Lowest score out of SIMULATION_BASE_POINTS for each grade, best first. */
export const SIMULATION_GRADES: readonly {
  grade: SimulationGrade;
  min: number;
  minPct: number;
  fill: string;
}[] = [
  { grade: "A", min: 427, minPct: 90, fill: "bg-neo-mint" },
  { grade: "B", min: 380, minPct: 80, fill: "bg-neo-blue" },
  { grade: "C", min: 332, minPct: 70, fill: "bg-neo-yellow" },
  { grade: "D", min: 285, minPct: 60, fill: "bg-neo-orange" },
  { grade: "E", min: 237, minPct: 50, fill: "bg-neo-red" },
  { grade: "F", min: 0, minPct: 0, fill: "bg-neo-pink" },
];

export interface SimulationPlan {
  /** One per session that has a paper, in timetable order. */
  sittings: SimulationSitting[];
  /** Sessions with no published paper. Empty means students can start. */
  missing: SimulationSession[];
}

/** The subject a session is sat in: the foreign language is the student's own. */
function sessionSubjectId(session: SimulationSession, userLanguage: string | undefined) {
  if (session.id !== "language") return session.id;
  return (
    allSubjects(userLanguage).find((s) => s.id === "english" || s.id === "french")?.id ??
    "english"
  );
}

/**
 * Which paper fills each session. Of a subject's published papers it takes the one
 * this student has met least in earlier attempts, newest first on a tie, so a
 * second simulation is not the same exam again once there are several years.
 */
export function planSimulation(
  userLanguage: string | undefined,
  manifest: ContentManifest,
  past: readonly SimulationAttempt[]
): SimulationPlan {
  const met = new Map<string, number>();
  for (const attempt of past) {
    for (const s of attempt.sittings) met.set(s.paperKey, (met.get(s.paperKey) ?? 0) + 1);
  }

  const plan: SimulationPlan = { sittings: [], missing: [] };
  for (const session of SIMULATION_SESSIONS) {
    let best: SimulationSitting | null = null;
    for (const year of PAST_PAPER_YEARS) {
      const key = paperKey(year, sessionSubjectId(session, userLanguage));
      const entry = contentEntry(manifest, "paper", key);
      if (!entry || entry.count === 0) continue;
      if (!best || (met.get(key) ?? 0) < (met.get(best.paperKey) ?? 0)) {
        best = { sessionId: session.id, paperKey: key, version: entry.version };
      }
    }
    if (best) plan.sittings.push(best);
    else plan.missing.push(session);
  }
  return plan;
}

/** The unfinished attempt, if there is one. A student has at most one. */
export function activeSimulation(
  attempts: readonly SimulationAttempt[]
): SimulationAttempt | undefined {
  return attempts.findLast((attempt) => attempt.finishedAt === null);
}

/** The sitting to do next: papers are sat in timetable order. */
export function currentSitting(attempt: SimulationAttempt): SimulationSitting | undefined {
  return attempt.sittings.find((sitting) => !sitting.result);
}

export function simulationGrade(outOf475: number): (typeof SIMULATION_GRADES)[number] {
  return (
    SIMULATION_GRADES.find((band) => outOf475 >= band.min) ??
    SIMULATION_GRADES[SIMULATION_GRADES.length - 1]
  );
}

export interface SimulationRow {
  sitting: SimulationSitting;
  session: SimulationSession;
  subjectName: string;
  /** Marks earned, out of `session.points`. */
  earned: number;
  pct: number;
  /** The paper ended because the student left the screen too many times. */
  endedEarly: boolean;
  /** Never sat, because the 2 days ran out. Scores 0, with nothing to review. */
  missed: boolean;
}

export interface SimulationOutcome {
  rows: SimulationRow[];
  /** Out of SIMULATION_BASE_POINTS, whatever the foreign language scored. */
  base: number;
  pct: number;
  band: (typeof SIMULATION_GRADES)[number];
  /** Papers the 2 days ran out on. */
  missed: number;
}

const oneDecimal = (n: number) => Math.round(n * 10) / 10;

/**
 * How the sittings add up.
 *
 * THE MARKS ARE AN ESTIMATE, and the result screen says so. The app marks tapped
 * answers, so a subject's marks are its share of questions correct, scaled to what
 * the real exam marks it out of, not marks a teacher gave. An admin's test run has
 * subjects missing, so it scales up from the ones it has. A paper the 2 days ran
 * out on is different: the student had it and did not sit it, so it counts as 0.
 */
export function simulationOutcome(attempt: SimulationAttempt): SimulationOutcome {
  const rows: SimulationRow[] = [];
  for (const sitting of attempt.sittings) {
    const { result } = sitting;
    const session = SIMULATION_SESSION_BY_ID[sitting.sessionId];
    rows.push({
      sitting,
      session,
      subjectName: parsePaperKey(sitting.paperKey)?.subject.name ?? sitting.paperKey,
      earned: oneDecimal(
        !result || result.total === 0 ? 0 : (result.score / result.total) * session.points
      ),
      pct: result?.pct ?? 0,
      endedEarly: !!result && result.leaves > MAX_EXAM_LEAVES,
      missed: !result,
    });
  }

  const graded = rows.filter((row) => row.session.id !== "language");
  const outOf = graded.reduce((sum, row) => sum + row.session.points, 0);
  const earned = graded.reduce((sum, row) => sum + row.earned, 0);
  const base = oneDecimal(outOf === 0 ? 0 : (earned / outOf) * SIMULATION_BASE_POINTS);

  return {
    rows,
    base,
    pct: Math.round((base / SIMULATION_BASE_POINTS) * 100),
    band: simulationGrade(base),
    missed: rows.filter((row) => row.missed).length,
  };
}

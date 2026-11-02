/**
 * The answers so far on the Simulation paper being sat, so a reload or a closed
 * app does not lose them: the clock keeps running, so the work has to survive too.
 *
 * A DEVICE FACT IN ITS OWN KEY, like lib/intro-seen.ts, not a store field. It
 * changes on every tap, and a store write re-serialises the whole store and arms
 * the sync. It is keyed by attempt and session, so it can never be read as another
 * paper's answers. Losing it costs the answers on one paper, never the attempt.
 */

const STORAGE_KEY = "brachnha-simulation-draft";

export interface SimulationDraft {
  attemptId: string;
  sessionId: string;
  answers: Record<string, string>;
  /** Counted absences so far. Coming back to the paper adds one more. */
  leaves: number;
  /** The step the student was on. */
  index: number;
}

export function readSimulationDraft(
  attemptId: string,
  sessionId: string
): SimulationDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<SimulationDraft> | null;
    if (
      draft?.attemptId !== attemptId ||
      draft.sessionId !== sessionId ||
      typeof draft.answers !== "object" ||
      draft.answers === null ||
      !Object.values(draft.answers).every((v) => typeof v === "string") ||
      !Number.isSafeInteger(draft.leaves) ||
      !Number.isSafeInteger(draft.index) ||
      (draft.index as number) < 0
    ) {
      return null;
    }
    return draft as SimulationDraft;
  } catch {
    return null;
  }
}

export function writeSimulationDraft(draft: SimulationDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Private mode or a full disk: the paper still runs, it just won't survive a reload.
  }
}

export function clearSimulationDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keyed by attempt, so a stale draft is never read as another paper's.
  }
}

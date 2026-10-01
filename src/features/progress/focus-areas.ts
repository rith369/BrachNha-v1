import type { SubjectId } from "@/features/lessons/subjects";
import type { ProgressSummary } from "./summary";

/**
 * The Focus Areas card, from the student's own scores.
 *
 * SUBJECT GRAIN, deliberately. The demo version named topics ("Oxidation
 * States"), a grain nothing in the app records. Lesson grain exists in the
 * content log but is ambiguous for maths: the Bac II quiz path and the
 * foundation Study path both write `math-1-1`. A subject is the finest grain
 * that is both recorded and unambiguous.
 *
 * Each row appears only when it has something true to say, so a student with
 * one scored subject sees one row ("strongest"), not that subject named as
 * both their best and their worst.
 */

export type FocusLabel = "needWork" | "strongest" | "declining" | "improved";

export interface FocusArea {
  label: FocusLabel;
  kind: "weak" | "strong";
  subject: SubjectId;
  /** A score row carries `pct`; a movement row carries `pts`. */
  pct: number | null;
  pts: number | null;
}

export function buildFocusAreas(summary: ProgressSummary): FocusArea[] {
  const scored: { subject: SubjectId; score: number }[] = [];
  const trending: { subject: SubjectId; pts: number }[] = [];
  for (const [subject, stat] of Object.entries(summary.subjects)) {
    if (stat.score !== null) scored.push({ subject: subject as SubjectId, score: stat.score });
    if (stat.trendPct !== null && stat.trendPct !== 0) {
      trending.push({ subject: subject as SubjectId, pts: stat.trendPct });
    }
  }
  scored.sort((a, b) => a.score - b.score);
  trending.sort((a, b) => a.pts - b.pts);

  const rows: FocusArea[] = [];
  const weakest = scored[0];
  const strongest = scored[scored.length - 1];
  if (weakest && scored.length > 1) {
    rows.push({ label: "needWork", kind: "weak", subject: weakest.subject, pct: weakest.score, pts: null });
  }
  if (strongest) {
    rows.push({ label: "strongest", kind: "strong", subject: strongest.subject, pct: strongest.score, pts: null });
  }
  const falling = trending[0];
  if (falling && falling.pts < 0) {
    rows.push({ label: "declining", kind: "weak", subject: falling.subject, pct: null, pts: falling.pts });
  }
  const rising = trending[trending.length - 1];
  if (rising && rising.pts > 0) {
    rows.push({ label: "improved", kind: "strong", subject: rising.subject, pct: null, pts: rising.pts });
  }
  return rows;
}

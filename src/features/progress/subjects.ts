import type { LucideIcon } from "lucide-react";
import { T } from "@/data/translations";
import { allSubjects, type SubjectId } from "@/features/lessons/subjects";
import { subjectStats, type SubjectStats } from "./demo-data";

/**
 * The Progress dashboard's subject rows, DERIVED from the app's own catalog.
 *
 * This page used to carry its own list, and it had drifted: a "Geo" bar for a
 * subject the app has never had (no lessons, no exam papers, no colour token,
 * no translation key), the other four abbreviated differently in the chart than
 * in the list below it, history/Khmer/the language subject missing entirely,
 * and colours taken from the five shared brand accents — which is the exact
 * thing features/lessons/subject-styles.ts exists to stop, since two subjects
 * sharing an accent makes colour useless as a subject cue.
 *
 * Everything except the numbers now comes from one place:
 *
 *   - the LIST and its ORDER from allSubjects(), so the student's chosen
 *     language subject appears and the other one doesn't — the same call the
 *     Study, Exam and Practice pages make;
 *   - the NAME from translations' English column;
 *   - the SHORT LABEL from SHORT_LABEL below, for the bar chart's axis;
 *   - the ICON from the catalog's own SubjectMeta, replacing four hand-picked
 *     emoji — the swap the rest of the app already made, because emoji render
 *     differently on every handset;
 *   - the COLOUR from the per-subject scale.
 *
 * ALWAYS ENGLISH, not `T[lang]` — this is a deliberate reversal from an earlier
 * version of this file. Every other label on this page ("Overall Readiness",
 * "Questions Answered", the "📈 Progress" title) is a hardcoded English string;
 * nothing here reads the store's `lang`. Following `lang` for the subject names
 * only would have made them switch to Khmer while every surrounding word on the
 * same card stayed English — a new inconsistency, not the fix this page needed.
 * If the whole dashboard is localized later, revisit this alongside that work.
 *
 * Only `subjectStats` is invented, and the PreviewTag on this page is what says
 * so. When real per-subject tracking exists, this function keeps its shape and
 * only that import changes.
 */
export interface ProgressSubject extends SubjectStats {
  id: SubjectId;
  name: string;
  /** "Chem", "Phys" — for the bar chart's axis, where a full name doesn't fit. */
  shortLabel: string;
  icon: LucideIcon;
  /**
   * The per-theme `--color-subj-*` scale, NOT the raw `--subject-*` hex. These
   * values are a score in coloured text, a progress fill and sparkline bars on
   * a card — never white text sitting on a fill — which is the half of the
   * split that has to be contrast-corrected per theme. See the long note in
   * globals.css. Referenced as a bare var() because these are inline styles and
   * an SVG stroke; Tailwind cannot see a class assembled at runtime anyway.
   */
  color: string;
}

/**
 * Short axis labels for the bar chart ONLY — never shown as a subject's real
 * name anywhere else (SubjectBreakdown uses the full `name`). This is a single
 * consistent map, unlike the old chart's own hand-picked "Chem"/"Phys" that had
 * already drifted from the "Chemistry"/"Physics" the list below it used.
 */
const SHORT_LABEL: Record<SubjectId, string> = {
  math: "Math",
  physics: "Phys",
  chemistry: "Chem",
  biology: "Bio",
  history: "Hist",
  khmer: "Khmer",
  english: "Eng",
  french: "Fr",
};

export function progressSubjects(userLanguage: string | undefined): ProgressSubject[] {
  return allSubjects(userLanguage).map((s) => ({
    ...subjectStats[s.id],
    id: s.id,
    name: T.en[s.id],
    shortLabel: SHORT_LABEL[s.id],
    icon: s.icon,
    color: `var(--color-subj-${s.id})`,
  }));
}

/** "▲ +6%" / "▼ -2%", from the one signed number the stats actually carry. */
export function trendLabel(trendPct: number): string {
  return trendPct >= 0 ? `▲ +${trendPct}%` : `▼ ${trendPct}%`;
}

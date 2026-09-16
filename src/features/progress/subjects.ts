import type { LucideIcon } from "lucide-react";
import { T } from "@/data/translations";
import { allSubjects, type SubjectId } from "@/features/lessons/subjects";
import type { ProgressSummary, SubjectStat } from "./summary";

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
 * THE NUMBERS ARE REAL NOW. They used to come from demo-data.ts's hand-written
 * `subjectStats`; they come from the student's own contentLog via
 * buildProgressSummary(). The shape of this function did not change when that
 * happened — only where the stats come from — which is what the previous
 * version of this comment predicted.
 *
 * A subject with NO recorded work is absent from `summary.subjects` and gets
 * ZEROED stats with every derived figure null. It still gets a row: dropping
 * untouched subjects would make a missing subject read as one BrachNha does not
 * teach, which is the mirror image of the geography bug above.
 */
export interface ProgressSubject extends SubjectStat {
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

/** A subject the student has not worked on yet. Not "zero score" — `null`
 *  everywhere a percentage would otherwise be invented. */
const NOT_STARTED: SubjectStat = {
  questions: 0,
  correct: 0,
  score: null,
  trendPct: null,
  sparkline: null,
  sessions: 0,
};

export function progressSubjects(
  summary: ProgressSummary,
  userLanguage: string | undefined
): ProgressSubject[] {
  return allSubjects(userLanguage).map((s) => ({
    ...(summary.subjects[s.id] ?? NOT_STARTED),
    id: s.id,
    name: T.en[s.id],
    shortLabel: SHORT_LABEL[s.id],
    icon: s.icon,
    color: `var(--color-subj-${s.id})`,
  }));
}

/**
 * "▲ +6 pts" / "▼ -2 pts" / "no change", from the one signed number the stats
 * carry.
 *
 * ZERO GETS ITS OWN BRANCH. With demo data the trend was never actually 0, so
 * `>= 0` folding it in with the rises was invisible; with real data two windows
 * scoring the same is common, and "▲ +0%" paints a green up-arrow on a subject
 * that has not moved.
 *
 * "pts", not "%": this is a difference between two percentages, so 70 → 76 is
 * six POINTS. Calling that "+6%" would be a different and wrong number.
 */
export function trendLabel(trendPct: number): string {
  if (trendPct === 0) return "no change";
  return trendPct > 0 ? `▲ +${trendPct} pts` : `▼ ${trendPct} pts`;
}

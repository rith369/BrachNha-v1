import type { LucideIcon } from "lucide-react";
import { T } from "@/data/translations";
import type { Lang } from "@/types";
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
 *   - the NAME from translations.ts, in the page's language;
 *   - the SHORT LABEL from SHORT_LABEL below, for the bar chart's axis;
 *   - the ICON from the catalog's own SubjectMeta, replacing four hand-picked
 *     emoji — the swap the rest of the app already made, because emoji render
 *     differently on every handset;
 *   - the COLOUR from the per-subject scale.
 *
 * THE NAME FOLLOWS `lang` NOW. It was deliberately held in English while every
 * other label on this page was a hardcoded English string — switching only the
 * names would have put Khmer words inside English cards. The whole page follows
 * `lang` since the user asked for it (see ./copy.ts), so the names do too; that
 * is the "revisit alongside that work" this paragraph used to promise.
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
 *
 * The Khmer column is the short forms Cambodian classrooms already say — រូប for
 * រូបវិទ្យា, ជីវៈ for ជីវវិទ្យា — because seven upright bars leave each label
 * about 36px at the 320px floor.
 */
const SHORT_LABEL: Record<Lang, Record<SubjectId, string>> = {
  en: {
    math: "Math",
    physics: "Phys",
    chemistry: "Chem",
    biology: "Bio",
    history: "Hist",
    khmer: "Khmer",
    english: "Eng",
    french: "Fr",
  },
  km: {
    math: "គណិត",
    physics: "រូប",
    chemistry: "គីមី",
    biology: "ជីវៈ",
    history: "ប្រវត្តិ",
    khmer: "ខ្មែរ",
    english: "អង់គ្លេស",
    french: "បារាំង",
  },
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
  reviewed: 0,
};

export function progressSubjects(
  summary: ProgressSummary,
  userLanguage: string | undefined,
  lang: Lang
): ProgressSubject[] {
  return allSubjects(userLanguage).map((s) => ({
    ...(summary.subjects[s.id] ?? NOT_STARTED),
    id: s.id,
    name: T[lang][s.id],
    shortLabel: SHORT_LABEL[lang][s.id],
    icon: s.icon,
    color: `var(--color-subj-${s.id})`,
  }));
}

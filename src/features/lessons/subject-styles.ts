import type { SubjectId } from "./subjects";

/**
 * Per-subject colour. Tailwind cannot see a class assembled at runtime, so every
 * variant is spelled out rather than interpolated as `bg-subj-${id}`.
 *
 * TWO SCALES, and they are not interchangeable — see the long note in
 * globals.css:
 *
 *   `subj-*`            contrast-corrected per theme. Card tint, border, small
 *                       icons, placeholder art. Passes AA in light AND dark.
 *   `var(--subject-*)`  the supplied hex, identical in both themes. Used ONLY
 *                       where it is a fill under a white glyph or white text —
 *                       the one role the raw value is correct for.
 *
 * The supplied palette is Tailwind-500 shades. As small text on the page
 * background all eight fail AA (2.1:1–4.2:1), which is why `subj-*` exists
 * rather than the hexes being used directly everywhere.
 *
 * THIS LIVES IN A .ts FILE ON PURPOSE. A non-component export from a .tsx trips
 * oxlint's `only-export-components` fast-refresh rule, which the repo already
 * carries once in components/ui/button.tsx and shouldn't grow a second time —
 * the same reason utils/focus-styles.ts exists.
 *
 * TWO CONSUMERS: the Study page's subject tile (all four fields), and the exam
 * page's past-paper card (`art` and `fill` only — its card shell is the app's
 * neutral bg-surface, matching the reference design).
 *
 * Typed as a full Record rather than `as const`: a ninth subject then fails to
 * compile if its row is missing, instead of blowing up at runtime on
 * `undefined.card`. The literal types `as const` gave were never consumed.
 */
export interface SubjectStyle {
  /** Card tint + border. */
  card: string;
  /** Small text and icons. */
  text: string;
  /** The artwork placeholder's gradient stops. */
  art: string;
  /** Solid fill for a white glyph to sit on. Inline style — see below. */
  fill: string;
}

export const SUBJECT_STYLE: Record<SubjectId, SubjectStyle> = {
  math: {
    card: "border-subj-math/20 bg-subj-math/8",
    text: "text-subj-math",
    art: "from-subj-math/25 to-subj-math/5",
    fill: "var(--subject-math)",
  },
  physics: {
    card: "border-subj-physics/20 bg-subj-physics/8",
    text: "text-subj-physics",
    art: "from-subj-physics/25 to-subj-physics/5",
    fill: "var(--subject-physics)",
  },
  chemistry: {
    card: "border-subj-chemistry/20 bg-subj-chemistry/8",
    text: "text-subj-chemistry",
    art: "from-subj-chemistry/25 to-subj-chemistry/5",
    fill: "var(--subject-chemistry)",
  },
  biology: {
    card: "border-subj-biology/20 bg-subj-biology/8",
    text: "text-subj-biology",
    art: "from-subj-biology/25 to-subj-biology/5",
    fill: "var(--subject-biology)",
  },
  history: {
    card: "border-subj-history/20 bg-subj-history/8",
    text: "text-subj-history",
    art: "from-subj-history/25 to-subj-history/5",
    fill: "var(--subject-history)",
  },
  khmer: {
    card: "border-subj-khmer/20 bg-subj-khmer/8",
    text: "text-subj-khmer",
    art: "from-subj-khmer/25 to-subj-khmer/5",
    fill: "var(--subject-khmer)",
  },
  english: {
    card: "border-subj-english/20 bg-subj-english/8",
    text: "text-subj-english",
    art: "from-subj-english/25 to-subj-english/5",
    fill: "var(--subject-english)",
  },
  french: {
    card: "border-subj-french/20 bg-subj-french/8",
    text: "text-subj-french",
    art: "from-subj-french/25 to-subj-french/5",
    fill: "var(--subject-french)",
  },
};

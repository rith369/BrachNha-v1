/**
 * The on-screen math keyboard's key set.
 *
 * Pure content, no logic — same role as questions.ts / lessons.ts. The panel
 * that renders it lives in components/shell/math-keyboard.tsx and the caret
 * arithmetic in utils/math-input.ts.
 *
 * KEYS INSERT UNICODE, NOT LaTeX. A key labelled √ inserts the character "√",
 * never "\sqrt{}". Two reasons: a Grade 12 student should not have to learn
 * backslash syntax to ask a question, and Unicode is already how math is
 * written everywhere else in the app's own data (questions.ts has "lim(x→0)",
 * "x²", "P(A∩B)"). Gemini reads it fine. LaTeX is output-only — see
 * data/bac2-format.ts for the rules the model answers under.
 *
 * Symbol mode hides the OS keyboard (inputMode="none"), so the digits and
 * brackets a student would normally get from their phone have to be here too.
 * That is why `basic` carries 0-9 and is the default tab.
 */

export type MathTabId = "basic" | "algebra" | "calculus" | "physics" | "chemistry";

export interface MathKey {
  /** What the button shows. */
  label: string;
  /** What gets spliced into the input. Defaults to `label` when omitted. */
  insert?: string;
  /**
   * Where to leave the caret, counted back from the END of `insert`.
   * A bracket pair uses -1 so the cursor lands between the brackets:
   * `{ label: "( )", insert: "()", caret: -1 }`.
   */
  caret?: number;
  /** Renders the key double-width in the 6-column grid. */
  wide?: boolean;
}

export interface MathTab {
  id: MathTabId;
  /** Language-neutral glyph shown next to the translated label. */
  icon: string;
  keys: MathKey[];
}

export const MATH_TABS: MathTab[] = [
  {
    id: "basic",
    icon: "123",
    keys: [
      { label: "1" },
      { label: "2" },
      { label: "3" },
      { label: "4" },
      { label: "5" },
      { label: "6" },
      { label: "7" },
      { label: "8" },
      { label: "9" },
      { label: "0" },
      { label: "." },
      { label: "," },
      // Labelled with the typographic minus, inserts ASCII "-". The model and
      // the app's own question data both use ASCII here.
      { label: "+" },
      { label: "−", insert: "-" },
      { label: "×" },
      { label: "÷" },
      { label: "/" },
      { label: "=" },
      { label: "≠" },
      { label: "<" },
      { label: ">" },
      { label: "≤" },
      { label: "≥" },
      { label: "±" },
      { label: "( )", insert: "()", caret: -1 },
      { label: "[ ]", insert: "[]", caret: -1 },
      { label: "%" },
      { label: "°" },
      { label: "√", insert: "√()", caret: -1 },
      { label: "π" },
      { label: "∞" },
      { label: "→" },
      { label: "x" },
      { label: "y" },
    ],
  },
  {
    id: "algebra",
    icon: "x²",
    keys: [
      { label: "x" },
      { label: "y" },
      { label: "z" },
      { label: "a" },
      { label: "b" },
      { label: "n" },
      { label: "²" },
      { label: "³" },
      { label: "ⁿ" },
      { label: "⁻¹" },
      { label: "^" },
      { label: "_" },
      { label: "√", insert: "√()", caret: -1 },
      // "³√" rather than U+221B ∛ — the single cube-root glyph is missing from
      // a lot of Android system fonts and would show as a tofu box.
      { label: "³√", insert: "³√()", caret: -1 },
      { label: "|x|", insert: "||", caret: -1 },
      { label: "( )", insert: "()", caret: -1 },
      { label: "≈" },
      { label: "≠" },
      { label: "∈" },
      { label: "∉" },
      { label: "∪" },
      { label: "∩" },
      { label: "⊂" },
      { label: "∅" },
      { label: "Σ", insert: "∑" },
      { label: "!" },
      { label: "log", insert: "log()", caret: -1 },
      { label: "ln", insert: "ln()", caret: -1 },
      { label: "f(x)", insert: "f(x)", wide: true },
      { label: "P(A)", insert: "P(A)", wide: true },
    ],
  },
  {
    id: "calculus",
    icon: "∫",
    keys: [
      // The single most-typed pattern in Bac II math, and the one a phone
      // keyboard makes hardest. Caret lands where the target value goes.
      { label: "lim(x→)", insert: "lim(x→)", caret: -1, wide: true },
      { label: "d/dx", insert: "d/dx", wide: true },
      { label: "∫", insert: "∫()", caret: -1 },
      { label: "∑" },
      { label: "∏" },
      { label: "∂" },
      { label: "Δ" },
      { label: "δ" },
      { label: "→" },
      { label: "∞" },
      { label: "+∞" },
      { label: "−∞", insert: "-∞" },
      { label: "≈" },
      { label: "′" },
      { label: "″" },
      { label: "dx" },
      { label: "dy" },
      { label: "dt" },
      { label: "e^", insert: "e^" },
      { label: "ln", insert: "ln()", caret: -1 },
      { label: "( )", insert: "()", caret: -1 },
      { label: "x" },
      { label: "0" },
    ],
  },
  {
    id: "physics",
    icon: "Δ",
    keys: [
      { label: "α" },
      { label: "β" },
      { label: "γ" },
      { label: "δ" },
      { label: "θ" },
      { label: "λ" },
      { label: "μ" },
      { label: "π" },
      { label: "ρ" },
      { label: "σ" },
      { label: "φ" },
      { label: "ω" },
      { label: "Δ" },
      { label: "Ω" },
      { label: "∝" },
      { label: "≈" },
      { label: "±" },
      { label: "°" },
      { label: "²" },
      { label: "³" },
      { label: "→" },
      { label: "√", insert: "√()", caret: -1 },
      { label: "×10^", insert: "×10^", wide: true },
      { label: "m/s²", insert: "m/s²", wide: true },
      { label: "N" },
      { label: "J" },
      { label: "W" },
      { label: "Hz" },
      { label: "V" },
      { label: "A" },
    ],
  },
  {
    id: "chemistry",
    icon: "H₂",
    keys: [
      // Subscript digits are the whole point of this tab — nothing else in the
      // app lets a student type H₂O.
      { label: "₁" },
      { label: "₂" },
      { label: "₃" },
      { label: "₄" },
      { label: "₅" },
      { label: "₆" },
      { label: "⁺" },
      { label: "⁻" },
      { label: "²⁺" },
      { label: "³⁺" },
      { label: "²⁻" },
      { label: "³⁻" },
      { label: "→" },
      { label: "⇌" },
      { label: "↑" },
      { label: "↓" },
      { label: "Δ" },
      { label: "°C" },
      { label: "( )", insert: "()", caret: -1 },
      { label: "[ ]", insert: "[]", caret: -1 },
      { label: "mol" },
      { label: "pH" },
      { label: "H₂O", wide: true },
      { label: "CO₂", wide: true },
    ],
  },
];

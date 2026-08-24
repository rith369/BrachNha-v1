/**
 * Shared sizing for the focus-mode task screens (lesson, mock exam, placement
 * test). Pure string constants — no state, no JSX.
 *
 * They live here rather than in focus-layout.tsx because a non-component export
 * from a .tsx file trips oxlint's `only-export-components` fast-refresh rule,
 * which the repo already carries once in components/ui/button.tsx and shouldn't
 * grow a second time.
 *
 * WHY SHARED: the three screens each render a near-identical question card and
 * option list. Scaling them independently is precisely how they would drift, so
 * the ladder is written once.
 *
 * THE LADDER: phone values are the base and are deliberately untouched — the
 * mobile design is the source of truth. Every step up is md:/lg:-prefixed, so a
 * laptop gets roughly double the type while a phone renders exactly as before.
 * Sized against a real Duolingo lesson: ~24px prompts, ~18px options about 60px
 * tall, in a ~768px column.
 */

/** The panel a question sits in. Keeps the app's card + shadow identity. */
export const focusCard =
  "rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel md:p-6 lg:p-8";

/** Small uppercase label above a prompt (subject name, step name). */
export const focusKicker =
  "text-[11px] font-extrabold tracking-widest uppercase md:text-xs";

/** The question itself — the largest thing on the screen. */
export const focusPrompt =
  "text-base font-extrabold md:text-xl lg:text-2xl";

/** Running prose: lesson content, summaries, explanations. */
export const focusBody = "text-sm font-semibold md:text-base lg:text-lg";

/** The small bold caption heading a tinted block ("Summary", "Fun fact"). */
export const focusLabel = "text-xs font-extrabold md:text-sm";

/**
 * BASE classes for an answer button. Callers append their own state colours
 * (neutral / correct / wrong) through cn() — this deliberately carries no
 * colour of its own.
 */
export const focusOption =
  "rounded-xl border px-4 py-3 text-left text-sm font-bold transition md:px-5 md:py-4 md:text-base lg:py-5 lg:text-lg";

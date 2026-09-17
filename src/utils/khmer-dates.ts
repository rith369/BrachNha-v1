/**
 * Khmer month and weekday NAMES, hand-written rather than taken from `Intl`.
 *
 * Desktop Chrome was measured reporting no Khmer locale data at all —
 * `Intl.DateTimeFormat.supportedLocalesOf(["km"])` is empty — and it formats
 * `km-KH` in English without complaint; Android builds ship trimmed locale data
 * too. So a Khmer date label built with `toLocaleDateString("km-KH")` silently
 * prints English on exactly the devices this audience uses.
 *
 * Lifted out of `features/profile/components/study-calendar.tsx` when the
 * Progress page needed the same months: a component file cannot export a
 * constant without tripping oxlint's `only-export-components`, and a second
 * hand-written copy is how two screens end up spelling a month differently.
 *
 * The short weekday INITIALS (ច, អ, ព…) are not here — they live beside the
 * streak screens that introduced them, `weekdayLabel()` in
 * `features/streak/copy.ts`, and every caller already reads them from there.
 */

/** January first — the index `Date.getMonth()` returns. */
export const KM_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
] as const;

/** Full weekday names, Sunday first — the index `Date.getDay()` returns. */
export const KM_WEEKDAYS = [
  "អាទិត្យ",
  "ច័ន្ទ",
  "អង្គារ",
  "ពុធ",
  "ព្រហស្បតិ៍",
  "សុក្រ",
  "សៅរ៍",
] as const;

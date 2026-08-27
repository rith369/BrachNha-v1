/**
 * ASCII digits → Khmer numerals.
 *
 * Used by the exam page's session (year) chips and its section heading, where
 * the number is Khmer page copy — see EXAM_PAGE_LANG in features/exam/papers.ts.
 *
 * DELIBERATELY NOT APPLIED to scores, percentages or the runner's "Q3/10" meta.
 * Those sit beside Latin-scripted maths content (lim, ∫, 25%, 8/10) and are read
 * as quantities against it; converting them is a separate product decision, not
 * a consistency fix.
 *
 * Non-digits pass through, so "2025-26" → "២០២៥-២៦".
 */
const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";

export function toKhmerDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

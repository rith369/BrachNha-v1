/**
 * The countdown to the Bac II exam.
 *
 * Bac II is a national exam on one fixed date, so there is nothing per-student
 * to ask about — the survey used to make every student pick "months until the
 * exam" from a grid of 1-12, which was a guess on their part AND went stale the
 * moment they made it: a student who answered "12" in August still had "12"
 * stored a year later. Everything now derives from the date below instead, so
 * the number counts down on its own and can never disagree with itself.
 *
 * UPDATING FOR THE NEXT COHORT is a one-line edit here. Nothing else stores a
 * timeline — the ONE exception is `Commitment.months` (types/index.ts), which is
 * a deliberate snapshot of what the student signed up to and must NOT become a
 * live read.
 *
 * Month is 0-indexed in the Date constructor: 7 is August. Local midnight, not
 * UTC, so "days left" matches the calendar the student is actually looking at.
 */
export const BAC2_EXAM_DATE = new Date(2027, 7, 10);

const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Average, so a countdown of 90 days reads as 3 months rather than 2.9. */
const DAYS_PER_MONTH = 30.44;

/** Whole days from today until the exam. Never negative — 0 on the day and after. */
export function daysUntilExam(now: Date = new Date()): number {
  // Both floored to local midnight so the result only changes when the date
  // does. Comparing raw timestamps would tick over at the time of day the
  // student first opened the app.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = BAC2_EXAM_DATE.getTime() - today.getTime();
  return Math.max(0, Math.round(diff / MS_PER_DAY));
}

/**
 * Months until the exam, as the roadmap and daily-mission maths want it: a
 * whole number, and at least 1 even on exam day, because callers divide by it.
 */
export function monthsUntilExam(now: Date = new Date()): number {
  return Math.max(1, Math.round(daysUntilExam(now) / DAYS_PER_MONTH));
}

/** "10 August 2027" / "១០ សីហា ២០២៧" — the date itself, spelled out. */
export function formatExamDate(lang: "en" | "km"): string {
  return BAC2_EXAM_DATE.toLocaleDateString(lang === "en" ? "en-GB" : "km-KH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

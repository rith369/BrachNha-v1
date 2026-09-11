/**
 * The month grid behind the Profile page's study calendar.
 *
 * Pure, and keyed on the same `YYYY-MM-DD` strings as the store's activityLog,
 * so a cell looks its day up with no date arithmetic of its own. Same split as
 * utils/activity-heatmap.ts: the maths here, the drawing in the component.
 *
 * Weeks run SUNDAY → SATURDAY, matching buildHeatmapWeeks, so the app has one
 * idea of where a week starts rather than two screens that disagree.
 */

import { todayKey } from "@/utils/day";

/** `month` is 0–11, the same convention as Date. */
export interface YearMonth {
  year: number;
  month: number;
}

/** Seven day keys, `null` where the month has not started yet or has ended. */
export type MonthWeek = (string | null)[];

export function monthOf(d: Date): YearMonth {
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** Month arithmetic through Date, which carries the year across December and
 *  January for free. */
export function addMonths(ym: YearMonth, delta: number): YearMonth {
  return monthOf(new Date(ym.year, ym.month + delta, 1));
}

/** Negative, zero or positive, like a sort comparator. */
export function compareMonths(a: YearMonth, b: YearMonth): number {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

export function buildMonthGrid({ year, month }: YearMonth): MonthWeek[] {
  const leading = new Date(year, month, 1).getDay();
  // Day 0 of the NEXT month is the last day of this one.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(todayKey(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: MonthWeek[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

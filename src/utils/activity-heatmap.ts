/**
 * Turns the fixed demo counts in features/progress/demo-data.ts into cells with
 * a real calendar date, a colour level, and whether that date is today or still
 * in the future.
 *
 * The grid used to show 28 bare 0-4 numbers with nothing behind them — no date,
 * no real count, nothing a tap could show. Counts now drive the colour instead
 * of the other way around, same reasoning as `daysUntilExam()` in exam-date.ts:
 * derived at render time from "now", never stored, so it can't go stale.
 *
 * The grid is anchored to the CURRENT week (the last row is always this Sun-Sat),
 * counting backward the rest of the way — not to whatever weekday "today"
 * happens to be. That is what lets a cell be classified `isFuture`.
 */

export interface HeatmapCell {
  date: Date;
  count: number;
  /** 0-4, indexes the LEVELS colour scale in activity-heatmap.tsx. */
  level: number;
  isToday: boolean;
  /** This calendar date hasn't happened yet — there is nothing to report. */
  isFuture: boolean;
}

// Buckets match the shape of the original hand-authored 0-4 levels, just
// driven by an actual count now instead of being the count.
function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function buildHeatmapWeeks(
  counts: number[][],
  now: Date = new Date()
): HeatmapCell[][] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - today.getDay());

  const gridStart = new Date(startOfThisWeek);
  gridStart.setDate(startOfThisWeek.getDate() - (counts.length - 1) * 7);

  return counts.map((week, wi) =>
    week.map((count, di) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + wi * 7 + di);
      const isFuture = date.getTime() > today.getTime();

      return {
        date,
        // A future date can't have a real count yet, whatever placeholder sits
        // in the demo array — rendered and reported as empty, not as data.
        count: isFuture ? 0 : count,
        level: isFuture ? 0 : levelForCount(count),
        isToday: date.getTime() === today.getTime(),
        isFuture,
      };
    })
  );
}

export function formatHeatmapCellLabel(cell: HeatmapCell): string {
  const day = cell.isToday
    ? "Today"
    : cell.date.toLocaleDateString("en-GB", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  const activity =
    cell.count === 0 ? "No activity" : `${cell.count} question${cell.count === 1 ? "" : "s"}`;
  return `${day} · ${activity}`;
}

// Also used as the button's own reference/comparison key for "which cell is open".
export function heatmapCellKey(wi: number, di: number): string {
  return `${wi}-${di}`;
}

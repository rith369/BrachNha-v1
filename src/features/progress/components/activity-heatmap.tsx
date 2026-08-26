import { useEffect, useRef, useState } from "react";
import { activityHeatmap } from "../demo-data";
import {
  buildHeatmapWeeks,
  formatHeatmapCellLabel,
  heatmapCellKey,
} from "@/utils/activity-heatmap";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Intensity 0-4 → color (mirrors the original app's --pink-tinted scale).
//
// The one place a hand-tuned per-theme ramp is unavoidable. The light scale
// darkens away from white, so its bottom steps are near-transparent — on a dark
// surface those simply vanish into the card. The dark scale needs a visible
// floor and a shallower climb, because it is brightening rather than darkening.
const LEVELS = [
  "bg-purple/6 dark:bg-purple/14",
  "bg-purple/20 dark:bg-purple/28",
  "bg-purple/40 dark:bg-purple/45",
  "bg-purple/65 dark:bg-purple/70",
  "bg-purple",
];

export function ActivityHeatmap() {
  const weeks = buildHeatmapWeeks(activityHeatmap);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Tap elsewhere, or Escape, closes whichever cell's detail is open. Only
  // wired up while something IS open — no listener sits on every render of a
  // page most students never tap into.
  useEffect(() => {
    if (!openKey) return;

    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setOpenKey(null);
        return;
      }
      if (!gridRef.current?.contains(e.target as Node)) setOpenKey(null);
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [openKey]);

  return (
    <div>
      <div className="mb-3">
        <div className="font-heading text-sm font-extrabold">
          Study Activity 🗓️
        </div>
        <div className="text-[11px] font-bold text-muted">
          Tap a day to see questions answered
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => (
          <div
            key={`lbl-${i}`}
            className="text-center text-[10px] font-extrabold text-muted"
          >
            {d}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            const key = heatmapCellKey(wi, di);
            const open = openKey === key;

            // A day that hasn't happened yet has nothing to report — shown as
            // an empty outline rather than a fabricated 0-level fill, and not
            // tappable, so it reads as "no data" rather than "studied nothing".
            if (cell.isFuture) {
              return (
                <div
                  key={key}
                  aria-hidden="true"
                  className="aspect-square rounded-md border border-dashed border-purple/15"
                />
              );
            }

            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : key)}
                  aria-label={formatHeatmapCellLabel(cell)}
                  aria-expanded={open}
                  className={`aspect-square w-full rounded-md transition-transform active:scale-90 ${LEVELS[cell.level]} ${
                    cell.isToday ? "ring-2 ring-purple/50 ring-offset-1 ring-offset-bg" : ""
                  }`}
                />
                {open && (
                  <div
                    role="tooltip"
                    className={`absolute bottom-full z-30 mb-1.5 rounded-lg border border-purple/15 bg-elevated px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap text-text shadow-panel-sm ${
                      di <= 1 ? "left-0" : di >= 5 ? "right-0" : "left-1/2 -translate-x-1/2"
                    }`}
                  >
                    {formatHeatmapCellLabel(cell)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] font-bold text-muted">Less</span>
        {LEVELS.map((l, i) => (
          <div key={i} className={`size-2.5 rounded-sm ${l}`} />
        ))}
        <span className="text-[10px] font-bold text-muted">More</span>
      </div>
    </div>
  );
}

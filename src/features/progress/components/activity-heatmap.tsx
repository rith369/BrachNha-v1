import { activityHeatmap } from "../demo-data";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Intensity 0-4 → color (mirrors the original app's --pink-tinted scale)
const LEVELS = [
  "bg-purple/6",
  "bg-purple/20",
  "bg-purple/40",
  "bg-purple/65",
  "bg-purple",
];

export function ActivityHeatmap() {
  return (
    <div>
      <div className="mb-3">
        <div className="font-heading text-sm font-extrabold">
          Study Activity 🗓️
        </div>
        <div className="text-[11px] font-bold text-muted">
          Questions answered per day
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => (
          <div
            key={`lbl-${i}`}
            className="text-center text-[10px] font-extrabold text-muted"
          >
            {d}
          </div>
        ))}
        {activityHeatmap.map((week, wi) =>
          week.map((level, di) => (
            <div
              key={`${wi}-${di}`}
              className={`aspect-square rounded-md ${LEVELS[level]}`}
            />
          ))
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

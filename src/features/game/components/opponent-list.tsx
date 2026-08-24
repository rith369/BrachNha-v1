import { opponents } from "../demo-data";
import { Avatar } from "@/components/ui/avatar";

const BORDER_COLOR: Record<string, string> = {
  pink: "border-pink",
  blue: "border-blue",
  mint: "border-mint",
  yellow: "border-yellow",
};

export function OpponentList() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          Challenge Someone 👊
        </div>
        <div className="text-xs font-extrabold text-purple">See all →</div>
      </div>
      <div className="flex flex-col gap-2.5">
        {opponents.map((o) => (
          <div
            key={o.name}
            className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm"
          >
            <Avatar
              seed={o.avatarSeed}
              name={o.name}
              className={`size-11 shrink-0 border-2 ${BORDER_COLOR[o.color]}`}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{o.name}</div>
              <div className="truncate text-[10px] font-bold text-muted">
                {o.meta} · #{o.rank} Ranked
              </div>
              <div className="mt-1 flex gap-2.5 text-[10px] font-extrabold text-muted">
                <span>🏆 {o.wins}W</span>
                <span>Avg {o.avgScore}%</span>
                <span>#{o.rank}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-extrabold text-white">
                🎮 Play
              </button>
              <div className="flex items-center gap-1 text-[9px] font-bold text-muted">
                <span
                  className={`size-1.5 rounded-full ${o.online ? "bg-mint" : "bg-muted/40"}`}
                />
                {o.online ? "Online" : "Away"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

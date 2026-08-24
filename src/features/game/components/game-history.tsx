import { gameHistory } from "../demo-data";
import { Avatar } from "@/components/ui/avatar";

const RESULT_STYLE = {
  WIN: { badge: "bg-mint/15 text-mint", score: "text-mint" },
  LOSS: { badge: "bg-pink/15 text-pink", score: "text-pink" },
  DRAW: { badge: "bg-yellow/15 text-yellow", score: "text-yellow" },
};

export function GameHistory() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          Recent Games 📜
        </div>
        <div className="text-xs font-extrabold text-purple">See all →</div>
      </div>
      <div className="flex flex-col gap-2">
        {gameHistory.map((b, i) => {
          const style = RESULT_STYLE[b.result];
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${style.badge}`}
              >
                {b.result}
              </span>
              <Avatar
                seed={b.avatarSeed}
                name={b.opponentName}
                className="size-9 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold">
                  vs {b.opponentName}
                </div>
                <div className="truncate text-[10px] font-bold text-muted">
                  {b.subject} · 10 questions
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-extrabold ${style.score}`}>
                  {b.score}
                </div>
                <div className="text-[9px] font-bold text-muted">
                  {b.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

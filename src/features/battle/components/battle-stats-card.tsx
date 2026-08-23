import { battleStats } from "../demo-data";

export function BattleStatsCard() {
  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        My Battle Stats 🏅
      </div>
      <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="font-heading text-lg font-extrabold text-mint">
              {battleStats.wins}
            </div>
            <div className="text-[10px] font-bold text-muted">Wins 🏆</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-pink">
              {battleStats.losses}
            </div>
            <div className="text-[10px] font-bold text-muted">Losses 💀</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-yellow">
              {battleStats.draws}
            </div>
            <div className="text-[10px] font-bold text-muted">Draws 🤝</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-purple">
              {battleStats.winRate}%
            </div>
            <div className="text-[10px] font-bold text-muted">Win Rate</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[10px] font-extrabold">
            <span className="text-mint">Wins {battleStats.winPct}%</span>
            <span className="text-yellow">Draw {battleStats.drawPct}%</span>
            <span className="text-pink">Losses {battleStats.lossPct}%</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full">
            <div
              className="h-full bg-mint"
              style={{ width: `${battleStats.winPct}%` }}
            />
            <div
              className="h-full bg-yellow"
              style={{ width: `${battleStats.drawPct}%` }}
            />
            <div
              className="h-full bg-pink"
              style={{ width: `${battleStats.lossPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

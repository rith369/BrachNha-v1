import { LiveBattleCard } from "@/features/battle/components/live-battle-card";
import { BattleStatsCard } from "@/features/battle/components/battle-stats-card";
import { OpponentList } from "@/features/battle/components/opponent-list";
import { BattleHistory } from "@/features/battle/components/battle-history";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function BattlePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="mb-0.5 font-heading pr-14 text-xl font-extrabold">
          Competition ⚔️
        </div>
        <div className="mb-4 pr-14 text-xs font-bold text-muted">
          Battle other students · Bac II Mode
        </div>
        <div className="flex flex-col gap-4">
          <LiveBattleCard />
          <BattleStatsCard />
          <OpponentList />
          <BattleHistory />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

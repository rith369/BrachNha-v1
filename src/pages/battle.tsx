import { LiveBattleCard } from "@/features/battle/components/live-battle-card";
import { BattleStatsCard } from "@/features/battle/components/battle-stats-card";
import { OpponentList } from "@/features/battle/components/opponent-list";
import { BattleHistory } from "@/features/battle/components/battle-history";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function BattlePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        <div className="mb-0.5 font-heading pr-14 text-xl font-extrabold">
          Competition ⚔️
        </div>
        <div className="mb-4 pr-14 text-xs font-bold text-muted">
          Battle other students · Bac II Mode
        </div>
        {/* See pages/progress.tsx for why two columns at lg needs no changes
            inside the cards themselves. */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {/* The live battle card is the page's call to action — full width so
              it stays the first thing read, not one of a pair. */}
          <div className="md:col-span-2">
            <LiveBattleCard />
          </div>
          {/* A grid-cols-4 stat strip, the same shape as Home's StatPills —
              it suits the full row, and spanning it here is what leaves an even
              pair below instead of a half-empty last row. */}
          <div className="md:col-span-2">
            <BattleStatsCard />
          </div>
          <OpponentList />
          <BattleHistory />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

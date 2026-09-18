import { useBrachNhaStore } from "@/lib/store";
import { gameStats } from "../game";
import { gameCopy } from "../copy";

/**
 * This student's record across the competitions they have JOINED.
 *
 * Same markup as the original card — the four-stat strip with its emoji labels
 * and the three-segment bar — but every number is now DERIVED by gameStats()
 * from the attempts themselves rather than hand-authored. The old version
 * carried seven fixed numbers that contradicted each other: `winRate: 75` beside
 * bar segments describing a 69% win share.
 *
 * The caller renders nothing when there are no attempts, so there is no
 * all-zeros state to design here.
 */
export function GameStatsCard() {
  const lang = useBrachNhaStore((s) => s.lang);
  const attempts = useBrachNhaStore((s) => s.competitionAttempts);
  const t = gameCopy(lang);
  const stats = gameStats(attempts);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">{t.myStats}</div>
      <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="font-heading text-lg font-extrabold text-mint">
              {stats.wins}
            </div>
            <div className="text-[10px] font-bold text-muted">{t.wins}</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-pink">
              {stats.losses}
            </div>
            <div className="text-[10px] font-bold text-muted">{t.losses}</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-yellow">
              {stats.draws}
            </div>
            <div className="text-[10px] font-bold text-muted">{t.draws}</div>
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold text-purple">
              {stats.winRate}%
            </div>
            <div className="text-[10px] font-bold text-muted">{t.winRate}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[10px] font-extrabold">
            <span className="text-mint">
              {t.winsShort} {stats.winPct}%
            </span>
            <span className="text-yellow">
              {t.drawShort} {stats.drawPct}%
            </span>
            <span className="text-pink">
              {t.lossesShort} {stats.lossPct}%
            </span>
          </div>
          {/* Three segments from two rounds and a remainder, so they always sum
              to exactly 100 and the bar cannot overflow its own track. */}
          <div className="flex h-2 overflow-hidden rounded-full">
            <div
              className="h-full bg-mint"
              style={{ width: `${stats.winPct}%` }}
            />
            <div
              className="h-full bg-yellow"
              style={{ width: `${stats.drawPct}%` }}
            />
            <div
              className="h-full bg-pink"
              style={{ width: `${stats.lossPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

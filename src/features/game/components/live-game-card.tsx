import { myFighter, liveOpponent, liveGame } from "../demo-data";
import { Avatar } from "@/components/ui/avatar";

export function LiveGameCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/10 bg-linear-to-br from-purple/8 via-pink/6 to-blue/8 p-4">
      <div className="mb-3 flex w-fit items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1">
        <span className="size-1.5 animate-pulse rounded-full bg-pink" />
        <span className="text-[10px] font-extrabold text-pink">
          Live Game
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <Avatar
            seed={myFighter.avatarSeed}
            name={myFighter.name}
            className="mx-auto mb-1.5 size-14 border-2 border-pink"
          />
          <div className="text-xs font-extrabold">{myFighter.name}</div>
          <div className="text-[9px] font-bold text-muted">
            {myFighter.grade}
          </div>
          <div className="mt-1 font-heading text-sm font-extrabold text-pink">
            {myFighter.score}
          </div>
        </div>

        <div className="font-heading shrink-0 text-lg font-extrabold text-purple">
          VS
        </div>

        <div className="flex-1 text-center">
          <Avatar
            seed={liveOpponent.avatarSeed}
            name={liveOpponent.name}
            className="mx-auto mb-1.5 size-14 border-2 border-blue"
          />
          <div className="text-xs font-extrabold">{liveOpponent.name}</div>
          <div className="text-[9px] font-bold text-muted">
            {liveOpponent.grade}
          </div>
          <div className="mt-1 font-heading text-sm font-extrabold text-blue">
            {liveOpponent.score}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold">
          <span className="text-pink">You {myFighter.hpPct}%</span>
          <span className="text-muted">
            {liveGame.subject} · {liveGame.questionProgress}
          </span>
          <span className="text-blue">{liveOpponent.hpPct}% {liveOpponent.name}</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-surface/60">
          <div
            className="h-full bg-pink"
            style={{ width: `${myFighter.hpPct}%` }}
          />
          <div
            className="h-full bg-blue"
            style={{ width: `${liveOpponent.hpPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-muted">
        <span>{liveGame.subject}</span>
        <span>{liveGame.questionProgress.replace("Q", "")} of 10 questions</span>
        <span>{liveGame.timer} ⏱</span>
      </div>

      <button className="mt-4 w-full rounded-2xl bg-brand py-3 text-sm font-extrabold text-white shadow-cta">
        🎮 Join Game Now!
      </button>
    </div>
  );
}

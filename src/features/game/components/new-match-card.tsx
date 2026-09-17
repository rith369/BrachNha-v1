import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useDisplayName, useRequireAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { gameCopy } from "../copy";
import { liveGame, liveOpponent } from "../demo-data";
import { avatarSeedFor } from "@/utils/avatar-seed";

/**
 * The hub's hero, kept as the ORIGINAL card on the user's instruction.
 *
 * The rebuild first replaced this with an honest "you vs an empty slot" panel —
 * no scores, no bars, nothing claiming a match was under way. The user asked for
 * the old card back exactly as it looked, with two changes and no others:
 *
 *   1. the button reads Create Game Now and routes to /game/create;
 *   2. the LEFT fighter is the real student — their display name and their
 *      Google photo when they have one.
 *
 * Everything else on the card is decoration from ../demo-data: the opponent, the
 * scoreline, the HP split, the subject, the question count and the clock. That
 * is a deliberate product decision, not an oversight. The page's `PreviewTag`
 * that used to label it was removed at the user's request (17 Sep 2026) — see
 * pages/game.tsx.
 *
 * Don't quietly make the fake numbers real by wiring them to a competition: the
 * card would then claim a live match, which is the one thing the feature cannot
 * do. If this should ever stop being decorative, it becomes the "you vs your
 * latest joiner" panel — a separate decision, and one to take with the user.
 *
 * CREATE IS GATED. A competition is played against other students, so it needs
 * an account for them to be matched against — the same requireAuth() the roadmap
 * and KruAI use. A guest sees the card and the sign-in prompt, not a dead button.
 */
export function NewMatchCard() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const name = useDisplayName();
  const lang = useBrachNhaStore((s) => s.lang);
  const photo = useBrachNhaStore((s) => s.authUser?.avatarUrl ?? "");
  const authUserId = useBrachNhaStore((s) => s.authUser?.id ?? "");
  const t = gameCopy(lang);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/10 bg-linear-to-br from-purple/8 via-pink/6 to-blue/8 p-4">
      <div className="mb-3 flex w-fit items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1">
        <span className="size-1.5 animate-pulse rounded-full bg-pink" />
        <span className="text-[10px] font-extrabold text-pink">
          {t.liveGame}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          {photo ? (
            // Google's avatar host turns down some hotlinked requests that carry
            // a Referer, and a broken <img> falls back to the bundled seed.
            <img
              src={photo}
              alt=""
              referrerPolicy="no-referrer"
              className="mx-auto mb-1.5 size-14 rounded-full border-2 border-pink object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Avatar
              // Only reached when the student has no Google photo. Derived so
              // two accounts without one are still told apart.
              seed={avatarSeedFor(authUserId || name)}
              name={name}
              className="mx-auto mb-1.5 size-14 border-2 border-pink"
            />
          )}
          <div className="truncate text-xs font-extrabold">{name}</div>
          <div className="text-[9px] font-bold text-muted">
            {liveOpponent.grade}
          </div>
          <div className="mt-1 font-heading text-sm font-extrabold text-pink">
            {liveGame.yourScore}
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
          <span className="text-pink">
            {t.you} {liveGame.yourHpPct}%
          </span>
          <span className="text-muted">
            {liveGame.subject} · {liveGame.questionProgress}
          </span>
          <span className="text-blue">
            {liveOpponent.hpPct}% {liveOpponent.name}
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-surface/60">
          <div
            className="h-full bg-pink"
            style={{ width: `${liveGame.yourHpPct}%` }}
          />
          <div
            className="h-full bg-blue"
            style={{ width: `${liveOpponent.hpPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-muted">
        <span>{liveGame.subject}</span>
        <span>
          {liveGame.questionProgress.replace("Q", "")} {t.questions}
        </span>
        <span>{liveGame.timer} ⏱</span>
      </div>

      <button
        onClick={() => requireAuth("game") && navigate("/game/create")}
        className="mt-4 w-full rounded-2xl bg-brand py-3 text-sm font-extrabold text-white shadow-cta"
      >
        {t.createCta}
      </button>
    </div>
  );
}

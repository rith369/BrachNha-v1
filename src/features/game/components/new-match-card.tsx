import { Link, useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useDisplayName, useRequireAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { findSubject } from "@/features/lessons/subjects";
import { avatarSeedFor } from "@/utils/avatar-seed";
import { cn } from "@/utils/cn";
import { clockLabel, gameCopy, OUTCOME_LABEL } from "../copy";
import { OUTCOME_STYLE, outcomeOf, type MatchOutcome } from "../game";

/**
 * The hub's hero: YOUR LATEST BATTLE.
 *
 * Until 1 Oct 2026 this card was decoration by request: an invented opponent,
 * scoreline, HP split and clock. The user then asked for it to be real, and it
 * became the "you vs your latest" panel this comment used to say would be the
 * honest version. It shows the newest of two things, read from the store:
 *
 *  - an attempt you made at someone else's competition: you against its
 *    creator, both scores and both times, with the outcome chip;
 *  - a competition you created: your run on the left, "waiting for a joiner"
 *    on the right. Who has played it lives on the review screen, which fetches
 *    them; this card stays local so it never waits on the network.
 *
 * With neither it says so, and offers Create. The bars are SCORE bars now
 * (score out of total), not HP: there is no health in this game, and the old
 * split implied a live fight the feature cannot have.
 *
 * CREATE IS GATED. A competition is played against other students, so it needs
 * an account — the same requireAuth() the roadmap and KruAI use.
 */

interface Side {
  name: string;
  seed: string;
  score: number | null;
  ms: number | null;
}

interface Battle {
  competitionId: string;
  subject: string;
  total: number;
  them: Side | null;
  outcome: MatchOutcome | null;
}

export function NewMatchCard() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const name = useDisplayName();
  const { lang, photo, authUserId, competitions, attempts } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      photo: s.authUser?.avatarUrl ?? "",
      authUserId: s.authUser?.id ?? "",
      competitions: s.competitions,
      attempts: s.competitionAttempts,
    }))
  );
  const t = gameCopy(lang);

  // Both lists are appended in order, so the newest of each is last.
  const attempt = attempts.at(-1);
  const created = competitions.at(-1);
  const useAttempt =
    attempt !== undefined &&
    (created === undefined || attempt.playedAt >= created.createdAt);

  let battle: Battle | null = null;
  let mine: Side = { name, seed: avatarSeedFor(authUserId || name), score: null, ms: null };
  if (useAttempt && attempt) {
    mine = { ...mine, score: attempt.score, ms: attempt.ms };
    const them: Side = {
      name: attempt.opponentName,
      seed: avatarSeedFor(attempt.opponentId || attempt.opponentName),
      score: attempt.opponentScore,
      ms: attempt.opponentMs,
    };
    battle = {
      competitionId: attempt.competitionId,
      subject: attempt.subject,
      total: attempt.total,
      them,
      outcome: outcomeOf(
        { score: attempt.score, ms: attempt.ms },
        { score: attempt.opponentScore, ms: attempt.opponentMs }
      ),
    };
  } else if (created) {
    mine = { ...mine, score: created.creatorScore, ms: created.creatorMs };
    battle = {
      competitionId: created.id,
      subject: created.subject,
      total: created.total,
      them: null,
      outcome: null,
    };
  }

  const subjectName = battle ? (findSubject(battle.subject)?.name ?? "") : "";
  // Plain values, not a closure over `battle.total`: the React Compiler
  // narrows a closure's dependency to the property path it reads and checks it
  // where the closure is built, and `battle` is null for a first-time student.
  const total = battle?.total ?? 0;
  const myPct =
    total > 0 && mine.score !== null ? Math.round((mine.score / total) * 100) : 0;
  const theirScore = battle?.them?.score ?? null;
  const theirPct =
    total > 0 && theirScore !== null ? Math.round((theirScore / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/10 bg-linear-to-br from-purple/8 via-pink/6 to-blue/8 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex w-fit items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-pink" />
          <span className="text-[10px] font-extrabold text-pink">
            {battle ? t.latestBattle : t.liveGame}
          </span>
        </div>
        {battle?.outcome && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
              OUTCOME_STYLE[battle.outcome]
            )}
          >
            {OUTCOME_LABEL[battle.outcome][lang]}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-center">
          {photo ? (
            // Google's avatar host turns down some hotlinked requests that carry
            // a Referer, and a broken <img> hides itself.
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
              seed={mine.seed}
              name={mine.name}
              className="mx-auto mb-1.5 size-14 border-2 border-pink"
            />
          )}
          <div className="truncate text-xs font-extrabold">{mine.name}</div>
          {battle && mine.score !== null && (
            <div className="mt-1 font-heading text-sm font-extrabold text-pink">
              {mine.score}/{battle.total}
            </div>
          )}
        </div>

        <div className="font-heading shrink-0 text-lg font-extrabold text-purple">
          VS
        </div>

        <div className="min-w-0 flex-1 text-center">
          {battle?.them ? (
            <>
              <Avatar
                seed={battle.them.seed}
                name={battle.them.name}
                className="mx-auto mb-1.5 size-14 border-2 border-blue"
              />
              <div className="truncate text-xs font-extrabold">
                {battle.them.name}
              </div>
              <div className="mt-1 font-heading text-sm font-extrabold text-blue">
                {battle.them.score}/{battle.total}
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-1.5 flex size-14 items-center justify-center rounded-full border-2 border-dashed border-blue/40 font-heading text-xl font-extrabold text-blue/60">
                ?
              </div>
              <div className="text-[11px] font-bold text-muted">
                {battle ? t.waiting : t.noBattles}
              </div>
            </>
          )}
        </div>
      </div>

      {battle && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-2 overflow-hidden rounded-full bg-surface/60">
              <div
                className="ml-auto h-full rounded-full bg-pink"
                style={{ width: `${myPct}%` }}
              />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface/60">
              <div
                className="h-full rounded-full bg-blue"
                style={{ width: `${theirPct}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-muted">
            <span className="min-w-0 truncate">
              {subjectName} · {battle.total} {t.questions}
            </span>
            <span className="shrink-0">
              ⏱ {clockLabel(mine.ms ?? 0)}
              {battle.them?.ms != null && ` · ${clockLabel(battle.them.ms)}`}
            </span>
          </div>

          <Link
            to={`/game/review/${battle.competitionId}`}
            className="mt-3 block text-center text-xs font-extrabold text-purple"
          >
            {t.seeAnswers} →
          </Link>
        </>
      )}

      <button
        onClick={() => requireAuth("game") && navigate("/game/create")}
        className="mt-4 w-full rounded-2xl bg-brand py-3 text-sm font-extrabold text-white shadow-cta"
      >
        {t.createCta}
      </button>
    </div>
  );
}

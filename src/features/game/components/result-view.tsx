import { Minus, Trophy } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { cn } from "@/utils/cn";
import { outcomeOf, type MatchOutcome, type Run } from "../game";
import { gameCopy, num } from "../copy";
import type { Lang } from "@/types";

function Side({
  label,
  run,
  total,
  highlight,
  lang,
}: {
  label: string;
  run: Run;
  total: number;
  highlight: "win" | "loss" | null;
  lang: Lang;
}) {
  const t = gameCopy(lang);
  return (
    <div className="min-w-20">
      <div
        className={cn(
          "text-2xl font-extrabold md:text-3xl",
          highlight === "win"
            ? "text-mint"
            : highlight === "loss"
              ? "text-pink"
              : "text-text"
        )}
      >
        {num(run.score, lang)}
        <span className="text-sm font-bold text-muted">
          /{num(total, lang)}
        </span>
      </div>
      <div className="truncate text-[10px] font-extrabold text-muted md:text-xs">
        {label}
      </div>
      <div className="text-[10px] font-bold text-muted">
        {num(Math.round(run.ms / 1000), lang)}
        {t.seconds}
      </div>
    </div>
  );
}

/**
 * What a JOINER sees the moment their run ends: their score against the
 * creator's, decided immediately because the creator's score already exists.
 * Nothing here waits on anything — that is the whole reason the feature is
 * asynchronous rather than real-time.
 *
 * SPEED IS SHOWN UNDER BOTH SCORES, not only when it decided the result. With a
 * handful of questions equal scores are common, so the tie-break has to be
 * visible before it is used, or the first time it settles a match it reads as
 * the app picking a winner at random. See outcomeOf().
 *
 * NOTHING HERE SCOLDS A LOSS. The app's forward-only rule — the leaderboard
 * never shows the student a red "down 2", the flashcard summary's zero band
 * never tells anyone off — applies to being beaten by a classmate too.
 */
export function ResultView({
  mine,
  theirs,
  total,
  opponentName,
  note,
  onExit,
  onNext,
}: {
  mine: Run;
  theirs: Run;
  total: number;
  opponentName: string;
  /** Shown under the scores. Used to say "you already played this" when the
   *  screen is reached again rather than earned — see pages/game-play.tsx. */
  note?: string;
  onExit: () => void;
  /**
   * Go on to the review — photograph your working, then compare answers.
   *
   * OPTIONAL so this stays a terminal screen where there is nothing to go on to,
   * rather than growing a button that leads nowhere. When it is passed, the
   * verdict stops being the end of the flow and becomes the middle of it: the
   * score is settled here, and what each side actually picked is settled next.
   */
  onNext?: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const outcome = outcomeOf(mine, theirs);
  const tied = mine.score === theirs.score;

  const headline: Record<MatchOutcome, string> = {
    win: t.win,
    loss: t.loss,
    draw: t.draw,
  };

  return (
    <FocusLayout
      progressPct={100}
      onExit={onExit}
      footer={
        <FocusButton onClick={onNext ?? onExit}>
          {onNext ? t.seeAnswers : t.done}
        </FocusButton>
      }
    >
      <div className="text-center">
        {outcome === "draw" ? (
          <Minus
            className="mx-auto mb-3 size-14 text-muted md:mb-5 md:size-20"
            strokeWidth={2}
          />
        ) : (
          <Trophy
            className={cn(
              "mx-auto mb-3 size-14 md:mb-5 md:size-20",
              outcome === "win" ? "text-yellow" : "text-muted"
            )}
            strokeWidth={2}
          />
        )}

        <div className="font-heading mb-4 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
          {headline[outcome]}
        </div>

        <div className="mx-auto mb-3 flex w-fit items-center gap-4 rounded-2xl border border-purple/10 bg-surface px-4 py-3 shadow-panel md:gap-6 md:px-6">
          <Side
            label={t.you}
            run={mine}
            total={total}
            lang={lang}
            highlight={
              outcome === "win" ? "win" : outcome === "loss" ? "loss" : null
            }
          />
          <div className="text-sm font-extrabold text-muted">–</div>
          <Side
            label={opponentName}
            run={theirs}
            total={total}
            lang={lang}
            highlight={
              outcome === "loss" ? "win" : outcome === "win" ? "loss" : null
            }
          />
        </div>

        {/* Only shown when speed actually decided it, so the line always means
            something rather than being permanent furniture. */}
        {tied && outcome !== "draw" && (
          <p className="text-xs font-bold text-muted">{t.tieBreak}</p>
        )}

        {note && <p className="mt-2 text-xs font-bold text-muted">{note}</p>}
      </div>
    </FocusLayout>
  );
}

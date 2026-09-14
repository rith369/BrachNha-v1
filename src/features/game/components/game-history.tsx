import { Link } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { findSubject } from "@/features/lessons/subjects";
import { OUTCOME_STYLE, outcomeOf, type MatchOutcome } from "../game";
import { OUTCOME_LABEL, gameCopy, num, relativeDay } from "../copy";
import { avatarSeedFor } from "@/utils/avatar-seed";

const SCORE_TONE: Record<MatchOutcome, string> = {
  win: "text-mint",
  loss: "text-pink",
  draw: "text-yellow",
};


/** How many rows the card shows. The store keeps more; this is what fits. */
const SHOWN = 4;

/**
 * The competitions this student has joined, newest first.
 *
 * Same markup as the original card, with real rows behind it. Everything comes
 * off the attempt itself, which carries BOTH halves of the comparison — see
 * CompetitionAttempt's own note on why it is a complete record rather than a
 * pointer at a competition that may not be on this device.
 *
 * The question count is read from the attempt rather than the hardcoded "10
 * questions" the old card printed, which was wrong the moment a competition had
 * any other length.
 *
 * The caller renders nothing when there are no attempts.
 */
export function GameHistory() {
  const lang = useBrachNhaStore((s) => s.lang);
  const attempts = useBrachNhaStore((s) => s.competitionAttempts);
  const t = gameCopy(lang);
  const rows = attempts.slice(-SHOWN).reverse();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          {t.recentGames}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((a) => {
          const outcome = outcomeOf(
            { score: a.score, ms: a.ms },
            { score: a.opponentScore, ms: a.opponentMs }
          );

          const subject = findSubject(a.subject);

          return (
            // THE WHOLE ROW IS THE CONTROL, the same shape ExamPaperCard and
            // PracticeLessonList already use — a <Link>, not a button, because
            // the review is a real destination with its own URL.
            //
            // Every row here is safe to make tappable: an attempt only exists
            // because this student played it, so there is always something
            // behind it. That is what keeps this clear of the dim-and-don't-tap
            // rule that governs the app's empty tiles.
            <Link
              key={a.id}
              to={`/game/review/${a.competitionId}`}
              className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm transition hover:bg-purple/5"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${OUTCOME_STYLE[outcome]}`}
              >
                {OUTCOME_LABEL[outcome][lang]}
              </span>
              <Avatar
                // opponentId is optional: attempts recorded before it existed
                // fall back to the name, which is stable enough to tell two
                // classmates apart.
                seed={avatarSeedFor(a.opponentId ?? a.opponentName)}
                name={a.opponentName}
                className="size-9 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold">
                  vs {a.opponentName}
                </div>
                <div className="truncate text-[10px] font-bold text-muted">
                  {subject?.name ?? ""} · {num(a.total, lang)} {t.questions}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-extrabold ${SCORE_TONE[outcome]}`}>
                  {num(a.score, lang)} – {num(a.opponentScore, lang)}
                </div>
                <div className="text-[9px] font-bold text-muted">
                  {relativeDay(a.playedAt, lang)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

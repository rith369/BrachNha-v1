import { Link } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { findSubject } from "@/features/lessons/subjects";
import { OUTCOME_STYLE, rowOutcome, type MatchOutcome, type MatchRow } from "../game";
import { OUTCOME_LABEL, gameCopy, relativeDay } from "../copy";

const SCORE_TONE: Record<MatchOutcome, string> = {
  win: "text-mint",
  loss: "text-pink",
  draw: "text-yellow",
};


/** How many rows the card shows. The store keeps more; this is what fits. */
const SHOWN = 4;

/**
 * Every match this student has been in, newest first: the competitions they
 * JOINED, and other students' runs at the ones they CREATED (marked "Your
 * challenge"). Before the second kind was added, a creator never saw that
 * anyone had played them; see features/game/joiner-results.ts.
 *
 * Same markup as the original card. Everything comes off MatchRow, which carries
 * both halves of the comparison from this student's side.
 *
 * The question count is read from the attempt rather than the hardcoded "10
 * questions" the old card printed, which was wrong the moment a competition had
 * any other length.
 *
 * The caller renders nothing when there are no matches.
 */
export function GameHistory({ rows: all }: { rows: MatchRow[] }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const rows = all.slice(0, SHOWN);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          {t.recentGames}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((a) => {
          const outcome = rowOutcome(a);
          const subject = findSubject(a.subject);

          return (
            // THE WHOLE ROW IS THE CONTROL, the same shape ExamPaperCard and
            // PracticeLessonList already use — a <Link>, not a button, because
            // the review is a real destination with its own URL.
            //
            // Every row here is safe to make tappable: a match only exists
            // because it was played, so there is always something behind it.
            // That is what keeps this clear of the dim-and-don't-tap rule that
            // governs the app's empty tiles. A "Your challenge" row opens the
            // review on that joiner (?joiner=), not on an empty picker.
            <Link
              key={a.key}
              to={
                a.joinerId
                  ? `/game/review/${a.competitionId}?joiner=${a.joinerId}`
                  : `/game/review/${a.competitionId}`
              }
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-panel-sm transition hover:bg-purple/5"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${OUTCOME_STYLE[outcome]}`}
              >
                {OUTCOME_LABEL[outcome][lang]}
              </span>
              <Avatar
                seed={a.opponentSeed}
                name={a.opponentName}
                className="size-9 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold">
                  vs {a.opponentName}
                </div>
                <div className="truncate text-[10px] font-bold text-muted">
                  {subject?.name ?? ""} · {a.total} {t.questions}
                  {a.asCreator && ` · ${t.yourChallenge}`}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-extrabold ${SCORE_TONE[outcome]}`}>
                  {a.myScore} – {a.opponentScore}
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

import { Hourglass } from "lucide-react";
import { Link } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { findSubject } from "@/features/lessons/subjects";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { cn } from "@/utils/cn";
import { DIFFICULTIES } from "../game";
import { gameCopy, num, relativeDay } from "../copy";

/**
 * The competitions this student has POSTED, newest first.
 *
 * It sits where "Challenge Someone 👊" used to be and wears that card's row
 * shape, but it is not that list: the original showed invented classmates with
 * ranks, an Online dot and a Play button that did nothing. A roster of other
 * students needs cross-user reads, which is stage B — so until then this slot
 * shows the competitions that genuinely exist, which are the student's own.
 *
 * EVERY ROW IS A <div>, NEVER A LINK. The only thing behind a competition is
 * playing it, and playing your own is a race against yourself.
 * `/game/play/:competitionId` exists and works — reachable by URL for
 * development, the precedent the rest of the app sets for a screen with no
 * authored entry point yet — but the hub does not offer it.
 *
 * No joiner count is printed, not even a zero: until the server exists this
 * device cannot know whether anyone has joined, and a confident "0" would be a
 * claim it has no way to support.
 *
 * The caller renders nothing when the list is empty.
 */
export function MyCompetitions() {
  const lang = useBrachNhaStore((s) => s.lang);
  const competitions = useBrachNhaStore((s) => s.competitions);
  const t = gameCopy(lang);
  const rows = [...competitions].reverse();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          {t.myCompetitions}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((c) => {
          const subject = findSubject(c.subject);
          const style = subject ? SUBJECT_STYLE[subject.id] : null;
          const difficulty = DIFFICULTIES.find((d) => d.id === c.difficulty);

          return (
            // A ROW IS A LINK TO ITS REVIEW NOW, which is the exception this
            // component's header reserved: it says no row may link, on the
            // grounds that the only thing behind a competition is playing it and
            // playing your own is a race against yourself. That was true until
            // the review existed. It now leads somewhere that is specifically
            // the CREATOR's — their own answers, and the working of everyone who
            // took their challenge — and never to the quiz.
            <Link
              key={c.id}
              to={`/game/review/${c.id}`}
              className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm transition hover:bg-purple/5"
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full border-2",
                  style ? style.card : "border-purple/20 bg-control"
                )}
              >
                <Hourglass
                  className={cn("size-5", style ? style.text : "text-muted")}
                  strokeWidth={2.5}
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold">
                  {subject?.name ?? ""}
                </div>
                <div className="truncate text-[10px] font-bold text-muted">
                  {difficulty?.label[lang]} · {relativeDay(c.createdAt, lang)}
                </div>
                <div className="mt-1 flex gap-2.5 text-[10px] font-extrabold text-muted">
                  <span>
                    ⏱ {num(c.minutes, lang)} {t.minutes}
                  </span>
                  <span>
                    {num(c.questions.length, lang)} {t.questions}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="font-heading text-sm font-extrabold text-purple">
                  {num(c.creatorScore, lang)}/{num(c.total, lang)}
                </div>
                {/* A competition that never reached the server is NOT open for
                    joiners — nobody can see it. Saying so is the whole point of
                    Competition.sharedAt; share-pending.ts keeps retrying until
                    this flips. */}
                <div className="flex items-center gap-1 text-[9px] font-bold text-muted">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      c.sharedAt ? "bg-yellow" : "bg-muted/50"
                    )}
                  />
                  {c.sharedAt ? t.openForJoiners : t.notShared}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

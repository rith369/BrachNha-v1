import { useState } from "react";
import { Swords, Timer } from "lucide-react";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { focusCard } from "@/utils/focus-styles";
import { cn } from "@/utils/cn";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { DIFFICULTIES, MATCH_MINUTES, gameSubjects } from "../game";
import { gameCopy, num } from "../copy";
import { useBrachNhaStore } from "@/lib/store";
import type { GameDifficulty } from "@/types";
import type { SubjectId } from "@/features/lessons/subjects";

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition md:text-sm",
        selected
          ? "border-purple/40 bg-purple/10 text-purple"
          : "border-purple/10 bg-surface text-muted hover:bg-purple/5"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Posting a competition: pick a subject, a difficulty and a time budget.
 *
 * The creator plays IMMEDIATELY after this — there is no "post it and play
 * later". Their score is what every joiner is measured against, so a competition
 * without it would be an empty challenge nobody could win.
 *
 * A SUBJECT WITH NO QUESTIONS IS NOT SELECTABLE — a dimmed <div>, never a
 * button, the rule the Study tile, the survey's StudiedStep and sidebar-nav's
 * `href: null` rows all follow. The whole screen would otherwise let someone
 * build a competition that cannot be played.
 *
 * It wears FocusLayout because it is on a focus route: the X is the way back to
 * /game, and the navigation is already hidden by then.
 */
export function CreateForm({
  onStart,
  onExit,
}: {
  onStart: (choice: {
    subjectId: SubjectId;
    difficulty: GameDifficulty;
    minutes: number;
  }) => void;
  onExit: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const subjects = gameSubjects(undefined);
  const playable = subjects.filter((s) => s.questions.length > 0);

  const [subjectId, setSubjectId] = useState<SubjectId | null>(
    playable[0]?.subject.id ?? null
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>("mix");
  const [minutes, setMinutes] = useState<number>(MATCH_MINUTES[1]);

  return (
    <FocusLayout
      progressPct={0}
      onExit={onExit}
      footer={
        <FocusButton
          onClick={() => subjectId && onStart({ subjectId, difficulty, minutes })}
          disabled={!subjectId}
        >
          {t.startPlaying}
        </FocusButton>
      }
    >
      <div>
        <div className="font-heading mb-1 text-lg font-extrabold md:text-xl">
          {t.create}
        </div>
        <p className="mb-4 text-xs font-bold text-muted md:text-sm">
          {t.createBlurb}
        </p>

        <div className="mb-2 text-xs font-extrabold text-muted md:text-sm">
          {t.subject}
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-3">
          {subjects.map(({ subject, questions }) => {
            const style = SUBJECT_STYLE[subject.id];
            const empty = questions.length === 0;
            const selected = subject.id === subjectId;

            const body = (
              <>
                <SubjectArt
                  subject={subject}
                  className="mb-1.5 aspect-[11/5] rounded-lg"
                />
                <div className="truncate text-xs font-extrabold text-text">
                  {subject.name}
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-muted">
                  {empty ? (
                    t.comingSoon
                  ) : (
                    <span className="flex items-center gap-1">
                      <Swords
                        className={cn("size-2.5 shrink-0", style.text)}
                        strokeWidth={2.5}
                      />
                      {num(questions.length, lang)} {t.questions}
                    </span>
                  )}
                </div>
              </>
            );

            if (empty) {
              return (
                <div
                  key={subject.id}
                  className="rounded-xl border border-purple/10 bg-surface p-2 opacity-60"
                >
                  {body}
                </div>
              );
            }

            return (
              <button
                key={subject.id}
                onClick={() => setSubjectId(subject.id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-xl border p-2 text-left transition",
                  selected
                    ? "border-purple/40 bg-purple/10"
                    : "border-purple/10 bg-surface hover:bg-purple/5"
                )}
              >
                {body}
              </button>
            );
          })}
        </div>

        <div className="mb-2 text-xs font-extrabold text-muted md:text-sm">
          {t.difficulty}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d.id}
              selected={d.id === difficulty}
              onClick={() => setDifficulty(d.id)}
            >
              {d.label[lang]}
            </Chip>
          ))}
        </div>

        <div className="mb-2 text-xs font-extrabold text-muted md:text-sm">
          {t.duration}
        </div>
        <div className="flex flex-wrap gap-2">
          {MATCH_MINUTES.map((m) => (
            <Chip key={m} selected={m === minutes} onClick={() => setMinutes(m)}>
              <span className="flex items-center gap-1">
                <Timer className="size-3 shrink-0" strokeWidth={2.5} />
                {num(m, lang)} {t.minutes}
              </span>
            </Chip>
          ))}
        </div>

        {playable.length === 0 && (
          <div className={cn(focusCard, "mt-5 text-center")}>
            <p className="text-sm font-bold text-muted">
              {t.noQuestions}
            </p>
          </div>
        )}
      </div>
    </FocusLayout>
  );
}

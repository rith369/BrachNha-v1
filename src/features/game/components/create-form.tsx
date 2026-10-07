import { useState } from "react";
import { Swords, Timer } from "lucide-react";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { focusCard } from "@/utils/focus-styles";
import { cn } from "@/utils/cn";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { DIFFICULTIES, MATCH_MINUTES, gameSubjects, toGameQuestions } from "../game";
import { gameCopy } from "../copy";
import { useBrachNhaStore } from "@/lib/store";
import { retryBody, retryContent, useContentBody, useContentManifest } from "@/lib/content";
import { entryVersion } from "@/utils/content-manifest";
import type { ExamQuestion, GameDifficulty } from "@/types";
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
          ? "border-border bg-purple/30 text-text"
          : "border-border bg-surface text-muted hover:bg-purple/5"
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
 *
 * THE QUESTIONS COME FROM THE DATABASE (kind `game`): which subjects have a
 * pool is read off the manifest, and the chosen subject's pool downloads while
 * the student picks a level and a time, so Start rarely waits. Start stays off
 * until that pool is in hand; a first open with no internet says so, with
 * Try again.
 */
export function CreateForm({
  onStart,
  onExit,
}: {
  onStart: (choice: {
    subjectId: SubjectId;
    difficulty: GameDifficulty;
    minutes: number;
    /** The subject's whole published pool; the page draws from it. */
    pool: ExamQuestion[];
  }) => void;
  onExit: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const manifest = useContentManifest();
  const subjects = gameSubjects(undefined, manifest);
  const playable = subjects.filter((s) => s.count > 0);

  // The student's pick, or the first playable subject. Derived rather than an
  // initial state: the manifest can arrive after the first render.
  const [picked, setSubjectId] = useState<SubjectId | null>(null);
  const subjectId =
    picked && playable.some((p) => p.subject.id === picked)
      ? picked
      : (playable[0]?.subject.id ?? null);
  const version = subjectId ? entryVersion(manifest, "game", subjectId) : null;
  const pool = useContentBody("game", subjectId ?? "", version);
  const [difficulty, setDifficulty] = useState<GameDifficulty>("mix");
  const [minutes, setMinutes] = useState<number>(MATCH_MINUTES[1]);

  return (
    <FocusLayout
      progressPct={0}
      onExit={onExit}
      footer={
        <FocusButton
          onClick={() =>
            subjectId &&
            pool.status === "ready" &&
            onStart({ subjectId, difficulty, minutes, pool: toGameQuestions(pool.body) })
          }
          disabled={!subjectId || pool.status !== "ready"}
        >
          {subjectId && pool.status === "loading" ? t.loadingQuestions : t.startPlaying}
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
          {subjects.map(({ subject, count }) => {
            const style = SUBJECT_STYLE[subject.id];
            const empty = count === 0;
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
                      {count} {t.questions}
                    </span>
                  )}
                </div>
              </>
            );

            if (empty) {
              return (
                <div
                  key={subject.id}
                  className="rounded-xl border border-border bg-surface p-2 opacity-60"
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
                    ? "border-border bg-purple/30"
                    : "border-border bg-surface hover:bg-purple/5"
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
                {m} {t.minutes}
              </span>
            </Chip>
          ))}
        </div>

        {pool.status === "offline" && subjectId && version !== null && (
          <div className={cn(focusCard, "mt-5 text-center")}>
            <p className="mb-2 text-sm font-bold text-muted">{t.questionsOffline}</p>
            <button
              type="button"
              onClick={() => retryBody("game", subjectId, version)}
              className="text-sm font-extrabold text-purple"
            >
              {t.retry}
            </button>
          </div>
        )}
        {playable.length === 0 && (
          <div className={cn(focusCard, "mt-5 text-center")}>
            <p className="text-sm font-bold text-muted">
              {manifest.status === "loading"
                ? t.loadingQuestions
                : manifest.status === "failed"
                  ? t.questionsOffline
                  : t.noQuestions}
            </p>
            {manifest.status === "failed" && (
              <button
                type="button"
                onClick={retryContent}
                className="mt-2 text-sm font-extrabold text-purple"
              >
                {t.retry}
              </button>
            )}
          </div>
        )}
      </div>
    </FocusLayout>
  );
}

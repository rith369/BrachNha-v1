import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { findSubject } from "@/features/lessons/subjects";
import { attemptFor, OUTCOME_STYLE, outcomeOf } from "@/features/game/game";
import { OUTCOME_LABEL, gameCopy, num } from "@/features/game/copy";
import { AnswerReview } from "@/features/game/components/answer-review";
import { WorkPhoto } from "@/features/game/components/work-photo";
import { MyWorkPhoto } from "@/features/game/components/my-work-photo";
import { WorkPhotoStep } from "@/features/game/components/work-photo-step";
import { useWorkPhoto } from "@/features/game/use-work-photo";
import { avatarSeedFor } from "@/utils/avatar-seed";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchAttemptsFor, type JoinerAttempt } from "@/lib/competitions";
import { cn } from "@/utils/cn";
import type { CompetitionAttempt, Lang } from "@/types";

/**
 * `/game/review/:competitionId` — the part of a competition that teaches.
 *
 * ONE ROUTE SERVES BOTH SIDES, keyed on the COMPETITION rather than on a row,
 * which is what makes that possible: a student is either its creator or has an
 * attempt at it, and never both (you cannot join your own). So the same URL is
 * the creator's review of everyone who took their challenge and a joiner's
 * review of the creator, with no second route and no id space to keep straight.
 *
 * IT IS ALSO THE TAIL OF BOTH RUNS. `/game/create` and `/game/play/:id` both
 * navigate here once their result screen is done, so the sequence a student
 * experiences is: quiz → result → photograph your working → the answers → their
 * working. Reaching the same URL later from Recent Games or My Competitions
 * lands on exactly the same screen, minus the parts already done.
 *
 * IT RENDERS FROM THE STORE, NOT THE NETWORK — the questions and both sides'
 * picks were frozen onto the local row at play time (see CompetitionAttempt), so
 * the comparison works with no connection at all. Only the two genuinely remote
 * things wait: the photographs, and the creator's list of who has played.
 *
 * NOT AN ASSESSMENT ROUTE, unlike the two runs it follows — see
 * utils/focus-routes.ts. The score is recorded and unchangeable by the time
 * anyone is here, so "why is that the answer?" is the lesson case KruAI exists
 * for rather than a way to be marked up.
 */
export default function GameReviewPage() {
  const { competitionId = "" } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();

  const { lang, competitions, attempts, authUserId, authStatus } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        competitions: s.competitions,
        attempts: s.competitionAttempts,
        authUserId: s.authUser?.id ?? "",
        authStatus: s.authStatus,
      }))
    );
  const t = gameCopy(lang);

  // Exactly one of these can match. Everything below reads through `?.` so no
  // closure ever narrows onto a property of a row that may not exist — the
  // React Compiler crash competition-run.tsx's header describes.
  const created = competitions.find((c) => c.id === competitionId);
  const attempt = attemptFor(attempts, competitionId);
  const mineIsCreator = Boolean(created);

  // ONE OWNER FOR THE PHOTO. Both the step before the answers and the panel
  // after them read this, because they are two renderings of one fact — see
  // use-work-photo.ts. `available` is false where a photo could not work at all
  // (no project, no account), which are supported states rather than errors: a
  // fork with no .env, the blanked-env screenshot harness. Asking for a photo
  // there would be an error message about the app working as designed.
  const photo = useWorkPhoto(
    competitionId,
    authUserId,
    Boolean(created?.photoAt ?? attempt?.photoAt)
  );

  const [revealed, setRevealed] = useState(
    () => Boolean(created?.photoAt ?? attempt?.photoAt)
  );
  const [joiners, setJoiners] = useState<JoinerAttempt[] | "loading" | "failed">(
    mineIsCreator && isSupabaseConfigured ? "loading" : []
  );
  const [pickedJoiner, setPickedJoiner] = useState<string | null>(null);

  // WHO HAS TAKEN MY COMPETITION — the creator's half of the exchange, and the
  // one thing on this screen that cannot come from the device. The read policy
  // on competition_attempts already limits it to competitions this student
  // created, so the query does not have to.
  useEffect(() => {
    if (!mineIsCreator || !isSupabaseConfigured) return;
    if (authStatus === "loading" || !authUserId) return;
    let cancelled = false;
    fetchAttemptsFor([competitionId]).then((res) => {
      if (cancelled) return;
      setJoiners(res.ok ? res.data : "failed");
    });
    return () => {
      cancelled = true;
    };
  }, [mineIsCreator, competitionId, authUserId, authStatus]);

  function exit() {
    navigate("/game");
  }

  // Reached by a stale link, a cleared browser, or an attempt older than the cap
  // — the row simply is not here, and there is nothing to fetch that would help:
  // a joiner's picks live only on their own device and their own server row.
  if (!competitionId) return <Navigate to="/game" replace />;
  if (!created && !attempt) {
    return (
      <FocusLayout
        progressPct={100}
        onExit={exit}
        footer={<FocusButton onClick={exit}>{t.back}</FocusButton>}
      >
        <p className="text-center text-sm font-bold text-muted">
          {t.reviewMissing}
        </p>
      </FocusLayout>
    );
  }

  const questions = created?.questions ?? attempt?.questions ?? [];
  const myAnswers = created?.creatorAnswers ?? attempt?.answers ?? [];
  const subject = findSubject(created?.subject ?? attempt?.subject ?? "");

  // THE PHOTO COMES BEFORE THE ANSWERS, and this is the gate that enforces it.
  // See WorkPhotoStep for why that order is the whole point, and why Skip still
  // exists.
  if (!revealed && photo.available) {
    return (
      <FocusLayout progressPct={66} onExit={exit}>
        <WorkPhotoStep
          photo={photo}
          onDone={() => setRevealed(true)}
          onSkip={() => setRevealed(true)}
        />
      </FocusLayout>
    );
  }

  // Whose picks sit beside this student's. A joiner always faces the creator; a
  // creator faces whichever joiner they have selected, and nobody until they do.
  const selected =
    joiners !== "loading" && joiners !== "failed"
      ? joiners.find((j) => j.userId === pickedJoiner)
      : undefined;

  const opponentId = mineIsCreator ? selected?.userId : attempt?.opponentId;
  const opponentName = mineIsCreator ? selected?.userName : attempt?.opponentName;
  const opponentAnswers = mineIsCreator
    ? selected?.answers
    : attempt?.opponentAnswers;

  // The questions are frozen onto the row, so an empty list means the match
  // predates answer recording rather than anything having gone wrong.
  const recorded = questions.length > 0 && myAnswers.length > 0;

  return (
    <FocusLayout
      progressPct={100}
      onExit={exit}
      footer={<FocusButton onClick={exit}>{t.done}</FocusButton>}
    >
      <div className="flex w-full flex-col gap-5">
        <div>
          <div className="font-heading text-lg font-extrabold md:text-xl">
            {t.reviewTitle}
          </div>
          <div className="text-xs font-bold text-muted">
            {subject?.name ?? ""} · {num(questions.length, lang)} {t.questions}
          </div>
        </div>

        {attempt && <Scoreline attempt={attempt} lang={lang} />}

        {/* YOUR working first, then theirs. The order is the exchange: what you
            put in, then what it opened. Yours carries Retake and Delete; theirs
            carries neither, and cannot — the storage policy only ever lets a
            student touch a file named after themselves. */}
        {photo.available && (
          <MyWorkPhoto
            competitionId={competitionId}
            userId={authUserId}
            photo={photo}
          />
        )}

        {mineIsCreator && (
          <JoinerPicker
            joiners={joiners}
            picked={pickedJoiner}
            onPick={setPickedJoiner}
            lang={lang}
            total={created?.total ?? 0}
          />
        )}

        {opponentId && (
          <WorkPhoto
            competitionId={competitionId}
            userId={opponentId}
            title={opponentName ? `${opponentName} ✍️` : t.theirWorking}
            // RECIPROCITY: you see theirs once you have shown yours. Skipping
            // reaches the answers and stops there — see WorkPhotoStep.
            locked={!photo.uploaded}
          />
        )}

        {recorded ? (
          <AnswerReview
            questions={questions}
            mine={myAnswers}
            theirs={opponentAnswers}
            theirsLabel={opponentName}
          />
        ) : (
          <p className="text-center text-sm font-bold text-muted">
            {t.answersUnavailable}
          </p>
        )}
      </div>
    </FocusLayout>
  );
}

/** The result, restated compactly. The full verdict screen already ran; this is
 *  the reminder of what is being reviewed, not a second celebration. */
function Scoreline({
  attempt,
  lang,
}: {
  attempt: CompetitionAttempt;
  lang: Lang;
}) {
  const t = gameCopy(lang);
  const outcome = outcomeOf(
    { score: attempt.score, ms: attempt.ms },
    { score: attempt.opponentScore, ms: attempt.opponentMs }
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm">
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold",
          OUTCOME_STYLE[outcome]
        )}
      >
        {OUTCOME_LABEL[outcome][lang]}
      </span>
      <div className="min-w-0 flex-1 truncate text-xs font-extrabold">
        {t.you} vs {attempt.opponentName}
      </div>
      <div className="shrink-0 font-heading text-sm font-extrabold">
        {num(attempt.score, lang)} – {num(attempt.opponentScore, lang)}
      </div>
    </div>
  );
}

/**
 * The creator's list of everyone who has taken their competition.
 *
 * SELECTING ONE IS WHAT FILLS IN THE COMPARISON below it — their picks beside
 * this student's, and their working beside theirs. A creator faces many joiners
 * and each is measured only against them, so there is no single "opponent" to
 * show by default; the list is the choice, and nothing is selected until they
 * make it.
 */
function JoinerPicker({
  joiners,
  picked,
  onPick,
  lang,
  total,
}: {
  joiners: JoinerAttempt[] | "loading" | "failed";
  picked: string | null;
  onPick: (id: string | null) => void;
  lang: Lang;
  total: number;
}) {
  const t = gameCopy(lang);
  if (!isSupabaseConfigured) return null;

  return (
    <div>
      <div className="font-heading mb-2 text-sm font-extrabold">{t.joiners}</div>
      {joiners === "loading" ? (
        <p className="text-xs font-bold text-muted">{t.loadingJoiners}</p>
      ) : joiners === "failed" ? (
        <p className="text-xs font-bold text-muted">{t.joinersFailed}</p>
      ) : joiners.length === 0 ? (
        <p className="text-xs font-bold text-muted">{t.noJoinersYet}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {joiners.map((j) => {
            const on = picked === j.userId;
            return (
              <button
                key={j.userId}
                onClick={() => onPick(on ? null : j.userId)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-2.5 text-left transition",
                  on
                    ? "border-purple/40 bg-purple/10"
                    : "border-purple/10 bg-surface hover:bg-purple/5"
                )}
              >
                <Avatar
                  seed={avatarSeedFor(j.userId)}
                  name={j.userName}
                  className="size-9 shrink-0"
                />
                <div className="min-w-0 flex-1 truncate text-xs font-extrabold">
                  {j.userName}
                </div>
                {/* THE JOINER'S SCORE, PLAINLY, with no win/loss colour on it.
                    Tinting it by whether the creator beat them would put a
                    verdict next to somebody else's name, where mint could
                    equally be read as "they won" — the one ambiguity a chip
                    cannot recover from. The comparison belongs in the answer
                    list this row selects, where both sides are labelled. */}
                <span className="shrink-0 rounded-full bg-purple/10 px-2 py-0.5 text-[9px] font-extrabold text-purple">
                  {num(j.score, lang)}/{num(total, lang)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

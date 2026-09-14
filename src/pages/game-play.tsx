import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useDisplayName } from "@/hooks/use-auth";
import { findSubject } from "@/features/lessons/subjects";
import { attemptFor } from "@/features/game/game";
import {
  CompetitionRun,
  type RunResult,
} from "@/features/game/components/competition-run";
import { ResultView } from "@/features/game/components/result-view";
import { GAME_XP_PER_CORRECT } from "@/utils/rewards";
import { gameCopy } from "@/features/game/copy";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  fetchCompetition,
  fetchMyAttempt,
  publishAttempt,
} from "@/lib/competitions";
import type { Competition, CompetitionAttempt } from "@/types";

/**
 * `/game/play/:competitionId` — take someone else's competition.
 *
 * THE COMPETITION IS LOOKED UP LOCALLY FIRST, then fetched. A creator opening
 * their own link already has the row; a joiner does not — so this is the one
 * screen in the app that genuinely waits on the network before it can render
 * anything, and it says so rather than showing an empty quiz.
 *
 * THE RESULT IS IMMEDIATE once the questions are in hand: the creator's score
 * came down with the competition, so nothing is real-time and nothing is waited
 * on twice.
 *
 * THE LOCAL WRITE HAPPENS FIRST, as on the create side. If publishing the
 * attempt fails, the student still keeps their own record of the run; what is
 * lost is the creator seeing it.
 *
 * A DUPLICATE IS NOT A FAILURE. The unique constraint stops someone re-rolling a
 * bad run until they beat the creator, so hitting it means "you already played
 * this" — and the comparison this screen renders is true either way.
 */
export default function GamePlayPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const userName = useDisplayName();

  const {
    lang,
    competitions,
    addCompetitionAttempt,
    attempts,
    authUserId,
    authStatus,
  } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        competitions: s.competitions,
        addCompetitionAttempt: s.addCompetitionAttempt,
        attempts: s.competitionAttempts,
        authUserId: s.authUser?.id ?? "",
        authStatus: s.authStatus,
      }))
    );
  const t = gameCopy(lang);

  const local = competitions.find((c) => c.id === competitionId) ?? null;

  const [remote, setRemote] = useState<Competition | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "missing" | "failed">(
    local ? "idle" : "loading"
  );
  const [result, setResult] = useState<RunResult | null>(null);
  // An attempt recorded on ANOTHER device. Null until the check comes back, and
  // left null when offline — the local guard still covers this phone.
  const [serverPlayed, setServerPlayed] = useState<{
    score: number;
    ms: number;
  } | null>(null);

  // The one network fetch the app blocks a screen on. It runs only when the
  // competition is not already on this device, so a creator reopening their own
  // link pays nothing. `cancelled` guards the StrictMode double-mount and a fast
  // navigation away — this creates no remote resource, so a local flag is enough
  // (unlike the sign-in single-flight, which needed module scope).
  useEffect(() => {
    if (local || !competitionId) return;
    // Wait for the session: RLS gives an unauthenticated caller nothing, so
    // firing early would show a failure and then fetch again a moment later.
    if (authStatus === "loading") return;
    let cancelled = false;
    fetchCompetition(competitionId, authUserId).then((res) => {
      // Every setState is in the async callback, never synchronous in the effect
      // body — the cascading-render pattern oxlint's react(set-state-in-effect)
      // rule flags. The opening "loading" comes from the initial state above.
      if (cancelled) return;
      if (!res.ok) return setState("failed");
      if (!res.data) return setState("missing");
      setRemote(res.data);
      setState("idle");
    });
    return () => {
      cancelled = true;
    };
  }, [local, competitionId, authUserId, authStatus]);

  // HAVE THEY ALREADY PLAYED THIS ON ANOTHER DEVICE? The local store only knows
  // about this phone, so without asking, a student could play on a laptop and
  // then again here and be paid local XP twice. The database already refuses the
  // second ROW, which keeps the SCORE fair; this is what makes the app agree.
  //
  // It does NOT block the screen: failure leaves `serverPlayed` null and the
  // local guard still covers this device. Offline should not mean unable to play.
  useEffect(() => {
    if (!competitionId || authStatus === "loading" || !authUserId) return;
    let cancelled = false;
    fetchMyAttempt(competitionId, authUserId).then((res) => {
      if (cancelled || !res.ok || !res.data) return;
      setServerPlayed(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionId, authUserId, authStatus]);

  const competition = local ?? remote;

  function exit() {
    navigate("/game");
  }

  // REPLACED into history, not pushed: the run is spent and the database refuses
  // a second attempt, so a back tap from the review must not land on the quiz.
  function review() {
    navigate(`/game/review/${competitionId}`, { replace: true });
  }

  function finish(run: RunResult) {
    if (!competition) return;
    // ONE ATTEMPT PER COMPETITION, enforced here as well as in the database.
    //
    // Without this guard a replay paid XP again and added a second history row
    // locally, even though the server refused the duplicate — so the score
    // stayed fair while the rewards did not. The browse list and the guard above
    // stop a student reaching this screen twice; this is the backstop for the
    // race where they already have.
    if (attemptFor(attempts, competition.id)) return setResult(run);

    // id and playedAt are minted by the store — see addCompetitionAttempt.
    const attempt: Omit<CompetitionAttempt, "id" | "playedAt"> = {
      competitionId: competition.id,
      userId: authUserId,
      userName,
      score: run.score,
      ms: run.ms,
      opponentName: competition.creatorName,
      opponentId: competition.creatorId,
      opponentScore: competition.creatorScore,
      opponentMs: competition.creatorMs,
      subject: competition.subject,
      total: competition.total,
      // THE REVIEW'S THREE FIELDS, frozen here for the same reason the opponent's
      // score already is: a joiner has no reason to keep the competition on their
      // device, so a review that had to re-read it would go blank offline. See
      // CompetitionAttempt's own note.
      questions: competition.questions,
      answers: run.answers,
      opponentAnswers: competition.creatorAnswers,
    };
    addCompetitionAttempt(attempt, run.score * GAME_XP_PER_CORRECT);

    // Read the row back so the server gets the same id and timestamp the device
    // has, rather than a second set minted here.
    const saved = useBrachNhaStore.getState().competitionAttempts.at(-1);
    if (saved) void publishAttempt(saved);

    setResult(run);
  }

  if (!competitionId) return <Navigate to="/game" replace />;

  if (state === "loading") {
    return (
      <FocusLayout progressPct={0} onExit={exit}>
        <div className="text-center text-sm font-bold text-muted">
          {t.loadingCompetition}
        </div>
      </FocusLayout>
    );
  }

  if (state === "missing" || state === "failed") {
    return (
      <FocusLayout
        progressPct={0}
        onExit={exit}
        footer={<FocusButton onClick={exit}>{t.back}</FocusButton>}
      >
        <div className="text-center">
          <p className="mx-auto max-w-xs text-sm font-bold text-muted">
            {state === "missing" ? t.competitionGone : t.competitionFailed}
          </p>
        </div>
      </FocusLayout>
    );
  }

  if (!competition) return <Navigate to="/game" replace />;

  // ALREADY PLAYED — show what they got rather than the quiz. Reached by a
  // bookmark, a back button, or a link shared after the fact. Replaying could
  // never change the recorded score (the database refuses a second row), so
  // offering the questions again would be a control that cannot do anything.
  //
  // `priorAttempt` covers this device; `serverPlayed` covers every other one,
  // which is what stops a student playing on a laptop and again on a phone.
  const prior = attemptFor(attempts, competition.id);
  if (!result && (prior || serverPlayed)) {
    const mine = prior
      ? { score: prior.score, ms: prior.ms }
      : serverPlayed ?? { score: 0, ms: 0 };
    return (
      <ResultView
        mine={mine}
        theirs={{ score: competition.creatorScore, ms: competition.creatorMs }}
        total={competition.total}
        opponentName={competition.creatorName}
        note={t.alreadyPlayed}
        onExit={exit}
        // Offered even here. The attempt may have been recorded on ANOTHER
        // device, in which case the review says so — which is the honest answer,
        // and better than hiding the way to the answers from someone who has
        // earned them.
        onNext={review}
      />
    );
  }

  if (result) {
    return (
      <ResultView
        mine={{ score: result.score, ms: result.ms }}
        theirs={{ score: competition.creatorScore, ms: competition.creatorMs }}
        total={competition.total}
        opponentName={competition.creatorName}
        onExit={exit}
        onNext={review}
      />
    );
  }

  const subject = findSubject(competition.subject);

  return (
    <CompetitionRun
      questions={competition.questions}
      minutes={competition.minutes}
      kicker={subject?.name ?? competition.creatorName}
      onFinish={finish}
      onExit={exit}
    />
  );
}

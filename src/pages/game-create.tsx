import { useState } from "react";
import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { Lock } from "lucide-react";
import { useAuth, useDisplayName } from "@/hooks/use-auth";
import { useT } from "@/data/translations";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { findSubject } from "@/features/lessons/subjects";
import { pickQuestions } from "@/features/game/game";
import { CreateForm } from "@/features/game/components/create-form";
import {
  CompetitionRun,
  type RunResult,
} from "@/features/game/components/competition-run";
import { PostedView } from "@/features/game/components/posted-view";
import { GAME_XP_PER_CORRECT } from "@/utils/rewards";
import { gameCopy } from "@/features/game/copy";
import { publishCompetition } from "@/lib/competitions";
import type { Competition, ExamQuestion, GameDifficulty } from "@/types";

/** What the creator chose, plus the question set frozen at that moment. */
interface Draft {
  subjectId: string;
  difficulty: GameDifficulty;
  minutes: number;
  questions: ExamQuestion[];
}

/** How the posting went, so the screen can say whether other students can
 *  actually see it — plus the id the review is reached by. */
type Posted = RunResult & { shared: boolean; competitionId: string | null };

/**
 * `/game/create` — post a competition and take it yourself.
 *
 * THREE PHASES IN ONE ROUTE (form → run → posted) rather than three routes,
 * because the middle one cannot be linked to: a competition does not exist until
 * the creator has played it. The joiner's side IS linkable and is its own route.
 *
 * A FOCUS ROUTE: the navigation is hidden throughout, and each phase's X is the
 * way back to /game. It is also an assessment route, so KruAI stays out of reach
 * — a scored competition measures rather than teaches.
 *
 * THE QUESTIONS ARE ROLLED ONCE, HERE, in an event handler and never during
 * render — Math.random() in a render body is the purity violation the React
 * Compiler may memoise around. They are then frozen onto the Competition, which
 * is what guarantees a joiner answers exactly what the creator answered even
 * after data/game-questions.ts is edited.
 *
 * THE LOCAL WRITE HAPPENS FIRST AND UNCONDITIONALLY. Publishing to the server
 * can fail — offline, unconfigured, a signed-out session — and if it does the
 * student still keeps their own record of the run. What they lose is the
 * sharing, which is exactly what PostedView then tells them rather than
 * claiming a competition is waiting for joiners that nobody can see.
 */
export default function GameCreatePage() {
  const navigate = useNavigate();
  const addCompetition = useBrachNhaStore((s) => s.addCompetition);
  const markCompetitionShared = useBrachNhaStore((s) => s.markCompetitionShared);
  const authUserId = useBrachNhaStore((s) => s.authUser?.id ?? "");
  const creatorName = useDisplayName();
  const { hasFullAccess } = useAuth();
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);
  const gc = gameCopy(lang);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [posted, setPosted] = useState<Posted | null>(null);

  function exit() {
    navigate("/game");
  }

  async function finish(result: RunResult) {
    if (!draft) return;
    // No id and no createdAt here: the store mints both. Calling newId() or
    // Date.now() from a component is the impurity oxlint's react(purity) rule
    // and the React Compiler both object to.
    const draftRow: Omit<Competition, "id" | "createdAt"> = {
      creatorId: authUserId,
      creatorName,
      subject: draft.subjectId,
      difficulty: draft.difficulty,
      minutes: draft.minutes,
      questions: draft.questions,
      // What the creator picked, question by question. Saved in the same write
      // as the score so the two can never describe different runs — and, on the
      // server, in the same INSERT, which is what lets the table stay
      // insert-only. See 20260914000001.
      creatorAnswers: result.answers,
      creatorScore: result.score,
      creatorMs: result.ms,
      total: result.total,
    };
    // One call so the post and its reward cannot land separately — the same
    // reason award() is the single place XP, level and coins are granted.
    addCompetition(draftRow, result.score * GAME_XP_PER_CORRECT);

    // Read the row back rather than rebuilding it, so the server gets the SAME
    // id the device has. Minting a second one here would give the two copies
    // different identities, and a joiner's attempt would point at neither.
    const saved = useBrachNhaStore.getState().competitions.at(-1);
    if (!saved)
      return setPosted({ ...result, shared: false, competitionId: null });

    const res = await publishCompetition(saved);
    // A duplicate means the row is already up there — the primary key is the
    // competition's own id, so this is what a publish that landed just before
    // the app closed looks like. Treating it as a failure would leave the row
    // labelled "not shared" forever.
    const shared = res.ok || res.reason === "duplicate";
    if (shared) markCompetitionShared(saved.id);
    setPosted({ ...result, shared, competitionId: saved.id });
  }

  // THE GATE IS ON THE ROUTE, not only on the hub's Create button — a click
  // handler covers neither a typed URL nor a bookmark, which is the lesson
  // pages/roadmap.tsx records. Without an account there is no creatorId to post
  // under, so a guest reaching here could build a competition nobody could ever
  // be matched against.
  //
  // It renders inside FocusLayout rather than LockedFeature, and that is the
  // important difference: this is a focus route, so the sidebar, hamburger and
  // bottom nav are all hidden. LockedFeature's panel expects the navigation to
  // still be around it — see its own note — and dropped in here it would strand
  // a guest on a locked screen with no way out at all, which is exactly the trap
  // ShellLayout's roadmapLock had to grow `hasFullAccess` to avoid.
  if (!hasFullAccess) {
    return (
      <FocusLayout
        progressPct={0}
        onExit={exit}
        footer={<FocusButton onClick={exit}>{gc.back}</FocusButton>}
      >
        <div className="text-center">
          <Lock
            className="mx-auto mb-3 size-12 text-purple md:size-16"
            strokeWidth={2}
          />
          <div className="font-heading mb-2 text-lg font-extrabold md:text-xl">
            {t.loginRequired}
          </div>
          <p className="mx-auto max-w-xs text-sm font-bold text-muted">
            {t.loginRequiredGame}
          </p>
        </div>
      </FocusLayout>
    );
  }

  if (posted) {
    return (
      <PostedView
        score={posted.score}
        total={posted.total}
        shared={posted.shared}
        // The invite link points here. `Posted` already carried the id for the
        // review, so nothing new had to be threaded through for the share.
        competitionId={posted.competitionId}
        onExit={exit}
        // The review is REPLACED into history rather than pushed: this route's
        // three phases cannot be returned to — the competition is posted and the
        // run is spent — so a back tap from the review belongs on /game, not on
        // a form that would start a second one.
        onNext={
          posted.competitionId
            ? () =>
                navigate(`/game/review/${posted.competitionId}`, {
                  replace: true,
                })
            : undefined
        }
      />
    );
  }

  if (draft) {
    const subject = findSubject(draft.subjectId);
    return (
      <CompetitionRun
        questions={draft.questions}
        minutes={draft.minutes}
        kicker={subject?.name ?? ""}
        onFinish={finish}
        onExit={exit}
      />
    );
  }

  return (
    <CreateForm
      onStart={({ subjectId, difficulty, minutes }) =>
        setDraft({
          subjectId,
          difficulty,
          minutes,
          questions: pickQuestions(subjectId, difficulty),
        })
      }
      onExit={exit}
    />
  );
}

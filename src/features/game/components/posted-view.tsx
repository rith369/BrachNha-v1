import { useState } from "react";
import { Hourglass } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { InvitePanel } from "./invite-panel";
import { gameCopy, num } from "../copy";

/**
 * What the CREATOR sees the moment their own run ends.
 *
 * DELIBERATELY NO WIN OR LOSS. There is nobody to compare against yet — the
 * whole point of the design is that the creator posts a score and waits — so
 * anything resembling a verdict here would be invented. It states the score,
 * says the competition is now open, and stops.
 *
 * That is also why this is a separate component from ResultView rather than a
 * branch inside it: the two screens answer different questions, and one
 * component with an `opponent | null` prop would carry a "pretend there is no
 * opponent" path through every line of the comparison.
 *
 * It is a terminal screen, so the caller can render it with a plain early
 * return — see the note in competition-run.tsx about why that matters.
 */
export function PostedView({
  score,
  total,
  shared,
  competitionId,
  onExit,
  onNext,
}: {
  score: number;
  total: number;
  /**
   * The id the invite link points at, or null if the row could not be read back.
   *
   * Optional because the caller has a path where no saved competition exists —
   * and an invite is only offered when there is something real to point at.
   */
  competitionId?: string | null;
  /** Did it actually reach the server? A competition only other students can
   *  see is the whole point, so a failed publish must not be reported as
   *  "waiting for a friend to join" — nobody can join it. */
  shared: boolean;
  onExit: () => void;
  /** Go on to the review — photograph the working, then see the answers. Same
   *  optional shape as ResultView's, and for the same reason. */
  onNext?: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const [inviting, setInviting] = useState(false);

  // THE INVITE IS GATED ON `shared`, AND THAT IS THE POINT OF THE GATE.
  //
  // A competition that never reached the server exists on this device only, so
  // a link to it lands the friend on "this competition is no longer available".
  // Handing someone a QR code that cannot work is worse than not offering one:
  // the failure surfaces on the OTHER student's phone, minutes later, with
  // nothing to explain it. The same `sharedAt` reasoning MyCompetitions uses
  // for its "Not shared yet" label — see Competition.sharedAt.
  // A value rather than a boolean, so TypeScript narrows it for the render
  // below — `shared && Boolean(id)` would leave a cast at the use site.
  const inviteId = shared ? (competitionId ?? null) : null;

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
        <Hourglass
          className="mx-auto mb-3 size-14 text-purple md:mb-5 md:size-20"
          strokeWidth={2}
        />
        <div className="font-heading mb-2 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
          {t.posted}
        </div>

        <div className="mx-auto mb-4 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
          <div className="text-lg font-extrabold md:text-2xl">
            {num(score, lang)} / {num(total, lang)}
          </div>
          <div className="text-xs font-bold opacity-90">{t.yourScore}</div>
        </div>

        <p className="mx-auto max-w-xs text-sm font-bold text-muted">
          {shared ? t.postedBlurb : t.postedOffline}
        </p>

        {/* COLLAPSED BY DEFAULT, and not only for tidiness: the panel is what
            pulls in the QR encoder, so leaving it shut means a student who
            never invites anyone never downloads it. See invite-qr.tsx. */}
        {inviteId && (
          <div className="mt-5">
            {inviting ? (
              <InvitePanel competitionId={inviteId} />
            ) : (
              <button
                type="button"
                onClick={() => setInviting(true)}
                className="rounded-2xl border border-purple/20 bg-purple/8 px-5 py-2.5 text-xs font-extrabold text-purple transition hover:bg-purple/15"
              >
                {t.invite}
              </button>
            )}
          </div>
        )}
      </div>
    </FocusLayout>
  );
}

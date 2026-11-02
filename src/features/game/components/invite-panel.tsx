import { InviteLinkPanel } from "@/components/invite-link-panel";
import { useBrachNhaStore } from "@/lib/store";
import { competitionInviteUrl } from "../invite";
import { gameCopy } from "../copy";

/** The invite for one competition: the shared panel, saying what this link does. */
export function InvitePanel({
  competitionId,
  className,
}: {
  competitionId: string;
  className?: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  return (
    <InviteLinkPanel
      // Read at render rather than in a module constant: `location.origin` is
      // stable for the life of the page but is a browser global, and keeping the
      // reach for it at the edge is what lets invite.ts stay pure and testable.
      url={competitionInviteUrl(window.location.origin, competitionId)}
      hint={t.qrHint}
      shareTitle={t.title}
      shareText={t.inviteBlurb}
      className={className}
    />
  );
}

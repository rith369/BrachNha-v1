import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, Clock, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  lookupFriendInvite,
  sendFriendRequest,
  type FriendFail,
  type FriendInvite,
} from "@/lib/friends";
import { useBrachNhaStore } from "@/lib/store";
import { avatarSeedFor } from "@/utils/avatar-seed";
import {
  friendFailLabel,
  inviteAskLabel,
  inviteFriendsLabel,
  inviteSentLabel,
  useStreakCopy,
} from "../copy";
import { isAccountId } from "../friend-invite";

type Lookup =
  | { state: "failed" }
  /** No such student, or the link was cut short. */
  | { state: "gone" }
  | { state: "ready"; invite: FriendInvite };

const LINK_BUTTON =
  "flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-text shadow-panel-sm transition active:translate-x-px active:translate-y-px active:shadow-none";

/**
 * /friend/:userId, what a friend's link or QR code opens.
 *
 * IT NEVER SENDS ANYTHING BY ITSELF. The name comes from the database rather
 * than the link, so a link cannot claim to be somebody else, and the student has
 * to press Add. Without that tap, anyone could send you a link that makes you ask
 * them, then accept themselves into your goal days.
 *
 * Only reached signed in: FriendsFrame shows a guest the sign-in panel, and the
 * Google redirect comes back to this same address.
 */
export function FriendInviteView({ userId }: { userId: string | undefined }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const valid = isAccountId(userId);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!valid) return;
    let alive = true;
    void lookupFriendInvite(userId).then((r) => {
      if (!alive) return;
      if (!r.ok) setLookup({ state: "failed" });
      else if (r.data === null) setLookup({ state: "gone" });
      else setLookup({ state: "ready", invite: r.data });
    });
    return () => {
      alive = false;
    };
  }, [valid, userId, attempt]);

  if (!valid || lookup?.state === "gone") {
    return <Outcome text={c.inviteGone} />;
  }
  if (lookup === null) {
    return <p className="text-xs font-bold text-muted">{c.loading}</p>;
  }
  if (lookup.state === "failed") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold text-muted">{c.inviteLoadFailed}</p>
        <button
          type="button"
          onClick={() => {
            setLookup(null);
            setAttempt((n) => n + 1);
          }}
          className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          {c.retry}
        </button>
      </div>
    );
  }
  return <InviteCard userId={userId} invite={lookup.invite} />;
}

/** The sentence, and the way on to the friends list. */
function Outcome({ text }: { text: string }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm leading-relaxed font-bold text-text">{text}</p>
      </Card>
      <Link to="/streak/friends" className={LINK_BUTTON}>
        <Users className="size-4" strokeWidth={2.5} aria-hidden />
        {c.seeFriends}
      </Link>
    </div>
  );
}

function InviteCard({ userId, invite }: { userId: string; invite: FriendInvite }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  // What the page has learned since it loaded: a tap moves it on with no reload.
  const [relation, setRelation] = useState(invite.relation);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FriendFail | null>(null);

  if (relation === "self") return <Outcome text={c.inviteSelf} />;

  async function add() {
    setBusy(true);
    setError(null);
    const r = await sendFriendRequest(userId);
    setBusy(false);
    if (r.ok) {
      setRelation(r.data === "accepted" ? "friends" : "sent");
    } else if (r.reason === "exists") {
      // Made on another device since this page loaded, so it is the page's
      // answer that is out of date: ask again rather than guess which it was.
      const again = await lookupFriendInvite(userId);
      if (again.ok && again.data) setRelation(again.data.relation);
      else setError(r.reason);
    } else {
      setError(r.reason);
    }
  }

  const canAdd = relation === "none" || relation === "received";

  return (
    <div className="flex flex-col gap-4">
      <Card className="items-center gap-3 text-center">
        <Avatar
          seed={avatarSeedFor(userId)}
          name={invite.name}
          className="size-20 bg-surface"
        />
        <h2 className="font-heading max-w-full text-lg font-extrabold [overflow-wrap:anywhere]">
          {relation === "friends"
            ? inviteFriendsLabel(invite.name, lang)
            : relation === "sent"
              ? inviteSentLabel(invite.name, lang)
              : inviteAskLabel(invite.name, lang)}
        </h2>

        {canAdd ? (
          <>
            <p className="text-xs leading-relaxed font-bold text-muted md:text-sm">
              {relation === "received" ? c.inviteReceived : c.invitePitch}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void add()}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-cta transition disabled:opacity-60"
            >
              {relation === "received" ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                <UserPlus className="size-4" strokeWidth={2.5} aria-hidden />
              )}
              {relation === "received" ? c.accept : c.add}
            </button>
            {error && (
              <p role="alert" className="text-[11px] font-bold text-muted">
                {friendFailLabel(error, lang)}
              </p>
            )}
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
            {relation === "friends" ? (
              <Check className="size-3.5 shrink-0 text-mint" strokeWidth={3} aria-hidden />
            ) : (
              <Clock className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            {relation === "friends" ? c.friendsIntro : c.waitingAccept}
          </p>
        )}
      </Card>

      {!canAdd && (
        <Link
          to={relation === "friends" ? `/streak/friends/${userId}` : "/streak/friends"}
          className={LINK_BUTTON}
        >
          <Users className="size-4" strokeWidth={2.5} aria-hidden />
          {relation === "friends" ? c.seeStreak : c.seeFriends}
        </Link>
      )}
    </div>
  );
}

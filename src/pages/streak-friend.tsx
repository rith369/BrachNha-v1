import { Navigate, useParams } from "react-router";
import { FriendStreakView } from "@/features/streak/components/friend-streak-view";
import { FriendsFrame } from "@/features/streak/components/friends-frame";
import { useFriends } from "@/features/streak/use-friends";
import { useStreakCopy } from "@/features/streak/copy";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/streak/friends/:friendId`: one friend's shared streak. The id is the
 * FRIEND'S account id (what a list row links to), never trusted beyond a
 * lookup in your own friendships.
 */
export default function StreakFriendPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <FriendsFrame backTo="/streak/friends" backLabel={c.yourFriendsBack} title={c.friendsTitle}>
      <FriendPage />
    </FriendsFrame>
  );
}

function FriendPage() {
  const { friendId } = useParams();
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const { loading, failed, rows, reload } = useFriends();

  const friend = rows.find(
    (r) => r.otherId === friendId && r.status === "accepted" && r.since !== null
  );

  if (friend && friend.since !== null) {
    return (
      <FriendStreakView
        key={friend.id}
        friend={{ ...friend, since: friend.since }}
        onRemoved={reload}
      />
    );
  }
  if (loading) return <p className="text-xs font-bold text-muted">{c.loading}</p>;
  if (failed) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold text-muted">{c.loadFailed}</p>
        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          {c.retry}
        </button>
      </div>
    );
  }
  // Answered, and this student is not (or no longer) your friend.
  return <Navigate to="/streak/friends" replace />;
}

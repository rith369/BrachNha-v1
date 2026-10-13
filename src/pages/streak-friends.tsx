import { FriendsFrame } from "@/features/streak/components/friends-frame";
import { FriendsView } from "@/features/streak/components/friends-view";
import { useStreakCopy } from "@/features/streak/copy";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/streak/friends`: the friends list (requests, friends, search). Thin route
 * file. Each friend's shared streak is its own page, `/streak/friends/:friendId`.
 *
 * A CHILD PATH OF /streak, not a top-level /friends, because it is the same
 * idea seen a different way. It keeps a back link to /streak because it is
 * reached from another page and its menu row is buried in the drawer.
 */
export default function StreakFriendsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <FriendsFrame backTo="/streak" backLabel={c.title} title={c.friendsTitle}>
      <FriendsView />
    </FriendsFrame>
  );
}

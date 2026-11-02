import { useParams } from "react-router";
import { FriendInviteView } from "@/features/streak/components/friend-invite-view";
import { FriendsFrame } from "@/features/streak/components/friends-frame";
import { useStreakCopy } from "@/features/streak/copy";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/friend/:userId`: what a friend's invite link or QR code opens. Thin route
 * file. Not in app.tsx's `routeModules`: it is only ever arrived at from outside,
 * so warming it for every student at idle would buy nothing.
 */
export default function FriendInvitePage() {
  const { userId } = useParams();
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <FriendsFrame backTo="/streak/friends" backLabel={c.yourFriendsBack} title={c.friendsTitle}>
      <FriendInviteView userId={userId} />
    </FriendsFrame>
  );
}

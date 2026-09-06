import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "@/components/shell/bottom-nav";
import { FriendStreakView } from "@/features/streak/components/friend-streak-view";
import { useStreakCopy } from "@/features/streak/copy";
import { useBrachNhaStore } from "@/lib/store";

/**
 * `/streak/friends` — thin route file, same shape as pages/streak.tsx.
 *
 * A CHILD PATH OF /streak, not a top-level /friends, because it is the same
 * number seen a different way and the URL should say so. There is no collision
 * risk: `/streak` and `/streak/friends` differ by a static segment, unlike the
 * `/lessons/:lessonId` versus bare `/lessons/:subjectId` ambiguity that
 * pages/subject-path.tsx documents.
 *
 * IT KEEPS A BACK LINK, which /streak does not. The Study page's own rule is
 * that a bottom-nav tab has nothing to go back FROM — but this is a page
 * reached from another page, and the nav item that opens it is buried in the
 * drawer, so the way back to /streak has to be on screen. `<Link>` rather than
 * navigate(-1): history could have come from anywhere, and this always means
 * "up to my own streak".
 *
 * ONE COLUMN AT max-w-2xl, matching /streak. The page is a single narrative —
 * whose streak this is, whether today counted, the week behind it — read top to
 * bottom, and splitting it into a two-column dashboard would break the order
 * that argument depends on.
 */
export default function StreakFriendsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 md:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* pr-14 keeps the row clear of TopBar's floating hamburger. */}
          <div className="mb-4 flex items-center gap-2 pr-14">
            <Link
              to="/streak"
              aria-label={c.title}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-purple/15 bg-surface text-muted shadow-panel-sm transition hover:text-purple"
            >
              <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
            <Users
              className="size-5 shrink-0 text-purple"
              strokeWidth={2.25}
              aria-hidden
            />
            <h1 className="font-heading min-w-0 truncate bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
              {c.friendsTitle}
            </h1>
          </div>

          <FriendStreakView />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

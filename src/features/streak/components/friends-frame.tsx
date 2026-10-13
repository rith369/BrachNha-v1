import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users } from "lucide-react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { Card } from "@/components/ui/card";
import { LockedFeature } from "@/features/auth/components/locked-feature";
import { useAuth } from "@/hooks/use-auth";
import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useStreakCopy } from "../copy";

/**
 * The frame both friend pages share: the scroller, the back link, the title,
 * the bottom nav, and the account gate.
 *
 * THE GATE. Friends are other students' accounts, so:
 *  - no Supabase at all (a fork, the screenshot harness): one line saying the
 *    feature needs an account, and nothing that would try to fetch;
 *  - a guest: the usual sign-in panel (LockedFeature), with the nav kept
 *    around it;
 *  - the session still resolving: a quiet line, so a returning student is not
 *    shown the sign-in panel for a frame.
 * Children mount only for a signed-in student, so their fetches never run for
 * anyone else.
 *
 * ONE COLUMN AT max-w-2xl, matching /streak: a list and a story read top to
 * bottom.
 */
export function FriendsFrame({
  backTo,
  backLabel,
  title,
  children,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  children: ReactNode;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const { status, isAuthenticated } = useAuth();

  if (isSupabaseConfigured && status === "ready" && !isAuthenticated) {
    return (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <LockedFeature feature="friends" title={c.friendsTitle} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 md:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            {/* A <Link>, not navigate(-1): history could have come from
                anywhere, and this always means "up one level". */}
            <Link
              to={backTo}
              aria-label={backLabel}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-panel-sm transition hover:text-purple"
            >
              <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
            <Users className="size-5 shrink-0 text-purple" strokeWidth={2.25} aria-hidden />
            <h1 className="font-heading min-w-0 truncate bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
              {title}
            </h1>
          </div>

          {!isSupabaseConfigured ? (
            <Card>
              <p className="text-sm font-bold text-muted">{c.needsAccount}</p>
            </Card>
          ) : status !== "ready" ? (
            <p className="text-xs font-bold text-muted">{c.loading}</p>
          ) : (
            children
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

import { Lock } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import type { AuthFeature } from "@/types";
import { GoogleButton } from "./google-button";

/**
 * What a guest sees when they reach a locked route directly.
 *
 * The modal handles the tap; this handles the typed URL, the bookmark and the
 * stale link. Both are needed — guarding only the links would leave three other
 * ways into /roadmap open (grade-prediction's recommended action, and two
 * programmatic navigate() calls in the survey flow).
 *
 * A PANEL, not a redirect. Bouncing someone to Home for tapping a bookmark
 * tells them nothing about why, and the same reasoning already keeps
 * subject-card.tsx's empty tiles on screen rather than hiding them.
 *
 * NOTE the nav has to still be there around this. ShellLayout's roadmapLock
 * hides all chrome on /roadmap until the pledge is seen — which is true for
 * every guest, since a guest never signs one — so without the `isAuthenticated`
 * clause added to that condition, this panel would render with no sidebar, no
 * hamburger, no bottom nav and no way out at all.
 */

const REASON: Record<
  AuthFeature,
  "loginRequiredRoadmap" | "loginRequiredChat" | "loginRequiredGame"
> = {
  roadmap: "loginRequiredRoadmap",
  chat: "loginRequiredChat",
  game: "loginRequiredGame",
};

export function LockedFeature({
  feature,
  title,
}: {
  feature: AuthFeature;
  title: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="pr-14">
        <h1 className="font-heading text-xl font-extrabold">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md rounded-3xl bg-surface p-6 text-center shadow-panel">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-purple/10">
            <Lock className="size-6 text-purple" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 font-heading text-lg font-extrabold text-text">
            {t.signInToUnlock}
          </h2>
          <p className="mb-5 text-sm font-bold text-muted">
            {t[REASON[feature]]}
          </p>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
}

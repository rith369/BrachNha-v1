import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { NewMatchCard } from "@/features/game/components/new-match-card";
import { MyCompetitions } from "@/features/game/components/my-competitions";
import { OpenCompetitions } from "@/features/game/components/open-competitions";
import { GameStatsCard } from "@/features/game/components/game-stats-card";
import { GameHistory } from "@/features/game/components/game-history";
import { BottomNav } from "@/components/shell/bottom-nav";
import { PreviewTag } from "@/components/preview-tag";
import { gameCopy } from "@/features/game/copy";
import { useSharePendingCompetitions } from "@/features/game/share-pending";

/**
 * `/game` — the competition hub, in the ORIGINAL page's layout.
 *
 * BILINGUAL, following the store's `lang` — see features/game/copy.ts for why
 * this reverses an earlier Khmer-only pass.
 *
 * Every card below the hero is ABSENT until it has something to say, and the
 * conditions live here rather than inside each card so the responsive grid does
 * not keep an empty cell: with a card hidden the grid simply has fewer children
 * instead of a hole where one rendered null. A first-time /game is the hero
 * alone, which is the honest picture of having posted nothing.
 *
 * PreviewTag is DELIBERATE and stays for two reasons at once: the hero card is
 * decoration by the user's own request (see new-match-card.tsx), and until
 * competitions reach a server nobody else can see or join what a student posts.
 * The app's rule is that sample data must be labelled, and this is the label.
 */
export default function GamePage() {
  const { lang, competitions, attempts } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      competitions: s.competitions,
      attempts: s.competitionAttempts,
    }))
  );
  const t = gameCopy(lang);
  // Uploads any competition that was saved locally but never reached the server
  // — see share-pending.ts. Mounted here because this is the page that lists
  // them and claims they are open for joiners.
  useSharePendingCompetitions();

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        <div className="mb-0.5 font-heading pr-14 text-xl font-extrabold">
          {t.title}
        </div>
        <div className="mb-2 pr-14 text-xs font-bold text-muted">
          {t.subtitle}
        </div>
        <PreviewTag className="mb-4" />

        {/* See pages/progress.tsx for why two columns at lg needs no changes
            inside the cards themselves. */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {/* The hero is the page's call to action — full width so it stays the
              first thing read, not one of a pair. */}
          <div className="md:col-span-2">
            <NewMatchCard />
          </div>

          {/* A grid-cols-4 stat strip, the same shape as Home's StatPills — it
              suits the full row, and spanning it is what leaves an even pair
              below instead of a half-empty last row. */}
          {attempts.length > 0 && (
            <div className="md:col-span-2">
              <GameStatsCard />
            </div>
          )}

          {/* The browse list is the app’s first network-backed section; it
              renders its own waiting states and hides itself entirely when
              Supabase is unconfigured. See open-competitions.tsx. */}
          <OpenCompetitions />
          {competitions.length > 0 && <MyCompetitions />}
          {attempts.length > 0 && <GameHistory />}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

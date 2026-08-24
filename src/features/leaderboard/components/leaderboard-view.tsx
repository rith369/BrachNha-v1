import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { LEADERBOARD_STUDENTS } from "../demo-data";
import { METRIC_META, PERIOD_LABEL_KEY } from "../metric-meta";
import { LeaderboardControls } from "./leaderboard-controls";
import { PersonalSummary } from "./personal-summary";
import { Podium } from "./podium";
import { RankingList } from "./ranking-list";
import { StickyUserCard } from "./sticky-user-card";
import {
  findCurrentUser,
  gapToNext,
  rankBoard,
  supportingMetrics,
} from "@/utils/leaderboard";
import type { LeaderboardMetric, LeaderboardPeriod } from "@/utils/leaderboard";

/** See the note beside the observers below for why the bottom band is cut. */
const WATCH_OPTIONS = { rootMargin: "0px 0px -150px 0px" };

/**
 * Three boards behind two selectors.
 *
 * `metric` and `period` are plain component state, not store state: they are
 * how this screen is being looked at right now, not something another screen or
 * a reload should inherit. Defaults are XP + Weekly — XP because it's the
 * metric that rewards learning rather than sitting in the app, weekly because a
 * board you can still change today motivates more than a lifetime total.
 *
 * Nothing is precomputed per metric/period. rankBoard() sorts 30 rows on every
 * change, which is free at this size and means the three boards can never drift
 * out of agreement with the summary and the sticky card — they all read the
 * same array.
 *
 * The page caps this at max-w-2xl, the app's one content-column width, already
 * used by every reading and answering screen. A leaderboard is a list to read,
 * not a dashboard to spread out — at 1600px the rows would be a metre of
 * whitespace with a name at each end. The sidebar appearing at lg is what fills
 * the rest of the screen.
 */
export function LeaderboardView() {
  const { lang, userName } = useBrachNhaStore(
    useShallow((s) => ({ lang: s.lang, userName: s.userName }))
  );
  const t = useT(lang);

  const [metric, setMetric] = useState<LeaderboardMetric>("xp");
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");

  const board = rankBoard(LEADERBOARD_STUDENTS, metric, period);
  const me = findCurrentUser(board);
  const gap = me ? gapToNext(board, me.rank) : 0;
  const name = userName || t.youLabel;
  const meta = METRIC_META[metric];

  // The sticky card is a stand-in for something already on the page, so it is
  // shown only while BOTH of the real things are off screen:
  //   • the summary card at the top, which states the same rank and gap
  //   • the student's own row, wherever the current board put it
  // Watching only the row would float a duplicate card over the podium the
  // moment the page opens, with the summary saying the same thing 200px above.
  //
  // The bottom 150px of the viewport is excluded from "visible": that band is
  // the tab bar plus the sticky card itself, so without it the row would count
  // as on screen while sitting underneath the very card being dismissed, and
  // the two would flicker against each other.
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [summaryOnScreen, setSummaryOnScreen] = useState(true);
  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSummaryOnScreen(entry.isIntersecting),
      WATCH_OPTIONS
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Whichever element is currently showing the student — a list row normally,
  // a podium column if they ever crack the top three. Re-runs on metric/period
  // because a new board can put a different DOM node under the ref.
  const anchorRef = useRef<HTMLElement | null>(null);
  const [meOnScreen, setMeOnScreen] = useState(false);
  const setAnchor = (el: HTMLElement | null) => {
    anchorRef.current = el;
  };
  useEffect(() => {
    const el = anchorRef.current;
    if (!el) {
      setMeOnScreen(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setMeOnScreen(entry.isIntersecting),
      WATCH_OPTIONS
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [metric, period]);

  return (
    <div className="flex flex-col gap-4">
      {me && (
        <div ref={summaryRef}>
          <PersonalSummary
            lang={lang}
            row={me}
            metric={metric}
            period={period}
            gap={gap}
            total={board.length}
            name={name}
          />
        </div>
      )}

      <LeaderboardControls
        lang={lang}
        metric={metric}
        period={period}
        onMetric={setMetric}
        onPeriod={setPeriod}
      />

      <div className="-mt-1 px-1">
        <div className="text-[11px] font-bold text-muted">
          {t[meta.descKey]}
        </div>
        {/* Said out loud on this board only, because it's the one a student
            could otherwise read as "win by leaving the app open". */}
        {metric === "studyTime" && (
          <div className="mt-0.5 text-[10px] font-bold text-muted">
            {t.studyTimeNote}
          </div>
        )}
      </div>

      <Podium
        lang={lang}
        top={board.slice(0, 3)}
        metric={metric}
        currentUserName={name}
        currentUserRef={setAnchor}
      />

      <div className="flex items-end justify-between gap-2 px-1">
        <div className="font-heading text-sm font-extrabold">
          {t[meta.labelKey]} · {t[PERIOD_LABEL_KEY[period]]}
        </div>
        {/* Stands in for a column header on the wider rows. */}
        <div className="hidden text-[10px] font-extrabold tracking-wider text-muted uppercase md:block">
          {supportingMetrics(metric)
            .map((m) => t[METRIC_META[m].labelKey])
            .join(" · ")}
          {" · "}
          {t[meta.labelKey]}
        </div>
      </div>

      <RankingList
        lang={lang}
        rows={board.slice(3)}
        metric={metric}
        currentUserName={name}
        currentUserRef={setAnchor}
      />

      <AnimatePresence>
        {me && !meOnScreen && !summaryOnScreen && (
          <StickyUserCard
            lang={lang}
            row={me}
            metric={metric}
            gap={gap}
            name={name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

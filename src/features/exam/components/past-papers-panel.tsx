import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { PAST_PAPER_YEARS } from "@/data/past-papers";
import { toKhmerDigits } from "@/utils/khmer-num";
import { cn } from "@/utils/cn";
import { PastPaperCard } from "./past-paper-card";
import { papersForYear, type PastPaper } from "../papers";

/**
 * Tab A: real MoEYS past papers, chosen by exam session then by subject.
 *
 * Both pieces of state are component state, not store state — this is how the
 * screen is being looked at right now, not something a reload should inherit.
 * Same call as the leaderboard's metric/period.
 *
 * papersForYear() re-derives on every render. That is free at seven items and is
 * what stops the chips, the heading and the cards from ever disagreeing. No
 * useMemo: React Compiler is on, and hand-adding one can defeat it.
 */
export function PastPapersPanel({
  onStartPaper,
}: {
  onStartPaper: (paper: PastPaper) => void;
}) {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);

  const [year, setYear] = useState(PAST_PAPER_YEARS[0]);
  const [notice, setNotice] = useState<string | null>(null);

  const papers = papersForYear(year, userLanguage);

  // THE line that flips when content lands. It reads the content rather than a
  // hand-authored "available" flag, so a card's behaviour cannot drift from what
  // is actually behind it.
  function handleTest(paper: PastPaper) {
    if (paper.questions.length === 0) {
      setNotice(paper.key);
      return;
    }
    onStartPaper(paper);
  }

  return (
    <div>
      <div className="mb-2 text-xs font-extrabold text-muted">
        ជ្រើសរើសសម័យប្រឡង
      </div>

      {/* Full-bleed on phone so the row runs to both screen edges and reads as
          scrollable. The md: reset is mandatory — from there the page gutter is
          the content cap, and -mx-4 would line up with nothing. shrink-0 on the
          chips is what makes the row overflow instead of squashing. */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {PAST_PAPER_YEARS.map((y) => (
          <button
            key={y}
            aria-pressed={y === year}
            onClick={() => {
              setYear(y);
              // Don't carry a note from one session onto another's cards.
              setNotice(null);
            }}
            className={cn(
              "font-heading shrink-0 rounded-full px-4 py-1.5 text-sm font-extrabold transition",
              y === year
                ? // White text on a fill takes the BRAND scale, not --color-purple.
                  // Same call as the leaderboard's "You" chip; see globals.css.
                  "bg-[var(--brand-purple)] text-white shadow-cta"
                : "border border-purple/15 bg-purple/8 text-purple hover:bg-purple/12"
            )}
          >
            {toKhmerDigits(y)}
          </button>
        ))}
      </div>

      <div className="font-heading mb-3 text-base font-extrabold">
        សម័យប្រឡង {toKhmerDigits(year)}
      </div>

      <div>
        {papers.map((p) => (
          <PastPaperCard
            key={p.key}
            paper={p}
            notice={notice === p.key}
            onTest={() => handleTest(p)}
          />
        ))}
      </div>
    </div>
  );
}

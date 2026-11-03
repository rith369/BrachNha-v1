import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { PracticeSubjectCard } from "./practice-subject-card";
import { ContentNotice } from "./content-waiting";
import { retryContent, useContentManifest } from "@/lib/content";
import { liveMistakes } from "../mistakes";
import { PRACTICE_TABS, subjectsFor, type PracticeMode } from "../practice";

/**
 * The practice hub: two tabs — Flashcard and Quiz — over the subject catalog.
 *
 * Shaped after the Mock Exam screen, which is two tabs over one exam catalog,
 * and framed like the Study page, whose staggered tile grid is the right shape
 * for choosing a subject. Both were deliberate: this is a third screen in the
 * same family, and it should not invent a fourth layout.
 *
 * KHMER-ONLY, on purpose. See PRACTICE_PAGE_LANG in ../practice for the why.
 *
 * Two departures from a standalone design, the same two the Study and Exam pages
 * make, because this is a drawer destination inside existing app chrome:
 *
 *  - No back arrow. You do not "go back" from a nav destination.
 *
 * The tab is component state, not store state: it is how the screen is being
 * looked at right now, not something a reload should inherit. Same call as the
 * leaderboard's metric/period and the exam page's year.
 */
export function PracticeView() {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const [mode, setMode] = useState<PracticeMode>("flashcards");
  // Read once here for every tile. Before the first list ever arrives the
  // tiles would all read as coming soon, which is not true, so a quiet line
  // stands in for them; a returning device already has the list stored.
  const manifest = useContentManifest();

  const subjects = subjectsFor(mode, userLanguage);
  const mistakes = useBrachNhaStore((s) => s.mistakes);
  const mistakeCount =
    manifest.status === "ready" ? liveMistakes(mistakes, manifest).length : 0;

  return (
    <div>
      <div className="font-heading mb-4 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
        ការអនុវត្ត
      </div>

      {/* Absent, not empty, until there is something on the list. */}
      {mistakeCount > 0 && (
        <Link
          to="/practice/mistakes"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-panel-sm transition-[transform,box-shadow] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-neo-pink text-ink">
            <RotateCcw className="size-5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-heading text-sm font-extrabold text-text">កំហុសរបស់ខ្ញុំ</div>
            <div className="text-xs font-bold text-muted">
              {mistakeCount} សំណួរត្រូវធ្វើម្តងទៀត
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
        </Link>
      )}

      <UnderlineTabs tabs={PRACTICE_TABS} value={mode} onChange={setMode} />

      {/*
        CSS multi-column, not a grid: the staggered look comes from cards of
        differing height flowing into balanced columns, which is what `columns-*`
        does natively and `grid` does not.

        TWO COLUMNS AT PHONE WIDTH is the same deliberate exception the Study
        page makes to the app's `grid-cols-1 md:grid-cols-2` rule — that rule
        protects dense stat cards needing ~288px, while these are image tiles
        that read fine at ~144px. 320px is the floor and is checked.
      */}
      {manifest.status !== "ready" ? (
        <ContentNotice
          state={manifest.status === "failed" ? "offline" : "loading"}
          onRetry={retryContent}
        />
      ) : (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {subjects.map((s) => (
            <PracticeSubjectCard key={s.id} subject={s} mode={mode} manifest={manifest} />
          ))}
        </div>
      )}
    </div>
  );
}

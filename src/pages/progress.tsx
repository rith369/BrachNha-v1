import { ScoreHero } from "@/features/progress/components/score-hero";
import { WeeklyActivityChart } from "@/features/progress/components/weekly-activity-chart";
import { SubjectBarChart } from "@/features/progress/components/subject-bar-chart";
import { SubjectBreakdown } from "@/features/progress/components/subject-breakdown";
import { FocusAreas } from "@/features/progress/components/focus-areas";
import { ActivityHeatmap } from "@/features/progress/components/activity-heatmap";
import { AiInsights } from "@/features/progress/components/ai-insights";
import { BottomNav } from "@/components/shell/bottom-nav";
import { useProgressSummary } from "@/features/progress/use-progress-summary";
import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";

export default function ProgressPage() {
  // Computed ONCE here and threaded down, rather than each card reading the
  // store for itself. Two cards used to call progressSubjects() independently,
  // which let one screen hold two answers to the same question; and the window
  // maths needs today's date, so deriving it per card would let a render that
  // crosses local midnight window two cards against two different days.
  const summary = useProgressSummary();
  // The same word the drawer and bottom nav use for this page, so the title
  // cannot drift from the link that brought the student here.
  const lang = useBrachNhaStore((s) => s.lang);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        {/* NO PreviewTag, on the user's explicit request (17 Sep 2026), although
            Focus Areas, Study Activity and AI Insights are still demo — the
            same call the Game page made. Don't restore it without asking. */}
        <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
          📈 {T[lang].progress}
        </div>
        {/* One column on a phone, two from md (tablet) and no further. Columns
            land at ~352px on a tablet and ~470–620px on a laptop, all
            comfortably inside the range these cards already handle — a 320px
            phone renders them at 288px — which is why nothing inside the cards
            needs a breakpoint. items-start stops a short card stretching to
            match a tall neighbour.

            A third column at 2xl was tried and reverted: SubjectBreakdown is a
            long list and the two charts are short, so three columns left a
            large hole rather than filling the screen. Card HEIGHT, not
            available width, is what caps this at two. */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {/* The score donut is the summary for everything below it, so it
              keeps the full width rather than sitting in a column. */}
          <div className="md:col-span-2">
            <ScoreHero summary={summary} />
          </div>
          <WeeklyActivityChart summary={summary} />
          <SubjectBarChart summary={summary} />
          {/* SubjectBreakdown grows with the number of subjects (up to 7 rows)
              and has no naturally similar-height neighbour left to pair with,
              so it spans full width rather than stretching a short card next
              to it into a tall row with a lot of dead space below that card —
              which is exactly what was leaving FocusAreas (and whatever
              followed it) sitting under the floating chat button at md/lg
              widths. */}
          <div className="md:col-span-2">
            <SubjectBreakdown summary={summary} />
          </div>
          {/* Same reasoning as StatPills/GameStatsCard elsewhere: a fixed
              2x2 stat grid reads as a banner across the full width, not as a
              column item next to a variable-height list. */}
          <div className="md:col-span-2">
            <FocusAreas />
          </div>
          <ActivityHeatmap />
          <AiInsights />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { gradedDueCount } from "@/features/practice/review";
import { useContentManifest } from "@/lib/content";
import { PROGRESS_COPY } from "../copy";
import type { ProgressSummary } from "../summary";
import { buildStudyTips, type StudyTip, type TipTone } from "../study-tips";

const TONE: Record<TipTone, string> = {
  purple: "border-border bg-purple/6 text-purple",
  pink: "border-border bg-pink/6 text-pink",
  blue: "border-border bg-blue/6 text-blue",
  mint: "border-border bg-mint/6 text-mint",
};

function TipBody({ tip }: { tip: StudyTip }) {
  return (
    <>
      <div className="mb-1.5 text-lg">{tip.icon}</div>
      <div className="mb-1 text-xs font-extrabold">{tip.title}</div>
      <div className="text-[11px] font-semibold text-text/80">{tip.body}</div>
    </>
  );
}

export function StudyTips({ summary }: { summary: ProgressSummary }) {
  const { lang, activityLog, streak, tasks, tasksDate, studentCards, cardReviews } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        activityLog: s.activityLog,
        streak: s.streak,
        tasks: s.tasks,
        tasksDate: s.tasksDate,
        studentCards: s.studentCards,
        cardReviews: s.cardReviews,
      }))
    );
  // Card ids come from what is published, so counting due cards downloads no
  // deck (lib/content.ts).
  const manifest = useContentManifest();
  const c = PROGRESS_COPY[lang];
  // The rolling week ends today, so its last key IS today, as the summary
  // computed it. Re-reading the clock here could disagree across midnight.
  const today = summary.week[summary.week.length - 1]?.key ?? "";

  // Only cards the student has graded before: a never-seen card is "due" to
  // the scheduler, and counting those would nag a student about a deck they
  // have never opened.
  const cardsDue = gradedDueCount(manifest, studentCards, cardReviews);

  const tips = buildStudyTips({
    summary,
    activityLog,
    streak,
    tasks,
    tasksDate,
    cardsDue,
    today,
    lang,
  });

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">{c.tipsTitle}</div>
      {/* Full-bleed carousel on a phone: -mx-4 cancels the page's px-4 so the
          cards run to both screen edges, which is what makes it read as
          scrollable. From md the card sits inside a grid column instead, where
          bleeding outward would push it over its neighbour — the page padding
          is also px-6/px-8 there, so -mx-4 would no longer line up with
          anything. Reset it and scroll within the column. */}
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {tips.map((tip) => {
          const cls = `block w-56 shrink-0 rounded-2xl border p-3.5 ${TONE[tip.tone]}`;
          return tip.href ? (
            <Link
              key={tip.id}
              to={tip.href}
              className={`${cls} transition-transform active:scale-[0.98]`}
            >
              <TipBody tip={tip} />
            </Link>
          ) : (
            <div key={tip.id} className={cls}>
              <TipBody tip={tip} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

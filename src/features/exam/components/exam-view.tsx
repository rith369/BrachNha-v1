import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { allSubjects } from "@/features/lessons/subjects";
import { EXAM_TABS, teacherListHref, type ExamTab } from "../papers";
import { PastPapersPanel } from "./past-papers-panel";
import { TeacherPapersPanel } from "./teacher-papers-panel";

/**
 * The /exam/subjects screen: two tabs over one exam catalog. Reached from the
 * chooser at /exam (exam-hub.tsx), which is why it carries a back link up to it.
 *
 * NO PAPER IS SAT HERE. Tab A's past papers and Tab B's teacher papers both
 * open their own screen at /exam/subjects/:paperKey (pages/exam-paper.tsx),
 * which shows what the paper is and its history before anything starts a clock.
 * (Tab B used to run a plain question list in place, from a code file that was
 * never filled; it became teacher papers on 6 Nov 2026.)
 *
 * THE OPEN TAB AND SUBJECT ARE IN THE URL (`?tab=generated&subject=math`), not
 * component state: a paper screen is another route, so coming back from one
 * must land on the list it was opened from, not on Tab A. Switching tabs
 * replaces the history entry; opening a subject pushes one, so the phone's back
 * button steps from a subject's papers to the subject cards.
 *
 * KHMER-ONLY, on purpose. See EXAM_PAGE_LANG in ../papers for the why.
 */
export function ExamView() {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const tab: ExamTab = params.get("tab") === "generated" ? "generated" : "past";
  const subjectId = params.get("subject");
  // Checked against the subjects this student has, so a hand-made or stale
  // link (a subject the student did not pick) opens the subject cards instead.
  const subject = allSubjects(userLanguage).find((s) => s.id === subjectId) ?? null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <h1 className="sr-only">វិញ្ញាសារតាមមុខវិជ្ជា</h1>
      <div className="mx-auto w-full max-w-2xl">
        {/* Up to the /exam chooser. A Link, not navigate(-1): history could
            have come from anywhere, and this always means "up one level" —
            same call practice-lesson-list.tsx makes. */}
        <Link
          to="/exam"
          className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
          វិញ្ញាសារត្រៀមប្រឡង
        </Link>

        <div className="font-heading mb-4 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          វិញ្ញាសារតាមមុខវិជ្ជា
        </div>

        <UnderlineTabs
          tabs={EXAM_TABS}
          value={tab}
          onChange={(next) =>
            setParams(next === "generated" ? { tab: next } : {}, { replace: true })
          }
        />

        {tab === "past" ? (
          // A real paper OPENS ITS OWN SCREEN rather than starting here —
          // nothing starts a 60-minute clock on the tap that opened a card.
          <PastPapersPanel
            onStartPaper={(paper) => navigate(`/exam/subjects/${paper.key}`)}
          />
        ) : (
          <TeacherPapersPanel
            subject={subject}
            onOpenSubject={(s) => navigate(teacherListHref(s.id))}
          />
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { retryContent, useContentManifest } from "@/lib/content";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { SubjectMeta } from "@/features/lessons/subjects";
import { ExamPaperCard } from "./exam-paper-card";
import { paperResultsFor } from "../paper-scoring";
import {
  EXAM_TABS,
  paperTitle,
  teacherPapersFor,
  teacherSubjects,
  type ExamPaper,
} from "../papers";

/**
 * Tab B, វិញ្ញាសារបង្កើតថ្មី: TEACHER PAPERS, whole papers teachers wrote in the
 * Bac II format, modelled on the past exams. Many per subject (the user's
 * example was 100), so it is two levels:
 *
 *  1. one card per subject, Tab A's card with no year chips; a subject with no
 *     papers yet shows ឆាប់ៗនេះ and explains itself on a tap, as Tab A's do;
 *  2. that subject's papers, "វិញ្ញាសារទី 1", "វិញ្ញាសារទី 2"… (the user's
 *     wording: the subject is already chosen, so the number is enough). Each
 *     row opens /exam/subjects/new-{subject}-{n}, the same screen, timer,
 *     history and review as a past paper.
 *
 * WHICH SUBJECT IS OPEN IS IN THE URL (`?tab=generated&subject=math`, owned by
 * ExamView), so the paper screen's back link and the phone's back button both
 * return to the list the student came from.
 *
 * Everything is read off the manifest (lib/content.ts): the lists download no
 * paper. A row's score is the student's best on that paper, from paperResults.
 */
export function TeacherPapersPanel({
  subject,
  onOpenSubject,
}: {
  /** The open subject, already checked against the catalog, or null. */
  subject: SubjectMeta | null;
  onOpenSubject: (subject: SubjectMeta) => void;
}) {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const results = useBrachNhaStore((s) => s.paperResults);
  const manifest = useContentManifest();
  const [notice, setNotice] = useState<string | null>(null);

  if (manifest.status !== "ready") {
    return (
      <ContentNotice
        state={manifest.status === "failed" ? "offline" : "loading"}
        onRetry={retryContent}
      />
    );
  }

  const papers = subject ? teacherPapersFor(subject.id, manifest) : [];

  // Level two. A subject whose papers were all hidden since the link was made
  // falls through to the subject list rather than an empty screen.
  if (subject && papers.length > 0) {
    return (
      <div>
        <Link
          to="/exam/subjects?tab=generated"
          className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
          {EXAM_TABS[1].label}
        </Link>

        <div className="mb-3 flex items-center gap-3">
          <SubjectArt subject={subject} className="size-12 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <div className="font-heading truncate text-base font-extrabold md:text-lg">
              {paperTitle(subject)}
            </div>
            <div className="text-xs font-bold text-muted">{papers.length} វិញ្ញាសារ</div>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {papers.map((paper) => {
            const best = paperResultsFor(results, paper.key).reduce<number | null>(
              (top, r) => (top === null || r.pct > top ? r.pct : top),
              null
            );
            return (
              <li key={paper.key}>
                <Link
                  to={`/exam/subjects/${paper.key}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-panel transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-heading block truncate text-sm font-extrabold md:text-base">
                      {paper.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-muted md:text-xs">
                      {paper.count} សំណួរ
                    </span>
                  </span>
                  {best !== null && (
                    <span className="shrink-0 rounded-full border border-border bg-neo-mint px-2.5 py-0.5 text-[11px] font-extrabold text-ink">
                      {best}%
                    </span>
                  )}
                  <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  function handleTest(card: ExamPaper) {
    if (card.count === 0) {
      setNotice(card.key);
      return;
    }
    onOpenSubject(card.subject);
  }

  return (
    <div>
      {teacherSubjects(userLanguage, manifest).map((card) => (
        <ExamPaperCard
          key={card.key}
          paper={card}
          notice={notice === card.key}
          onTest={() => handleTest(card)}
        />
      ))}
    </div>
  );
}

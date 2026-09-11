import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { ExamPaperCard } from "./exam-paper-card";
import { generatedPapers, type ExamPaper } from "../papers";

/**
 * Tab B: newly-generated papers, one per subject — no exam session to choose,
 * so this is PastPapersPanel with the year chips and the "ជ្រើសរើសសម័យប្រឡង"
 * heading removed and nothing else changed. Same card, same tap-anywhere
 * behaviour; the user asked for the identical style minus the year selector
 * specifically. Math and biology start LIVE (GENERATED_EXAM_QUESTIONS derives
 * from the old MOCK_QS test), every other subject starts ឆាប់ៗនេះ same as a
 * real past paper does until it has its own content.
 *
 * papers re-derives every render, same reasoning as PastPapersPanel: free at
 * seven items, and it's what stops the list from ever disagreeing with the
 * content behind it.
 */
export function GeneratedPapersPanel({
  onStartPaper,
}: {
  onStartPaper: (paper: ExamPaper) => void;
}) {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);

  const [notice, setNotice] = useState<string | null>(null);

  const papers = generatedPapers(userLanguage);

  function handleTest(paper: ExamPaper) {
    if (paper.questions.length === 0) {
      setNotice(paper.key);
      return;
    }
    onStartPaper(paper);
  }

  return (
    <div>
      {papers.map((p) => (
        <ExamPaperCard
          key={p.key}
          paper={p}
          notice={notice === p.key}
          onTest={() => handleTest(p)}
        />
      ))}
    </div>
  );
}

import { MOCK_QS } from "./questions";
import type { ExamQuestion } from "@/types";

/**
 * The content slot for Tab B's per-subject "newly generated" papers
 * (វិញ្ញាសារបង្កើតថ្មី) — the successor to the old fixed 10-question MOCK_QS test
 * in data/questions.ts, which stays in the codebase but is no longer SHOWN; see
 * features/exam/components/exam-view.tsx and generated-exam-panel.tsx.
 *
 * SAME PATTERN as data/past-papers.ts, one dimension simpler: no exam session
 * to key on, since these aren't tied to a past year. features/exam/papers.ts's
 * generatedPapers() derives one card per subject regardless of what is in here,
 * so a subject with no entry below simply renders ឆាប់ៗនេះ.
 *
 * NOT EMPTY, unlike PAST_PAPERS when that tab shipped — DERIVED from
 * MOCK_QS, grouped by `subj`, rather than hand-authored or left blank. MOCK_QS
 * already has 5 real math questions and 5 real biology ones; retiring the old
 * single mixed-subject UI must not also retire the only way a student could
 * take ANY exam through this screen. This is what "keep the old exam, just
 * don't show it [that way]" means for the content, not only the component: the
 * questions carry over into the new per-subject browser, the old intro+history
 * screen around them does not. Every OTHER subject still starts empty, same as
 * a real past paper does, until real per-subject content is written for it —
 * this derivation is not a promise that content exists, only that it is not
 * thrown away where it already did.
 */
export const GENERATED_EXAM_QUESTIONS: Record<string, ExamQuestion[]> =
  MOCK_QS.reduce<Record<string, ExamQuestion[]>>((bySubject, q) => {
    (bySubject[q.subj] ??= []).push(q);
    return bySubject;
  }, {});

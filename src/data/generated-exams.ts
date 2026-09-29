import type { ExamQuestion } from "@/types";

/**
 * The content slot for Tab B's per-subject "newly generated" papers
 * (វិញ្ញាសារបង្កើតថ្មី) — see features/exam/components/exam-view.tsx and
 * generated-papers-panel.tsx.
 *
 * SAME PATTERN as data/past-papers.ts, one dimension simpler: no exam session
 * to key on, since these aren't tied to a past year. features/exam/papers.ts's
 * generatedPapers() derives one card per subject regardless of what is in here,
 * so a subject with no entry below simply renders ឆាប់ៗនេះ (Coming Soon).
 *
 * All subjects currently start empty ("ឆាប់ៗនេះ" / Coming Soon) pending newly
 * authored curriculum-aligned generated papers. The old prototype math and biology
 * questions from MOCK_QS have been retired from this screen.
 */
export const GENERATED_EXAM_QUESTIONS: Record<string, ExamQuestion[]> = {};

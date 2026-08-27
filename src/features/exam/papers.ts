import { PAST_PAPER_QUESTIONS } from "@/data/past-papers";
import type { ExamQuestion } from "@/types";
import type { UnderlineTab } from "@/components/ui/underline-tabs";
import { allSubjects, type SubjectId, type SubjectMeta } from "@/features/lessons/subjects";

/**
 * THIS PAGE IS KHMER-ONLY, ON PURPOSE.
 *
 * The exam page's own copy — title, tab labels, the whole past-papers tab, the
 * generated-exam intro, the results screen — is Khmer literals rather than
 * `{ en, km }` pairs behind `T[lang]`, so it renders Khmer even when the app is
 * switched to English. Same product decision already recorded for the Study page
 * (LESSONS_PAGE_LANG in features/lessons/subjects.ts) and for KruAI, which always
 * answers in Khmer whatever the student typed (ANSWER_LANG in
 * utils/chat-prompt.ts).
 *
 * TWO CARVE-OUTS, stated plainly so nobody "fixes" them into line:
 *
 *  1. QUESTION TEXT and the runner's subject kicker stay bilingual (`q.q[lang]`,
 *     `t[q.subj]`). That is authored data, shared with the placement test, and
 *     MOCK_QS's km column is visibly abbreviated against its en column —
 *     degrading content to satisfy a decision about chrome is a real cost.
 *  2. FocusLayout's own copy (the exit confirm) stays lang-driven. It is shared
 *     with the lesson flow, and it must not read Khmer on the exam and English
 *     on a lesson in the same session.
 *
 * The consequence: toggling the app to English leaves this screen's chrome in
 * Khmer while the questions inside it switch. That is intended.
 *
 * Flipping it back means giving these strings `{ en, km }` shapes and reading
 * them through `T[lang]`. The now-unused t.mockExam / t.startMockExam /
 * t.examScore / t.retakeExam / t.bacReadiness / t.examInstructions keys were
 * deliberately LEFT IN translations.ts so that reversal doesn't require
 * re-authoring the English copy from scratch.
 */
export const EXAM_PAGE_LANG = "km" as const;

export type ExamTab = "past" | "generated";

export const EXAM_TABS: UnderlineTab<ExamTab>[] = [
  { id: "past", label: "វិញ្ញាសារឆ្នាំចាស់" },
  { id: "generated", label: "វិញ្ញាសារបង្កើតថ្មី" },
];

export interface PastPaper {
  /** `"{year}-{subjectId}"`. Also the React key and the notice key. */
  key: string;
  year: number;
  subject: SubjectMeta;
  /** "វិញ្ញាសារ" + the subject's name. */
  title: string;
  blurb: string;
  /** Empty until real content is dropped into data/past-papers.ts. */
  questions: ExamQuestion[];
}

export function paperKey(year: number, id: SubjectId): string {
  return `${year}-${id}`;
}

/**
 * The papers offered for one exam session.
 *
 * DERIVED FROM THE SUBJECT CATALOG, not from the content. Filtering to subjects
 * that actually have questions would render zero cards today, and zero cards is
 * not a screen — empty is the normal state here exactly as it is for Study,
 * where most subjects have no lessons yet.
 *
 * allSubjects() also drops whichever of english/french the student didn't pick
 * at login, so a session is 7 papers rather than 8.
 *
 * The title/blurb are CONCATENATED on purpose rather than authored per subject:
 * Khmer has no inter-word space, so "វិញ្ញាសារ" + "គណិតវិទ្យា" reads correctly as
 * one term, and a derived title cannot drift from the catalog. If a subject ever
 * needs a bespoke paper title, add an optional `paperTitle` to SubjectMeta —
 * don't special-case it here.
 */
export function papersForYear(
  year: number,
  userLanguage: string | undefined
): PastPaper[] {
  return allSubjects(userLanguage).map((subject) => {
    const key = paperKey(year, subject.id);
    return {
      key,
      year,
      subject,
      title: `វិញ្ញាសារ${subject.name}`,
      blurb: `ធ្វើការសាកល្បងប្រឡងវិញ្ញាសារ${subject.name}`,
      questions: PAST_PAPER_QUESTIONS[key] ?? [],
    };
  });
}

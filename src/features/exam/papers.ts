import { PAST_PAPERS } from "@/data/past-papers";
import { GENERATED_EXAM_QUESTIONS } from "@/data/generated-exams";
import type { ExamQuestion, PastPaperContent } from "@/types";
import type { UnderlineTab } from "@/components/ui/underline-tabs";
import {
  allSubjects,
  findSubject,
  type SubjectId,
  type SubjectMeta,
} from "@/features/lessons/subjects";

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

/**
 * The fields ExamPaperCard actually renders — the shape shared by a real
 * past-year paper AND a newly-generated one. `PastPaper` below extends it with
 * `year`, which the card has never read; a generated paper simply has no such
 * field rather than carrying a fake one.
 */
export interface ExamPaper {
  /** React key and notice key. */
  key: string;
  subject: SubjectMeta;
  /** "វិញ្ញាសារ" + the subject's name. */
  title: string;
  blurb: string;
  /** Empty until real content is dropped into the backing data file. */
  questions: ExamQuestion[];
}

export interface PastPaper extends ExamPaper {
  year: number;
  /**
   * The paper as printed — sections, the reading passage, the writing task.
   * Undefined for every paper with no content yet, which is what `questions`
   * being empty already says; the two can never disagree because `questions` is
   * derived from this.
   */
  content?: PastPaperContent;
}

/**
 * Every scored question on a paper, in the order it is sat.
 *
 * DERIVED, never authored beside the sections. The card's readiness rule, the
 * results screen's total and the content log all count this array, so a paper
 * cannot show "7 questions" while holding 6 — the same discipline
 * `lessonCountFor()` enforces on the Study page.
 *
 * A gap-fill section contributes its answerable gaps as questions whose options
 * are the whole word bank: that is exactly what a student picks from, and it
 * keeps a gap scorable by the same `answers[id] === correct` rule an a/b/c/d
 * question uses. The EXAMPLE gap is excluded — the paper fills it in for you.
 */
export function paperQuestions(content: PastPaperContent): ExamQuestion[] {
  return content.sections.flatMap((section) => {
    if (section.gapFill) {
      const bank = section.gapFill.wordBank;
      return section.gapFill.gaps
        .filter((gap) => !gap.example)
        .map((gap) => ({
          q: { en: `(${gap.number})`, km: `(${gap.number})` },
          correct: gap.correct,
          options: bank,
        }));
    }
    return section.questions ?? [];
  });
}

export function paperKey(year: number, id: SubjectId): string {
  return `${year}-${id}`;
}

export function generatedPaperKey(id: SubjectId): string {
  return `generated-${id}`;
}

// Concatenated, not authored per subject: Khmer has no inter-word space, so
// "វិញ្ញាសារ" + "គណិតវិទ្យា" reads correctly as one term, and a derived title
// cannot drift from the catalog. Shared by both papersForYear() and
// generatedPapers() so the two tabs render identical wording — "same style" was
// asked for explicitly. If a subject ever needs a bespoke title, add an
// optional `paperTitle` to SubjectMeta — don't special-case it here.
function paperTitle(subject: SubjectMeta): string {
  return `វិញ្ញាសារ${subject.name}`;
}
function paperBlurb(subject: SubjectMeta): string {
  return `ធ្វើការសាកល្បងប្រឡងវិញ្ញាសារ${subject.name}`;
}

/**
 * ONE past paper, resolved from the key in a URL.
 *
 * `/exam/subjects/:paperKey` needs the same object the card list builds, and
 * building it there by hand is how the paper's own screen would end up titled
 * differently from the card that opened it — so both go through paperTitle()
 * here. Returns null for an unknown key, a subject outside the catalog, or a
 * paper with no content: none of those is a screen, and the page redirects.
 */
export function pastPaperByKey(key: string): PastPaper | null {
  const dash = key.indexOf("-");
  const year = Number(key.slice(0, dash));
  const subject = findSubject(key.slice(dash + 1));
  // Object.hasOwn, never `in` and never a truthiness test — PAST_PAPERS is a
  // plain object literal, so "constructor" is `in` it and "toString" resolves
  // to a function. Same guard chat-handler.ts documents for SECTION_CONTENT.
  const content = Object.hasOwn(PAST_PAPERS, key) ? PAST_PAPERS[key] : undefined;

  if (!subject || !content || !Number.isFinite(year)) return null;

  return {
    key,
    year,
    subject,
    title: paperTitle(subject),
    blurb: paperBlurb(subject),
    content,
    questions: paperQuestions(content),
  };
}

/**
 * The papers offered for one past exam session.
 *
 * DERIVED FROM THE SUBJECT CATALOG, not from the content. Filtering to subjects
 * that actually have questions would render zero cards today, and zero cards is
 * not a screen — empty is the normal state here exactly as it is for Study,
 * where most subjects have no lessons yet.
 *
 * allSubjects() also drops whichever of english/french the student didn't pick
 * at login, so a session is 7 papers rather than 8.
 */
export function papersForYear(
  year: number,
  userLanguage: string | undefined
): PastPaper[] {
  return allSubjects(userLanguage).map((subject) => {
    const key = paperKey(year, subject.id);
    const content = PAST_PAPERS[key];
    return {
      key,
      year,
      subject,
      title: paperTitle(subject),
      blurb: paperBlurb(subject),
      content,
      questions: content ? paperQuestions(content) : [],
    };
  });
}

/**
 * The newly-generated papers, one per subject — Tab B's replacement for the old
 * single fixed 10-question MOCK_QS test. SAME SHAPE as papersForYear(), just
 * with no year to choose: there is one paper per subject rather than one per
 * subject per session, so the tab renders straight into the card list with no
 * "ជ្រើសរើសសម័យប្រឡង" chip row above it — the user asked for the identical card
 * style minus that section specifically.
 *
 * `GENERATED_EXAM_QUESTIONS` is DERIVED from MOCK_QS (grouped by subject), not
 * empty — math and biology therefore start live, and every other subject shows
 * ឆាប់ៗនេះ until real per-subject content lands in that file. See that file's
 * own header for why: retiring the old mixed-subject UI must not also retire
 * the only way a student could take an exam through this screen. The OLD
 * MOCK_QS test's intro/history UI (`components/generated-exam-panel.tsx`) is
 * kept in the codebase, unreferenced by ExamView, rather than deleted — see
 * that file's own header.
 */
export function generatedPapers(userLanguage: string | undefined): ExamPaper[] {
  return allSubjects(userLanguage).map((subject) => {
    const key = generatedPaperKey(subject.id);
    return {
      key,
      subject,
      title: paperTitle(subject),
      blurb: paperBlurb(subject),
      questions: GENERATED_EXAM_QUESTIONS[subject.id] ?? [],
    };
  });
}

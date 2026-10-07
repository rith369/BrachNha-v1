import { GENERATED_EXAM_QUESTIONS } from "@/data/generated-exams";
import type { ExamQuestion, PaperBody, PastPaperContent } from "@/types";
import { contentEntry, type ContentManifest } from "@/utils/content-manifest";
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
 *     `t[q.subj]`). That is authored data, shared with the Game feature;
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
  /** Scored questions. 0 means nothing is there yet, and the card says so. A
   *  past paper's comes from the manifest, so the card list downloads no
   *  paper; a generated paper's is its question count. */
  count: number;
}

/** A Tab B paper: its questions are in code (data/generated-exams.ts). */
export interface GeneratedPaper extends ExamPaper {
  questions: ExamQuestion[];
}

export interface PastPaper extends ExamPaper {
  year: number;
  /** The published version (lib/content.ts), or null when there is none. An
   *  attempt records it, so reopening one marks against what was sat. */
  version: number | null;
  /**
   * The paper as printed — sections, the reading passage, the writing task,
   * the drills. Present only once its body is downloaded, which happens on the
   * paper's own screen; the card list needs only `count`.
   */
  content?: PastPaperContent;
}

/**
 * Every scored question on a paper, in the order it is sat.
 *
 * DERIVED, never authored beside the sections. The card's readiness rule, the
 * results screen's total and the content log all count this array, so a paper
 * cannot show "7 questions" while holding 6 — the same discipline the Study
 * page's lesson counts follow.
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
export function paperTitle(subject: SubjectMeta): string {
  return `វិញ្ញាសារ${subject.name}`;
}
function paperBlurb(subject: SubjectMeta): string {
  return `ធ្វើការសាកល្បងប្រឡងវិញ្ញាសារ${subject.name}`;
}

/**
 * A stored paper as the app's PastPaperContent. The database keeps a question's
 * text as ONE string (both papers carry the same text in both languages, and
 * the move refused a paper where they differed); the runner reads `q[lang]`,
 * so it gets the same string under both. Everything else is the same shape.
 */
export function toPastPaperContent(body: PaperBody): PastPaperContent {
  return {
    minutes: body.minutes,
    points: body.points,
    note: body.note,
    writing: body.writing,
    skills: body.skills,
    sections: body.sections.map((part) => ({
      ...part,
      questions: part.questions?.map(({ q, ...rest }) => ({ ...rest, q: { en: q, km: q } })),
    })),
  };
}

/** "2025-math" back into its year and subject, or null for anything else. */
export function parsePaperKey(key: string): { year: number; subject: SubjectMeta } | null {
  const m = /^(20\d{2})-([a-z]+)$/.exec(key);
  const subject = m ? findSubject(m[2]) : undefined;
  return m && subject ? { year: Number(m[1]), subject } : null;
}

/**
 * ONE past paper's card, from the manifest: title, count and version, no
 * content. For Home's study feed and the paper's own screen while its body
 * downloads. Null for an unknown key or a paper nobody has published.
 *
 * The paper's own screen and the card list both go through paperTitle() here,
 * so a paper cannot be titled differently from the card that opened it.
 */
export function pastPaperCard(key: string, manifest: ContentManifest): PastPaper | null {
  const parsed = parsePaperKey(key);
  const entry = contentEntry(manifest, "paper", key);
  if (!parsed || !entry) return null;
  return {
    key,
    year: parsed.year,
    subject: parsed.subject,
    title: paperTitle(parsed.subject),
    blurb: paperBlurb(parsed.subject),
    count: entry.count,
    version: entry.version,
  };
}

/** The same card with its downloaded content, for the paper's own screen. */
export function withContent(paper: PastPaper, body: PaperBody, version: number): PastPaper {
  const content = toPastPaperContent(body);
  return { ...paper, version, content, count: paperQuestions(content).length };
}

/**
 * The papers offered for one past exam session.
 *
 * DERIVED FROM THE SUBJECT CATALOG, not from the content. Filtering to subjects
 * that actually have questions would render zero cards today, and zero cards is
 * not a screen — empty is the normal state here exactly as it is for Study,
 * where most subjects have no lessons yet. Whether a card has a paper behind it
 * comes from the MANIFEST (lib/content.ts), so the list downloads no paper.
 *
 * allSubjects() also drops whichever of english/french the student didn't pick
 * at login, so a session is 7 papers rather than 8.
 */
export function papersForYear(
  year: number,
  userLanguage: string | undefined,
  manifest: ContentManifest
): PastPaper[] {
  return allSubjects(userLanguage).map((subject) => {
    const key = paperKey(year, subject.id);
    const entry = contentEntry(manifest, "paper", key);
    return {
      key,
      year,
      subject,
      title: paperTitle(subject),
      blurb: paperBlurb(subject),
      count: entry?.count ?? 0,
      version: entry?.version ?? null,
    };
  });
}

/**
 * The newly-generated papers, one per subject — Tab B's replacement for the old
 * single fixed 10-question test. SAME SHAPE as papersForYear(), just
 * with no year to choose: there is one paper per subject rather than one per
 * subject per session, so the tab renders straight into the card list with no
 * "ជ្រើសរើសសម័យប្រឡង" chip row above it — the user asked for the identical card
 * style minus that section specifically.
 *
 * `GENERATED_EXAM_QUESTIONS` is EMPTY today, so every subject shows ឆាប់ៗនេះ
 * until real per-subject content lands in that file. The old 10-question test
 * (MOCK_QS) and its intro/history panel were deleted on 7 Oct 2026.
 */
export function generatedPapers(userLanguage: string | undefined): GeneratedPaper[] {
  return allSubjects(userLanguage).map((subject) => {
    const key = generatedPaperKey(subject.id);
    const questions = GENERATED_EXAM_QUESTIONS[subject.id] ?? [];
    return {
      key,
      subject,
      title: paperTitle(subject),
      blurb: paperBlurb(subject),
      questions,
      count: questions.length,
    };
  });
}

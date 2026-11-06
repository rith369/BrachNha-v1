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
 * past-year paper AND a Tab B subject card. `PastPaper` below extends it with
 * what only a paper has (`year`, the detail screen's lines); a subject card
 * simply has no such fields rather than carrying fake ones.
 */
export interface ExamPaper {
  /** React key and notice key. */
  key: string;
  subject: SubjectMeta;
  /** "វិញ្ញាសារ" + the subject's name. */
  title: string;
  blurb: string;
  /** 0 means nothing is there yet, and the card says so. A paper's scored
   *  questions, from the manifest, so the card list downloads no paper; on a
   *  Tab B subject card, how many teacher papers the subject has. */
  count: number;
}

/**
 * One paper a student can open at /exam/subjects/:paperKey: a real past paper
 * ("2025-math") or a TEACHER PAPER ("new-math-3"), a whole paper a teacher
 * wrote in the Bac II format, modelled on the past exams. Both are the same
 * stored body (kind "paper") on the same screen; only the key, the title and
 * where "back" goes differ. Teacher papers are Tab B (20261106000001).
 */
export interface PastPaper extends ExamPaper {
  /** A past paper's exam session; null for a teacher paper. */
  year: number | null;
  /** A teacher paper's number within its subject (វិញ្ញាសារទី 3); null for a past paper. */
  number: number | null;
  /** The detail screen's line under the title. */
  subtitle: string;
  /** Where the detail screen's back link goes: the list this card sits in. */
  backTo: string;
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

/** A teacher paper's key: "new-math-3". The database allows 1 to 999. */
export function teacherPaperKey(id: SubjectId, n: number): string {
  return `new-${id}-${n}`;
}

/** The Mock Exam page's own place for one subject's teacher papers. */
export function teacherListHref(id: SubjectId): string {
  return `/exam/subjects?tab=generated&subject=${id}`;
}

/** A teacher paper's name in its subject's list, the user's wording (6 Nov 2026). */
export function teacherPaperTitle(n: number): string {
  return `វិញ្ញាសារទី ${n}`;
}

// Concatenated, not authored per subject: Khmer has no inter-word space, so
// "វិញ្ញាសារ" + "គណិតវិទ្យា" reads correctly as one term, and a derived title
// cannot drift from the catalog. Shared by both papersForYear() and
// teacherSubjects() so the two tabs render identical wording — "same style" was
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

export interface PaperKeyParts {
  subject: SubjectMeta;
  /** Set for a past paper. */
  year: number | null;
  /** Set for a teacher paper. */
  number: number | null;
}

/** "2025-math" or "new-math-3" back into its parts, or null for anything else. */
export function parsePaperKey(key: string): PaperKeyParts | null {
  const past = /^(20\d{2})-([a-z]+)$/.exec(key);
  if (past) {
    const subject = findSubject(past[2]);
    return subject ? { subject, year: Number(past[1]), number: null } : null;
  }
  const teacher = /^new-([a-z]+)-([1-9]\d{0,2})$/.exec(key);
  if (teacher) {
    const subject = findSubject(teacher[1]);
    return subject ? { subject, year: null, number: Number(teacher[2]) } : null;
  }
  return null;
}

/** A paper's name where its subject is not on screen: the admin pages, a
 *  mistake report. "វិញ្ញាសារគណិតវិទ្យា 2025", "វិញ្ញាសារគណិតវិទ្យា ទី 3". */
export function paperFullName(parts: PaperKeyParts): string {
  return parts.year !== null
    ? `${paperTitle(parts.subject)} ${parts.year}`
    : `${paperTitle(parts.subject)} ទី ${parts.number}`;
}

/** The card fields both kinds of paper derive from their key. */
function paperFields(parts: PaperKeyParts) {
  const { subject } = parts;
  if (parts.year !== null) {
    return {
      year: parts.year,
      number: null,
      title: paperTitle(subject),
      subtitle: `សម័យប្រឡង ${parts.year}`,
      backTo: "/exam/subjects",
    };
  }
  const n = parts.number ?? 0;
  return {
    year: null,
    number: n,
    title: teacherPaperTitle(n),
    subtitle: `${subject.name} · ${EXAM_TABS[1].label}`,
    backTo: teacherListHref(subject.id),
  };
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
    subject: parsed.subject,
    ...paperFields(parsed),
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
      subject,
      ...paperFields({ subject, year, number: null }),
      blurb: paperBlurb(subject),
      count: entry?.count ?? 0,
      version: entry?.version ?? null,
    };
  });
}

/**
 * Tab B, level one: one card per subject, in Tab A's card style with no year
 * chips (the user asked for that style minus the year row). `count` is how many
 * teacher papers the subject has, so a subject with none shows ឆាប់ៗនេះ, and
 * the list downloads no paper. Derived from the subject catalog for the same
 * reason papersForYear() is.
 *
 * Tab B was one code-authored question list per subject until 6 Nov 2026, never
 * filled; the user then asked for many whole papers per subject, written by
 * teachers in the Bac II format (docs/notes/exams.md).
 */
export function teacherSubjects(
  userLanguage: string | undefined,
  manifest: ContentManifest
): ExamPaper[] {
  return allSubjects(userLanguage).map((subject) => ({
    key: `new-${subject.id}`,
    subject,
    title: paperTitle(subject),
    blurb: paperBlurb(subject),
    count: teacherPapersFor(subject.id, manifest).length,
  }));
}

/**
 * Tab B, level two: one subject's published teacher papers, by number. A gap in
 * the numbers (paper 4 hidden, or never written) is simply not listed: a paper
 * keeps its number for good, because a student's history is filed under its key.
 */
export function teacherPapersFor(subjectId: SubjectId, manifest: ContentManifest): PastPaper[] {
  return Object.keys(manifest.paper)
    .filter((key) => key.startsWith(`new-${subjectId}-`))
    .map((key) => pastPaperCard(key, manifest))
    .filter((p): p is PastPaper => p !== null && p.subject.id === subjectId)
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

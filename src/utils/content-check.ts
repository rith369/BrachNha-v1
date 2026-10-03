import katex from "katex";
import { splitMath } from "./math-render";
import type {
  ContentKind,
  DeckCardBody,
  DrillQuestion,
  QuizQuestionBody,
} from "@/types";

/**
 * The checks every flashcard deck and practice quiz must pass before students
 * see it, now that they are stored in the database rather than in code
 * (docs/plans/content-in-database.md).
 *
 * ONE SET OF RULES, used in three places:
 *   - the editor on /admin/content, live, as the team types (errors block
 *     Publish, warnings do not);
 *   - scripts/check-content.mjs, on an import file and on what is published;
 *   - scripts/content-export.mjs, on the content leaving the code.
 *
 * They are the rules check:quiz and check:digits enforced while this content
 * lived in src/: every `$…$` typeset for real with KaTeX, no Khmer inside a
 * formula, no stray `$`, `correct` one of the options, no two options alike,
 * no Khmer numerals, no em dashes. Neither script can see the database, so
 * these now run wherever the content is written. The database itself checks
 * only the shape (supabase/migrations/20261003000001).
 *
 * THE METHOD IS THE APP'S OWN PATH: the real splitMath, then the real
 * katex.renderToString with throwOnError. Eyeballing is not enough; broken
 * TeX renders in red without throwing (see AGENTS.md, the LaTeX section).
 *
 * Pure: no store, no network. Lengths mirror the SQL's limits.
 */

export type IssueCode =
  | "empty"
  | "tooLong"
  | "math"
  | "khmerInMath"
  | "strayDollar"
  | "khmerDigits"
  | "emDash"
  | "tooFewOptions"
  | "tooManyOptions"
  | "sameOptions"
  | "correctMissing"
  | "badId"
  | "duplicateId"
  | "emptyList"
  | "letterOrder"
  | "answersBunched";

export interface ContentIssue {
  level: "error" | "warning";
  code: IssueCode;
  /** Which card or question, 0-based; -1 for the whole list. */
  item: number;
  /** Which field, as a path the editor can name: "front", "options.2",
   *  "help.questions.1.prompt". "" for the item as a whole. */
  field: string;
  /** The KaTeX message, or the start of the text that is wrong. */
  detail?: string;
}

/** Khmer, U+1780 to U+17FF. Inside a formula it renders as empty boxes. */
const KHMER = /[\u1780-\u17FF]/;
/** Khmer numerals. Every number the app shows is in Latin digits (AGENTS.md). */
const KHMER_DIGIT = /[\u17E0-\u17E9]/;
const EM_DASH = "\u2014";

export const LIMITS = {
  front: 2000,
  back: 4000,
  q: 4000,
  scenario: 4000,
  option: 1000,
  explanation: 8000,
  label: 300,
  note: 2000,
  mistake: 2000,
  items: 300,
  options: { min: 2, max: 6 },
  drills: 10,
  notes: 20,
} as const;

export const DECK_ID = /^[a-z0-9-]{1,80}$/;
export const QUIZ_ID = /^q[0-9]{1,4}$/;

/**
 * KaTeX answers, remembered per formula. The editor re-checks the whole quiz
 * on every keystroke, and a maths quiz with its exercises holds a few hundred
 * formulas; almost none change between two keystrokes. Bounded so a long
 * editing session cannot grow it without end.
 */
const katexCache = new Map<string, string | null>();
const KATEX_CACHE_MAX = 4000;

function katexError(tex: string, display: boolean): string | null {
  const cacheKey = (display ? "D" : "I") + tex;
  const cached = katexCache.get(cacheKey);
  if (cached !== undefined) return cached;
  let result: string | null = null;
  try {
    katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: "ignore",
      trust: false,
      output: "html",
    });
  } catch (err) {
    result = err instanceof Error ? err.message : String(err);
  }
  if (katexCache.size >= KATEX_CACHE_MAX) katexCache.clear();
  katexCache.set(cacheKey, result);
  return result;
}

function snippet(text: string): string {
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

/** Everything that can be wrong inside one string a student reads. */
function checkText(
  issues: ContentIssue[],
  item: number,
  field: string,
  text: unknown,
  max: number,
  required: boolean
): void {
  if (typeof text !== "string" || text.trim() === "") {
    if (required) issues.push({ level: "error", code: "empty", item, field });
    return;
  }
  if (text.length > max) {
    issues.push({ level: "error", code: "tooLong", item, field, detail: `${text.length} / ${max}` });
  }
  if (KHMER_DIGIT.test(text)) {
    issues.push({ level: "error", code: "khmerDigits", item, field, detail: snippet(text) });
  }
  if (text.includes(EM_DASH)) {
    issues.push({ level: "error", code: "emDash", item, field, detail: snippet(text) });
  }
  if (!text.includes("$")) return;

  for (const segment of splitMath(text)) {
    if (segment.type === "text") {
      // "$20" is money, not a broken formula; see scripts/check-quiz.mjs.
      const dollars = (segment.value.match(/\$/g) ?? []).length;
      const prices = (segment.value.match(/\$\d/g) ?? []).length;
      if (dollars > prices) {
        issues.push({ level: "error", code: "strayDollar", item, field, detail: snippet(segment.value) });
      }
      continue;
    }
    if (KHMER.test(segment.value)) {
      issues.push({ level: "error", code: "khmerInMath", item, field, detail: snippet(segment.value) });
      continue;
    }
    const error = katexError(segment.value, segment.display);
    if (error) {
      issues.push({ level: "error", code: "math", item, field, detail: `${snippet(segment.value)}: ${error}` });
    }
  }
}

const LETTERS = ["ក.", "ខ.", "គ.", "ឃ.", "ង.", "ច."];

/** A multiple-choice item: a quiz question or one of its exercises. */
function checkChoices(
  issues: ContentIssue[],
  item: number,
  prefix: string,
  options: unknown,
  correct: unknown
): void {
  const list = Array.isArray(options) ? options : [];
  if (list.length < LIMITS.options.min) {
    issues.push({ level: "error", code: "tooFewOptions", item, field: `${prefix}options` });
  }
  if (list.length > LIMITS.options.max) {
    issues.push({ level: "error", code: "tooManyOptions", item, field: `${prefix}options` });
  }
  list.forEach((opt, i) => {
    // "ក. " with nothing after it is an option nobody finished writing.
    if (typeof opt === "string" && LETTERS.includes(opt.trim())) {
      issues.push({ level: "error", code: "empty", item, field: `${prefix}options.${i}` });
      return;
    }
    checkText(issues, item, `${prefix}options.${i}`, opt, LIMITS.option, true);
  });
  if (new Set(list).size !== list.length) {
    issues.push({ level: "error", code: "sameOptions", item, field: `${prefix}options` });
  }
  if (typeof correct !== "string" || !list.includes(correct)) {
    issues.push({ level: "error", code: "correctMissing", item, field: `${prefix}correct` });
  }
  // ក. ខ. គ. ឃ. must sit at index 0, 1, 2, 3 (AGENTS.md): a list whose
  // letters are out of order tells a student the wrong letter for an answer.
  const lettered = list.some((o) => typeof o === "string" && LETTERS.some((l) => o.startsWith(l)));
  if (lettered && list.some((o, i) => typeof o !== "string" || !o.startsWith(LETTERS[i] ?? "?"))) {
    issues.push({ level: "warning", code: "letterOrder", item, field: `${prefix}options` });
  }
}

function checkDrill(
  issues: ContentIssue[],
  item: number,
  prefix: string,
  drill: DrillQuestion
): void {
  checkText(issues, item, `${prefix}prompt`, drill.prompt, LIMITS.q, true);
  checkChoices(issues, item, prefix, drill.options, drill.correct);
  checkText(issues, item, `${prefix}explanation`, drill.explanation, LIMITS.explanation, true);
}

function checkIds(
  issues: ContentIssue[],
  ids: unknown[],
  pattern: RegExp
): void {
  const seen = new Set<string>();
  ids.forEach((id, i) => {
    if (typeof id !== "string" || !pattern.test(id)) {
      issues.push({ level: "error", code: "badId", item: i, field: "id", detail: String(id) });
      return;
    }
    if (seen.has(id)) {
      issues.push({ level: "error", code: "duplicateId", item: i, field: "id", detail: id });
    }
    seen.add(id);
  });
}

export function checkDeck(cards: DeckCardBody[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (cards.length === 0) {
    issues.push({ level: "error", code: "emptyList", item: -1, field: "" });
  }
  if (cards.length > LIMITS.items) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "", detail: `${cards.length} / ${LIMITS.items}` });
  }
  checkIds(issues, cards.map((c) => c.id), DECK_ID);
  cards.forEach((card, i) => {
    checkText(issues, i, "front", card.front, LIMITS.front, true);
    checkText(issues, i, "back", card.back, LIMITS.back, true);
  });
  return issues;
}

export function checkQuiz(questions: QuizQuestionBody[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (questions.length === 0) {
    issues.push({ level: "error", code: "emptyList", item: -1, field: "" });
  }
  if (questions.length > LIMITS.items) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "", detail: `${questions.length} / ${LIMITS.items}` });
  }
  checkIds(issues, questions.map((q) => q.id), QUIZ_ID);

  questions.forEach((question, i) => {
    checkText(issues, i, "scenario", question.scenario, LIMITS.scenario, false);
    checkText(issues, i, "q", question.q, LIMITS.q, true);
    checkChoices(issues, i, "", question.options, question.correct);
    checkText(issues, i, "explanation", question.explanation, LIMITS.explanation, true);

    const help = question.help;
    if (!help) return;
    checkText(issues, i, "help.label", help.label, LIMITS.label, true);
    if ((help.note ?? []).length > LIMITS.notes) {
      issues.push({ level: "error", code: "tooLong", item: i, field: "help.note" });
    }
    (help.note ?? []).forEach((line, li) =>
      checkText(issues, i, `help.note.${li}`, line, LIMITS.note, true)
    );
    checkText(issues, i, "help.mistake", help.mistake, LIMITS.mistake, false);
    for (const group of ["questions", "foundation"] as const) {
      const drills = help[group] ?? [];
      if (drills.length > LIMITS.drills) {
        issues.push({ level: "error", code: "tooLong", item: i, field: `help.${group}` });
      }
      drills.forEach((drill, di) => checkDrill(issues, i, `help.${group}.${di}.`, drill));
    }
  });

  // Correct answers bunched on one letter teach students to guess it
  // (AGENTS.md: spread them across ក, ខ, គ, ឃ). A nudge, not a block.
  if (questions.length >= 4) {
    const counts = new Map<number, number>();
    for (const q of questions) {
      const at = Array.isArray(q.options) ? q.options.indexOf(q.correct) : -1;
      if (at >= 0) counts.set(at, (counts.get(at) ?? 0) + 1);
    }
    const most = Math.max(0, ...counts.values());
    if (most > Math.max(2, Math.round(questions.length * 0.4))) {
      issues.push({
        level: "warning",
        code: "answersBunched",
        item: -1,
        field: "",
        detail: `${most} / ${questions.length}`,
      });
    }
  }
  return issues;
}

export function checkContent(kind: ContentKind, body: unknown[]): ContentIssue[] {
  return kind === "deck"
    ? checkDeck(body as DeckCardBody[])
    : checkQuiz(body as QuizQuestionBody[]);
}

/** English wording for the scripts (the editor has its own, in both languages). */
export function describeIssue(issue: ContentIssue): string {
  const what: Record<IssueCode, string> = {
    empty: "is empty",
    tooLong: "is too long",
    math: "has maths KaTeX cannot typeset",
    khmerInMath: "has Khmer inside $…$ (renders as empty boxes)",
    strayDollar: "has a $ that is not closed, padded, or split across a line",
    khmerDigits: "has Khmer numerals (use 0-9)",
    emDash: "has an em dash (use a comma or a full stop)",
    tooFewOptions: "needs at least 2 options",
    tooManyOptions: "has more than 6 options",
    sameOptions: "has two options spelled the same",
    correctMissing: "has a correct answer that is not one of the options",
    badId: "has a bad id",
    duplicateId: "uses an id twice",
    emptyList: "is an empty list",
    letterOrder: "has ក. ខ. គ. ឃ. out of order",
    answersBunched: "has most correct answers on the same letter",
  };
  const where = issue.item < 0 ? "the list" : `item ${issue.item + 1}${issue.field ? ` ${issue.field}` : ""}`;
  return `${issue.level}: ${where} ${what[issue.code]}${issue.detail ? ` (${issue.detail})` : ""}`;
}

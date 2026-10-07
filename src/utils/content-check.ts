import katex from "katex";
import { splitMath } from "./math-render";
import { sanitizeSvg } from "./sanitize-svg";
import type {
  ContentKind,
  DeckCardBody,
  DrillQuestion,
  GameQuestionBody,
  PaperBody,
  PaperGapBody,
  PaperQuestionBody,
  PaperSectionBody,
  QuizQuestionBody,
  SectionBlock,
  SectionBody,
  SkillHelp,
} from "@/types";

/**
 * The checks every piece of content stored in the database must pass before
 * students see it: flashcard decks and practice quizzes
 * (docs/plans/content-in-database.md), lesson sections and past papers
 * (docs/plans/sections-and-papers-in-database.md), and the Battle question
 * pools.
 *
 * ONE SET OF RULES, used in three places:
 *   - the editor on /admin/content, live, as the team types (errors block
 *     Publish, warnings do not);
 *   - scripts/check-content.mjs, on an import file and on what is published;
 *   - scripts/content-export.mjs, on the content leaving the code.
 *
 * They are the rules check:quiz (deleted on 7 Oct 2026, once nothing was left
 * for it to check) and check:digits enforced while this content
 * lived in src/: every `$…$` typeset for real with KaTeX, no Khmer inside a
 * formula, no stray `$`, `correct` one of the options, no two options alike,
 * no Khmer numerals, no em dashes. Neither script can see the database, so
 * these now run wherever the content is written. The database itself checks
 * only the shape (supabase/migrations/20261003000001 and 20261003000002).
 *
 * THE METHOD IS THE APP'S OWN PATH: the real splitMath, then the real
 * katex.renderToString with throwOnError. Eyeballing is not enough; broken
 * TeX renders in red without throwing (see AGENTS.md, the LaTeX section).
 *
 * WHERE A PROBLEM IS: a deck or quiz is a list, so an issue names its card or
 * question by `item` and the field inside it. A section or paper is one
 * object, so `item` is -1 and `field` is the whole path ("lesson.items.2.body",
 * "quizHarder.3.options.1", "sections.2.gapFill.gaps.4.correct").
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
  | "answersBunched"
  | "badNumber"
  | "badPoster"
  | "badModel"
  | "badVideoId"
  | "svgChanged"
  | "partShape"
  | "notInBank"
  | "gapMissing"
  | "duplicateGap"
  | "sameWords"
  | "unknownSkill"
  | "badDifficulty";

export interface ContentIssue {
  level: "error" | "warning";
  code: IssueCode;
  /** Which card or question, 0-based; -1 for the whole list, and always -1
   *  for a section or paper (one object, located by `field` alone). */
  item: number;
  /** Which field, as a path the editor can name: "front", "options.2",
   *  "help.questions.1.prompt", "lesson.items.0.body". "" for the whole. */
  field: string;
  /** The KaTeX message, or the start of the text that is wrong. */
  detail?: string;
}

/** Khmer, U+1780 to U+17FF. Inside a formula it renders as empty boxes. */
const KHMER = /[ក-៿]/;
/** Khmer numerals. Every number the app shows is in Latin digits (AGENTS.md). */
const KHMER_DIGIT = /[\u17E0-\u17E9]/;
const EM_DASH = "—";

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
  // Sections.
  title: 300,
  blockText: 4000,
  itemLabel: 300,
  itemBody: 4000,
  subPoint: 2000,
  blockItems: 60,
  subPoints: 30,
  misconception: 2000,
  mistakes: 30,
  credit: 500,
  sectionQuestions: 100,
  duration: 36000,
  // Papers.
  minutes: 600,
  points: 1000,
  paperNote: 1000,
  parts: 20,
  partTitle: 200,
  instruction: 2000,
  statement: 20000,
  example: 2000,
  partQuestions: 60,
  passage: 20000,
  word: 100,
  words: 40,
  gaps: 60,
  gapNumber: 99,
  minWords: 2000,
  essay: 4000,
  essayParagraphs: 20,
  checklistItem: 500,
  checklist: 20,
  skills: 50,
} as const;

export const DECK_ID = /^[a-z0-9-]{1,80}$/;
export const QUIZ_ID = /^q[0-9]{1,4}$/;
/** A paper's question or gap id: "g1", "v3", "r7", "l1". */
export const PAPER_ITEM_ID = /^[a-z][a-z0-9-]{0,19}$/;
/** A paper part's id ("reading", "limits") or a skill's id ("quantifiers"). */
export const PART_ID = /^[a-z0-9-]{1,40}$/;
/** A section's poster: a file the app ships under public/sections/. */
export const SECTION_POSTER = /^\/sections\/[a-z0-9-]{1,80}\.webp$/;
/** A section's 3D model: a file the app ships under public/models/. */
export const MODEL_SRC = /^\/models\/[a-z0-9-]{1,80}\.glb$/;
/** The 11-character YouTube id, never a URL (see SectionVideo in types/). */
export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** A section's four blocks, in the order a student reads them. */
export const SECTION_BLOCKS = ["intro", "examples", "lesson", "notes"] as const;
export type SectionBlockKey = (typeof SECTION_BLOCKS)[number];

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

/**
 * A drawing inside a string (the maths paper draws its graphs as `<svg>`) must
 * come through utils/sanitize-svg.ts untouched: anything the sanitiser strips
 * was never meant to be there, and the student would see a drawing with parts
 * missing. Needs a browser's DOMParser, so it runs in the editor and is
 * skipped by the Node scripts, which cannot parse SVG.
 */
function checkSvg(issues: ContentIssue[], item: number, field: string, text: string): void {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") return;
  for (const part of text.match(/<svg[\s\S]*?<\/svg>/g) ?? []) {
    const doc = new DOMParser().parseFromString(part, "image/svg+xml");
    const root = doc.documentElement;
    const parsed =
      root.localName === "svg" && doc.getElementsByTagName("parsererror").length === 0;
    const cleaned = sanitizeSvg(part);
    if (!parsed || !cleaned || cleaned !== new XMLSerializer().serializeToString(root)) {
      issues.push({ level: "error", code: "svgChanged", item, field, detail: snippet(part) });
    }
  }
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
  if (text.includes("<svg")) checkSvg(issues, item, field, text);
  if (!text.includes("$")) return;

  for (const segment of splitMath(text)) {
    if (segment.type === "text") {
      // "$20" is money, not a broken formula: the English paper says "The
      // room costs $20", and a plain string cannot escape a dollar.
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

/** A whole number within [min, max]; absent is fine unless `required`. */
function checkInt(
  issues: ContentIssue[],
  item: number,
  field: string,
  value: unknown,
  min: number,
  max: number,
  required: boolean
): void {
  if (value === undefined || value === null) {
    if (required) issues.push({ level: "error", code: "badNumber", item, field });
    return;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    issues.push({ level: "error", code: "badNumber", item, field, detail: `${min} – ${max}` });
  }
}

const LETTERS = ["ក.", "ខ.", "គ.", "ឃ.", "ង.", "ច."];

/** A multiple-choice item: a quiz question, a paper question, or an exercise. */
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

/** The help under an answer: its title, rule lines, mistake and exercises.
 *  `prefix` ends with a dot: "help." on a question, "skills.quantifiers." on
 *  a paper. */
function checkHelp(
  issues: ContentIssue[],
  item: number,
  prefix: string,
  help: SkillHelp
): void {
  checkText(issues, item, `${prefix}label`, help.label, LIMITS.label, true);
  const notes = Array.isArray(help.note) ? help.note : [];
  if (notes.length > LIMITS.notes) {
    issues.push({ level: "error", code: "tooLong", item, field: `${prefix}note` });
  }
  notes.forEach((line, li) => checkText(issues, item, `${prefix}note.${li}`, line, LIMITS.note, true));
  checkText(issues, item, `${prefix}mistake`, help.mistake, LIMITS.mistake, false);
  for (const group of ["questions", "foundation"] as const) {
    const drills = Array.isArray(help[group]) ? (help[group] as DrillQuestion[]) : [];
    if (drills.length > LIMITS.drills) {
      issues.push({ level: "error", code: "tooLong", item, field: `${prefix}${group}` });
    }
    drills.forEach((drill, di) => checkDrill(issues, item, `${prefix}${group}.${di}.`, drill));
  }
}

/** One quiz question, a practice quiz's or a section's. */
function checkQuestion(
  issues: ContentIssue[],
  item: number,
  prefix: string,
  question: QuizQuestionBody
): void {
  checkText(issues, item, `${prefix}scenario`, question.scenario, LIMITS.scenario, false);
  checkText(issues, item, `${prefix}q`, question.q, LIMITS.q, true);
  checkChoices(issues, item, prefix, question.options, question.correct);
  checkText(issues, item, `${prefix}explanation`, question.explanation, LIMITS.explanation, true);
  if (question.help) checkHelp(issues, item, `${prefix}help.`, question.help);
}

/** Ids: the right shape, and each used once. `at(i)` locates the i-th. */
function checkIds(
  issues: ContentIssue[],
  ids: unknown[],
  pattern: RegExp,
  at: (i: number) => { item: number; field: string } = (i) => ({ item: i, field: "id" }),
  seen: Set<string> = new Set()
): void {
  ids.forEach((id, i) => {
    const where = at(i);
    if (typeof id !== "string" || !pattern.test(id)) {
      issues.push({ level: "error", code: "badId", ...where, detail: String(id) });
      return;
    }
    if (seen.has(id)) {
      issues.push({ level: "error", code: "duplicateId", ...where, detail: id });
    }
    seen.add(id);
  });
}

/**
 * Correct answers bunched on one position teach students to guess it
 * (AGENTS.md: spread them across ក, ខ, គ, ឃ). A nudge, not a block. Checked
 * per LIST, because splitting a balanced set can leave one half bunched.
 */
function checkBunched(
  issues: ContentIssue[],
  questions: { options: unknown; correct: unknown }[],
  field: string
): void {
  if (questions.length < 4) return;
  const counts = new Map<number, number>();
  for (const q of questions) {
    const at = Array.isArray(q.options) ? q.options.indexOf(q.correct) : -1;
    if (at >= 0) counts.set(at, (counts.get(at) ?? 0) + 1);
  }
  const most = Math.max(0, ...counts.values());
  if (most > Math.max(2, Math.round(questions.length * 0.4))) {
    issues.push({ level: "warning", code: "answersBunched", item: -1, field, detail: `${most} / ${questions.length}` });
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const listOf = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

// ── Decks and quizzes ─────────────────────────────────────────────────────

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
  questions.forEach((question, i) => checkQuestion(issues, i, "", question));
  checkBunched(issues, questions, "");
  return issues;
}

// ── Sections ──────────────────────────────────────────────────────────────

function checkBlock(issues: ContentIssue[], key: SectionBlockKey, block: SectionBlock | undefined): number {
  if (!isObj(block)) {
    issues.push({ level: "error", code: "empty", item: -1, field: key });
    return 0;
  }
  checkText(issues, -1, `${key}.intro`, block.intro, LIMITS.blockText, false);
  checkText(issues, -1, `${key}.outro`, block.outro, LIMITS.blockText, false);
  const items = listOf<SectionBlock["items"][number]>(block.items);
  if (items.length > LIMITS.blockItems) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: `${key}.items`, detail: `${items.length} / ${LIMITS.blockItems}` });
  }
  items.forEach((it, i) => {
    const at = `${key}.items.${i}`;
    const subs = listOf<string>(it?.items);
    checkText(issues, -1, `${at}.label`, it?.label, LIMITS.itemLabel, false);
    // A point needs something to say: a body, or at least a label with
    // sub-points under it.
    checkText(issues, -1, `${at}.body`, it?.body, LIMITS.itemBody, !(it?.label && subs.length > 0));
    if (subs.length > LIMITS.subPoints) {
      issues.push({ level: "error", code: "tooLong", item: -1, field: `${at}.items` });
    }
    subs.forEach((s, j) => checkText(issues, -1, `${at}.items.${j}`, s, LIMITS.subPoint, true));
  });
  return items.length;
}

export function checkSection(body: SectionBody): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (!isObj(body)) return [{ level: "error", code: "emptyList", item: -1, field: "" }];

  checkText(issues, -1, "title", body.title, LIMITS.title, true);

  if (body.video !== undefined) {
    if (!isObj(body.video)) {
      issues.push({ level: "error", code: "badPoster", item: -1, field: "video.poster" });
    } else {
      if (typeof body.video.poster !== "string" || !SECTION_POSTER.test(body.video.poster)) {
        issues.push({ level: "error", code: "badPoster", item: -1, field: "video.poster", detail: String(body.video.poster ?? "") });
      }
      checkInt(issues, -1, "video.durationSec", body.video.durationSec, 1, LIMITS.duration, false);
      if (body.video.youtubeId !== undefined && (typeof body.video.youtubeId !== "string" || !YOUTUBE_ID.test(body.video.youtubeId))) {
        issues.push({ level: "error", code: "badVideoId", item: -1, field: "video.youtubeId", detail: String(body.video.youtubeId) });
      }
    }
  }

  if (body.model3d !== undefined) {
    if (!isObj(body.model3d) || typeof body.model3d.src !== "string" || !MODEL_SRC.test(body.model3d.src)) {
      issues.push({ level: "error", code: "badModel", item: -1, field: "model3d.src" });
    }
    checkText(issues, -1, "model3d.credit", body.model3d?.credit, LIMITS.credit, true);
    checkText(issues, -1, "model3d.title", body.model3d?.title, LIMITS.itemLabel, false);
  }

  let points = 0;
  for (const key of SECTION_BLOCKS) points += checkBlock(issues, key, body[key]);
  if (points === 0) issues.push({ level: "error", code: "emptyList", item: -1, field: "" });

  const mistakes = listOf<{ wrong?: string; right?: string }>(body.mistakes);
  if (mistakes.length > LIMITS.mistakes) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "mistakes" });
  }
  mistakes.forEach((m, i) => {
    checkText(issues, -1, `mistakes.${i}.wrong`, m?.wrong, LIMITS.misconception, true);
    checkText(issues, -1, `mistakes.${i}.right`, m?.right, LIMITS.misconception, true);
  });

  // Question ids are unique across BOTH lists: a report names one by id.
  const seen = new Set<string>();
  for (const list of ["quiz", "quizHarder"] as const) {
    const questions = listOf<QuizQuestionBody>(body[list]);
    if (questions.length > LIMITS.sectionQuestions) {
      issues.push({ level: "error", code: "tooLong", item: -1, field: list });
    }
    checkIds(
      issues,
      questions.map((q) => q?.id),
      QUIZ_ID,
      (i) => ({ item: -1, field: `${list}.${i}.id` }),
      seen
    );
    questions.forEach((q, i) => checkQuestion(issues, -1, `${list}.${i}.`, q));
    checkBunched(issues, questions, list);
  }
  return issues;
}

// ── Past papers ───────────────────────────────────────────────────────────

export function checkPaper(body: PaperBody): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (!isObj(body)) return [{ level: "error", code: "emptyList", item: -1, field: "" }];

  checkInt(issues, -1, "minutes", body.minutes, 1, LIMITS.minutes, true);
  checkInt(issues, -1, "points", body.points, 1, LIMITS.points, false);
  checkText(issues, -1, "note", body.note, LIMITS.paperNote, false);

  const skills = isObj(body.skills) ? body.skills : {};
  const skillIds = Object.keys(skills);
  if (skillIds.length > LIMITS.skills) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "skills" });
  }
  for (const id of skillIds) {
    if (!PART_ID.test(id)) issues.push({ level: "error", code: "badId", item: -1, field: `skills.${id}`, detail: id });
    if (isObj(skills[id])) checkHelp(issues, -1, `skills.${id}.`, skills[id]);
  }
  const knownSkill = (skill: unknown) =>
    skill === undefined || (typeof skill === "string" && Object.hasOwn(skills, skill));

  const parts = listOf<PaperSectionBody>(body.sections);
  if (parts.length > LIMITS.parts) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "sections" });
  }
  checkIds(issues, parts.map((p) => p?.id), PART_ID, (i) => ({ item: -1, field: `sections.${i}.id` }));

  // Question and gap ids are unique across the whole paper: a student's
  // answers are kept under them.
  const itemIds = new Set<string>();
  let scored = 0;

  parts.forEach((part, pi) => {
    const at = `sections.${pi}`;
    checkText(issues, -1, `${at}.title`, part?.title, LIMITS.partTitle, true);
    checkText(issues, -1, `${at}.instruction`, part?.instruction, LIMITS.instruction, true);
    checkText(issues, -1, `${at}.statement`, part?.statement, LIMITS.statement, false);
    checkText(issues, -1, `${at}.example`, part?.example, LIMITS.example, false);

    const hasQuestions = Array.isArray(part?.questions);
    const hasGapFill = isObj(part?.gapFill);
    if (hasQuestions === hasGapFill) {
      issues.push({ level: "error", code: "partShape", item: -1, field: at });
    }

    if (hasQuestions) {
      const questions = listOf<PaperQuestionBody>(part.questions);
      if (questions.length === 0) issues.push({ level: "error", code: "emptyList", item: -1, field: `${at}.questions` });
      if (questions.length > LIMITS.partQuestions) {
        issues.push({ level: "error", code: "tooLong", item: -1, field: `${at}.questions` });
      }
      checkIds(
        issues,
        questions.map((q) => q?.id),
        PAPER_ITEM_ID,
        (i) => ({ item: -1, field: `${at}.questions.${i}.id` }),
        itemIds
      );
      questions.forEach((q, qi) => {
        const qp = `${at}.questions.${qi}.`;
        checkText(issues, -1, `${qp}q`, q?.q, LIMITS.q, true);
        checkChoices(issues, -1, qp, q?.options, q?.correct);
        checkText(issues, -1, `${qp}explanation`, q?.explanation, LIMITS.explanation, true);
        checkInt(issues, -1, `${qp}points`, q?.points, 0, LIMITS.points, false);
        if (!knownSkill(q?.skill)) {
          issues.push({ level: "error", code: "unknownSkill", item: -1, field: `${qp}skill`, detail: String(q?.skill) });
        }
      });
      scored += questions.length;
      checkBunched(issues, questions, `${at}.questions`);
    }

    if (hasGapFill) {
      const fill = part.gapFill!;
      const gp = `${at}.gapFill`;
      checkText(issues, -1, `${gp}.title`, fill.title, LIMITS.partTitle, true);
      checkText(issues, -1, `${gp}.body`, fill.body, LIMITS.passage, true);
      const bank = listOf<string>(fill.wordBank);
      if (bank.length < 2) issues.push({ level: "error", code: "tooFewOptions", item: -1, field: `${gp}.wordBank` });
      if (bank.length > LIMITS.words) issues.push({ level: "error", code: "tooLong", item: -1, field: `${gp}.wordBank` });
      bank.forEach((w, wi) => checkText(issues, -1, `${gp}.wordBank.${wi}`, w, LIMITS.word, true));
      if (new Set(bank).size !== bank.length) {
        issues.push({ level: "error", code: "sameWords", item: -1, field: `${gp}.wordBank` });
      }
      const gaps = listOf<PaperGapBody>(fill.gaps);
      if (gaps.length === 0) issues.push({ level: "error", code: "emptyList", item: -1, field: `${gp}.gaps` });
      if (gaps.length > LIMITS.gaps) issues.push({ level: "error", code: "tooLong", item: -1, field: `${gp}.gaps` });
      checkIds(
        issues,
        gaps.map((g) => g?.id),
        PAPER_ITEM_ID,
        (i) => ({ item: -1, field: `${gp}.gaps.${i}.id` }),
        itemIds
      );
      const numbers = new Set<number>();
      gaps.forEach((g, gi) => {
        const at2 = `${gp}.gaps.${gi}`;
        checkInt(issues, -1, `${at2}.number`, g?.number, 1, LIMITS.gapNumber, true);
        if (typeof g?.number === "number") {
          if (numbers.has(g.number)) {
            issues.push({ level: "error", code: "duplicateGap", item: -1, field: `${at2}.number`, detail: String(g.number) });
          }
          numbers.add(g.number);
          if (typeof fill.body === "string" && !fill.body.includes(`{${g.number}}`)) {
            issues.push({ level: "error", code: "gapMissing", item: -1, field: `${at2}.number`, detail: `{${g.number}}` });
          }
        }
        if (typeof g?.correct !== "string" || !bank.includes(g.correct)) {
          issues.push({ level: "error", code: "notInBank", item: -1, field: `${at2}.correct`, detail: String(g?.correct ?? "") });
        }
        if (!knownSkill(g?.skill)) {
          issues.push({ level: "error", code: "unknownSkill", item: -1, field: `${at2}.skill`, detail: String(g?.skill) });
        }
        checkText(issues, -1, `${at2}.explanation`, g?.explanation, LIMITS.explanation, true);
        if (!g?.example) scored += 1;
      });
    }
  });

  if (parts.length === 0 || scored === 0) {
    issues.push({ level: "error", code: "emptyList", item: -1, field: "sections" });
  }

  if (body.writing !== undefined) {
    const w = body.writing;
    if (!isObj(w)) {
      issues.push({ level: "error", code: "empty", item: -1, field: "writing" });
    } else {
      checkText(issues, -1, "writing.title", w.title, LIMITS.partTitle, true);
      checkText(issues, -1, "writing.prompt", w.prompt, LIMITS.instruction * 2, true);
      checkInt(issues, -1, "writing.minWords", w.minWords, 1, LIMITS.minWords, true);
      const essay = listOf<string>(w.modelEssay);
      if (essay.length === 0) issues.push({ level: "error", code: "empty", item: -1, field: "writing.modelEssay" });
      if (essay.length > LIMITS.essayParagraphs) issues.push({ level: "error", code: "tooLong", item: -1, field: "writing.modelEssay" });
      essay.forEach((p, i) => checkText(issues, -1, `writing.modelEssay.${i}`, p, LIMITS.essay, true));
      const list = listOf<string>(w.checklist);
      if (list.length > LIMITS.checklist) issues.push({ level: "error", code: "tooLong", item: -1, field: "writing.checklist" });
      list.forEach((p, i) => checkText(issues, -1, `writing.checklist.${i}`, p, LIMITS.checklistItem, true));
    }
  }
  return issues;
}

// ── Battle questions ──────────────────────────────────────────────────────

/** The difficulties a Battle question may carry ("mix" is a creator's choice,
 *  never a question's). */
export const GAME_DIFFICULTIES = ["easy", "medium", "hard"] as const;

/** One subject's pool of Battle questions: one text per question, in the
 *  subject's language, with the quiz rules. */
export function checkGame(questions: GameQuestionBody[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (questions.length === 0) {
    issues.push({ level: "error", code: "emptyList", item: -1, field: "" });
  }
  if (questions.length > LIMITS.items) {
    issues.push({ level: "error", code: "tooLong", item: -1, field: "", detail: `${questions.length} / ${LIMITS.items}` });
  }
  checkIds(issues, questions.map((q) => q.id), QUIZ_ID);
  questions.forEach((question, i) => {
    checkText(issues, i, "q", question.q, LIMITS.q, true);
    checkChoices(issues, i, "", question.options, question.correct);
    checkText(issues, i, "explanation", question.explanation, LIMITS.explanation, true);
    const d = question.difficulty as unknown;
    if (d !== undefined && d !== null && !(GAME_DIFFICULTIES as readonly unknown[]).includes(d)) {
      issues.push({ level: "error", code: "badDifficulty", item: i, field: "difficulty", detail: String(d) });
    }
  });
  checkBunched(issues, questions, "");
  return issues;
}

export function checkContent(kind: ContentKind, body: unknown): ContentIssue[] {
  switch (kind) {
    case "deck":
      return checkDeck(listOf<DeckCardBody>(body));
    case "quiz":
      return checkQuiz(listOf<QuizQuestionBody>(body));
    case "section":
      return checkSection(body as SectionBody);
    case "paper":
      return checkPaper(body as PaperBody);
    case "game":
      return checkGame(listOf<GameQuestionBody>(body));
  }
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
    emptyList: "is empty",
    letterOrder: "has ក. ខ. គ. ឃ. out of order",
    answersBunched: "has most correct answers on the same letter",
    badNumber: "is not a whole number in range",
    badPoster: "is not a poster the app ships (/sections/….webp)",
    badModel: "is not a model the app ships (/models/….glb)",
    badVideoId: "is not an 11-character YouTube id",
    svgChanged: "has a drawing the sanitiser would change",
    partShape: "needs either questions or a gap-fill, not both or neither",
    notInBank: "has an answer that is not in the word bank",
    gapMissing: "has a gap the passage never marks with {n}",
    duplicateGap: "uses a gap number twice",
    sameWords: "has two words in the bank spelled the same",
    unknownSkill: "names a skill the paper does not have",
    badDifficulty: "has a difficulty other than easy, medium or hard",
  };
  const where =
    issue.item < 0
      ? issue.field || "the whole"
      : `item ${issue.item + 1}${issue.field ? ` ${issue.field}` : ""}`;
  return `${issue.level}: ${where} ${what[issue.code]}${issue.detail ? ` (${issue.detail})` : ""}`;
}

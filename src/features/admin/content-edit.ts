import type { AnyBody } from "@/lib/admin-content";
import type {
  ContentKind,
  DeckCardBody,
  DrillQuestion,
  QuizQuestionBody,
  SkillHelp,
} from "@/types";

/**
 * Pure helpers for the content editor (components/content-editor-view.tsx).
 * In a .ts file because a non-component export from a .tsx trips oxlint's
 * only-export-components rule (the reason utils/focus-styles.ts exists).
 */

/**
 * The next free number for a new card or question.
 *
 * Counted over the working copy AND every id any published version ever used
 * (admin_content_get's used_ids). A student's review history is keyed by card
 * id, so an id that once belonged to a deleted card must never be handed to a
 * new one; it would arrive already "remembered".
 */
function nextNumber(ids: Iterable<string>, pattern: RegExp): number {
  let max = 0;
  for (const id of ids) {
    const m = pattern.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function newCardId(key: string, body: DeckCardBody[], usedIds: string[]): string {
  const pattern = new RegExp(`^${escapeRe(key)}-(\\d+)$`);
  return `${key}-${nextNumber([...body.map((c) => c.id), ...usedIds], pattern)}`;
}

export function newQuestionId(body: QuizQuestionBody[], usedIds: string[]): string {
  return `q${nextNumber([...body.map((q) => q.id), ...usedIds], /^q(\d+)$/)}`;
}

export const EMPTY_DRILL: DrillQuestion = {
  prompt: "",
  options: ["", "", "", ""],
  correct: "",
  explanation: "",
};

export function emptyQuestion(id: string): QuizQuestionBody {
  return {
    id,
    q: "",
    options: ["ក. ", "ខ. ", "គ. ", "ឃ. "],
    correct: "",
    explanation: "",
  };
}

export const EMPTY_HELP: SkillHelp = {
  label: "",
  note: [],
  mistake: "",
  questions: [],
  foundation: [],
};

/**
 * The body as it should be stored: optional fields that are empty are left
 * out rather than saved as "", and blank rule lines are dropped. The checks
 * and every save run on this, so an untouched optional field is never an
 * error.
 */
export function tidyBody(kind: ContentKind, body: AnyBody): AnyBody {
  if (kind === "deck") {
    return (body as DeckCardBody[]).map((c) => ({ id: c.id, front: c.front, back: c.back }));
  }
  return (body as QuizQuestionBody[]).map((q) => {
    const out: QuizQuestionBody = { id: q.id, q: q.q, options: q.options, correct: q.correct, explanation: q.explanation };
    if (q.scenario?.trim()) out.scenario = q.scenario;
    if (q.help) {
      const help: SkillHelp = {
        label: q.help.label,
        note: q.help.note.filter((line) => line.trim() !== ""),
        questions: q.help.questions,
      };
      if (q.help.mistake?.trim()) help.mistake = q.help.mistake;
      if (q.help.foundation && q.help.foundation.length > 0) help.foundation = q.help.foundation;
      out.help = help;
    }
    // Field order matches the code this content came from, so a stored body
    // reads naturally if anyone opens it in the SQL editor.
    return q.scenario?.trim()
      ? { id: out.id, scenario: out.scenario, q: out.q, options: out.options, correct: out.correct, explanation: out.explanation, ...(out.help ? { help: out.help } : {}) }
      : out;
  });
}

/** Two bodies equal as stored, ignoring key order. */
export function sameBody(a: AnyBody, b: AnyBody): boolean {
  return canon(a) === canon(b);
}

function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

/** Move one item up or down a list, returning a new list. */
export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const to = index + delta;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

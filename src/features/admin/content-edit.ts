import type { AnyBody } from "@/lib/admin-content";
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

/** A quiz question's or a Battle question's id: "q" and the next number. */
export function newQuestionId(body: readonly { id: string }[], usedIds: string[]): string {
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

/** A section question's next id: "q" numbers run across BOTH of a section's
 *  lists, since a mistake report names a question by id alone. */
export function newSectionQuestionId(body: SectionBody, usedIds: string[]): string {
  return newQuestionId([...(body.quiz ?? []), ...(body.quizHarder ?? [])], usedIds);
}

/** Every question and gap id in a paper; answers are kept under them. */
export function paperItemIds(body: PaperBody): string[] {
  return body.sections.flatMap((s) => [
    ...(s.questions ?? []).map((q) => q.id),
    ...(s.gapFill?.gaps ?? []).map((g) => g.id),
  ]);
}

/**
 * A new paper question or gap id. It takes the PART's own prefix (the
 * letters its first id starts with, "g" for g1…, "l" for l1…, or the part
 * id's first letter when it has none yet) and the next number no question or
 * gap has ever used, so a stored answer can never be read as a new question's.
 */
export function newPaperItemId(body: PaperBody, part: PaperSectionBody, usedIds: string[]): string {
  const first = part.questions?.[0]?.id ?? part.gapFill?.gaps[0]?.id ?? "";
  const prefix = /^[a-z]+/.exec(first)?.[0] ?? (/^[a-z]/.exec(part.id)?.[0] ?? "p");
  const pattern = new RegExp(`^${escapeRe(prefix)}(\\d+)$`);
  return `${prefix}${nextNumber([...paperItemIds(body), ...usedIds], pattern)}`;
}

const EMPTY_BLOCK = (): SectionBlock => ({ items: [] });

/** A new Battle question: lettered options and no difficulty yet (an
 *  untagged question is offered under every difficulty). */
export function emptyGameQuestion(id: string): GameQuestionBody {
  return {
    id,
    q: { en: "", km: "" },
    options: ["ក. ", "ខ. ", "គ. ", "ឃ. "],
    correct: "",
    explanation: "",
  };
}

/** A new section starts with its title from the curriculum and empty blocks. */
export function emptySection(title: string): SectionBody {
  return {
    title,
    intro: EMPTY_BLOCK(),
    examples: EMPTY_BLOCK(),
    lesson: EMPTY_BLOCK(),
    notes: EMPTY_BLOCK(),
    mistakes: [],
  };
}

/** Papers arrive as files, never from New; this only stands in when a paper
 *  page is opened for a key with nothing stored. */
export function emptyPaper(): PaperBody {
  return { minutes: 60, sections: [] };
}

export function emptyBody(kind: ContentKind, title: string): AnyBody {
  if (kind === "section") return emptySection(title);
  if (kind === "paper") return emptyPaper();
  return [];
}

export function emptyPaperQuestion(id: string): PaperQuestionBody {
  return { id, q: "", options: ["", "", "", ""], correct: "", explanation: "" };
}

export function emptyGap(id: string, number: number): PaperGapBody {
  return { id, number, correct: "", explanation: "" };
}

const filled = (s: string | undefined): s is string => typeof s === "string" && s.trim() !== "";
const lines = (list: string[] | undefined) => (list ?? []).filter((l) => l.trim() !== "");

function tidyHelp(h: SkillHelp): SkillHelp {
  const help: SkillHelp = {
    label: h.label,
    note: lines(h.note),
    questions: h.questions,
  };
  if (filled(h.mistake)) help.mistake = h.mistake;
  if (h.foundation && h.foundation.length > 0) help.foundation = h.foundation;
  return help;
}

function tidyQuestion(q: QuizQuestionBody): QuizQuestionBody {
  // Field order matches the code this content came from, so a stored body
  // reads naturally if anyone opens it in the SQL editor.
  return {
    id: q.id,
    ...(filled(q.scenario) ? { scenario: q.scenario } : {}),
    q: q.q,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    ...(q.help ? { help: tidyHelp(q.help) } : {}),
  };
}

function tidyBlock(b: SectionBlock): SectionBlock {
  return {
    ...(filled(b.intro) ? { intro: b.intro } : {}),
    items: b.items.map((it) => {
      const subs = lines(it.items);
      return {
        ...(filled(it.label) ? { label: it.label } : {}),
        body: it.body,
        ...(subs.length ? { items: subs } : {}),
      };
    }),
    ...(filled(b.outro) ? { outro: b.outro } : {}),
  };
}

function tidySection(s: SectionBody): SectionBody {
  const out: SectionBody = {
    title: s.title,
    intro: tidyBlock(s.intro),
    examples: tidyBlock(s.examples),
    lesson: tidyBlock(s.lesson),
    notes: tidyBlock(s.notes),
    mistakes: s.mistakes.map((m) => ({ wrong: m.wrong, right: m.right })),
  };
  if (s.video) {
    out.video = {
      poster: s.video.poster,
      ...(typeof s.video.durationSec === "number" ? { durationSec: s.video.durationSec } : {}),
      ...(filled(s.video.youtubeId) ? { youtubeId: s.video.youtubeId.trim() } : {}),
    };
  }
  if (s.model3d) {
    out.model3d = {
      src: s.model3d.src,
      credit: s.model3d.credit,
      ...(filled(s.model3d.title) ? { title: s.model3d.title } : {}),
    };
  }
  if (s.quiz && s.quiz.length) out.quiz = s.quiz.map(tidyQuestion);
  if (s.quizHarder && s.quizHarder.length) out.quizHarder = s.quizHarder.map(tidyQuestion);
  return out;
}

function tidyPaper(p: PaperBody): PaperBody {
  const out: PaperBody = {
    minutes: p.minutes,
    ...(typeof p.points === "number" ? { points: p.points } : {}),
    ...(filled(p.note) ? { note: p.note } : {}),
    sections: p.sections.map((s) => ({
      id: s.id,
      title: s.title,
      instruction: s.instruction,
      ...(filled(s.statement) ? { statement: s.statement } : {}),
      ...(filled(s.example) ? { example: s.example } : {}),
      ...(s.questions
        ? {
            questions: s.questions.map((q) => ({
              id: q.id,
              q: q.q,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
              ...(typeof q.points === "number" ? { points: q.points } : {}),
              ...(filled(q.skill) ? { skill: q.skill } : {}),
            })),
          }
        : {}),
      ...(s.gapFill
        ? {
            gapFill: {
              title: s.gapFill.title,
              body: s.gapFill.body,
              wordBank: s.gapFill.wordBank,
              gaps: s.gapFill.gaps.map((g) => ({
                id: g.id,
                number: g.number,
                correct: g.correct,
                ...(g.example ? { example: true } : {}),
                ...(filled(g.skill) ? { skill: g.skill } : {}),
                explanation: g.explanation,
              })),
            },
          }
        : {}),
    })),
  };
  if (p.writing) {
    out.writing = {
      title: p.writing.title,
      prompt: p.writing.prompt,
      minWords: p.writing.minWords,
      modelEssay: lines(p.writing.modelEssay),
      checklist: lines(p.writing.checklist),
    };
  }
  const skills = Object.entries(p.skills ?? {});
  if (skills.length) {
    out.skills = Object.fromEntries(skills.map(([id, h]) => [id, tidyHelp(h)]));
  }
  return out;
}

/**
 * The body as it should be stored: optional fields that are empty are left
 * out rather than saved as "", and blank rule lines are dropped. The checks
 * and every save run on this, so an untouched optional field is never an
 * error.
 */
export function tidyBody(kind: ContentKind, body: AnyBody): AnyBody {
  switch (kind) {
    case "deck":
      return (body as DeckCardBody[]).map((c) => ({ id: c.id, front: c.front, back: c.back }));
    case "quiz":
      return (body as QuizQuestionBody[]).map(tidyQuestion);
    case "section":
      return tidySection(body as SectionBody);
    case "paper":
      return tidyPaper(body as PaperBody);
    case "game":
      return (body as GameQuestionBody[]).map((g) => ({
        id: g.id,
        q: { en: g.q.en, km: g.q.km },
        options: g.options,
        correct: g.correct,
        ...(g.difficulty ? { difficulty: g.difficulty } : {}),
        explanation: g.explanation,
      }));
  }
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

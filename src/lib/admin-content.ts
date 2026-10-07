import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Json } from "@/types/database";
import type {
  ContentKind,
  DeckCardBody,
  DrillQuestion,
  PaperBody,
  PaperSectionBody,
  QuizQuestionBody,
  SectionBlock,
  SectionBody,
  SkillHelp,
} from "@/types";

/**
 * The content editor's calls (/admin/content), over
 * supabase/migrations/20261003000001_content_in_database.sql.
 *
 * NOTHING HERE IS THE SECURITY. Every function checks is_app_admin() in the
 * database, and publishing, unpublishing and importing check has_role('owner'),
 * so a student or an ordinary admin gets a refusal whatever this file sends.
 * The page only decides what to OFFER.
 *
 * Its own file rather than more of lib/admin-tools.ts: that one imports the
 * account-deletion code, which the editor has no use for.
 */

/** Why a content action did not happen. All but the first three are the
 *  database's own refusals, read from the `hint` each function raises with. */
export type ContentFail =
  | "unconfigured"
  | "denied"
  | "failed"
  | "owner_only"
  | "key"
  | "shape"
  | "stale"
  | "missing";

export type ContentResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ContentFail; detail?: string };

export interface ContentRow {
  kind: ContentKind;
  key: string;
  publishedVersion: number | null;
  publishedCount: number | null;
  publishedAt: string | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: string | null;
  draftCount: number | null;
}

/** A deck or quiz is a list; a section or paper is one object. */
export type AnyBody = DeckCardBody[] | QuizQuestionBody[] | SectionBody | PaperBody;

export interface ContentVersionInfo {
  version: number;
  publishedAt: string;
  publishedBy: string;
  itemCount: number;
}

export interface ContentDetail {
  published: {
    version: number;
    body: AnyBody;
    publishedAt: string;
    publishedBy: string;
  } | null;
  draft: {
    body: AnyBody;
    baseVersion: number | null;
    /** Sent back with the next save, publish or discard ("stale" otherwise). */
    updatedAt: string;
    updatedBy: string;
  } | null;
  /** Every id any published version ever used; new items must avoid them. */
  usedIds: string[];
  versions: ContentVersionInfo[];
}

export interface ImportOutcome {
  kind: ContentKind;
  key: string;
  outcome: "published" | "draft" | "skipped";
}

async function client() {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}

interface DbError {
  message?: string;
  code?: string;
  hint?: string;
}

function devReport(op: string, error: DbError | null): void {
  if (import.meta.env.DEV && error) {
    console.warn(`[admin-content] ${op} failed:`, error.message ?? error);
  }
}

const HINTS: readonly ContentFail[] = ["owner_only", "key", "shape", "stale", "missing"];

/** The hint first: "owner_only" also carries 42501 and must not read as "you
 *  are no longer an admin". A shape refusal keeps the database's own words
 *  (which item, what is wrong) as `detail`. */
function failure(error: DbError): { ok: false; reason: ContentFail; detail?: string } {
  const hint = error.hint as ContentFail | undefined;
  if (hint && HINTS.includes(hint)) {
    const detail = hint === "shape" ? error.message?.replace(/^[a-z_]+:\s*/, "") : undefined;
    return { ok: false, reason: hint, detail };
  }
  if (error.code === "42501") return { ok: false, reason: "denied" };
  return { ok: false, reason: "failed" };
}

// ── Reading a stored body ───────────────────────────────────────────────────
//
// A body comes back as jsonb. It was checked when it was published, but a
// draft only had its ids checked, so each field is read defensively: a
// missing string becomes "", a missing list becomes []. The editor then shows
// what is wrong rather than crashing on it.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map(str) : []);
const objs = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);

function toDrill(v: Obj): DrillQuestion {
  return {
    prompt: str(v.prompt),
    options: strs(v.options),
    correct: str(v.correct),
    explanation: str(v.explanation),
  };
}

function toHelp(v: unknown): SkillHelp | undefined {
  if (!isObj(v)) return undefined;
  const help: SkillHelp = {
    label: str(v.label),
    note: strs(v.note),
    questions: objs(v.questions).map(toDrill),
  };
  if (typeof v.mistake === "string") help.mistake = v.mistake;
  if (Array.isArray(v.foundation)) help.foundation = objs(v.foundation).map(toDrill);
  return help;
}

export function toDeckBody(raw: unknown): DeckCardBody[] {
  return objs(raw).map((c) => ({ id: str(c.id), front: str(c.front), back: str(c.back) }));
}

export function toQuizBody(raw: unknown): QuizQuestionBody[] {
  return objs(raw).map((q) => {
    const question: QuizQuestionBody = {
      id: str(q.id),
      q: str(q.q),
      options: strs(q.options),
      correct: str(q.correct),
      explanation: str(q.explanation),
    };
    if (typeof q.scenario === "string") question.scenario = q.scenario;
    const help = toHelp(q.help);
    if (help) question.help = help;
    return question;
  });
}

const num = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);

function toBlock(v: unknown): SectionBlock {
  const b = isObj(v) ? v : {};
  const block: SectionBlock = {
    items: objs(b.items).map((it) => ({
      ...(typeof it.label === "string" ? { label: it.label } : {}),
      body: str(it.body),
      ...(Array.isArray(it.items) ? { items: strs(it.items) } : {}),
    })),
  };
  if (typeof b.intro === "string") block.intro = b.intro;
  if (typeof b.outro === "string") block.outro = b.outro;
  return block;
}

export function toSectionBody(raw: unknown): SectionBody {
  const s = isObj(raw) ? raw : {};
  const body: SectionBody = {
    title: str(s.title),
    intro: toBlock(s.intro),
    examples: toBlock(s.examples),
    lesson: toBlock(s.lesson),
    notes: toBlock(s.notes),
    mistakes: objs(s.mistakes).map((m) => ({ wrong: str(m.wrong), right: str(m.right) })),
  };
  if (isObj(s.video)) {
    body.video = {
      poster: str(s.video.poster),
      ...(num(s.video.durationSec) !== undefined ? { durationSec: num(s.video.durationSec) } : {}),
      ...(typeof s.video.youtubeId === "string" ? { youtubeId: s.video.youtubeId } : {}),
    };
  }
  if (isObj(s.model3d)) {
    body.model3d = {
      src: str(s.model3d.src),
      credit: str(s.model3d.credit),
      ...(typeof s.model3d.title === "string" ? { title: s.model3d.title } : {}),
    };
  }
  if (Array.isArray(s.quiz)) body.quiz = toQuizBody(s.quiz);
  if (Array.isArray(s.quizHarder)) body.quizHarder = toQuizBody(s.quizHarder);
  return body;
}

function toPaperPart(p: Obj): PaperSectionBody {
  const part: PaperSectionBody = {
    id: str(p.id),
    title: str(p.title),
    instruction: str(p.instruction),
  };
  if (typeof p.statement === "string") part.statement = p.statement;
  if (typeof p.example === "string") part.example = p.example;
  if (Array.isArray(p.questions)) {
    part.questions = objs(p.questions).map((q) => ({
      id: str(q.id),
      q: str(q.q),
      options: strs(q.options),
      correct: str(q.correct),
      explanation: str(q.explanation),
      ...(num(q.points) !== undefined ? { points: num(q.points) } : {}),
      ...(typeof q.skill === "string" ? { skill: q.skill } : {}),
    }));
  }
  if (isObj(p.gapFill)) {
    const g = p.gapFill;
    part.gapFill = {
      title: str(g.title),
      body: str(g.body),
      wordBank: strs(g.wordBank),
      gaps: objs(g.gaps).map((gap) => ({
        id: str(gap.id),
        number: num(gap.number) ?? 0,
        correct: str(gap.correct),
        ...(gap.example === true ? { example: true } : {}),
        ...(typeof gap.skill === "string" ? { skill: gap.skill } : {}),
        explanation: str(gap.explanation),
      })),
    };
  }
  return part;
}

export function toPaperBody(raw: unknown): PaperBody {
  const p = isObj(raw) ? raw : {};
  const body: PaperBody = {
    minutes: num(p.minutes) ?? 0,
    sections: objs(p.sections).map(toPaperPart),
  };
  if (num(p.points) !== undefined) body.points = num(p.points);
  if (typeof p.note === "string") body.note = p.note;
  if (isObj(p.writing)) {
    body.writing = {
      title: str(p.writing.title),
      prompt: str(p.writing.prompt),
      minWords: num(p.writing.minWords) ?? 0,
      modelEssay: strs(p.writing.modelEssay),
      checklist: strs(p.writing.checklist),
    };
  }
  if (isObj(p.skills)) {
    const skills: Record<string, SkillHelp> = {};
    for (const [id, h] of Object.entries(p.skills)) {
      const help = toHelp(h);
      if (help) skills[id] = help;
    }
    body.skills = skills;
  }
  return body;
}

export function toBody(kind: ContentKind, raw: unknown): AnyBody {
  switch (kind) {
    case "deck":
      return toDeckBody(raw);
    case "quiz":
      return toQuizBody(raw);
    case "section":
      return toSectionBody(raw);
    case "paper":
      return toPaperBody(raw);
  }
}

/** Whether a body has the right outer shape for its kind: a list for a deck
 *  or quiz, one object for a section or paper. */
export function bodyFits(kind: ContentKind, raw: unknown): boolean {
  return kind === "deck" || kind === "quiz" ? Array.isArray(raw) : isObj(raw);
}

export const CONTENT_KINDS: readonly ContentKind[] = ["deck", "quiz", "section", "paper"];

// ── Calls ───────────────────────────────────────────────────────────────────

export async function listContent(): Promise<ContentResult<ContentRow[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_content_list");
  if (error) {
    devReport("admin_content_list", error);
    return failure(error);
  }
  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      kind: r.kind,
      key: r.key,
      publishedVersion: r.published_version,
      publishedCount: r.published_count,
      publishedAt: r.published_at,
      draftUpdatedAt: r.draft_updated_at,
      draftUpdatedBy: r.draft_updated_by,
      draftCount: r.draft_count,
    })),
  };
}

export async function getContent(
  kind: ContentKind,
  key: string
): Promise<ContentResult<ContentDetail>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_content_get", { p_kind: kind, p_key: key });
  if (error) {
    devReport("admin_content_get", error);
    return failure(error);
  }
  const raw = isObj(data) ? data : {};
  const pub = isObj(raw.published) ? raw.published : null;
  const draft = isObj(raw.draft) ? raw.draft : null;
  return {
    ok: true,
    data: {
      published: pub
        ? {
            version: Number(pub.version),
            body: toBody(kind, pub.body),
            publishedAt: str(pub.published_at),
            publishedBy: str(pub.published_by),
          }
        : null,
      draft: draft
        ? {
            body: toBody(kind, draft.body),
            baseVersion: typeof draft.base_version === "number" ? draft.base_version : null,
            updatedAt: str(draft.updated_at),
            updatedBy: str(draft.updated_by),
          }
        : null,
      usedIds: strs(raw.used_ids),
      versions: objs(raw.versions).map((v) => ({
        version: Number(v.version),
        publishedAt: str(v.published_at),
        publishedBy: str(v.published_by),
        itemCount: Number(v.item_count),
      })),
    },
  };
}

/** Save the draft. `expected` is the draft's updatedAt as loaded (null when
 *  there was none). Returns the new updatedAt, for the next call. */
export async function saveDraft(
  kind: ContentKind,
  key: string,
  body: AnyBody,
  expected: string | null
): Promise<ContentResult<string>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_save_content_draft", {
    p_kind: kind,
    p_key: key,
    p_body: body as unknown as Json,
    p_expected: expected,
  });
  if (error) {
    devReport("admin_save_content_draft", error);
    return failure(error);
  }
  return { ok: true, data: String(data) };
}

export async function discardDraft(
  kind: ContentKind,
  key: string,
  expected: string | null
): Promise<ContentResult<boolean>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_discard_content_draft", {
    p_kind: kind,
    p_key: key,
    p_expected: expected,
  });
  if (error) {
    devReport("admin_discard_content_draft", error);
    return failure(error);
  }
  return { ok: true, data: Boolean(data) };
}

export async function restoreVersion(
  kind: ContentKind,
  key: string,
  version: number,
  expected: string | null
): Promise<ContentResult<string>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_restore_content_version", {
    p_kind: kind,
    p_key: key,
    p_version: version,
    p_expected: expected,
  });
  if (error) {
    devReport("admin_restore_content_version", error);
    return failure(error);
  }
  return { ok: true, data: String(data) };
}

/** Owner only. Returns the version number students now get. */
export async function publishContent(
  kind: ContentKind,
  key: string,
  expected: string
): Promise<ContentResult<number>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_publish_content", {
    p_kind: kind,
    p_key: key,
    p_expected: expected,
  });
  if (error) {
    devReport("admin_publish_content", error);
    return failure(error);
  }
  return { ok: true, data: Number(data) };
}

/** Owner only. */
export async function unpublishContent(
  kind: ContentKind,
  key: string
): Promise<ContentResult<boolean>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_unpublish_content", { p_kind: kind, p_key: key });
  if (error) {
    devReport("admin_unpublish_content", error);
    return failure(error);
  }
  return { ok: true, data: Boolean(data) };
}

export interface ImportItem {
  kind: ContentKind;
  key: string;
  body: AnyBody;
}

/** Owner only. All or nothing on shape; see the migration for the outcomes. */
export async function importContent(
  items: ImportItem[],
  publish: boolean
): Promise<ContentResult<ImportOutcome[]>> {
  const db = await client();
  if (!db) return { ok: false, reason: "unconfigured" };
  const { data, error } = await db.rpc("admin_import_content", {
    p_items: items as unknown as Json,
    p_publish: publish,
  });
  if (error) {
    devReport("admin_import_content", error);
    return failure(error);
  }
  return {
    ok: true,
    data: (data ?? []).map((r) => ({ kind: r.item_kind, key: r.item_key, outcome: r.outcome })),
  };
}

/**
 * Read an import file: `{ "format": 1, "items": [...] }` (what
 * scripts/content-export.mjs writes) or the bare array. Null when it is not
 * one; the shape of each body is the checker's and the database's job.
 */
export function parseImportFile(text: string): ImportItem[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(parsed) ? parsed : isObj(parsed) ? parsed.items : null;
  if (!Array.isArray(list)) return null;
  const items: ImportItem[] = [];
  for (const it of list) {
    const kind = isObj(it) ? CONTENT_KINDS.find((k) => k === it.kind) : undefined;
    if (!isObj(it) || !kind || typeof it.key !== "string") return null;
    if (!bodyFits(kind, it.body)) return null;
    items.push({ kind, key: it.key, body: toBody(kind, it.body) });
  }
  return items.length ? items : null;
}

// Relative imports only — the Vercel function bundler reads the root tsconfig,
// which has no `paths`, so an `@/` import here fails the deploy build.
import { supabaseUrl } from "./verify-user.js";
import type { DeckMap, SectionMap } from "../src/utils/chat-prompt.js";
import type { SectionContent } from "../src/types/index.js";

/**
 * The published flashcard decks and lesson sections, for KruAI's prompt (the
 * catalog of what the app contains, and the full deck or section when the
 * student has one open).
 *
 * Both moved from the code into the database (supabase/migrations/20261003000001
 * and 20261003000002; docs/plans/content-in-database.md and
 * docs/plans/sections-and-papers-in-database.md), so the server reads them the
 * way a student's phone does: a plain fetch of `content_current(kind)` with the
 * publishable key, no session and no SDK. The two kinds are fetched IN
 * PARALLEL, so asking for both costs one round trip, not two.
 *
 * KEPT FOR 10 MINUTES PER SERVER INSTANCE, each kind on its own. Every question
 * would otherwise pay a database round trip before the model even starts, and
 * something published a few minutes ago reaching KruAI a few minutes late costs
 * nothing.
 *
 * NEVER FAILS A QUESTION. Unreachable, refused or malformed: KruAI answers
 * without that list rather than not at all, and the last good copy is kept
 * while there is one. The client still only ever sends a KEY; what reaches the
 * prompt is what this fetched (chat-prompt.ts's pinnedContextFor).
 */

const TTL_MS = 10 * 60_000;
/** After a failure, ask again no sooner than this, so a database that is down
 *  does not cost every question a timeout. */
const RETRY_MS = 60_000;
/** A slow database must not hold a question back for long. */
const TIMEOUT_MS = 3_000;

function publishableKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

function toDecks(rows: unknown): DeckMap | null {
  if (!Array.isArray(rows)) return null;
  const decks: DeckMap = {};
  for (const row of rows) {
    if (typeof row !== "object" || row === null) continue;
    const { key, body } = row as { key?: unknown; body?: unknown };
    if (typeof key !== "string" || !/^[a-z]+-\d{1,3}-\d{1,3}(-\d{1,3})?$/.test(key)) continue;
    if (!Array.isArray(body)) continue;
    const cards = body
      .filter(
        (c): c is { front: string; back: string } =>
          typeof c === "object" &&
          c !== null &&
          typeof (c as { front?: unknown }).front === "string" &&
          typeof (c as { back?: unknown }).back === "string"
      )
      .map((c) => ({ front: c.front, back: c.back }));
    if (cards.length > 0) decks[key] = cards;
  }
  return decks;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A section is trusted as far as the prompt reads it: the title, the four
 *  blocks' items and the mistakes. The database checked the rest on publish. */
function toSections(rows: unknown): SectionMap | null {
  if (!Array.isArray(rows)) return null;
  const sections: SectionMap = {};
  for (const row of rows) {
    if (!isObj(row)) continue;
    const { key, body } = row;
    if (typeof key !== "string" || !/^[a-z]+-\d{1,3}-\d{1,3}-\d{1,3}$/.test(key)) continue;
    if (
      !isObj(body) ||
      typeof body.title !== "string" ||
      !Array.isArray(body.mistakes) ||
      !["intro", "examples", "lesson", "notes"].every(
        (b) => isObj(body[b]) && Array.isArray((body[b] as { items?: unknown }).items)
      )
    ) {
      continue;
    }
    sections[key] = body as unknown as SectionContent;
  }
  return sections;
}

/** One kind's copy on this instance, fetched at most once at a time. */
function cachedKind<T extends object>(kind: "deck" | "section", parse: (rows: unknown) => T | null) {
  let cached: { at: number; value: T } | null = null;
  let inFlight: Promise<T> | null = null;

  async function fetchKind(): Promise<T> {
    const url = supabaseUrl();
    const key = publishableKey();
    if (!url || !key) return {} as T;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/content_current`, {
        method: "POST",
        headers: { apikey: key, "content-type": "application/json" },
        body: JSON.stringify({ p_kind: kind }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`content_current(${kind}) answered ${res.status}`);
      const value = parse(await res.json());
      if (!value) throw new Error(`content_current(${kind}) sent something that is not a list`);
      cached = { at: Date.now(), value };
      return value;
    } finally {
      clearTimeout(timer);
    }
  }

  return function get(): Promise<T> {
    if (cached && Date.now() - cached.at < TTL_MS) return Promise.resolve(cached.value);
    if (!inFlight) {
      inFlight = fetchKind()
        .catch((err: unknown) => {
          console.warn(`[api/chat] ${kind}s unavailable:`, err instanceof Error ? err.message : err);
          const value = cached?.value ?? ({} as T);
          cached = { at: Date.now() - TTL_MS + RETRY_MS, value };
          return value;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}

const getDecks = cachedKind<DeckMap>("deck", toDecks);
const getSections = cachedKind<SectionMap>("section", toSections);

/**
 * The published decks AND lesson sections, both from this instance's copies
 * when fresh, the two fetched in parallel otherwise. Never rejects.
 */
export async function publishedContent(): Promise<{ decks: DeckMap; sections: SectionMap }> {
  const [decks, sections] = await Promise.all([getDecks(), getSections()]);
  return { decks, sections };
}

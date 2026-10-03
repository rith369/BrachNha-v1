// Relative imports only — the Vercel function bundler reads the root tsconfig,
// which has no `paths`, so an `@/` import here fails the deploy build.
import { supabaseUrl } from "./verify-user.js";
import type { DeckMap } from "../src/utils/chat-prompt.js";

/**
 * The published flashcard decks, for KruAI's prompt (the catalog of what the
 * app contains, and the full deck when the student has one open).
 *
 * The decks moved from the code into the database
 * (supabase/migrations/20261003000001, docs/plans/content-in-database.md), so
 * the server reads them the way a student's phone does: a plain fetch of
 * `content_current('deck')` with the publishable key, no session and no SDK.
 *
 * KEPT FOR 10 MINUTES PER SERVER INSTANCE. Every question would otherwise pay
 * a database round trip before the model even starts, and a deck published a
 * few minutes ago reaching KruAI a few minutes late costs nothing.
 *
 * NEVER FAILS A QUESTION. Unreachable, refused or malformed: KruAI answers
 * without the deck list rather than not at all, and the last good copy is
 * kept while there is one. The client still only ever sends a KEY; what reaches
 * the prompt is what this fetched (chat-prompt.ts's pinnedContextFor).
 */

const TTL_MS = 10 * 60_000;
/** After a failure, ask again no sooner than this, so a database that is down
 *  does not cost every question a timeout. */
const RETRY_MS = 60_000;
/** A slow database must not hold a question back for long. */
const TIMEOUT_MS = 3_000;

let cached: { at: number; decks: DeckMap } | null = null;
let inFlight: Promise<DeckMap> | null = null;

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

async function fetchDecks(): Promise<DeckMap> {
  const url = supabaseUrl();
  const key = publishableKey();
  if (!url || !key) return {};
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/content_current`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify({ p_kind: "deck" }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`content_current answered ${res.status}`);
    const decks = toDecks(await res.json());
    if (!decks) throw new Error("content_current sent something that is not a list");
    cached = { at: Date.now(), decks };
    return decks;
  } finally {
    clearTimeout(timer);
  }
}

/** The published decks, from this instance's copy when it is fresh. */
export async function publishedDecks(): Promise<DeckMap> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.decks;
  if (!inFlight) {
    inFlight = fetchDecks()
      .catch((err: unknown) => {
        console.warn("[api/chat] decks unavailable:", err instanceof Error ? err.message : err);
        const decks = cached?.decks ?? {};
        cached = { at: Date.now() - TTL_MS + RETRY_MS, decks };
        return decks;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

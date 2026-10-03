import { useEffect, useSyncExternalStore } from "react";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseRestUrl,
} from "./supabase";
import type { ContentKind, DeckCardBody, QuizQuestionBody } from "@/types";
import {
  CONTENT_KEY,
  type ContentManifest,
  type DeckEntry,
  type QuizEntry,
} from "@/utils/content-manifest";

/**
 * Flashcard decks and practice quizzes, read from the database
 * (supabase/migrations/20261003000001) instead of the code. See
 * docs/plans/content-in-database.md, step 1b.
 *
 * TWO THINGS ARE DOWNLOADED, and only one of them every time:
 *
 *  - THE MANIFEST (`content_items`): what is published, a few KB. Fetched once
 *    per app load, and again when the app comes back after 30 minutes away.
 *    Kept in localStorage["brachnha-content"], so the next open has it at once
 *    and an offline open still knows what exists.
 *  - A BODY (`content_versions`), one deck or quiz, fetched only when it is
 *    opened, by (kind, key, version). A version never changes once published,
 *    so a body is downloaded once and kept for good in the browser's Cache
 *    Storage. NOT the service worker, which still caches nothing but
 *    offline.html. Anything opened once works offline afterwards.
 *
 * A PLAIN FETCH WITH THE PUBLISHABLE KEY, like lib/announcements.ts: guests
 * read content too, and the SDK stays out of the entry chunk and away from
 * them. Both tables are readable by anyone (published rows only).
 *
 * DEVELOPMENT WITHOUT SUPABASE (a fork, scripts/shots.mjs with the variables
 * blanked) reads content/fixture.json instead, the export the database was
 * filled from. That branch is behind `import.meta.env.DEV`, so production
 * builds drop it and the file never ships.
 *
 * MODULE STATE behind useSyncExternalStore (the install-prompt.ts pattern):
 * every snapshot is a new object only when something changed, so a component
 * re-renders exactly when its answer does.
 */

const STORAGE_KEY = "brachnha-content";
const CACHE_NAME = "brachnha-content-v1";
/** A body's key in Cache Storage. Never fetched; only a name for the entry. */
const CACHE_ORIGIN = "https://content.brachnha.invalid";
/** After this long in the background, coming back asks for the list again. */
const REFRESH_AFTER_MS = 30 * 60_000;
const FETCH_TIMEOUT_MS = 15_000;

const useFixture = import.meta.env.DEV && !isSupabaseConfigured;

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function emit() {
  for (const l of listeners) l();
}

function restBase(): string {
  return `${supabaseRestUrl.replace(/\/+$/, "")}/rest/v1`;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { apikey: supabasePublishableKey, ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

// ── The development fixture ───────────────────────────────────────────────

interface FixtureItem {
  kind: ContentKind;
  key: string;
  body: unknown[];
}

const fixtureFiles = import.meta.env.DEV
  ? import.meta.glob<{ items: FixtureItem[] }>("../../content/fixture.json", {
      import: "default",
    })
  : {};

let fixturePromise: Promise<FixtureItem[]> | null = null;
function loadFixture(): Promise<FixtureItem[]> {
  if (!fixturePromise) {
    const load = Object.values(fixtureFiles)[0];
    fixturePromise = load
      ? load().then((f) => (Array.isArray(f.items) ? f.items : []))
      : Promise.resolve([]);
  }
  return fixturePromise;
}

// ── The manifest ──────────────────────────────────────────────────────────

function toManifest(rows: unknown): ContentManifest | null {
  if (!Array.isArray(rows)) return null;
  const deck: Record<string, DeckEntry> = {};
  const quiz: Record<string, QuizEntry> = {};
  for (const row of rows) {
    if (typeof row !== "object" || row === null) continue;
    const r = row as Record<string, unknown>;
    const version = Number(r.version);
    const count = Number(r.item_count);
    if (typeof r.key !== "string" || !CONTENT_KEY.test(r.key)) continue;
    if (!Number.isInteger(version) || version < 1 || !Number.isInteger(count) || count < 1) continue;
    if (r.kind === "deck") {
      const ids = Array.isArray(r.item_ids)
        ? r.item_ids.filter((id): id is string => typeof id === "string")
        : [];
      deck[r.key] = { version, count, ids };
    } else if (r.kind === "quiz") {
      quiz[r.key] = { version, count };
    }
  }
  return { status: "ready", deck, quiz };
}

function readStored(): ContentManifest | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as { deck?: unknown; quiz?: unknown };
    if (typeof r.deck !== "object" || r.deck === null) return null;
    if (typeof r.quiz !== "object" || r.quiz === null) return null;
    // Re-checked through toManifest, so a hand-edited or older copy cannot
    // put a malformed entry on screen.
    const rows = [
      ...Object.entries(r.deck as Record<string, DeckEntry>).map(([key, e]) => ({
        kind: "deck", key, version: e?.version, item_count: e?.count, item_ids: e?.ids,
      })),
      ...Object.entries(r.quiz as Record<string, QuizEntry>).map(([key, e]) => ({
        kind: "quiz", key, version: e?.version, item_count: e?.count,
      })),
    ];
    return toManifest(rows);
  } catch {
    return null;
  }
}

function store(m: ContentManifest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ deck: m.deck, quiz: m.quiz }));
  } catch {
    // Kept for this page load only.
  }
}

let manifest: ContentManifest =
  (useFixture ? null : readStored()) ?? { status: "loading", deck: {}, quiz: {} };
let manifestInFlight = false;
let lastFetchAt = 0;
let hiddenAt = 0;
let started = false;

function setManifest(next: ContentManifest) {
  manifest = next;
  emit();
}

async function refreshManifest(): Promise<void> {
  if (manifestInFlight) return;
  manifestInFlight = true;
  lastFetchAt = Date.now();
  try {
    if (useFixture) {
      const items = await loadFixture();
      setManifest(
        toManifest(
          items.map((it) => ({
            kind: it.kind,
            key: it.key,
            version: 1,
            item_count: it.body.length,
            item_ids: it.body.map((x) => (x as { id?: unknown }).id),
          }))
        ) ?? { status: "ready", deck: {}, quiz: {} }
      );
      return;
    }
    if (!isSupabaseConfigured) {
      // A production build with no project: nothing is published anywhere.
      setManifest({ status: "ready", deck: {}, quiz: {} });
      return;
    }
    const rows = await fetchJson(
      `${restBase()}/content_items?select=kind,key,version,item_count,item_ids`
    );
    const next = toManifest(rows);
    if (!next) throw new Error("bad manifest");
    store(next);
    setManifest(next);
  } catch {
    // Offline or refused. A device that has a list keeps it; the first ever
    // open says so, with Try again.
    if (manifest.status === "loading") setManifest({ ...manifest, status: "failed" });
  } finally {
    manifestInFlight = false;
  }
}

function start() {
  if (started) return;
  started = true;
  void refreshManifest();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = Date.now();
    } else if (hiddenAt && Date.now() - hiddenAt > REFRESH_AFTER_MS && Date.now() - lastFetchAt > REFRESH_AFTER_MS) {
      void refreshManifest();
    }
  });
}

/** What is published. Starts the download on first use. */
export function useContentManifest(): ContentManifest {
  useEffect(() => {
    start();
  }, []);
  return useSyncExternalStore(subscribe, () => manifest);
}

/** "Try again" after a failed first open. */
export function retryContent(): void {
  if (manifest.status === "failed") setManifest({ ...manifest, status: "loading" });
  void refreshManifest();
}

// ── Bodies ────────────────────────────────────────────────────────────────

export type BodyOf<K extends ContentKind> = K extends "deck" ? DeckCardBody[] : QuizQuestionBody[];

/** Distributive over K, so a caller holding either kind gets a union it can
 *  narrow by `kind` (`body.kind === "deck"`). */
export type BodyState<K extends ContentKind> = K extends ContentKind
  ? | { status: "loading" }
  /** `kind` lets a caller holding either kind tell them apart. `publishedAt`
   *  is "" when the body came in a batch that does not carry it. */
  | { status: "ready"; kind: K; body: BodyOf<K>; publishedAt: string }
  /** Not published (or no longer): the caller sends the student back. */
  | { status: "missing" }
  /** The network did not answer and this device has never opened it. */
  | { status: "offline" }
  : never;

const LOADING = { status: "loading" } as const;
const MISSING = { status: "missing" } as const;

type AnyState = BodyState<"deck"> | BodyState<"quiz">;
const bodies = new Map<string, AnyState>();

const bodyId = (kind: ContentKind, key: string, version: number) => `${kind}/${key}/${version}`;

/** A body is trusted only as far as its shape: an array of objects with ids. */
function isBody(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (x) => typeof x === "object" && x !== null && typeof (x as { id?: unknown }).id === "string"
    )
  );
}

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === "undefined" ? null : await caches.open(CACHE_NAME);
  } catch {
    // An insecure origin, or storage refused: bodies are kept in memory only.
    return null;
  }
}

async function fromCache(id: string): Promise<{ body: unknown[]; publishedAt: string } | null> {
  const cache = await openCache();
  if (!cache) return null;
  try {
    const res = await cache.match(`${CACHE_ORIGIN}/${id}`);
    if (!res) return null;
    const data = (await res.json()) as { body?: unknown; publishedAt?: unknown };
    return isBody(data.body)
      ? { body: data.body, publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : "" }
      : null;
  } catch {
    return null;
  }
}

async function toCache(id: string, body: unknown[], publishedAt: string) {
  const cache = await openCache();
  if (!cache) return;
  try {
    await cache.put(
      `${CACHE_ORIGIN}/${id}`,
      new Response(JSON.stringify({ body, publishedAt }), {
        headers: { "content-type": "application/json" },
      })
    );
  } catch {
    // Storage full or refused: it is downloaded again next time.
  }
}

function setBody(id: string, state: AnyState) {
  bodies.set(id, state);
  emit();
}

async function loadBody(kind: ContentKind, key: string, version: number): Promise<void> {
  const id = bodyId(kind, key, version);
  const now = bodies.get(id);
  if (now && (now.status === "ready" || now.status === "loading")) return;
  bodies.set(id, LOADING);

  if (useFixture) {
    const item = (await loadFixture()).find((it) => it.kind === kind && it.key === key);
    setBody(id, item && version === 1 && isBody(item.body)
      ? ({ status: "ready", kind, body: item.body, publishedAt: "" } as AnyState)
      : MISSING);
    return;
  }

  const cached = await fromCache(id);
  if (cached) {
    setBody(id, { status: "ready", kind, body: cached.body, publishedAt: cached.publishedAt } as AnyState);
    return;
  }
  if (!isSupabaseConfigured) {
    setBody(id, MISSING);
    return;
  }
  try {
    const rows = await fetchJson(
      `${restBase()}/content_versions?select=body,published_at` +
        `&kind=eq.${kind}&key=eq.${encodeURIComponent(key)}&version=eq.${version}`
    );
    const row = Array.isArray(rows) ? (rows[0] as { body?: unknown; published_at?: unknown } | undefined) : undefined;
    if (!row || !isBody(row.body)) {
      setBody(id, MISSING);
      return;
    }
    const publishedAt = typeof row.published_at === "string" ? row.published_at : "";
    void toCache(id, row.body, publishedAt);
    setBody(id, { status: "ready", kind, body: row.body, publishedAt } as AnyState);
  } catch {
    setBody(id, { status: "offline" });
  }
}

/**
 * One deck or quiz. `version` comes from the manifest (or, to reopen an old
 * quiz attempt, from the attempt); null means "not published", and the
 * caller decides between that and "still loading" from the manifest's status.
 */
export function useContentBody<K extends ContentKind>(
  kind: K,
  key: string,
  version: number | null
): BodyState<K> {
  useEffect(() => {
    if (version !== null) void loadBody(kind, key, version);
  }, [kind, key, version]);
  const state = useSyncExternalStore(subscribe, () =>
    version === null ? MISSING : bodies.get(bodyId(kind, key, version)) ?? LOADING
  );
  return state as BodyState<K>;
}

/** Ask again for a body that failed to download. */
export function retryBody(kind: ContentKind, key: string, version: number): void {
  const id = bodyId(kind, key, version);
  if (bodies.get(id)?.status === "offline") bodies.delete(id);
  void loadBody(kind, key, version);
}

/** Start downloading a body nobody has opened yet, so the next tap is instant.
 *  Quiet: a failure here is simply tried again on the real open. */
export function prefetchBody(kind: ContentKind, key: string, version: number): void {
  void loadBody(kind, key, version).then(() => {
    const id = bodyId(kind, key, version);
    if (bodies.get(id)?.status === "offline") bodies.delete(id);
  });
}

// ── Every current body of one kind ───────────────────────────────────────

export type AllState<K extends ContentKind> = K extends ContentKind
  ? { status: "loading" } | { status: "ready"; bodies: Record<string, BodyOf<K>> } | { status: "offline" }
  : never;

interface AllEntry {
  /** The manifest entries this answer was built for: "key@version,…". */
  sig: string;
  state: AllState<"deck"> | AllState<"quiz">;
}

const all: Record<ContentKind, AllEntry> = {
  deck: { sig: "", state: { status: "loading" } },
  quiz: { sig: "", state: { status: "loading" } },
};
const allInFlight: Record<ContentKind, string> = { deck: "", quiz: "" };

function entriesOf(kind: ContentKind, m: ContentManifest): [string, number][] {
  const map = kind === "deck" ? m.deck : m.quiz;
  return Object.keys(map)
    .sort()
    .map((key) => [key, map[key].version]);
}

function sigOf(kind: ContentKind, m: ContentManifest): string {
  return entriesOf(kind, m)
    .map(([k, v]) => `${k}@${v}`)
    .join(",");
}

async function loadAll(kind: ContentKind, m: ContentManifest): Promise<void> {
  const sig = sigOf(kind, m);
  if (all[kind].sig === sig && all[kind].state.status === "ready") return;
  if (allInFlight[kind] === sig) return;
  allInFlight[kind] = sig;

  const entries = entriesOf(kind, m);
  const out: Record<string, unknown[]> = {};
  const missing: [string, number][] = [];
  for (const [key, version] of entries) {
    const id = bodyId(kind, key, version);
    const held = bodies.get(id);
    if (held?.status === "ready") {
      out[key] = held.body;
      continue;
    }
    const cached = useFixture ? null : await fromCache(id);
    if (cached) {
      bodies.set(id, { status: "ready", kind, body: cached.body, publishedAt: cached.publishedAt } as AnyState);
      out[key] = cached.body;
    } else {
      missing.push([key, version]);
    }
  }

  if (missing.length > 0) {
    try {
      if (useFixture) {
        for (const it of await loadFixture()) {
          if (it.kind === kind && isBody(it.body) && missing.some(([k]) => k === it.key)) {
            out[it.key] = it.body;
          }
        }
      } else if (isSupabaseConfigured) {
        // ONE request for every current body, rather than one per deck.
        const rows = await fetchJson(`${restBase()}/rpc/content_current`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ p_kind: kind }),
        });
        if (!Array.isArray(rows)) throw new Error("bad bodies");
        for (const row of rows as { key?: unknown; version?: unknown; body?: unknown }[]) {
          const version = Number(row.version);
          if (typeof row.key !== "string" || !Number.isInteger(version) || !isBody(row.body)) continue;
          const id = bodyId(kind, row.key, version);
          bodies.set(id, { status: "ready", kind, body: row.body, publishedAt: "" } as AnyState);
          void toCache(id, row.body, "");
          if (missing.some(([k, v]) => k === row.key && v === version)) out[row.key] = row.body;
        }
      }
    } catch {
      if (allInFlight[kind] === sig) allInFlight[kind] = "";
      all[kind] = { sig, state: { status: "offline" } };
      emit();
      return;
    }
  }

  if (allInFlight[kind] === sig) allInFlight[kind] = "";
  all[kind] = { sig, state: { status: "ready", bodies: out } as AllEntry["state"] };
  emit();
}

/**
 * Every published body of one kind, for the two screens that need all of them
 * at once: the Daily Review across every deck, and the admin's mistake reports.
 * Whatever this device already holds is not downloaded again; the rest comes
 * in ONE request.
 */
export function useAllBodies<K extends ContentKind>(kind: K, m: ContentManifest): AllState<K> {
  const ready = m.status === "ready";
  const sig = sigOf(kind, m);
  useEffect(() => {
    if (ready) void loadAll(kind, m);
  }, [kind, ready, sig, m]);
  const entry = useSyncExternalStore(subscribe, () => all[kind]);
  if (!ready || entry.sig !== sig) return { status: "loading" } as AllState<K>;
  return entry.state as AllState<K>;
}

/** Try the whole set again after it failed. */
export function retryAll(kind: ContentKind, m: ContentManifest): void {
  all[kind] = { sig: "", state: { status: "loading" } };
  allInFlight[kind] = "";
  emit();
  void loadAll(kind, m);
}

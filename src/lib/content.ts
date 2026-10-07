import { useEffect, useSyncExternalStore } from "react";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseRestUrl,
} from "./supabase";
import type { ContentBody, ContentKind } from "@/types";
import {
  bodyCount,
  CONTENT_KEY,
  type ContentEntry,
  type ContentManifest,
  type DeckEntry,
} from "@/utils/content-manifest";

/**
 * Flashcard decks, practice quizzes, lesson sections and past papers, read
 * from the database (supabase/migrations/20261003000001 and 20261003000002)
 * instead of the code. See docs/plans/content-in-database.md (step 1b) and
 * docs/plans/sections-and-papers-in-database.md (step B).
 *
 * TWO THINGS ARE DOWNLOADED, and only one of them every time:
 *
 *  - THE MANIFEST (`content_items`): what is published, a few KB. Fetched once
 *    per app load, and again when the app comes back after 30 minutes away.
 *    Kept in localStorage["brachnha-content"], so the next open has it at once
 *    and an offline open still knows what exists.
 *  - A BODY (`content_versions`), one deck, quiz, section or paper, fetched only
 *    when it is opened, by (kind, key, version). A version never changes once
 *    published, so a body is downloaded once and kept for good in the
 *    browser's Cache Storage. NOT the service worker, which still caches
 *    nothing but offline.html. Anything opened once works offline afterwards.
 *
 * A PLAIN FETCH WITH THE PUBLISHABLE KEY, like lib/announcements.ts: guests
 * read content too, and the SDK stays out of the entry chunk and away from
 * them. Both tables are readable by anyone (published rows only).
 *
 * DEVELOPMENT WITHOUT SUPABASE (a fork, scripts/shots.mjs with the variables
 * blanked) reads content/fixture.json instead, a copy of what is published
 * (`npm run content:export`). That branch is behind `import.meta.env.DEV`, so
 * production builds drop it and the file never ships.
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

const KINDS: readonly ContentKind[] = ["deck", "quiz", "section", "paper"];

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

function emptyManifest(status: ContentManifest["status"]): ContentManifest {
  return { status, deck: {}, quiz: {}, section: {}, paper: {} };
}

// ── The development fixture ───────────────────────────────────────────────

interface FixtureItem {
  kind: ContentKind;
  key: string;
  body: unknown;
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

function isKind(value: unknown): value is ContentKind {
  return typeof value === "string" && (KINDS as readonly string[]).includes(value);
}

function toManifest(rows: unknown): ContentManifest | null {
  if (!Array.isArray(rows)) return null;
  const next = emptyManifest("ready");
  for (const row of rows) {
    if (typeof row !== "object" || row === null) continue;
    const r = row as Record<string, unknown>;
    if (!isKind(r.kind)) continue;
    const kind = r.kind;
    const version = Number(r.version);
    const count = Number(r.item_count);
    if (typeof r.key !== "string" || !CONTENT_KEY[kind].test(r.key)) continue;
    if (!Number.isInteger(version) || version < 1 || !Number.isInteger(count)) continue;
    // A section may ask no questions and is still a section to read; anything
    // else with nothing in it is not published in any useful sense.
    if (count < (kind === "section" ? 0 : 1)) continue;
    if (kind === "deck") {
      const ids = Array.isArray(r.item_ids)
        ? r.item_ids.filter((id): id is string => typeof id === "string")
        : [];
      next.deck[r.key] = { version, count, ids };
    } else {
      next[kind][r.key] = { version, count };
    }
  }
  return next;
}

function readStored(): ContentManifest | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Partial<Record<ContentKind, unknown>>;
    // A copy from before step B has no `section` or `paper`: read as none, and
    // the network fills them in.
    if (typeof r.deck !== "object" || r.deck === null) return null;
    if (typeof r.quiz !== "object" || r.quiz === null) return null;
    // Re-checked through toManifest, so a hand-edited or older copy cannot
    // put a malformed entry on screen.
    const rows = KINDS.flatMap((kind) => {
      const map = r[kind];
      if (typeof map !== "object" || map === null) return [];
      return Object.entries(map as Record<string, Partial<DeckEntry>>).map(([key, e]) => ({
        kind,
        key,
        version: e?.version,
        item_count: e?.count,
        item_ids: e?.ids,
      }));
    });
    return toManifest(rows);
  } catch {
    return null;
  }
}

function store(m: ContentManifest) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ deck: m.deck, quiz: m.quiz, section: m.section, paper: m.paper })
    );
  } catch {
    // Kept for this page load only.
  }
}

let manifest: ContentManifest = (useFixture ? null : readStored()) ?? emptyManifest("loading");
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
            item_count: bodyCount(it.kind, it.body),
            item_ids: Array.isArray(it.body)
              ? it.body.map((x) => (x as { id?: unknown }).id)
              : [],
          }))
        ) ?? emptyManifest("ready")
      );
      return;
    }
    if (!isSupabaseConfigured) {
      // A production build with no project: nothing is published anywhere.
      setManifest(emptyManifest("ready"));
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

export type BodyOf<K extends ContentKind> = ContentBody<K>;

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

type AnyState = BodyState<ContentKind>;
const bodies = new Map<string, AnyState>();

const bodyId = (kind: ContentKind, key: string, version: number) => `${kind}/${key}/${version}`;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * A body is trusted only as far as its shape: the database checked it in full
 * when it was published, so this only stops a truncated or foreign payload
 * reaching a screen that would throw on it.
 *
 *   deck, quiz   a list of objects with ids
 *   section      an object with a title and its four blocks
 *   paper        an object with minutes and at least one part
 */
function isBody(kind: ContentKind, value: unknown): boolean {
  if (kind === "deck" || kind === "quiz") {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((x) => isObj(x) && typeof x.id === "string")
    );
  }
  if (!isObj(value)) return false;
  if (kind === "section") {
    return (
      typeof value.title === "string" &&
      ["intro", "examples", "lesson", "notes"].every(
        (b) => isObj(value[b]) && Array.isArray((value[b] as { items?: unknown }).items)
      ) &&
      Array.isArray(value.mistakes)
    );
  }
  return (
    typeof value.minutes === "number" &&
    Array.isArray(value.sections) &&
    value.sections.length > 0 &&
    value.sections.every((s) => isObj(s) && typeof s.id === "string")
  );
}

function ready(kind: ContentKind, body: unknown, publishedAt: string): AnyState {
  return { status: "ready", kind, body, publishedAt } as AnyState;
}

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === "undefined" ? null : await caches.open(CACHE_NAME);
  } catch {
    // An insecure origin, or storage refused: bodies are kept in memory only.
    return null;
  }
}

async function fromCache(
  kind: ContentKind,
  id: string
): Promise<{ body: unknown; publishedAt: string } | null> {
  const cache = await openCache();
  if (!cache) return null;
  try {
    const res = await cache.match(`${CACHE_ORIGIN}/${id}`);
    if (!res) return null;
    const data = (await res.json()) as { body?: unknown; publishedAt?: unknown };
    return isBody(kind, data.body)
      ? { body: data.body, publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : "" }
      : null;
  } catch {
    return null;
  }
}

async function toCache(id: string, body: unknown, publishedAt: string) {
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
    setBody(id, item && version === 1 && isBody(kind, item.body) ? ready(kind, item.body, "") : MISSING);
    return;
  }

  const cached = await fromCache(kind, id);
  if (cached) {
    setBody(id, ready(kind, cached.body, cached.publishedAt));
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
    if (!row || !isBody(kind, row.body)) {
      setBody(id, MISSING);
      return;
    }
    const publishedAt = typeof row.published_at === "string" ? row.published_at : "";
    void toCache(id, row.body, publishedAt);
    setBody(id, ready(kind, row.body, publishedAt));
  } catch {
    setBody(id, { status: "offline" });
  }
}

/**
 * One deck, quiz, section or paper. `version` comes from the manifest (or, to
 * reopen an old attempt, from the attempt); null means "not published", and
 * the caller decides between that and "still loading" from the manifest's
 * status.
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
  state: AllState<ContentKind>;
}

const all: Record<ContentKind, AllEntry> = {
  deck: { sig: "", state: { status: "loading" } },
  quiz: { sig: "", state: { status: "loading" } },
  section: { sig: "", state: { status: "loading" } },
  paper: { sig: "", state: { status: "loading" } },
};
const allInFlight: Record<ContentKind, string> = { deck: "", quiz: "", section: "", paper: "" };

function entriesOf(kind: ContentKind, m: ContentManifest): [string, number][] {
  const map: Record<string, ContentEntry> = m[kind];
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
  const out: Record<string, unknown> = {};
  const missing: [string, number][] = [];
  for (const [key, version] of entries) {
    const id = bodyId(kind, key, version);
    const held = bodies.get(id);
    if (held?.status === "ready") {
      out[key] = held.body;
      continue;
    }
    const cached = useFixture ? null : await fromCache(kind, id);
    if (cached) {
      bodies.set(id, ready(kind, cached.body, cached.publishedAt));
      out[key] = cached.body;
    } else {
      missing.push([key, version]);
    }
  }

  if (missing.length > 0) {
    try {
      if (useFixture) {
        for (const it of await loadFixture()) {
          if (it.kind === kind && isBody(kind, it.body) && missing.some(([k]) => k === it.key)) {
            out[it.key] = it.body;
          }
        }
      } else if (isSupabaseConfigured) {
        // ONE request for every current body, rather than one per item.
        const rows = await fetchJson(`${restBase()}/rpc/content_current`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ p_kind: kind }),
        });
        if (!Array.isArray(rows)) throw new Error("bad bodies");
        for (const row of rows as { key?: unknown; version?: unknown; body?: unknown }[]) {
          const version = Number(row.version);
          if (typeof row.key !== "string" || !Number.isInteger(version) || !isBody(kind, row.body)) continue;
          const id = bodyId(kind, row.key, version);
          bodies.set(id, ready(kind, row.body, ""));
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
 * Every published body of one kind, for the screens that need all of them at
 * once: the Daily Review across every deck, and the admin's mistake reports.
 * Whatever this device already holds is not downloaded again; the rest comes
 * in ONE request.
 */
export function useAllBodies<K extends ContentKind>(kind: K, m: ContentManifest): AllState<K> {
  const isReady = m.status === "ready";
  const sig = sigOf(kind, m);
  useEffect(() => {
    if (isReady) void loadAll(kind, m);
  }, [kind, isReady, sig, m]);
  const entry = useSyncExternalStore(subscribe, () => all[kind]);
  if (!isReady || entry.sig !== sig) return { status: "loading" } as AllState<K>;
  return entry.state as AllState<K>;
}

/** Try the whole set again after it failed. */
export function retryAll(kind: ContentKind, m: ContentManifest): void {
  all[kind] = { sig: "", state: { status: "loading" } };
  allInFlight[kind] = "";
  emit();
  void loadAll(kind, m);
}

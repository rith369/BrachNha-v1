import { useEffect, useSyncExternalStore } from "react";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseRestUrl,
} from "./supabase";
import type { AnnouncementTone } from "@/types/database";

/**
 * The team's announcements, for the banner under the app bar
 * (components/shell/announcement-banner.tsx), over the `announcements` table in
 * supabase/migrations/20261002000005.
 *
 * A PLAIN FETCH WITH THE PUBLISHABLE KEY, NOT THE SDK. The banner is on every
 * ordinary screen, guests included, and the SDK is kept out of the entry chunk
 * and away from guests entirely (lib/supabase.ts). The table's read policy
 * returns only LIVE announcements to anyone, so no session is needed and none
 * is sent.
 *
 * ONCE PER PAGE LOAD, cached in this module: an announcement is not urgent to
 * the minute, and every screen change re-asking would be a request per tap on
 * mobile data. A failure shows no banner, which is exactly what "no
 * announcement" looks like.
 *
 * DISMISSAL IS A DEVICE FACT, in its own key (localStorage
 * "brachnha-announcements"), the same call lib/intro-seen.ts makes: as a store
 * field it would sync for nothing and be wiped by logout(). Every access is
 * wrapped, because storage can be missing or throw (private mode); then a
 * dismissed banner simply comes back next load.
 *
 * EVERY ROW IS CHECKED, not trusted, and a link must be an APP path: the
 * database already refuses anything else, and this is the second lock on the
 * one field that can send a student somewhere.
 */

export interface Announcement {
  id: number;
  bodyKm: string;
  bodyEn: string | null;
  tone: AnnouncementTone;
  link: string | null;
}

interface Snapshot {
  list: Announcement[];
  dismissed: number[];
}

const STORAGE_KEY = "brachnha-announcements";
/** Ids to remember. Old ids fall off the front; they will never be live again. */
const MAX_DISMISSED = 50;

/** "/exam", "/practice/quiz/math/1-1-1": a path inside the app, and nothing
 *  that a browser would read as another site ("//x", "/\x"). */
export function isAppPath(link: string): boolean {
  return /^\/[A-Za-z0-9/_?=&.%#-]*$/.test(link) && !link.startsWith("//") && link.length <= 200;
}

function readDismissed(): number[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((n): n is number => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

let snapshot: Snapshot = { list: [], dismissed: readDismissed() };
let started = false;
const listeners = new Set<() => void>();

function emit(next: Snapshot) {
  snapshot = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toAnnouncement(row: unknown): Announcement | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  const id = Number(r.id);
  const bodyKm = typeof r.body_km === "string" ? r.body_km.trim() : "";
  if (!Number.isInteger(id) || !bodyKm) return null;
  const bodyEn = typeof r.body_en === "string" && r.body_en.trim() ? r.body_en.trim() : null;
  const tone: AnnouncementTone =
    r.tone === "success" || r.tone === "warning" ? r.tone : "info";
  const link = typeof r.link === "string" && isAppPath(r.link) ? r.link : null;
  return { id, bodyKm, bodyEn, tone, link };
}

function start() {
  if (started || !isSupabaseConfigured) return;
  started = true;
  void (async () => {
    try {
      const res = await fetch(
        `${supabaseRestUrl.replace(/\/+$/, "")}/rest/v1/announcements` +
          "?select=id,body_km,body_en,tone,link&order=created_at.desc&limit=5",
        { headers: { apikey: supabasePublishableKey } }
      );
      if (!res.ok) return;
      const rows: unknown = await res.json();
      if (!Array.isArray(rows)) return;
      const list = rows.map(toAnnouncement).filter((a): a is Announcement => a !== null);
      if (list.length > 0) emit({ ...snapshot, list });
    } catch {
      // Offline, or the migration not applied yet: no banner.
    }
  })();
}

/** Hide one announcement on this device for good. */
export function dismissAnnouncement(id: number): void {
  if (snapshot.dismissed.includes(id)) return;
  const dismissed = [...snapshot.dismissed, id].slice(-MAX_DISMISSED);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch {
    // Hidden for this page load only.
  }
  emit({ ...snapshot, dismissed });
}

/** The newest live announcement this device has not dismissed, or null. */
export function useAnnouncement(): Announcement | null {
  useEffect(() => {
    start();
  }, []);
  const { list, dismissed } = useSyncExternalStore(subscribe, () => snapshot);
  return list.find((a) => !dismissed.includes(a.id)) ?? null;
}

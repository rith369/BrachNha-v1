/**
 * Whether this device has already been shown the three "why science" screens.
 *
 * A DEVICE fact, not account data — the same call lib/install-prompt.ts makes
 * for its snooze flag. As a store field it would sync to Supabase, lengthen the
 * partializeState ↔ syncRelevantChange list for nothing, and be wiped by
 * logout(), which would replay the intro to a student who has already read it
 * and is only switching accounts. Its own key, every access wrapped, because
 * storage can be missing or throw (private mode) — in which case the intro
 * simply shows again next load, which is harmless.
 */

const STORAGE_KEY = "brachnha-intro";

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Nothing to do: the in-memory state in AppShell still moves the student on.
  }
}

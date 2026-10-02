/**
 * "Add BrachNha to your home screen" — the state behind the install pop-up.
 *
 * ── What a web page is allowed to do here ─────────────────────────────────
 *
 * ANDROID (Chrome, Edge, Samsung Internet) fires `beforeinstallprompt` once the
 * site qualifies — a manifest (public/manifest.webmanifest), icons, and a
 * service worker (public/sw.js). We keep that event and call `.prompt()` on it
 * from our own button; the browser then shows its real install dialog. The
 * dialog can only open from a user's TAP, so "install automatically" does not
 * exist — the pop-up is what makes the tap one step away.
 *
 * iPHONE has no API at all. Apple gives a page no event and no dialog, so the
 * pop-up there shows the two manual steps (Share → Add to Home Screen).
 *
 * IN-APP BROWSERS (Telegram, Messenger) cannot install, and are asked to open
 * their real browser when they sign in. Nothing is shown there.
 *
 * ── Two moments, both requested ───────────────────────────────────────────
 *
 *  • "open"   — shortly after the app opens. Once per page load, and after
 *               "Not now" it rests for OPEN_SNOOZE_DAYS so it doesn't greet a
 *               student with the same pop-up every single visit.
 *  • "lesson" — after finishing a lesson (the moment the app has just proved
 *               its worth). Once per device, ever.
 *
 * Neither ever shows once the app is installed.
 *
 * ── Why this is a module, not store state ────────────────────────────────
 *
 * `beforeinstallprompt` can fire before React has mounted, so the listener has
 * to exist from the moment the entry chunk evaluates — main.tsx imports this
 * file for exactly that. And the snooze/"seen" flags are a DEVICE fact rather
 * than account data: putting them in the persisted store would sync them to
 * Supabase and add a field to the partializeState ↔ syncRelevantChange list
 * for no reason. They live in their own localStorage key instead, every access
 * wrapped, because storage can be missing or throw (private mode).
 */

import { isIOS, isInAppBrowser, isInstalledApp } from "@/utils/in-app-browser";

/** The Chromium event. Not in lib.dom.d.ts because it is not a standard. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** "prompt" = we hold the browser's install dialog; "ios" = show the steps. */
export type InstallMode = "prompt" | "ios";
export type InstallReason = "open" | "lesson";

export interface InstallState {
  /** How this browser installs, or null when it can't / already has. */
  mode: InstallMode | null;
  /** The "open" pop-up is still allowed on this page load. */
  openAvailable: boolean;
  /** A lesson was just finished and the "lesson" pop-up hasn't been shown. */
  lessonPending: boolean;
}

/** How long "Not now" on the opening pop-up keeps it away. */
const OPEN_SNOOZE_DAYS = 3;
const STORAGE_KEY = "brachnha-install";

interface Saved {
  /** Epoch ms before which the "open" pop-up stays hidden. */
  snoozeUntil?: number;
  /** The "lesson" pop-up has been shown on this device. */
  lessonShown?: boolean;
}

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : {};
  } catch {
    return {};
  }
}

function writeSaved(patch: Saved): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch }));
  } catch {
    // Storage unavailable: the pop-up simply may show again next visit.
  }
}

// ── Module state ───────────────────────────────────────────────────────────

let deferred: BeforeInstallPromptEvent | null = null;
let installed = typeof window !== "undefined" && isInstalledApp();
const inAppBrowser = typeof window !== "undefined" && isInAppBrowser();
const ios = typeof window !== "undefined" && isIOS();

let openAvailable = (readSaved().snoozeUntil ?? 0) <= Date.now();
let lessonPending = false;

const listeners = new Set<() => void>();

function computeMode(): InstallMode | null {
  if (installed || inAppBrowser) return null;
  if (deferred) return "prompt";
  if (ios) return "ios";
  return null;
}

// useSyncExternalStore needs the SAME object back until something changes, or
// it re-renders forever — so the snapshot is rebuilt only in emit().
let snapshot: InstallState = { mode: computeMode(), openAvailable, lessonPending };

function emit(): void {
  snapshot = { mode: computeMode(), openAvailable, lessonPending };
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Stops Chrome's own mini-infobar; our pop-up offers the same dialog at a
    // better moment.
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState(): InstallState {
  return snapshot;
}

/**
 * Called when a lesson or a section is finished. Queues the "lesson" pop-up
 * unless this device has already had it; the shell shows it once the student
 * leaves the lesson's completion screen.
 */
export function markLessonFinished(): void {
  if (lessonPending || readSaved().lessonShown) return;
  lessonPending = true;
  emit();
}

/** The pop-up was closed, for either answer. */
export function dismissInstall(reason: InstallReason): void {
  if (reason === "lesson") {
    lessonPending = false;
    writeSaved({ lessonShown: true });
  } else {
    writeSaved({ snoozeUntil: Date.now() + OPEN_SNOOZE_DAYS * 86_400_000 });
  }
  // Either way, no second pop-up on this page load — a student who just closed
  // one must not be handed the other a moment later.
  openAvailable = false;
  emit();
}

/**
 * Opens the browser's install dialog. Android/desktop Chromium only; a no-op
 * without a held event. The event is single-use, so it is dropped afterwards —
 * the browser fires a fresh one later if the student declined.
 */
export async function promptInstall(): Promise<void> {
  const event = deferred;
  if (!event) return;
  deferred = null;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") installed = true;
  } catch {
    // A prompt that throws (already used, or the page lost activation) leaves
    // the student exactly where they were.
  }
  emit();
}

/**
 * Registers public/sw.js. Production only: in `vite dev` a worker would sit
 * between the browser and Vite's own module server for no benefit. Deferred
 * to `load` so it never competes with first paint.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // No worker means no install offer on Android; the app itself is fine.
    });
  });
}

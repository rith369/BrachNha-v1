import { getSupabase, isSupabaseConfigured } from "./supabase";
import { useBrachNhaStore } from "./store";

/**
 * Error reports and usage events, written to our own Supabase project
 * (supabase/migrations/20261001000001_telemetry.sql). No third-party vendor.
 *
 * Both functions are FIRE-AND-FORGET and never throw: reporting a problem must
 * never become a second problem, and an event a student never sees must never
 * delay anything they do. Every failure is swallowed.
 *
 * PRODUCTION ONLY. In development a crash is already on the developer's screen,
 * and dev traffic in the tables would bury the real students' numbers.
 *
 * WHAT IS SENT, AND WHAT IS NOT. An error carries its message, stack, the route
 * (pathname only, no query string) and the browser string. An event carries its
 * name and a few small numbers. Never answers, never KruAI text, never email.
 * src/pages/privacy.tsx says the same and must change with this file.
 *
 * THE LAZY SDK BOUNDARY HOLDS. Both reach the client through getSupabase(), so
 * this module costs the entry chunk nothing. An error report pulls the SDK only
 * when an error actually happens; an event is sent only for a signed-in
 * student, who has loaded the SDK already.
 */

declare const __APP_VERSION__: string;

/** The allow-list, mirrored by log_event() in the migration. Add to both. */
export type AppEvent =
  | "app_open"
  | "sign_up"
  | "survey_done"
  | "lesson_done"
  | "quiz_done"
  | "flashcards_done"
  | "exam_done"
  | "kruai_question"
  | "battle_done";

const ENABLED = import.meta.env.PROD && isSupabaseConfigured;

/** A crash loop must not send a thousand reports from one page load. */
const MAX_ERRORS_PER_LOAD = 10;
const reported = new Set<string>();

function messageOf(err: unknown): { message: string; stack: string } {
  if (err instanceof Error) {
    return { message: `${err.name}: ${err.message}`, stack: err.stack ?? "" };
  }
  return { message: String(err), stack: "" };
}

export function reportError(err: unknown, context?: string): void {
  if (!ENABLED) return;
  const { message, stack } = messageOf(err);
  const text = context ? `[${context}] ${message}` : message;
  if (reported.has(text) || reported.size >= MAX_ERRORS_PER_LOAD) return;
  reported.add(text);

  void (async () => {
    try {
      const db = await getSupabase();
      if (!db) return;
      await db.rpc("log_client_error", {
        p_message: text.slice(0, 500),
        p_stack: stack.slice(0, 4000),
        p_route: window.location.pathname.slice(0, 200),
        p_version: __APP_VERSION__,
        p_ua: navigator.userAgent.slice(0, 300),
      });
    } catch {
      // Swallowed on purpose; see the header.
    }
  })();
}

export function track(
  name: AppEvent,
  props: Record<string, string | number | boolean> = {}
): void {
  if (!ENABLED) return;
  // Signed-in students only: a guest has no account to count against, and
  // log_event() refuses an anonymous caller anyway.
  if (!useBrachNhaStore.getState().authUser) return;

  void (async () => {
    try {
      const db = await getSupabase();
      if (!db) return;
      await db.rpc("log_event", { p_name: name, p_props: props });
    } catch {
      // Swallowed on purpose; see the header.
    }
  })();
}

let installed = false;

/**
 * Catches what no error boundary sees: errors thrown outside React's render
 * (event handlers, timers) and promise rejections nobody handled. Called once,
 * from main.tsx.
 */
export function installGlobalErrorHandlers(): void {
  if (installed || !ENABLED) return;
  installed = true;
  window.addEventListener("error", (e) => {
    // A failed <img> or <script> load also fires "error" on window, with no
    // `error` object; those are not crashes.
    if (e.error) reportError(e.error, "window");
  });
  window.addEventListener("unhandledrejection", (e) => {
    reportError(e.reason, "promise");
  });
}

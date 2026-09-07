import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * The Supabase browser client — lazily imported, and null when unconfigured.
 *
 * ── Why this is a function and not an exported client ──────────────────────
 *
 * @supabase/supabase-js is ~40KB gzipped. A static import here would put all of
 * it in the entry chunk, because AppShell mounts the sync hook on every screen —
 * so every student would download the whole auth + realtime + storage client
 * before anything rendered, to run code that does nothing until after first
 * paint anyway. The entry chunk is 183KB gzipped and was got there deliberately
 * (see the performance section of CLAUDE.md); a 22% rise in the number that
 * decides how long a phone on Cambodian mobile data stares at a blank screen is
 * not a fair price for a background backup.
 *
 * `import type` above is erased at compile time, so it creates no runtime
 * dependency — the only real import is the dynamic one inside getSupabase().
 * This is the same boundary KaTeX, MathLive and three.js already sit behind.
 * CHECK `dist/assets/` STILL HAS ITS OWN SUPABASE CHUNK after touching this
 * file: a stray static `import { createClient }` anywhere undoes it silently.
 *
 * ── Why null is a supported answer ────────────────────────────────────────
 *
 * NOT an error path to tidy away later. The app was built to run entirely out
 * of localStorage and still does: `npm run preview` has no backend, a fork has
 * no .env, and a student on a dead connection has no server. In every one of
 * those cases BrachNha has to work exactly as it did before this file existed.
 * So the rule for every caller is the same — if you get null, do nothing and
 * carry on. Nothing in the UI may depend on it being present.
 *
 * This is the same reasoning that makes the mentor degrade to an "unavailable"
 * notice rather than an error screen when GEMINI_API_KEY is missing.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both env values are present. Read this rather than awaiting the
 *  client where the intent is "is the project wired up" — it answers
 *  synchronously, so an effect can bail before paying for the dynamic import. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise: Promise<SupabaseClient<Database> | null> | null = null;

/** Resolves to the shared client, importing the SDK on first call. Memoised on
 *  the promise, not the resolved value, so two callers racing on startup get
 *  one import and one client rather than two of each. */
export function getSupabase(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);

  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // ON, although nothing redirects into this app YET.
        //
        // This was off, reasoning that anonymous sign-in never puts a session
        // in the URL so parsing location was wasted work. True, and it is also
        // the switch that silently breaks every flow that DOES arrive that way:
        // email confirmation, magic links, password reset and OAuth all hand
        // the session over in the URL, and with this off the link lands on the
        // app and simply does nothing, with no error anywhere to explain it.
        //
        // That includes the one upgrade this whole design is aimed at —
        // updateUser({ email }) converting the anonymous user into a permanent
        // one needs its confirmation link to come back through here.
        //
        // The cost of having it on today is one check of location on load for a
        // case that cannot yet happen. The cost of having it off on the day it
        // can is a debugging session with no symptom to search for.
        detectSessionInUrl: true,
        // Its own key, deliberately separate from the store's "brachnha" key.
        // The session is credentials with an expiry; the store is study data.
        // Clearing one must never be able to take the other with it.
        storageKey: "brachnha-auth",
      },
    })
  );

  return clientPromise;
}

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — " +
      "running local-only. Study data stays in localStorage and syncs nowhere."
  );
}

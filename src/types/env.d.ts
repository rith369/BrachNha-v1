/// <reference types="vite/client" />

/**
 * Typed `import.meta.env` for the two Supabase values.
 *
 * vite/client already declares ImportMetaEnv with a loose index signature, so
 * without this the keys resolve to `any` and a typo in the name typechecks
 * cleanly. Declaring them narrows both to `string | undefined`, which is the
 * honest type — a .env file is not guaranteed to exist, and src/lib/supabase.ts
 * is built around that being a survivable state rather than a crash.
 *
 * Both carry the VITE_ prefix, so both ARE exposed to the browser bundle. That
 * is correct for these two and only these two: the publishable/anon key is
 * designed to be public and is useless without a row level security policy
 * letting it through. GEMINI_API_KEY stays unprefixed for exactly the opposite
 * reason — see CLAUDE.md.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

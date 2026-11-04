import { build } from "vite";
import { DB_PORT, DIST, repoRoot } from "./setup.mjs";

/**
 * The real production build, pointed at the stand-in database. It goes under node_modules
 * so it can never be committed or deployed, and never touches `dist`.
 */
process.env.VITE_SUPABASE_URL = `http://localhost:${DB_PORT}`;
process.env.VITE_SUPABASE_ANON_KEY = "sb_publishable_test";

await build({
  root: repoRoot,
  logLevel: "error",
  build: { outDir: DIST, emptyOutDir: true },
});
console.log("test build ready");

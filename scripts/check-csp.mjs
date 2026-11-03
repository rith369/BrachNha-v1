/**
 * Fails the build if the Content-Security-Policy in vercel.json no longer allows an
 * inline script in the built page.
 *
 * WHY THIS EXISTS. The policy allows the one inline script in index.html (the theme
 * guard that stops a dark-mode flash) by its hash, so editing a single character of
 * that script makes the browser refuse it, with no error anywhere a developer would
 * look. Students would just get the flash. Neither tsc nor oxlint can see this.
 *
 * Runs at the end of `npm run build`.
 *
 *   node scripts/check-csp.mjs [path/to/index.html]
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(process.argv[2] ?? join(root, "dist", "index.html"), "utf8");
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));

const policy = vercel.headers
  ?.flatMap((rule) => rule.headers)
  .find((header) => header.key === "Content-Security-Policy")?.value;
if (!policy) {
  console.error("check-csp: no Content-Security-Policy in vercel.json.");
  process.exit(1);
}

const scriptSrc = policy.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src ")) ?? "";
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

const missing = inline
  .map((body) => `sha256-${createHash("sha256").update(body).digest("base64")}`)
  .filter((hash) => !scriptSrc.includes(`'${hash}'`));

if (missing.length) {
  console.error("check-csp: an inline script in index.html is not allowed by vercel.json.");
  console.error("The browser would refuse it. Put this in script-src in vercel.json:");
  for (const hash of missing) console.error(`  '${hash}'`);
  process.exit(1);
}
console.log(`✓ the Content-Security-Policy allows the ${inline.length} inline script(s) in the page`);

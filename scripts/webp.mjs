// PNG/JPG -> WebP converter.
//
// Dev tooling, not shipped: it lives outside src/ so it never enters the bundle.
// There is no image library in this repo and none was added — Chrome is already
// a dependency through playwright-core (see shots.mjs), and it can decode, crop,
// resize and encode WebP through a canvas. This is the same route the logo raster
// was produced by; see design/README.md.
//
//   node scripts/webp.mjs <input...> [options]
//
//   node scripts/webp.mjs art/math.png                  -> public/subjects/math.webp
//   node scripts/webp.mjs art/*.png                     -> all of them
//   node scripts/webp.mjs art/math.jpg --name physics   -> rename on the way out
//   node scripts/webp.mjs logo.png --width 96 --square --out public/logo
//
// Options:
//   --out DIR      output directory        (default public/subjects)
//   --width N      output width in px      (default 600)
//   --ratio W:H    output aspect ratio     (default 4:3, use --square for 1:1)
//   --square       shorthand for --ratio 1:1
//   --quality N    0..1 WebP quality       (default 0.82)
//   --name NAME    output basename, only valid with a single input
//
// Defaults match the subject cards: 4:3 at 600px is 2x the largest size a card
// ever draws (~300px in the widest desktop column), so it stays crisp at 2x DPI
// without paying for pixels nobody sees. The card uses object-cover, so the crop
// here reproduces what the browser would do anyway rather than fighting it.

import { chromium } from "playwright-core";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

// Anything not a flag and not a flag's value is an input path.
const VALUED = new Set(["out", "width", "ratio", "quality", "name"]);
const inputs = argv.filter((a, i) => {
  if (a.startsWith("--")) return false;
  const prev = argv[i - 1];
  return !(prev?.startsWith("--") && VALUED.has(prev.slice(2)));
});

const OUT = flag("out", "public/subjects");
const WIDTH = Number(flag("width", 600));
const QUALITY = Number(flag("quality", 0.82));
const NAME = flag("name", null);
const RATIO = has("square") ? "1:1" : flag("ratio", "4:3");

const [rw, rh] = RATIO.split(":").map(Number);
if (!rw || !rh) {
  console.error(`Bad --ratio "${RATIO}". Expected W:H, e.g. 4:3`);
  process.exit(1);
}
const HEIGHT = Math.round((WIDTH * rh) / rw);

if (!inputs.length) {
  console.error("No input files.\n\n  node scripts/webp.mjs <input...> [--out DIR] [--width N] [--ratio W:H] [--quality N]");
  process.exit(1);
}
if (NAME && inputs.length > 1) {
  console.error("--name only works with a single input file.");
  process.exit(1);
}

/**
 * Runs inside the page. Draws the source into a canvas with object-cover
 * framing — scale to fill, centre, crop the overflow — then encodes WebP.
 */
const ENCODE = async ({ dataUrl, w, h, quality }) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";

  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

  return canvas.toDataURL("image/webp", quality);
};

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

// Same resolution as shots.mjs: drive the Chrome already installed on this
// machine rather than downloading a browser.
const exe = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!exe) {
  console.error("No Chrome/Edge found. Looked in:\n  " + CHROME_CANDIDATES.join("\n  "));
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
await mkdir(OUT, { recursive: true });

let failed = 0;
let overBudget = 0;

for (const input of inputs) {
  const ext = path.extname(input).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    console.error(`SKIP ${input} — unsupported type "${ext}"`);
    failed++;
    continue;
  }

  let buf;
  try {
    buf = await readFile(input);
  } catch {
    console.error(`SKIP ${input} — cannot read`);
    failed++;
    continue;
  }

  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  const encoded = await page.evaluate(ENCODE, {
    dataUrl,
    w: WIDTH,
    h: HEIGHT,
    quality: QUALITY,
  });

  const out = path.join(OUT, `${NAME ?? path.basename(input, ext)}.webp`);
  const bytes = Buffer.from(encoded.split(",")[1], "base64");
  await writeFile(out, bytes);

  // 40 KB is the budget recorded in public/subjects/README.md. Warn rather than
  // fail — a deliberately detailed illustration may justify going over, but it
  // should be a decision rather than an accident.
  const warn = bytes.length > 40 * 1024;
  if (warn) overBudget++;
  console.log(
    `${warn ? "!" : "✓"} ${out}  ${kb(buf.length)} -> ${kb(bytes.length)}` +
      `  (${WIDTH}x${HEIGHT})${warn ? "  OVER 40 KB — lower --quality or --width" : ""}`
  );
}

await browser.close();

if (overBudget) {
  console.log(`\n${overBudget} file(s) over the 40 KB budget.`);
}
process.exit(failed ? 1 : 0);

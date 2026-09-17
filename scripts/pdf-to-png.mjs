// Textbook PDF → one PNG per page, the first step of the OCR pipeline.
//
// Dev tooling, outside src/ so it never bundles — same as webp.mjs and
// ocr-pages.mjs. Input and output both live in the git-ignored sources/.
//
//   node scripts/pdf-to-png.mjs sources/textbooks/biology_book.pdf
//   node scripts/pdf-to-png.mjs sources/textbooks/biology_book.pdf --pages 5,7,24 --out sources/samples/biology-png
//
// WHY IMAGES AND NOT THE PDF ITSELF — measured, 18 Sep 2026, not assumed.
// These books carry a text layer set in pre-Unicode Khmer fonts, so their
// embedded text is Latin gibberish. Handed the PDF, Gemini reads that layer as
// well as the picture and is misled by it: on the same 10 sample pages, BOTH
// models misread question 1 of page 24 from the PDF and BOTH read it correctly
// from a PNG of the very same page. Rendering first throws the bad text layer
// away, which is the whole point.
//
// Chrome does the rendering, through the playwright-core browser that
// scripts/shots.mjs already drives — the same "no new image tooling" rule
// webp.mjs follows. pdf.js is a devDependency because a PDF renderer is the one
// piece Chrome does not hand us; it never reaches the app bundle.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const SRC = args.find((a) => !a.startsWith("--") && a !== flag("out") && a !== flag("pages") && a !== flag("width"));
// 1600px across is ~2x the printed page: enough that a coeng (the subscript
// consonant hanging under a letter) survives, without paying for pixels the
// model downsamples away.
const WIDTH = Number(flag("width", "1600"));
const OUT = flag("out", "");
/** "5,7,24" or "10-20", or every page when absent. */
const PAGES = flag("pages", "");

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

if (!SRC || !fs.existsSync(SRC)) {
  console.error("Usage: node scripts/pdf-to-png.mjs <file.pdf> [--pages 5,7,24] [--out dir] [--width 1600]");
  process.exit(1);
}
const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!exe) {
  console.error("No Chrome/Edge found. Looked in:\n  " + CHROME_CANDIDATES.join("\n  "));
  process.exit(1);
}

const outDir = OUT || path.join("sources/pages", path.basename(SRC, ".pdf"));
fs.mkdirSync(outDir, { recursive: true });

function wanted(total) {
  if (!PAGES) return Array.from({ length: total }, (_, i) => i + 1);
  const out = new Set();
  for (const part of PAGES.split(",")) {
    const [a, b] = part.split("-").map(Number);
    for (let p = a; p <= (b || a); p++) if (p >= 1 && p <= total) out.add(p);
  }
  return [...out].sort((x, y) => x - y);
}

// pdf.js is an ES module, and a browser refuses to load one over file:// — so
// the package folder is served over localhost for the length of the run.
const pdfjsDir = path.dirname(require.resolve("pdfjs-dist/build/pdf.mjs"));
const PAGE_HTML = `<!doctype html><meta charset="utf-8"><body><script type="module">
import * as pdfjs from "/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
let doc;
// Fetched by URL, never handed over as an array: a 79MB book crosses the
// Node→browser bridge as ~79 million JSON numbers and kills the tab.
window.openPdf = async (url) => {
  doc = await pdfjs.getDocument({ url }).promise;
  return doc.numPages;
};
window.renderPage = async (n, targetWidth) => {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: targetWidth / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  // Scanned-looking pages can be transparent; a white ground keeps the JPEG-ish
  // look the model expects and stops black-on-black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
};
window.ready = true;
</script></body>`;

const server = http.createServer((req, res) => {
  const url = decodeURI(req.url.split("?")[0]);
  if (url === "/") {
    res.writeHead(200, { "content-type": "text/html" }).end(PAGE_HTML);
    return;
  }
  if (url === "/book.pdf") {
    res.writeHead(200, {
      "content-type": "application/pdf",
      "content-length": fs.statSync(SRC).size,
    });
    fs.createReadStream(SRC).pipe(res);
    return;
  }
  const file = path.join(pdfjsDir, path.basename(url));
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": "text/javascript" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("render error:", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(() => window.ready);

const total = await page.evaluate((url) => window.openPdf(url), "/book.pdf");
const pages = wanted(total);
console.log(`${path.basename(SRC)}: ${total} pages, rendering ${pages.length} at ${WIDTH}px → ${outDir}`);

const pad = String(total).length;
for (const n of pages) {
  const file = path.join(outDir, `p${String(n).padStart(pad, "0")}.png`);
  if (fs.existsSync(file)) continue; // resumable, like ocr-pages.mjs
  const dataUrl = await page.evaluate(([n, w]) => window.renderPage(n, w), [n, WIDTH]);
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  if (n % 25 === 0 || n === pages.at(-1)) console.log(`  ${path.basename(file)}`);
}

await browser.close();
server.close();

// Textbook OCR: send single-page PDFs to Gemini and save what it reads.
//
// Dev tooling, outside src/ so it never bundles — same as webp.mjs. It reads the
// git-ignored sources/ folder and writes back into it; nothing here is fed to
// students until a Khmer reader has checked it (see "The textbook pipeline" in
// CLAUDE.md).
//
// Why OCR at all: the Grade 12 PDFs DO have a text layer, but it is set in
// pre-Unicode Khmer fonts, so extracting it yields Latin gibberish
// ("CMBUk 3 t®m¨vepßg@rbs'sarBagkay" for ជំពូក ៣ …), and the body text mixes
// more than one legacy font, so no single mapping table converts it reliably.
//
//   node scripts/ocr-pages.mjs --model gemini-3-flash-preview
//   node scripts/ocr-pages.mjs --model gemini-3.6-flash --in sources/samples/biology
//
// It is RESUMABLE: a page whose output file already exists is skipped. That is
// what makes the free tier usable at all (~20 requests/day, ~5/min) — run it
// again the next day and it carries on where the quota stopped it.
//
// Every request is logged with its token counts to usage.jsonl beside the
// output, so the real cost of a page can be measured instead of estimated.

import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const MODEL = flag("model", "gemini-3-flash-preview");
const IN_DIR = flag("in", "sources/samples/biology");
const OUT_DIR = flag("out", path.join("sources/ocr", path.basename(IN_DIR), MODEL));
// 13s keeps a run under the free tier's ~5 requests/minute. Pass --delay 0 once
// billing is on.
const DELAY_MS = Number(flag("delay", "13000"));
const LIMIT = Number(flag("limit", "Infinity"));
const THINKING = flag("thinking", "low");
// Only used for images. "high" is worth it here: the pages are dense Khmer at
// 8pt, and a coeng (the subscript consonant under a letter) is a few pixels.
const RESOLUTION = flag("resolution", "high");
/** "6-25" or "5,7,24", or every page when absent. */
const PAGES = flag("pages", "");

/**
 * PDF or image, and the choice is not cosmetic.
 *
 * A page of this book carries a text layer set in pre-Unicode Khmer fonts, so
 * its embedded text is Latin gibberish. Sent as a PDF, the model sees that
 * layer AND the picture; sent as a PNG rendered from the same page, it can only
 * read what is printed. Both are measured before the full run — see the
 * textbook pipeline in CLAUDE.md.
 */
function contentBlock(file, bytes) {
  const data = bytes.toString("base64");
  return file.endsWith(".pdf")
    ? { type: "document", mime_type: "application/pdf", data }
    : {
        type: "image",
        mime_type: file.endsWith(".png") ? "image/png" : "image/jpeg",
        resolution: RESOLUTION,
        data,
      };
}

/** Same unprefixed key the chat endpoint uses, read from .env / .env.local. */
function readKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    const m = fs.readFileSync(file, "utf8").match(/^GEMINI_API_KEY=(.*)$/m);
    const key = m?.[1].trim().replace(/^["']|["']$/g, "");
    if (key) return key;
  }
  return "";
}

// The instructions are in English on purpose: they describe a transcription
// task, and the output language is fixed by the page itself, not by the prompt.
const PROMPT = `You are transcribing one page of a Cambodian Grade 12 biology textbook, written in Khmer.

Transcribe EXACTLY what is printed. Do not summarise, translate, correct, reorder or add anything.

Output Markdown only, with no preamble and no closing remark:
- Khmer text as Unicode Khmer, exactly as printed. Write EVERY number with Arabic digits (0-9), even where the page prints a Khmer numeral: the app renders every number in Latin digits, so converting here is what keeps transcribed content compliant the day it becomes app content. A Khmer reader checking this text against the page reads a digit either way.
- Keep Latin words (scientific names, English terms in brackets) exactly as printed.
- Headings as Markdown headings (#, ##, ###) following the page's own hierarchy (chapter, lesson, section, sub-section).
- Numbered and lettered lists as lists, keeping the printed numbering and letters (ក. ខ. គ. / A. B. C. D.).
- Tables as Markdown tables.
- Formulas that are printed as ONE LINE of text (e.g. $\\mathrm{C_6H_{12}O_6}$, $pH = 7$) in LaTeX between single dollar signs. NEVER put Khmer text inside dollar signs.
- A DRAWN structure — a molecule with bonds going up, down or sideways, a chemical equation drawn with arrows over two lines, a graph — is a figure, NOT a formula. Never try to reproduce its layout in LaTeX. Write [រូបភាព: <its printed name or caption>] and then, on their own lines, any labels printed on it. (Measured: attempting LaTeX for the 20 amino-acid structures on one page produced unreadable output that no reader could check.)
- For each photograph or diagram, the same: one line [រូបភាព: <its printed caption, if any>] and then its printed labels, exactly as printed.
- If a word is genuinely unreadable, write [?] in its place. Never guess a Khmer word.
- Omit running page headers, footers and page numbers.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = readKey();
if (!key) {
  console.error("No GEMINI_API_KEY in the environment, .env.local or .env.");
  process.exit(1);
}
if (!fs.existsSync(IN_DIR)) {
  console.error(`No input folder: ${IN_DIR}`);
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });
fs.mkdirSync(OUT_DIR, { recursive: true });
const usageLog = path.join(OUT_DIR, "usage.jsonl");

const SOURCE = /\.(pdf|png|jpg|jpeg)$/i;
const mdName = (f) => f.replace(SOURCE, ".md");
function wantedPages() {
  if (!PAGES) return null;
  const out = new Set();
  for (const part of PAGES.split(",")) {
    const [a, b] = part.split("-").map(Number);
    for (let p = a; p <= (b || a); p++) out.add(p);
  }
  return out;
}

const wanted = wantedPages();
const pages = fs
  .readdirSync(IN_DIR)
  .filter((f) => {
    if (!SOURCE.test(f)) return false;
    if (!wanted) return true;
    const m = f.match(/\d+/);
    return m ? wanted.has(Number(m[0])) : true;
  })
  .sort();
const todo = pages.filter((f) => !fs.existsSync(path.join(OUT_DIR, mdName(f))));

console.log(`${MODEL}: ${pages.length} pages, ${pages.length - todo.length} already done, ${todo.length} to go`);

let sent = 0;
for (const file of todo) {
  if (sent >= LIMIT) break;
  if (sent > 0 && DELAY_MS > 0) await sleep(DELAY_MS);
  sent++;

  const started = Date.now();
  try {
    const result = await ai.interactions.create({
      model: MODEL,
      // Textbook pages, not student data — but there is still no reason for
      // Google to keep a copy.
      store: false,
      generation_config: { thinking_level: THINKING, max_output_tokens: 8192 },
      input: [
        { type: "text", text: PROMPT },
        contentBlock(file, fs.readFileSync(path.join(IN_DIR, file))),
      ],
    });

    const text = result.output_text ?? "";
    fs.writeFileSync(path.join(OUT_DIR, mdName(file)), text);
    const usage = result.usage ?? {};
    fs.appendFileSync(
      usageLog,
      JSON.stringify({
        page: file,
        model: MODEL,
        ms: Date.now() - started,
        input: usage.total_input_tokens,
        output: usage.total_output_tokens,
        thought: usage.total_thought_tokens,
        chars: text.length,
      }) + "\n"
    );
    console.log(`  ${file}: ${text.length} chars, ${usage.total_input_tokens} in / ${usage.total_output_tokens} out`);
  } catch (err) {
    const msg = String(err?.message ?? err);
    // Quota is the routine failure on the free tier, not an error worth a
    // stack trace: stop, and the next run resumes from here.
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
      console.log(`  ${file}: quota reached — stopping. Run again later to resume.`);
      break;
    }
    console.error(`  ${file}: failed — ${msg.slice(0, 300)}`);
  }
}

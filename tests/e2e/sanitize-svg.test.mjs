// The SVG sanitiser in a real browser, because the bypasses live in the gap between
// the XML parser it uses and the HTML parser that `dangerouslySetInnerHTML` uses, and
// only a browser has both. Needs no build and no server: it loads src/utils/sanitize-svg.ts
// into a blank page. Security audit, 6 Nov 2026.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { chromium } from "playwright-core";
import { content, contentItems, findChrome, repoRoot } from "./setup.mjs";

let browser;
let page;

before(async () => {
  const source = readFileSync(join(repoRoot, "src", "utils", "sanitize-svg.ts"), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  page = await browser.newPage();
  await page.goto("about:blank");
  await page.addScriptTag({ type: "module", content: `${js}\nwindow.sanitizeSvg = sanitizeSvg;` });
  await page.waitForFunction(() => typeof window.sanitizeSvg === "function");
});

after(async () => {
  await browser?.close();
});

/** Sanitise, then render the way MathText does, and report what came alive. */
function render(raw) {
  return page.evaluate((input) => {
    const out = window.sanitizeSvg(input);
    const host = document.createElement("template");
    host.innerHTML = out;
    const all = Array.from(host.content.querySelectorAll("*"));
    return {
      out,
      foreign: all.filter((el) => el.namespaceURI !== "http://www.w3.org/2000/svg").map((el) => el.localName),
      tags: all.map((el) => el.localName),
      attrs: all.flatMap((el) => Array.from(el.attributes, (a) => a.name)),
    };
  }, raw);
}

const SVG = (inner, attrs = "") => `<svg xmlns="http://www.w3.org/2000/svg"${attrs}>${inner}</svg>`;

const ESCAPES = {
  "processing instruction": SVG(`<?x ><img src=x onerror=alert(1)>?>`),
  "comment closed early by HTML": SVG(`<!--><img src=x onerror=alert(1)>-->`),
  "comment closed early, dash form": SVG(`<!---><img src=x onerror=alert(1)>-->`),
  "comment with markup inside": SVG(`<!-- ><img src=x onerror=alert(1)> -->`),
  "CDATA in text": SVG(`<text><![CDATA[ ><img src=x onerror=alert(1)> ]]></text>`),
  "CDATA inside title": SVG(`<title><![CDATA[</title><img src=x onerror=alert(1)>]]></title>`),
  "XHTML element named like an allowed tag": SVG(`<title xmlns="http://www.w3.org/1999/xhtml"><img src=x onerror=alert(1)/></title>`),
  "onload on the root": SVG(`<circle r="1"/>`, ` onload="alert(1)"`),
  "script": SVG(`<script>alert(1)</script>`),
  "foreignObject": SVG(`<foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><img src="x" onerror="alert(1)"/></body></foreignObject>`),
  "javascript link": SVG(`<a href="javascript:alert(1)"><text>x</text></a>`),
  "animate rewriting an href": SVG(`<animate attributeName="href" to="javascript:alert(1)"/>`),
  "use": SVG(`<use href="data:image/svg+xml,&lt;svg onload=alert(1)&gt;"/>`),
  "remote url in fill": SVG(`<rect fill="url(https://evil.example/x)"/>`),
  "style with url": SVG(`<rect style="fill:url(https://evil.example/x)"/>`),
  "event handler on a child": SVG(`<circle r="1" onmouseover="alert(1)"/>`),
};

for (const [name, raw] of Object.entries(ESCAPES)) {
  test(`nothing escapes the drawing: ${name}`, async () => {
    const r = await render(raw);
    assert.deepEqual(r.foreign, [], `HTML elements came alive: ${r.out}`);
    assert.ok(!r.attrs.some((a) => /^on/i.test(a) || /href/i.test(a)), `kept ${r.attrs.join(",")}: ${r.out}`);
    assert.ok(!r.tags.some((t) => ["script", "foreignobject", "a", "use", "animate", "set", "image"].includes(t)), r.out);
    assert.ok(!/evil\.example/.test(r.out), r.out);
  });
}

test("an author's note in a comment is kept", async () => {
  const r = await render(SVG(`<!-- Shaded Area S for x in [0, 1] --><circle r="1"/>`));
  assert.match(r.out, /<!-- Shaded Area S for x in \[0, 1\] -->/);
  assert.deepEqual(r.tags, ["svg", "circle"]);
});

test("every authored diagram in the content comes through unchanged", async () => {
  const found = [];
  const walk = (v) => {
    if (typeof v === "string") found.push(...(v.match(/<svg[\s\S]*?<\/svg>/g) ?? []));
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  for (const item of contentItems()) walk(content(item.kind, item.key));
  assert.ok(found.length > 0, "the fixture has no diagrams to check");

  // The same comparison the admin editor makes (utils/content-check.ts checkSvg).
  const changed = await page.evaluate((parts) => {
    return parts.filter((part) => {
      const root = new DOMParser().parseFromString(part, "image/svg+xml").documentElement;
      return window.sanitizeSvg(part) !== new XMLSerializer().serializeToString(root);
    });
  }, found);
  assert.deepEqual(changed, []);
});

/**
 * Makes an SVG string safe to put through `dangerouslySetInnerHTML`.
 *
 * WHY THIS EXISTS: `MathText` renders `<svg>…</svg>` blocks raw so an authored
 * paper can draw a graph (the 2025 maths paper). But `MathText` also renders
 * text that ANOTHER STUDENT wrote — a Game competition's questions are frozen on
 * a world-readable row by the creator's own device — and stripping `<script>`
 * was the only guard. An SVG runs JavaScript without one (`onload`, an `<a>`
 * with a `javascript:` href, `<animate>` rewriting an href, `<foreignObject>`
 * carrying HTML), and the Supabase session sits in localStorage, so one posted
 * competition could have signed in as everyone who played it.
 *
 * ALLOWLIST, NEVER A BLOCKLIST. Everything not named below is dropped: an
 * unknown element is removed WITH its children, an unknown attribute is
 * removed. A blocklist has to know every trick; an allowlist only has to know
 * what a diagram needs. If a new diagram needs a tag or attribute that is not
 * here, add it — after checking it can neither run code nor fetch anything.
 *
 * Deliberately absent: script, style, a, use, image, foreignObject, animate,
 * set, animateTransform, iframe, and every attribute starting with "on" or
 * naming an href. `url(...)` is allowed only as a same-document reference
 * (`url(#arrow)`), which is how markers attach; anything else could fetch.
 */

const ALLOWED_TAGS = new Set([
  "svg",
  "g",
  "defs",
  "marker",
  "path",
  "line",
  "polyline",
  "polygon",
  "circle",
  "ellipse",
  "rect",
  "text",
  "tspan",
  "title",
  "desc",
]);

const ALLOWED_ATTRS = new Set([
  "viewBox",
  "width",
  "height",
  "style",
  "id",
  "preserveAspectRatio",
  "refX",
  "refY",
  "markerWidth",
  "markerHeight",
  "markerUnits",
  "orient",
  "d",
  "points",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "dx",
  "dy",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "transform",
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "marker-start",
  "marker-mid",
  "marker-end",
  "font-size",
  "font-weight",
  "font-family",
  "font-style",
  "text-anchor",
  "dominant-baseline",
]);

const LOCAL_URL = /^url\(#[\w-]+\)$/;

function safeValue(name: string, value: string): boolean {
  const v = value.toLowerCase();
  if (v.includes("javascript:") || v.includes("expression(") || v.includes("<")) {
    return false;
  }
  if (v.includes("url(")) return LOCAL_URL.test(value.trim());
  // `style` may size the drawing and nothing else: no parentheses means no
  // url(), no expression(), no image-set() — nothing that can load a resource.
  if (name === "style") return /^[\w\s:;.,%#-]*$/.test(value);
  return true;
}

function clean(el: Element): void {
  for (const attr of Array.from(el.attributes)) {
    // A namespaced attribute (xlink:href, xml:base) is never needed for a drawing.
    const allowed =
      attr.namespaceURI === null &&
      ALLOWED_ATTRS.has(attr.name) &&
      safeValue(attr.name, attr.value);
    if (!allowed) el.removeAttribute(attr.name);
  }
  for (const child of Array.from(el.children)) {
    if (ALLOWED_TAGS.has(child.localName)) clean(child);
    else child.remove();
  }
}

/** Returns a sanitised copy of `raw`, or "" if it is not a well-formed SVG. */
export function sanitizeSvg(raw: string): string {
  // MathText only ever runs in the browser; without a parser, render nothing
  // rather than trust the input.
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return "";
  }
  const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
  const root = doc.documentElement;
  if (root.localName !== "svg" || doc.getElementsByTagName("parsererror").length) {
    return "";
  }
  clean(root);
  return new XMLSerializer().serializeToString(root);
}

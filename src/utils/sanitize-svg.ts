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
 *
 * NODES THAT ARE NOT ELEMENTS ARE THE OTHER HALF (security audit, 6 Nov 2026).
 * The string is parsed as XML but rendered by the HTML parser, and the two read
 * some nodes differently. `<?x ><img src=x onerror=…>?>` is one processing
 * instruction to XML; HTML ends it at the first `>`, and the `<img>` after it
 * breaks out of the SVG as a live HTML element. `<!--><img …>-->` is one comment
 * to XML; HTML closes `<!-->` at once, with the same result. Both were measured
 * in Chrome passing through the old version, which only walked `children`.
 * So: a processing instruction is dropped, CDATA becomes plain text, and a
 * comment is kept only with no `<` or `>` in it (authored diagrams carry notes
 * like `<!-- Shaded Area S -->`, which the editor's check must still see
 * unchanged). Then the result is parsed the HTML way, inertly, and refused
 * outright if any element came out anywhere but the SVG namespace, so a trick
 * not listed here fails closed instead of rendering.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

// Node.nodeType values, as numbers so this file needs no DOM globals to load.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;

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
  // childNodes, not children: `children` skips every node that is not an
  // element, and those are exactly the ones the HTML parser reads differently.
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === ELEMENT_NODE) {
      const child = node as Element;
      // No namespace is how an authored diagram without xmlns parses; any
      // other namespace (an XHTML `title`, say) is not part of a drawing.
      const svgNs = child.namespaceURI === SVG_NS || child.namespaceURI === null;
      if (svgNs && ALLOWED_TAGS.has(child.localName)) clean(child);
      else child.remove();
    } else if (node.nodeType === TEXT_NODE) {
      // Serialised escaped, so it can only ever be text.
    } else if (node.nodeType === CDATA_SECTION_NODE) {
      node.parentNode?.replaceChild(
        el.ownerDocument.createTextNode(node.nodeValue ?? ""),
        node
      );
    } else if (node.nodeType === COMMENT_NODE && !/[<>]/.test(node.nodeValue ?? "")) {
      // An author's note. Without `<` or `>` it cannot open or close anything.
    } else {
      // Processing instructions, and any comment that could break out.
      node.parentNode?.removeChild(node);
    }
  }
}

/**
 * True when `markup`, parsed the way `dangerouslySetInnerHTML` will parse it,
 * gives only SVG elements. A template's content is inert: nothing in it loads
 * or runs while it is checked.
 */
function onlySvgElements(markup: string): boolean {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("template");
  probe.innerHTML = markup;
  return Array.from(probe.content.querySelectorAll("*")).every(
    (el) => el.namespaceURI === SVG_NS
  );
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
  // The root goes through the same namespace test as its children.
  if (root.namespaceURI !== SVG_NS && root.namespaceURI !== null) return "";
  clean(root);
  const out = new XMLSerializer().serializeToString(root);
  return onlySvgElements(out) ? out : "";
}

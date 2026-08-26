# design/

Master artwork. **Nothing in here is served or bundled** — it is deliberately
outside `public/` so it never reaches the deploy. `public/` is for
URL-referenced assets (see CLAUDE.md's directory rules), and these are sources.

## `brachnha-logo.source.svg`

The logo as originally supplied: an app-icon tile, 960×984, with an opaque white
background baked in as the outermost path, and **426 auto-traced paths** —
431 KB, or 169 KB gzipped.

It is displayed at 40px. At that size the trace is invisible and the file was
costing more than half as much as the entire JavaScript bundle, on an audience
that is largely on Cambodian mobile data. It is now shipped as a raster:

| file | size |
| --- | --- |
| `design/brachnha-logo.source.svg` (this, unshipped) | 431 KB |
| `public/logo/brachnha.webp` (shipped) | **4.6 KB** |
| `public/logo/brachnha.png` (shipped, fallback) | 10.4 KB |

### Regenerating the raster

96×96 — 2.4× the 40px display size, so it stays crisp at 2× and 3× DPI. The
square crop reproduces the `object-cover` in `components/shell/wordmark.tsx`.

There is no image tooling in this repo and none was added: Chrome is already a
dependency via `playwright-core` (see `scripts/shots.mjs`), and it can both
rasterise the SVG and encode WebP through `canvas.toDataURL`. If the artwork
changes, re-render at 96×96 with `object-cover` framing and quality ~0.92, and
keep both output formats — `wordmark.tsx` uses a `<picture>`.

`public/favicon.ico` is a **different, older** icon that does not come from this
file, and was left alone.

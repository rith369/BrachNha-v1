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

### Home-screen icons

`public/icons/` (the web app manifest's 192/512/maskable icons and iOS's
`apple-touch-icon.png`) are rendered from this same file by
`node scripts/app-icons.mjs`, through the same Chrome route. It removes the
tile's baked-in grey edge and shadow, because phones round the icon themselves;
see the script's header. Re-run it whenever the artwork changes.

`public/favicon.ico` (the browser tab icon, 16/32/48px) is rendered from this
file by the same script, cropped tighter so the drawing fills a 16px square.
It was a different, older icon until 27 Oct 2026.

## `brain.source.glb`

The 3D brain as supplied: 3.8 MB, 112,000 triangles, nothing compressed. What ships is
`public/models/brain.glb`, 861 KB, with the same triangles and the same part names, which
`data/brain-labels.ts` looks up by name.

| file | size |
| --- | --- |
| `design/brain.source.glb` (this, unshipped) | 3.8 MB |
| `public/models/brain.glb` (shipped) | **861 KB** |

### Regenerating it

With `@gltf-transform/cli` 4, in this order, keeping the intermediate file out of the repo:

```bash
gltf-transform webp design/brain.source.glb a.glb --quality 80
gltf-transform meshopt a.glb public/models/brain.glb --level high
```

**Never use its `optimize` command here:** it joins meshes, and the labels need each part
to stay its own named mesh. **Never use `resize` either:** the words on the model are a 2048×4098
image, and shrinking it broke them up, for a saving of about 75 KB. Compare zoomed in after any change. `useGLTF` decodes this by itself, using WebAssembly, which is why
the Content-Security-Policy in `vercel.json` has `'wasm-unsafe-eval'`. If you change the size
much, change `DOWNLOAD_SIZE` in `section-model.tsx`, which tells students what a tap costs.

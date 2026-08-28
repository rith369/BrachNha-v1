# Subject artwork

How the Study page's subject illustrations are produced and where they go.

This file lives in `design/` rather than next to the images themselves, because
anything inside `public/` is **served** — a README sitting there ships to
production and is publicly reachable at `/subjects/README.md`. `design/` is for
sources and documentation, `public/` is for what students download. See the
directory rules in `CLAUDE.md`.

## Where the files go

`public/subjects/`, one **WebP** per subject. Drop them in and they appear on the
Study page automatically — no code change, no import to add.

The filename must match the subject `id` in `src/features/lessons/subjects.ts`:

    math.webp      physics.webp   chemistry.webp   biology.webp
    history.webp   khmer.webp     english.webp     french.webp

**Lowercase, exactly.** The name is the only wiring between a file and a card.
`Math.webp` will not be found, and it fails *silently* — the card keeps its
placeholder rather than showing a broken image, so a capitalisation slip looks
like "the image just didn't work".

`french` and `english` are alternatives: only the language chosen at sign-up ever
renders, so supplying just the one in use is fine.

**WebP only — no PNG fallback.** Roughly 99% of handsets have supported WebP for
years (Android Chrome since 2014, iOS Safari since 14), and anything older keeps
the placeholder, which is a designed state rather than a broken one. This differs
from the logo, which *does* ship a `<picture>` + PNG pair — that is one image on
every screen where a second file is cheap insurance; here it would mean
maintaining sixteen files instead of eight.

## Converting artwork

Source art arrives as PNG or JPG. Convert it with `scripts/webp.mjs`:

```bash
# one file
node scripts/webp.mjs art/math.png

# a whole folder at once
node scripts/webp.mjs art/*.png

# source named differently from the subject id
node scripts/webp.mjs art/algebra.jpg --name math

# squeeze one that came out too big
node scripts/webp.mjs art/biology.png --quality 0.7
```

Output lands in `public/subjects/` at 600x450, already cropped 4:3. The script
prints the before/after size of every file and warns when one lands over 40 KB.
Re-running overwrites in place, so iterating on `--quality` is free.

It adds no dependency — it drives the Chrome that `playwright-core` already
provides for `scripts/shots.mjs`, the same route the logo raster was made by (see
`design/README.md`). `--square --width 96` reproduces that logo raster.

## Size

- **Aspect ratio 4:3.** The slot is `aspect-[4/3]` with `object-cover`, so
  anything else is cropped rather than letter-boxed. The script crops centred —
  check the result when the art has something important near an edge, and
  pre-crop the source if so.
- **600px wide is plenty** — already 2x the largest size it is ever drawn at
  (~300px in the widest desktop column, ~144px on a phone).
- **Target 40 KB or less per file.**

That last number is not arbitrary. The app logo arrived as 431 KB of auto-traced
paths for something rendered at 40px, and shrinking it to 4.6 KB was a large part
of cutting first paint from 487 KB to 183 KB. Eight subject images at stock-art
weight would undo that on an audience paying for Cambodian mobile data.

## Licensing — READ BEFORE CHANGING THE ARTWORK

The current set is **Freepik free-licence**. That licence grants the right to use
these images **only on condition of a visible credit**, so the attribution line at
the bottom of `src/features/profile/components/profile-view.tsx` is what makes the
whole set legal. It is not decoration, and it must not be tidied away.

    រូបភាព៖ Designed by Freepik   →   https://www.freepik.com

The string and the link target are the licence's own wording; only the small label
in front of them is ours and follows the app's language.

**The line can be removed only if the artwork changes.** Two routes:

- Re-download the same images under a **Freepik premium** subscription. The
  premium licence in these ZIPs requires no attribution, and it attaches to the
  download, so one month of subscription permanently licenses whatever is fetched
  during it.
- Replace them with **attribution-free** art — unDraw, Pixabay and Pexels all
  permit commercial use with no credit.

### Provenance

| file | source | notes |
| --- | --- | --- |
| math, physics, chemistry, biology, history, english | Freepik ZIPs | clean, no watermark |
| french | Freepik ZIP (2015 resource) | **watermarked source** — see below |
| khmer | loose `khmer.jpg` | origin unconfirmed; verify before relying on it |

**`french`'s source JPEG has "designed by freepik.com" burned into the bottom
edge** — older Freepik resources shipped that way. The 4:3 centre crop of that
square source removes it, which is luck rather than design: re-crop it at a
different ratio and the watermark comes back. The ZIP's `.ai`/`.eps` are the clean
vectors if a different framing is ever needed.

That French image is also a *card template* rather than a subject illustration —
it carries Lorem ipsum dummy text and reads as Paris tourism rather than language
study. Illegible at card size, but worth replacing if the French path ever matters.

## Until the files exist

Nothing breaks. Each card falls back to a designed placeholder — a gradient in
the subject's own colour with its Lucide icon centred — so the page looks
finished with `public/subjects/` empty, which is its state today. The `<img>`
hides itself via `onError`, which is what stops a missing file painting a
broken-image glyph over the gradient.

`scripts/webp.mjs` creates `public/subjects/` if it is missing, so the empty
directory does not need to be kept in git.

## Section video posters — `public/sections/`

A second, separate set: the poster frame behind each section's video player. Named
by SECTION ID (`biology-3-1-1.webp`), so a section's poster is findable from its id
with no lookup table, exactly as the subject art is named by subject id.

**16:9 at 800px, not the subject cards' 4:3 at 600px.** A video is 16:9 by
convention and the player renders the poster at up to ~720px wide inside
`FocusLayout`'s `max-w-3xl` column, so 600px would be soft on a laptop:

```bash
node scripts/webp.mjs poster.jpg --name biology-3-1-1 --out public/sections --ratio 16:9 --width 800
```

| file | source | licence |
| --- | --- | --- |
| `biology-3-1-1.webp` | `flat-design-biotechnology-concept-illustrated.zip` → `5178591.jpg` (3000×2000) | Freepik free |

Freepik free again, so the **existing credit line on the Profile page already
covers it** — one line covers every Freepik image regardless of count, so no
attribution change was needed. Note the 3:2 source is cropped to 16:9, which
trims the top and bottom; check the framing when adding a poster whose subject
sits near an edge.

**There is no video file.** `SectionVideoPlayer` draws the player chrome around
the poster; nothing in it is interactive — see the comment there.

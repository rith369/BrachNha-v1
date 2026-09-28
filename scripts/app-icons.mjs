// Home-screen icons for the web app manifest, rendered from the master logo.
//
// Dev tooling, not shipped. Same route as scripts/webp.mjs and the 96px logo
// raster (design/README.md): drive the Chrome playwright-core already finds,
// rasterise the SVG in a canvas, and write PNG. No image library was added.
//
//   node scripts/app-icons.mjs
//
// Writes to public/icons/:
//   icon-192.png, icon-512.png   purpose "any"      — the tile, cropped square
//   maskable-512.png             purpose "maskable" — logo shrunk into the safe
//                                                     zone on a white ground
//   apple-touch-icon.png (180)   iOS home screen, which ignores the manifest
//
// PNG, not WebP: install surfaces (Android's launcher, iOS's springboard) are
// the one place format support is not the browser's, and PNG is what every one
// of them documents.
//
// THE SOURCE'S OWN TILE IS REMOVED. The artwork is an app-icon tile with
// rounded corners and a grey drop shadow baked in. Every launcher rounds or
// masks the icon itself, so shipping that tile draws a rounded square inside a
// rounded square with grey corners showing. Cropping can't avoid it without
// also clipping the drawing, so the render whitens every LOW-CHROMA pixel
// instead: the drawing is entirely saturated blue/green/orange and the tile's
// edge and shadow are neutral grey, so the two separate cleanly.
//
// MASKABLE needs its own render. Android crops a maskable icon to whatever shape
// the launcher uses (circle, squircle…), and only the centre 80% circle is
// guaranteed to survive. Drawing the full tile there would clip the mortarboard.
// The artwork's own background is white, so padding with white is seamless.

import { chromium } from "playwright-core";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const SOURCE = "design/brachnha-logo.source.svg";
const OUT = "public/icons";

// Fraction of the source's shorter side kept, centred. At 1 the drawing fills
// about two thirds of the icon, which is what launchers expect of a full-bleed
// icon; the grey tile edge that comes with it is whitened by the render.
const CROP = 1;

// A pixel whose channels differ by less than this is treated as grey and
// painted white. The drawing's darkest navy still differs by ~90.
const GREY_CHROMA = 36;

// [file, size, scale of the cropped artwork inside the square]
const TARGETS = [
  ["icon-192.png", 192, 1],
  ["icon-512.png", 512, 1],
  ["apple-touch-icon.png", 180, 1],
  // 0.8 puts the drawing's corners inside the 80% safe circle.
  ["maskable-512.png", 512, 0.8],
];

const RENDER = async ({ svg, size, scale, crop, grey }) => {
  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // A centred square of the source, drawn into a centred (size*scale) square.
  const side = Math.min(img.width, img.height) * crop;
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  const box = size * scale;
  const d = (size - box) / 2;
  ctx.drawImage(img, sx, sy, side, side, d, d, box, box);

  const data = ctx.getImageData(0, 0, size, size);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) < grey) {
      px[i] = px[i + 1] = px[i + 2] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);

  return canvas.toDataURL("image/png");
};

const exe = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!exe) {
  console.error("No Chrome/Edge found. Looked in:\n  " + CHROME_CANDIDATES.join("\n  "));
  process.exit(1);
}

const svg = await readFile(SOURCE, "utf8");
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: exe });
try {
  const page = await browser.newPage();
  for (const [file, size, scale] of TARGETS) {
    const dataUrl = await page.evaluate(RENDER, { svg, size, scale, crop: CROP, grey: GREY_CHROMA });
    const buf = Buffer.from(dataUrl.split(",")[1], "base64");
    await writeFile(`${OUT}/${file}`, buf);
    console.log(`${OUT}/${file}  ${size}x${size}  ${(buf.length / 1024).toFixed(1)} KB`);
  }
} finally {
  await browser.close();
}

/**
 * Shrink a photo taken on a phone down to something worth uploading.
 *
 * WHY THIS EXISTS AT ALL: a modern handset photographs at 8–12 megapixels, which
 * is 3–5MB. The audience is on Cambodian mobile data and pays for that twice —
 * once to upload it and once for every classmate who opens it. The same page of
 * handwriting at 1400px on its long edge is 200–350KB and is, at the size it is
 * ever displayed, indistinguishable.
 *
 * NO IMAGE LIBRARY WAS ADDED, and none should be. The browser already decodes
 * and re-encodes images; this is a canvas and twenty lines. That is the same
 * decision scripts/webp.mjs records for the build-time converter — it drives the
 * Chrome that was already there rather than taking a dependency to do what the
 * platform does.
 *
 * 1400px is a legibility number, not a round one. Handwritten working is fine
 * detail — a formula's exponent is a few pixels — and 1000px was measured as the
 * point where a pencilled fraction starts to mush. It is also ~2× the widest a
 * review card ever draws the image, which covers 2× DPI screens.
 *
 * JPEG rather than WebP, reversing the choice the subject artwork made, and for
 * a reason specific to the input: these are photographs, which is the case JPEG
 * was designed for and where its artefacts read as softness rather than the
 * blocking WebP shows on the same budget. It is also the one format every camera
 * pipeline and every browser agrees on with no fallback needed.
 */

/** Long edge, in CSS pixels, after the resize. */
const MAX_EDGE = 1400;

/** JPEG quality. 0.72 was chosen against real pencil-on-paper photos: below
 *  ~0.65 the paper grain starts eating thin pencil strokes. */
const QUALITY = 0.72;

export interface CompressedImage {
  blob: Blob;
  /** Always "image/jpeg" today; carried so the caller never assumes. */
  contentType: string;
}

/**
 * Resize and re-encode. Rejects only if the file is not a decodable image.
 *
 * ORIENTATION IS THE TRAP HERE. A phone stores the sensor's own pixels and a
 * separate EXIF tag saying which way up they were — so a naive canvas draw
 * renders portrait photos on their side, which is the single most common way
 * home-made image resizing goes wrong. `imageOrientation: "from-image"` makes
 * createImageBitmap apply the tag while decoding. Safari only honours it from
 * 16; on anything older the option is ignored rather than throwing, so the
 * photo uploads sideways instead of failing — degraded, not broken, and the
 * student can rotate and retake.
 */
export async function compressImage(file: Blob): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  // Never scale UP. A photo already smaller than the cap is re-encoded at its
  // own size — enlarging it would spend bytes inventing detail that is not there.
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas 2d context unavailable");
  }

  // JPEG has no alpha, so an unpainted canvas would encode transparent pixels as
  // BLACK. A photo fills the frame and never shows this — a PNG with a
  // transparent border, which a student may well pick from their gallery, would
  // arrive with a black edge without it.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) throw new Error("could not encode image");

  return { blob, contentType: "image/jpeg" };
}

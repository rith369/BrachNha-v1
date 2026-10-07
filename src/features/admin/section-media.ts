/**
 * The pictures and 3D models a lesson section may use, offered by the section
 * editor (/admin/content/section/…). They are files the app SHIPS, under
 * public/sections/ and public/models/; the editor picks among them and cannot
 * upload a new one (the user's call: a new picture is added to the app by the
 * developer, see design/subjects.md for how a poster is made).
 *
 * Kept as a plain list because a browser cannot list a folder.
 * scripts/check-content.mjs fails when this list and the folders disagree, so
 * adding a file without adding it here (or the reverse) is caught.
 */

export const SECTION_POSTERS: readonly string[] = [
  "/sections/biology-3-1-1.webp",
  "/sections/math-1-1-1.webp",
  "/sections/math-1-1-2.webp",
  "/sections/math-1-1-3.webp",
];

export const SECTION_MODELS: readonly string[] = ["/models/brain.glb"];

/** The credit line the brain model's licence asks for, offered when it is
 *  picked so nobody has to retype it. */
export const MODEL_CREDITS: Readonly<Record<string, string>> = {
  "/models/brain.glb": "\"Brain Diagram\" by Aeceus, CC BY 4.0, via Sketchfab",
};

import type { Lang } from "@/types";

export interface BrainHotspot {
  /** Must match a mesh/object name inside public/models/brain.glb exactly —
   *  inspect the file (e.g. in a glTF viewer or Blender) to find real names. */
  meshName: string;
  label: { en: string; km: string };
}

// Pre-filled from brain.glb's own node names (inspected directly — they are
// already meaningful anatomical terms, not generic mesh IDs). Edit freely;
// any mesh not listed here just falls back to showing its raw name.
export const BRAIN_HOTSPOTS: BrainHotspot[] = [
  { meshName: "Brain", label: { en: "Cerebrum", km: "សេរេប្រុម" } },
  { meshName: "Cerebellum", label: { en: "Cerebellum", km: "សេរេបែល (តុល្យភាព)" } },
  {
    meshName: "brainstem_Nerves",
    label: { en: "Brain Stem", km: "ដើមខួរ (ដង្ហើម)" },
  },
  {
    meshName: "Frontal",
    label: { en: "Frontal Lobe", km: "Frontal Lobe (ការគិត)" },
  },
  {
    meshName: "Parietal",
    label: { en: "Parietal Lobe", km: "Parietal Lobe (ការប៉ះ)" },
  },
  {
    meshName: "Temporal",
    label: { en: "Temporal Lobe", km: "Temporal Lobe (ការស្តាប់)" },
  },
  {
    meshName: "Occipital",
    label: { en: "Occipital Lobe", km: "Occipital Lobe (ការមើល)" },
  },
];

export function lookupBrainLabel(meshName: string, lang: Lang): string {
  return (
    BRAIN_HOTSPOTS.find((h) => h.meshName === meshName)?.label[lang] ??
    meshName
  );
}

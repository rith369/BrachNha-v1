import { lazy, Suspense, useState } from "react";
import { Box } from "lucide-react";
import { focusCard } from "@/utils/focus-styles";
import type { Lang, Model3DRef } from "@/types";

// three.js + react-three-fiber + drei is a large dependency needed only by the
// sections that carry a model. Behind React.lazy so it downloads on tapping one,
// not on opening the section and not on every section.
const BrainModelViewer = lazy(() =>
  import("./brain-model-viewer").then((m) => ({ default: m.BrainModelViewer }))
);

/**
 * What a model costs, the viewer's code included, so a student on mobile data can
 * decide. Only for a file measured here: an unknown one says nothing rather than
 * guessing. Measured 4 Nov 2026: 861 KB model + 230 KB viewer.
 */
const DOWNLOAD_SIZE: Record<string, string> = {
  "/models/brain.glb": "1 MB",
};

/**
 * A section's 3D model, loaded only on a tap, the same bargain as the video facade
 * in section-video.tsx. It used to start by itself on opening the section, before
 * the student had scrolled to it: the most data any screen in the app used, on an
 * audience paying for it, for something some students never look at.
 *
 * The tile is the viewer's size, so the page does not move when it opens. The
 * caller keys this on the section, so the next section starts closed again.
 */
export function SectionModel({ model, lang }: { model: Model3DRef; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const size = Object.hasOwn(DOWNLOAD_SIZE, model.src) ? DOWNLOAD_SIZE[model.src] : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-64 w-full flex-col items-center justify-center gap-2 text-center transition active:translate-y-0.5 md:h-80 lg:h-96 ${focusCard}`}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-purple/10 shadow-panel-sm">
          <Box className="size-7 text-purple" strokeWidth={2.25} aria-hidden />
        </span>
        {model.title && <span className="text-sm font-extrabold text-text">{model.title}</span>}
        <span className="text-sm font-bold text-text">ចុចដើម្បីមើលម៉ូឌែល 3D</span>
        {size && <span className="text-xs font-bold text-muted">ប្រើទិន្នន័យប្រហែល {size}</span>}
      </button>
    );
  }

  return (
    <Suspense
      fallback={
        <div className={`flex h-64 items-center justify-center md:h-80 lg:h-96 ${focusCard}`}>
          កំពុងផ្ទុកម៉ូឌែល 3D…
        </div>
      }
    >
      <div className="h-64 w-full overflow-hidden rounded-2xl border border-border bg-surface md:h-80 lg:h-96">
        <BrainModelViewer model={model} lang={lang} />
      </div>
    </Suspense>
  );
}

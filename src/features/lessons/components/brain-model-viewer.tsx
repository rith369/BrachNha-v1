import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { lookupBrainLabel } from "@/data/brain-labels";
import type { Lang, Model3DRef } from "@/types";

/**
 * THIS MODULE IS THE LAZY BOUNDARY for three.js. `three` + @react-three/fiber
 * + @react-three/drei together are a meaningfully large dependency — this
 * file is reached ONLY through React.lazy from lesson-detail.tsx, exactly
 * like MathFieldPanel is reached from chat-overlay.tsx (see the header of
 * math-field-panel.tsx). A static import of this file — or of `three` /
 * `@react-three/fiber` / `@react-three/drei` — anywhere else in the app would
 * silently undo the code-splitting and ship the whole 3D stack to every
 * student, most of whom never open the biology brain lesson.
 */

const HIGHLIGHT = new THREE.Color("#8b2be2"); // --color-purple

function highlightOf(mat: THREE.Material): THREE.Material {
  const clone = mat.clone();
  if ("emissive" in clone) {
    (clone as THREE.MeshStandardMaterial).emissive = HIGHLIGHT.clone();
    (clone as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
  } else if ("color" in clone) {
    (clone as THREE.MeshBasicMaterial).color = HIGHLIGHT.clone();
  }
  return clone;
}

function BrainScene({ src, lang }: { src: string; lang: Lang }) {
  const { scene } = useGLTF(src);
  const [selected, setSelected] = useState<THREE.Mesh | null>(null);
  const originals = useRef(
    new Map<string, THREE.Material | THREE.Material[]>()
  );

  function restore(mesh: THREE.Mesh) {
    const original = originals.current.get(mesh.uuid);
    if (original) mesh.material = original;
  }

  // useGLTF caches the loaded scene by URL, so a mutated material outlives
  // this component unless reverted on unmount — otherwise the next time this
  // lesson opens, the last-clicked part would still look highlighted with no
  // "selected" state to match it.
  useEffect(() => {
    return () => {
      if (selected) restore(selected);
    };
  }, [selected]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    const mesh = e.object;
    if (!(mesh instanceof THREE.Mesh)) return;

    if (selected === mesh) {
      restore(mesh);
      setSelected(null);
      return;
    }
    if (selected) restore(selected);

    if (!originals.current.has(mesh.uuid)) {
      originals.current.set(mesh.uuid, mesh.material);
    }
    const original = originals.current.get(mesh.uuid)!;
    mesh.material = Array.isArray(original)
      ? original.map(highlightOf)
      : highlightOf(original);
    setSelected(mesh);
  }

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {selected && (
        <Html position={selected.getWorldPosition(new THREE.Vector3())} center>
          <div className="pointer-events-none rounded-lg bg-elevated px-2 py-1 text-xs font-bold whitespace-nowrap shadow-panel-sm">
            {lookupBrainLabel(selected.name, lang)}
          </div>
        </Html>
      )}
    </primitive>
  );
}

export function BrainModelViewer({
  model,
  lang,
}: {
  model: Model3DRef;
  lang: Lang;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas style={{ touchAction: "none" }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.3}>
            <BrainScene src={model.src} lang={lang} />
          </Bounds>
        </Suspense>
        <OrbitControls enablePan={false} makeDefault />
      </Canvas>
      {/* Names what the model shows. Top-LEFT, so it can never collide with the
          drag hint opposite it — the two are the only things over the canvas at
          that edge, and on a 320px phone a centred title would meet the hint. */}
      {model.title && (
        <div className="pointer-events-none absolute top-1 left-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
          {model.title}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/80">
        {model.credit}
      </div>
      <div className="pointer-events-none absolute top-1 right-1 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/80">
        {lang === "en"
          ? "Drag to rotate · Pinch to zoom"
          : "អូសបង្វិល · ច្របាច់ពង្រីក"}
      </div>
    </div>
  );
}

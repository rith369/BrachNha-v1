import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { RotateCw, WifiOff } from "lucide-react";
import * as THREE from "three";
import { lookupBrainLabel } from "@/data/brain-labels";
import type { Lang, Model3DRef } from "@/types";

/**
 * THIS MODULE IS THE LAZY BOUNDARY for three.js. `three` + @react-three/fiber
 * + @react-three/drei together are a meaningfully large dependency — this
 * file is reached ONLY through React.lazy from section-model.tsx, exactly
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

/**
 * A dropped connection during the download must not take the lesson with it: with no
 * boundary here it reaches the app's own, which replaces the whole screen. The student
 * asked for this on mobile data, so it is the place a failure is most likely.
 * useGLTF caches a failed load by URL, so trying again has to clear that first.
 */
class ModelErrorBoundary extends Component<
  { src: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <WifiOff className="size-6 text-muted" strokeWidth={2.5} />
        <p className="text-sm font-bold text-text">
          មិនអាចផ្ទុកម៉ូឌែល 3D បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។
        </p>
        <button
          type="button"
          onClick={() => {
            useGLTF.clear(this.props.src);
            this.setState({ failed: false });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-extrabold text-text shadow-panel-sm transition active:translate-y-0.5"
        >
          <RotateCw className="size-4" strokeWidth={2.5} />
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }
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

function ModelCanvas({
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
        <Suspense
          fallback={
            <Html center>
              <div className="text-sm font-bold whitespace-nowrap text-muted">កំពុងផ្ទុកម៉ូឌែល 3D…</div>
            </Html>
          }
        >
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

export function BrainModelViewer({ model, lang }: { model: Model3DRef; lang: Lang }) {
  return (
    <ModelErrorBoundary src={model.src}>
      <ModelCanvas model={model} lang={lang} />
    </ModelErrorBoundary>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Keyboard, Eraser } from "lucide-react";
import type { Lang } from "@/types";
import { PLEDGE_COPY } from "../copy";
import {
  SIGNATURE_VIEWBOX,
  isAtPointLimit,
  shouldKeepPoint,
  strokesToPath,
  type Point,
  type Stroke,
} from "@/utils/signature";
import { SignatureDisplay } from "./signature-display";

export interface SignatureValue {
  kind: "drawn" | "typed";
  signature: string;
}

const PEN_WIDTH = 5; // matches SignatureDisplay's strokeWidth exactly

const inputClasses =
  "w-full rounded-xl border border-purple/10 bg-white px-3.5 py-3 text-sm font-bold text-text outline-none focus:border-purple/40";

export function SignaturePad({
  lang,
  defaultName,
  onChange,
}: {
  lang: Lang;
  defaultName: string;
  onChange: (value: SignatureValue) => void;
}) {
  const c = PLEDGE_COPY[lang];
  const [tab, setTab] = useState<"draw" | "typed">("draw");
  const [typedName, setTypedName] = useState(defaultName);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);

  // Redraws from scratch each time. At this size (a few hundred points) that's
  // cheaper than tracking dirty regions, and it's the same code path the
  // ResizeObserver needs after a rotation.
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (width === 0 || height === 0) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Draw in viewBox units, not pixels: the box is aspect-[3/1] to match the
    // 600×200 viewBox, so one uniform scale covers both axes and the stored
    // path lines up with SignatureDisplay at any size.
    const scale = width / SIGNATURE_VIEWBOX.w;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, SIGNATURE_VIEWBOX.w, SIGNATURE_VIEWBOX.h);
    ctx.lineWidth = PEN_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Canvas can't resolve var(), so read the brand token off the element.
    ctx.strokeStyle =
      getComputedStyle(canvas).getPropertyValue("--color-purple").trim() ||
      "#8b2be2";

    for (const stroke of strokesRef.current) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (const p of stroke.slice(1)) ctx.lineTo(p.x, p.y);
      // A one-point stroke (a dot) needs a zero-length segment to render.
      if (stroke.length === 1) ctx.lineTo(stroke[0].x, stroke[0].y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    if (tab !== "draw") return;
    redraw();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => redraw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [tab, redraw]);

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIGNATURE_VIEWBOX.w,
      y: ((e.clientY - rect.top) / rect.height) * SIGNATURE_VIEWBOX.h,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    // Capture so a finger that slides off the pad still finishes its stroke
    // here instead of the browser retargeting the event mid-signature.
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([pointFromEvent(e)]);
    redraw();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    if (isAtPointLimit(strokesRef.current)) return;
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const point = pointFromEvent(e);
    if (!shouldKeepPoint(stroke[stroke.length - 1], point)) return;
    stroke.push(point);
    redraw();
  }

  function endStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange({ kind: "drawn", signature: strokesToPath(strokesRef.current) });
  }

  function clearDrawing() {
    strokesRef.current = [];
    redraw();
    onChange({ kind: "drawn", signature: "" });
  }

  function switchTab(next: "draw" | "typed") {
    setTab(next);
    onChange(
      next === "draw"
        ? { kind: "drawn", signature: strokesToPath(strokesRef.current) }
        : { kind: "typed", signature: typedName.trim() }
    );
  }

  const tabClasses = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
      active ? "bg-purple/15 text-purple" : "text-muted"
    }`;

  return (
    <div className="rounded-2xl border border-purple/10 bg-white p-3 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
      <div className="mb-3 flex gap-1 rounded-xl bg-purple/5 p-1">
        <button
          type="button"
          onClick={() => switchTab("draw")}
          className={tabClasses(tab === "draw")}
        >
          <Pencil className="size-3.5" strokeWidth={2.75} />
          {c.draw}
        </button>
        <button
          type="button"
          onClick={() => switchTab("typed")}
          className={tabClasses(tab === "typed")}
        >
          <Keyboard className="size-3.5" strokeWidth={2.75} />
          {c.type}
        </button>
      </div>

      {tab === "draw" ? (
        <>
          <canvas
            ref={canvasRef}
            // touchAction: none is what stops a finger from scrolling the page
            // instead of drawing — without it the pad is unusable on a phone.
            style={{ touchAction: "none" }}
            className="aspect-[3/1] w-full cursor-crosshair rounded-xl bg-purple/[0.03]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
          />
          <div className="mt-1 flex items-center justify-between border-t border-dashed border-purple/20 pt-2">
            <span className="text-[11px] font-bold text-muted">
              {c.drawHint}
            </span>
            <button
              type="button"
              onClick={clearDrawing}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold text-pink active:scale-[0.98]"
            >
              <Eraser className="size-3.5" strokeWidth={2.75} />
              {c.clear}
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            value={typedName}
            onChange={(e) => {
              setTypedName(e.target.value);
              onChange({ kind: "typed", signature: e.target.value.trim() });
            }}
            placeholder={c.typePlaceholder}
            maxLength={40}
            className={inputClasses}
          />
          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-purple/[0.03] px-3">
            <SignatureDisplay kind="typed" signature={typedName.trim()} />
          </div>
        </>
      )}
    </div>
  );
}

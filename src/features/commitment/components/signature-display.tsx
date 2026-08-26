import { useEffect } from "react";
import { SIGNATURE_VIEWBOX } from "@/utils/signature";
import { loadSignatureFont } from "@/lib/load-signature-font";
import { cn } from "@/utils/cn";

// Renders either half of the Commitment shape — SVG path data for a drawn
// signature, the name itself for a typed one. Shared by the pledge overlay's
// confirmation state and the roadmap banner so both look identical.
export function SignatureDisplay({
  kind,
  signature,
  className,
}: {
  kind: "drawn" | "typed";
  signature: string;
  className?: string;
}) {
  // Caveat is no longer in index.html's font link — it is the only face in the
  // app that isn't on every screen, so it is fetched the first time a typed
  // signature actually renders. This is the right component to ask from rather
  // than CommitmentOverlay: the roadmap banner renders a typed signature too,
  // without the overlay ever being mounted.
  //
  // Called unconditionally, before the `kind` branch below, because hooks
  // cannot sit behind a condition; the loader itself is a no-op for a drawn
  // signature and after the first call.
  useEffect(() => {
    if (kind === "typed") loadSignatureFont();
  }, [kind]);

  if (kind === "typed") {
    return (
      <div
        className={cn(
          "flex items-center overflow-hidden text-3xl leading-tight text-purple",
          className
        )}
        style={{ fontFamily: "var(--font-signature), cursive" }}
      >
        <span className="truncate">{signature}</span>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${SIGNATURE_VIEWBOX.w} ${SIGNATURE_VIEWBOX.h}`}
      preserveAspectRatio="xMinYMid meet"
      className={cn("w-full", className)}
      role="img"
      aria-label="Signature"
    >
      <path
        d={signature}
        fill="none"
        stroke="var(--color-purple)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import { SIGNATURE_VIEWBOX } from "@/utils/signature";
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

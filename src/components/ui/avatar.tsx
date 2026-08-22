import { cn } from "@/utils/cn";

// Note: these avatars are DiceBear-generated SVGs, downloaded once and
// bundled in public/avatars/ (not fetched live — DiceBear's API proved
// unreachable on some networks). next/image only optimizes SVGs behind
// `dangerouslyAllowSVG` (a real XSS surface), which isn't worth enabling
// just to silence a perf lint warning on placeholder demo avatars.
// Plain <img> is intentional.
/* eslint-disable @next/next/no-img-element */

interface AvatarProps {
  seed: string;
  name: string;
  className?: string;
}

export function Avatar({ seed, name, className }: AvatarProps) {
  return (
    <img
      src={`/avatars/${seed}.svg`}
      alt={name}
      className={cn("rounded-full object-cover", className)}
    />
  );
}

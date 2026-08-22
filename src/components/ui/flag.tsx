import { cn } from "@/utils/cn";

// Real flag SVGs bundled in public/flags/, NOT the 🇬🇧/🇰🇭 emoji: Windows and
// many Android builds ship no flag glyphs, so the emoji fall back to rendering
// the bare letter pairs "GB" / "KH". Same class of problem that got emoji icons
// replaced by Lucide, and the same fix (and same plain-<img> approach) as
// components/ui/avatar.tsx. next/image would only optimize these behind
// `dangerouslyAllowSVG`, which isn't worth an XSS surface for two 800-byte files.
/* eslint-disable @next/next/no-img-element */

export type FlagCode = "gb" | "kh";

interface FlagProps {
  code: FlagCode;
  className?: string;
}

// Decorative by default — every current caller puts the language name right
// next to it, so announcing the flag too would just repeat the label.
export function Flag({ code, className }: FlagProps) {
  return (
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 rounded-full", className)}
    />
  );
}

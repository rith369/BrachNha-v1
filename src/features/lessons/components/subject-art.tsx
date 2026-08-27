import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "../subject-styles";
import type { SubjectMeta } from "../subjects";

/**
 * The artwork slot for a subject, shared by the Study page's tile and the exam
 * page's past-paper banner.
 *
 * WEBP ONLY — a single <img>, deliberately NOT the <picture> + PNG pair that
 * wordmark.tsx uses. That pair exists because the logo is one image on every
 * screen; here it would mean maintaining sixteen files instead of eight, for a
 * format ~99% of handsets have supported for years (Android Chrome since 2014,
 * iOS Safari since 14). A browser too old for WebP simply keeps the placeholder
 * below, which is a designed tile rather than a failure state.
 *
 * No file has to exist. The gradient + icon behind the image IS the
 * placeholder, so a subject with no artwork still renders a finished-looking
 * card.
 *
 * `onError` hiding the <img> is what makes that work: without it a 404 paints
 * the browser's broken-image glyph on top of the gradient. All eight files
 * happen to exist today — which is exactly the moment that handler starts
 * looking deletable. It is what a NEW subject with no artwork yet falls back to.
 *
 * width/height are set so the box is reserved before the image lands.
 *
 * `className` overrides the shape, and only the shape: the Study tile keeps the
 * default 4:3 rounded square, the exam card passes a fixed-height square-topped
 * band. cn() is twMerge(clsx(…)), so an aspect or rounding override genuinely
 * wins over the default rather than stacking with it.
 */
export function SubjectArt({
  subject,
  className = "aspect-[4/3] rounded-xl",
}: {
  subject: SubjectMeta;
  className?: string;
}) {
  const Icon = subject.icon;
  const art = SUBJECT_STYLE[subject.id];

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-linear-to-br",
        art.art,
        className
      )}
    >
      <Icon
        className={cn("size-9 opacity-70 md:size-11", art.text)}
        strokeWidth={1.75}
      />
      <img
        src={`/subjects/${subject.id}.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={600}
        height={450}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}

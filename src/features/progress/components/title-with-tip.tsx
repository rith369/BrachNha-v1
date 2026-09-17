import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/info-tip";

/**
 * A card title with its ⓘ glued to the LAST WORD.
 *
 * Four cards carried this markup by hand while their titles were fixed English
 * strings. Once titles come from `copy.ts` in two languages, the split point
 * has to be computed rather than written into the JSX — so it lives here once.
 *
 * WHY GLUE AT ALL: as a flex item the ⓘ floated to the far edge whenever the
 * title wrapped, and as a plain inline it wrapped onto a line of its own
 * ("OVERALL READINESS" fills a 320px line). Holding it with the last word keeps
 * the icon beside the words it explains however the title breaks.
 *
 * A title with NO space — most Khmer titles here, since Khmer does not separate
 * words with spaces — is one run held whole with its icon; the browser still
 * breaks Khmer inside the run where it has to.
 */
export function TitleWithTip({
  text,
  label,
  children,
}: {
  text: string;
  /** The ⓘ's screen-reader name. */
  label: string;
  children: ReactNode;
}) {
  const cut = text.lastIndexOf(" ");
  const head = cut === -1 ? "" : text.slice(0, cut + 1);
  const last = cut === -1 ? text : text.slice(cut + 1);
  return (
    <>
      {head}
      <span className="whitespace-nowrap">
        {last}
        <InfoTip label={label} className="ml-1.5 align-middle">
          {children}
        </InfoTip>
      </span>
    </>
  );
}

import { Share, SquarePlus } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { INSTALL_COPY } from "../copy";

/**
 * The two manual steps an iPhone needs, because Safari gives a page no install
 * button. Shared by the pop-up (install-prompt.tsx) and the Profile card
 * (install-card.tsx), so both show a student the same thing.
 */
export function IosSteps({ className }: { className?: string }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = INSTALL_COPY[lang];
  return (
    <ol className={`space-y-2 text-left ${className ?? ""}`}>
      <li className="flex items-center gap-3 rounded-2xl bg-control p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/10">
          <Share className="size-5 text-blue" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-bold text-text">
          {c.iosStep1}
          <span className="block text-xs font-semibold text-muted">{c.iosStep1Hint}</span>
        </span>
      </li>
      <li className="flex items-center gap-3 rounded-2xl bg-control p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple/10">
          <SquarePlus className="size-5 text-purple" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-bold text-text">{c.iosStep2}</span>
      </li>
    </ol>
  );
}

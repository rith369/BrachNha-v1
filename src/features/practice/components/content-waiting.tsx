import { RotateCw, WifiOff } from "lucide-react";
import { FocusLayout } from "@/components/shell/focus-layout";

/**
 * What a practice screen shows while its content is not on the device yet
 * (lib/content.ts): a quiet line while it downloads, and, when the network does
 * not answer on a first open, a sentence saying so with Try again.
 *
 * NO GREY SKELETON BARS: a list of bars pretending to be content is a bigger
 * lie than one muted line, the call open-competitions.tsx already makes. And on
 * a returning device the manifest is already stored, so most students never see
 * the loading line for a list at all.
 *
 * KHMER-ONLY, like the rest of the practice feature (PRACTICE_PAGE_LANG).
 */

export type WaitingState = "loading" | "offline";

const TEXT: Record<WaitingState, string> = {
  loading: "កំពុងទាញយក…",
  offline:
    "ត្រូវការអ៊ីនធឺណិត ដើម្បីបើកមេរៀននេះលើកដំបូង។ ពេលបើករួចម្តង វាអាចប្រើបានដោយគ្មានអ៊ីនធឺណិត។",
};

/** Inline, for a page that keeps its navigation (the hub, a subject's list). */
export function ContentNotice({
  state,
  onRetry,
}: {
  state: WaitingState;
  onRetry: () => void;
}) {
  if (state === "loading") {
    return (
      <p role="status" className="py-6 text-center text-sm font-bold text-muted">
        {TEXT.loading}
      </p>
    );
  }
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-panel"
    >
      <WifiOff className="size-6 text-muted" strokeWidth={2.5} />
      <p className="text-sm font-bold text-text">{TEXT.offline}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-extrabold shadow-panel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <RotateCw className="size-4" strokeWidth={2.5} />
        ព្យាយាមម្តងទៀត
      </button>
    </div>
  );
}

/** Full screen, for the deck or quiz itself: a focus route has no navigation,
 *  so this keeps FocusLayout's X as the way out. */
export function ContentWaitingScreen({
  state,
  onRetry,
  onExit,
}: {
  state: WaitingState;
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <FocusLayout progressPct={0} onExit={onExit}>
      <div className="mx-auto w-full max-w-md">
        <ContentNotice state={state} onRetry={onRetry} />
      </div>
    </FocusLayout>
  );
}

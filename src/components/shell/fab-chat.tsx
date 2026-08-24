import { Bot } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { cn } from "@/utils/cn";

export function FabChat() {
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);
  // Only ever true here for a LESSON: the shell doesn't render the FAB at all on
  // the two assessments, which are the other focus screens.
  const focusMode = useFocusMode();

  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="KruAI"
      className={cn(
        "animate-fab-pulse absolute right-4 z-40 flex size-13 items-center justify-center rounded-full bg-linear-to-br from-[var(--brand-pink)] to-[var(--brand-purple)] shadow-cta-lg lg:right-6",
        focusMode
          ? // A lesson swaps BottomNav for FocusLayout's pinned action bar, which
            // is taller — and taller again once the button grows at md/lg. These
            // clear it with room to spare rather than sitting on its edge.
            "bottom-22 md:bottom-26 lg:bottom-28"
          : // bottom-20 clears BottomNav; from lg there is no BottomNav, so it
            // drops to a normal corner offset instead of floating in dead space.
            "bottom-20 lg:bottom-6"
      )}
    >
      <Bot className="size-6 text-white" strokeWidth={2.25} />
    </button>
  );
}

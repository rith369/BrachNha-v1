import { Bot } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";

export function FabChat() {
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);

  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="AI Mentor"
      // bottom-20 clears the BottomNav; from lg there is no BottomNav, so it
      // drops to a normal corner offset instead of floating in dead space.
      className="animate-fab-pulse absolute right-4 bottom-20 z-40 flex size-13 items-center justify-center rounded-full bg-linear-to-br from-[var(--brand-pink)] to-[var(--brand-purple)] shadow-cta-lg lg:right-6 lg:bottom-6"
    >
      <Bot className="size-6 text-white" strokeWidth={2.25} />
    </button>
  );
}

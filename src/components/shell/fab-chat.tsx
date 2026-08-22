import { Bot } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";

export function FabChat() {
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);

  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="AI Mentor"
      className="animate-fab-pulse absolute right-4 bottom-20 z-40 flex size-13 items-center justify-center rounded-full bg-linear-to-br from-pink to-purple shadow-[0_6px_20px_rgba(139,43,226,0.45)]"
    >
      <Bot className="size-6 text-white" strokeWidth={2.25} />
    </button>
  );
}

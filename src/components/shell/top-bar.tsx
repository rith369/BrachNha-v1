import { Menu } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";

export function TopBar() {
  const chatOpen = useBrachNhaStore((s) => s.chatOpen);
  const setDrawerOpen = useBrachNhaStore((s) => s.setDrawerOpen);

  if (chatOpen) return null;

  return (
    <button
      onClick={() => setDrawerOpen(true)}
      aria-label="Open menu"
      className="absolute top-3 right-4 z-40 flex h-9.5 w-9.5 flex-col items-center justify-center gap-1.5 rounded-xl border border-purple/20 bg-purple/10 transition hover:bg-purple/20"
    >
      <Menu className="size-4.5 text-purple" strokeWidth={2.5} />
    </button>
  );
}

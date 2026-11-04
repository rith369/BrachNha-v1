import { Shield } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { todayKey } from "@/utils/day";
import { protectionSavedLabel } from "../mission-copy";

/**
 * Says so on the day after a protection was used. It works by itself on a missed
 * day, so without this the student would only see that one had gone. Nothing shows
 * on any other day, and there is nothing to dismiss.
 */
export function ProtectionNotice({ className }: { className?: string }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const notice = useBrachNhaStore((s) => s.protectionNotice);
  if (notice?.date !== todayKey()) return null;
  return (
    <p
      role="status"
      className={cn("flex items-center gap-1.5 text-xs font-bold text-purple-strong", className)}
    >
      <Shield className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
      {protectionSavedLabel(notice.days, lang)}
    </p>
  );
}

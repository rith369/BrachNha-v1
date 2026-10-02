import { Link } from "react-router";
import { ArrowRight, Megaphone, X } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { dismissAnnouncement, useAnnouncement } from "@/lib/announcements";
import type { AnnouncementTone } from "@/types/database";
import { cn } from "@/utils/cn";

/**
 * The team's announcement, under the app bar on every ordinary screen
 * (AppShell renders it behind the same `!hideChrome` as the bar, so lessons,
 * exams and the roadmap's onboarding lock never show it).
 *
 * ONE AT A TIME: the newest live one this device has not dismissed. Two banners
 * stacked would push every page down by a third of a phone screen.
 *
 * The text follows `lang`, falling back to Khmer when no English was written:
 * the Khmer is required when publishing, the English is not.
 *
 * Neo fills under INK text, as everywhere else: info is blue, success mint,
 * warning yellow.
 */

const TONE: Record<AnnouncementTone, string> = {
  info: "bg-neo-blue",
  success: "bg-neo-mint",
  warning: "bg-neo-yellow",
};

export function AnnouncementBanner() {
  const lang = useBrachNhaStore((s) => s.lang);
  const announcement = useAnnouncement();
  if (!announcement) return null;

  const text = lang === "en" && announcement.bodyEn ? announcement.bodyEn : announcement.bodyKm;
  return (
    <div className="shrink-0 px-4 pt-2 md:px-6 lg:px-8">
      <div
        role="status"
        className={cn(
          "flex items-start gap-2.5 rounded-2xl border border-border px-3 py-2.5 text-ink shadow-hard-sm",
          TONE[announcement.tone]
        )}
      >
        <Megaphone className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed font-bold [overflow-wrap:anywhere] md:text-sm">
            {text}
          </p>
          {announcement.link && (
            <Link
              to={announcement.link}
              className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-2"
            >
              {lang === "en" ? "Open" : "បើក"}
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => dismissAnnouncement(announcement.id)}
          aria-label={lang === "en" ? "Dismiss" : "បិទ"}
          className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

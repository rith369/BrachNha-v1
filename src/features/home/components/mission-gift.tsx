import { useState } from "react";
import { Gift } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";
import { todayKey } from "@/utils/day";
import { allMissionsDone, missionsDone } from "@/utils/streak";
import { giftLeftLabel, giftOpenedLabel, missionCopy } from "../mission-copy";

/**
 * The day's gift: how far off it is, the button once all four missions are done,
 * and what it paid. A gift left unopened is paid the next day (`newDay` in
 * lib/store.ts), so nobody loses one by finishing away from this card.
 */
export function MissionGift({
  className,
  lang: fixedLang,
}: {
  className?: string;
  /** For a Khmer-only screen: without it the line follows the app's language. */
  lang?: Lang;
}) {
  const { lang: appLang, tasks, tasksDate, giftOpened, giftResult, openGift } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      tasks: s.tasks,
      tasksDate: s.tasksDate,
      giftOpened: s.giftOpened,
      giftResult: s.giftResult,
      openGift: s.openGift,
    }))
  );
  const [justOpened, setJustOpened] = useState(false);
  const lang = fixedLang ?? appLang;
  const c = missionCopy(lang);
  const isToday = tasksDate === todayKey();
  const opened = isToday && giftOpened;

  if (opened) {
    return (
      <p
        role="status"
        className={cn(
          "flex items-center justify-center gap-1.5 text-xs font-extrabold text-mint",
          justOpened && "animate-streak-pop",
          className
        )}
      >
        <Gift className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
        {giftOpenedLabel(giftResult?.date === tasksDate ? giftResult : null, lang)}
      </p>
    );
  }

  if (isToday && allMissionsDone(tasks)) {
    return (
      <button
        type="button"
        onClick={() => {
          setJustOpened(true);
          openGift();
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-neo-yellow px-4 py-3 text-sm font-extrabold text-ink shadow-hard-sm transition active:translate-x-px active:translate-y-px active:shadow-none",
          className
        )}
      >
        <Gift className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
        {c.openGift}
      </button>
    );
  }

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs font-bold text-muted",
        className
      )}
    >
      <Gift className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
      {giftLeftLabel(isToday ? missionsDone(tasks) : 0, lang)}
    </p>
  );
}

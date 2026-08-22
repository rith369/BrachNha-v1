import { Sparkles, Zap } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { T } from "@/data/translations";

export function HomeHeader() {
  const { lang, xp, level } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      xp: s.xp,
      level: s.level,
    }))
  );
  const t = T[lang];

  return (
    <div className="flex items-center justify-between pr-14">
      <div>
        <div className="font-heading flex items-center gap-1 bg-linear-to-r from-pink via-purple to-blue bg-clip-text text-xl font-extrabold text-transparent">
          BrachNha
          <Sparkles className="size-4 text-purple" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-muted">
          {t.level} {level} &nbsp;·&nbsp;
          <Zap className="size-3 text-pink" strokeWidth={2.5} />
          {xp} XP
        </div>
      </div>
    </div>
  );
}

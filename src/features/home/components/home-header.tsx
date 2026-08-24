import { Zap } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Wordmark } from "@/components/shell/wordmark";
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
      <Wordmark
        subtitle={
          <div className="flex items-center gap-1 text-xs font-bold text-muted">
            {t.level} {level} &nbsp;·&nbsp;
            <Zap className="size-3 text-pink" strokeWidth={2.5} />
            {xp} XP
          </div>
        }
      />
    </div>
  );
}

import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { LESSONS, FOUNDATION } from "@/data/lessons";
import { T } from "@/data/translations";

interface PreviewCard {
  id: string;
  name: string;
  icon: string;
  category: string;
  badge?: string;
}

export function LessonsList() {
  const { lang, userData } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userData: s.userData,
    }))
  );
  const t = T[lang];
  const weaknesses = userData.weaknesses ?? [];

  const cards: PreviewCard[] = [];
  if (weaknesses.includes("math")) {
    cards.push({
      id: "math-foundation",
      name: FOUNDATION.math.title[lang],
      icon: FOUNDATION.math.icon,
      category: `${t.math} — ${t.foundation}`,
      badge: "⭐ Foundation",
    });
  }
  cards.push({
    id: "math-limits",
    name: LESSONS.math.limits.title[lang],
    icon: "📐",
    category: t.math,
  });
  cards.push({
    id: "math-probability",
    name: LESSONS.math.probability.title[lang],
    icon: "🎲",
    category: t.math,
  });
  if (weaknesses.includes("biology")) {
    cards.push({
      id: "biology-foundation",
      name: FOUNDATION.biology.title[lang],
      icon: FOUNDATION.biology.icon,
      category: `${t.biology} — ${t.foundation}`,
      badge: "⭐ Foundation",
    });
  }
  cards.push({
    id: "biology-body",
    name: LESSONS.biology.body.title[lang],
    icon: "🫀",
    category: t.biology,
  });
  cards.push({
    id: "biology-brain",
    name: LESSONS.biology.brain.title[lang],
    icon: "🧠",
    category: t.biology,
  });

  return (
    <div>
      <div className="mb-5 pr-14">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          📚 {t.lessons}
        </div>
        <div className="text-xs font-bold text-muted">{t.lessonsSubtitle}</div>
      </div>
      {/* These are compact rows — icon, two lines of text, chevron. Left in one
          column they would stretch to ~960px on a laptop with the chevron
          stranded far from the title, so they pair up from lg. */}
      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.id} to={`/lessons/${c.id}`}>
            <Card className="relative flex-row items-center gap-3 p-3">
              {c.badge && (
                <span className="absolute -top-2 right-3 rounded-full bg-yellow/90 px-2 py-0.5 text-[9px] font-extrabold text-white">
                  {c.badge}
                </span>
              )}
              <span className="text-2xl">{c.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-bold text-muted">
                  {c.category}
                </div>
                <div className="truncate text-sm font-extrabold">
                  {c.name}
                </div>
              </div>
              <ChevronRight className="size-4.5 shrink-0 text-muted" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
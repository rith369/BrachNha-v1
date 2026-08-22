import { Link } from "react-router";
import { ChevronRight, BookOpen, Star, Sigma, Dna, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { LESSONS, FOUNDATION } from "@/data/lessons";
import { T } from "@/data/translations";

const SUBJECT_ICON: Record<"math" | "biology", LucideIcon> = {
  math: Sigma,
  biology: Dna,
};

interface PreviewCard {
  id: string;
  name: string;
  subject: "math" | "biology";
  category: string;
  badge?: boolean;
}

export function LessonPreviewList() {
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
      subject: "math",
      category: `${t.math} — ${t.foundation}`,
      badge: true,
    });
  }
  cards.push({
    id: "math-limits",
    name: LESSONS.math.limits.title[lang],
    subject: "math",
    category: t.math,
  });
  cards.push({
    id: "math-probability",
    name: LESSONS.math.probability.title[lang],
    subject: "math",
    category: t.math,
  });
  if (weaknesses.includes("biology")) {
    cards.push({
      id: "biology-foundation",
      name: FOUNDATION.biology.title[lang],
      subject: "biology",
      category: `${t.biology} — ${t.foundation}`,
      badge: true,
    });
  }
  cards.push({
    id: "biology-body",
    name: LESSONS.biology.body.title[lang],
    subject: "biology",
    category: t.biology,
  });
  cards.push({
    id: "biology-brain",
    name: LESSONS.biology.brain.title[lang],
    subject: "biology",
    category: t.biology,
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-heading flex items-center gap-1.5 text-sm font-extrabold">
          <BookOpen className="size-4 text-purple" strokeWidth={2.5} />
          {t.lessons}
        </div>
        <Link to="/lessons" className="text-xs font-extrabold text-purple">
          {lang === "en" ? "See all →" : "មើលទាំងអស់ →"}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((c) => {
          const Icon = SUBJECT_ICON[c.subject];
          return (
            <Link
              key={c.id}
              to={`/lessons/${c.id}`}
              className="transition-transform active:scale-[0.98]"
            >
              <Card className="relative flex-row items-center gap-3 p-3">
                {c.badge && (
                  <span className="absolute -top-2 right-3 flex items-center gap-0.5 rounded-full bg-yellow/90 px-2 py-0.5 text-[9px] font-extrabold text-white">
                    <Star className="size-2.5" strokeWidth={3} fill="currentColor" />
                    Foundation
                  </span>
                )}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple/10">
                  <Icon className="size-4.5 text-purple" strokeWidth={2.25} />
                </span>
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
          );
        })}
      </div>
    </div>
  );
}

import { Zap, Flame, Target, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

/**
 * The four headline numbers on Home (and reused as-is on Profile).
 *
 * THE STREAK PILL IS THE DOORWAY TO /streak. That route has no row in
 * lib/nav-items.ts on purpose — the drawer was getting long, and this pill
 * already shows the very number the page is about, so it is the natural way in
 * rather than a second entrance to a screen the student is looking at the
 * summary of. It is the only pill that links anywhere; the other three have no
 * page of their own to open, and a control that answers a tap with silence
 * reads as broken (sidebar-nav.tsx's `href: null` rows, subject-card.tsx's
 * zero-lesson tile).
 *
 * The pills therefore render as a `<Link>` or a `<div>` from one shared class
 * string, so the linked one cannot drift visually from its three neighbours.
 */
export function StatPills() {
  const { lang, xp, level, streak, examResults } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      examResults: s.examResults,
    }))
  );

  const toNextLevel = Math.max(level * 100 - xp, 0);
  const questionsAnswered = examResults.reduce((sum, r) => sum + r.total, 0);

  const pills = [
    {
      icon: Zap,
      value: xp,
      label: lang === "en" ? "XP Points" : "ពិន្ទុ XP",
      note: lang === "en" ? "▲ +20 today" : "▲ +20 ថ្ងៃនេះ",
      color: "text-pink",
    },
    {
      icon: Flame,
      value: streak,
      label: lang === "en" ? "Streak" : "ជួរ",
      note: lang === "en" ? "Best!" : "ល្អបំផុត!",
      noteIcon: Trophy,
      color: "text-yellow",
      href: "/streak",
    },
    {
      icon: Target,
      value: `Lv${level}`,
      label: lang === "en" ? "Level" : "កម្រិត",
      note:
        lang === "en"
          ? `+${toNextLevel} to next`
          : `+${toNextLevel} ទៅកម្រិតបន្ទាប់`,
      color: "text-purple",
    },
    {
      icon: BookOpen,
      value: questionsAnswered,
      label: lang === "en" ? "Questions" : "សំណួរ",
      note: lang === "en" ? "from mock exams" : "ពីការប្រឡងសាកល្បង",
      color: "text-blue",
    },
  ];

  const cell = "flex flex-col items-center gap-1 p-2.5 text-center";

  return (
    <Card className="grid grid-cols-4 divide-x divide-purple/10 p-0">
      {pills.map((p) => {
        const body = (
          <>
            <p.icon className={`size-4 ${p.color}`} strokeWidth={2.25} />
            <div className={`font-heading text-sm font-extrabold ${p.color}`}>
              {p.value}
            </div>
            <div className="text-[9px] font-bold text-muted">{p.label}</div>
            <div className="flex items-center gap-0.5 text-[8px] font-extrabold text-mint">
              {p.noteIcon && <p.noteIcon className="size-2.5" strokeWidth={2.5} />}
              {p.note}
            </div>
          </>
        );

        return p.href ? (
          <Link
            key={p.label}
            to={p.href}
            className={`${cell} transition hover:bg-purple/8 active:scale-[0.97]`}
          >
            {body}
          </Link>
        ) : (
          <div key={p.label} className={cell}>
            {body}
          </div>
        );
      })}
    </Card>
  );
}

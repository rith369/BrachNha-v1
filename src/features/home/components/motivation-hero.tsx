import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Sparkles, Map, ClipboardList, LineChart, Gamepad2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { QUOTES } from "@/data/questions";
import { daysUntilExam } from "@/utils/exam-date";

export function MotivationHero() {
  const { lang, userName } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userName: s.userName,
    }))
  );

  // A real count to the exam date, not months × 30.
  const daysLeft = daysUntilExam();

  // Pick the quote client-side only (after mount) to avoid a server/client
  // hydration mismatch: the server and the browser would roll different values.
  const [quote, setQuote] = useState(QUOTES[lang][0]);
  useEffect(() => {
    // Client-only randomness: picking a quote with Math.random() during render
    // would mismatch between server and client, so it has to happen after mount.
    // Intentional — not an accidental cascading render.
    const pool = QUOTES[lang];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  }, [lang]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-pink/10 via-purple/10 to-blue/10 p-5">
      <div className="flex items-center gap-1 text-xs font-extrabold text-purple">
        <Sparkles className="size-3.5" strokeWidth={2.5} />
        {lang === "en" ? `Good Day, ${userName}!` : `ថ្ងៃល្អ, ${userName}!`}
      </div>
      <div className="font-heading mt-1 text-2xl font-extrabold text-purple">
        {daysLeft} {lang === "en" ? "Days Left" : "ថ្ងៃទៅ"}
      </div>
      <div className="mt-1.5 text-xs font-bold text-muted italic">
        &ldquo;{quote}&rdquo;
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/roadmap"
          className="flex items-center gap-1.5 rounded-full bg-pink/15 px-3.5 py-1.5 text-xs font-extrabold text-pink transition-transform active:scale-[0.98]"
        >
          <Map className="size-3.5" strokeWidth={2.5} />
          {lang === "en" ? "Quest Map" : "ផែនទី"}
        </Link>
        <Link
          to="/exam"
          className="flex items-center gap-1.5 rounded-full bg-blue/15 px-3.5 py-1.5 text-xs font-extrabold text-blue transition-transform active:scale-[0.98]"
        >
          <ClipboardList className="size-3.5" strokeWidth={2.5} />
          {lang === "en" ? "Mock Exam" : "ប្រឡង"}
        </Link>
        <Link
          to="/progress"
          className="flex items-center gap-1.5 rounded-full bg-purple/15 px-3.5 py-1.5 text-xs font-extrabold text-purple transition-transform active:scale-[0.98]"
        >
          <LineChart className="size-3.5" strokeWidth={2.5} />
          {lang === "en" ? "Progress" : "ការរីកចម្រើន"}
        </Link>
        <Link
          to="/game"
          className="flex items-center gap-1.5 rounded-full bg-yellow/15 px-3.5 py-1.5 text-xs font-extrabold text-yellow transition-transform active:scale-[0.98]"
        >
          <Gamepad2 className="size-3.5" strokeWidth={2.5} />
          {lang === "en" ? "Game" : "ហ្គេម"}
        </Link>
      </div>
    </div>
  );
}

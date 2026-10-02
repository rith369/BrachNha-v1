import { Link } from "react-router";
import { Coins, Flame, Menu } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";
import { cn } from "@/utils/cn";

/**
 * The app bar on every ordinary screen: a level ring with XP progress, the
 * streak and coin counters, and the menu button, in ONE row.
 *
 * It replaced two rows (2 Oct 2026, the user's pick of "option C"): a
 * right-aligned row of four stat pills, and below it a floating hamburger
 * (the old TopBar, `absolute top-3 right-4`) that every page had to keep a
 * `pr-14` gutter for. Home also had its own logo row repeating level and XP.
 * The menu button is in normal flow now, so no page reserves space for it.
 *
 * Level and XP are ONE element because they are one fact: how far through the
 * current level the student is. The level rule lives in `award()` in
 * lib/store.ts (the level goes up once XP reaches `level * 100`), so a level
 * spans the 100 XP below that threshold. The bar is clamped, because a single
 * large award can carry XP past the threshold while the level only moves by
 * one.
 *
 * The streak counter links to /streak, the same doorway Home's Flame pill is.
 * Coins have no page, so that pill is a plain div: a control that answers a
 * tap with nothing reads as broken.
 */
const XP_PER_LEVEL = 100;

/** Ring geometry, in viewBox units. */
const R = 18;
const CIRC = 2 * Math.PI * R;

export function AppHeader() {
  const { lang, level, xp, streak, coins, chatOpen, setDrawerOpen } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        level: s.level,
        xp: s.xp,
        streak: s.streak,
        coins: s.coins,
        chatOpen: s.chatOpen,
        setDrawerOpen: s.setDrawerOpen,
      }))
    );
  const t = T[lang];

  const into = Math.min(
    Math.max(xp - (level - 1) * XP_PER_LEVEL, 0),
    XP_PER_LEVEL
  );
  const share = into / XP_PER_LEVEL;
  const label =
    lang === "en"
      ? `Level ${level}, ${into} of ${XP_PER_LEVEL} XP`
      : `${t.level} ${level}, ${into} ក្នុងចំណោម ${XP_PER_LEVEL} XP`;

  return (
    <div className="flex shrink-0 items-center gap-2 px-4 pt-3 md:px-6 md:pt-4 lg:px-8">
      <div
        className="flex min-w-0 flex-1 items-center gap-2.5"
        role="img"
        aria-label={label}
      >
        <div className="relative size-11 shrink-0">
          <svg viewBox="0 0 44 44" className="size-full -rotate-90">
            <circle
              cx="22"
              cy="22"
              r={R}
              fill="none"
              stroke="var(--color-chart-track)"
              strokeWidth="5"
            />
            {share > 0 && (
              <circle
                cx="22"
                cy="22"
                r={R}
                fill="none"
                stroke="var(--color-purple)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${share * CIRC} ${CIRC}`}
              />
            )}
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-heading text-base font-extrabold text-blue">
            {level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[15px] leading-tight font-extrabold text-text">
            {t.level} {level}
          </div>
          <div className="mt-0.5 h-1.5 w-full max-w-24 overflow-hidden rounded-full border border-border bg-control [border-width:1.5px]">
            <div
              className="h-full bg-purple"
              style={{ width: `${share * 100}%` }}
            />
          </div>
          <div className="mt-0.5 text-[11px] font-bold text-muted tabular-nums">
            {into} / {XP_PER_LEVEL} XP
          </div>
        </div>
      </div>

      <Link
        to="/streak"
        aria-label={lang === "en" ? `Streak: ${streak}` : `Streak៖ ${streak}`}
        className={pill}
      >
        <Flame className="size-3.5 shrink-0 text-pink" strokeWidth={2.5} />
        <span className="text-xs font-extrabold text-text tabular-nums">
          {streak}
        </span>
      </Link>
      <div
        className={pill}
        aria-label={lang === "en" ? `Coins: ${coins}` : `កាក់៖ ${coins}`}
      >
        <Coins className="size-3.5 shrink-0 text-yellow" strokeWidth={2.5} />
        <span className="text-xs font-extrabold text-text tabular-nums">
          {coins}
        </span>
      </div>

      {/* Hidden from lg up: the permanent Sidebar replaces the drawer there.
          `invisible` rather than unmounted while the chat is open, so the row
          does not shift under the overlay. */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label={lang === "en" ? "Open menu" : "បើកម៉ឺនុយ"}
        className={cn(
          "flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border bg-purple/10 shadow-panel-sm transition hover:bg-purple/20 lg:hidden",
          chatOpen && "invisible"
        )}
      >
        <Menu className="size-4.5 text-purple" strokeWidth={2.5} />
      </button>
    </div>
  );
}

const pill =
  "flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 shadow-panel-sm";

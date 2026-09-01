import { Coins, Flame, Moon, Sun, Target, Zap } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";

/**
 * Level, XP, streak and coins — the Duolingo-style counter row.
 *
 * ONE component, shared by every ordinary screen (see AppShell's global row)
 * and the top of every task screen (see FocusLayout's `showStats`). It started
 * as a local function inside subject-path-view.tsx and was lifted here the
 * moment a second caller appeared, which is the same reason shell/wordmark.tsx
 * exists — three hand-written copies of a thing is how they end up showing
 * different numbers in different places.
 *
 * LEVEL LEADS THE ROW, before XP, matching the order Home's own header already
 * uses ("កម្រិត 2 · 130 XP") and the same `Target` icon StatPills uses for it —
 * one convention for "what level am I" across the app rather than two. `Lv{n}`
 * is prefixed for the same reason StatPills prefixes it: a bare number here
 * would read as one more count rather than the identity badge it is.
 *
 * Every number is real and persisted. There is deliberately no energy/hearts
 * meter: the app has no such system, a decorative one would be a promise the
 * product does not keep, and a real one needs refill rules and a paywall story
 * nobody has designed.
 */
export function StatBar({
  /** Show the light/dark toggle beside the counters. */
  theme: showTheme = false,
  className,
}: {
  theme?: boolean;
  className?: string;
}) {
  const { level, xp, streak, coins, lang, currentTheme, setTheme } =
    useBrachNhaStore(
      useShallow((s) => ({
        level: s.level,
        xp: s.xp,
        streak: s.streak,
        coins: s.coins,
        lang: s.lang,
        currentTheme: s.theme,
        setTheme: s.setTheme,
      }))
    );

  // Four distinct tones so the row scans at a glance rather than reading as one
  // colour repeated — level takes blue since purple, pink and yellow were
  // already spoken for by XP, streak and coins.
  const items = [
    { icon: Target, tone: "text-blue", value: `Lv${level}`, label: "កម្រិត" },
    { icon: Zap, tone: "text-purple", value: xp, label: "XP" },
    { icon: Flame, tone: "text-pink", value: streak, label: "ថ្ងៃ" },
    { icon: Coins, tone: "text-yellow", value: coins, label: "កាក់" },
  ];

  const dark = currentTheme === "dark";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-1 rounded-full border border-purple/15 bg-surface px-2 py-1 shadow-panel-sm"
        >
          <it.icon
            className={cn("size-3.5 shrink-0", it.tone)}
            strokeWidth={2.5}
          />
          <span className="text-xs font-extrabold text-text">{it.value}</span>
        </div>
      ))}

      {showTheme && (
        // A single toggle, not the drawer's two-option segmented control: this
        // sits in a crowded bar on a 320px phone, and with exactly two themes a
        // toggle says everything the segmented control does in a third of the
        // width. `aria-pressed` carries the state that the icon shows visually.
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-pressed={dark}
          aria-label={
            lang === "en"
              ? dark
                ? "Switch to light"
                : "Switch to dark"
              : dark
                ? "ប្តូរទៅភ្លឺ"
                : "ប្តូរទៅងងឹត"
          }
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-purple/15 bg-surface text-muted shadow-panel-sm transition hover:text-purple"
        >
          {dark ? (
            <Sun className="size-3.5" strokeWidth={2.5} />
          ) : (
            <Moon className="size-3.5" strokeWidth={2.5} />
          )}
        </button>
      )}
    </div>
  );
}

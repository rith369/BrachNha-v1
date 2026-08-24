import { Moon, Sun } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { Theme } from "@/lib/store";

// Structurally the same segmented control as LanguageSwitcher, and it sits
// directly above it in the drawer footer. Kept as its own component rather than
// generalising the two: they share a shape today, but nothing says a language
// picker and a theme picker have to stay identical.
const OPTIONS: { value: Theme; icon: typeof Moon; label: Record<"en" | "km", string> }[] = [
  { value: "dark", icon: Moon, label: { en: "Dark", km: "ងងឹត" } },
  { value: "light", icon: Sun, label: { en: "Light", km: "ភ្លឺ" } },
];

export function ThemeSwitcher() {
  // Single-field selectors — no useShallow needed (only object-returning ones do).
  const lang = useBrachNhaStore((s) => s.lang);
  const theme = useBrachNhaStore((s) => s.theme);
  const setTheme = useBrachNhaStore((s) => s.setTheme);

  return (
    <div>
      <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-widest text-muted uppercase">
        {lang === "en" ? "Theme" : "រូបរាង"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const active = theme === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-extrabold transition",
                active
                  ? "border-purple/30 bg-linear-to-r from-pink/10 to-purple/10 text-purple"
                  : "border-purple/10 bg-surface text-text hover:bg-purple/8"
              )}
            >
              <Icon className="size-4.5" strokeWidth={2.25} />
              {option.label[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

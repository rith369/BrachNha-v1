import { Flag, type FlagCode } from "@/components/ui/flag";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { Lang } from "@/types";

// UI language only (`lang`). This is NOT userLanguage — that's the English/French
// subject the student studies, chosen at Login and shown read-only on Profile.
const OPTIONS: { value: Lang; code: FlagCode; label: string }[] = [
  { value: "en", code: "gb", label: "English" },
  { value: "km", code: "kh", label: "ខ្មែរ" },
];

export function LanguageSwitcher() {
  // Single-field selectors — no useShallow needed (only object-returning ones do).
  const lang = useBrachNhaStore((s) => s.lang);
  const setLang = useBrachNhaStore((s) => s.setLang);

  return (
    <div>
      <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-widest text-muted uppercase">
        {lang === "en" ? "Language" : "ភាសា"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const active = lang === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setLang(option.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-extrabold transition",
                active
                  ? "border-purple/30 bg-linear-to-r from-pink/10 to-purple/10 text-purple"
                  : "border-purple/10 bg-surface text-text hover:bg-purple/8"
              )}
            >
              <Flag code={option.code} className="size-4.5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

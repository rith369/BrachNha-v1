import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/shell/bottom-nav";
import { useBrachNhaStore } from "@/lib/store";

export function PagePlaceholder({
  emoji,
  titleEn,
  titleKm,
}: {
  emoji: string;
  titleEn: string;
  titleKm: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="text-5xl">{emoji}</div>
        <div className="font-heading text-lg font-extrabold">
          {lang === "en" ? titleEn : titleKm}
        </div>
        <Card className="mt-2 text-xs font-semibold text-muted">
          {lang === "en"
            ? "This page is scaffolded and routed — content migration from the current prototype comes next."
            : "ទំព័រនេះត្រូវបានរៀបចំរួចហើយ — ខ្លឹមសារនឹងបន្តបន្ទាប់។"}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}

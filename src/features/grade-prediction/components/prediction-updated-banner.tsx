import { Sparkles, X } from "lucide-react";
import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { PredictionChange } from "../use-grade-prediction";

export function PredictionUpdatedBanner({
  lang,
  change,
  onDismiss,
}: {
  lang: Lang;
  change: PredictionChange;
  onDismiss: () => void;
}) {
  const t = useT(lang);
  const delta = change.toPct - change.fromPct;
  const improved = delta >= 0;

  const message =
    lang === "en"
      ? `Your Grade ${change.grade} probability ${improved ? "increased" : "decreased"} by ${Math.abs(delta)}%.`
      : `ប្រូបាប៊ីលីតេនិទ្ទេស ${change.grade} របស់អ្នក${improved ? "កើនឡើង" : "ថយចុះ"} ${Math.abs(delta)}%។`;

  const reason =
    lang === "en"
      ? change.direction === "good"
        ? "Reason: your Physics quiz result improved."
        : "Reason: your Physics quiz result dropped."
      : change.direction === "good"
        ? "មូលហេតុ៖ លទ្ធផលលំហាត់រូបវិទ្យារបស់អ្នកប្រសើរឡើង។"
        : "មូលហេតុ៖ លទ្ធផលលំហាត់រូបវិទ្យារបស់អ្នកធ្លាក់ចុះ។";

  return (
    <div
      className={`animate-banner-in flex items-start gap-2.5 rounded-2xl border p-3.5 ${
        improved ? "border-mint/25 bg-mint/8" : "border-pink/20 bg-pink/8"
      }`}
    >
      <Sparkles
        className={`mt-0.5 size-4 shrink-0 ${improved ? "text-mint" : "text-pink"}`}
        strokeWidth={2.5}
      />
      <div className="min-w-0 flex-1">
        <div
          className={`text-xs font-extrabold ${improved ? "text-mint" : "text-pink"}`}
        >
          {t.predictionUpdated}
        </div>
        <div className="mt-0.5 text-xs font-semibold text-text">{message}</div>
        <div className="mt-0.5 text-[11px] font-bold text-muted">{reason}</div>
      </div>
      <button
        onClick={onDismiss}
        aria-label={lang === "en" ? "Dismiss" : "បិទ"}
        className="shrink-0 text-muted"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

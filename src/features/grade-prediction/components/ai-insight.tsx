import { Bot } from "lucide-react";
import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { SubjectPrediction } from "@/utils/gradePrediction";

// Pure template-based copy, NOT a real LLM call — every number below comes
// straight from the mock data passed in, so the text always matches what's
// on screen. Swapping this for a real generated insight later only means
// replacing this function; the card below stays the same.
function buildInsightText(
  lang: Lang,
  t: ReturnType<typeof useT>,
  mostLikelyGrade: string,
  mostLikelyPct: number,
  weakest: SubjectPrediction | undefined,
  weakestDelta: number,
  strongestNames: string[]
): string {
  const weakestName = weakest ? (t[weakest.subject as TranslationKey] ?? weakest.subject) : "";
  const strongList = strongestNames.join(lang === "en" ? " and " : " និង ");

  if (lang === "en") {
    return (
      `Your Grade ${mostLikelyGrade} probability is currently ${mostLikelyPct}%. ` +
      (strongList ? `Your strongest subjects are ${strongList}, ` : "") +
      (weakest ? `but ${weakestName} is currently limiting your overall progress. ` : "") +
      (weakest && weakestDelta < 0
        ? `Your recent ${weakestName} performance dropped by ${Math.abs(weakestDelta)}%, which is affecting your current estimate.`
        : "")
    );
  }
  return (
    `ប្រូបាប៊ីលីតេទទួលបាននិទ្ទេស ${mostLikelyGrade} របស់អ្នកឥឡូវនេះគឺ ${mostLikelyPct}%។ ` +
    (strongList ? `មុខវិជ្ជាខ្លាំងបំផុតរបស់អ្នកគឺ ${strongList} ` : "") +
    (weakest ? `ប៉ុន្តែ ${weakestName} កំពុងកំណត់ការរីកចម្រើនរបស់អ្នក។ ` : "") +
    (weakest && weakestDelta < 0
      ? `សមិទ្ធផល ${weakestName} ថ្មីៗបានធ្លាក់ចុះ ${Math.abs(weakestDelta)}%, ដែលប៉ះពាល់ដល់ការប៉ាន់ស្មានបច្ចុប្បន្ន។`
      : "")
  );
}

export function AiInsight({
  lang,
  mostLikelyGrade,
  mostLikelyPct,
  subjects,
  subjectTrend,
}: {
  lang: Lang;
  mostLikelyGrade: string;
  mostLikelyPct: number;
  subjects: SubjectPrediction[];
  subjectTrend: Record<string, number>;
}) {
  const t = useT(lang);

  const core = subjects.filter((s) => s.countsTowardOverall);
  const weakest = [...core].sort((a, b) => a.pct - b.pct)[0];
  const strongestNames = [...core]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2)
    .map((s) => t[s.subject as TranslationKey] ?? s.subject);
  const weakestDelta = weakest ? (subjectTrend[weakest.subject] ?? 0) : 0;

  const text = buildInsightText(
    lang,
    t,
    mostLikelyGrade,
    mostLikelyPct,
    weakest,
    weakestDelta,
    strongestNames
  );

  return (
    <div className="rounded-2xl border border-purple/15 bg-linear-to-br from-purple/8 via-pink/5 to-blue/8 p-4">
      <div className="mb-2 flex items-center gap-1.5 font-heading text-sm font-extrabold text-purple">
        <Bot className="size-4" strokeWidth={2.5} />
        {t.aiInsight}
      </div>
      <p className="text-xs leading-relaxed font-semibold text-text">{text}</p>
    </div>
  );
}

import { Trophy } from "lucide-react";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { ReviewResult } from "@/utils/spaced-repetition";

/**
 * End-of-session recap — shared by the per-lesson FlashcardRunner and the
 * Daily Review aggregate (review-session.tsx), so the two never show a
 * different-looking finish for the same underlying loop.
 *
 * The breakdown counts are read straight off the session's own ReviewResult
 * log rather than re-deriving anything from the store, so a requeued "Again"
 * card that then gets a "Good" the second time round counts as two real
 * grades — which is what actually happened this session.
 *
 * TWO COLUMNS, NOT FOUR. review-session.tsx's swipe UI only ever produces
 * "again" (មិនទាន់ចងចាំ) or "good" (ចងចាំ) now — see its own header for why
 * "hard"/"easy" are still real ReviewGrade values the scheduler understands,
 * just not ones this UI currently offers. Showing four columns where two are
 * always zero would read as broken; this stays a plain object keyed by grade
 * rather than a fixed-length array so it can grow back to four the moment a
 * caller starts producing those grades again, with no shape change needed.
 */
export function FlashcardSummary({
  title,
  results,
  onExit,
}: {
  title: string;
  results: ReviewResult[];
  onExit: () => void;
}) {
  const counts = { again: 0, hard: 0, good: 0, easy: 0 };
  for (const r of results) counts[r.grade]++;

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "មិនទាន់ចងចាំ", value: counts.again + counts.hard, tone: "text-pink" },
    { label: "ចងចាំ", value: counts.good + counts.easy, tone: "text-mint" },
  ];

  return (
    <FocusLayout
      progressPct={100}
      onExit={onExit}
      footer={<FocusButton onClick={onExit}>← ត្រឡប់</FocusButton>}
    >
      <div className="text-center">
        <Trophy
          className="mx-auto mb-3 size-14 text-yellow md:mb-5 md:size-20"
          strokeWidth={2}
        />
        <div className="font-heading mb-2.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
          បញ្ចប់ការពិនិត្យ!
        </div>
        <div className="mx-auto mb-4 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
          <div className="text-lg font-extrabold">
            {toKhmerDigits(results.length)} កាត
          </div>
          <div className="text-xs font-bold opacity-90">បានពិនិត្យ</div>
        </div>

        <div className="mx-auto grid max-w-xs grid-cols-2 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-purple/10 bg-surface p-3"
            >
              <div className={`text-lg font-extrabold ${s.tone}`}>
                {toKhmerDigits(s.value)}
              </div>
              <div className="text-[11px] font-bold text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs font-bold text-muted">{title}</div>
      </div>
    </FocusLayout>
  );
}

import type { ExamResult } from "@/lib/store";
import { scoreColor, scoreColorHex } from "../score-styles";

/**
 * The score screen, shown after any attempt. Purely presentational: by the time
 * it renders, the parent has already decided what the attempt counted as and
 * written whatever it writes.
 *
 * Khmer copy per EXAM_PAGE_LANG in ../papers.
 */
export function ExamResults({
  result,
  onRetake,
  onBack,
}: {
  result: ExamResult;
  onRetake: () => void;
  onBack: () => void;
}) {
  const pct = result.pct;
  const deg = Math.round((pct / 100) * 360);
  const readiness =
    pct >= 80 ? "ល្អណាស់!" : pct >= 60 ? "ល្អ!" : "ប្រឹងសិក្សា!";

  return (
    <div className="text-center">
      <div
        className="mx-auto mb-5 flex size-32 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${scoreColorHex(pct)} ${deg}deg, var(--color-chart-track) ${deg}deg)`,
        }}
      >
        <div className="flex size-24 flex-col items-center justify-center rounded-full bg-bg">
          <div className={`font-heading text-2xl font-bold ${scoreColor(pct)}`}>
            {pct}%
          </div>
          <div className="text-[9px] font-bold text-muted">ពិន្ទុ</div>
        </div>
      </div>
      <div className="mb-1.5 text-xl font-extrabold">ពិន្ទុប្រឡង</div>
      <div className="mb-4 text-sm font-bold text-muted">
        {result.score}/{result.total} ត្រឹមត្រូវ
      </div>
      <div
        className={`mb-5 rounded-2xl border p-4 text-left ${
          pct >= 80
            ? "border-mint/25 bg-mint/8"
            : pct >= 60
              ? "border-yellow/25 bg-yellow/10"
              : "border-pink/20 bg-pink/8"
        }`}
      >
        <div className={`mb-1 text-xs font-extrabold ${scoreColor(pct)}`}>
          ការត្រៀមខ្លួនប្រឡងបាក់ឌុប
        </div>
        <div className="text-sm font-semibold">{readiness}</div>
      </div>
      <button
        onClick={onRetake}
        className="mb-2.5 block w-full rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
      >
        ប្រឡងម្តងទៀត
      </button>
      <button
        onClick={onBack}
        className="block w-full rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
      >
        ← ត្រឡប់
      </button>
    </div>
  );
}

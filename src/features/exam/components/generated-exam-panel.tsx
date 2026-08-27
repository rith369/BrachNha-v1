import { useBrachNhaStore } from "@/lib/store";
import { MOCK_QS } from "@/data/questions";
import { scoreColor } from "../score-styles";

/**
 * Tab B: the app's own generated practice exam.
 *
 * Behaviour is unchanged from the single-screen /exam this replaced — same
 * MOCK_QS set, same last-three history, same XP. Only its copy moved to Khmer
 * (EXAM_PAGE_LANG in ../papers) and it now sits behind a tab.
 *
 * examResults is read UNFILTERED here, which is one of the reasons a past-paper
 * attempt must never be written into it: those attempts would surface in this
 * list, under the wrong tab, on the same screen. See ExamView.handleSubmit.
 */
export function GeneratedExamPanel({ onStart }: { onStart: () => void }) {
  const examResults = useBrachNhaStore((s) => s.examResults);

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-purple/10 bg-surface p-7 text-center shadow-panel">
        <div className="mb-3 text-5xl">🎯</div>
        <div className="mb-2 text-lg font-extrabold">ចាប់ផ្តើមប្រឡងសាកល្បង</div>
        <div className="mb-4 text-sm font-bold text-muted">
          ឆ្លើយសំណួរទាំងអស់ រួចដាក់ស្នើដើម្បីមើលពិន្ទុ
        </div>
        <div className="font-heading mb-1 text-4xl font-bold text-purple">
          {MOCK_QS.length}
        </div>
        <div className="mb-5 text-xs font-bold text-muted">សំណួរ</div>
        <button
          onClick={onStart}
          className="rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
        >
          ចាប់ផ្តើមប្រឡង
        </button>
      </div>

      {examResults.length > 0 && (
        <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
          <div className="mb-3 text-sm font-extrabold">លទ្ធផលមុន</div>
          <div className="flex flex-col gap-2">
            {[...examResults]
              .slice(-3)
              .reverse()
              .map((r) => (
                <div
                  key={r.date}
                  className="flex items-center justify-between rounded-xl border border-purple/8 bg-purple/4 px-3 py-2.5"
                >
                  <div>
                    <div className="text-sm font-extrabold">
                      {r.score}/{r.total}
                    </div>
                    <div className="text-[11px] font-bold text-muted">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`font-heading text-xl font-bold ${scoreColor(r.pct)}`}
                  >
                    {r.pct}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

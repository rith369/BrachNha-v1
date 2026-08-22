import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import { PlacementTestRunner } from "./placement-test-runner";
import { FOUNDATION_SUBJECTS, getQuestionsBySubject } from "@/utils/placement";

export function PlacementTestPage({ subject }: { subject: string }) {
  const { lang, resolvePlacementTest } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      resolvePlacementTest: s.resolvePlacementTest,
    }))
  );
  const t = useT(lang);
  const navigate = useNavigate();

  const isValid =
    (FOUNDATION_SUBJECTS as readonly string[]).includes(subject) &&
    getQuestionsBySubject(subject).length > 0;

  function back() {
    navigate("/roadmap");
  }

  return (
    <div className="px-4 pt-4 pb-36">
      <div className="font-heading mb-0.5 bg-linear-to-r from-pink via-purple to-blue bg-clip-text pr-14 text-xl font-extrabold text-transparent">
        🎯 {t.placementTest}
      </div>
      <div className="mb-4 pr-14 text-xs font-bold text-muted">
        {t[subject as TranslationKey] ?? subject}
      </div>

      {isValid ? (
        <PlacementTestRunner
          subject={subject}
          lang={lang}
          onComplete={(_pct, isWeak) => {
            resolvePlacementTest(subject, isWeak);
            back();
          }}
          onCancel={back}
        />
      ) : (
        <div className="rounded-2xl border border-purple/10 bg-white p-6 text-center shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
          <div className="mb-3 text-sm font-bold text-muted">
            🔬 {t.testComingSoon}
          </div>
          <button
            onClick={back}
            className="rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
          >
            ← {lang === "en" ? "Back to Roadmap" : "ត្រឡប់ទៅផែនទី"}
          </button>
        </div>
      )}
    </div>
  );
}

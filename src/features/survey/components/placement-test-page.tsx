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

  // The runner owns the whole screen in focus mode (its own top bar carries the
  // X and progress), so it is returned bare — wrapping it in the padded column
  // below would cap its height and strand the pinned footer mid-page.
  if (isValid) {
    return (
      <PlacementTestRunner
        focus
        subject={subject}
        lang={lang}
        onComplete={(_pct, isWeak) => {
          resolvePlacementTest(subject, isWeak);
          back();
        }}
        onCancel={back}
      />
    );
  }

  // Subject with no questions yet (physics/chemistry today) — an ordinary page,
  // so it keeps the heading and normal padding.
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      <div className="font-heading mb-0.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
        🎯 {t.placementTest}
      </div>
      <div className="mb-4 text-xs font-bold text-muted">
        {t[subject as TranslationKey] ?? subject}
      </div>
      <div className="rounded-2xl border border-purple/10 bg-surface p-6 text-center shadow-panel">
        <div className="mb-3 text-sm font-bold text-muted">
          🔬 {t.testComingSoon}
        </div>
        <button
          onClick={back}
          className="rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
        >
          ← {lang === "en" ? "Back to Roadmap" : "ត្រឡប់ទៅផែនទី"}
        </button>
      </div>
    </div>
  );
}

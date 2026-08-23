import { useState } from "react";
import { useNavigate } from "react-router";
import { Flag } from "@/components/ui/flag";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import { FOUNDATION_SUBJECTS } from "@/utils/placement";
import { WeaknessStep, type FoundationStatus } from "./weakness-step";

const FIXED_SUBJECTS = [
  "math",
  "physics",
  "chemistry",
  "biology",
  "history",
  "khmer",
] as const;

const GRADES = ["A", "B", "C", "D", "E"];
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));

interface FormState {
  liked: string[];
  weaknesses: string[];
  foundationStatus: Record<string, FoundationStatus>;
  grade: string;
  months: string;
}

function toggleIn(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

export function SurveyView() {
  const { lang, setLang, userLanguage, completeSurvey } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      setLang: s.setLang,
      userLanguage: s.userLanguage,
      completeSurvey: s.completeSurvey,
    }))
  );
  const t = useT(lang);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    liked: [],
    weaknesses: [],
    foundationStatus: {},
    grade: "",
    months: "",
  });

  const pct = ((step - 1) / 3) * 100;
  const subjectOptions: string[] = userLanguage
    ? [...FIXED_SUBJECTS, userLanguage]
    : [...FIXED_SUBJECTS];

  const allFoundationResolved = FOUNDATION_SUBJECTS.every(
    (s) => !!form.foundationStatus[s]
  );

  function finish() {
    const foundationWeak = FOUNDATION_SUBJECTS.filter((s) => {
      const status = form.foundationStatus[s];
      return status === "weak" || status === "pending";
    });
    completeSurvey({
      strengths: form.liked,
      weaknesses: [...form.weaknesses, ...foundationWeak],
      grade: form.grade,
      months: form.months,
    });
    navigate("/roadmap");
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-4 pt-8 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
            BrachNha ⚔️
          </div>
          <div className="text-xs font-bold text-muted">Bac II Quest</div>
        </div>
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-purple/20 bg-purple/8 px-3 py-1.5 text-xs font-extrabold text-purple"
        >
          <Flag code={lang === "en" ? "kh" : "gb"} className="size-3.5" />
          {lang === "en" ? "ខ្មែរ" : "EN"}
        </button>
      </div>

      <div className="mb-5 text-center">
        <div className="mb-2 text-5xl">⚔️</div>
        <div className="mb-1 text-lg font-extrabold">{t.welcome}</div>
        <div className="text-xs font-bold text-muted">{t.surveyIntro}</div>
      </div>

      <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-purple/10">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {step === 1 && (
          <>
            <div className="mb-3 text-sm font-extrabold">
              ❤️{" "}
              {lang === "en"
                ? "What subjects do you like?"
                : "មុខវិជ្ជាអ្វីដែលអ្នកចូលចិត្ត?"}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {subjectOptions.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setForm((f) => ({ ...f, liked: toggleIn(f.liked, s) }))
                  }
                  className={
                    "rounded-xl border px-3 py-2.5 text-sm font-bold transition " +
                    (form.liked.includes(s)
                      ? "border-mint/40 bg-mint/10 text-mint"
                      : "border-purple/10 bg-surface text-text hover:bg-purple/5")
                  }
                >
                  {t[s as TranslationKey]}
                </button>
              ))}
            </div>
            <button
              disabled={!form.liked.length}
              onClick={() => setStep(2)}
              className="w-full rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta disabled:opacity-40"
            >
              {lang === "en" ? "Next →" : "បន្ត →"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <WeaknessStep
              lang={lang}
              subjectOptions={subjectOptions}
              weaknesses={form.weaknesses}
              onChangeWeaknesses={(next) =>
                setForm((f) => ({ ...f, weaknesses: next }))
              }
              foundationStatus={form.foundationStatus}
              onChangeFoundationStatus={(subject, status) =>
                setForm((f) => ({
                  ...f,
                  foundationStatus: { ...f.foundationStatus, [subject]: status },
                }))
              }
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
              >
                ← {lang === "en" ? "Back" : "ថយ"}
              </button>
              <button
                disabled={!allFoundationResolved}
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta disabled:opacity-40"
              >
                {lang === "en" ? "Next →" : "បន្ត →"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-3 text-sm font-extrabold">
              🎯 {t.targetGrade}
            </div>
            <div className="mb-4 grid grid-cols-5 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm((f) => ({ ...f, grade: g }))}
                  className={
                    "rounded-xl border py-3 text-sm font-extrabold transition " +
                    (form.grade === g
                      ? "border-purple/40 bg-purple/10 text-purple"
                      : "border-purple/10 bg-surface text-text hover:bg-purple/5")
                  }
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
              >
                ← {lang === "en" ? "Back" : "ថយ"}
              </button>
              <button
                disabled={!form.grade}
                onClick={() => setStep(4)}
                className="flex-1 rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta disabled:opacity-40"
              >
                {lang === "en" ? "Next →" : "បន្ត →"}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="mb-3 text-sm font-extrabold">
              📅 {t.monthsLeft}
            </div>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setForm((f) => ({ ...f, months: m }))}
                  className={
                    "rounded-xl border py-2.5 text-sm font-extrabold transition " +
                    (form.months === m
                      ? "border-blue/40 bg-blue/10 text-blue"
                      : "border-purple/10 bg-surface text-text hover:bg-purple/5")
                  }
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
              >
                ← {lang === "en" ? "Back" : "ថយ"}
              </button>
              <button
                disabled={!form.months}
                onClick={finish}
                className="flex-1 rounded-2xl bg-brand-tri bg-[length:200%_auto] px-6 py-3 text-sm font-extrabold text-white shadow-cta animate-shimmer disabled:opacity-40"
              >
                {t.generateRoadmap}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusCard,
  focusKicker,
  focusPrompt,
  focusOption,
} from "@/utils/focus-styles";
import type { ExamQuestion } from "@/types";

export interface ExamScore {
  score: number;
  total: number;
  pct: number;
}

/**
 * The question flow, shared by the generated mock exam and any past paper that
 * has content. Takes its questions as a prop rather than reaching for MOCK_QS,
 * which is what lets one runner serve both tabs.
 *
 * IT PERFORMS NO STORE WRITES. It reports out through onSubmit and the parent
 * decides what an attempt counts as - the same shape as PlacementTestRunner's
 * onComplete, and what keeps "which attempts land in examResults" a single
 * readable branch rather than a property buried in here.
 *
 * The copy in here is lang-driven, not Khmer-only: see the two carve-outs on
 * EXAM_PAGE_LANG in ../papers.
 */
export function ExamRunner({
  questions,
  kicker,
  onExit,
  onSubmit,
}: {
  questions: ExamQuestion[];
  /** Fixed label above every prompt. A past paper is one subject end to end, so
   *  it labels the PAPER. Omitted by the generated exam, which mixes subjects
   *  and falls back to the question's own. */
  kicker?: string;
  onExit: () => void;
  onSubmit: (result: ExamScore) => void;
}) {
  const { lang, setFocusMode } = useBrachNhaStore(
    useShallow((s) => ({ lang: s.lang, setFocusMode: s.setFocusMode }))
  );
  const t = useT(lang);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // This component mounts if and only if a question is on screen, so the effect
  // needs no condition at all: mount means focus on, unmount means focus off.
  // That is strictly safer than the `started && !done` guard it replaced, which
  // lived in a component also mounted for the intro and results screens.
  //
  // THE CLEANUP IS THE LOAD-BEARING HALF. A browser-back out of a running exam
  // would otherwise leave the whole app with every nav control hidden and no way
  // to reach anything. Exit, submit, back and unmount all go through it.
  //
  // setFocusMode is a stable zustand action, so the dep never re-fires. Safe
  // only because exactly one runner is ever mounted - focusMode is a boolean,
  // not a counter.
  useEffect(() => {
    setFocusMode(true);
    return () => setFocusMode(false);
  }, [setFocusMode]);

  function submit() {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    onSubmit({
      score,
      total: questions.length,
      pct: Math.round((score / questions.length) * 100),
    });
  }

  const q = questions[idx];
  const answeredCount = Object.keys(answers).length;
  // t[q.subj] typechecks with no cast: every MockExamSubject value is already a
  // translation key. This replaces a `q.subj === "math" ? t.math : t.biology`
  // that labelled every physics and chemistry question "Biology".
  const label = kicker ?? (q.subj ? t[q.subj] : "");

  return (
    // Focus mode: no sidebar, bottom nav, hamburger or chat FAB while a question
    // is on screen. confirmExit because leaving discards every answer so far.
    <FocusLayout
      progressPct={((idx + 1) / questions.length) * 100}
      onExit={onExit}
      confirmExit
      meta={`Q${idx + 1}/${questions.length} · ${answeredCount} ${lang === "en" ? "done" : "រួច"}`}
      footer={
        <div className="flex gap-2.5">
          {idx > 0 && (
            <FocusButton variant="secondary" onClick={() => setIdx(idx - 1)}>
              ← {lang === "en" ? "Prev" : "មុន"}
            </FocusButton>
          )}
          {idx < questions.length - 1 ? (
            <FocusButton onClick={() => setIdx(idx + 1)}>
              {lang === "en" ? "Next →" : "បន្ត →"}
            </FocusButton>
          ) : (
            <FocusButton
              onClick={submit}
              disabled={answeredCount < questions.length}
            >
              {t.submitExam}
            </FocusButton>
          )}
        </div>
      }
    >
      <div className={focusCard}>
        <div className={`mb-2.5 text-purple ${focusKicker}`}>{label}</div>
        <div className={`mb-4 md:mb-6 ${focusPrompt}`}>{q.q[lang]}</div>
        <div className="flex flex-col gap-2 md:gap-3">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [idx]: opt })}
              className={
                focusOption +
                " " +
                (answers[idx] === opt
                  ? "border-purple/40 bg-purple/10 text-purple"
                  : "border-purple/10 bg-surface text-text hover:bg-purple/5")
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </FocusLayout>
  );
}

import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { Lang } from "@/types";
import { FOUNDATION_SUBJECTS, getQuestionsBySubject } from "@/utils/placement";
import { PlacementTestRunner } from "./placement-test-runner";

export type FoundationStatus = "weak" | "notWeak" | "pending";

function toggleIn(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

function chipClass(selected: boolean, tone: "pink" | "mint" | "purple") {
  if (!selected) return "border-purple/10 bg-surface text-text hover:bg-purple/5";
  return {
    pink: "border-pink/40 bg-pink/10 text-pink",
    mint: "border-mint/40 bg-mint/10 text-mint",
    purple: "border-purple/40 bg-purple/10 text-purple",
  }[tone];
}

export function WeaknessStep({
  lang,
  subjectOptions,
  weaknesses,
  onChangeWeaknesses,
  foundationStatus,
  onChangeFoundationStatus,
}: {
  lang: Lang;
  subjectOptions: string[];
  weaknesses: string[];
  onChangeWeaknesses: (next: string[]) => void;
  foundationStatus: Record<string, FoundationStatus>;
  onChangeFoundationStatus: (subject: string, status: FoundationStatus) => void;
}) {
  const t = useT(lang);
  const { schedulePlacementTest, pendingPlacementTests } = useBrachNhaStore(
    useShallow((s) => ({
      schedulePlacementTest: s.schedulePlacementTest,
      pendingPlacementTests: s.pendingPlacementTests,
    }))
  );

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"test" | "schedule" | null>(
    null
  );
  const [scheduleDate, setScheduleDate] = useState("");

  const foundationSet: readonly string[] = FOUNDATION_SUBJECTS;
  const foundationSubjects = subjectOptions.filter((s) =>
    foundationSet.includes(s)
  );
  const otherSubjects = subjectOptions.filter(
    (s) => !foundationSet.includes(s)
  );

  const todayISO = new Date().toISOString().slice(0, 10);

  function closePanel() {
    setActiveSubject(null);
    setActiveMode(null);
  }

  function confirmSchedule() {
    if (!activeSubject || !scheduleDate) return;
    schedulePlacementTest(activeSubject, scheduleDate);
    onChangeFoundationStatus(activeSubject, "pending");
    closePanel();
  }

  return (
    <>
      <div className="mb-3 text-sm font-extrabold">⚠️ {t.weaknesses}</div>

      <div className="mb-4 flex flex-col gap-2.5">
        {foundationSubjects.map((subject) => {
          const status = foundationStatus[subject];
          const hasQuestions = getQuestionsBySubject(subject).length > 0;
          const isActive = activeSubject === subject;
          const pending = pendingPlacementTests.find(
            (p) => p.subject === subject
          );

          return (
            <div
              key={subject}
              className="rounded-xl border border-purple/10 bg-purple/4 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-extrabold">
                  {t[subject as TranslationKey]}
                </div>
                {status === "pending" && pending && (
                  <div className="rounded-full bg-yellow/15 px-2 py-0.5 text-[10px] font-extrabold text-yellow">
                    📅 {t.scheduledFor}{" "}
                    {new Date(pending.scheduledDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {isActive && activeMode === "test" ? (
                <PlacementTestRunner
                  subject={subject}
                  lang={lang}
                  onComplete={(_pct, isWeak) => {
                    onChangeFoundationStatus(subject, isWeak ? "weak" : "notWeak");
                    closePanel();
                  }}
                  onCancel={closePanel}
                />
              ) : isActive && activeMode === "schedule" ? (
                <div>
                  <input
                    type="date"
                    min={todayISO}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mb-2 w-full rounded-xl border border-purple/10 bg-surface px-3.5 py-2.5 text-sm font-bold text-text outline-none focus:border-purple/40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={closePanel}
                      className="flex-1 rounded-xl border border-purple/20 bg-surface px-3 py-2 text-xs font-extrabold text-purple"
                    >
                      ← {lang === "en" ? "Back" : "ត្រឡប់"}
                    </button>
                    <button
                      disabled={!scheduleDate}
                      onClick={confirmSchedule}
                      className="flex-1 rounded-xl bg-brand px-3 py-2 text-xs font-extrabold text-white disabled:opacity-40"
                    >
                      {t.confirmSchedule}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["weak", "notWeak", "notSure"] as const).map((choice) => {
                      const tone =
                        choice === "weak"
                          ? "pink"
                          : choice === "notWeak"
                            ? "mint"
                            : "purple";
                      const selected =
                        choice === "notSure"
                          ? isActive || status === "pending"
                          : status === choice;
                      return (
                        <button
                          key={choice}
                          onClick={() => {
                            if (choice === "notSure") {
                              setActiveMode(null);
                              setActiveSubject((prev) =>
                                prev === subject ? null : subject
                              );
                            } else {
                              onChangeFoundationStatus(subject, choice);
                              closePanel();
                            }
                          }}
                          className={
                            "rounded-lg border px-2 py-2 text-[11px] font-bold transition " +
                            chipClass(selected, tone)
                          }
                        >
                          {t[choice]}
                        </button>
                      );
                    })}
                  </div>

                  {isActive &&
                    (hasQuestions ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setActiveMode("test")}
                          className="flex-1 rounded-lg bg-brand px-2 py-2 text-[11px] font-extrabold text-white"
                        >
                          {t.testMeNow}
                        </button>
                        <button
                          onClick={() => {
                            setActiveMode("schedule");
                            setScheduleDate("");
                          }}
                          className="flex-1 rounded-lg border border-purple/20 bg-surface px-2 py-2 text-[11px] font-extrabold text-purple"
                        >
                          {t.scheduleForLater}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="mb-1.5 text-[11px] font-bold text-muted">
                          🔬 {t.testComingSoon}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              onChangeFoundationStatus(subject, "weak");
                              closePanel();
                            }}
                            className="rounded-lg border border-pink/30 bg-pink/8 px-2 py-2 text-[11px] font-bold text-pink"
                          >
                            {t.weak}
                          </button>
                          <button
                            onClick={() => {
                              onChangeFoundationStatus(subject, "notWeak");
                              closePanel();
                            }}
                            className="rounded-lg border border-mint/30 bg-mint/8 px-2 py-2 text-[11px] font-bold text-mint"
                          >
                            {t.notWeak}
                          </button>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {otherSubjects.map((s) => (
          <button
            key={s}
            onClick={() => onChangeWeaknesses(toggleIn(weaknesses, s))}
            className={
              "rounded-xl border px-3 py-2.5 text-sm font-bold transition " +
              (weaknesses.includes(s)
                ? "border-pink/40 bg-pink/10 text-pink"
                : "border-purple/10 bg-surface text-text hover:bg-purple/5")
            }
          >
            {t[s as TranslationKey]}
          </button>
        ))}
      </div>
    </>
  );
}

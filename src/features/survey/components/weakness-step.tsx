import { useState } from "react";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { Lang } from "@/types";
import { FOUNDATION_SUBJECTS } from "@/utils/placement";

export type FoundationStatus = "weak" | "notWeak";

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

/**
 * Survey step 3. The 3 foundation subjects — math/physics/chemistry — get a
 * Weak / Not weak / Not sure row each; the other 4 keep the plain toggle grid.
 *
 * All three foundation subjects take the SAME path: "Not sure" expands to a
 * "placement test coming soon" note and asks the student to answer on instinct
 * instead. Math briefly had a live inline test and a way to book one for later,
 * and both were pulled — a test that exists for one subject out of three reads
 * as a bug rather than a feature, and booking a day for a test nobody can sit
 * yet promises something the app can't keep.
 *
 * Fully controlled, and deliberately touches no store: every answer goes up
 * through the callbacks and the survey commits once, in `finish()`.
 */
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

  // Which subject's "Not sure" row is expanded. Nothing else opens a panel now.
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const foundationSet: readonly string[] = FOUNDATION_SUBJECTS;
  const foundationSubjects = subjectOptions.filter((s) =>
    foundationSet.includes(s)
  );
  const otherSubjects = subjectOptions.filter(
    (s) => !foundationSet.includes(s)
  );

  function answer(subject: string, status: FoundationStatus) {
    onChangeFoundationStatus(subject, status);
    setActiveSubject(null);
  }

  return (
    <>
      <div className="mb-3 text-sm font-extrabold">⚠️ {t.weaknesses}</div>

      <div className="mb-4 flex flex-col gap-2.5">
        {foundationSubjects.map((subject) => {
          const status = foundationStatus[subject];
          const isActive = activeSubject === subject;

          return (
            <div
              key={subject}
              className="rounded-xl border border-purple/10 bg-purple/4 p-3"
            >
              <div className="mb-2 text-sm font-extrabold">
                {t[subject as TranslationKey]}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(["weak", "notWeak", "notSure"] as const).map((choice) => {
                  const tone =
                    choice === "weak"
                      ? "pink"
                      : choice === "notWeak"
                        ? "mint"
                        : "purple";
                  const selected =
                    choice === "notSure" ? isActive : status === choice;
                  return (
                    <button
                      key={choice}
                      onClick={() => {
                        if (choice === "notSure") {
                          setActiveSubject((prev) =>
                            prev === subject ? null : subject
                          );
                        } else {
                          answer(subject, choice);
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

              {/* "Not sure" can't be a final answer — nothing downstream knows
                  what to do with it — so it asks again in gentler terms rather
                  than leaving the row unresolved. */}
              {isActive && (
                <div className="mt-2">
                  <div className="mb-1.5 text-[11px] font-bold text-muted">
                    🔬 {t.testComingSoon}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => answer(subject, "weak")}
                      className="rounded-lg border border-pink/30 bg-pink/8 px-2 py-2 text-[11px] font-bold text-pink"
                    >
                      {t.weak}
                    </button>
                    <button
                      onClick={() => answer(subject, "notWeak")}
                      className="rounded-lg border border-mint/30 bg-mint/8 px-2 py-2 text-[11px] font-bold text-mint"
                    >
                      {t.notWeak}
                    </button>
                  </div>
                </div>
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

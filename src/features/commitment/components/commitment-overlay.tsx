import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { GRADE_HOURS, computeDailyMission } from "@/utils/roadmap";
import { monthsUntilExam } from "@/utils/exam-date";
import { isBlankSignature } from "@/utils/signature";
import type { Commitment } from "@/types";
import { PLEDGE_COPY, splitEmphasis } from "../copy";
import { SignaturePad, type SignatureValue } from "./signature-pad";
import { SignatureDisplay } from "./signature-display";

/** How long the "Committed!" state holds before the overlay closes. */
const CONFIRM_MS = 1400;

// Rendered by AppShell (not by RoadmapView) so `absolute inset-0` anchors to
// the app frame rather than to the roadmap's scrolling container — the same
// reason ChatOverlay lives there, and the same reason neither uses ui/sheet,
// which portals to document.body and escapes the max-w-lg frame.
export function CommitmentOverlay() {
  const {
    lang,
    userName,
    userData,
    commitment,
    signCommitment,
    setPledgeOpen,
    markPledgeSeen,
  } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userName: s.userName,
      userData: s.userData,
      commitment: s.commitment,
      signCommitment: s.signCommitment,
      setPledgeOpen: s.setPledgeOpen,
      markPledgeSeen: s.markPledgeSeen,
    }))
  );
  const c = PLEDGE_COPY[lang];
  const navigate = useNavigate();

  // Captured once at mount: opened from the roadmap CTA (nothing signed yet)
  // means signing or skipping should carry on to Home, while opening it from
  // the banner's Re-sign should drop the student back on the roadmap.
  const [hadCommitment] = useState(() => commitment !== null);
  const [value, setValue] = useState<SignatureValue>({
    kind: "drawn",
    signature: "",
  });
  const [confirming, setConfirming] = useState(false);

  const hours = GRADE_HOURS[userData.grade] || 2;
  // Read live for the pledge text the student is about to sign, then frozen
  // into the Commitment below — that snapshot is what they actually agreed to.
  const monthsLeft = monthsUntilExam();
  const mission = computeDailyMission(userData.grade, monthsLeft);

  const canCommit =
    value.kind === "typed"
      ? value.signature.trim().length > 0
      : !isBlankSignature(value.signature);

  // The single exit for all four paths — X, "Maybe later", and the post-commit
  // timer — which is why marking the pledge seen belongs here and nowhere else.
  function close() {
    setPledgeOpen(false);
    markPledgeSeen();
    if (!hadCommitment) navigate("/");
  }

  function commit() {
    const signed: Commitment = {
      kind: value.kind,
      signature: value.signature.trim(),
      signedAt: new Date().toISOString(),
      // Snapshot, not a live read — see the Commitment type.
      grade: userData.grade,
      months: String(monthsLeft),
      hoursPerDay: hours,
      mission,
    };
    signCommitment(signed);
    setConfirming(true);
  }

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(close, CONFIRM_MS);
    return () => clearTimeout(id);
    // close() only reads values fixed for this mount (hadCommitment, navigate,
    // and the store actions); re-running on every render would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirming]);

  const pills = [
    { label: c.targetGrade, value: userData.grade || "—" },
    { label: c.hoursADay, value: `${hours}` },
    { label: c.monthsLeft, value: String(monthsLeft) },
  ];

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-50 flex flex-col bg-bg"
    >
      {confirming ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="animate-banner-in flex flex-col items-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-[var(--brand-pink)] via-[var(--brand-purple)] to-[var(--brand-blue)] text-on-brand shadow-cta-lg">
              <Check className="size-8" strokeWidth={3} />
            </div>
            <div className="font-heading text-xl font-extrabold">
              {c.committed}
            </div>
            <div className="mt-1 text-center text-xs font-bold text-muted">
              {c.committedSub}
            </div>
            <div className="mt-5 flex h-20 w-56 items-center justify-center rounded-2xl border border-purple/10 bg-surface px-4">
              <SignatureDisplay kind={value.kind} signature={value.signature} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto flex w-full max-w-2xl shrink-0 items-start justify-between px-5 pt-4 pb-3">
            <div>
              <div className="font-heading bg-brand-tri bg-clip-text text-lg font-extrabold text-transparent">
                ✍️ {c.title}
              </div>
              <div className="text-xs font-bold text-muted">{c.subtitle}</div>
            </div>
            <button
              onClick={close}
              aria-label={c.close}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-purple/10 bg-surface text-purple active:scale-95"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mx-auto w-full min-h-0 max-w-2xl flex-1 overflow-y-auto px-5 pb-4">
            <div className="mb-4 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
              <p className="text-sm font-bold text-text">
                {splitEmphasis(c.pledge({
                  name: userName,
                  grade: userData.grade,
                  months: String(monthsLeft),
                  hours,
                  lessons: mission.lessons,
                  practice: mission.practice,
                  flashcards: mission.flashcards,
                })).map((seg, i) =>
                  seg.strong ? (
                    <strong key={i} className="font-extrabold text-purple">
                      {seg.text}
                    </strong>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {pills.map((pill) => (
                <div
                  key={pill.label}
                  className="rounded-2xl border border-purple/10 bg-surface p-3 text-center shadow-panel-sm"
                >
                  <div className="font-heading text-lg font-extrabold text-purple">
                    {pill.value}
                  </div>
                  <div className="text-[10px] font-extrabold text-muted">
                    {pill.label}
                  </div>
                </div>
              ))}
            </div>

            <SignaturePad
              lang={lang}
              defaultName={userName}
              onChange={setValue}
            />
          </div>

          <div className="shrink-0 px-5 pt-2 pb-6">
            <button
              onClick={commit}
              disabled={!canCommit}
              className="w-full rounded-2xl bg-brand-tri bg-[length:200%_auto] px-6 py-3.5 text-sm font-extrabold text-white shadow-cta animate-shimmer disabled:opacity-40"
            >
              {c.commit} ✍️
            </button>
            <button
              onClick={close}
              className="mt-2 w-full py-2 text-xs font-extrabold text-muted active:scale-[0.98]"
            >
              {c.later}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

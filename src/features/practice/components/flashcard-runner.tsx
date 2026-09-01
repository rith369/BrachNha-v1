import { useState } from "react";
import { useNavigate } from "react-router";
import { Layers, Pointer, Trophy } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { focusBody, focusPrompt } from "@/utils/focus-styles";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { PracticeCard } from "@/types";
import type { PracticeMode } from "../practice";

/**
 * A lesson's flashcard deck, one card at a time.
 *
 * FOCUS MODE COMES FROM THE ROUTE, not from the store's `focusMode` flag. That
 * flag is read by useMentorBlocked() as "a mock exam is being answered", and
 * hooks/use-focus-mode.ts warns that a second screen setting it for another
 * reason means the two questions have come apart — which is exactly this case:
 * a deck should hide the navigation but KEEP KruAI, the same rule a lesson gets.
 * isPracticeRunRoute() in utils/focus-routes.ts answers it by pathname instead,
 * so no store flag is borrowed and isAssessmentRoute() stays untouched.
 *
 * That also removes the failure mode ExamRunner's cleanup effect exists to
 * prevent: a browser-back out of a running deck changes the pathname, so the
 * navigation comes back on its own with nothing to unset.
 *
 * showStats is ON. This is a lesson-like activity and the lessons opt in; only
 * the two assessments leave the counters off, because a live XP counter turns a
 * measurement into a scoreboard.
 *
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */
export function FlashcardRunner({
  cards,
  subjectId,
  mode,
  title,
}: {
  cards: PracticeCard[];
  subjectId: string;
  /** Carried only so the X returns to the list the student came from. */
  mode: PracticeMode;
  /** The lesson's name, shown on the completion screen. */
  title: string;
}) {
  const navigate = useNavigate();
  const completeTask = useBrachNhaStore((s) => s.completeTask);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // One entry per card the student has actually turned over. Kept so stepping
  // back shows a card already revealed rather than face-down again, and so the
  // Continue gate below can't be walked past by going back and forward.
  const [seen, setSeen] = useState<Record<number, true>>({});

  const done = index >= cards.length;
  const card = cards[index];
  const total = cards.length;

  function exit() {
    navigate(`/practice/${mode}/${subjectId}`);
  }

  function show(next: number) {
    setIndex(next);
    setFlipped(!!seen[next]);
  }

  function flip() {
    setFlipped((f) => !f);
    setSeen((prev) => ({ ...prev, [index]: true }));
  }

  function finish() {
    // Ticks the SAME `tasks.flashcards` field Home's daily checklist and
    // Roadmap's Daily Mission read, so finishing a deck is one real completion
    // rather than a second tracker beside the self-reported one. completeTask
    // awards its own XP and is a no-op if the row is already ticked today.
    completeTask("flashcards");
    setIndex(cards.length);
  }

  const footer = done ? (
    <FocusButton onClick={exit}>← ត្រឡប់</FocusButton>
  ) : (
    // Disabled until the card has been turned over, the same gate SectionDetail
    // puts on its quiz: a deck that can be clicked past without reading the
    // answer isn't revision. Disabled rather than absent, because a button that
    // appears out of nowhere shifts the layout under the student's thumb.
    <FocusButton
      onClick={() => (index === total - 1 ? finish() : show(index + 1))}
      disabled={!seen[index]}
    >
      {index === total - 1 ? "បញ្ចប់ →" : "បន្ត →"}
    </FocusButton>
  );

  return (
    <FocusLayout
      progressPct={(Math.min(index, total) / total) * 100}
      onExit={exit}
      // Absent on the first card (the X is the only way out) and on the
      // completion screen, where the deck is already banked.
      onBack={index > 0 && !done ? () => show(index - 1) : undefined}
      showStats
      meta={`${toKhmerDigits(Math.min(index + 1, total))} / ${toKhmerDigits(total)}`}
      footer={footer}
    >
      {done ? (
        <div className="text-center">
          <Trophy
            className="mx-auto mb-3 size-14 text-yellow md:mb-5 md:size-20"
            strokeWidth={2}
          />
          <div className="font-heading mb-2.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
            បញ្ចប់ Flashcard!
          </div>
          <div className="mx-auto mb-3 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
            <div className="text-lg font-extrabold">
              {toKhmerDigits(total)} កាត
            </div>
            <div className="text-xs font-bold opacity-90">បានរំលឹក</div>
          </div>
          <div className="text-xs font-bold text-muted">{title}</div>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
            <Layers className="size-4 shrink-0" strokeWidth={2.5} />
            Flashcard
          </div>

          {/* The flip is the same technique the legacy lesson flow uses at
              lesson-detail.tsx step 2 — a preserve-3d container with two
              backface-hidden faces, one pre-rotated. Transform-only, so it runs
              on the compositor. */}
          <button onClick={flip} className="w-full [perspective:1000px]">
            <div
              className="relative h-52 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] md:h-64 lg:h-72"
              style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-purple/15 bg-surface p-6 text-center shadow-panel [backface-visibility:hidden]">
                <div className={`whitespace-pre-line ${focusPrompt}`}>
                  {card.front}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted">
                  <Pointer className="size-3.5 shrink-0" strokeWidth={2.5} />
                  ចុចដើម្បីមើលចម្លើយ
                </div>
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-mint/25 bg-mint/8 p-6 text-center shadow-panel [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div
                  className={`whitespace-pre-line text-mint ${focusPrompt}`}
                >
                  {card.back}
                </div>
                <div className={`mt-3 text-muted ${focusBody}`}>
                  {card.front}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}
    </FocusLayout>
  );
}

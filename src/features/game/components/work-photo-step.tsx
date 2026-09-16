import { Camera } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { gameCopy, num } from "../copy";
import { QuestionPhotos } from "./question-photos";
import type { MyWorkPhotos } from "../use-work-photos";
import type { ExamQuestion } from "@/types";

/**
 * Photograph your working, question by question, between the result and the
 * answers.
 *
 * ── ONE SCREEN, NOT A STEP PER QUESTION ────────────────────────────────────
 *
 * Photos belong to a question now, and several can belong to one. The obvious
 * build is a camera screen per question, and that would be a forced march: five
 * questions is five screens before a student sees a single answer, including
 * the ones they did in their head. Instead every question is listed here with
 * its own Add photo, a student photographs the ones that had working, and moves
 * on when they choose.
 *
 * ── WHY IT STILL SITS BEFORE THE ANSWERS ───────────────────────────────────
 *
 * AFTER the result, because this is where uploads can fail — a camera, a
 * permission, mobile data — and that must never cost a student their score.
 *
 * BEFORE the answers, which is the load-bearing half: once the correct answers
 * are on screen, a photo of "my working" is a photo of working that could be
 * corrected first. Taken while a student still only knows their score, it is
 * worth swapping.
 *
 * ── AND WHY MOVING ON WITHOUT ANY IS ALLOWED ───────────────────────────────
 *
 * A broken camera must not permanently hide a review already earned, so the
 * page's button reaches the answers whatever was photographed. What adding none
 * does NOT reach is the other student's working — the reciprocity gate, stated
 * on this screen so it is a choice rather than a surprise.
 *
 * It owns no upload state: the same photos are shown under each answer after the
 * reveal, so both read one useMyWorkPhotos held by the page.
 */
export function WorkPhotoStep({
  questions,
  mine,
}: {
  questions: ExamQuestion[];
  mine: MyWorkPhotos;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <Camera
          className="mx-auto mb-2 size-12 text-purple md:size-16"
          strokeWidth={2}
        />
        <div className="font-heading mb-1 text-lg font-extrabold md:text-xl">
          {t.photoStepTitle}
        </div>
        <p className="mx-auto max-w-sm text-sm font-bold text-muted">
          {t.photoPrompt}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs font-bold text-muted">
          {t.photoWhy}
        </p>
      </div>

      {questions.map((q, i) => (
        <div
          key={i}
          className="rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm"
        >
          <div className="mb-1 text-[10px] font-extrabold text-muted">
            {t.questionLabel} {num(i + 1, lang)}
          </div>
          {/* Two lines, clamped: enough to recognise which question this is on
              the paper in front of you. The full text and its options belong to
              the answers screen, which this deliberately does not preview. */}
          <div className="mb-3 line-clamp-2 text-sm font-extrabold">
            {q.q[lang]}
          </div>
          <QuestionPhotos question={i} mine={mine} />
        </div>
      ))}

      {!mine.uploaded && (
        <p className="text-center text-xs font-bold text-muted">{t.skipHint}</p>
      )}
    </div>
  );
}

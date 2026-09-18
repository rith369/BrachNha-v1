import { PenLine } from "lucide-react";
import type { PaperWriting } from "@/types";
import { focusCard, focusKicker, focusLabel, focusPrompt } from "@/utils/focus-styles";

/**
 * The writing part, as the last step of the paper.
 *
 * NOTHING IS TYPED HERE, on the user's decision. The app cannot mark an essay,
 * and a textarea whose contents are never read would promise marking it does not
 * do. The student writes on paper — which is what they will do in the real exam
 * — and the model essay plus the checklist appear on the results screen, AFTER
 * the attempt, where they are something to compare against rather than something
 * to copy from.
 *
 * It carries no score, and the results screen says so rather than folding it
 * silently into a percentage.
 */
export function PaperWritingStep({ writing }: { writing: PaperWriting }) {
  return (
    <div className={focusCard}>
      <div className={`mb-2.5 text-purple ${focusKicker}`}>{writing.title}</div>
      <div className={`mb-4 ${focusPrompt}`}>{writing.prompt}</div>

      <div className="rounded-xl border border-purple/10 bg-purple/5 p-3 md:p-4">
        <div className={`mb-1.5 flex items-center gap-1.5 text-purple ${focusLabel}`}>
          <PenLine className="size-4 shrink-0" strokeWidth={2.5} />
          សរសេរនៅលើក្រដាស
        </div>
        <p className="text-sm font-semibold text-text md:text-base">
          សរសេរអត្ថបទយ៉ាងតិច {writing.minWords} ពាក្យ នៅលើក្រដាសរបស់អ្នក
          ដូចនៅថ្ងៃប្រឡងពិត។ ផ្នែកនេះមិនគិតពិន្ទុក្នុងកម្មវិធីទេ — ពេលដាក់ស្នើរួច
          អ្នកនឹងឃើញអត្ថបទគំរូ និងបញ្ជីពិនិត្យ ដើម្បីប្រៀបធៀបដោយខ្លួនឯង។
        </p>
      </div>
    </div>
  );
}

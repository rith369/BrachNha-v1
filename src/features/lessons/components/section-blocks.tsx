import { CircleCheck, CircleX } from "lucide-react";
import { MathText } from "@/components/shell/math-text";
import { focusBody } from "@/utils/focus-styles";
import { Callout } from "./callout";
import type { Misconception, SectionBlock } from "@/types";

/**
 * The two pieces of a section a student READS, shared by the section screen
 * (section-detail.tsx) and the content editor's preview (/admin/content), so
 * the editor cannot preview something students do not see.
 */

/**
 * Renders a lesson/example/note block: optional lead paragraph, then items.
 *
 * EVERY string goes through MathText, not out as a bare string. Authored section
 * content is written in LaTeX — the maths sections arrive as `$$ (+3)+(+5)=+8 $$`
 * and `$a-b=a+(-b)$` — and without this the student reads the raw source. Hand
 * converting it to Unicode instead was rejected for the reason recorded for the
 * 2025 maths paper: it is a transcription risk with no upper bound on how
 * quietly it fails, and the author writes in LaTeX anyway.
 *
 * FREE FOR THE SECTIONS THAT DON'T USE IT. `splitMath` leaves a dollar-free
 * string untouched and MathText short-circuits it to one inline node, so the
 * four biology sections — which contain zero `$` — render exactly as before.
 *
 * `<div>` rather than `<p>` for the lead and the trailing paragraph, because
 * MathText emits a block `<table>` for a Markdown table — the sign table in
 * math-1-1-1 is one — and a table inside a `<p>` is invalid HTML that the parser
 * silently unnests.
 *
 * KHMER MUST NEVER GO INSIDE `$…$`: KaTeX swaps in maths fonts with no Khmer
 * coverage and renders a row of empty boxes. `splitMath` refuses such a span as
 * a second guard, but authored content should not rely on it.
 */
export function SectionBlockBody({ block }: { block: SectionBlock }) {
  return (
    <>
      {block.intro && (
        // whitespace-pre-line so paragraphs written as paragraphs survive —
        // HTML collapses newlines, which is what turned the long brain lesson
        // into one unreadable run-on block before lesson-detail.tsx got this.
        <div className={`mb-3 whitespace-pre-line ${focusBody}`}>
          <MathText text={block.intro} />
        </div>
      )}
      {/* Bulleted, not bare paragraphs. Every one of these blocks is a LIST —
          "the four systems", "what the lesson covers", "two worked examples" —
          and without a marker the items ran together into one wall of Khmer
          with only the bold label to break them up. list-outside keeps the
          wrapped lines aligned under the text rather than under the bullet. */}
      <ul className="flex list-outside list-disc flex-col gap-2.5 pl-5">
        {block.items.map((item, i) => (
          <li key={i} className={focusBody}>
            {item.label && (
              <span className="font-extrabold text-text">
                <MathText text={item.label} />៖{" "}
              </span>
            )}
            {item.body && (
              <span className="whitespace-pre-line">
                <MathText text={item.body} />
              </span>
            )}
            {item.items && (
              <ul className="mt-1.5 flex list-outside list-[circle] flex-col gap-1 pl-5">
                {item.items.map((sub, j) => (
                  <li key={j} className="whitespace-pre-line">
                    <MathText text={sub} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {block.outro && (
        <div className={`mt-3 whitespace-pre-line ${focusBody}`}>
          <MathText text={block.outro} />
        </div>
      )}
    </>
  );
}

/**
 * One ❌ / ✍️ pair. The misconception is the OUTER card and the truth is nested
 * inside it, rather than two cards side by side: the pairing is the teaching,
 * and separating them lets a student read the wrong half on its own.
 */
export function MisconceptionCard({ mistake }: { mistake: Misconception }) {
  return (
    <Callout tone="pink" icon={CircleX} label="យល់ច្រឡំថា">
      <p className={`whitespace-pre-line ${focusBody}`}>
        <MathText text={mistake.wrong} />
      </p>
      {/* bg-control, not the default bg-surface: the outer card is already
          surface, so a nested one on the same background would have nothing
          but its stripe to separate it. `cn` is twMerge, so this overrides
          rather than stacks. */}
      <Callout tone="mint" icon={CircleCheck} label="ការពិត" className="mt-3 bg-control">
        <p className={`whitespace-pre-line ${focusBody}`}>
          <MathText text={mistake.right} />
        </p>
      </Callout>
    </Callout>
  );
}

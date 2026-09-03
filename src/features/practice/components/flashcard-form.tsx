import { useState } from "react";
import type { PracticeCard } from "@/types";

/**
 * Create/edit form for a student's own flashcard — front and back, nothing
 * else. ONE component for both create and edit (an existing `card` prop
 * pre-fills it and changes the button label), the same shape
 * practice-subject-card.tsx and friends take for reused pieces rather than a
 * near-duplicate "new" form and "edit" form.
 *
 * Deliberately an INLINE panel, not a portalled dialog — this app reaches for
 * a two-tap inline confirm for small destructive/edit actions (Profile's
 * Logout, deleting a KruAI conversation) rather than a modal, and a two-field
 * form is the same size of task. No `ui/sheet.tsx` here for the same reason
 * ChatOverlay avoids it: this renders inside FocusLayout's own frame, and a
 * portal to `document.body` would escape it.
 */
export function FlashcardForm({
  card,
  onSave,
  onCancel,
}: {
  /** Undefined for a new card; an existing card to prefill when editing. */
  card?: PracticeCard;
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
}) {
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const canSave = front.trim().length > 0 && back.trim().length > 0;

  return (
    <div className="mt-3 rounded-2xl border border-purple/15 bg-surface p-3.5 shadow-panel">
      <div className="mb-2 text-xs font-extrabold text-muted">សំណួរ / ខាងមុខ</div>
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        rows={2}
        className="mb-3 w-full resize-none rounded-xl border border-purple/15 bg-bg p-2.5 text-sm font-bold text-text outline-none focus:border-purple/40"
        placeholder="សរសេរសំណួរ ឬពាក្យ..."
      />
      <div className="mb-2 text-xs font-extrabold text-muted">ចម្លើយ / ខាងក្រោយ</div>
      <textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        rows={2}
        className="mb-3 w-full resize-none rounded-xl border border-purple/15 bg-bg p-2.5 text-sm font-bold text-text outline-none focus:border-purple/40"
        placeholder="សរសេរចម្លើយ..."
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-purple/20 bg-purple/8 px-4 py-2.5 text-xs font-extrabold text-purple"
        >
          បោះបង់
        </button>
        <button
          onClick={() => canSave && onSave(front.trim(), back.trim())}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-xs font-extrabold text-white shadow-cta-lg disabled:opacity-40"
        >
          រក្សាទុក
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { CircleCheck, Flag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  alreadyReported,
  reportContent,
  type MistakeKind,
} from "@/lib/content-reports";
import { isContentRef } from "@/utils/content-ref";
import { cn } from "@/utils/cn";

/**
 * "រាយការណ៍កំហុស": a student flags a question as wrong, mistyped or unclear,
 * shown once they have answered it. The team reads these on /admin/mistakes;
 * the fix itself is an edit to the question in the code.
 *
 * KHMER-ONLY, like the section, quiz and exam screens it sits on.
 *
 * ABSENT, not disabled, for a guest and when Supabase is unconfigured: a report
 * needs an account to come from, and a button that cannot send anything would
 * answer a tap with silence. Absent too for a ref that would not pass the
 * database's check (see utils/content-ref.ts).
 *
 * QUIET ON PURPOSE. It sits under the explanation in muted text and opens an
 * inline panel rather than a dialog, so it never competes with the answer and
 * the next button for attention.
 */

const KINDS: { id: MistakeKind; label: string }[] = [
  { id: "wrong_answer", label: "ចម្លើយខុស" },
  { id: "typo", label: "អក្ខរាវិរុទ្ធខុស" },
  { id: "unclear", label: "មិនច្បាស់" },
  { id: "other", label: "ផ្សេងៗ" },
];

type Phase = "idle" | "open" | "sending" | "sent";

export function ReportMistake({
  contentRef,
  className,
}: {
  contentRef: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<Phase>(() =>
    alreadyReported(contentRef) ? "sent" : "idle"
  );
  const [kind, setKind] = useState<MistakeKind | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<"too_many" | "failed" | null>(null);

  if (!isSupabaseConfigured || !isAuthenticated || !isContentRef(contentRef)) return null;

  async function send() {
    if (!kind) return;
    setPhase("sending");
    setError(null);
    const result = await reportContent(contentRef, kind, note);
    if (result.ok) {
      setPhase("sent");
      return;
    }
    setPhase("open");
    setError(result.reason === "too_many" ? "too_many" : "failed");
  }

  if (phase === "sent") {
    return (
      <p
        role="status"
        className={cn("flex items-center gap-1.5 text-xs font-bold text-muted", className)}
      >
        <CircleCheck className="size-3.5 shrink-0 text-mint" strokeWidth={2.5} />
        អរគុណ! ក្រុម BrachNha នឹងពិនិត្យមើលសំណួរនេះ។
      </p>
    );
  }

  if (phase === "idle") {
    return (
      <div className={cn("flex justify-end", className)}>
        <button
          type="button"
          onClick={() => setPhase("open")}
          className="flex items-center gap-1 text-xs font-bold text-muted underline-offset-2 hover:underline"
        >
          <Flag className="size-3.5" strokeWidth={2.5} />
          រាយការណ៍កំហុស
        </button>
      </div>
    );
  }

  const busy = phase === "sending";
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-3", className)}>
      <div className="mb-2 text-xs font-extrabold">តើសំណួរនេះមានកំហុសអ្វី?</div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            disabled={busy}
            aria-pressed={kind === k.id}
            onClick={() => setKind(k.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs font-bold disabled:opacity-50",
              kind === k.id ? "bg-purple/30 text-text" : "bg-surface text-text hover:bg-purple/5"
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        disabled={busy}
        maxLength={300}
        rows={2}
        onChange={(e) => setNote(e.target.value)}
        placeholder="ពន្យល់បន្ថែម (មិនចាំបាច់)"
        aria-label="ពន្យល់បន្ថែម (មិនចាំបាច់)"
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold outline-none placeholder:text-muted focus:border-purple"
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-bold text-pink">
          {error === "too_many"
            ? "ថ្ងៃនេះអ្នកបានរាយការណ៍ច្រើនហើយ។ សូមព្យាយាមម្តងទៀតនៅថ្ងៃស្អែក។"
            : "មិនអាចផ្ញើបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។"}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setPhase("idle");
            setKind(null);
            setNote("");
            setError(null);
          }}
          className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold disabled:opacity-50"
        >
          បោះបង់
        </button>
        <button
          type="button"
          disabled={!kind || busy}
          onClick={() => void send()}
          className="rounded-xl border border-border bg-[var(--brand-purple)] px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-40"
        >
          {busy ? "កំពុងផ្ញើ…" : "ផ្ញើ"}
        </button>
      </div>
    </div>
  );
}

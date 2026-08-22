import { PenLine } from "lucide-react";
import type { Commitment, Lang } from "@/types";
import { PLEDGE_COPY } from "@/features/commitment/copy";
import { SignatureDisplay } from "@/features/commitment/components/signature-display";

// Same locale pair the chat history uses for its date lines.
function formatSignedDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "km-KH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CommitmentBanner({
  commitment,
  lang,
  onResign,
}: {
  commitment: Commitment;
  lang: Lang;
  onResign: () => void;
}) {
  const c = PLEDGE_COPY[lang];

  return (
    <div className="mb-4 rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
      <div className="flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">✍️ {c.title}</div>
        <button
          onClick={onResign}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold text-purple active:scale-[0.98]"
        >
          <PenLine className="size-3.5" strokeWidth={2.75} />
          {c.resign}
        </button>
      </div>

      <div className="mt-1 flex h-16 items-center border-b border-dashed border-purple/20">
        <SignatureDisplay
          kind={commitment.kind}
          signature={commitment.signature}
          className={commitment.kind === "drawn" ? "max-h-16" : ""}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-extrabold text-muted">
        <span>{c.signedOn(formatSignedDate(commitment.signedAt, lang))}</span>
        <span>
          {c.targetGrade}: {commitment.grade} · {commitment.hoursPerDay}
          {lang === "en" ? "h/day" : " ម៉ោង/ថ្ងៃ"}
        </span>
      </div>
    </div>
  );
}

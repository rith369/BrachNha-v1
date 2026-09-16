import { useBrachNhaStore } from "@/lib/store";
import { progressSubjects, trendLabel, type ProgressSubject } from "../subjects";
import type { ProgressSummary } from "../summary";

export function SubjectBreakdown({ summary }: { summary: ProgressSummary }) {
  // Only userLanguage matters here — which language subject shows. The name
  // itself is always English; see progressSubjects()'s own comment for why.
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const subjects = progressSubjects(summary, userLanguage);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        Subject Breakdown 🎯
      </div>
      <div className="flex flex-col gap-3.5">
        {subjects.map((s) =>
          s.questions === 0 ? (
            <SubjectRowEmpty key={s.id} subject={s} />
          ) : (
            <SubjectRow key={s.id} subject={s} />
          )
        )}
      </div>
    </div>
  );
}

/**
 * A subject with no recorded work.
 *
 * ITS OWN COMPONENT, so the branch above is a one-line return rather than a
 * nullable field threaded through the full row — the same extraction
 * `EmptyQueue` and `QuizSummary` got, and for the same React Compiler reason.
 *
 * NO score, NO trend, NO progress bar, NO sparkline. `0%` beside `▲ +0%` would
 * be two invented facts about a subject the student has never opened.
 */
function SubjectRowEmpty({ subject: s }: { subject: ProgressSubject }) {
  const Icon = s.icon;
  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-3.5 opacity-60 shadow-panel-sm">
      <div className="flex items-center gap-2.5">
        <Icon
          className="size-5 shrink-0"
          style={{ color: s.color }}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold">{s.name}</div>
          <div className="text-[10px] font-bold text-muted">Not started yet</div>
        </div>
      </div>
    </div>
  );
}

function SubjectRow({ subject: s }: { subject: ProgressSubject }) {
  const Icon = s.icon;
  const up = s.trendPct !== null && s.trendPct > 0;
  const flat = s.trendPct === 0;

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel-sm">
      <div className="mb-2.5 flex items-center gap-2.5">
        {/* The catalog's Lucide icon, tinted to the subject's own accent — not
            the emoji this list used to hand-pick per subject. */}
        <Icon
          className="size-5 shrink-0"
          style={{ color: s.color }}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold">{s.name}</div>
          <div className="text-[10px] font-bold text-muted">
            {s.sessions} {s.sessions === 1 ? "session" : "sessions"} ·{" "}
            {s.questions} {s.questions === 1 ? "question" : "questions"}
          </div>
        </div>
        <div className="text-right">
          {/* Absent below the minimum sample rather than shown — a percentage
              off two questions is noise presented as a finding. */}
          {s.score !== null && (
            <div
              className="font-heading text-lg font-extrabold"
              style={{ color: s.color }}
            >
              {s.score}%
            </div>
          )}
          {/* trendPct is percentage POINTS and needs BOTH 30-day windows to
              have enough questions, so it is null far more often than the score
              is. `s.trendPct >= 0` would read `false` for null and paint a pink
              ▼ on a subject with no trend at all. */}
          {s.trendPct !== null && (
            <div
              className={`text-[10px] font-extrabold ${
                flat ? "text-muted" : up ? "text-mint" : "text-pink"
              }`}
            >
              {trendLabel(s.trendPct)}
            </div>
          )}
        </div>
      </div>

      {/* Rendered only with a real score: `width: "null%"` is silently ignored
          by CSS, so this is the one failure here that would look like a
          styling glitch rather than missing data. */}
      {s.score !== null && (
        <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-purple/8">
          <div
            className="h-full rounded-full"
            style={{ width: `${s.score}%`, background: s.color }}
          />
        </div>
      )}

      {/* Daily question VOLUME over the last 7 days, scaled to this subject's
          own peak — not accuracy, which the demo sparklines implied. Real daily
          accuracy on a one-question day swings to 0 or 100 and the strip becomes
          noise. Absent entirely when nothing was answered all week. */}
      {s.sparkline !== null && (
        <div className="flex h-8 items-end gap-1">
          {s.sparkline.map((h, i, all) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                // min-height so a zero day is still a visible baseline tick
                // rather than a gap that reads as a rendering fault.
                height: `${Math.max(h, 4)}%`,
                background: s.color,
                opacity: 0.35 + (i / all.length) * 0.65,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

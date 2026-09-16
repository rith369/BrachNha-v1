import { useBrachNhaStore } from "@/lib/store";
import { progressSubjects, trendLabel, type ProgressSubject } from "../subjects";
import { MIN_SAMPLE, type ProgressSummary } from "../summary";
import { InfoTip } from "@/components/ui/info-tip";

export function SubjectBreakdown({ summary }: { summary: ProgressSummary }) {
  // Only userLanguage matters here — which language subject shows. The name
  // itself is always English; see progressSubjects()'s own comment for why.
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const subjects = progressSubjects(summary, userLanguage);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        Subject{" "}
        <span className="whitespace-nowrap">
          Breakdown 🎯
          {/* The legend for every part of a row. The rows themselves carry only
              what is specific to THEM — "7 of 8 correct" on the score — so this
              is where the rules that apply to all of them are said once. */}
          <InfoTip label="How to read Subject Breakdown" className="ml-1.5 align-middle">
            <span className="block">
              <b className="font-extrabold">%</b> — how many questions you got
              right, all time. It appears after {MIN_SAMPLE} questions. Tap it to
              see the count.
            </span>
            <span className="mt-1 block">
              <b className="font-extrabold">Long bar</b> — the same score, as a
              bar.
            </span>
            <span className="mt-1 block">
              <b className="font-extrabold">▲ ▼</b> — your last 30 days compared
              with the 30 before, in points. It appears once both have{" "}
              {MIN_SAMPLE}+ questions.
            </span>
            <span className="mt-1 block">
              <b className="font-extrabold">Small bars</b> — how much you
              practised on each of the last 7 days, today on the right.
            </span>
            <span className="mt-1 block">
              <b className="font-extrabold">Sessions</b> — how many times you
              finished a lesson, quiz, exam or flashcard deck. Repeating one on
              the same day counts once.
            </span>
            <span className="mt-1 block">
              Flashcards don&apos;t change your score.
            </span>
          </InfoTip>
        </span>
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

/** "3 sessions · 8 questions". Fragment text, because on an unscored row it
 *  renders inside a button, which may only hold phrasing content. */
function RowMeta({ subject: s }: { subject: ProgressSubject }) {
  return (
    <>
      {s.sessions} {s.sessions === 1 ? "session" : "sessions"} ·{" "}
      {s.questions} {s.questions === 1 ? "question" : "questions"}
    </>
  );
}

/** The trend said as a sentence, for the score's explanation — the row itself
 *  keeps the compact "▲ +6 pts" from trendLabel(). */
function trendSentence(trendPct: number): string {
  if (trendPct === 0) return "The same as the 30 days before.";
  const dir = trendPct > 0 ? "Up" : "Down";
  return `${dir} ${Math.abs(trendPct)} pts on the 30 days before.`;
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
          {/* Below the minimum sample there is no score to tap, so the COUNT
              becomes the tap target instead — it is the one place on an
              unscored row that can say why the bar is missing and how close
              the student is to getting one. */}
          {s.score === null ? (
            <InfoTip
              triggerClassName="text-left text-[10px] font-bold text-muted"
              trigger={<RowMeta subject={s} />}
            >
              {s.correct} of {s.questions} correct so far. Answer{" "}
              {MIN_SAMPLE - s.questions} more to see your score.
            </InfoTip>
          ) : (
            <div className="text-[10px] font-bold text-muted">
              <RowMeta subject={s} />
            </div>
          )}
        </div>
        {/* Absent below the minimum sample rather than shown — a percentage off
            two questions is noise presented as a finding.

            The trend sits INSIDE this branch, which drops nothing: it needs
            MIN_SAMPLE questions in each of two 30-day windows, and both windows
            are part of the all-time count the score is taken from, so a row
            with a trend always has a score. */}
        {s.score !== null && (
          <InfoTip
            triggerClassName="flex flex-col items-end text-right"
            trigger={
              <>
                <span
                  className="font-heading text-lg font-extrabold"
                  style={{ color: s.color }}
                >
                  {s.score}%
                </span>
                {/* trendPct is percentage POINTS and needs BOTH 30-day windows
                    to have enough questions, so it is null far more often than
                    the score is. `s.trendPct >= 0` would read `false` for null
                    and paint a pink ▼ on a subject with no trend at all. */}
                {s.trendPct !== null && (
                  <span
                    className={`text-[10px] font-extrabold ${
                      flat ? "text-muted" : up ? "text-mint" : "text-pink"
                    }`}
                  >
                    {trendLabel(s.trendPct)}
                  </span>
                )}
              </>
            }
          >
            <span className="block">
              {s.correct} of {s.questions} correct, all time.
            </span>
            {s.trendPct !== null && (
              <span className="mt-1 block">{trendSentence(s.trendPct)}</span>
            )}
          </InfoTip>
        )}
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

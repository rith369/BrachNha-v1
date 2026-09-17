import { useBrachNhaStore } from "@/lib/store";
import { InfoTip } from "@/components/ui/info-tip";
import { progressSubjects, type ProgressSubject } from "../subjects";
import { MIN_SAMPLE, type ProgressSummary } from "../summary";
import { PROGRESS_COPY, type ProgressCopy } from "../copy";
import { TitleWithTip } from "./title-with-tip";

export function SubjectBreakdown({ summary }: { summary: ProgressSummary }) {
  // `userLanguage` decides WHICH language subject shows (English or French);
  // `lang` decides what language the page is written in. Different questions.
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const lang = useBrachNhaStore((s) => s.lang);
  const c = PROGRESS_COPY[lang];
  const subjects = progressSubjects(summary, userLanguage, lang);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        {/* The legend for every part of a row. The rows themselves carry only
            what is specific to THEM — "7 of 8 correct" on the score — so this
            is where the rules that apply to all of them are said once. */}
        <TitleWithTip text={c.breakdownTitle} label={c.breakdownAbout}>
          {c.legend(MIN_SAMPLE).map((item, i) => (
            <span key={item.term} className={i === 0 ? "block" : "mt-1 block"}>
              <b className="font-extrabold">{item.term}</b> — {item.text}
            </span>
          ))}
        </TitleWithTip>
      </div>
      <div className="flex flex-col gap-3.5">
        {/* "Not started" means NOTHING recorded — not "no scored questions".
            It branched on `questions` alone once, which put a subject studied
            only with flashcards on the dimmed "Not started yet" row: the page
            telling a student that work they had done did not exist. */}
        {subjects.map((s) =>
          s.questions === 0 && s.reviewed === 0 && s.sessions === 0 ? (
            <SubjectRowEmpty key={s.id} subject={s} c={c} />
          ) : (
            <SubjectRow key={s.id} subject={s} c={c} />
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
function SubjectRowEmpty({ subject: s, c }: { subject: ProgressSubject; c: ProgressCopy }) {
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
          <div className="text-[10px] font-bold text-muted">{c.notStarted}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * "3 sessions · 8 questions · 12 flashcards". Plain text, because on an unscored
 * row it renders inside a button, which may only hold phrasing content.
 *
 * FLASHCARDS APPEAR WHENEVER THERE ARE ANY, on scored rows too. Showing them
 * only until a first question was answered would make the count vanish the
 * moment a student did more work, which reads as the app losing it.
 *
 * "0 questions" is dropped when flashcards are all there is — "1 session · 0
 * questions · 12 flashcards" leads with the one thing they have not done.
 */
function RowMeta({ subject: s, c }: { subject: ProgressSubject; c: ProgressCopy }) {
  const parts = [c.sessions(s.sessions)];
  if (s.questions > 0 || s.reviewed === 0) parts.push(c.questions(s.questions));
  if (s.reviewed > 0) parts.push(c.flashcards(s.reviewed));
  return <>{parts.join(" · ")}</>;
}

function SubjectRow({ subject: s, c }: { subject: ProgressSubject; c: ProgressCopy }) {
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
              trigger={<RowMeta subject={s} c={c} />}
            >
              {/* Two different reasons a row has no score, and the sentence has
                  to name the right one: "0 of 0 correct so far" would be true
                  and would explain nothing to a student who only did flashcards. */}
              {s.questions > 0
                ? c.unscoredTip(s.correct, s.questions, MIN_SAMPLE - s.questions)
                : s.reviewed > 0
                  ? c.flashcardsOnlyTip(MIN_SAMPLE)
                  : c.noScoreTip(MIN_SAMPLE)}
            </InfoTip>
          ) : (
            <div className="text-[10px] font-bold text-muted">
              <RowMeta subject={s} c={c} />
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
                    {c.trend(s.trendPct)}
                  </span>
                )}
              </>
            }
          >
            <span className="block">{c.scoreTip(s.correct, s.questions)}</span>
            {s.trendPct !== null && (
              <span className="mt-1 block">{c.trendSentence(s.trendPct)}</span>
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

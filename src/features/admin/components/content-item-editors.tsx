import { useId, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { MathText } from "@/components/shell/math-text";
import { InfoTip } from "@/components/ui/info-tip";
import type { ContentIssue } from "@/utils/content-check";
import type {
  DeckCardBody,
  DrillQuestion,
  Lang,
  QuizQuestionBody,
  SkillHelp,
} from "@/types";
import { cn } from "@/utils/cn";
import { CONTENT_COPY } from "../content-copy";
import { EMPTY_DRILL, EMPTY_HELP, moveItem } from "../content-edit";
import { FIELD, SMALL_BTN } from "../editor-styles";

/**
 * The parts of the content editor that edit ONE card or ONE question
 * (/admin/content/:kind/:key). The page around them is
 * content-editor-view.tsx; it owns the working copy and the checks.
 *
 * Every text field shows its own problems underneath it, from the same
 * checks Publish obeys (utils/content-check.ts). A field holding maths shows
 * a live preview through MathText, the renderer students see, because a
 * formula is the one thing that cannot be judged from its source.
 */


export function IssueLines({ issues, lang }: { issues: ContentIssue[]; lang: Lang }) {
  const c = CONTENT_COPY[lang];
  if (issues.length === 0) return null;
  return (
    <ul className="mt-1 flex flex-col gap-0.5">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={cn(
            "text-[11px] font-bold [overflow-wrap:anywhere]",
            issue.level === "error" ? "text-pink" : "text-muted"
          )}
        >
          <InfoTip
            triggerClassName="text-left"
            trigger={
              <span>
                {issue.level === "error" ? "✕ " : "! "}
                {c.issues[issue.code]}
                {issue.detail ? ` (${issue.detail})` : ""}
              </span>
            }
          >
            {c.issueHelp[issue.code]}
          </InfoTip>
        </li>
      ))}
    </ul>
  );
}

/** A labelled textarea with its own problems and, when it holds maths, a
 *  preview. `path` is the field path the checks use. */
export function TextField({
  label,
  tip,
  value,
  onChange,
  path,
  issues,
  lang,
  rows = 2,
  maxLength,
}: {
  label: string;
  /** Optional explanation, opened from an ⓘ after the label. */
  tip?: string;
  value: string;
  onChange: (v: string) => void;
  path: string;
  issues: ContentIssue[];
  lang: Lang;
  rows?: number;
  maxLength?: number;
}) {
  const c = CONTENT_COPY[lang];
  const id = useId();
  const mine = issues.filter((i) => i.field === path);
  return (
    <div>
      <div className="text-xs font-bold">
        <label htmlFor={id}>{label}</label>
        {tip && (
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {tip}
          </InfoTip>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, "min-h-10 resize-y", mine.some((i) => i.level === "error") && "border-pink")}
      />
      {value.includes("$") && (
        <div className="mt-1 rounded-lg bg-control px-2.5 py-1.5 text-xs font-semibold whitespace-pre-line">
          <MathText text={value} />
        </div>
      )}
      <IssueLines issues={mine} lang={lang} />
    </div>
  );
}

/** A labelled whole-number box. Empty means "not set" (undefined), so an
 *  optional number can be cleared. */
export function NumberField({
  label,
  tip,
  value,
  onChange,
  path,
  issues,
  lang,
  min,
  max,
}: {
  label: string;
  tip?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  path: string;
  issues: ContentIssue[];
  lang: Lang;
  min?: number;
  max?: number;
}) {
  const c = CONTENT_COPY[lang];
  const id = useId();
  const mine = issues.filter((i) => i.field === path);
  return (
    <div>
      <div className="text-xs font-bold">
        <label htmlFor={id}>{label}</label>
        {tip && (
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {tip}
          </InfoTip>
        )}
      </div>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        step={1}
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={cn(FIELD, "max-w-40", mine.some((i) => i.level === "error") && "border-pink")}
      />
      <IssueLines issues={mine} lang={lang} />
    </div>
  );
}

/** A labelled pick-one list. A stored value missing from `options` is still
 *  shown, so opening an item never silently changes it. */
export function SelectField({
  label,
  tip,
  value,
  options,
  placeholder,
  onChange,
  path,
  issues,
  lang,
}: {
  label: string;
  tip?: string;
  value: string;
  options: readonly { value: string; label: string }[];
  /** The first, empty choice, e.g. "Choose a picture" or "None". */
  placeholder: string;
  onChange: (v: string) => void;
  path: string;
  issues: ContentIssue[];
  lang: Lang;
}) {
  const c = CONTENT_COPY[lang];
  const id = useId();
  const mine = issues.filter((i) => i.field === path);
  const all = value && !options.some((o) => o.value === value) ? [...options, { value, label: value }] : options;
  return (
    <div>
      <div className="text-xs font-bold">
        <label htmlFor={id}>{label}</label>
        {tip && (
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {tip}
          </InfoTip>
        )}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, "max-w-full", mine.some((i) => i.level === "error") && "border-pink")}
      >
        <option value="">{placeholder}</option>
        {all.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IssueLines issues={mine} lang={lang} />
    </div>
  );
}

/** Two taps to remove: the first arms it, the second does it. */
export function RemoveButton({ onRemove, lang, label }: { onRemove: () => void; lang: Lang; label?: string }) {
  const c = CONTENT_COPY[lang];
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="inline-flex gap-1">
      <button type="button" onClick={onRemove} className={cn(SMALL_BTN, "bg-neo-pink text-ink")}>
        <Trash2 className="size-3" strokeWidth={2.5} />
        {c.confirmRemove}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={SMALL_BTN}>
        {c.cancel}
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className={SMALL_BTN} aria-label={label ?? c.remove}>
      <Trash2 className="size-3" strokeWidth={2.5} />
      {label ?? c.remove}
    </button>
  );
}

export function MoveButtons({
  index,
  count,
  onMove,
  lang,
}: {
  index: number;
  count: number;
  onMove: (delta: -1 | 1) => void;
  lang: Lang;
}) {
  const c = CONTENT_COPY[lang];
  return (
    <>
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className={SMALL_BTN} aria-label={c.moveUp}>
        <ArrowUp className="size-3" strokeWidth={2.5} />
      </button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className={SMALL_BTN} aria-label={c.moveDown}>
        <ArrowDown className="size-3" strokeWidth={2.5} />
      </button>
    </>
  );
}

export function ErrorBadge({ issues }: { issues: ContentIssue[] }) {
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.length - errors;
  if (issues.length === 0) return null;
  return (
    <span
      className={cn(
        "rounded-full border border-border px-2 py-0.5 text-[10px] font-extrabold text-ink",
        errors ? "bg-neo-pink" : "bg-neo-yellow"
      )}
    >
      {errors ? `✕ ${errors}` : `! ${warnings}`}
    </span>
  );
}

// ── Flashcards ──────────────────────────────────────────────────────────────

export function CardEditor({
  card,
  index,
  count,
  issues,
  lang,
  onChange,
  onMove,
  onRemove,
}: {
  card: DeckCardBody;
  index: number;
  count: number;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (card: DeckCardBody) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const c = CONTENT_COPY[lang];
  const [preview, setPreview] = useState(false);
  return (
    <li id={`item-${card.id}`} className="rounded-2xl border border-border bg-surface p-3 shadow-panel-sm">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="font-heading text-sm font-extrabold">{c.card(index + 1)}</span>
        <InfoTip
          triggerClassName="font-mono text-[10px] font-bold text-muted"
          trigger={<span>{card.id}</span>}
        >
          {c.tips.cardId}
        </InfoTip>
        <ErrorBadge issues={issues} />
        <span className="ml-auto inline-flex flex-wrap gap-1">
          <button type="button" onClick={() => setPreview(!preview)} className={SMALL_BTN} aria-pressed={preview}>
            <Eye className="size-3" strokeWidth={2.5} />
            {c.preview}
          </button>
          <MoveButtons index={index} count={count} onMove={onMove} lang={lang} />
          <RemoveButton onRemove={onRemove} lang={lang} />
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <TextField label={c.frontLabel} tip={c.tips.front} value={card.front} path="front" issues={issues} lang={lang} onChange={(v) => onChange({ ...card, front: v })} />
        <TextField label={c.backLabel} tip={c.tips.back} value={card.back} path="back" issues={issues} lang={lang} rows={3} onChange={(v) => onChange({ ...card, back: v })} />
      </div>
      <IssueLines issues={issues.filter((i) => i.field === "id")} lang={lang} />
      {preview && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-3 text-sm font-bold whitespace-pre-line">
            <MathText text={card.front} />
          </div>
          <div className="rounded-xl border border-border bg-mint/8 p-3 text-sm font-semibold whitespace-pre-line">
            <MathText text={card.back} />
          </div>
        </div>
      )}
    </li>
  );
}

// ── Quiz questions ──────────────────────────────────────────────────────────

/**
 * The fields every multiple-choice item has: a quiz question, or one of the
 * exercises under its help. The correct answer is chosen by tapping a circle,
 * so it can never be missing from the options; editing the text of the
 * correct option carries `correct` along with it.
 */
export function ChoiceFields({
  prompt,
  options,
  correct,
  explanation,
  promptPath,
  prefix,
  issues,
  lang,
  onChange,
}: {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  promptPath: string;
  prefix: string;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (patch: { prompt?: string; options?: string[]; correct?: string; explanation?: string }) => void;
}) {
  const c = CONTENT_COPY[lang];
  const groupIssues = issues.filter(
    (i) => i.field === `${prefix}options` || i.field === `${prefix}correct`
  );
  return (
    <div className="flex flex-col gap-2">
      <TextField
        label={c.promptLabel}
        value={prompt}
        path={`${prefix}${promptPath}`}
        issues={issues}
        lang={lang}
        onChange={(v) => onChange({ prompt: v })}
      />
      <fieldset>
        <legend className="pr-1 text-xs font-bold">
          {c.optionsLabel}
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {c.tips.options}
          </InfoTip>
        </legend>
        <ul className="mt-1 flex flex-col gap-1.5">
          {options.map((opt, oi) => {
            const isCorrect = opt === correct && correct !== "";
            return (
              <li key={oi} className="flex items-start gap-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isCorrect}
                  aria-label={`${c.correctMark}: ${c.optionN(oi + 1)}`}
                  onClick={() => onChange({ correct: opt })}
                  className={cn(
                    "mt-2.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border",
                    isCorrect ? "bg-mint" : "bg-surface"
                  )}
                >
                  {isCorrect && <Check className="size-3 text-ink" strokeWidth={4} />}
                </button>
                <div className="min-w-0 flex-1">
                  <TextField
                    label={c.optionN(oi + 1)}
                    value={opt}
                    rows={1}
                    path={`${prefix}options.${oi}`}
                    issues={issues}
                    lang={lang}
                    onChange={(v) => {
                      const next = options.map((o, j) => (j === oi ? v : o));
                      onChange(isCorrect ? { options: next, correct: v } : { options: next });
                    }}
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    aria-label={c.removeOption}
                    onClick={() =>
                      onChange({
                        options: options.filter((_, j) => j !== oi),
                        ...(isCorrect ? { correct: "" } : {}),
                      })
                    }
                    className={cn(SMALL_BTN, "mt-6")}
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {options.length < 6 && (
          <button type="button" onClick={() => onChange({ options: [...options, ""] })} className={cn(SMALL_BTN, "mt-1.5")}>
            <Plus className="size-3" strokeWidth={2.5} />
            {c.addOption}
          </button>
        )}
        <IssueLines issues={groupIssues} lang={lang} />
      </fieldset>
      <TextField
        label={c.explanationLabel}
        tip={c.tips.explanation}
        value={explanation}
        rows={3}
        path={`${prefix}explanation`}
        issues={issues}
        lang={lang}
        onChange={(v) => onChange({ explanation: v })}
      />
    </div>
  );
}

function DrillList({
  title,
  tip,
  drills,
  group,
  issues,
  lang,
  onChange,
}: {
  title: string;
  tip: string;
  drills: DrillQuestion[];
  group: "questions" | "foundation";
  issues: ContentIssue[];
  lang: Lang;
  onChange: (drills: DrillQuestion[]) => void;
}) {
  const c = CONTENT_COPY[lang];
  return (
    <div>
      <div className="mb-1.5 text-xs font-extrabold">
        {title}
        <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
          {tip}
        </InfoTip>
      </div>
      <ol className="flex flex-col gap-2">
        {drills.map((drill, di) => {
          const prefix = `help.${group}.${di}.`;
          return (
            <li key={di} className="rounded-xl border border-border bg-control p-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-xs font-extrabold">{c.exercise(di + 1)}</span>
                <ErrorBadge issues={issues.filter((i) => i.field.startsWith(prefix))} />
                <span className="ml-auto inline-flex gap-1">
                  <MoveButtons index={di} count={drills.length} onMove={(d) => onChange(moveItem(drills, di, d))} lang={lang} />
                  <RemoveButton lang={lang} onRemove={() => onChange(drills.filter((_, j) => j !== di))} />
                </span>
              </div>
              <ChoiceFields
                prompt={drill.prompt}
                options={drill.options}
                correct={drill.correct}
                explanation={drill.explanation}
                promptPath="prompt"
                prefix={prefix}
                issues={issues}
                lang={lang}
                onChange={(patch) =>
                  onChange(
                    drills.map((d, j) =>
                      j === di
                        ? {
                            prompt: patch.prompt ?? d.prompt,
                            options: patch.options ?? d.options,
                            correct: patch.correct ?? d.correct,
                            explanation: patch.explanation ?? d.explanation,
                          }
                        : d
                    )
                  )
                }
              />
            </li>
          );
        })}
      </ol>
      {drills.length < 10 && (
        <button type="button" onClick={() => onChange([...drills, { ...EMPTY_DRILL, options: [...EMPTY_DRILL.options] }])} className={cn(SMALL_BTN, "mt-1.5")}>
          <Plus className="size-3" strokeWidth={2.5} />
          {c.addExercise}
        </button>
      )}
    </div>
  );
}

export function HelpEditor({
  help,
  issues,
  lang,
  onChange,
  title,
  tip,
}: {
  help: SkillHelp;
  /** Its problems, with paths starting "help." (a paper's skill maps its
   *  "skills.{id}." onto that). */
  issues: ContentIssue[];
  lang: Lang;
  onChange: (help: SkillHelp | undefined) => void;
  /** Heading and explanation; a question's help by default. */
  title?: string;
  tip?: string;
}) {
  const c = CONTENT_COPY[lang];
  const [armed, setArmed] = useState(false);
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
      <div className="flex items-center gap-2">
        <span className="pr-1 text-xs font-extrabold [overflow-wrap:anywhere]">
          {title ?? c.helpTitle}
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {tip ?? c.tips.help}
          </InfoTip>
        </span>
        <span className="ml-auto">
          {armed ? (
            <span className="inline-flex gap-1">
              <button type="button" onClick={() => onChange(undefined)} className={cn(SMALL_BTN, "bg-neo-pink text-ink")}>
                {c.confirmRemoveHelp}
              </button>
              <button type="button" onClick={() => setArmed(false)} className={SMALL_BTN}>
                {c.cancel}
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setArmed(true)} className={SMALL_BTN}>
              <Trash2 className="size-3" strokeWidth={2.5} />
              {c.removeHelp}
            </button>
          )}
        </span>
      </div>
      <TextField label={c.helpLabel} tip={c.tips.helpLabel} value={help.label} rows={1} path="help.label" issues={issues} lang={lang} onChange={(v) => onChange({ ...help, label: v })} />
      <TextField
        label={c.helpNote}
        tip={c.tips.helpNote}
        value={help.note.join("\n")}
        rows={3}
        path="help.note"
        // One textarea holds every rule line, so each line's problem is shown
        // under it (the checks name them help.note.0, help.note.1, …).
        issues={issues
          .filter((i) => i.field.startsWith("help.note"))
          .map((i) => ({ ...i, field: "help.note" }))}
        lang={lang}
        onChange={(v) => onChange({ ...help, note: v.split("\n") })}
      />
      <TextField label={c.helpMistake} tip={c.tips.helpMistake} value={help.mistake ?? ""} path="help.mistake" issues={issues} lang={lang} onChange={(v) => onChange({ ...help, mistake: v })} />
      <DrillList title={c.similarTitle} tip={c.tips.similar} drills={help.questions} group="questions" issues={issues} lang={lang} onChange={(questions) => onChange({ ...help, questions })} />
      <DrillList title={c.foundationTitle} tip={c.tips.foundation} drills={help.foundation ?? []} group="foundation" issues={issues} lang={lang} onChange={(foundation) => onChange({ ...help, foundation })} />
    </div>
  );
}

/** The question as a student meets it: situation, question, options with the
 *  correct one marked, and the explanation. */
function QuestionPreview({ question, lang }: { question: QuizQuestionBody; lang: Lang }) {
  const c = CONTENT_COPY[lang];
  return (
    <div className="mt-3 rounded-xl border border-border bg-control p-3">
      <div className="mb-1.5 text-[10px] font-extrabold text-muted">{c.previewTitle}</div>
      {question.scenario && (
        <div className="mb-1 text-xs font-semibold whitespace-pre-line text-muted">
          <MathText text={question.scenario} />
        </div>
      )}
      <div className="mb-2 text-sm font-bold whitespace-pre-line">
        <MathText text={question.q} />
      </div>
      <ul className="mb-2 flex flex-col gap-1">
        {question.options.map((opt, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold",
              opt === question.correct ? "bg-mint/30" : "bg-surface"
            )}
          >
            {opt === question.correct && <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} />}
            <MathText text={opt} />
          </li>
        ))}
      </ul>
      <div className="text-xs font-semibold whitespace-pre-line">
        <MathText text={question.explanation} />
      </div>
    </div>
  );
}

export function QuestionEditor({
  question,
  index,
  count,
  issues,
  open,
  lang,
  onToggle,
  onChange,
  onMove,
  onRemove,
}: {
  question: QuizQuestionBody;
  index: number;
  count: number;
  issues: ContentIssue[];
  open: boolean;
  lang: Lang;
  onToggle: () => void;
  onChange: (q: QuizQuestionBody) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const c = CONTENT_COPY[lang];
  const [preview, setPreview] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;
  let body: ReactNode = null;
  if (open) {
    body = (
      <div className="mt-3 flex flex-col gap-2.5">
        <TextField
          label={c.scenarioLabel}
          tip={c.tips.scenario}
          value={question.scenario ?? ""}
          path="scenario"
          issues={issues}
          lang={lang}
          onChange={(v) => onChange({ ...question, scenario: v })}
        />
        <ChoiceFields
          prompt={question.q}
          options={question.options}
          correct={question.correct}
          explanation={question.explanation}
          promptPath="q"
          prefix=""
          issues={issues}
          lang={lang}
          onChange={(patch) =>
            onChange({
              ...question,
              q: patch.prompt ?? question.q,
              options: patch.options ?? question.options,
              correct: patch.correct ?? question.correct,
              explanation: patch.explanation ?? question.explanation,
            })
          }
        />
        {question.help ? (
          <HelpEditor help={question.help} issues={issues} lang={lang} onChange={(help) => onChange({ ...question, help })} />
        ) : (
          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => onChange({ ...question, help: { ...EMPTY_HELP, note: [], questions: [], foundation: [] } })}
              className={SMALL_BTN}
            >
              <Plus className="size-3" strokeWidth={2.5} />
              {c.addHelp}
            </button>
            <InfoTip label={c.whatIsThis}>{c.tips.help}</InfoTip>
          </div>
        )}
        <IssueLines issues={issues.filter((i) => i.field === "id")} lang={lang} />
        {preview && <QuestionPreview question={question} lang={lang} />}
      </div>
    );
  }
  return (
    <li id={`item-${question.id}`} className="rounded-2xl border border-border bg-surface p-3 shadow-panel-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          // basis-44: below that the title wraps letter by letter in Khmer,
          // so the buttons move to their own line instead.
          className="flex min-w-0 grow basis-44 items-center gap-1.5 text-left"
        >
          <Chevron className="size-4 shrink-0" strokeWidth={2.5} />
          <span className="font-heading text-sm font-extrabold">{c.question(index + 1)}</span>
          <span className="font-mono text-[10px] font-bold text-muted">{question.id}</span>
          <ErrorBadge issues={issues} />
        </button>
        <span className="ml-auto inline-flex flex-wrap gap-1">
          {open && (
            <button type="button" onClick={() => setPreview(!preview)} className={SMALL_BTN} aria-pressed={preview}>
              <Eye className="size-3" strokeWidth={2.5} />
              {c.preview}
            </button>
          )}
          <MoveButtons index={index} count={count} onMove={onMove} lang={lang} />
          <RemoveButton onRemove={onRemove} lang={lang} />
        </span>
      </div>
      {!open && (
        <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted [overflow-wrap:anywhere]">
          {question.q || "…"}
        </p>
      )}
      {body}
    </li>
  );
}

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { PART_ID, type ContentIssue } from "@/utils/content-check";
import type {
  Lang,
  PaperBody,
  PaperGapBody,
  PaperGapFillBody,
  PaperQuestionBody,
  PaperSectionBody,
  PaperWriting,
} from "@/types";
import { cn } from "@/utils/cn";
import { CONTENT_COPY } from "../content-copy";
import {
  EMPTY_HELP,
  emptyGap,
  emptyPaperQuestion,
  moveItem,
  newPaperItemId,
} from "../content-edit";
import { FIELD, PANEL, SMALL_BTN } from "../editor-styles";
import {
  ChoiceFields,
  ErrorBadge,
  HelpEditor,
  IssueLines,
  MoveButtons,
  NumberField,
  RemoveButton,
  SelectField,
  TextField,
} from "./content-item-editors";

/**
 * The body of the content editor for one PAST PAPER
 * (/admin/content/paper/:key). The page around it (content-editor-view.tsx)
 * owns the working copy, the checks, saving and publishing.
 *
 * FIX AND EXTEND, the user's call: every text, option, answer, explanation,
 * word in the box, gap and the writing task can be changed, and questions can
 * be added, removed and moved inside a part. A whole new paper, or a new part,
 * arrives as a file the developer prepares from the photographs, so there is
 * no button for either.
 *
 * The title, instruction and exercise of a part are the PAPER'S OWN WORDS
 * (AGENTS.md: "the statement is the paper's own words, copied, never
 * paraphrased"); only the options and explanations are ours.
 */

function under(issues: ContentIssue[], prefix: string): ContentIssue[] {
  return issues.filter((i) => i.field === prefix || i.field.startsWith(`${prefix}.`));
}

function Heading({ children, tip, lang, issues, right }: {
  children: ReactNode;
  tip?: string;
  lang: Lang;
  issues: ContentIssue[];
  right?: ReactNode;
}) {
  const c = CONTENT_COPY[lang];
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <h4 className="min-w-0 font-heading text-sm font-extrabold [overflow-wrap:anywhere]">{children}</h4>
      {tip && <InfoTip label={c.whatIsThis}>{tip}</InfoTip>}
      <ErrorBadge issues={issues} />
      {right && <span className="ml-auto inline-flex flex-wrap gap-1">{right}</span>}
    </div>
  );
}

function skillOptions(body: PaperBody) {
  return Object.keys(body.skills ?? {}).map((id) => ({ value: id, label: id }));
}

function PaperQuestionEditor({
  question,
  index,
  count,
  prefix,
  body,
  issues,
  open,
  lang,
  onToggle,
  onChange,
  onMove,
  onRemove,
}: {
  question: PaperQuestionBody;
  index: number;
  count: number;
  /** "sections.2.questions.3." — this question's path, with the dot. */
  prefix: string;
  body: PaperBody;
  issues: ContentIssue[];
  open: boolean;
  lang: Lang;
  onToggle: () => void;
  onChange: (q: PaperQuestionBody) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  const Chevron = open ? ChevronDown : ChevronRight;
  const mine = under(issues, prefix.slice(0, -1));
  return (
    <li id={`item-${question.id}`} className="rounded-xl border border-border bg-control p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 grow basis-44 items-center gap-1.5 text-left"
        >
          <Chevron className="size-4 shrink-0" strokeWidth={2.5} />
          <span className="font-heading text-sm font-extrabold">{c.question(index + 1)}</span>
          <span className="font-mono text-[10px] font-bold text-muted">{question.id}</span>
          <ErrorBadge issues={mine} />
        </button>
        <span className="ml-auto inline-flex flex-wrap gap-1">
          <MoveButtons index={index} count={count} onMove={onMove} lang={lang} />
          <RemoveButton onRemove={onRemove} lang={lang} />
        </span>
      </div>
      {!open && (
        <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted [overflow-wrap:anywhere]">
          {question.q || "…"}
        </p>
      )}
      {open && (
        <div className="mt-3 flex flex-col gap-2.5">
          <ChoiceFields
            prompt={question.q}
            options={question.options}
            correct={question.correct}
            explanation={question.explanation}
            promptPath="q"
            prefix={prefix}
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
          <NumberField
            label={t.questionPoints}
            tip={c.tips.questionPoints}
            value={question.points}
            min={0}
            path={`${prefix}points`}
            issues={issues}
            lang={lang}
            onChange={(v) => onChange({ ...question, points: v })}
          />
          <SelectField
            label={t.skill}
            tip={c.tips.skill}
            value={question.skill ?? ""}
            options={skillOptions(body)}
            placeholder={t.noSkill}
            path={`${prefix}skill`}
            issues={issues}
            lang={lang}
            onChange={(v) => onChange({ ...question, skill: v || undefined })}
          />
          <IssueLines issues={issues.filter((i) => i.field === `${prefix}id`)} lang={lang} />
        </div>
      )}
    </li>
  );
}

function GapFillEditor({
  fill,
  prefix,
  body,
  part,
  usedIds,
  issues,
  lang,
  onChange,
}: {
  fill: PaperGapFillBody;
  /** "sections.0.gapFill" */
  prefix: string;
  body: PaperBody;
  part: PaperSectionBody;
  usedIds: string[];
  issues: ContentIssue[];
  lang: Lang;
  onChange: (f: PaperGapFillBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  const bank = fill.wordBank;
  const setGap = (gi: number, patch: Partial<PaperGapBody>) =>
    onChange({ ...fill, gaps: fill.gaps.map((g, j) => (j === gi ? { ...g, ...patch } : g)) });
  return (
    <div className="flex flex-col gap-2.5">
      <TextField label={t.passageTitle} value={fill.title} rows={1} path={`${prefix}.title`} issues={issues} lang={lang} onChange={(v) => onChange({ ...fill, title: v })} />
      <TextField label={t.passage} tip={c.tips.passage} value={fill.body} rows={8} path={`${prefix}.body`} issues={issues} lang={lang} onChange={(v) => onChange({ ...fill, body: v })} />

      <div>
        <div className="mb-1 pr-1 text-xs font-extrabold">
          {t.wordBank}
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {c.tips.wordBank}
          </InfoTip>
        </div>
        <ul className="flex flex-col gap-1.5">
          {bank.map((word, wi) => (
            <li key={wi} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <TextField
                  label={t.word(wi + 1)}
                  value={word}
                  rows={1}
                  path={`${prefix}.wordBank.${wi}`}
                  issues={issues}
                  lang={lang}
                  onChange={(v) =>
                    // Renaming a word carries every gap that used it along.
                    onChange({
                      ...fill,
                      wordBank: bank.map((w, j) => (j === wi ? v : w)),
                      gaps: fill.gaps.map((g) => (g.correct === word ? { ...g, correct: v } : g)),
                    })
                  }
                />
              </div>
              <button
                type="button"
                aria-label={c.remove}
                onClick={() => onChange({ ...fill, wordBank: bank.filter((_, j) => j !== wi) })}
                className={cn(SMALL_BTN, "mt-6")}
              >
                <X className="size-3" strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => onChange({ ...fill, wordBank: [...bank, ""] })} className={cn(SMALL_BTN, "mt-1.5")}>
          <Plus className="size-3" strokeWidth={2.5} />
          {t.addWord}
        </button>
        <IssueLines issues={issues.filter((i) => i.field === `${prefix}.wordBank`)} lang={lang} />
      </div>

      <div>
        <div className="mb-1 text-xs font-extrabold">{t.gaps}</div>
        <ol className="flex flex-col gap-2">
          {fill.gaps.map((gap, gi) => {
            const at = `${prefix}.gaps.${gi}`;
            return (
              <li key={gap.id} id={`item-${gap.id}`} className="rounded-xl border border-border bg-control p-2.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-extrabold">{t.gap(gap.number)}</span>
                  <span className="font-mono text-[10px] font-bold text-muted">{gap.id}</span>
                  <ErrorBadge issues={under(issues, at)} />
                  <span className="ml-auto inline-flex gap-1">
                    <MoveButtons index={gi} count={fill.gaps.length} onMove={(d) => onChange({ ...fill, gaps: moveItem(fill.gaps, gi, d) })} lang={lang} />
                    <RemoveButton lang={lang} onRemove={() => onChange({ ...fill, gaps: fill.gaps.filter((_, j) => j !== gi) })} />
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <NumberField label={t.gapNumber} value={gap.number} min={1} max={99} path={`${at}.number`} issues={issues} lang={lang} onChange={(v) => setGap(gi, { number: v ?? 0 })} />
                  <ExampleBox
                    checked={!!gap.example}
                    lang={lang}
                    onChange={(on) => setGap(gi, { example: on || undefined })}
                  />
                  <SelectField
                    label={t.gapAnswer}
                    value={gap.correct}
                    options={bank.filter((w) => w.trim()).map((w) => ({ value: w, label: w }))}
                    placeholder={t.chooseAnswer}
                    path={`${at}.correct`}
                    issues={issues}
                    lang={lang}
                    onChange={(v) => setGap(gi, { correct: v })}
                  />
                  <SelectField
                    label={t.skill}
                    tip={c.tips.skill}
                    value={gap.skill ?? ""}
                    options={skillOptions(body)}
                    placeholder={t.noSkill}
                    path={`${at}.skill`}
                    issues={issues}
                    lang={lang}
                    onChange={(v) => setGap(gi, { skill: v || undefined })}
                  />
                  <TextField label={c.explanationLabel} tip={c.tips.explanation} value={gap.explanation} rows={2} path={`${at}.explanation`} issues={issues} lang={lang} onChange={(v) => setGap(gi, { explanation: v })} />
                  <IssueLines issues={issues.filter((i) => i.field === `${at}.id`)} lang={lang} />
                </div>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={() => {
            const id = newPaperItemId(body, part, usedIds);
            const number = Math.max(0, ...fill.gaps.map((g) => g.number)) + 1;
            onChange({ ...fill, gaps: [...fill.gaps, emptyGap(id, number)] });
          }}
          className={cn(SMALL_BTN, "mt-2")}
        >
          <Plus className="size-3" strokeWidth={2.5} />
          {t.addGap}
        </button>
        <IssueLines issues={issues.filter((i) => i.field === `${prefix}.gaps`)} lang={lang} />
      </div>
    </div>
  );
}

/** The "already filled in as the example" tick. The ⓘ is the label's
 *  SIBLING: a button inside a label would be a second labelable element. */
function ExampleBox({ checked, lang, onChange }: { checked: boolean; lang: Lang; onChange: (on: boolean) => void }) {
  const c = CONTENT_COPY[lang];
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--brand-purple)]" />
      <label htmlFor={id} className="min-w-0 flex-1 text-xs font-bold">
        {c.paper.gapExample}
      </label>
      <InfoTip label={c.whatIsThis} className="mr-1 shrink-0">
        {c.tips.gapExample}
      </InfoTip>
    </div>
  );
}

function PartPanel({
  part,
  index,
  body,
  usedIds,
  issues,
  open,
  lang,
  onToggle,
  onChange,
}: {
  part: PaperSectionBody;
  index: number;
  body: PaperBody;
  usedIds: string[];
  issues: ContentIssue[];
  open: string | null;
  lang: Lang;
  onToggle: (id: string) => void;
  onChange: (p: PaperSectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  const at = `sections.${index}`;
  const questions = part.questions ?? [];
  const setQuestions = (next: PaperQuestionBody[]) => onChange({ ...part, questions: next });
  return (
    <section id={`part-${index}`} className={PANEL}>
      <Heading tip={c.tips.paperPart} lang={lang} issues={under(issues, at)}>
        {t.part(index + 1)}
        {part.title ? ` · ${part.title}` : ""}
      </Heading>
      <div className="flex flex-col gap-2.5">
        <TextField label={t.partTitle} value={part.title} rows={1} path={`${at}.title`} issues={issues} lang={lang} onChange={(v) => onChange({ ...part, title: v })} />
        <TextField label={t.instruction} value={part.instruction} rows={2} path={`${at}.instruction`} issues={issues} lang={lang} onChange={(v) => onChange({ ...part, instruction: v })} />
        <TextField label={t.statement} value={part.statement ?? ""} rows={5} path={`${at}.statement`} issues={issues} lang={lang} onChange={(v) => onChange({ ...part, statement: v })} />
        <TextField label={t.example} value={part.example ?? ""} rows={2} path={`${at}.example`} issues={issues} lang={lang} onChange={(v) => onChange({ ...part, example: v })} />
        <IssueLines issues={issues.filter((i) => i.field === at || i.field === `${at}.id` || i.field === `${at}.questions`)} lang={lang} />

        {part.questions && (
          <>
            <ol className="flex flex-col gap-2">
              {questions.map((q, qi) => (
                <PaperQuestionEditor
                  key={q.id}
                  question={q}
                  index={qi}
                  count={questions.length}
                  prefix={`${at}.questions.${qi}.`}
                  body={body}
                  issues={issues}
                  open={open === q.id}
                  lang={lang}
                  onToggle={() => onToggle(q.id)}
                  onChange={(next) => setQuestions(questions.map((x, j) => (j === qi ? next : x)))}
                  onMove={(d) => setQuestions(moveItem(questions, qi, d))}
                  onRemove={() => setQuestions(questions.filter((_, j) => j !== qi))}
                />
              ))}
            </ol>
            <button
              type="button"
              onClick={() => {
                const id = newPaperItemId(body, part, usedIds);
                setQuestions([...questions, emptyPaperQuestion(id)]);
                onToggle(id);
              }}
              className={cn(SMALL_BTN, "self-start")}
            >
              <Plus className="size-3" strokeWidth={2.5} />
              {c.addQuestion}
            </button>
          </>
        )}

        {part.gapFill && (
          <GapFillEditor
            fill={part.gapFill}
            prefix={`${at}.gapFill`}
            body={body}
            part={part}
            usedIds={usedIds}
            issues={issues}
            lang={lang}
            onChange={(f) => onChange({ ...part, gapFill: f })}
          />
        )}
      </div>
    </section>
  );
}

function WritingPanel({
  writing,
  issues,
  lang,
  onChange,
}: {
  writing: PaperWriting;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (w: PaperWriting) => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  return (
    <section id="paper-writing" className={PANEL}>
      <Heading tip={c.tips.writing} lang={lang} issues={under(issues, "writing")}>
        {t.writing}
      </Heading>
      <div className="flex flex-col gap-2.5">
        <TextField label={t.writingTitle} value={writing.title} rows={1} path="writing.title" issues={issues} lang={lang} onChange={(v) => onChange({ ...writing, title: v })} />
        <TextField label={t.writingPrompt} value={writing.prompt} rows={3} path="writing.prompt" issues={issues} lang={lang} onChange={(v) => onChange({ ...writing, prompt: v })} />
        <NumberField label={t.minWords} value={writing.minWords} min={1} path="writing.minWords" issues={issues} lang={lang} onChange={(v) => onChange({ ...writing, minWords: v ?? 0 })} />
        <TextField
          label={t.essay}
          value={writing.modelEssay.join("\n\n")}
          rows={8}
          path="writing.modelEssay"
          issues={under(issues, "writing.modelEssay").map((i) => ({ ...i, field: "writing.modelEssay" }))}
          lang={lang}
          onChange={(v) => onChange({ ...writing, modelEssay: v.split(/\n[ \t]*\n/) })}
        />
        <TextField
          label={t.checklist}
          value={writing.checklist.join("\n")}
          rows={4}
          path="writing.checklist"
          issues={under(issues, "writing.checklist").map((i) => ({ ...i, field: "writing.checklist" }))}
          lang={lang}
          onChange={(v) => onChange({ ...writing, checklist: v.split("\n") })}
        />
      </div>
    </section>
  );
}

function SkillsPanel({
  body,
  issues,
  lang,
  onChange,
}: {
  body: PaperBody;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (b: PaperBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  const skills = body.skills ?? {};
  const [newId, setNewId] = useState("");
  const inputId = useId();
  const taken = !PART_ID.test(newId) || Object.hasOwn(skills, newId);
  return (
    <section id="paper-skills" className={PANEL}>
      <Heading tip={c.tips.skills} lang={lang} issues={under(issues, "skills")}>
        {t.skills}
      </Heading>
      {Object.keys(skills).length === 0 && <p className="mb-2 text-xs font-bold text-muted">{t.noSkills}</p>}
      <div className="flex flex-col gap-3">
        {Object.entries(skills).map(([id, help]) => (
          <div key={id} id={`paper-skill-${id}`}>
            <HelpEditor
              help={help}
              title={t.skillN(id)}
              tip={c.tips.skills}
              lang={lang}
              // The checks name this skill's fields "skills.{id}.label" and so
              // on; HelpEditor names its own "help.label".
              issues={under(issues, `skills.${id}`).map((i) => ({
                ...i,
                field: i.field.replace(`skills.${id}.`, "help."),
              }))}
              onChange={(next) => {
                const rest = { ...skills };
                if (next) rest[id] = next;
                else delete rest[id];
                onChange({ ...body, skills: rest });
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="text-xs font-bold">
            {t.newSkillId}
          </label>
          <input
            id={inputId}
            value={newId}
            onChange={(e) => setNewId(e.target.value.trim())}
            className={FIELD}
          />
        </div>
        <button
          type="button"
          disabled={taken}
          onClick={() => {
            onChange({
              ...body,
              skills: { ...skills, [newId]: { ...EMPTY_HELP, note: [], questions: [], foundation: [] } },
            });
            setNewId("");
          }}
          className={cn(SMALL_BTN, "mb-0.5")}
        >
          <Plus className="size-3" strokeWidth={2.5} />
          {t.addSkill}
        </button>
      </div>
      {newId && taken && <p className="mt-1 text-[11px] font-bold text-pink">{t.skillIdBad}</p>}
    </section>
  );
}

export function PaperEditor({
  body,
  issues,
  usedIds,
  open,
  lang,
  onToggle,
  onChange,
}: {
  body: PaperBody;
  /** Every problem in the paper, by its whole path. */
  issues: ContentIssue[];
  usedIds: string[];
  /** The open question's id. */
  open: string | null;
  lang: Lang;
  onToggle: (id: string) => void;
  onChange: (b: PaperBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const t = c.paper;
  const setPart = (i: number) => (p: PaperSectionBody) =>
    onChange({ ...body, sections: body.sections.map((x, j) => (j === i ? p : x)) });
  return (
    <div className="flex flex-col gap-3">
      <section id="paper-head" className={PANEL}>
        <Heading lang={lang} issues={issues.filter((i) => ["minutes", "points", "note", "", "sections"].includes(i.field))}>
          {t.head}
        </Heading>
        <div className="flex flex-col gap-2.5">
          <NumberField label={t.minutes} tip={c.tips.minutes} value={body.minutes} min={1} path="minutes" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, minutes: v ?? 0 })} />
          <NumberField label={t.points} value={body.points} min={1} path="points" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, points: v })} />
          <TextField label={t.note} value={body.note ?? ""} rows={2} path="note" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, note: v })} />
          <IssueLines issues={issues.filter((i) => i.field === "" || i.field === "sections")} lang={lang} />
        </div>
      </section>
      {body.sections.map((part, i) => (
        <PartPanel
          key={i}
          part={part}
          index={i}
          body={body}
          usedIds={usedIds}
          issues={issues}
          open={open}
          lang={lang}
          onToggle={onToggle}
          onChange={setPart(i)}
        />
      ))}
      {body.writing && (
        <WritingPanel writing={body.writing} issues={issues} lang={lang} onChange={(w) => onChange({ ...body, writing: w })} />
      )}
      <SkillsPanel body={body} issues={issues} lang={lang} onChange={onChange} />
    </div>
  );
}

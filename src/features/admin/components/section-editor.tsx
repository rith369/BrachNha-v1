import { useState } from "react";
import { Eye, Lightbulb, NotebookPen, Plus } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { Callout, type CalloutTone } from "@/features/lessons/components/callout";
import { MisconceptionCard, SectionBlockBody } from "@/features/lessons/components/section-blocks";
import type { ContentIssue, SectionBlockKey } from "@/utils/content-check";
import type { Lang, QuizQuestionBody, SectionBlock, SectionBody } from "@/types";
import { cn } from "@/utils/cn";
import { CONTENT_COPY } from "../content-copy";
import { emptyQuestion, moveItem, newSectionQuestionId } from "../content-edit";
import { PANEL, SMALL_BTN } from "../editor-styles";
import { MODEL_CREDITS, SECTION_MODELS, SECTION_POSTERS } from "../section-media";
import {
  ErrorBadge,
  IssueLines,
  MoveButtons,
  NumberField,
  QuestionEditor,
  RemoveButton,
  SelectField,
  TextField,
} from "./content-item-editors";

/**
 * The body of the content editor for one LESSON SECTION
 * (/admin/content/section/:key). The page around it (content-editor-view.tsx)
 * owns the working copy, the checks, saving and publishing.
 *
 * Laid out in the two steps a student meets (section-detail.tsx): step 1 is
 * the title, the video, the introduction, the examples, the 3D model and the
 * easy questions; step 2 is the lesson, the key notes, the mistakes and the
 * applied questions. Writing a section from empty works the same way.
 *
 * Every problem the checks find is located by its whole path
 * ("lesson.items.2.body"), so each field shows its own problems underneath.
 */

/** The problems at a path or anywhere under it. */
function under(issues: ContentIssue[], prefix: string): ContentIssue[] {
  return issues.filter((i) => i.field === prefix || i.field.startsWith(`${prefix}.`));
}

/** The problems under a prefix, with the prefix taken off, for a part that
 *  names its fields from its own root (a question: "q", "options.1"). */
function strip(issues: ContentIssue[], prefix: string): ContentIssue[] {
  return issues
    .filter((i) => i.field.startsWith(`${prefix}.`))
    .map((i) => ({ ...i, field: i.field.slice(prefix.length + 1) }));
}

/** How each block looks on the student's screen, for the preview. */
const BLOCK_LOOK: Record<SectionBlockKey, { tone: CalloutTone; icon?: typeof Lightbulb; label?: string }> = {
  intro: { tone: "mint" },
  examples: { tone: "yellow", icon: Lightbulb, label: "ឧទាហរណ៍" },
  lesson: { tone: "blue" },
  notes: { tone: "purple", icon: NotebookPen, label: "ចំណាំសំខាន់ៗ" },
};

function StepHeading({ text, tip, lang }: { text: string; tip?: string; lang: Lang }) {
  const c = CONTENT_COPY[lang];
  return (
    // pr-1 holds the ⓘ's 4px tap margin inside the line when it ends a wrap.
    <h3 className="mt-2 pr-1 font-heading text-sm font-extrabold">
      {text}
      {tip && (
        <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
          {tip}
        </InfoTip>
      )}
    </h3>
  );
}

function PreviewToggle({ on, onToggle, lang }: { on: boolean; onToggle: () => void; lang: Lang }) {
  const c = CONTENT_COPY[lang];
  return (
    <button type="button" onClick={onToggle} className={SMALL_BTN} aria-pressed={on}>
      <Eye className="size-3" strokeWidth={2.5} />
      {c.preview}
    </button>
  );
}

function BlockPanel({
  blockKey,
  block,
  issues,
  lang,
  onChange,
}: {
  blockKey: SectionBlockKey;
  block: SectionBlock;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (b: SectionBlock) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const [preview, setPreview] = useState(false);
  const look = BLOCK_LOOK[blockKey];
  const mine = under(issues, blockKey);
  return (
    <section id={`sec-${blockKey}`} className={PANEL}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <h4 className="font-heading text-sm font-extrabold">{s.blocks[blockKey]}</h4>
        <InfoTip label={c.whatIsThis}>{c.tips.blocks}</InfoTip>
        <ErrorBadge issues={mine} />
        <span className="ml-auto">
          <PreviewToggle on={preview} onToggle={() => setPreview(!preview)} lang={lang} />
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <TextField
          label={s.lead}
          value={block.intro ?? ""}
          rows={2}
          path={`${blockKey}.intro`}
          issues={issues}
          lang={lang}
          onChange={(v) => onChange({ ...block, intro: v })}
        />
        {block.items.length === 0 && <p className="text-xs font-bold text-muted">{s.noPoints}</p>}
        <ol className="flex flex-col gap-2">
          {block.items.map((item, i) => {
            const at = `${blockKey}.items.${i}`;
            const set = (patch: Partial<typeof item>) =>
              onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <li key={i} className="rounded-xl border border-border bg-control p-2.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-extrabold">{s.point(i + 1)}</span>
                  <ErrorBadge issues={under(issues, at)} />
                  <span className="ml-auto inline-flex gap-1">
                    <MoveButtons
                      index={i}
                      count={block.items.length}
                      onMove={(d) => onChange({ ...block, items: moveItem(block.items, i, d) })}
                      lang={lang}
                    />
                    <RemoveButton
                      lang={lang}
                      onRemove={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                    />
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <TextField label={s.pointLabel} value={item.label ?? ""} rows={1} path={`${at}.label`} issues={issues} lang={lang} onChange={(v) => set({ label: v })} />
                  <TextField label={s.pointBody} value={item.body} rows={3} path={`${at}.body`} issues={issues} lang={lang} onChange={(v) => set({ body: v })} />
                  <TextField
                    label={s.subPoints}
                    value={(item.items ?? []).join("\n")}
                    rows={2}
                    path={`${at}.items`}
                    // One textarea holds every sub-point, so each one's problem
                    // is shown under it (the checks name them …items.0, …).
                    issues={under(issues, `${at}.items`).map((x) => ({ ...x, field: `${at}.items` }))}
                    lang={lang}
                    onChange={(v) => set({ items: v.split("\n") })}
                  />
                </div>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={() => onChange({ ...block, items: [...block.items, { body: "" }] })}
          className={cn(SMALL_BTN, "self-start")}
        >
          <Plus className="size-3" strokeWidth={2.5} />
          {s.addPoint}
        </button>
        <TextField
          label={s.outro}
          value={block.outro ?? ""}
          rows={2}
          path={`${blockKey}.outro`}
          issues={issues}
          lang={lang}
          onChange={(v) => onChange({ ...block, outro: v })}
        />
        <IssueLines issues={issues.filter((x) => x.field === blockKey)} lang={lang} />
        {preview && (
          <div>
            <div className="mb-1.5 text-[10px] font-extrabold text-muted">{c.previewTitle}</div>
            <Callout tone={look.tone} icon={look.icon} label={look.label}>
              <SectionBlockBody block={block} />
            </Callout>
          </div>
        )}
      </div>
    </section>
  );
}

function VideoPanel({
  body,
  issues,
  lang,
  onChange,
}: {
  body: SectionBody;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (b: SectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const video = body.video;
  return (
    <section id="sec-video" className={PANEL}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <h4 className="font-heading text-sm font-extrabold">{s.video}</h4>
        <InfoTip label={c.whatIsThis}>{c.tips.video}</InfoTip>
        <ErrorBadge issues={under(issues, "video")} />
        {video && (
          <span className="ml-auto">
            <RemoveButton lang={lang} label={s.removeVideo} onRemove={() => onChange({ ...body, video: undefined })} />
          </span>
        )}
      </div>
      {video ? (
        <div className="flex flex-col gap-2.5">
          <SelectField
            label={s.poster}
            value={video.poster}
            options={SECTION_POSTERS.map((p) => ({ value: p, label: p.replace("/sections/", "") }))}
            placeholder={s.choosePoster}
            path="video.poster"
            issues={issues}
            lang={lang}
            onChange={(v) => onChange({ ...body, video: { ...video, poster: v } })}
          />
          {video.poster && (
            <img
              src={video.poster}
              alt=""
              className="aspect-video w-48 max-w-full rounded-lg border border-border object-cover"
            />
          )}
          <NumberField
            label={s.duration}
            value={video.durationSec}
            min={1}
            path="video.durationSec"
            issues={issues}
            lang={lang}
            onChange={(v) => onChange({ ...body, video: { ...video, durationSec: v } })}
          />
          <TextField
            label={s.youtube}
            value={video.youtubeId ?? ""}
            rows={1}
            maxLength={40}
            path="video.youtubeId"
            issues={issues}
            lang={lang}
            onChange={(v) => onChange({ ...body, video: { ...video, youtubeId: v } })}
          />
        </div>
      ) : (
        <button type="button" onClick={() => onChange({ ...body, video: { poster: "" } })} className={SMALL_BTN}>
          <Plus className="size-3" strokeWidth={2.5} />
          {s.addVideo}
        </button>
      )}
    </section>
  );
}

function ModelPanel({
  body,
  issues,
  lang,
  onChange,
}: {
  body: SectionBody;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (b: SectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const model = body.model3d;
  return (
    <section id="sec-model3d" className={PANEL}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <h4 className="font-heading text-sm font-extrabold">{s.model}</h4>
        <InfoTip label={c.whatIsThis}>{c.tips.model}</InfoTip>
        <ErrorBadge issues={under(issues, "model3d")} />
        {model && (
          <span className="ml-auto">
            <RemoveButton lang={lang} label={s.removeModel} onRemove={() => onChange({ ...body, model3d: undefined })} />
          </span>
        )}
      </div>
      {model ? (
        <div className="flex flex-col gap-2.5">
          <SelectField
            label={s.modelFile}
            value={model.src}
            options={SECTION_MODELS.map((m) => ({ value: m, label: m.replace("/models/", "") }))}
            placeholder={s.chooseModel}
            path="model3d.src"
            issues={issues}
            lang={lang}
            onChange={(v) =>
              onChange({
                ...body,
                // The licence's credit comes with the file, unless one is typed.
                model3d: { ...model, src: v, credit: model.credit || (MODEL_CREDITS[v] ?? "") },
              })
            }
          />
          <TextField label={s.credit} value={model.credit} rows={1} path="model3d.credit" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, model3d: { ...model, credit: v } })} />
          <TextField label={s.caption} value={model.title ?? ""} rows={1} path="model3d.title" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, model3d: { ...model, title: v } })} />
        </div>
      ) : (
        <button type="button" onClick={() => onChange({ ...body, model3d: { src: "", credit: "" } })} className={SMALL_BTN}>
          <Plus className="size-3" strokeWidth={2.5} />
          {s.addModel}
        </button>
      )}
    </section>
  );
}

function MistakesPanel({
  body,
  issues,
  lang,
  onChange,
}: {
  body: SectionBody;
  issues: ContentIssue[];
  lang: Lang;
  onChange: (b: SectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const [preview, setPreview] = useState(false);
  const list = body.mistakes;
  const setList = (mistakes: SectionBody["mistakes"]) => onChange({ ...body, mistakes });
  return (
    <section id="sec-mistakes" className={PANEL}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <h4 className="font-heading text-sm font-extrabold">{s.mistakes}</h4>
        <InfoTip label={c.whatIsThis}>{c.tips.mistakes}</InfoTip>
        <ErrorBadge issues={under(issues, "mistakes")} />
        <span className="ml-auto">
          <PreviewToggle on={preview} onToggle={() => setPreview(!preview)} lang={lang} />
        </span>
      </div>
      <ol className="flex flex-col gap-2">
        {list.map((m, i) => (
          <li key={i} className="rounded-xl border border-border bg-control p-2.5">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="text-xs font-extrabold">{s.mistake(i + 1)}</span>
              <ErrorBadge issues={under(issues, `mistakes.${i}`)} />
              <span className="ml-auto inline-flex gap-1">
                <MoveButtons index={i} count={list.length} onMove={(d) => setList(moveItem(list, i, d))} lang={lang} />
                <RemoveButton lang={lang} onRemove={() => setList(list.filter((_, j) => j !== i))} />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <TextField label={s.wrong} value={m.wrong} rows={2} path={`mistakes.${i}.wrong`} issues={issues} lang={lang} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, wrong: v } : x)))} />
              <TextField label={s.right} value={m.right} rows={2} path={`mistakes.${i}.right`} issues={issues} lang={lang} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, right: v } : x)))} />
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => setList([...list, { wrong: "", right: "" }])} className={cn(SMALL_BTN, "mt-2")}>
        <Plus className="size-3" strokeWidth={2.5} />
        {s.addMistake}
      </button>
      {preview && list.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="text-[10px] font-extrabold text-muted">{c.previewTitle}</div>
          {list.map((m, i) => (
            <MisconceptionCard key={i} mistake={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function QuestionsPanel({
  list,
  body,
  issues,
  usedIds,
  open,
  lang,
  onToggle,
  onChange,
}: {
  list: "quiz" | "quizHarder";
  body: SectionBody;
  issues: ContentIssue[];
  usedIds: string[];
  open: string | null;
  lang: Lang;
  onToggle: (id: string) => void;
  onChange: (b: SectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const questions: QuizQuestionBody[] = body[list] ?? [];
  const setList = (next: QuizQuestionBody[]) => onChange({ ...body, [list]: next });
  return (
    <section id={`sec-${list}`} className={PANEL}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <h4 className="font-heading text-sm font-extrabold">{list === "quiz" ? s.quiz : s.quizHarder}</h4>
        <InfoTip label={c.whatIsThis}>{c.tips.sectionSteps}</InfoTip>
        <ErrorBadge issues={under(issues, list)} />
      </div>
      {questions.length === 0 && <p className="mb-2 text-xs font-bold text-muted">{s.noQuestions}</p>}
      <ol className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            count={questions.length}
            issues={strip(issues, `${list}.${i}`)}
            open={open === q.id}
            lang={lang}
            onToggle={() => onToggle(q.id)}
            onChange={(next) => setList(questions.map((x, j) => (j === i ? next : x)))}
            onMove={(d) => setList(moveItem(questions, i, d))}
            onRemove={() => setList(questions.filter((_, j) => j !== i))}
          />
        ))}
      </ol>
      <IssueLines issues={issues.filter((x) => x.field === list)} lang={lang} />
      <button
        type="button"
        onClick={() => {
          const id = newSectionQuestionId(body, usedIds);
          setList([...questions, emptyQuestion(id)]);
          onToggle(id);
        }}
        className={cn(SMALL_BTN, "mt-2")}
      >
        <Plus className="size-3" strokeWidth={2.5} />
        {c.addQuestion}
      </button>
    </section>
  );
}

export function SectionEditor({
  body,
  issues,
  usedIds,
  open,
  lang,
  onToggle,
  onChange,
}: {
  body: SectionBody;
  /** Every problem in the section, by its whole path. */
  issues: ContentIssue[];
  usedIds: string[];
  /** The open question's id. */
  open: string | null;
  lang: Lang;
  onToggle: (id: string) => void;
  onChange: (b: SectionBody) => void;
}) {
  const c = CONTENT_COPY[lang];
  const s = c.section;
  const setBlock = (key: SectionBlockKey) => (b: SectionBlock) => onChange({ ...body, [key]: b });
  return (
    <div className="flex flex-col gap-3">
      <StepHeading text={s.stepOne} tip={c.tips.sectionSteps} lang={lang} />
      <section id="sec-title" className={PANEL}>
        <TextField label={s.title} value={body.title} rows={1} path="title" issues={issues} lang={lang} onChange={(v) => onChange({ ...body, title: v })} />
        <IssueLines issues={issues.filter((x) => x.field === "")} lang={lang} />
      </section>
      <VideoPanel body={body} issues={issues} lang={lang} onChange={onChange} />
      <BlockPanel blockKey="intro" block={body.intro} issues={issues} lang={lang} onChange={setBlock("intro")} />
      <BlockPanel blockKey="examples" block={body.examples} issues={issues} lang={lang} onChange={setBlock("examples")} />
      <ModelPanel body={body} issues={issues} lang={lang} onChange={onChange} />
      <QuestionsPanel list="quiz" body={body} issues={issues} usedIds={usedIds} open={open} lang={lang} onToggle={onToggle} onChange={onChange} />

      <StepHeading text={s.stepTwo} lang={lang} />
      <BlockPanel blockKey="lesson" block={body.lesson} issues={issues} lang={lang} onChange={setBlock("lesson")} />
      <BlockPanel blockKey="notes" block={body.notes} issues={issues} lang={lang} onChange={setBlock("notes")} />
      <MistakesPanel body={body} issues={issues} lang={lang} onChange={onChange} />
      <QuestionsPanel list="quizHarder" body={body} issues={issues} usedIds={usedIds} open={open} lang={lang} onToggle={onToggle} onChange={onChange} />
    </div>
  );
}

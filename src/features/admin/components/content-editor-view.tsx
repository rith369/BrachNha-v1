import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ExternalLink, EyeOff, History, Plus, Save, Send, Undo2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import {
  discardDraft,
  getContent,
  publishContent,
  restoreVersion,
  saveDraft,
  unpublishContent,
  type AnyBody,
  type ContentDetail,
  type ContentFail,
} from "@/lib/admin-content";
import { checkContent, type ContentIssue } from "@/utils/content-check";
import type {
  ContentKind,
  DeckCardBody,
  GameQuestionBody,
  Lang,
  PaperBody,
  QuizQuestionBody,
  SectionBody,
} from "@/types";
import { cn } from "@/utils/cn";
import { InfoTip } from "@/components/ui/info-tip";
import { TitleWithTip } from "@/components/title-with-tip";
import { whenLabel } from "../copy";
import { CONTENT_COPY, fieldLabel, locationLabel } from "../content-copy";
import { slotFor } from "../content-slots";
import {
  emptyBody,
  emptyGameQuestion,
  emptyQuestion,
  moveItem,
  newCardId,
  newQuestionId,
  sameBody,
  tidyBody,
} from "../content-edit";
import { CardEditor, GameQuestionEditor, QuestionEditor } from "./content-item-editors";
import { PaperEditor } from "./paper-editor";
import { SectionEditor } from "./section-editor";

/**
 * /admin/content/:kind/:key: edit one flashcard deck, practice quiz, lesson
 * section or past paper. This is the SHELL every kind shares (load, save,
 * publish, versions, the checks); the body is drawn by the kind's own editor:
 * the card and question lists here, section-editor.tsx, paper-editor.tsx.
 *
 * THE WORKING COPY lives here, starting from the draft if there is one and
 * otherwise from what students see. Nothing reaches the database until Save
 * draft; nothing reaches students until the OWNER presses Publish (the
 * database refuses anyone else, hint owner_only).
 *
 * Every save, publish and discard sends the draft's updated_at as the page
 * loaded it. If someone else saved in between, the database refuses ('stale')
 * rather than either side's work being silently overwritten.
 *
 * THE CHECKS (utils/content-check.ts) run on every change, from a deferred
 * copy of the working copy so typing stays quick on a long maths quiz. Errors
 * block Publish; warnings do not.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";
const BTN =
  "inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-extrabold shadow-panel-sm disabled:opacity-40 disabled:shadow-none";

type Load =
  | { state: "loading" }
  | { state: "failed"; reason: ContentFail }
  | { state: "ready"; detail: ContentDetail };

type Notice = { tone: "ok" | "error"; text: string } | null;

/** Two taps: the first arms the button, the second does it. */
function ConfirmButton({
  label,
  confirm,
  icon: Icon,
  disabled,
  onConfirm,
  lang,
}: {
  label: string;
  confirm: string;
  icon: typeof Save;
  disabled?: boolean;
  onConfirm: () => void;
  lang: Lang;
}) {
  const c = CONTENT_COPY[lang];
  const [armed, setArmed] = useState(false);
  if (armed) {
    return (
      <span className="inline-flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setArmed(false);
            onConfirm();
          }}
          className={cn(BTN, "bg-neo-pink text-ink")}
        >
          <Icon className="size-3.5" strokeWidth={2.5} />
          {confirm}
        </button>
        <button type="button" onClick={() => setArmed(false)} className={cn(BTN, "bg-surface")}>
          {c.cancel}
        </button>
      </span>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={() => setArmed(true)} className={cn(BTN, "bg-surface")}>
      <Icon className="size-3.5" strokeWidth={2.5} />
      {label}
    </button>
  );
}

/** Mounted by AdminGate only once access is confirmed. */
export function ContentEditorView({
  kind,
  contentKey,
  initialOpen,
}: {
  kind: ContentKind;
  contentKey: string;
  /** A question id to open on arrival (?q=q3), e.g. from a mistake report. */
  initialOpen: string | null;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const myName = useBrachNhaStore((s) => s.userName);
  const c = CONTENT_COPY[lang];
  const { isOwner } = useAdminStatus();
  const slot = slotFor(kind, contentKey);

  const [load, setLoad] = useState<Load>({ state: "loading" });
  // Started as an empty body OF THIS KIND, never [], because the checks and
  // tidyBody run on it while the page loads, and a section or a paper is an
  // object. The page keys this view on kind and key, so the kind cannot change
  // under it.
  const [placeholder] = useState<AnyBody>(() => emptyBody(kind, ""));
  const [body, setBody] = useState<AnyBody>(placeholder);
  /** The body as last saved or loaded, tidied; "unsaved" compares against it. */
  const [saved, setSaved] = useState<AnyBody>(() => emptyBody(kind, ""));
  /** The draft's updated_at as this page knows it; null = no draft. */
  const [expected, setExpected] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [open, setOpen] = useState<string | null>(initialOpen);

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await getContent(kind, contentKey);
      if (!alive) return;
      if (!result.ok) {
        setLoad({ state: "failed", reason: result.reason });
        return;
      }
      const d = result.data;
      // Nothing yet: a new deck or quiz is an empty list, a new section starts
      // with its node's own name as the title.
      const start =
        d.draft?.body ?? d.published?.body ?? emptyBody(kind, slotFor(kind, contentKey).name ?? "");
      setBody(start);
      setSaved(tidyBody(kind, start));
      setExpected(d.draft?.updatedAt ?? null);
      setLoad({ state: "ready", detail: d });
    })();
    return () => {
      alive = false;
    };
  }, [kind, contentKey, reload]);

  // Arriving with ?q= (a mistake report's Edit link): bring that question
  // into view once, the first time the item is on screen.
  const arrived = useRef(false);
  useEffect(() => {
    if (load.state !== "ready" || !initialOpen || arrived.current) return;
    arrived.current = true;
    requestAnimationFrame(() =>
      document.getElementById(`item-${initialOpen}`)?.scrollIntoView({ block: "start" })
    );
  }, [load.state, initialOpen]);

  const tidy = tidyBody(kind, body);
  const dirty = load.state === "ready" && !sameBody(tidy, saved);

  // Leaving with unsaved work asks first (a reload, a closed tab).
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const deferred = useDeferredValue(body);
  // Until the loaded body has been checked once, the deferred copy is still
  // the empty placeholder, and its result ("the paper is empty") would be a
  // false alarm for as long as checking a long paper takes.
  const checked = deferred !== placeholder;
  const issues = checked ? checkContent(kind, tidyBody(kind, deferred)) : [];
  const errorCount = issues.filter((i) => i.level === "error").length;
  const byItem = new Map<number, ContentIssue[]>();
  for (const issue of issues) {
    const list = byItem.get(issue.item) ?? [];
    list.push(issue);
    byItem.set(issue.item, list);
  }

  // Plain values the closures below can read safely: `load.detail` does not
  // exist outside the "ready" state, and the React Compiler narrows a
  // closure's dependency to the property path it reads.
  const detail = load.state === "ready" ? load.detail : null;
  const usedIds = detail?.usedIds ?? [];
  const published = detail?.published ?? null;
  const draft = detail?.draft ?? null;
  const versions = detail?.versions ?? [];

  function fail(reason: ContentFail, detailText?: string) {
    setNotice({
      tone: "error",
      text: c.errors[reason] + (detailText ? `: ${detailText}` : reason === "shape" ? "." : ""),
    });
  }

  /** Save the working copy; the new updated_at, or null if it failed. */
  async function save(): Promise<string | null> {
    setBusy(true);
    setNotice(null);
    const result = await saveDraft(kind, contentKey, tidy, expected);
    setBusy(false);
    if (!result.ok) {
      fail(result.reason, result.detail);
      return null;
    }
    setExpected(result.data);
    setSaved(tidy);
    if (detail) {
      setLoad({
        state: "ready",
        detail: {
          ...detail,
          draft: {
            body: tidy,
            baseVersion: draft ? draft.baseVersion : (published?.version ?? null),
            updatedAt: result.data,
            updatedBy: myName,
          },
        },
      });
    }
    setNotice({ tone: "ok", text: c.saved });
    return result.data;
  }

  async function publish() {
    if (errorCount > 0 || !checked) return;
    let at = expected;
    if (dirty || at === null) {
      if (!dirty && at === null) {
        setNotice({ tone: "error", text: c.nothingToPublish });
        return;
      }
      at = await save();
      if (!at) return;
    }
    setBusy(true);
    const result = await publishContent(kind, contentKey, at);
    setBusy(false);
    if (!result.ok) {
      fail(result.reason, result.detail);
      return;
    }
    setNotice({ tone: "ok", text: c.publishedNow(result.data) });
    setReload((r) => r + 1);
  }

  async function discard() {
    setBusy(true);
    setNotice(null);
    const result = await discardDraft(kind, contentKey, expected);
    setBusy(false);
    if (!result.ok) {
      fail(result.reason, result.detail);
      return;
    }
    setNotice({ tone: "ok", text: c.discarded });
    setReload((r) => r + 1);
  }

  async function unpublish() {
    setBusy(true);
    setNotice(null);
    const result = await unpublishContent(kind, contentKey);
    setBusy(false);
    if (!result.ok) {
      fail(result.reason, result.detail);
      return;
    }
    setNotice({ tone: "ok", text: c.unpublished });
    setReload((r) => r + 1);
  }

  async function restore(version: number) {
    setBusy(true);
    setNotice(null);
    const result = await restoreVersion(kind, contentKey, version, expected);
    setBusy(false);
    if (!result.ok) {
      fail(result.reason, result.detail);
      return;
    }
    setNotice({ tone: "ok", text: c.restored(version) });
    setReload((r) => r + 1);
  }

  function jumpTo(index: number) {
    const item = (body as { id: string }[])[index];
    if (!item) return;
    setOpen(item.id);
    requestAnimationFrame(() =>
      document.getElementById(`item-${item.id}`)?.scrollIntoView({ block: "start" })
    );
  }

  /** A section or a paper names a problem by its path: open the question it
   *  is in, if any, and scroll to the nearest part of the editor. */
  function jumpToField(field: string) {
    const p = field.split(".");
    const head = p[0] ?? "";
    let anchor = "";
    let openId: string | null = null;
    if (kind === "section") {
      const s = body as SectionBody;
      if (head === "quiz" || head === "quizHarder") {
        const q = p[1] !== undefined ? s[head]?.[Number(p[1])] : undefined;
        if (q) {
          openId = q.id;
          anchor = `item-${q.id}`;
        } else {
          anchor = `sec-${head}`;
        }
      } else if (["intro", "examples", "lesson", "notes", "video", "model3d", "mistakes"].includes(head)) {
        anchor = `sec-${head}`;
      } else {
        anchor = "sec-title";
      }
    } else {
      const b = body as PaperBody;
      if (head === "sections" && p[1] !== undefined) {
        const part = b.sections[Number(p[1])];
        const q = p[2] === "questions" && p[3] !== undefined ? part?.questions?.[Number(p[3])] : undefined;
        const gap =
          p[2] === "gapFill" && p[3] === "gaps" && p[4] !== undefined
            ? part?.gapFill?.gaps[Number(p[4])]
            : undefined;
        if (q) {
          openId = q.id;
          anchor = `item-${q.id}`;
        } else if (gap) {
          anchor = `item-${gap.id}`;
        } else {
          anchor = `part-${p[1]}`;
        }
      } else if (head === "writing") {
        anchor = "paper-writing";
      } else if (head === "skills") {
        anchor = p[1] ? `paper-skill-${p[1]}` : "paper-skills";
      } else {
        anchor = "paper-head";
      }
    }
    if (openId) setOpen(openId);
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }));
  }

  /** Open a question, or close it if it is the one open. */
  function toggle(id: string) {
    setOpen(open === id ? null : id);
  }

  function addItem() {
    if (kind === "deck") {
      const cards = body as DeckCardBody[];
      setBody([...cards, { id: newCardId(contentKey, cards, usedIds), front: "", back: "" }]);
    } else if (kind === "game") {
      const questions = body as GameQuestionBody[];
      const id = newQuestionId(questions, usedIds);
      setBody([...questions, emptyGameQuestion(id)]);
      setOpen(id);
    } else {
      const questions = body as QuizQuestionBody[];
      const id = newQuestionId(questions, usedIds);
      setBody([...questions, emptyQuestion(id)]);
      setOpen(id);
    }
  }

  const header = (
    <>
      <Link
        to="/admin/content"
        onClick={(e) => {
          if (dirty && !window.confirm(c.leaveWarning)) e.preventDefault();
        }}
        className="mb-2 inline-flex items-center gap-1 text-xs font-extrabold text-muted hover:text-text"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.5} />
        {c.back}
      </Link>
      <h2 className="font-heading text-base font-extrabold [overflow-wrap:anywhere]">{slot.title}</h2>
      <div className="mt-0.5 mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted">
        <span className="rounded-full bg-control px-2 py-0.5">{c.tabs[kind]}</span>
        <InfoTip triggerClassName="font-mono" trigger={<span>{contentKey}</span>}>
          {c.tips.key}
        </InfoTip>
        <Link to={slot.link} className="inline-flex items-center gap-1 text-purple">
          <ExternalLink className="size-3" strokeWidth={2.5} />
          {c.openInApp}
        </Link>
      </div>
    </>
  );

  if (load.state === "loading") {
    return (
      <>
        {header}
        <p className="text-sm font-bold text-muted">{c.working}</p>
      </>
    );
  }
  if (load.state === "failed") {
    return (
      <>
        {header}
        <p className="text-sm font-bold text-pink">{c.errors[load.reason]}</p>
      </>
    );
  }

  const warnings = issues.length - errorCount;
  const isList = kind === "deck" || kind === "quiz" || kind === "game";

  return (
    <>
      {header}

      <div className={cn(CARD, "mb-4 text-xs font-semibold")}>
        <p>
          {published
            ? c.liveVersion(published.version, published.publishedBy, whenLabel(published.publishedAt, lang))
            : c.liveNone}
          <InfoTip label={c.whatIsThis} className="ml-1.5 align-middle">
            {c.tips.status}
          </InfoTip>
        </p>
        {draft && <p className="mt-1">{c.draftSaved(draft.updatedBy, whenLabel(draft.updatedAt, lang))}</p>}
        {draft && published && draft.baseVersion !== null && draft.baseVersion !== published.version && (
          <p className="mt-1 font-bold text-pink">{c.draftBase(draft.baseVersion, published.version)}</p>
        )}
      </div>

      <div className={cn(CARD, "mb-4")}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-sm font-extrabold">
            <TitleWithTip text={c.checksTitle} label={c.whatIsThis}>
              {c.tips.checks}
            </TitleWithTip>
          </h3>
          <span
            className={cn(
              "rounded-full border border-border px-2 py-0.5 text-[10px] font-extrabold text-ink",
              !checked ? "bg-control text-muted" : errorCount ? "bg-neo-pink" : warnings ? "bg-neo-yellow" : "bg-neo-mint"
            )}
          >
            {!checked ? c.working : issues.length ? c.checksCount(errorCount, warnings) : c.checksNone}
          </span>
        </div>
        {issues.length > 0 && (
          <ul className="mt-2 flex max-h-48 flex-col gap-1 overflow-y-auto">
            {issues.slice(0, 60).map((issue, i) => (
              <li key={i}>
                <button
                  type="button"
                  disabled={isList && issue.item < 0}
                  onClick={() => (isList ? jumpTo(issue.item) : jumpToField(issue.field))}
                  className={cn(
                    "text-left text-[11px] font-bold [overflow-wrap:anywhere] enabled:hover:underline",
                    issue.level === "error" ? "text-pink" : "text-muted"
                  )}
                >
                  {issue.level === "error" ? "✕ " : "! "}
                  {!isList
                    ? locationLabel(kind, issue.field, lang)
                    : issue.item < 0
                      ? c.wholeList
                      : kind === "deck"
                        ? c.card(issue.item + 1)
                        : c.question(issue.item + 1)}
                  {isList && issue.field ? ` · ${fieldLabel(issue.field, lang)}` : ""}: {c.issues[issue.code]}
                  {issue.detail ? ` (${issue.detail})` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {kind === "section" ? (
        <SectionEditor
          body={body as SectionBody}
          issues={issues}
          usedIds={usedIds}
          open={open}
          lang={lang}
          onToggle={toggle}
          onChange={setBody}
        />
      ) : kind === "paper" ? (
        <PaperEditor
          body={body as PaperBody}
          issues={issues}
          usedIds={usedIds}
          open={open}
          lang={lang}
          onToggle={toggle}
          onChange={setBody}
        />
      ) : kind === "game" ? (
        <>
          <p className="mb-3 flex items-start gap-1.5 text-xs font-semibold text-muted">
            <span>{c.tips.gamePool}</span>
          </p>
          <ol className="flex flex-col gap-3">
            {(body as GameQuestionBody[]).map((question, i, questions) => (
              <GameQuestionEditor
                key={question.id}
                question={question}
                index={i}
                count={questions.length}
                issues={byItem.get(i) ?? []}
                open={open === question.id}
                lang={lang}
                onToggle={() => toggle(question.id)}
                onChange={(next) => setBody(questions.map((x, j) => (j === i ? next : x)))}
                onMove={(d) => setBody(moveItem(questions, i, d))}
                onRemove={() => setBody(questions.filter((_, j) => j !== i))}
              />
            ))}
          </ol>
        </>
      ) : kind === "deck" ? (
        <ol className="flex flex-col gap-3">
          {(body as DeckCardBody[]).map((card, i, cards) => (
            <CardEditor
              key={card.id}
              card={card}
              index={i}
              count={cards.length}
              issues={byItem.get(i) ?? []}
              lang={lang}
              onChange={(next) => setBody(cards.map((x, j) => (j === i ? next : x)))}
              onMove={(d) => setBody(moveItem(cards, i, d))}
              onRemove={() => setBody(cards.filter((_, j) => j !== i))}
            />
          ))}
        </ol>
      ) : (
        <ol className="flex flex-col gap-3">
          {(body as QuizQuestionBody[]).map((question, i, questions) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={i}
              count={questions.length}
              issues={byItem.get(i) ?? []}
              open={open === question.id}
              lang={lang}
              onToggle={() => toggle(question.id)}
              onChange={(next) => setBody(questions.map((x, j) => (j === i ? next : x)))}
              onMove={(d) => setBody(moveItem(questions, i, d))}
              onRemove={() => setBody(questions.filter((_, j) => j !== i))}
            />
          ))}
        </ol>
      )}

      {isList && (
        <button type="button" onClick={addItem} className={cn(BTN, "mt-3 bg-surface")}>
          <Plus className="size-3.5" strokeWidth={2.5} />
          {kind === "deck" ? c.addCard : c.addQuestion}
        </button>
      )}

      <div className={cn(CARD, "mt-6")}>
        <h3 className="mb-2 flex items-center gap-1.5 font-heading text-sm font-extrabold">
          <History className="size-4" strokeWidth={2.5} />
          <span>
            <TitleWithTip text={c.historyTitle} label={c.whatIsThis}>
              {c.tips.history}
            </TitleWithTip>
          </span>
        </h3>
        {versions.length === 0 ? (
          <p className="text-xs font-bold text-muted">{c.historyEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {versions.map((v) => (
              <li key={v.version} className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="min-w-0 flex-1">
                  {c.versionRow(v.version, v.publishedBy, whenLabel(v.publishedAt, lang), v.itemCount)}
                </span>
                {published?.version === v.version ? (
                  <span className="rounded-full border border-border bg-neo-mint px-2 py-0.5 text-[10px] font-extrabold text-ink">
                    {c.current}
                  </span>
                ) : (
                  <ConfirmButton
                    label={c.restore}
                    confirm={dirty ? `${c.confirmRestore}. ${c.restoreLoses}` : c.confirmRestore}
                    icon={Undo2}
                    disabled={busy}
                    onConfirm={() => void restore(v.version)}
                    lang={lang}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {isOwner && published && (
          <div className="mt-3">
            <ConfirmButton
              label={c.unpublish}
              confirm={c.confirmUnpublish}
              icon={EyeOff}
              disabled={busy}
              onConfirm={() => void unpublish()}
              lang={lang}
            />
          </div>
        )}
      </div>

      {/* The actions stay in reach on a long quiz. pr-16 clears the KruAI
          button, which sits over the bottom-right corner. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-border bg-bg px-4 py-3 pr-16">
        {notice && (
          <p
            role={notice.tone === "error" ? "alert" : "status"}
            className={cn(
              "mb-2 text-xs font-bold [overflow-wrap:anywhere]",
              notice.tone === "error" ? "text-pink" : "text-text"
            )}
          >
            {notice.text}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {dirty && (
            <span className="rounded-full border border-border bg-neo-yellow px-2 py-0.5 text-[10px] font-extrabold text-ink">
              {c.unsaved}
            </span>
          )}
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={() => void save()}
            className={cn(BTN, "bg-surface")}
          >
            <Save className="size-3.5" strokeWidth={2.5} />
            {busy ? c.working : c.saveDraft}
          </button>
          {isOwner ? (
            <button
              type="button"
              disabled={busy || !checked || errorCount > 0 || (!dirty && expected === null)}
              onClick={() => void publish()}
              className={cn(BTN, "bg-brand text-on-brand")}
            >
              <Send className="size-3.5" strokeWidth={2.5} />
              {c.publish}
            </button>
          ) : null}
          {dirty && (
            <button type="button" disabled={busy} onClick={() => setBody(saved)} className={cn(BTN, "bg-surface")}>
              <Undo2 className="size-3.5" strokeWidth={2.5} />
              {c.undo}
            </button>
          )}
          {expected !== null && (
            <ConfirmButton
              label={c.discard}
              confirm={c.confirmDiscard}
              icon={Undo2}
              disabled={busy}
              onConfirm={() => void discard()}
              lang={lang}
            />
          )}
          <InfoTip label={c.whatIsThis}>{c.tips.buttons}</InfoTip>
        </div>
        {isOwner && errorCount > 0 && (
          <p className="mt-2 text-[11px] font-bold text-pink">{c.fixBeforePublish(errorCount)}</p>
        )}
        {!isOwner && <p className="mt-2 text-[11px] font-bold text-muted">{c.ownerOnlyPublish}</p>}
      </div>
    </>
  );
}

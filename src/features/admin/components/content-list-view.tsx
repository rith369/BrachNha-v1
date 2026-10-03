import { useEffect, useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import { ChevronRight, FilePlus2, Upload } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import {
  importContent,
  listContent,
  parseImportFile,
  type ContentFail,
  type ContentRow,
  type ImportItem,
  type ImportOutcome,
} from "@/lib/admin-content";
import { checkContent } from "@/utils/content-check";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { InfoTip } from "@/components/ui/info-tip";
import { TitleWithTip } from "@/components/title-with-tip";
import type { ContentKind, Lang } from "@/types";
import type { SubjectId } from "@/features/lessons/subjects";
import { cn } from "@/utils/cn";
import { whenLabel } from "../copy";
import { CONTENT_COPY } from "../content-copy";
import { contentSlots, slotFor, subjectName } from "../content-slots";

/**
 * /admin/content: every flashcard deck and practice quiz in the database
 * (supabase/migrations/20261003000001), with New and, for the owner, Import.
 *
 * A row names the item the way a student sees it (../content-slots.ts), says
 * which version students get and whether a draft is waiting, and opens the
 * editor. "New" offers only the places a student can reach that have nothing
 * yet, so a key is never typed by hand.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";
const CHIP =
  "rounded-full border border-border px-2.5 py-1 text-[11px] font-extrabold text-ink";

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; rows: ContentRow[] };

function Row({ row, lang }: { row: ContentRow; lang: Lang }) {
  const c = CONTENT_COPY[lang];
  const slot = slotFor(row.kind, row.key);
  return (
    <li>
      <Link
        to={`/admin/content/${row.kind}/${row.key}`}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold [overflow-wrap:anywhere]">{slot.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-muted">
            <span className="font-mono">{row.key}</span>
            {row.publishedVersion !== null && row.publishedCount !== null ? (
              <span className="rounded-full bg-neo-mint px-2 py-0.5 text-ink">
                {c.live(row.publishedVersion, row.publishedCount, row.kind === "deck")}
              </span>
            ) : (
              <span className="rounded-full bg-control px-2 py-0.5">{c.notPublished}</span>
            )}
            {row.draftUpdatedAt && (
              <span className="rounded-full bg-neo-yellow px-2 py-0.5 text-ink">
                {c.draftBy(row.draftUpdatedBy ?? "", whenLabel(row.draftUpdatedAt, lang))}
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
      </Link>
    </li>
  );
}

/** What the chips on each row mean. The rows are links, and an explanation
 *  may not sit inside a link, so the chips are explained once, up here, in
 *  the same colours. */
function Legend({ lang }: { lang: Lang }) {
  const c = CONTENT_COPY[lang];
  const chip = "rounded-full px-2 py-0.5 text-[10px] font-bold";
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-muted">
      <span>{c.labelsTitle}</span>
      <InfoTip triggerClassName={cn(chip, "bg-neo-mint text-ink")} trigger={<span>{c.current}</span>}>
        {c.tips.live}
      </InfoTip>
      <InfoTip triggerClassName={cn(chip, "bg-control text-muted")} trigger={<span>{c.notPublished}</span>}>
        {c.tips.notPublished}
      </InfoTip>
      <InfoTip triggerClassName={cn(chip, "bg-neo-yellow text-ink")} trigger={<span>{c.draftChip}</span>}>
        {c.tips.draft}
      </InfoTip>
    </div>
  );
}

/** The places in one subject that have nothing yet, for "New". */
function NewPanel({
  kind,
  taken,
  lang,
}: {
  kind: ContentKind;
  taken: Set<string>;
  lang: Lang;
}) {
  const c = CONTENT_COPY[lang];
  const slots = contentSlots(kind);
  const subjects = [...new Set(slots.map((s) => s.subject))];
  const [subject, setSubject] = useState<SubjectId>(subjects[0]);
  const free = slots.filter((s) => s.subject === subject && !taken.has(s.key));

  return (
    <div className={cn(CARD, "mb-4")}>
      <h2 className="font-heading text-sm font-extrabold">
        <TitleWithTip text={c.newTitle} label={c.whatIsThis}>
          {c.tips.newItem}
        </TitleWithTip>
      </h2>
      <p className="mb-3 text-xs font-semibold text-muted">{c.newBlurb}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={s === subject}
            onClick={() => setSubject(s)}
            className={cn(CHIP, s === subject ? "bg-neo-yellow shadow-hard-sm" : "bg-surface text-text")}
          >
            {subjectName(s)}
          </button>
        ))}
      </div>
      {free.length === 0 ? (
        <p className="text-xs font-bold text-muted">{c.noFreeSlots}</p>
      ) : (
        <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {free.map((slot) => (
            <li key={slot.key}>
              <Link
                to={`/admin/content/${kind}/${slot.key}`}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-control"
              >
                <FilePlus2 className="size-4 shrink-0 text-purple" strokeWidth={2.5} />
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{slot.title}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted">{slot.key}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Owner only: read a file, check every item with the editor's own rules,
 *  then hand it to admin_import_content(). */
function ImportPanel({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const c = CONTENT_COPY[lang];
  const [items, setItems] = useState<ImportItem[] | null>(null);
  const [badFile, setBadFile] = useState(false);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ reason: ContentFail; detail?: string } | null>(null);
  const [outcome, setOutcome] = useState<ImportOutcome[] | null>(null);

  async function choose(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setOutcome(null);
    setError(null);
    if (!file) return;
    const parsed = parseImportFile(await file.text());
    setBadFile(parsed === null);
    setItems(parsed);
  }

  const issues = (items ?? []).flatMap((it) =>
    checkContent(it.kind, it.body).map((issue) => ({ ...issue, key: it.key, kind: it.kind }))
  );
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.length - errors.length;

  async function run() {
    if (!items || errors.length) return;
    setBusy(true);
    setError(null);
    const result = await importContent(items, publish);
    setBusy(false);
    if (result.ok) {
      setOutcome(result.data);
      setItems(null);
      onDone();
    } else {
      setError({ reason: result.reason, detail: result.detail });
    }
  }

  const count = (o: ImportOutcome["outcome"]) =>
    (outcome ?? []).filter((x) => x.outcome === o).length;

  return (
    <div className={cn(CARD, "mb-4")}>
      <h2 className="font-heading text-sm font-extrabold">
        <TitleWithTip text={c.importTitle} label={c.whatIsThis}>
          {c.tips.importFile}
        </TitleWithTip>
      </h2>
      <p className="mb-3 text-xs font-semibold text-muted">{c.importBlurb}</p>
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold shadow-panel-sm">
        <Upload className="size-3.5" strokeWidth={2.5} />
        {c.importChoose}
        <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => void choose(e)} />
      </label>
      {badFile && <p role="alert" className="mt-2 text-xs font-bold text-pink">{c.importBadFile}</p>}

      {items && (
        <div className="mt-3">
          <p className="text-xs font-bold">{c.importChecked(items.length, errors.length, warnings)}</p>
          {errors.length > 0 && (
            <ul className="mt-1.5 max-h-48 overflow-y-auto text-[11px] font-semibold text-pink">
              {errors.slice(0, 30).map((e, i) => (
                <li key={i} className="[overflow-wrap:anywhere]">
                  {e.kind} {e.key}: {e.item >= 0 ? `${e.item + 1} ` : ""}
                  {e.field} {c.issues[e.code]}
                  {e.detail ? ` (${e.detail})` : ""}
                </li>
              ))}
            </ul>
          )}
          {errors.length > 0 ? (
            <p className="mt-2 text-xs font-bold text-pink">{c.importFixFirst}</p>
          ) : (
            <>
              {/* The ⓘ is the label's SIBLING: a button inside a label would be
                  a second labelable element in it. */}
              <div className="mt-3 flex items-start gap-2">
                <label className="flex min-w-0 flex-1 items-start gap-2 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={publish}
                    onChange={(e) => setPublish(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--brand-purple)]"
                  />
                  <span>{c.importPublish}</span>
                </label>
                <InfoTip label={c.whatIsThis} className="mt-0.5 mr-1 shrink-0">
                  {c.tips.importPublish}
                </InfoTip>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run()}
                className="mt-3 rounded-xl border border-border bg-brand px-4 py-2 text-xs font-extrabold text-on-brand shadow-panel-sm disabled:opacity-50"
              >
                {busy ? c.working : c.importGo}
              </button>
            </>
          )}
        </div>
      )}
      {outcome && (
        <p className="mt-3 text-xs font-bold text-text">
          {c.importDone(count("published"), count("draft"), count("skipped"))}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-pink [overflow-wrap:anywhere]">
          {c.errors[error.reason]}
          {error.detail ? `: ${error.detail}` : ""}
        </p>
      )}
    </div>
  );
}

/** Mounted by AdminGate only once access is confirmed. */
export function ContentListView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = CONTENT_COPY[lang];
  const { isOwner } = useAdminStatus();
  const [kind, setKind] = useState<ContentKind>("quiz");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [panel, setPanel] = useState<"none" | "new" | "import">("none");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [version, setVersion] = useState(0);

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await listContent();
      if (!alive) return;
      setLoad(result.ok ? { state: "ready", rows: result.data } : { state: "failed" });
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  // A plain array the closures can read safely; `load.rows` does not exist
  // outside the "ready" state (the React Compiler narrows to property paths).
  const rows = load.state === "ready" ? load.rows : [];
  const ofKind = rows.filter((r) => r.kind === kind);
  const subjects = [...new Set(ofKind.map((r) => slotFor(r.kind, r.key).subject))];
  const shown = ofKind.filter(
    (r) => subject === "all" || slotFor(r.kind, r.key).subject === subject
  );
  const taken = new Set(ofKind.map((r) => r.key));

  return (
    <>
      <p className="mb-3 text-xs font-semibold text-muted">{c.blurb}</p>
      <p className="mb-4 rounded-xl border border-border bg-neo-yellow px-3 py-2 text-xs font-bold text-ink">
        {c.notLiveYet}
      </p>

      <UnderlineTabs
        tabs={[
          { id: "quiz", label: c.tabs.quiz },
          { id: "deck", label: c.tabs.deck },
        ]}
        value={kind}
        onChange={(k) => {
          setKind(k);
          setSubject("all");
        }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={panel === "new"}
          onClick={() => setPanel(panel === "new" ? "none" : "new")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-brand px-3 py-1.5 text-xs font-extrabold text-on-brand shadow-panel-sm"
        >
          <FilePlus2 className="size-3.5" strokeWidth={2.5} />
          {c.newItem}
        </button>
        {isOwner && (
          <button
            type="button"
            aria-pressed={panel === "import"}
            onClick={() => setPanel(panel === "import" ? "none" : "import")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold shadow-panel-sm"
          >
            <Upload className="size-3.5" strokeWidth={2.5} />
            {c.importTitle}
          </button>
        )}
      </div>

      {panel === "new" && load.state === "ready" && (
        <NewPanel key={kind} kind={kind} taken={taken} lang={lang} />
      )}
      {panel === "import" && isOwner && (
        <ImportPanel lang={lang} onDone={() => setVersion((v) => v + 1)} />
      )}

      {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.working}</p>}
      {load.state === "failed" && (
        <p className="text-sm font-bold text-pink">{c.errors.failed}</p>
      )}

      {load.state === "ready" && (
        <>
          {subjects.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["all", ...subjects] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={s === subject}
                  onClick={() => setSubject(s)}
                  className={cn(CHIP, s === subject ? "bg-neo-yellow shadow-hard-sm" : "bg-surface text-text")}
                >
                  {s === "all" ? c.allSubjects : subjectName(s)}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
              {c.empty}
            </div>
          ) : (
            <>
              <Legend lang={lang} />
              <ul className="flex flex-col gap-2">
                {shown.map((r) => (
                  <Row key={`${r.kind}:${r.key}`} row={r} lang={lang} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}

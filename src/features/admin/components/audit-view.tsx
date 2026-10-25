import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Bot,
  Bug,
  Flag,
  Megaphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import { loadAuditLog, type AuditEntry } from "@/lib/admin-tools";
import type { ContentKind, Lang } from "@/types";
import { cn } from "@/utils/cn";
import { todayKey } from "@/utils/day";
import { ADMIN_COPY, dayLabel } from "../copy";
import { AUDIT_COPY, AUDIT_GROUP, type AuditGroup } from "../audit-copy";
import { slotFor } from "../content-slots";

/**
 * /admin/audit: who changed what, and when, over
 * supabase/migrations/20261026000001_admin_audit_log.sql.
 *
 * Every row is written by the admin action itself, inside the same database
 * transaction, so the list is what really happened. Names are the ones copied
 * onto the row at the time, which is why a deleted student is still named.
 * Role changes come back for the owner only; the database decides that.
 *
 * Loaded AUDIT_PAGE rows at a time, newest first, with Show older for more.
 * The two filters (kind of change, and who) work on what is loaded, so they
 * cost no request; the "nothing matches" line says so.
 */

const CONTENT_KINDS: readonly ContentKind[] = ["deck", "quiz", "section", "paper", "game"];

const GROUP_LOOK: Record<AuditGroup, { icon: LucideIcon; fill: string }> = {
  students: { icon: Users, fill: "bg-neo-blue" },
  kruai: { icon: Bot, fill: "bg-neo-orange" },
  content: { icon: BookOpen, fill: "bg-neo-mint" },
  reports: { icon: Flag, fill: "bg-neo-pink" },
  announcements: { icon: Megaphone, fill: "bg-neo-yellow" },
  errors: { icon: Bug, fill: "bg-neo-red" },
};

const GROUPS: readonly (AuditGroup | "all")[] = [
  "all",
  "students",
  "kruai",
  "content",
  "reports",
  "announcements",
  "errors",
];

function isContentKind(v: string | null): v is ContentKind {
  return v !== null && (CONTENT_KINDS as readonly string[]).includes(v);
}

/** "Flashcard: ជំពូក 1 · …", the tab's name plus the curriculum's. */
function contentName(kind: ContentKind, key: string, lang: Lang): string {
  return `${AUDIT_COPY[lang].kinds[kind]}: ${slotFor(kind, key).title}`;
}

function num(v: unknown): string {
  return typeof v === "number" && Number.isFinite(v) ? String(v) : "?";
}

function limitsLine(details: Record<string, unknown>, lang: Lang): string {
  const pick = (side: unknown, field: string) =>
    side && typeof side === "object" ? num((side as Record<string, unknown>)[field]) : "?";
  const from = details.from;
  const to = details.to;
  return AUDIT_COPY[lang].limits(
    `${pick(from, "user_daily")} → ${pick(to, "user_daily")}`,
    `${pick(from, "app_daily")} → ${pick(to, "app_daily")}`
  );
}

/** The template with its placeholders drawn as bold names. */
function Sentence({
  template,
  parts,
}: {
  template: string;
  parts: Record<string, string>;
}) {
  const pieces = template.split(/(\{[atcn]\})/);
  return (
    <>
      {pieces.map((piece, i) => {
        const m = /^\{([atcn])\}$/.exec(piece);
        if (!m) return <Fragment key={i}>{piece}</Fragment>;
        const value = parts[m[1]] ?? "";
        return m[1] === "n" ? (
          <Fragment key={i}>{value}</Fragment>
        ) : (
          <strong key={i} className="font-extrabold">
            {value}
          </strong>
        );
      })}
    </>
  );
}

function EntryRow({ entry, lang }: { entry: AuditEntry; lang: Lang }) {
  const c = AUDIT_COPY[lang];
  const group = AUDIT_GROUP[entry.action];
  const { icon: Icon, fill } = GROUP_LOOK[group];
  const d = entry.details;

  let content: { kind: ContentKind; key: string } | null = null;
  if (isContentKind(entry.targetKind) && entry.targetId) {
    content = { kind: entry.targetKind, key: entry.targetId };
  }

  const parts: Record<string, string> = {
    a: entry.actorName || c.someone,
    t: entry.targetLabel || c.aStudent,
    c: content ? contentName(content.kind, content.key, lang) : "",
    n: entry.action === "content_import" ? num(d.items) : num(d.version),
  };

  const extra: ReactNode[] = [];
  if (entry.action === "kruai_limits") extra.push(limitsLine(d, lang));
  if (entry.action === "kruai_pause" && typeof d.reason === "string" && d.reason) {
    extra.push(c.reason(d.reason));
  }
  if (entry.action.startsWith("announcement_") && entry.targetLabel) {
    extra.push(`«${entry.targetLabel}»`);
  }
  if (entry.action.startsWith("mistake_") && entry.targetId) {
    // A report names a question as "{kind}:{key}#{question}".
    const m = /^(section|quiz|paper):([a-z0-9-]+)#(.+)$/.exec(entry.targetId);
    const where = m
      ? `${contentName(m[1] as ContentKind, m[2], lang)} · ${c.question(m[3])}`
      : entry.targetId;
    extra.push(`${where} · ${c.reports(typeof d.reports === "number" ? d.reports : 0)}`);
    if (m) content = { kind: m[1] as ContentKind, key: m[2] };
  }
  if (entry.action.startsWith("photo_") && typeof d.reports === "number") {
    extra.push(c.reports(d.reports));
  }
  if (entry.action === "content_import" && d.publish === true) {
    extra.push(c.importPublished);
  }

  const time = new Date(entry.at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border text-ink",
          fill
        )}
      >
        <Icon className="size-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold [overflow-wrap:anywhere]">
          <Sentence template={c.actions[entry.action]} parts={parts} />
        </p>
        {entry.action === "error_fixed" && entry.targetLabel && (
          <p className="mt-1 font-mono text-[11px] font-semibold text-muted [overflow-wrap:anywhere]">
            {entry.targetLabel}
          </p>
        )}
        {extra.map((line, i) => (
          <p key={i} className="mt-1 text-xs font-semibold text-muted [overflow-wrap:anywhere]">
            {line}
          </p>
        ))}
        <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-muted">
          <span>{time}</span>
          {content && (
            <Link
              to={`/admin/content/${content.kind}/${content.key}`}
              className="font-extrabold text-purple"
            >
              {c.openContent}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; entries: AuditEntry[]; more: boolean };

/** Mounted by AdminGate only once access is confirmed. */
export function AuditView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const { isOwner } = useAdminStatus();
  const c = AUDIT_COPY[lang];
  const admin = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const [group, setGroup] = useState<AuditGroup | "all">("all");
  const [person, setPerson] = useState<string>("all");

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await loadAuditLog(null);
      if (!alive) return;
      setLoad(
        result.ok
          ? { state: "ready", entries: result.data.entries, more: result.data.more }
          : { state: "failed" }
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Plain values for the closures below (the React Compiler narrows a
  // closure's dependency to the property path it reads).
  const entries = load.state === "ready" ? load.entries : [];
  const more = load.state === "ready" && load.more;

  async function showOlder() {
    const oldest = entries.at(-1);
    if (!oldest) return;
    setLoadingMore(true);
    setMoreFailed(false);
    const result = await loadAuditLog(oldest.id);
    setLoadingMore(false);
    if (!result.ok) {
      setMoreFailed(true);
      return;
    }
    setLoad({
      state: "ready",
      entries: [...entries, ...result.data.entries],
      more: result.data.more,
    });
  }

  // "Who": everyone who appears in what is loaded, by id (a name can repeat).
  const people = new Map<string, string>();
  for (const e of entries) {
    const id = e.actorId ?? "";
    if (!people.has(id)) people.set(id, e.actorName || c.someone);
  }

  const shown = entries.filter(
    (e) =>
      (group === "all" || AUDIT_GROUP[e.action] === group) &&
      (person === "all" || (e.actorId ?? "") === person)
  );

  // Grouped by the admin's own calendar day, newest first.
  const days: { day: string; rows: AuditEntry[] }[] = [];
  for (const e of shown) {
    const day = todayKey(new Date(e.at));
    const lastDay = days.at(-1);
    if (lastDay && lastDay.day === day) lastDay.rows.push(e);
    else days.push({ day, rows: [e] });
  }
  const today = todayKey();

  return (
    <>
      <p className="mb-1 text-sm font-semibold text-muted">{c.blurb}</p>
      {!isOwner && <p className="mb-1 text-xs font-semibold text-muted">{c.ownerOnlyNote}</p>}

      {load.state === "loading" && <p className="mt-4 text-sm font-bold text-muted">{admin.loading}</p>}
      {load.state === "failed" && <p className="mt-4 text-sm font-bold text-pink">{admin.failed}</p>}

      {load.state === "ready" && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap gap-1.5" role="group" aria-label={c.title}>
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={group === g}
                onClick={() => setGroup(g)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-extrabold",
                  group === g ? "bg-neo-yellow text-ink" : "bg-surface text-text"
                )}
              >
                {c.groups[g]}
              </button>
            ))}
          </div>

          {people.size > 1 && (
            <label className="mb-4 flex items-center gap-2 text-xs font-extrabold text-muted">
              {c.person}
              <select
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-2 py-1.5 text-sm font-bold text-text focus:border-purple focus:outline-none sm:flex-none"
              >
                <option value="all">{c.everyone}</option>
                {[...people].map(([id, name]) => (
                  <option key={id || "none"} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
              {c.empty}
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
              {c.emptyFiltered}
            </div>
          ) : (
            days.map(({ day, rows }) => (
              <section key={day} className="mb-4">
                <h2 className="mb-2 font-heading text-sm font-extrabold">
                  {day === today ? c.today : dayLabel(day, lang)}
                </h2>
                <ul className="overflow-hidden rounded-2xl border border-border bg-surface shadow-panel">
                  {rows.map((e) => (
                    <EntryRow key={e.id} entry={e} lang={lang} />
                  ))}
                </ul>
              </section>
            ))
          )}

          {entries.length > 0 && (
            <div className="mt-2 text-center">
              {more ? (
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void showOlder()}
                  className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-extrabold text-text shadow-panel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                >
                  {loadingMore ? admin.loading : c.loadMore}
                </button>
              ) : (
                <p className="text-xs font-bold text-muted">{c.end}</p>
              )}
              {moreFailed && (
                <p role="alert" className="mt-2 text-xs font-bold text-pink">
                  {admin.failed}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

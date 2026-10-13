import { useEffect, useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBrachNhaStore } from "@/lib/store";
import { TitleWithTip } from "@/components/title-with-tip";
import { setOpenErrors } from "@/lib/admin-status";
import {
  fixError,
  loadErrors,
  type AdminFail,
  type ErrorGroup,
  type ErrorReview,
} from "@/lib/admin-tools";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";
import { ADMIN_COPY, dayLabel, whenLabel } from "../copy";

/**
 * /admin/errors: the errors students' phones reported (client_errors, written
 * by lib/telemetry.ts), over supabase/migrations/20261013000002_error_review.sql.
 *
 * One card per MESSAGE, the dashboard's own grouping, split into OPEN (never
 * marked, or happened again after being marked fixed) and MARKED FIXED. "Mark
 * fixed" stamps the moment; an error that happens after it reopens on its own,
 * so a fix that did not work cannot hide.
 *
 * NOBODY IS NAMED. A card says how many students and guests hit an error,
 * never who: the count is what tells the developer how bad it is.
 *
 * The details (pages, app version, browser, stack) are the LATEST occurrence's,
 * folded away by default, with a button that copies them as one block to send
 * to the developer. The stack is the minified build's: the message, the page
 * and the version are usually enough to find the bug.
 *
 * A reading-width list like /admin/mistakes, and like it, it reports its open
 * count back to the menu badge (lib/admin-status.ts) without asking again.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";

function SectionTitle({ text, tip, lang }: { text: string; tip: string; lang: Lang }) {
  return (
    <h2 className="mb-3 font-heading text-sm font-extrabold">
      <TitleWithTip text={text} label={ADMIN_COPY[lang].whatIsThis}>
        {tip}
      </TitleWithTip>
    </h2>
  );
}

function DailyBars({ data, lang }: { data: ErrorReview["daily"]; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const rows = data.map((d) => ({ ...d, label: dayLabel(d.day, lang) }));
  return (
    <div className={`mb-5 ${CARD}`}>
      <SectionTitle text={c.errorsDailyTitle} tip={c.errorsDailyTip} lang={lang} />
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {/* margin.left 0 with a fixed-width axis, as in kruai-view.tsx. */}
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: "var(--color-control)" }}
              contentStyle={{
                borderRadius: 12,
                border: "2px solid var(--color-border)",
                background: "var(--color-tooltip-bg)",
                color: "var(--color-text)",
                fontSize: 12,
                fontWeight: 700,
              }}
              itemStyle={{ color: "var(--color-text)" }}
              labelStyle={{ color: "var(--color-muted)" }}
            />
            <Bar
              dataKey="count"
              name={c.errorsDailyErrors}
              fill="var(--color-pink)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="students"
              name={c.errorsDailyStudents}
              fill="var(--color-purple)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-pink" />
          {c.errorsDailyErrors}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-purple" />
          {c.errorsDailyStudents}
        </span>
      </div>
    </div>
  );
}

/** One block of text with everything a developer needs to find the bug. */
function developerText(g: ErrorGroup): string {
  return [
    g.message,
    "",
    `Count (30 days): ${g.count}, last 7 days: ${g.count7d}`,
    `Students: ${g.students}, guest reports: ${g.guests}`,
    `First seen: ${g.firstSeen}`,
    `Last seen: ${g.lastSeen}`,
    `Latest page: ${g.route ?? "?"}`,
    `Pages: ${g.routes.join(", ") || "?"}`,
    `App version: ${g.version ?? "?"}`,
    `Browser: ${g.userAgent ?? "?"}`,
    "",
    g.stack ?? "(no stack)",
  ].join("\n");
}

function ErrorCard({
  group,
  lang,
  onFixed,
}: {
  group: ErrorGroup;
  lang: Lang;
  onFixed: (message: string) => void;
}) {
  const c = ADMIN_COPY[lang];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);
  const [copied, setCopied] = useState(false);
  const backAgain = group.open && group.fixedAt !== null;

  async function markFixed() {
    setBusy(true);
    setError(null);
    const result = await fixError(group.message);
    setBusy(false);
    if (result.ok) onFixed(group.message);
    else setError(result.reason);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(developerText(group));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard (an insecure origin, or refused). The details are on
      // screen and selectable, so there is nothing to tell the admin.
    }
  }

  return (
    <li className={CARD}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full border border-border px-2 py-0.5 text-[10px] font-extrabold text-ink",
            group.open ? "bg-neo-pink" : "bg-neo-mint"
          )}
        >
          {c.errorCount(group.count)}
        </span>
        {backAgain && (
          <span className="rounded-full border border-border bg-neo-yellow px-2 py-0.5 text-[10px] font-extrabold text-ink">
            {c.errorBack}
          </span>
        )}
        <span className="rounded-full bg-control px-2 py-0.5 text-[10px] font-bold text-muted">
          {c.errorWho(group.students, group.guests)}
        </span>
      </div>

      <div className="font-mono text-xs font-bold [overflow-wrap:anywhere]">{group.message}</div>

      <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] font-bold text-muted">
        <span>{c.errorWeek(group.count7d)}</span>
        <span>
          {c.errorSeen(whenLabel(group.firstSeen, lang), whenLabel(group.lastSeen, lang))}
        </span>
        {group.fixedAt && (
          <span className={backAgain ? "text-pink" : undefined}>
            {c.errorFixedOn(whenLabel(group.fixedAt, lang), group.sinceFix ?? 0)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 flex items-center gap-1 text-xs font-extrabold text-purple"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={2.5}
        />
        {open ? c.errorHide : c.errorDetails}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border p-2.5 text-xs">
          {group.routes.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold text-muted">{c.errorPages}</div>
              <div className="font-mono font-semibold [overflow-wrap:anywhere]">
                {group.routes.join(", ")}
              </div>
            </div>
          )}
          {group.version && (
            <div>
              <div className="text-[10px] font-extrabold text-muted">{c.errorVersion}</div>
              <div className="font-mono font-semibold [overflow-wrap:anywhere]">
                {group.version.slice(0, 7)}
              </div>
            </div>
          )}
          {group.userAgent && (
            <div>
              <div className="text-[10px] font-extrabold text-muted">{c.errorBrowser}</div>
              <div className="font-mono font-semibold [overflow-wrap:anywhere]">
                {group.userAgent}
              </div>
            </div>
          )}
          {group.stack && (
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-muted">{c.errorStack}</div>
              <pre className="max-h-56 overflow-auto rounded-lg bg-control p-2 font-mono text-[10px] leading-snug font-semibold whitespace-pre">
                {group.stack}
              </pre>
            </div>
          )}
          <button
            type="button"
            onClick={() => void copy()}
            className="flex items-center gap-1 self-start rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-text"
          >
            {copied ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : (
              <Copy className="size-3.5" strokeWidth={2.5} />
            )}
            {copied ? c.copiedForDev : c.copyForDev}
          </button>
        </div>
      )}

      {group.open && (
        <div className="mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void markFixed()}
            className="flex items-center gap-1 rounded-xl border border-border bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-text disabled:opacity-50"
          >
            <Check className="size-3.5" strokeWidth={3} />
            {busy ? c.working : c.markFixed}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-xs font-bold text-pink">
              {c.errors[error]}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; data: ErrorReview };

/** Mounted by AdminGate only once access is confirmed. */
export function ErrorsView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await loadErrors();
      if (!alive) return;
      if (result.ok) {
        setLoad({ state: "ready", data: result.data });
        setOpenErrors(result.data.groups.filter((g) => g.open).length);
      } else {
        setLoad({ state: "failed" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Plain values the closures below can read safely: the React Compiler
  // narrows a closure's dependency to the property path it reads, and
  // `load.data` does not exist outside the "ready" state.
  const data = load.state === "ready" ? load.data : null;
  const groups = data?.groups ?? [];
  const openGroups = groups.filter((g) => g.open);
  const fixedGroups = groups.filter((g) => !g.open);

  function onFixed(message: string) {
    if (!data) return;
    const now = new Date().toISOString();
    const next = groups.map((g) =>
      g.message === message ? { ...g, open: false, fixedAt: now, sinceFix: 0 } : g
    );
    setLoad({ state: "ready", data: { ...data, groups: next } });
    // The menu badge follows without asking the server again.
    setOpenErrors(next.filter((g) => g.open).length);
  }

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.errorsBlurb}</p>
      {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.loading}</p>}
      {load.state === "failed" && <p className="text-sm font-bold text-pink">{c.failed}</p>}
      {data && (
        <>
          <DailyBars data={data.daily} lang={lang} />

          {groups.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
              {c.errorsEmpty}
            </div>
          ) : (
            <>
              <SectionTitle text={c.errorsOpenTitle} tip={c.errorsOpenTip} lang={lang} />
              {openGroups.length === 0 ? (
                <div className="mb-5 rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
                  {c.errorsOpenEmpty}
                </div>
              ) : (
                <ul className="mb-5 flex flex-col gap-3">
                  {openGroups.map((g) => (
                    <ErrorCard key={g.message} group={g} lang={lang} onFixed={onFixed} />
                  ))}
                </ul>
              )}

              {fixedGroups.length > 0 && (
                <>
                  <SectionTitle text={c.errorsFixedTitle} tip={c.errorsFixedTip} lang={lang} />
                  <ul className="flex flex-col gap-3">
                    {fixedGroups.map((g) => (
                      <ErrorCard key={g.message} group={g} lang={lang} onFixed={onFixed} />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

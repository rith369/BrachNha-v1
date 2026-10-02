import { useEffect, useState, type ReactNode } from "react";
import { Play, Save } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import {
  KRUAI_LIMIT_BOUNDS,
  loadKruai,
  setKruaiBlock,
  setKruaiLimits,
  type AdminFail,
  type KruaiOverview,
} from "@/lib/admin-tools";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";
import { ADMIN_COPY, dayLabel, whenLabel } from "../copy";

/**
 * /admin/kruai: how much KruAI is used, the two daily limits, and the students
 * whose KruAI is paused (20261002000004_kruai_controls.sql).
 *
 * ONE CALL (admin_kruai_overview()) for everything shown, re-asked after a save
 * or a resume so the page always shows what the database now enforces. The old
 * numbers stay on screen while it re-asks, rather than flashing "Loading".
 *
 * Who may do what is decided by the database; this only avoids offering a
 * control it would refuse:
 *  - the LIMITS are the owner's (they decide how fast the prepaid credit can
 *    go), so an ordinary admin sees them read-only;
 *  - any admin may resume a paused student here. Pausing starts from the
 *    student's own row on /admin/students, where the admin can see who they
 *    are acting on.
 *
 * UNITS, NOT DOLLARS. A question is 1 unit and a new photo 3; what a unit
 * costs exists only in the server's log lines, and the page says so.
 *
 * Laid out like the hub: one column on a phone, two from md. The two
 * un-spanned cards (top students, limits) are an even pair.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 font-heading text-sm font-extrabold">{children}</h2>;
}

function ErrorLine({ reason, lang }: { reason: AdminFail; lang: Lang }) {
  return (
    <p role="alert" className="mt-2 text-xs font-bold text-pink">
      {ADMIN_COPY[lang].errors[reason]}
    </p>
  );
}

function TodayCard({ data, lang }: { data: KruaiOverview; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const pct = data.appDaily > 0 ? Math.min(100, (data.todayUnits / data.appDaily) * 100) : 0;
  return (
    <div className={`md:col-span-2 ${CARD}`}>
      <CardTitle>{c.todayTitle}</CardTitle>
      <div className="font-heading text-3xl leading-none font-extrabold">
        {data.todayUnits}
        <span className="text-base text-muted"> / {data.appDaily}</span>
      </div>
      <div className="mt-1 text-xs font-bold text-muted">
        {c.usedOfLimit(data.todayUnits, data.appDaily)}
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border border-border bg-control">
        <div
          className={cn("h-full", pct >= 90 ? "bg-pink" : pct >= 70 ? "bg-yellow" : "bg-mint")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-bold">{c.studentsToday(data.todayStudents)}</div>
      <p className="mt-3 text-[11px] leading-relaxed font-semibold text-muted">{c.unitsNote}</p>
    </div>
  );
}

function DailyBars({ data, lang }: { data: KruaiOverview; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const rows = data.daily.map((d) => ({ ...d, label: dayLabel(d.day, lang) }));
  const appDaily = data.appDaily;
  return (
    <div className={`md:col-span-2 ${CARD}`}>
      <CardTitle>{c.kruaiDailyTitle}</CardTitle>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {/* margin.left 0 with a fixed-width axis: a negative margin pushes the
              tick numbers off the card (prediction-trend-chart.tsx). */}
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
              // The limit is always inside the scale, so the bars read as
              // "how close to the ceiling", which is what this card is for.
              domain={[0, (max: number) => Math.max(max, appDaily)]}
              tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
              width={40}
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
            <ReferenceLine
              y={appDaily}
              stroke="var(--color-pink)"
              strokeDasharray="5 4"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
            <Bar
              dataKey="units"
              name={c.chartUnits}
              fill="var(--color-purple)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-muted">
        <span className="inline-block h-0 w-5 border-t-2 border-dashed border-pink" />
        {c.chartLimit}: {appDaily}
      </div>
    </div>
  );
}

function TopCard({ data, lang }: { data: KruaiOverview; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  return (
    <div className={CARD}>
      <CardTitle>{c.topTitle}</CardTitle>
      {data.top.length === 0 ? (
        <p className="text-xs font-bold text-muted">{c.topEmpty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/30">
          {data.top.map((s) => (
            <li key={s.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("truncate text-xs font-extrabold", !s.name && "text-muted")}>
                    {s.name || c.noName}
                  </span>
                  {s.blocked && (
                    <span className="rounded-full border border-border bg-neo-pink px-2 py-0.5 text-[10px] font-extrabold text-ink">
                      {c.pausedChip}
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] font-semibold text-muted">
                  {s.email}
                </span>
              </span>
              <span className="shrink-0 text-xs font-extrabold tabular-nums">
                {c.unitsLabel(s.units)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A whole number inside [min, max], or null. "", "1.5" and "abc" are null. */
function parseLimit(raw: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw.trim());
  return n >= min && n <= max ? n : null;
}

function LimitsCard({
  data,
  lang,
  onSaved,
}: {
  data: KruaiOverview;
  lang: Lang;
  onSaved: () => void;
}) {
  const c = ADMIN_COPY[lang];
  const { isOwner } = useAdminStatus();
  const [userRaw, setUserRaw] = useState(() => String(data.userDaily));
  const [appRaw, setAppRaw] = useState(() => String(data.appDaily));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<AdminFail | "invalid" | null>(null);
  const { user, app } = KRUAI_LIMIT_BOUNDS;

  async function save() {
    const u = parseLimit(userRaw, user.min, user.max);
    const a = parseLimit(appRaw, app.min, app.max);
    setSaved(false);
    if (u === null || a === null) {
      setError("invalid");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await setKruaiLimits(u, a);
    setBusy(false);
    if (result.ok) {
      setSaved(true);
      onSaved();
    } else {
      setError(result.reason);
    }
  }

  if (!isOwner) {
    return (
      <div className={CARD}>
        <CardTitle>{c.limitsTitle}</CardTitle>
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-control px-3 py-2">
            <dt className="text-[10px] font-bold text-muted">{c.limitUser}</dt>
            <dd className="font-heading text-xl font-extrabold tabular-nums">{data.userDaily}</dd>
          </div>
          <div className="rounded-xl border border-border bg-control px-3 py-2">
            <dt className="text-[10px] font-bold text-muted">{c.limitApp}</dt>
            <dd className="font-heading text-xl font-extrabold tabular-nums">{data.appDaily}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs font-semibold text-muted">{c.ownerOnlyLimits}</p>
      </div>
    );
  }

  const field =
    "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 font-heading text-lg font-extrabold tabular-nums outline-none focus:border-purple";

  return (
    <div className={CARD}>
      <CardTitle>{c.limitsTitle}</CardTitle>
      <div className="grid grid-cols-2 gap-2">
        <label className="block min-w-0">
          <span className="text-[10px] font-bold text-muted">{c.limitUser}</span>
          <input
            type="number"
            inputMode="numeric"
            min={user.min}
            max={user.max}
            step={1}
            value={userRaw}
            disabled={busy}
            onChange={(e) => {
              setUserRaw(e.target.value);
              setSaved(false);
            }}
            className={field}
          />
          <span className="text-[10px] font-semibold text-muted">
            {c.limitRange(user.min, user.max)}
          </span>
        </label>
        <label className="block min-w-0">
          <span className="text-[10px] font-bold text-muted">{c.limitApp}</span>
          <input
            type="number"
            inputMode="numeric"
            min={app.min}
            max={app.max}
            step={1}
            value={appRaw}
            disabled={busy}
            onChange={(e) => {
              setAppRaw(e.target.value);
              setSaved(false);
            }}
            className={field}
          />
          <span className="text-[10px] font-semibold text-muted">
            {c.limitRange(app.min, app.max)}
          </span>
        </label>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="mt-3 flex items-center gap-1.5 rounded-xl border border-border bg-brand px-4 py-2 text-xs font-extrabold text-on-brand shadow-panel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
      >
        <Save className="size-3.5" strokeWidth={2.5} />
        {busy ? c.working : c.saveLimits}
      </button>
      {saved && (
        <p role="status" className="mt-2 text-xs font-bold text-mint">
          {c.limitsSaved}
        </p>
      )}
      {error === "invalid" && (
        <p role="alert" className="mt-2 text-xs font-bold text-pink">
          {c.limitInvalid}
        </p>
      )}
      {error && error !== "invalid" && <ErrorLine reason={error} lang={lang} />}
    </div>
  );
}

function BlockedRow({
  item,
  lang,
  onResumed,
}: {
  item: KruaiOverview["blocked"][number];
  lang: Lang;
  onResumed: () => void;
}) {
  const c = ADMIN_COPY[lang];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);

  async function resume() {
    setBusy(true);
    setError(null);
    const result = await setKruaiBlock(item.id, false);
    if (result.ok) {
      onResumed();
      return;
    }
    setBusy(false);
    setError(result.reason);
  }

  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-sm font-extrabold", !item.name && "text-muted")}>
            {item.name || c.noName}
          </div>
          <div className="truncate text-[11px] font-semibold text-muted">{item.email}</div>
          <div className="mt-1 text-xs font-semibold [overflow-wrap:anywhere]">
            {item.reason || <span className="text-muted">{c.noReason}</span>}
          </div>
          <div className="mt-0.5 text-[10px] font-bold text-muted">
            {c.blockedBy(item.blockedByName, whenLabel(item.blockedAt, lang))}
          </div>
        </div>
        {/* One tap: resuming gives a student back what everyone else has, so
            there is nothing to confirm. */}
        <button
          type="button"
          disabled={busy}
          onClick={() => void resume()}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-text disabled:opacity-50"
        >
          <Play className="size-3.5" strokeWidth={2.5} />
          {busy ? c.working : c.resumeKruai}
        </button>
      </div>
      {error && <ErrorLine reason={error} lang={lang} />}
    </li>
  );
}

function BlockedCard({
  data,
  lang,
  onChanged,
}: {
  data: KruaiOverview;
  lang: Lang;
  onChanged: () => void;
}) {
  const c = ADMIN_COPY[lang];
  return (
    <div className={`md:col-span-2 ${CARD}`}>
      <CardTitle>{c.blockedTitle}</CardTitle>
      {data.blocked.length === 0 ? (
        <p className="text-xs font-bold text-muted">{c.blockedEmpty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/30">
          {data.blocked.map((b) => (
            <BlockedRow key={b.id} item={b} lang={lang} onResumed={onChanged} />
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] font-semibold text-muted">{c.pausedHelp}</p>
    </div>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; data: KruaiOverview };

/** Mounted by AdminGate only once access is confirmed. */
export function KruaiView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });
  // Bumped after a save or a resume, which re-asks the database. The old
  // numbers stay on screen until the new ones arrive.
  const [version, setVersion] = useState(0);

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await loadKruai();
      if (!alive) return;
      if (result.ok) setLoad({ state: "ready", data: result.data });
      else setLoad((prev) => (prev.state === "ready" ? prev : { state: "failed" }));
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  const reload = () => setVersion((v) => v + 1);

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.kruaiBlurb}</p>
      {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.loading}</p>}
      {load.state === "failed" && <p className="text-sm font-bold text-pink">{c.failed}</p>}
      {load.state === "ready" && (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <TodayCard data={load.data} lang={lang} />
          <DailyBars data={load.data} lang={lang} />
          <TopCard data={load.data} lang={lang} />
          <LimitsCard data={load.data} lang={lang} onSaved={reload} />
          <BlockedCard data={load.data} lang={lang} onChanged={reload} />
        </div>
      )}
    </>
  );
}

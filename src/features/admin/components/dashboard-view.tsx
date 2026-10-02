import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Bot, ChevronRight, ShieldAlert, Users } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import { loadDashboard, type AdminDashboard } from "@/lib/admin-tools";
import type { Lang } from "@/types";
import { ADMIN_COPY, dayLabel, whenLabel } from "../copy";

/**
 * /admin: the team's hub. Six numbers, students per day, what students did,
 * whether new students come back, the crashes, and links to the tools.
 *
 * ONE CALL (admin_dashboard(), 20261002000001) for the whole page, so the
 * numbers on it all come from the same moment. The open-reports count on the
 * tool card is the one the menu badge already holds (lib/admin-status.ts),
 * not a second request.
 *
 * Laid out like Progress: one column on a phone, two from md, with the wide
 * cards spanning both. The two un-spanned cards (events, retention) are an
 * even pair, so the last row never holes.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";
const PRESS =
  "transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 font-heading text-sm font-extrabold">{children}</h2>;
}

function Tile({ label, value, fill }: { label: string; value: number; fill: string }) {
  return (
    <div className={`rounded-xl border border-border p-3 text-ink ${fill}`}>
      <div className="font-heading text-2xl leading-none font-extrabold">{value}</div>
      <div className="mt-1.5 text-[11px] leading-tight font-bold">{label}</div>
    </div>
  );
}

function ToolLink({
  to,
  icon: Icon,
  fill,
  title,
  blurb,
  count,
}: {
  to: string;
  icon: typeof Users;
  fill: string;
  title: string;
  blurb: string;
  count: string | null;
}) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${CARD} ${PRESS}`}>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-ink ${fill}`}
      >
        <Icon className="size-5" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-heading text-sm font-extrabold">{title}</span>
          {count && (
            <span className="rounded-full border border-border bg-neo-yellow px-2 py-0.5 text-[10px] font-extrabold text-ink">
              {count}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs font-semibold text-muted">{blurb}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
    </Link>
  );
}

function DailyChart({ data, lang }: { data: AdminDashboard["daily"]; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const rows = data.map((d) => ({ ...d, label: dayLabel(d.day, lang) }));
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        {/* margin.left 0 with a 34px axis, as prediction-trend-chart.tsx
            explains: a negative margin pushes the tick numbers off the card. */}
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
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
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)" }}
          />
          <Line
            type="monotone"
            dataKey="active"
            name={c.dailyActive}
            stroke="var(--color-purple)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="new"
            name={c.dailyNew}
            stroke="var(--color-mint)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** The tools, outside the dashboard's own load: if admin_dashboard() fails
 *  (say, its migration not applied yet), each tool must still be one tap from
 *  the menu. Three cards: the third spans both columns until xl, where there is
 *  room for three across, so the grid never holes. */
function Tools({ lang }: { lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const { openReports } = useAdminStatus();
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <ToolLink
        to="/admin/students"
        icon={Users}
        fill="bg-neo-blue"
        title={c.toolStudents}
        blurb={c.toolStudentsBlurb}
        count={null}
      />
      <ToolLink
        to="/admin/reports"
        icon={ShieldAlert}
        fill="bg-neo-pink"
        title={c.toolReports}
        blurb={c.toolReportsBlurb}
        count={openReports ? c.openCount(openReports) : null}
      />
      <div className="md:col-span-2 xl:col-span-1">
        <ToolLink
          to="/admin/kruai"
          icon={Bot}
          fill="bg-neo-orange"
          title={c.toolKruai}
          blurb={c.toolKruaiBlurb}
          count={null}
        />
      </div>
    </div>
  );
}

function Dashboard({ data, lang }: { data: AdminDashboard; lang: Lang }) {
  const c = ADMIN_COPY[lang];
  const t = data.totals;

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      <div className={`md:col-span-2 ${CARD}`}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Tile label={c.tiles.students} value={t.students} fill="bg-neo-blue" />
          <Tile label={c.tiles.activeToday} value={t.activeToday} fill="bg-neo-mint" />
          <Tile label={c.tiles.active7d} value={t.active7d} fill="bg-neo-mint" />
          <Tile label={c.tiles.new7d} value={t.new7d} fill="bg-neo-yellow" />
          <Tile label={c.tiles.kruaiToday} value={t.kruaiToday} fill="bg-neo-orange" />
          <Tile label={c.tiles.crashes7d} value={t.crashes7d} fill="bg-neo-pink" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed font-semibold text-muted">
          {c.tilesTip}
        </p>
      </div>

      <div className={`md:col-span-2 ${CARD}`}>
        <CardTitle>{c.dailyTitle}</CardTitle>
        <DailyChart data={data.daily} lang={lang} />
        <p className="mt-2 text-[11px] font-semibold text-muted">
          {data.trackedSince
            ? c.trackedSince(dayLabel(data.trackedSince, lang))
            : c.notTracked}
        </p>
      </div>

      <div className={CARD}>
        <CardTitle>{c.eventsTitle}</CardTitle>
        {data.events.length === 0 ? (
          <p className="text-xs font-bold text-muted">{c.eventsEmpty}</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-extrabold text-muted">
                <th className="pb-1.5 font-extrabold">{c.eventsColEvent}</th>
                <th className="pb-1.5 text-right font-extrabold">{c.eventsColTimes}</th>
                <th className="pb-1.5 text-right font-extrabold">{c.eventsColStudents}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.events.map((e) => (
                <tr key={e.name} className="font-bold">
                  <td className="py-1.5 pr-2">{c.eventNames[e.name] ?? e.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{e.count}</td>
                  <td className="py-1.5 text-right tabular-nums">{e.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={CARD}>
        <CardTitle>{c.retentionTitle}</CardTitle>
        <p className="mb-3 text-[11px] leading-relaxed font-semibold text-muted">
          {c.retentionBlurb}
        </p>
        <ul className="flex flex-col gap-2.5">
          {data.retention.map((r) => {
            const share = r.joined > 0 ? Math.round((r.returned / r.joined) * 100) : 0;
            return (
              <li key={r.starts}>
                <div className="flex items-baseline justify-between gap-2 text-xs font-bold">
                  <span>{c.retentionRange(dayLabel(r.starts, lang), dayLabel(r.ends, lang))}</span>
                  <span className="shrink-0 text-muted tabular-nums">
                    {!r.measurable
                      ? c.retentionNotYet
                      : r.joined === 0
                        ? c.retentionNone
                        : `${share}%`}
                  </span>
                </div>
                {r.measurable && r.joined > 0 && (
                  <>
                    <div className="mt-1 h-2 overflow-hidden rounded-full border border-border bg-control">
                      <div className="h-full bg-mint" style={{ width: `${share}%` }} />
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold text-muted">
                      {c.retentionShare(r.returned, r.joined)}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`md:col-span-2 ${CARD}`}>
        <CardTitle>{c.crashesTitle}</CardTitle>
        {data.crashes.length === 0 ? (
          <p className="text-xs font-bold text-muted">{c.crashesEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/30">
            {data.crashes.map((cr) => (
              <li key={cr.message} className="py-2 first:pt-0 last:pb-0">
                <div className="font-mono text-xs font-bold [overflow-wrap:anywhere]">
                  {cr.message}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] font-bold text-muted">
                  <span>{c.crashMeta(cr.count, cr.students)}</span>
                  <span>{whenLabel(cr.lastSeen, lang)}</span>
                  {cr.route && <span className="[overflow-wrap:anywhere]">{cr.route}</span>}
                  {cr.version && <span>{cr.version.slice(0, 7)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; data: AdminDashboard };

/** Mounted by AdminGate only once access is confirmed. */
export function DashboardView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await loadDashboard();
      if (!alive) return;
      setLoad(result.ok ? { state: "ready", data: result.data } : { state: "failed" });
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.hubBlurb}</p>
      <Tools lang={lang} />
      {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.loading}</p>}
      {load.state === "failed" && <p className="text-sm font-bold text-pink">{c.failed}</p>}
      {load.state === "ready" && <Dashboard data={load.data} lang={lang} />}
    </>
  );
}

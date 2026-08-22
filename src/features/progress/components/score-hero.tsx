import { overallReadiness, miniMetrics } from "../demo-data";

const R = 40;
const CIRC = 2 * Math.PI * R;

export function ScoreHero() {
  const dash = (overallReadiness.pct / 100) * CIRC;

  return (
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
            Overall Readiness
          </div>
          <div className="font-heading text-4xl font-bold">
            {overallReadiness.pct}
            <span className="text-lg text-muted">%</span>
          </div>
          <div className="mt-0.5 text-xs font-bold text-muted">
            Average exam score this month
          </div>
          <div className="mt-1 text-xs font-extrabold text-mint">
            {overallReadiness.change}
          </div>
        </div>

        <div className="relative size-25 shrink-0">
          <svg viewBox="0 0 100 100" width="100" height="100" className="-rotate-90">
            <defs>
              <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-pink)" />
                <stop offset="50%" stopColor="var(--color-purple)" />
                <stop offset="100%" stopColor="var(--color-blue)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="rgba(139,43,226,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="url(#donutGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-heading text-lg font-bold">
              {overallReadiness.pct}%
            </div>
            <div className="text-[9px] font-bold text-muted">ready</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-purple/8 pt-3.5">
        {miniMetrics.map((m) => (
          <div key={m.label} className="text-center">
            <div className={`font-heading text-base font-extrabold ${m.color}`}>
              {m.value}
            </div>
            <div className="text-[9px] font-bold text-muted">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

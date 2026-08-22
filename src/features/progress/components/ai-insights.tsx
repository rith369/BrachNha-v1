import { aiInsights } from "../demo-data";

const COLOR_MAP = {
  purple: "border-purple/20 bg-purple/6 text-purple",
  pink: "border-pink/20 bg-pink/6 text-pink",
  blue: "border-blue/20 bg-blue/6 text-blue",
};

export function AiInsights() {
  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        AI Insights 🤖✨
      </div>
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {aiInsights.map((ins) => (
          <div
            key={ins.title}
            className={`w-56 shrink-0 rounded-2xl border p-3.5 ${COLOR_MAP[ins.color]}`}
          >
            <div className="mb-1.5 text-lg">{ins.icon}</div>
            <div className="mb-1 text-xs font-extrabold">{ins.title}</div>
            <div className="text-[11px] font-semibold text-text/80">
              {ins.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      {/* Full-bleed carousel on a phone: -mx-4 cancels the page's px-4 so the
          cards run to both screen edges, which is what makes it read as
          scrollable. From md the card sits inside a grid column instead, where
          bleeding outward would push it over its neighbour — the page padding
          is also px-6/px-8 there, so -mx-4 would no longer line up with
          anything. Reset it and scroll within the column. */}
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
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

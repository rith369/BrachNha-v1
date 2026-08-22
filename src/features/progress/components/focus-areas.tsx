import { focusAreas } from "../demo-data";

export function FocusAreas() {
  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        Focus Areas 🔍
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {focusAreas.map((a) => (
          <div
            key={a.topic}
            className={
              "rounded-2xl border p-3.5 " +
              (a.kind === "weak"
                ? "border-pink/20 bg-pink/6"
                : "border-mint/20 bg-mint/6")
            }
          >
            <div className="mb-1.5 text-lg">{a.icon}</div>
            <div
              className={
                "mb-1 text-[10px] font-extrabold tracking-wide uppercase " +
                (a.kind === "weak" ? "text-pink" : "text-mint")
              }
            >
              {a.label}
            </div>
            <div className="text-sm font-extrabold">{a.topic}</div>
            <div className="text-[10px] font-bold text-muted">{a.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";
import { focusAreas } from "../demo-data";
import { PROGRESS_COPY } from "../copy";

export function FocusAreas() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = PROGRESS_COPY[lang];

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        {c.focusTitle}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {focusAreas.map((a) => {
          const subject = T[lang][a.subject];
          const sub =
            "avg" in a.stat
              ? c.focusAverage(subject, a.stat.avg)
              : `${subject} · ${a.stat.trend}`;
          return (
            <div
              key={a.label}
              className={
                "rounded-2xl border p-3.5 " +
                (a.kind === "weak"
                  ? "border-pink/20 bg-pink/6"
                  : "border-mint/20 bg-mint/6")
              }
            >
              <div className="mb-1.5 text-lg">{a.icon}</div>
              {/* Uppercase and letter-spacing in English only: Khmer has no case,
                  and tracking pulls a Khmer cluster visibly apart. */}
              <div
                className={
                  "mb-1 text-[10px] font-extrabold " +
                  (lang === "en" ? "tracking-wide uppercase " : "") +
                  (a.kind === "weak" ? "text-pink" : "text-mint")
                }
              >
                {c.focusLabel[a.label]}
              </div>
              <div className="text-sm font-extrabold">{a.topic[lang]}</div>
              <div className="text-[10px] font-bold text-muted">{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

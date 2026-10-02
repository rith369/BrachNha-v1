import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, ExternalLink, X } from "lucide-react";
import { MathText } from "@/components/shell/math-text";
import { useBrachNhaStore } from "@/lib/store";
import { setOpenMistakes } from "@/lib/admin-status";
import {
  listMistakes,
  resolveMistake,
  type AdminFail,
  type MistakeGroup,
} from "@/lib/admin-tools";
import type { Lang } from "@/types";
import { ADMIN_COPY, whenLabel } from "../copy";
import { resolveContentRef } from "../content-ref";

/**
 * /admin/mistakes: questions students flagged as wrong, mistyped or unclear
 * (supabase/migrations/20261002000005, report_content()).
 *
 * One card per QUESTION, however many students reported it, most-reported
 * first. Each card shows the question as the app has it TODAY, resolved from
 * the report's content_ref by ../content-ref.ts: the prompt, every option, the
 * one marked correct and the explanation, with a link to where it lives.
 *
 * THE FIX IS A CODE EDIT. This page cannot change a question; it records that
 * someone looked. "Fixed" means the question was corrected in the code (which
 * then goes through check:quiz); "Not a mistake" closes the reports with no
 * change. Both close every open report on that question at once.
 *
 * KaTeX comes with MathText, from its own shared chunk; this page is lazy, so
 * neither it nor the question corpus reaches a student.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel-sm";

function MistakeCard({
  group,
  lang,
  onDone,
}: {
  group: MistakeGroup;
  lang: Lang;
  onDone: (ref: string) => void;
}) {
  const c = ADMIN_COPY[lang];
  const q = resolveContentRef(group.ref);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);

  async function act(resolution: "fixed" | "not_mistake") {
    setBusy(true);
    setError(null);
    const result = await resolveMistake(group.ref, resolution);
    if (result.ok) {
      onDone(group.ref);
      return;
    }
    setBusy(false);
    setError(result.reason);
  }

  return (
    <li className={CARD}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-border bg-neo-pink px-2 py-0.5 text-[10px] font-extrabold text-ink">
          {c.reportsCount(group.reports)}
        </span>
        {group.kinds.map((k) => (
          <span
            key={k}
            className="rounded-full bg-control px-2 py-0.5 text-[10px] font-bold text-muted"
          >
            {c.kindNames[k] ?? k}
          </span>
        ))}
      </div>

      {q ? (
        <>
          <div className="text-[11px] font-bold text-muted">
            {c.refKinds[q.kind]}
            {q.step !== undefined && ` · ${c.sectionPart(q.step)}`}
            {` · ${c.questionN(q.number)}`}
          </div>
          <div className="mb-2 text-sm font-extrabold [overflow-wrap:anywhere]">{q.title}</div>

          {q.statement && (
            <div className="mb-2 rounded-xl bg-control p-2.5 text-xs font-semibold whitespace-pre-line">
              <MathText text={q.statement} />
            </div>
          )}
          {q.scenario && (
            <div className="mb-1 text-xs font-semibold whitespace-pre-line text-muted">
              <MathText text={q.scenario} />
            </div>
          )}
          <div className="mb-2 text-sm font-bold">
            <MathText text={q.prompt} />
          </div>

          {q.options.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1">
              {q.options.map((opt) => {
                const right = opt === q.correct;
                return (
                  <li
                    key={opt}
                    className={
                      "flex items-start gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold " +
                      (right ? "bg-mint/30" : "bg-surface")
                    }
                  >
                    {right && (
                      <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} aria-label={c.markedAnswer} />
                    )}
                    <MathText text={opt} />
                  </li>
                );
              })}
            </ul>
          )}
          {q.options.length === 0 && (
            <div className="mb-2 text-xs font-bold">
              {c.markedAnswer}: <MathText text={q.correct} />
            </div>
          )}

          <div className="mb-2 rounded-xl border border-border p-2.5">
            <div className="mb-1 text-[10px] font-extrabold text-muted">{c.explanationLabel}</div>
            <div className="text-xs font-semibold whitespace-pre-line">
              <MathText text={q.explanation} />
            </div>
          </div>

          <Link
            to={q.link}
            className="mb-2 inline-flex items-center gap-1 text-xs font-extrabold text-purple"
          >
            <ExternalLink className="size-3.5" strokeWidth={2.5} />
            {c.openIt}
          </Link>
        </>
      ) : (
        <p className="mb-2 text-xs font-bold text-muted">
          {c.missing} <span className="font-mono [overflow-wrap:anywhere]">{group.ref}</span>
        </p>
      )}

      {group.notes.length > 0 && (
        <div className="mb-2">
          <div className="mb-1 text-[10px] font-extrabold text-muted">{c.notesLabel}</div>
          <ul className="flex flex-col gap-1">
            {group.notes.map((n, i) => (
              <li
                key={i}
                className="rounded-lg bg-control px-2.5 py-1.5 text-xs font-semibold [overflow-wrap:anywhere]"
              >
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-[10px] font-bold text-muted">
        {c.lastReported(whenLabel(group.lastReported, lang))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("fixed")}
          className="flex items-center gap-1 rounded-xl border border-border bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-text disabled:opacity-50"
        >
          <Check className="size-3.5" strokeWidth={3} />
          {busy ? c.working : c.fixed}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("not_mistake")}
          className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-text disabled:opacity-50"
        >
          <X className="size-3.5" strokeWidth={3} />
          {c.notMistake}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-pink">
          {c.errors[error]}
        </p>
      )}
    </li>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; items: MistakeGroup[] };

/** Mounted by AdminGate only once access is confirmed. */
export function MistakesView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });

  // setState only from the async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await listMistakes();
      if (!alive) return;
      if (result.ok) {
        setLoad({ state: "ready", items: result.data });
        setOpenMistakes(result.data.length);
      } else {
        setLoad({ state: "failed" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // A plain array the closures below can read safely: the React Compiler
  // narrows a closure's dependency to the property path it reads, and
  // `load.items` does not exist outside the "ready" state.
  const items = load.state === "ready" ? load.items : [];

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.mistakesBlurb}</p>
      {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.loading}</p>}
      {load.state === "failed" && <p className="text-sm font-bold text-pink">{c.failed}</p>}
      {load.state === "ready" && items.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
          {c.mistakesEmpty}
        </div>
      )}
      {load.state === "ready" && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((g) => (
            <MistakeCard
              key={g.ref}
              group={g}
              lang={lang}
              onDone={(ref) => {
                const rest = items.filter((x) => x.ref !== ref);
                setLoad({ state: "ready", items: rest });
                // The menu badge follows without asking the server again.
                setOpenMistakes(rest.length);
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}

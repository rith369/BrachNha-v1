import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, Send, Square } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { isAppPath } from "@/lib/announcements";
import {
  endAnnouncement,
  listAnnouncements,
  publishAnnouncement,
  type AdminAnnouncement,
  type AdminFail,
} from "@/lib/admin-tools";
import type { AnnouncementTone } from "@/types/database";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";
import { ADMIN_COPY, whenLabel } from "../copy";

/**
 * /admin/announcements: write one, see exactly how it will look, publish it,
 * and end any that are showing (supabase/migrations/20261002000005).
 *
 * THE PREVIEW IS LIVE, under the form, drawn with the same fill, icon and type
 * as the real banner (components/shell/announcement-banner.tsx), in both
 * languages, so what is published is what was seen.
 *
 * NO LONG DASHES. The app never shows a student an em dash (AGENTS.md), and an
 * announcement is something every student reads, so the form refuses one and
 * asks for a comma or a full stop. The database checks the rest again: the
 * Khmer text, the 300-character limit, the link being an app path, and an end
 * in the future.
 *
 * Any admin may publish and end. Every action re-asks the list, so the "Live"
 * chips always reflect the database.
 */

const CARD = "rounded-2xl border border-border bg-surface p-4 shadow-panel";
const MAX = 300;
const EM_DASH = "—";

const TONE_FILL: Record<AnnouncementTone, string> = {
  info: "bg-neo-blue",
  success: "bg-neo-mint",
  warning: "bg-neo-yellow",
};

type Ends = "day" | "week" | "month" | "never";
const ENDS_DAYS: Record<Ends, number | null> = { day: 1, week: 7, month: 30, never: null };

/** The banner as students see it, without the dismiss button. */
function BannerPreview({
  text,
  tone,
  link,
  lang,
}: {
  text: string;
  tone: AnnouncementTone;
  link: string;
  lang: Lang;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-border px-3 py-2.5 text-ink shadow-hard-sm",
        TONE_FILL[tone]
      )}
    >
      <Megaphone className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed font-bold [overflow-wrap:anywhere] md:text-sm">
          {text}
        </p>
        {link && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-2">
            {lang === "en" ? "Open" : "បើក"}
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </span>
        )}
      </div>
    </div>
  );
}

function ComposeCard({ lang, onPublished }: { lang: Lang; onPublished: () => void }) {
  const c = ADMIN_COPY[lang];
  const [km, setKm] = useState("");
  const [en, setEn] = useState("");
  const [tone, setTone] = useState<AnnouncementTone>("info");
  const [link, setLink] = useState("");
  const [ends, setEnds] = useState<Ends>("week");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<AdminFail | "dash" | null>(null);

  const kmTrim = km.trim();
  const linkTrim = link.trim();
  const hasDash = km.includes(EM_DASH) || en.includes(EM_DASH);
  const linkOk = linkTrim === "" || isAppPath(linkTrim);
  const canPublish = kmTrim.length > 0 && km.length <= MAX && en.length <= MAX && linkOk;

  async function publish() {
    setDone(false);
    if (hasDash) {
      setError("dash");
      return;
    }
    setBusy(true);
    setError(null);
    const days = ENDS_DAYS[ends];
    const result = await publishAnnouncement({
      bodyKm: km,
      bodyEn: en,
      tone,
      link: linkTrim,
      endsAt: days === null ? null : new Date(Date.now() + days * 86_400_000).toISOString(),
    });
    setBusy(false);
    if (result.ok) {
      setKm("");
      setEn("");
      setLink("");
      setTone("info");
      setEnds("week");
      setDone(true);
      onPublished();
    } else {
      setError(result.reason);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold outline-none placeholder:text-muted focus:border-purple";

  return (
    <div className={CARD}>
      <h2 className="mb-3 font-heading text-sm font-extrabold">{c.newTitle}</h2>

      <label className="block">
        <span className="text-xs font-bold">{c.fieldKm}</span>
        <textarea
          value={km}
          maxLength={MAX}
          rows={3}
          disabled={busy}
          onChange={(e) => {
            setKm(e.target.value);
            setDone(false);
          }}
          className={cn(field, "resize-y")}
        />
        <span className="text-[10px] font-semibold text-muted">{c.charsLeft(MAX - km.length)}</span>
      </label>

      <label className="mt-2 block">
        <span className="text-xs font-bold">{c.fieldEn}</span>
        <textarea
          value={en}
          maxLength={MAX}
          rows={2}
          disabled={busy}
          onChange={(e) => {
            setEn(e.target.value);
            setDone(false);
          }}
          className={cn(field, "resize-y")}
        />
        <span className="text-[10px] font-semibold text-muted">{c.fieldEnHint}</span>
      </label>

      <fieldset className="mt-3">
        <legend className="text-xs font-bold">{c.fieldTone}</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(Object.keys(TONE_FILL) as AnnouncementTone[]).map((t) => (
            <button
              key={t}
              type="button"
              disabled={busy}
              aria-pressed={tone === t}
              onClick={() => setTone(t)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs font-extrabold text-ink",
                TONE_FILL[t],
                tone === t ? "shadow-hard-sm" : "opacity-60"
              )}
            >
              {c.tones[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-3 block">
        <span className="text-xs font-bold">{c.fieldLink}</span>
        <input
          type="text"
          value={link}
          disabled={busy}
          placeholder="/exam"
          onChange={(e) => setLink(e.target.value)}
          className={cn(field, !linkOk && "border-pink")}
        />
        <span className={cn("text-[10px] font-semibold", linkOk ? "text-muted" : "text-pink")}>
          {linkOk ? c.fieldLinkHint : c.errors.link}
        </span>
      </label>

      <fieldset className="mt-3">
        <legend className="text-xs font-bold">{c.fieldEnds}</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(Object.keys(ENDS_DAYS) as Ends[]).map((e) => (
            <button
              key={e}
              type="button"
              disabled={busy}
              aria-pressed={ends === e}
              onClick={() => setEnds(e)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs font-bold",
                ends === e ? "bg-purple/30 text-text" : "bg-surface text-text hover:bg-purple/5"
              )}
            >
              {c.endsOptions[e]}
            </button>
          ))}
        </div>
      </fieldset>

      {kmTrim && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-bold text-muted">{c.preview}</div>
          <div className="flex flex-col gap-2">
            <BannerPreview text={kmTrim} tone={tone} link={linkOk ? linkTrim : ""} lang="km" />
            {en.trim() && (
              <BannerPreview text={en.trim()} tone={tone} link={linkOk ? linkTrim : ""} lang="en" />
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!canPublish || busy}
        onClick={() => void publish()}
        className="mt-4 flex items-center gap-1.5 rounded-xl border border-border bg-brand px-4 py-2 text-xs font-extrabold text-on-brand shadow-panel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
      >
        <Send className="size-3.5" strokeWidth={2.5} />
        {busy ? c.working : c.publish}
      </button>
      {done && (
        <p role="status" className="mt-2 text-xs font-bold text-mint">
          {c.published}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-pink">
          {error === "dash" ? c.annDash : c.errors[error]}
        </p>
      )}
    </div>
  );
}

function AnnouncementRow({
  item,
  lang,
  onEnded,
}: {
  item: AdminAnnouncement;
  lang: Lang;
  onEnded: () => void;
}) {
  const c = ADMIN_COPY[lang];
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);

  async function end() {
    setBusy(true);
    setError(null);
    const result = await endAnnouncement(item.id);
    setBusy(false);
    setArmed(false);
    if (result.ok) onEnded();
    else setError(result.reason);
  }

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full border border-border px-2 py-0.5 text-[10px] font-extrabold text-ink",
            TONE_FILL[item.tone]
          )}
        >
          {c.tones[item.tone]}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
            item.live ? "border border-border bg-neo-mint text-ink" : "bg-control text-muted"
          )}
        >
          {item.live ? c.liveChip : c.endedChip}
        </span>
      </div>
      <p className="text-sm font-bold [overflow-wrap:anywhere]">{item.bodyKm}</p>
      {item.bodyEn && (
        <p className="text-xs font-semibold text-muted [overflow-wrap:anywhere]">{item.bodyEn}</p>
      )}
      {item.link && <p className="mt-0.5 font-mono text-[11px] text-purple">{item.link}</p>}
      <p className="mt-1 text-[10px] font-bold text-muted">
        {c.publishedBy(item.createdByName, whenLabel(item.createdAt, lang))}
        {" · "}
        {item.endsAt ? c.endsAtLabel(whenLabel(item.endsAt, lang)) : c.noEnd}
      </p>
      {item.active && (
        <button
          type="button"
          disabled={busy}
          onClick={() => (armed ? void end() : setArmed(true))}
          className={cn(
            "mt-2 flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-extrabold disabled:opacity-50",
            armed ? "bg-[var(--brand-pink)] text-white" : "bg-surface text-text"
          )}
        >
          <Square className="size-3" strokeWidth={3} />
          {busy ? c.working : armed ? c.confirmEnd : c.endNow}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-bold text-pink">
          {c.errors[error]}
        </p>
      )}
    </li>
  );
}

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; items: AdminAnnouncement[] };

/** Mounted by AdminGate only once access is confirmed. */
export function AnnouncementsView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = ADMIN_COPY[lang];
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [version, setVersion] = useState(0);

  // setState only from the async callback (react(set-state-in-effect)). The
  // old list stays on screen while a re-ask is in flight.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await listAnnouncements();
      if (!alive) return;
      if (result.ok) setLoad({ state: "ready", items: result.data });
      else setLoad((prev) => (prev.state === "ready" ? prev : { state: "failed" }));
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  const reload = () => setVersion((v) => v + 1);
  const items = load.state === "ready" ? load.items : [];

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.annBlurb}</p>
      <div className="flex flex-col gap-4">
        <ComposeCard lang={lang} onPublished={reload} />
        <div className={CARD}>
          <h2 className="mb-3 font-heading text-sm font-extrabold">{c.listTitle}</h2>
          {load.state === "loading" && <p className="text-sm font-bold text-muted">{c.loading}</p>}
          {load.state === "failed" && <p className="text-sm font-bold text-pink">{c.failed}</p>}
          {load.state === "ready" && items.length === 0 && (
            <p className="text-xs font-bold text-muted">{c.listEmpty}</p>
          )}
          {items.length > 0 && (
            <ul className="flex flex-col divide-y divide-border/30">
              {items.map((a) => (
                <AnnouncementRow key={a.id} item={a} lang={lang} onEnded={reload} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

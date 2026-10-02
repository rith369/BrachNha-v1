import { useEffect, useState } from "react";
import { Check, ImageOff, ShieldAlert, Trash2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import {
  deletePhoto,
  keepPhoto,
  listReportedPhotos,
  type ReportedPhoto,
} from "@/lib/admin-reports";
import { setOpenReports } from "@/lib/admin-status";
import type { Lang } from "@/types";

/**
 * /admin/reports — the team's review of reported battle photos.
 *
 * Reached from the /admin hub, and not in app.tsx's prefetch map: nobody but
 * the team should download it. Being an admin is decided by the DATABASE
 * (is_app_admin(), over user_roles since 20261002000001); a student who types
 * this URL sees "not for you" (AdminGate), and every call behind the page would
 * refuse them anyway.
 *
 * Keep closes the reports and leaves the photo. Delete removes the photo for
 * everyone (two taps), then closes the reports. Both are recorded on the report
 * rows (resolution / resolved_at / resolved_by), never deleted.
 */

const COPY = {
  en: {
    title: "Photo reports",
    blurb: "Photos students reported in battle reviews. Keep closes the report; Delete removes the photo for everyone.",
    loading: "Loading reports…",
    failed: "Could not load reports. Check your connection and reload.",
    empty: "No reports waiting. 🎉",
    gone: "File already gone",
    owner: "Photo by",
    unknown: "Unknown student",
    reports: (n: number) => `${n} ${n === 1 ? "report" : "reports"}`,
    question: (q: number) => `Question ${q}`,
    keep: "Keep",
    del: "Delete",
    confirm: "Delete for everyone?",
    working: "Working…",
    actionFailed: "That did not work. Try again.",
    reasons: { inappropriate: "Inappropriate", not_work: "Not schoolwork", other: "Other" } as Record<string, string>,
  },
  km: {
    title: "របាយការណ៍រូបថត",
    blurb: "រូបថតដែលសិស្សបានរាយការណ៍ក្នុងការប្រកួត។ «រក្សាទុក» បិទរបាយការណ៍។ «លុប» លុបរូបថតសម្រាប់គ្រប់គ្នា។",
    loading: "កំពុងទាញយករបាយការណ៍…",
    failed: "មិនអាចទាញយករបាយការណ៍បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចផ្ទុកឡើងវិញ។",
    empty: "មិនមានរបាយការណ៍រង់ចាំទេ។ 🎉",
    gone: "ឯកសារត្រូវបានលុបរួចហើយ",
    owner: "រូបថតរបស់",
    unknown: "សិស្សមិនស្គាល់",
    reports: (n: number) => `របាយការណ៍ ${n}`,
    question: (q: number) => `សំណួរទី ${q}`,
    keep: "រក្សាទុក",
    del: "លុប",
    confirm: "លុបសម្រាប់គ្រប់គ្នា?",
    working: "កំពុងដំណើរការ…",
    actionFailed: "មិនបានសម្រេចទេ។ សូមព្យាយាមម្តងទៀត។",
    reasons: { inappropriate: "មិនសមរម្យ", not_work: "មិនមែនកិច្ចការសិក្សា", other: "ផ្សេងៗ" } as Record<string, string>,
  },
};

type Load = "loading" | "failed" | "ready";

/** The question number from `{competition}/{owner}/{q}-{id}.jpg`, 1-based. */
function questionOf(path: string): number | null {
  const m = /\/([0-9]{1,2})-[A-Za-z0-9]+\.jpg$/.exec(path);
  return m ? Number(m[1]) + 1 : null;
}

function dateLabel(iso: string): string {
  // en-GB explicitly: no locale would let a Khmer-locale device print Khmer
  // numerals, which this app never shows (see check:digits).
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportCard({
  item,
  lang,
  onDone,
}: {
  item: ReportedPhoto;
  lang: Lang;
  onDone: (path: string) => void;
}) {
  const c = COPY[lang];
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const q = questionOf(item.path);

  async function act(kind: "keep" | "delete") {
    setBusy(true);
    setFailed(false);
    const result =
      kind === "keep"
        ? await keepPhoto(item.path)
        : await deletePhoto(item.path, item.url !== null);
    setBusy(false);
    setArmed(false);
    if (result.ok) onDone(item.path);
    else setFailed(true);
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-3 shadow-panel-sm">
      {item.url ? (
        // A plain link to the full image, like the battle review's own strip:
        // the browser's viewer gives zoom for free.
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="block size-28 shrink-0 overflow-hidden rounded-xl border border-border bg-control md:size-36"
        >
          <img src={item.url} alt="" className="size-full object-cover" />
        </a>
      ) : (
        <div className="flex size-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-control px-2 text-center text-[10px] font-bold text-muted md:size-36">
          <ImageOff className="size-5" strokeWidth={2} />
          {c.gone}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-muted">{c.owner}</div>
          <div className="truncate text-sm font-extrabold">
            {item.ownerName || c.unknown}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-extrabold text-pink">
            {c.reports(item.reports)}
          </span>
          {item.reasons.map((r) => (
            <span
              key={r}
              className="rounded-full bg-control px-2 py-0.5 text-[10px] font-bold text-muted"
            >
              {c.reasons[r] ?? r}
            </span>
          ))}
          {q !== null && (
            <span className="rounded-full bg-control px-2 py-0.5 text-[10px] font-bold text-muted">
              {c.question(q)}
            </span>
          )}
        </div>
        <div className="text-[10px] font-bold text-muted">
          {dateLabel(item.lastReported)}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => void act("keep")}
            className="flex items-center gap-1 rounded-xl border border-border bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-mint disabled:opacity-50"
          >
            <Check className="size-3.5" strokeWidth={3} />
            {c.keep}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => (armed ? void act("delete") : setArmed(true))}
            className={
              "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold disabled:opacity-50 " +
              (armed
                ? "bg-[var(--brand-pink)] text-white"
                : "border border-border bg-pink/30 text-text")
            }
          >
            <Trash2 className="size-3.5" strokeWidth={2.5} />
            {busy ? c.working : armed ? c.confirm : c.del}
          </button>
        </div>
        {failed && (
          <p role="alert" className="text-[10px] font-bold text-pink">
            {c.actionFailed}
          </p>
        )}
      </div>
    </div>
  );
}

function ReportsBody() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = COPY[lang];
  const [load, setLoad] = useState<Load>("loading");
  const [items, setItems] = useState<ReportedPhoto[]>([]);

  // Mounted by AdminGate only once access is confirmed. setState only from the
  // async callback (oxlint's react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await listReportedPhotos();
      if (!alive) return;
      if (result.ok) {
        setItems(result.data);
        setOpenReports(result.data.length);
        setLoad("ready");
      } else {
        setLoad("failed");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.blurb}</p>
      {load === "loading" && (
        <p className="text-sm font-bold text-muted">{c.loading}</p>
      )}
      {load === "failed" && (
        <p className="text-sm font-bold text-pink">{c.failed}</p>
      )}
      {load === "ready" && items.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
          {c.empty}
        </div>
      )}
      {load === "ready" && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ReportCard
              key={item.path}
              item={item}
              lang={lang}
              onDone={(path) => {
                const rest = items.filter((i) => i.path !== path);
                setItems(rest);
                // The menu badge follows without asking the server again.
                setOpenReports(rest.length);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminReportsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={COPY[lang].title} icon={ShieldAlert} back>
      <ReportsBody />
    </AdminGate>
  );
}

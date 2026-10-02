import { useEffect, useState } from "react";
import { ChevronDown, Pause, Play, Search, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useAdminStatus } from "@/lib/admin-status";
import {
  deleteStudent,
  listStudents,
  setAdmin,
  setKruaiBlock,
  type AdminFail,
  type AdminStudent,
} from "@/lib/admin-tools";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";
import { ADMIN_COPY, dateLabel, whenLabel } from "../copy";

/**
 * /admin/students: look a student up, make or remove an admin, delete an
 * account.
 *
 * Every action here is a database function that checks the caller again
 * (20261002000001, owner rules from 20261002000002); the buttons only decide
 * what is offered:
 *
 *  - your own row offers nothing (Profile is where you change yourself, and
 *    admin_delete_user() refuses it anyway);
 *  - the owner's row offers nothing to anyone: the owner is set in the
 *    database only;
 *  - only the owner can make or remove admins, and an admin's account can only
 *    be deleted by the owner, after removing the role;
 *  - both role changes and the delete take two steps, the delete a tick box as
 *    well (Profile's delete-account.tsx pattern).
 *
 * The list is at most 50 rows (admin_students() caps it): the 50 most recently
 * active, or the first 50 matches of a search.
 */

type Rows =
  | { query: string; state: "failed" }
  | { query: string; state: "ready"; rows: AdminStudent[] };

const SEARCH_DELAY_MS = 300;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-control px-2.5 py-2">
      <div className="text-[10px] font-bold text-muted">{label}</div>
      <div className="text-sm font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function ErrorLine({ reason, lang }: { reason: AdminFail; lang: Lang }) {
  return (
    <p role="alert" className="mt-2 text-xs font-bold text-pink">
      {ADMIN_COPY[lang].errors[reason]}
    </p>
  );
}

function RoleButton({
  student,
  lang,
  onChanged,
}: {
  student: AdminStudent;
  lang: Lang;
  onChanged: (isAdmin: boolean) => void;
}) {
  const c = ADMIN_COPY[lang];
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);
  const grant = !student.isAdmin;

  async function confirm() {
    setBusy(true);
    setError(null);
    const result = await setAdmin(student.id, grant);
    setBusy(false);
    setArmed(false);
    if (result.ok) onChanged(grant);
    else setError(result.reason);
  }

  const Icon = grant ? ShieldCheck : ShieldOff;
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => (armed ? void confirm() : setArmed(true))}
        className={cn(
          "flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-extrabold disabled:opacity-50",
          armed ? "bg-[var(--brand-purple)] text-white" : "bg-surface text-text"
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.5} />
        {busy
          ? c.working
          : armed
            ? grant
              ? c.confirmMake
              : c.confirmRemove
            : grant
              ? c.makeAdmin
              : c.removeAdmin}
      </button>
      {armed && grant && (
        <p className="mt-1.5 text-[11px] font-semibold text-muted">{c.adminNote}</p>
      )}
      {error && <ErrorLine reason={error} lang={lang} />}
    </div>
  );
}

function DeletePanel({
  student,
  lang,
  onDeleted,
}: {
  student: AdminStudent;
  lang: Lang;
  onDeleted: () => void;
}) {
  const c = ADMIN_COPY[lang];
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const result = await deleteStudent(student.id);
    if (result.ok) {
      onDeleted();
      return;
    }
    setBusy(false);
    setError(result.reason);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-pink/30 px-3 py-2 text-xs font-extrabold text-text"
      >
        <Trash2 className="size-3.5" strokeWidth={2.5} />
        {c.deleteOpen}
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-pink/30 p-3">
      <div className="mb-1.5 text-sm font-extrabold">{c.deleteTitle}</div>
      <p className="mb-3 text-xs leading-relaxed font-semibold">
        {c.deleteBody(student.name || student.email || c.noName)}
      </p>
      <label className="mb-3 flex cursor-pointer items-start gap-2 text-xs font-bold">
        <input
          type="checkbox"
          checked={agreed}
          disabled={busy}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-pink)]"
        />
        <span>{c.understand}</span>
      </label>
      {error && <ErrorLine reason={error} lang={lang} />}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setAgreed(false);
            setError(null);
          }}
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-extrabold disabled:opacity-50"
        >
          {c.cancel}
        </button>
        <button
          type="button"
          disabled={!agreed || busy}
          onClick={() => void confirm()}
          className="flex-1 rounded-xl border border-border bg-[var(--brand-pink)] px-3 py-2.5 text-xs font-extrabold text-white disabled:opacity-40"
        >
          {busy ? c.working : c.deleteConfirm}
        </button>
      </div>
    </div>
  );
}

/**
 * What the viewer may do to one student. The database decides all of it
 * (20261002000002); this only avoids offering a button it would refuse:
 *
 *  - the OWNER's row offers nothing (the owner is set in the database only);
 *  - only the owner sees Make admin / Remove admin;
 *  - an admin's account is deleted only by the owner, after removing the role.
 */
/**
 * Pause or resume KruAI for one student (20261002000004). Pausing takes two
 * taps and offers an optional reason, which the KruAI page's paused list shows
 * the rest of the team; resuming is one tap, since it only gives back what
 * everyone else has. Offered on ordinary students only: the database refuses
 * to pause an admin or the owner, so their rows never show it.
 */
function PauseButton({
  student,
  lang,
  onChanged,
}: {
  student: AdminStudent;
  lang: Lang;
  onChanged: (blocked: boolean) => void;
}) {
  const c = ADMIN_COPY[lang];
  const [armed, setArmed] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminFail | null>(null);
  const pause = !student.kruaiBlocked;

  async function confirm() {
    setBusy(true);
    setError(null);
    const result = await setKruaiBlock(student.id, pause, reason);
    setBusy(false);
    if (result.ok) {
      setArmed(false);
      setReason("");
      onChanged(pause);
    } else {
      setError(result.reason);
    }
  }

  if (!pause) {
    return (
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void confirm()}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-mint/30 px-3 py-2 text-xs font-extrabold text-text disabled:opacity-50"
        >
          <Play className="size-3.5" strokeWidth={2.5} />
          {busy ? c.working : c.resumeKruai}
        </button>
        {error && <ErrorLine reason={error} lang={lang} />}
      </div>
    );
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-extrabold text-text"
      >
        <Pause className="size-3.5" strokeWidth={2.5} />
        {c.pauseKruai}
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-yellow/30 p-3">
      <p className="mb-2 text-xs leading-relaxed font-semibold">{c.pauseNote}</p>
      <input
        type="text"
        value={reason}
        maxLength={200}
        disabled={busy}
        onChange={(e) => setReason(e.target.value)}
        placeholder={c.pauseReason}
        aria-label={c.pauseReason}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold outline-none placeholder:text-muted focus:border-purple"
      />
      {error && <ErrorLine reason={error} lang={lang} />}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setArmed(false);
            setReason("");
            setError(null);
          }}
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-extrabold disabled:opacity-50"
        >
          {c.cancel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void confirm()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-[var(--brand-purple)] px-3 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
        >
          <Pause className="size-3.5" strokeWidth={2.5} />
          {busy ? c.working : c.confirmPause}
        </button>
      </div>
    </div>
  );
}

function Actions({
  student,
  viewerIsOwner,
  lang,
  onChanged,
  onDeleted,
}: {
  student: AdminStudent;
  viewerIsOwner: boolean;
  lang: Lang;
  onChanged: (next: AdminStudent) => void;
  onDeleted: () => void;
}) {
  const c = ADMIN_COPY[lang];
  if (student.isOwner) {
    return <p className="mt-3 text-xs font-semibold text-muted">{c.ownerNote}</p>;
  }
  if (student.isAdmin && !viewerIsOwner) {
    return <p className="mt-3 text-xs font-semibold text-muted">{c.ownerOnlyAdmin}</p>;
  }
  return (
    <div className="mt-3 flex flex-col items-start gap-3">
      {viewerIsOwner ? (
        <RoleButton
          student={student}
          lang={lang}
          onChanged={(isAdmin) => onChanged({ ...student, isAdmin })}
        />
      ) : (
        <p className="text-xs font-semibold text-muted">{c.ownerOnly}</p>
      )}
      {!student.isAdmin && (
        <PauseButton
          student={student}
          lang={lang}
          onChanged={(kruaiBlocked) => onChanged({ ...student, kruaiBlocked })}
        />
      )}
      {student.isAdmin ? (
        <p className="text-xs font-semibold text-muted">{c.deleteAdminFirst}</p>
      ) : (
        <DeletePanel student={student} lang={lang} onDeleted={onDeleted} />
      )}
    </div>
  );
}

function StudentDetail({
  student,
  isMe,
  viewerIsOwner,
  lang,
  onChanged,
  onDeleted,
}: {
  student: AdminStudent;
  isMe: boolean;
  viewerIsOwner: boolean;
  lang: Lang;
  onChanged: (next: AdminStudent) => void;
  onDeleted: () => void;
}) {
  const c = ADMIN_COPY[lang];
  return (
    <div className="border-t border-border px-3 pt-3 pb-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={c.joined} value={dateLabel(student.joinedAt, lang)} />
        {student.lastSeen && (
          <Stat label={c.lastSeenLabel} value={whenLabel(student.lastSeen, lang)} />
        )}
        <Stat label={c.activeDays} value={student.activeDays30} />
        <Stat label={c.xp} value={student.xp} />
        <Stat label={c.level} value={student.level} />
        <Stat label={c.streak} value={student.streak} />
        <Stat label={c.kruaiToday} value={student.kruaiToday} />
        <Stat label={c.kruai7d} value={student.kruai7d} />
      </div>

      {isMe ? (
        <p className="mt-3 text-xs font-semibold text-muted">{c.selfNote}</p>
      ) : (
        <Actions
          student={student}
          viewerIsOwner={viewerIsOwner}
          lang={lang}
          onChanged={onChanged}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}

function StudentRow({
  student,
  isMe,
  viewerIsOwner,
  open,
  lang,
  onToggle,
  onChanged,
  onDeleted,
}: {
  student: AdminStudent;
  isMe: boolean;
  viewerIsOwner: boolean;
  open: boolean;
  lang: Lang;
  onToggle: () => void;
  onChanged: (next: AdminStudent) => void;
  onDeleted: () => void;
}) {
  const c = ADMIN_COPY[lang];
  const name = student.name || c.noName;
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-surface shadow-panel-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-neo-blue font-heading text-sm font-extrabold text-ink">
          {(student.name || student.email || "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "truncate text-sm font-extrabold",
                !student.name && "text-muted"
              )}
            >
              {name}
            </span>
            {isMe && (
              <span className="rounded-full bg-[var(--brand-purple)] px-2 py-0.5 text-[10px] font-extrabold text-white">
                {c.you}
              </span>
            )}
            {student.isOwner ? (
              <span className="rounded-full border border-border bg-neo-pink px-2 py-0.5 text-[10px] font-extrabold text-ink">
                {c.ownerChip}
              </span>
            ) : (
              student.isAdmin && (
                <span className="rounded-full border border-border bg-neo-yellow px-2 py-0.5 text-[10px] font-extrabold text-ink">
                  {c.adminChip}
                </span>
              )
            )}
            {student.kruaiBlocked && (
              <span className="rounded-full border border-border bg-neo-orange px-2 py-0.5 text-[10px] font-extrabold text-ink">
                {c.kruaiPausedChip}
              </span>
            )}
          </span>
          <span className="block truncate text-xs font-semibold text-muted">
            {student.email}
          </span>
          <span className="block text-[10px] font-bold text-muted">
            {student.lastSeen ? c.lastSeen(whenLabel(student.lastSeen, lang)) : c.neverSeen}
          </span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <StudentDetail
          student={student}
          isMe={isMe}
          viewerIsOwner={viewerIsOwner}
          lang={lang}
          onChanged={onChanged}
          onDeleted={onDeleted}
        />
      )}
    </li>
  );
}

/** Mounted by AdminGate only once access is confirmed. */
export function StudentsView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const myId = useBrachNhaStore((s) => s.authUser?.id ?? null);
  // Shared with the menu (lib/admin-status.ts), so no second request.
  const { isOwner: viewerIsOwner } = useAdminStatus();
  const c = ADMIN_COPY[lang];

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Rows | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);

  // Debounced: typing a name sends one search, not one per letter. setState
  // only from the timer's async callback (react(set-state-in-effect)).
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(
      () => {
        void (async () => {
          const r = await listStudents(query);
          if (!alive) return;
          setResult(
            r.ok
              ? { query, state: "ready", rows: r.data }
              : { query, state: "failed" }
          );
        })();
      },
      // An empty box (the first load, or a cleared search) asks at once.
      query.trim() === "" ? 0 : SEARCH_DELAY_MS
    );
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  // The rows for an older query stay on screen, dimmed, until the new answer
  // arrives: replacing them with "Loading…" on every keystroke flickers.
  const stale = result !== null && result.query !== query;

  function update(next: AdminStudent) {
    setResult((prev) =>
      prev && prev.state === "ready"
        ? { ...prev, rows: prev.rows.map((s) => (s.id === next.id ? next : s)) }
        : prev
    );
  }

  function remove(id: string) {
    setResult((prev) =>
      prev && prev.state === "ready"
        ? { ...prev, rows: prev.rows.filter((s) => s.id !== id) }
        : prev
    );
    setOpenId(null);
    setNotice(true);
  }

  return (
    <>
      <p className="mb-4 text-xs font-semibold text-muted">{c.studentsBlurb}</p>

      <label className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-panel-sm focus-within:border-purple">
        <Search className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNotice(false);
          }}
          placeholder={c.search}
          aria-label={c.search}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted"
        />
      </label>

      {notice && (
        <p role="status" className="mb-3 rounded-xl border border-border bg-neo-mint px-3 py-2 text-xs font-extrabold text-ink">
          {c.deleted}
        </p>
      )}

      {result === null && <p className="text-sm font-bold text-muted">{c.loading}</p>}
      {result?.state === "failed" && !stale && (
        <p className="text-sm font-bold text-pink">{c.failed}</p>
      )}
      {result?.state === "ready" && (
        <div className={cn("transition-opacity", stale && "opacity-50")}>
          <p className="mb-2 text-[11px] font-bold text-muted">
            {result.rows.length === 0 ? c.noMatch : c.showing(result.rows.length)}
          </p>
          <ul className="flex flex-col gap-2.5">
            {result.rows.map((s) => (
              <StudentRow
                key={s.id}
                student={s}
                isMe={s.id === myId}
                viewerIsOwner={viewerIsOwner}
                open={openId === s.id}
                lang={lang}
                onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                onChanged={update}
                onDeleted={() => remove(s.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

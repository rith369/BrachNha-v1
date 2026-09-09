import { useState } from "react";
import { Cloud, Flame, Smartphone, Star } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { pullRemoteState } from "@/lib/supabase-sync";
import type { AccountSnapshot } from "@/types";
import { Wordmark } from "@/components/shell/wordmark";

/**
 * "Two sets of progress" — the screen that stops a sign-in destroying work.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * pushLocalState writes a FULL DESTRUCTIVE SNAPSHOT: it deletes server
 * conversations absent from the local list and overwrites xp/level/coins/
 * streak. While sign-in was anonymous, one device was one account and that
 * could never hurt anyone. Google changes it: a student who taps "Continue as
 * Guest" on a school computer, does a lesson, then signs in would have pushed
 * that near-empty state straight over the account on their phone — no warning,
 * no undo, and no updated_at comparison anywhere to catch it.
 *
 * There is no merge, and this is not one. Merging two divergent XP totals,
 * streaks and review schedules is a real design problem nobody has solved here
 * yet. Asking is what turns silent loss into a choice, and it is honest about
 * the cost — hence accountConflictWarning being on screen rather than implied.
 *
 * Rendered by AppShell's gate, ABOVE everything except the splash, because
 * until it is answered no push may run. The sync hook's flush() checks
 * `accountConflict` for exactly that reason.
 */

function Side({
  icon: Icon,
  label,
  snap,
  tone,
}: {
  icon: typeof Cloud;
  label: string;
  snap: AccountSnapshot;
  tone: "purple" | "blue";
}) {
  const ring = tone === "purple" ? "border-purple/25" : "border-blue/25";
  const text = tone === "purple" ? "text-purple" : "text-blue";

  return (
    <div className={`rounded-2xl border bg-surface p-4 ${ring}`}>
      <div
        className={`mb-2 flex items-center gap-1.5 text-xs font-extrabold ${text}`}
      >
        <Icon className="size-3.5" strokeWidth={2.5} />
        {label}
      </div>
      <div className="mb-1 truncate font-heading text-base font-extrabold text-text">
        {snap.name}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted">
        <span>Lv {snap.level}</span>
        <span className="flex items-center gap-1">
          <Star className="size-3 text-purple" strokeWidth={2.5} />
          {snap.xp} XP
        </span>
        <span className="flex items-center gap-1">
          <Flame className="size-3 text-yellow" strokeWidth={2.5} />
          {snap.streak}
        </span>
      </div>
    </div>
  );
}

export function AccountConflictView() {
  const { lang, conflict, setSyncedUserId, setAccountConflict } =
    useBrachNhaStore(
      useShallow((s) => ({
        lang: s.lang,
        conflict: s.accountConflict,
        setSyncedUserId: s.setSyncedUserId,
        setAccountConflict: s.setAccountConflict,
      }))
    );
  const t = useT(lang);
  const [busy, setBusy] = useState(false);

  // AppShell renders this only when a conflict exists, so this is a type
  // narrowing rather than a real branch — and it sits ABOVE the two handlers
  // below on purpose. A guard placed under a closure that reads into `conflict`
  // protects nothing: the React Compiler emits the dependency check where the
  // closure is built. See CLAUDE.md.
  if (!conflict) return null;

  const { userId, local, remote } = conflict;

  async function keepAccount() {
    setBusy(true);
    // Replaces local state wholesale from the server. Marking the device as
    // synced first would let the ongoing-backup effect fire a push against the
    // not-yet-replaced local state and undo the very thing being restored.
    await pullRemoteState(userId);
    setSyncedUserId(userId);
    setAccountConflict(null);
  }

  function keepDevice() {
    setBusy(true);
    // No push here: clearing the conflict and claiming the account is enough,
    // and the sync hook's own effect takes it from there with fresher state
    // than this component could hand it.
    setSyncedUserId(userId);
    setAccountConflict(null);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-4 pt-8 pb-6">
      <div className="mb-8">
        <Wordmark />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-5 text-center">
          <div className="mb-2 font-heading text-xl font-extrabold">
            {t.accountConflictTitle}
          </div>
          <p className="mx-auto max-w-sm text-sm font-bold text-muted">
            {t.accountConflictBody}
          </p>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <Side
            icon={Cloud}
            label={t.savedToAccount}
            snap={remote}
            tone="purple"
          />
          <Side
            icon={Smartphone}
            label={t.onThisDevice}
            snap={local}
            tone="blue"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => void keepAccount()}
            disabled={busy}
            className="w-full rounded-2xl bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta transition active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? t.restoringAccount : t.useMyAccount}
          </button>
          <button
            onClick={keepDevice}
            disabled={busy}
            className="w-full rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3.5 text-sm font-extrabold text-purple transition active:scale-[0.98] disabled:opacity-50"
          >
            {t.useThisDevice}
          </button>
        </div>

        <p className="mt-3 text-center text-xs font-bold text-muted">
          {t.accountConflictWarning}
        </p>
      </div>
    </div>
  );
}

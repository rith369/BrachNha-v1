import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Lang } from "@/types";
import { deleteMyAccount } from "@/lib/account-deletion";

const COPY = {
  en: {
    open: "Delete my account",
    title: "Delete your account?",
    body: "This permanently removes your account and everything saved with it: your profile, progress, streak, exam results, KruAI conversations and the photos you shared in battles. It cannot be undone.",
    understand: "I understand this cannot be undone",
    cancel: "Cancel",
    confirm: "Delete for good",
    working: "Deleting…",
    failed: "Could not delete your account. Check your connection and try again.",
  },
  km: {
    open: "លុបគណនីរបស់ខ្ញុំ",
    title: "លុបគណនីរបស់អ្នក?",
    body: "វានឹងលុបគណនីរបស់អ្នក និងអ្វីៗទាំងអស់ដែលបានរក្សាទុកជាមួយវាជាអចិន្ត្រៃយ៍៖ ប្រវត្តិរូប វឌ្ឍនភាព Streak លទ្ធផលប្រឡង ការសន្ទនាជាមួយ KruAI និងរូបថតដែលអ្នកបានចែករំលែកក្នុងការប្រកួត។ មិនអាចត្រឡប់វិញបានទេ។",
    understand: "ខ្ញុំយល់ថាវាមិនអាចត្រឡប់វិញបានទេ",
    cancel: "បោះបង់",
    confirm: "លុបជាអចិន្ត្រៃយ៍",
    working: "កំពុងលុប…",
    failed: "មិនអាចលុបគណនីបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
  },
} as const;

/**
 * "Delete my account", for a signed-in student only.
 *
 * Deliberately QUIETER than Logout (a small text button under it) and harder to
 * reach: it opens a box that says what is removed, and the confirm button stays
 * disabled until a native checkbox is ticked — the paper-exam tickbox pattern,
 * keyboard-reachable and announcing its own state. The work itself is
 * lib/account-deletion.ts; on success the store resets and the app returns to
 * the entry screen on its own, so this component has nothing to do after.
 */
export function DeleteAccount({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function confirm() {
    setBusy(true);
    setError(false);
    const result = await deleteMyAccount();
    // On success the store reset unmounts this screen; only failure lands here.
    if (!result.ok) {
      setBusy(false);
      setError(true);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-bold text-muted underline-offset-2 hover:underline"
      >
        <Trash2 className="size-3.5" strokeWidth={2.5} />
        {c.open}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-pink/30 p-4">
      <div className="mb-1.5 text-sm font-extrabold text-pink">{c.title}</div>
      <p className="mb-3 text-xs leading-relaxed font-semibold text-text">{c.body}</p>
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
      {error && (
        <div role="alert" className="mb-3 text-xs font-bold text-pink">
          {c.failed}
        </div>
      )}
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setAgreed(false);
            setError(false);
          }}
          className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-extrabold text-purple disabled:opacity-50"
        >
          {c.cancel}
        </button>
        <button
          type="button"
          disabled={!agreed || busy}
          onClick={() => void confirm()}
          className="flex-1 rounded-2xl bg-pink px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40"
        >
          {busy ? c.working : c.confirm}
        </button>
      </div>
    </div>
  );
}

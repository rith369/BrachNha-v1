import { useState } from "react";
import { Check, Pencil, User, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useAuth, useDisplayName } from "@/hooks/use-auth";
import { useT } from "@/data/translations";

/**
 * Who this is: photo, name, email — and the one place the name can be changed
 * after signup.
 *
 * ── The photo ─────────────────────────────────────────────────────────────
 *
 * `authUser.avatarUrl` arrives with every Google session and was used nowhere.
 * `referrerPolicy="no-referrer"` because Google's avatar host turns down some
 * hotlinked requests that carry a Referer. And the image can fail anyway —
 * offline, blocked, expired — so `onError` swaps in the first letter rather
 * than leaving the browser's broken-image glyph, same reason SubjectArt hides
 * its own <img> on error.
 *
 * ── Who can edit the name ─────────────────────────────────────────────────
 *
 * Anyone with a real `userName` — NOT a guest. A guest's "Guest" is a render-
 * time fallback (useDisplayName), and giving them a stored name would skip
 * LoginView when they later sign in, which is where the Google name gets
 * prefilled. The store also refuses a blank name, because an empty userName is
 * what the gate reads as "signed in, no profile yet".
 */
export function ProfileIdentity() {
  const { lang, userName, setUserName } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userName: s.userName,
      setUserName: s.setUserName,
    }))
  );
  const t = useT(lang);
  const { user, isGuest } = useAuth();
  const displayName = useDisplayName();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  const canEdit = !isGuest && userName !== "";
  // Array.from, not [0]: one code point rather than half of a surrogate pair.
  const initial = (Array.from(displayName.trim())[0] ?? "?").toUpperCase();

  function save() {
    setUserName(draft);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3">
      {user?.avatarUrl && !photoFailed ? (
        <img
          src={user.avatarUrl}
          alt=""
          width={48}
          height={48}
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
          className="size-12 shrink-0 rounded-full object-cover shadow-panel-sm"
        />
      ) : isGuest ? (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple">
          <User className="size-6" strokeWidth={2.25} />
        </div>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-lg font-extrabold text-white">
          {initial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={t.editName}
              className="min-w-0 flex-1 rounded-xl border border-purple/20 bg-surface px-3 py-1.5 text-sm font-bold text-text outline-none focus:border-purple/50"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label={t.saveName}
              className="rounded-lg bg-brand p-1.5 text-white transition active:scale-95 disabled:opacity-40"
            >
              <Check className="size-4" strokeWidth={2.75} />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label={t.cancelEdit}
              className="rounded-lg p-1.5 text-muted transition hover:bg-purple/8"
            >
              <X className="size-4" strokeWidth={2.75} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-extrabold text-text">
              {displayName}
            </span>
            {canEdit && (
              <button
                onClick={() => {
                  setDraft(userName);
                  setEditing(true);
                }}
                aria-label={t.editName}
                className="shrink-0 rounded-md p-1 text-muted transition hover:bg-purple/8 hover:text-purple"
              >
                <Pencil className="size-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
        {user?.email && (
          <div className="truncate text-xs font-bold text-muted">
            {user.email}
          </div>
        )}
      </div>
    </div>
  );
}

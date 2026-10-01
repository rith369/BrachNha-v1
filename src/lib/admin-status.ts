import { useEffect, useSyncExternalStore } from "react";
import { useBrachNhaStore } from "./store";
import { countOpenReports, isAdmin } from "./admin-reports";

/**
 * Whether the signed-in account is on the team's admin list, and how many photo
 * reports are waiting — for the Admin row in the menu (sidebar-nav.tsx).
 *
 * THE DATABASE DECIDES. The app never compares an email: it asks
 * is_app_admin() (20261001000003), which reads app_admins for the caller only.
 * A student who edits their copy of the app to show the row still gets nothing
 * from the page behind it.
 *
 * A MODULE, NOT A STORE FIELD, for the same reason install-prompt.ts is one:
 * it is re-asked on every load rather than persisted (a stored `true` would
 * outlive being removed from the list), and both menus (the drawer and the
 * desktop sidebar) mount at once, so one shared answer means one request
 * rather than two. Keyed by user id, so switching accounts asks again.
 */

interface AdminStatus {
  isAdmin: boolean;
  /** Open reports, or null before the count has arrived. */
  openReports: number | null;
}

const NOT_ADMIN: AdminStatus = { isAdmin: false, openReports: null };

let status: AdminStatus = NOT_ADMIN;
let askedFor: string | null = null;
const listeners = new Set<() => void>();

function emit(next: AdminStatus) {
  // A new object only when something changed: useSyncExternalStore loops
  // forever on a snapshot that is a fresh object every read.
  status = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(userId: string | null) {
  if (userId === askedFor) return;
  askedFor = userId;
  if (status !== NOT_ADMIN) emit(NOT_ADMIN);
  if (!userId) return;

  void (async () => {
    const admin = await isAdmin();
    if (askedFor !== userId || !admin) return;
    emit({ isAdmin: true, openReports: null });
    const count = await countOpenReports();
    if (askedFor !== userId) return;
    emit({ isAdmin: true, openReports: count });
  })();
}

/** The review page reports the count it actually loaded, and every Keep or
 *  Delete after that, so the badge follows without asking the server again. */
export function setOpenReports(count: number) {
  if (status.isAdmin && status.openReports !== count) {
    emit({ isAdmin: true, openReports: count });
  }
}

export function useAdminStatus(): AdminStatus {
  const userId = useBrachNhaStore((s) => s.authUser?.id ?? null);
  useEffect(() => {
    load(userId);
  }, [userId]);
  return useSyncExternalStore(subscribe, () => status);
}

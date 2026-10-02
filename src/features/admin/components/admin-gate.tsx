import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/admin-reports";
import { cn } from "@/utils/cn";
import { ADMIN_COPY } from "../copy";

type Access = "checking" | "denied" | "admin";

/**
 * The frame every admin page shares: the scroller, the title row, and the
 * access check, which decides between "checking", "not for you" and the page.
 *
 * THE DATABASE DECIDES, not this component. It asks is_app_admin() once on
 * arrival so a student sees a plain "this page is for the team" rather than a
 * page of failed loads, but every call the page makes is refused for a
 * non-admin anyway. A guest (or an unconfigured project) is denied without
 * asking anything.
 *
 * `children` MOUNTS ONLY ONCE ACCESS IS CONFIRMED, so a page's own data loading
 * lives in its body component and never runs for a student.
 *
 * `wide` is for the dashboard, which widens into two columns like Progress;
 * the other admin pages are lists and stay at the reading width (max-w-2xl).
 */
export function AdminGate({
  title,
  icon: Icon,
  back = false,
  wide = false,
  children,
}: {
  title: string;
  icon: LucideIcon;
  /** Show a link back to /admin above the title (every page but the hub). */
  back?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const { isAuthenticated } = useAuth();
  const c = ADMIN_COPY[lang];
  const [checked, setChecked] = useState<Access>("checking");

  // setState only from the async callback, never synchronously in the effect
  // body (oxlint's react(set-state-in-effect)).
  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    void (async () => {
      const ok = await isAdmin();
      if (alive) setChecked(ok ? "admin" : "denied");
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const access: Access = isAuthenticated ? checked : "denied";

  return (
    <div className="h-full overflow-y-auto">
      <div
        className={cn(
          "mx-auto w-full px-4 pt-4 pb-36 lg:pb-10",
          wide ? "max-w-2xl md:max-w-5xl" : "max-w-2xl"
        )}
      >
        {back && access === "admin" && (
          <Link
            to="/admin"
            className="mb-2 inline-flex items-center gap-1 text-xs font-extrabold text-muted hover:text-text"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.5} />
            {c.backToAdmin}
          </Link>
        )}
        <div className="mb-1 flex items-center gap-2 pr-14">
          <Icon className="size-5 text-purple" strokeWidth={2.5} />
          <h1 className="font-heading text-xl font-extrabold">{title}</h1>
        </div>

        {access === "checking" && (
          <p className="mt-4 text-sm font-bold text-muted">{c.checking}</p>
        )}

        {access === "denied" && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-center shadow-panel">
            <p className="text-sm font-bold">{c.denied}</p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-full border border-border bg-brand px-5 py-2 text-sm font-bold text-on-brand shadow-panel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {c.home}
            </Link>
          </div>
        )}

        {access === "admin" && children}
      </div>
    </div>
  );
}

import { LayoutDashboard } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { DashboardView } from "@/features/admin/components/dashboard-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin, the team's hub: the dashboard and links to every admin tool.
 *
 * Lazy and NOT in app.tsx's routeModules (which is also the idle prefetch
 * list), so a student never downloads it. Being an admin is decided by the
 * database (20261002000001); AdminGate only shows "not for you" early.
 */
export default function AdminPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].hubTitle} icon={LayoutDashboard} wide>
      <DashboardView />
    </AdminGate>
  );
}

import { History } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { AuditView } from "@/features/admin/components/audit-view";
import { AUDIT_COPY } from "@/features/admin/audit-copy";

/**
 * /admin/audit: who changed what, and when. Lazy and kept out of
 * routeModules, like every admin page.
 */
export default function AdminAuditPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = AUDIT_COPY[lang];
  return (
    <AdminGate title={c.title} kicker={c.kicker} icon={History} back>
      <AuditView />
    </AdminGate>
  );
}

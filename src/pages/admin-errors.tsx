import { Bug } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { ErrorsView } from "@/features/admin/components/errors-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin/errors: errors students' phones reported, grouped by message, to mark
 * fixed. Lazy and kept out of routeModules, like every admin page.
 */
export default function AdminErrorsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].errorsTitle} icon={Bug} back>
      <ErrorsView />
    </AdminGate>
  );
}

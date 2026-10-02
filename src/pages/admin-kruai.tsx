import { Bot } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { KruaiView } from "@/features/admin/components/kruai-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin/kruai: KruAI usage, the daily limits and paused students.
 * Lazy and kept out of routeModules, like every admin page.
 */
export default function AdminKruaiPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].kruaiTitle} icon={Bot} back wide>
      <KruaiView />
    </AdminGate>
  );
}

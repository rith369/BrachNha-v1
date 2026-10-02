import { Megaphone } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { AnnouncementsView } from "@/features/admin/components/announcements-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin/announcements: write, preview, publish and end the banner every
 * student sees. Lazy and kept out of routeModules, like every admin page.
 */
export default function AdminAnnouncementsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].annTitle} icon={Megaphone} back>
      <AnnouncementsView />
    </AdminGate>
  );
}

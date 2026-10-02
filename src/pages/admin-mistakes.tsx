import { Flag } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { MistakesView } from "@/features/admin/components/mistakes-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin/mistakes: questions students reported as wrong or unclear. Lazy and
 * kept out of routeModules: it carries the whole question corpus (to show each
 * question) and KaTeX, neither of which a student should download for it.
 */
export default function AdminMistakesPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].mistakesTitle} icon={Flag} back>
      <MistakesView />
    </AdminGate>
  );
}

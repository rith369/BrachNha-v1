import { Users } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { StudentsView } from "@/features/admin/components/students-view";
import { ADMIN_COPY } from "@/features/admin/copy";

/**
 * /admin/students: look a student up, manage admins, delete an account.
 * Lazy and kept out of routeModules, like every admin page.
 */
export default function AdminStudentsPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={ADMIN_COPY[lang].studentsTitle} icon={Users} back>
      <StudentsView />
    </AdminGate>
  );
}

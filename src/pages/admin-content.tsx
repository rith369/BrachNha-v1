import { BookOpen } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { ContentListView } from "@/features/admin/components/content-list-view";
import { CONTENT_COPY } from "@/features/admin/content-copy";

/**
 * /admin/content: every flashcard deck and practice quiz stored in the
 * database (docs/plans/content-in-database.md). Lazy and kept out of
 * routeModules, like every admin page: a student never downloads it.
 */
export default function AdminContentPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <AdminGate title={CONTENT_COPY[lang].title} icon={BookOpen} back>
      <ContentListView />
    </AdminGate>
  );
}

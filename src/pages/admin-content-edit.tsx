import { Navigate, useParams, useSearchParams } from "react-router";
import { BookOpen } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { ContentEditorView } from "@/features/admin/components/content-editor-view";
import { CONTENT_COPY } from "@/features/admin/content-copy";
import type { ContentKind } from "@/types";

/** The same shape the database's content_key_ok() accepts; anything else
 *  goes back to the list rather than asking the database about it. */
const KEY = /^[a-z]+-[1-9][0-9]?-[1-9][0-9]?(-[1-9][0-9]?)?$/;

/**
 * /admin/content/:kind/:key: edit one deck or quiz. `?q=q3` opens that
 * question on arrival. Lazy and kept out of routeModules.
 *
 * Keyed on kind and key, so moving from one item to another starts a fresh
 * editor rather than carrying one item's working copy into the next.
 */
export default function AdminContentEditPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const { kind, key } = useParams();
  const [params] = useSearchParams();
  if ((kind !== "deck" && kind !== "quiz") || !key || !KEY.test(key)) {
    return <Navigate to="/admin/content" replace />;
  }
  const q = params.get("q");
  return (
    <AdminGate title={CONTENT_COPY[lang].title} icon={BookOpen}>
      <ContentEditorView
        key={`${kind}:${key}`}
        kind={kind as ContentKind}
        contentKey={key}
        initialOpen={q && /^q[0-9]{1,4}$/.test(q) ? q : null}
      />
    </AdminGate>
  );
}

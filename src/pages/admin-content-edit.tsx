import { Navigate, useParams, useSearchParams } from "react-router";
import { BookOpen } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { ContentEditorView } from "@/features/admin/components/content-editor-view";
import { CONTENT_COPY } from "@/features/admin/content-copy";
import type { ContentKind } from "@/types";

/** The same shapes the database's content_key_ok() accepts, per kind;
 *  anything else goes back to the list rather than asking the database. */
const KEY: Record<ContentKind, RegExp> = {
  deck: /^[a-z]+-[1-9][0-9]?-[1-9][0-9]?(-[1-9][0-9]?)?$/,
  quiz: /^[a-z]+-[1-9][0-9]?-[1-9][0-9]?(-[1-9][0-9]?)?$/,
  section: /^[a-z]+-[1-9][0-9]?-[1-9][0-9]?-[1-9][0-9]?$/,
  paper: /^20[0-9]{2}-[a-z]+$/,
};

/** A question id: q3 in a quiz or a section, l1 or g4 in a paper. */
const ITEM_ID = /^[a-z][a-z0-9-]{0,19}$/;

function isKind(value: string | undefined): value is ContentKind {
  return value === "deck" || value === "quiz" || value === "section" || value === "paper";
}

/**
 * /admin/content/:kind/:key: edit one deck, quiz, lesson section or past
 * paper. `?q=q3` opens that question on arrival. Lazy and kept out of
 * routeModules.
 *
 * Keyed on kind and key, so moving from one item to another starts a fresh
 * editor rather than carrying one item's working copy into the next.
 */
export default function AdminContentEditPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const { kind, key } = useParams();
  const [params] = useSearchParams();
  if (!isKind(kind) || !key || !KEY[kind].test(key)) {
    return <Navigate to="/admin/content" replace />;
  }
  const q = params.get("q");
  return (
    <AdminGate title={CONTENT_COPY[lang].title} icon={BookOpen}>
      <ContentEditorView
        key={`${kind}:${key}`}
        kind={kind}
        contentKey={key}
        initialOpen={q && ITEM_ID.test(q) ? q : null}
      />
    </AdminGate>
  );
}

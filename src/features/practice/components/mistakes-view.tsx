import { Link, useSearchParams } from "react-router";
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { retryContent, useContentManifest } from "@/lib/content";
import { useBrachNhaStore } from "@/lib/store";
import { filterMistakes, liveMistakes, mistakesBySubject, MISTAKES_PER_SESSION } from "../mistakes";
import { ContentNotice } from "./content-waiting";

const PRESS =
  "transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

/**
 * `/practice/mistakes`: the questions a student got wrong and has not fixed yet.
 *
 * With `?lesson=` it is one lesson's, reached from the "កំហុស" node on its Study path.
 *
 * Downloads no questions: the list comes from the store and the manifest, and each
 * question is fetched only when it is on screen. Khmer only, like the rest of practice.
 */
export function MistakesView() {
  const [params] = useSearchParams();
  const lesson = params.get("lesson") ?? undefined;
  const mistakes = useBrachNhaStore((s) => s.mistakes);
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const manifest = useContentManifest();

  const live = liveMistakes(mistakes, manifest);
  const shown = filterMistakes(live, { lesson });
  const subjects = mistakesBySubject(shown, userLanguage);
  const round = Math.min(shown.length, MISTAKES_PER_SESSION);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        to="/practice"
        className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text sm:text-sm"
      >
        <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
        ការអនុវត្ត
      </Link>

      <PageTitle
        icon={RotateCcw}
        fill="pink"
        title="កំហុសរបស់ខ្ញុំ"
        subtitle="សំណួរដែលអ្នកឆ្លើយខុស។ ឆ្លើយត្រូវម្តង វានឹងបាត់ពីបញ្ជីនេះ។"
      />

      {manifest.status !== "ready" ? (
        <ContentNotice
          state={manifest.status === "failed" ? "offline" : "loading"}
          onRetry={retryContent}
        />
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-panel">
          <CheckCircle2 className="mx-auto size-10 text-mint" strokeWidth={2} />
          <div className="font-heading mt-2 text-lg font-extrabold text-text">
            {lesson ? "មេរៀននេះមិនមានកំហុសទេ" : "មិនមានកំហុសទេ"}
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            នៅពេលអ្នកឆ្លើយខុសក្នុង Quiz មេរៀន ឬវិញ្ញាសា សំណួរនោះនឹងមកនៅទីនេះ។
          </p>
        </div>
      ) : (
        <>
          <Link
            to={lesson ? `/practice/mistakes/run?lesson=${lesson}` : "/practice/mistakes/run"}
            className={`flex items-center justify-center gap-2 rounded-2xl border border-border bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta ${PRESS}`}
          >
            <RotateCcw className="size-4" strokeWidth={2.5} />
            ធ្វើម្តងទៀត ({round} សំណួរ)
          </Link>
          {shown.length > round && (
            <p className="mt-2 text-center text-xs font-bold text-muted">
              មានកំហុសសរុប {shown.length}។ ម្តងធ្វើ {round} សំណួរ ដែលខុសញឹកញាប់ជាងគេមុន។
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {subjects.map(({ subject, count }) => (
              <Link
                key={subject.id}
                to={`/practice/mistakes/run?subject=${subject.id}`}
                className={`flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-panel-sm ${PRESS}`}
              >
                <div className="min-w-0 flex-1 truncate text-sm font-extrabold text-text">
                  {subject.name}
                </div>
                <span className="shrink-0 text-xs font-bold text-muted">{count} សំណួរ</span>
                <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
              </Link>
            ))}
          </div>

          {lesson && live.length > shown.length && (
            <Link
              to="/practice/mistakes"
              className="mt-4 block text-center text-xs font-bold text-muted underline"
            >
              មើលកំហុសទាំងអស់ ({live.length})
            </Link>
          )}
        </>
      )}
    </div>
  );
}

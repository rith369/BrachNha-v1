import { useT } from "@/data/translations";
import type { Lang } from "@/types";

/**
 * Survey step 1 — the fork between a student starting from zero and one who has
 * already covered some of the syllabus.
 *
 * Only the "not yet" branch is live. Answering "I've studied some" is meant to
 * open a per-subject, per-lesson pass ("did you study this one?") ending in a
 * test on what they claim to know, and none of that content exists yet — so the
 * second option is a labelled stub. It still reports its answer through
 * `onAnswer` so the wiring is real; today only `false` ever reaches the store.
 */
export function StudiedStep({
  lang,
  onAnswer,
}: {
  lang: Lang;
  onAnswer: (studied: boolean) => void;
}) {
  const t = useT(lang);

  return (
    <>
      <div className="mb-3 text-sm font-extrabold">📖 {t.studiedQuestion}</div>

      <div className="mb-4 flex flex-col gap-2">
        <button
          onClick={() => onAnswer(false)}
          className="w-full rounded-xl border border-mint/40 bg-mint/10 px-3 py-3 text-sm font-bold text-mint transition hover:bg-mint/15"
        >
          {t.notStudiedYet}
        </button>

        {/* A div, not a button — it does nothing, and the sidebar renders its
            unbuilt routes the same way (nav-items with href: null). A <button>
            here would invite a tap and answer it with silence. */}
        <div className="flex w-full cursor-default items-center justify-center gap-2 rounded-xl border border-purple/10 bg-surface px-3 py-3 text-sm font-bold text-text opacity-45">
          {t.alreadyStudied}
          <span className="rounded-full bg-purple/8 px-2 py-0.5 text-[9px] font-extrabold text-muted">
            {lang === "en" ? "Soon" : "ឆាប់ៗ"}
          </span>
        </div>

        {/* Always visible rather than revealed on tap: the point is that someone
            reading the screen — a student wondering what they'd be signing up
            for, or anyone evaluating the app — learns what this option does
            without having to press a greyed-out control to find out. */}
        <div className="rounded-xl bg-purple/5 px-3 py-2.5 text-[11px] font-bold text-muted">
          📝 {t.studiedNote}
        </div>
      </div>
    </>
  );
}

import { TriangleAlert } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { gameCopy } from "../copy";
import { AddPhotosButton, PhotoStrip } from "./photo-strip";
import type { MyWorkPhotos, PhotoList } from "../use-work-photos";

/**
 * The working attached to ONE question: yours, and — on the review — theirs.
 *
 * ONE COMPONENT FOR BOTH SCREENS. The photo step before the answers renders it
 * with no opponent; each answer card on the review renders it with one. Two
 * hand-written versions are how "add photo" ends up looking different before and
 * after the answers appear.
 */
export function QuestionPhotos({
  question,
  mine,
  opponent,
}: {
  question: number;
  mine: MyWorkPhotos;
  /** Absent on the photo step, and for a creator who has not picked a joiner. */
  opponent?: {
    name: string;
    list: PhotoList;
    /** The reciprocity gate. When shut, the page says so ONCE, above the
     *  answers, rather than under every question — see game-review.tsx. */
    locked: boolean;
  };
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  const myPhotos = mine.forQuestion(question);
  const activity = mine.activity(question);
  const theirs = opponent?.list.photos.filter((p) => p.question === question) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1.5 text-[10px] font-extrabold text-muted">
          {t.yourWorking}
        </div>
        <div className="flex flex-col gap-2">
          <PhotoStrip
            photos={myPhotos}
            onDelete={(p) => void mine.remove(p)}
            lastPhotoOverall={mine.photos.length === 1}
          />
          <div>
            <AddPhotosButton
              count={myPhotos.length}
              uploading={activity.uploading}
              onPick={(files) => void mine.add(question, files)}
            />
          </div>
          {activity.failed && (
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-pink">
              <TriangleAlert className="size-3.5 shrink-0" strokeWidth={2.5} />
              {activity.failed === "upload" ? t.photoFailed : t.deleteFailed}
            </p>
          )}
        </div>
      </div>

      {opponent && !opponent.locked && (
        <div>
          <div className="mb-1.5 truncate text-[10px] font-extrabold text-muted">
            {opponent.name} ✍️
          </div>
          {opponent.list.load === "loading" ? (
            <p className="text-[10px] font-bold text-muted">{t.loadingPhoto}</p>
          ) : opponent.list.load === "failed" ? (
            <p className="text-[10px] font-bold text-muted">{t.photosFailed}</p>
          ) : theirs.length > 0 ? (
            <PhotoStrip photos={theirs} />
          ) : (
            // Said per question, not hidden: "they skipped this one" is itself
            // useful to a student comparing, and an absent row would read as the
            // app having forgotten to load it.
            <p className="text-[10px] font-bold text-muted">{t.noPhotoForQuestion}</p>
          )}
        </div>
      )}
    </div>
  );
}

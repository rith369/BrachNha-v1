import { Maximize2, Play } from "lucide-react";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { SectionVideo } from "@/types";

/**
 * The video block at the top of a section.
 *
 * There is no video file. This is the poster frame plus the player chrome drawn
 * around it, so the section looks like the finished design while the real
 * recordings are made — same idea as the mascot slot on the subject path and the
 * empty past papers on the exam page.
 *
 * NOTHING HERE IS INTERACTIVE, and that is the whole reason it is safe. An
 * earlier version had a real <button> under the play glyph plus a ឆាប់ៗនេះ chip
 * and a "video is being prepared" notice; both were removed at the user's
 * request. Rather than leave a <button> that answers a tap with silence — the
 * broken-app pattern sidebar-nav.tsx and the survey's StudiedStep both avoid —
 * the controls are plain spans. Identical on screen, no pointer cursor, no focus
 * ring, and nothing announced to a screen reader as pressable.
 *
 * When a real video arrives this becomes the player's poster state and the
 * elements below become its actual controls.
 *
 * The elapsed time reads ០:០០ and the scrub bar sits at zero: nothing has been
 * watched, and a part-filled bar would show progress the app cannot know.
 */
function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${toKhmerDigits(m)}:${toKhmerDigits(String(s).padStart(2, "0"))}`;
}

export function SectionVideoPlayer({ video }: { video: SectionVideo }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-purple/15 bg-control">
      {/* onError hides the poster rather than letting the browser paint its
          broken-image glyph over the chrome — same guard as SubjectArt. */}
      <img
        src={video.poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={(e) => (e.currentTarget.style.display = "none")}
        className="absolute inset-0 size-full object-cover"
      />

      {/* Scrim only behind the bottom bar, so the controls stay readable over a
          light illustration without dimming the artwork itself. */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/55 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-purple shadow-panel md:size-16">
          <Play
            className="ml-0.5 size-6 fill-current md:size-7"
            strokeWidth={0}
          />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-white">
            ០:០០ / {clock(video.durationSec)}
          </span>
          <Maximize2 className="size-4 text-white/85" strokeWidth={2.5} />
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/35">
          <div className="h-full w-0 rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

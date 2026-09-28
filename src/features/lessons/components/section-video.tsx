import { useState } from "react";
import { Maximize2, Play } from "lucide-react";
import type { SectionVideo } from "@/types";

/**
 * The video block at the top of a section — a CLICK-TO-LOAD FACADE.
 *
 * ── The two states, and the first one is still the important one ──────────
 *
 * WITHOUT `video.youtubeId` this is exactly what it has always been: a poster
 * frame with player chrome drawn around it, and NOTHING IN IT IS INTERACTIVE.
 * That is not legacy — it is the normal state, because a section exists on the
 * path long before anyone records it, the same way the mascot slot and the empty
 * past papers do. An earlier version had a real <button> under the play glyph
 * plus a ឆាប់ៗនេះ chip and a "video is being prepared" notice; the chip and the
 * notice were removed at the user's request, so the button went with them. A
 * <button> that answers a tap with silence is the broken-app pattern
 * sidebar-nav.tsx and the survey's StudiedStep both exist to avoid, so plain
 * spans are the only honest form: identical on screen, no pointer cursor, no
 * focus ring, nothing announced to a screen reader as pressable.
 *
 * DON'T REINSTATE THE <button> WITHOUT REINSTATING SOMETHING FOR IT TO SAY —
 * and `youtubeId` is precisely that something. It is the only condition under
 * which the button appears. The rule is satisfied here, not repealed.
 *
 * WITH a valid `youtubeId` the same glyph becomes a real <button> spanning the
 * whole frame, and tapping it swaps the poster for a YouTube <iframe>.
 *
 * ── Why a facade, which is the whole performance story ────────────────────
 *
 * Until that tap, NOT ONE BYTE LEAVES THIS ORIGIN. The poster is our own
 * /sections/{id}.webp; no thumbnail, no script and no cookie is fetched from
 * Google. An eagerly-mounted embed would cost several round trips and hundreds
 * of kilobytes of third-party JavaScript on every section view, on a connection
 * this app is explicitly built for (Cambodian mobile data), for a video most
 * students on most sections will not play.
 *
 * Hosting is an UNLISTED YouTube video: $0, and — the part that actually
 * matters here — automatic adaptive bitrate. A self-hosted mp4 in public/ is one
 * fixed bitrate served to everyone: it either buffers on 3G or looks soft on
 * wifi, and it bills egress per view. The cost is a third-party frame, and the
 * facade is what makes that cost conditional on the student asking for it.
 *
 * ── NO React.lazy HERE, AND NONE IS NEEDED ────────────────────────────────
 *
 * Do not "match brain-model-viewer.tsx" and put this behind a lazy boundary.
 * That boundary exists because three.js + fiber + drei is a large MODULE in this
 * app's dependency graph, which the bundler can see and would otherwise inline.
 * An <iframe> is MARKUP. It contributes zero bytes to any chunk, imports
 * nothing, and the player's own JavaScript is fetched by the iframe's browsing
 * context — a separate document with a separate module graph that no bundler
 * could reach even in principle. A React.lazy here would buy a Suspense
 * boundary, a chunk round trip and a fallback frame that risks the layout shift
 * this component is built to avoid, in exchange for nothing at all. The useState
 * below is the entire mechanism; there is nothing to defer but markup, and the
 * markup is already deferred by not rendering it.
 *
 * This is also why app.tsx's `routeModules` needs no entry: the feature is
 * invisible to the code-splitting story.
 *
 * ── ONE return, no early return, and that is deliberate ───────────────────
 *
 * The hook sits at the top and there is a SINGLE return with a ternary inside
 * it, rather than `if (playing) return <iframe/>`. Two reasons, both recorded
 * elsewhere in this repo. (1) Rules of hooks: an early return above useState is
 * a crash, and a future edit adding a second piece of state is likelier to get
 * that wrong than to get a ternary wrong. (2) The React Compiler crash
 * review-session.tsx documents — a guard that protects a possibly-undefined
 * value must sit ABOVE every closure that reads INTO that value, because the
 * compiler narrows the closure's memo dependency to the property path and emits
 * the check where the closure is BUILT, not where the guard is written. With no
 * early return there is no ordering to get wrong.
 *
 * Keep it that way. `youtubeId` is the possibly-undefined value; the dangerous
 * shape would be a property path (`youtubeId.length`) read inside a closure with
 * a guard beneath it. Today every closure here reads either a setter or the
 * event, which is why the component is safe by structure rather than by luck.
 *
 * ── Zero layout shift, by construction ────────────────────────────────────
 *
 * The outer frame is rendered by BOTH branches and never unmounts, `aspect-video
 * w-full` derives its height from the column width alone, and every child is
 * absolutely positioned, i.e. out of flow. Swapping one out-of-flow subtree for
 * another cannot move a pixel. Don't take `aspect-video` off and don't render
 * the iframe in flow: an iframe's intrinsic size is 300x150, so a flowed one
 * collapses the frame to 150px and then jumps when the player sizes itself —
 * a textbook large shift on what is the screen's LCP element.
 *
 * ── The chrome is still decoration, and stays that way ────────────────────
 *
 * The scrub bar, the 0:00 and the fullscreen glyph are painted, not wired. With
 * a video present the whole frame is one button, so a tap anywhere means "play"
 * rather than "seek" — which is what every facade does and is honest here,
 * because the moment playback starts YouTube's own real controls replace all of
 * it. Elapsed reads 0:00 and the scrub sits at zero because both are true. The
 * scrim and the chrome row are pointer-events-none so they cannot eat a tap
 * meant for the button underneath; without that the bottom ~64px would be dead.
 *
 * ── Traps ─────────────────────────────────────────────────────────────────
 *
 *  - NOTHING HERE ASSUMES PLAYBACK STARTED. No timer, no progress, no
 *    auto-advance to the next step. That is what keeps a refused autoplay — see
 *    the in-app browser note below — a legible second tap rather than a stuck
 *    screen. Adding any of those turns a host app's media policy into a dead
 *    end, so if watch-progress is ever wanted it needs `enablejsapi=1`, the
 *    IFrame Player API and a privacy answer of its own.
 *  - Inside Telegram's and Messenger's webviews `autoplay=1` may be refused by
 *    the host app whatever the gesture, and fullscreen may not be implemented at
 *    all. `playsinline=1` is what makes the inline experience good enough that
 *    neither matters. Do NOT add `mute=1` to force autoplay through: a lesson
 *    that starts silently is worse than one more tap.
 *  - Do NOT wire this to openInExternalBrowser() when a webview misbehaves.
 *    That mechanism fails silently with no event either way (see
 *    utils/in-app-browser.ts), so a nudge here would be a second dead-end
 *    control — the exact thing this file's header exists to forbid.
 *  - There is no Content-Security-Policy in vercel.json today. If one is ever
 *    added it needs `frame-src https://www.youtube-nocookie.com`, or this frame
 *    goes blank with only a console message to say why.
 */

/**
 * A YouTube id is 11 characters of the URL-safe base64 alphabet, and nothing
 * else.
 *
 * Any string typechecks, and a typo would render a YouTube error page inside the
 * frame — a control that answers a tap with a failure, which is the one thing
 * this component's design is against. So a malformed id reads as NO id and the
 * player falls back to the non-interactive poster it has always drawn. Failing
 * quiet rather than loud is right here only because opening the section is part
 * of authoring one; see the verification standard in AGENTS.md.
 */
const YOUTUBE_ID = /^[\w-]{11}$/;

/**
 * Spelled out once because both branches draw the same disc, and Tailwind reads
 * source TEXT — a module-level literal is visible to it, a runtime-assembled
 * class is not. Same reason callout.tsx's TONE spells all five variants out.
 */
const PLAY_DISC =
  "flex size-14 items-center justify-center rounded-full bg-white/90 text-purple shadow-panel md:size-16";

/**
 * The player parameters, and the ones deliberately left out.
 *
 *  autoplay=1     The tap already meant "play"; without it the student taps
 *                 twice, once on our facade and once on YouTube's. It only
 *                 works because `autoplay` is ALSO in the allow= list below —
 *                 the cross-origin Permissions-Policy default is `self`, and
 *                 omitting that token is the usual reason a facade needs two
 *                 taps. The iframe is created inside the click handler, which
 *                 is what keeps it in the user-gesture chain.
 *  playsinline=1  Without it iOS hands playback to the native fullscreen
 *                 player, throwing the student clean out of FocusLayout and
 *                 back into it on dismiss. Also the difference between working
 *                 and not inside a webview with no fullscreen support.
 *  rel=0          Since 2018 this no longer removes related videos — it
 *                 restricts them to the same channel. Still worth setting: the
 *                 end screen then shows other BrachNha videos rather than
 *                 arbitrary YouTube, which is the difference between a lesson
 *                 ending and a student leaving.
 *  hl=km          Player interface — tooltips, settings, the quality picker —
 *                 in Khmer, matching this feature's Khmer-only rule. Falls back
 *                 string by string where YouTube has no Khmer, so no downside.
 *
 * NOT SET, although every guide tells you to add them:
 *
 *  modestbranding=1  Deprecated and ignored since August 2023; YouTube always
 *                    shows its watermark now. A parameter that does nothing is
 *                    a lie in the URL that the next reader will believe.
 *  iv_load_policy=3  Hid annotations, a feature discontinued in 2019. Inert.
 *  cc_lang_pref=km   Does nothing alone — it only picks the caption language IF
 *                    captions are on, which needs cc_load_policy=1, and THAT
 *                    with no real Khmer track forces auto-generated captions
 *                    that for Khmer audio are usually garbage or English. ADD
 *                    BOTH the day a real Khmer caption track is uploaded and
 *                    not before; that day this becomes one of the
 *                    highest-value lines in the file, because captions carry a
 *                    lesson over a bad connection.
 *  enablejsapi=1     Only needed to postMessage the IFrame Player API. Nothing
 *                    does, and adding it invites watch-progress tracking.
 *  mute=1            The "guaranteed autoplay" trick. Never — see the traps.
 *  controls=0        A student needs to scrub and pause a lesson.
 */
const PLAYER_PARAMS = "autoplay=1&playsinline=1&rel=0&hl=km";

/** The one host warmed by the preconnect below, and the one the frame loads. */
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SectionVideoPlayer({
  video,
  title,
}: {
  video: SectionVideo;
  /**
   * The section's own title, for the button's label and the frame's accessible
   * name. Optional so the component still renders standalone, but
   * section-detail.tsx always passes it — "លេងវីដេអូ សេចក្ដីផ្ដើម" is a far
   * better thing to hear than a bare "លេងវីដេអូ" on a step that may also hold a
   * 3D model and a quiz.
   */
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);

  // A bad id reads as no id — see YOUTUBE_ID. Computed as a whole value, never
  // read into by a closure, which is what keeps the React Compiler out of it.
  const youtubeId =
    video.youtubeId && YOUTUBE_ID.test(video.youtubeId)
      ? video.youtubeId
      : undefined;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-purple/15 bg-control">
      {playing && youtubeId ? (
        <iframe
          src={`${EMBED_ORIGIN}/embed/${youtubeId}?${PLAYER_PARAMS}`}
          title={title ? `វីដេអូមេរៀន ${title}` : "វីដេអូមេរៀន"}
          // Minimal on purpose — each token is a capability handed to a third
          // party. `autoplay` is mandatory (see PLAYER_PARAMS). `encrypted-media`
          // lets the player use EME, which some videos refuse to play without.
          // Dropped from the usual copy-paste list: accelerometer and gyroscope
          // (360°/VR video only — this is a lecture recording), and
          // clipboard-write / web-share, whose only job is to make copying the
          // UNLISTED link one tap, which is the opposite of what unlisted means.
          // allowFullScreen already grants fullscreen, so it is not listed here.
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          // Origin, never the path. YouTube uses the referrer to bind playback
          // to the embedding site and the origin satisfies that; the full URL
          // would tell Google which lesson this student is sitting in. Already
          // the browser default — stating it pins the behaviour against a
          // page-level Referrer-Policy header being added later.
          referrerPolicy="strict-origin-when-cross-origin"
          // rounded-2xl on the iframe itself: Safari has historically failed to
          // clip a framed document to an ancestor's radius under overflow-hidden.
          className="absolute inset-0 size-full rounded-2xl"
        />
      ) : (
        <>
          {/* Warms DNS + TCP + TLS to the embed host while the student reads the
              section, so the tap pays for bytes only — zero payload, ~200-400ms
              off the tap on a mobile connection. React 19 hoists this into
              <head> from anywhere in the tree; un-hoisted it would work too, so
              the hoisting is tidiness rather than correctness.

              Rendered ONLY when there is a video to play, and only before it
              plays: a section with no recording must not open a socket to
              Google, and once the frame is up the connection already exists.

              NO crossorigin attribute. The iframe is a NAVIGATION, not a CORS
              fetch, so an anonymous-crossorigin preconnect would open a second,
              unused connection and save nothing. (index.html's fonts.gstatic.com
              link needs crossorigin for exactly the opposite reason — font files
              ARE CORS fetches — so copying that line's shape here is a bug.)

              And this does NOT belong in index.html: that file's link already
              blocks first paint, and warming a host reachable from one section
              on every screen would slow first paint for everyone to speed up one
              tap for a few. Only this one host, too — the media stream comes
              from a *.googlevideo.com subdomain whose name is not knowable in
              advance, and browsers cap how many preconnects they honour. */}
          {youtubeId && <link rel="preconnect" href={EMBED_ORIGIN} />}

          {/* ឆាប់ៗនេះ whenever there is nothing behind the play glyph, which is
              what makes the poster-only state LEGIBLE WITHOUT TAPPING — the same
              principle as exam-paper-card.tsx's chip and the survey's
              studiedNote. This file's header records that an earlier version had
              this chip and that it was removed at the user's request, taking the
              <button> with it; the chip is back by request, the button is NOT.
              The rule stands either way: the chip explains the state, it does
              not make it pressable, and only a youtubeId does that. */}
          {!youtubeId && (
            <span className="absolute top-2 right-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-extrabold text-white">
              ឆាប់ៗនេះ
            </span>
          )}

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

          {/* Scrim only behind the bottom bar, so the controls stay readable over
              a light illustration without dimming the artwork itself.
              pointer-events-none so it cannot swallow a tap meant for the play
              button, which now spans the whole frame. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/55 to-transparent" />

          {youtubeId ? (
            // The button is the WHOLE frame, not just the disc: there is nothing
            // else on this surface to hit by accident, and an invisible target
            // larger than the visible affordance is the correct direction.
            // focus-visible rather than focus so a tap leaves no ring behind;
            // outline-purple is the per-theme --color-* scale, correct in dark
            // with no override because this is an outline, not a fill under
            // white text.
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={title ? `លេងវីដេអូ ${title}` : "លេងវីដេអូ"}
              className="absolute inset-0 flex cursor-pointer items-center justify-center transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              <span className={PLAY_DISC}>
                <Play
                  className="ml-0.5 size-6 fill-current md:size-7"
                  strokeWidth={0}
                />
              </span>
            </button>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={PLAY_DISC}>
                <Play
                  className="ml-0.5 size-6 fill-current md:size-7"
                  strokeWidth={0}
                />
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-2">
            <div className="mb-1.5 flex items-center justify-between">
              {/* Only when a run time is actually known. A section whose
                  recording has not been made has none, and "0:00 / 5:00" beside
                  a ឆាប់ៗនេះ chip would claim a video that does not exist. The
                  Maximize glyph stays on its own so the row keeps its shape. */}
              {video.durationSec !== undefined ? (
                <span className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  0:00 / {clock(video.durationSec)}
                </span>
              ) : (
                <span />
              )}
              <Maximize2 className="size-4 text-white/85" strokeWidth={2.5} />
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/35">
              <div className="h-full w-0 rounded-full bg-brand" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

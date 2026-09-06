import { AlertTriangle, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { SharedToday } from "@/utils/streak-friends";
import { sharedStatusLine, useStreakCopy } from "../copy";
import type { Participant } from "../friend-streak-demo-data";
import { CelebrationAnimation } from "./celebration-animation";
import { StreakFlame } from "./streak-flame";
import { useCountUp } from "../use-count-up";

/**
 * The shared hero: two faces with one flame between them.
 *
 * THE LAYOUT IS THE ARGUMENT. The solo page centres a single flame and the
 * count under it; here the flame sits BETWEEN the two avatars, on a gradient
 * rail that runs from one to the other, so the first thing read is that the
 * number belongs to a pair. The brief's rule — do not make this look like a
 * personal statistic — is enforced by that arrangement rather than by a caption
 * saying so.
 *
 * The rail is a `-z-0` bar behind the row rather than a border on anything: it
 * has to pass UNDER both avatars to read as a connection, and a border would
 * stop at each edge.
 *
 * EACH AVATAR CARRIES ITS OWN RING — mint once that person is done, dashed
 * amber while they are not. That is the same information the goal card below
 * states in words, put where the eye lands first, and it is why the header
 * needs no separate "who is outstanding" row.
 *
 * The count uses the same `bg-clip-text` flame ramp and `useCountUp` tween as
 * the solo page, so 12 → 13 reads identically on both screens.
 */
export function FriendStreakHeader({
  streak,
  today,
  you,
  friend,
  celebrating,
}: {
  streak: number;
  today: SharedToday;
  you: Participant;
  friend: Participant;
  celebrating: boolean;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const userName = useBrachNhaStore((s) => s.userName);
  const c = useStreakCopy(lang);
  const shown = useCountUp(streak);

  // The one live value on the page, exactly as on the leaderboard — the demo
  // roster's own name is only a fallback for a logged-out render.
  const yourName = userName || you.name;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/10 bg-surface px-4 py-6 text-center shadow-panel md:py-8">
      <CelebrationAnimation active={celebrating} />

      <div className="relative mx-auto flex w-fit items-center justify-center gap-2 md:gap-3">
        {/* The rail. Inset so it starts and ends inside the avatars rather than
            poking out past them. */}
        <div
          aria-hidden
          className="bg-flame absolute inset-x-6 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full opacity-30"
        />
        <ParticipantFace
          name={yourName}
          seed={you.avatarSeed}
          done={today.you}
          badge={c.youLabel}
        />
        <StreakFlame
          celebrating={celebrating}
          className="relative z-10 size-16 md:size-20"
        />
        <ParticipantFace
          name={friend.name}
          seed={friend.avatarSeed}
          done={today.friend}
        />
      </div>

      <div
        className={cn(
          "font-heading bg-flame mt-4 bg-clip-text text-6xl leading-none font-extrabold text-transparent md:text-7xl",
          celebrating && "animate-streak-pop"
        )}
      >
        {shown}
      </div>

      <div className="font-heading mt-1.5 text-sm font-extrabold text-text md:text-base">
        {c.dayStreak}
      </div>

      <div className="mx-auto mt-2 max-w-xs text-xs font-bold text-muted md:text-sm">
        {c.sharedTagline}
      </div>

      {/* role="status" is what makes the streak advancing reach a screen reader
          at all — the confetti is aria-hidden and a number changing silently in
          the DOM is not announced. */}
      <div
        role="status"
        className="mt-3 border-t border-purple/8 pt-3 text-xs font-extrabold md:text-sm"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            today.kept ? "bg-mint/12 text-mint" : "bg-yellow/12 text-yellow"
          )}
        >
          {today.kept ? (
            <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
          ) : (
            <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          )}
          {today.kept ? c.streakSafe : c.atRisk}
        </span>
        <div className="mt-2 text-xs font-bold text-muted">
          {sharedStatusLine(friend.name, today.you, today.friend, lang)}
        </div>
      </div>
    </div>
  );
}

/** One face on the rail, ringed by whether that person is done today. */
function ParticipantFace({
  name,
  seed,
  done,
  badge,
}: {
  name: string;
  seed: string;
  done: boolean;
  badge?: string;
}) {
  return (
    <div className="relative z-10 flex w-20 flex-col items-center gap-1.5 md:w-24">
      <Avatar
        seed={seed}
        name={name}
        className={cn(
          "size-14 bg-surface md:size-16",
          // ring-offset carries the card colour so the gap reads as a gap
          // rather than a second, paler ring.
          "ring-2 ring-offset-2 ring-offset-surface",
          done ? "ring-mint" : "ring-yellow/60"
        )}
      />
      <span className="max-w-full truncate text-[11px] font-extrabold text-text">
        {name}
      </span>
      {/* The slot is always rendered, even for the friend who has no badge, so
          the two faces stay the same height and the flame between them stays on
          the rail rather than drifting up. */}
      <span className="flex h-4 items-center">
        {badge && (
          // A fill under white text, so the BRAND scale — see the two-accent
          // scales note in globals.css.
          <span className="rounded-full bg-[var(--brand-purple)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}

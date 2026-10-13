import { Link } from "react-router";
import { Check, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { SharedToday } from "@/utils/streak-friends";
import {
  continueTaskLabel,
  friendNeedsToFinishLabel,
  useStreakCopy,
  waitingForLabel,
} from "../copy";
import type { Participant } from "../types";

/**
 * Today's goal, told as two rows rather than one progress bar.
 *
 * TWO ROWS IS THE POINT. The solo page can show a single ring at 67% because
 * there is one person to measure; here a combined figure would let "one of us
 * finished" read as half-way, which is exactly the misunderstanding the shared
 * rule has to prevent. Two independent states, each either done or not, and the
 * streak moves only when both say done.
 *
 * REAL since 13 Oct 2026. Your row is your own `tasks` (this device); your
 * friend's is whether their goal day has reached the server. There is no
 * button that completes anything: while your goal is open the card links to
 * your next task, through the same features/home/task-links.ts the solo
 * Streak page uses. The prototype's Remind and Simulate buttons are gone: the
 * app sends no notifications, and nothing here may stand in for another person.
 */
export function SharedGoalCard({
  today,
  you,
  friend,
  next,
}: {
  today: SharedToday;
  you: Participant;
  friend: Participant;
  /** Your next open goal task, or null once yours is done. */
  next: { label: string; href: string } | null;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <Card className="gap-3">
      <div className="font-heading text-sm font-extrabold md:text-base">
        {c.todaysGoal}
      </div>

      <div className="flex flex-col gap-2">
        <GoalRow
          name={you.name}
          seed={you.avatarSeed}
          done={today.you}
          badge={c.youLabel}
          subtitle={c.dailyGoal}
          doneLabel={c.statusDone}
          waitingLabel={c.statusWaiting}
        />
        <GoalRow
          name={friend.name}
          seed={friend.avatarSeed}
          done={today.friend}
          subtitle={c.dailyGoal}
          doneLabel={c.statusDone}
          waitingLabel={c.statusWaiting}
        />
      </div>

      {/* Only once you are done and the friend is not: before that, the thing
          to do is your own goal, which the link below is for. */}
      {today.you && today.waitingOnFriend && (
        <div className="rounded-xl border border-border bg-yellow/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-yellow">
            <Clock className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            {waitingForLabel(friend.name, lang)}
          </div>
          <div className="mt-1 text-[11px] leading-relaxed font-bold text-muted">
            {friendNeedsToFinishLabel(friend.name, lang)}
          </div>
        </div>
      )}

      {next && (
        <Link
          to={next.href}
          className="w-full rounded-2xl bg-brand px-4 py-3 text-center text-sm font-extrabold text-white shadow-cta transition hover:brightness-105 active:scale-[0.98]"
        >
          {continueTaskLabel(next.label, lang)}
        </Link>
      )}

      {/* The rule, restated where the decision is actually made. */}
      <div className="text-[11px] leading-relaxed font-bold text-muted">
        {c.bothRule}
      </div>
    </Card>
  );
}

function GoalRow({
  name,
  seed,
  done,
  badge,
  subtitle,
  doneLabel,
  waitingLabel,
}: {
  name: string;
  seed: string;
  done: boolean;
  badge?: string;
  subtitle: string;
  doneLabel: string;
  waitingLabel: string;
}) {
  return (
    <div
      className={cn(
        // FLEX-WRAP, and the min-width on the name block below is what drives
        // it. "Not completed yet" is a ~134px chip; at the 320px floor that
        // left the name 66px and truncated "Panharith" to "P…", which loses the
        // one thing the row exists to say. Giving the name block a floor makes
        // the three items overflow the line instead, so the chip drops to its
        // own row and the name keeps its width. No breakpoint needed — it
        // reflows on the real measurement rather than a guess about the screen.
        "flex flex-wrap items-center gap-2.5 rounded-xl border p-2.5 transition-colors",
        done ? "border-border bg-mint/30" : "border-border bg-control"
      )}
    >
      <Avatar seed={seed} name={name} className="size-9 shrink-0 bg-surface" />

      <div className="min-w-20 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-extrabold text-text">{name}</span>
          {badge && (
            <span className="shrink-0 rounded-full bg-[var(--brand-purple)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[10px] font-bold text-muted">
          {subtitle}
        </div>
      </div>

      {/* Icon AND words, never colour alone — the whole card is one distinction
          repeated twice, and it has to survive not being able to tell mint from
          amber. */}
      <div
        className={cn(
          // ml-auto so that on the wrapped row it still sits to the right,
          // reading as a status rather than a second label under the name.
          "ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold",
          done ? "bg-mint/15 text-mint" : "bg-yellow/15 text-yellow"
        )}
      >
        {done ? (
          <Check className="size-3 shrink-0" strokeWidth={3.5} aria-hidden />
        ) : (
          <Clock className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
        )}
        {done ? doneLabel : waitingLabel}
      </div>
    </div>
  );
}

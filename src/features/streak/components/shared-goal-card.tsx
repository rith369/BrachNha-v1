import { Bell, Check, Clock, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { SharedToday } from "@/utils/streak-friends";
import {
  friendNeedsToFinishLabel,
  remindLabel,
  useStreakCopy,
  waitingForLabel,
} from "../copy";
import type { Participant } from "../friend-streak-demo-data";

/**
 * Today's goal, told as two rows rather than one progress bar.
 *
 * TWO ROWS IS THE POINT. The solo page can show a single ring at 67% because
 * there is one person to measure; here a combined figure would let "one of us
 * finished" read as half-way, which is exactly the misunderstanding the shared
 * rule has to prevent. Two independent states, each either done or not, and the
 * streak moves only when both say done.
 *
 * THREE CONTROLS, and they are deliberately three different weights:
 *   • "Complete Today's Goal" is the real primary — bg-brand, the app's
 *     established CTA. It is the only one a shipped version would keep.
 *   • "Remind Dara" is secondary and is the mechanic worth keeping from the
 *     ranked-list version this page replaced: it turns waiting into something
 *     the student can act on. Local state, forgets on reload — a real reminder
 *     is a notification the app does not send.
 *   • "Simulate friend completion" is DASHED AND LABELLED AS A PROTOTYPE
 *     CONTROL, because it stands in for another human being. Dressing it as an
 *     ordinary button would be the one genuinely dishonest thing on the page —
 *     a student could press it and believe they had made Dara do something.
 *
 * Each disappears rather than sitting disabled once it has nothing left to do,
 * the rule subject-card.tsx's zero-lesson tile and sidebar-nav.tsx's
 * `href: null` rows already follow.
 */
export function SharedGoalCard({
  today,
  you,
  friend,
  reminded,
  onComplete,
  onRemind,
  onSimulateFriend,
}: {
  today: SharedToday;
  you: Participant;
  friend: Participant;
  reminded: boolean;
  onComplete: () => void;
  onRemind: () => void;
  onSimulateFriend: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const userName = useBrachNhaStore((s) => s.userName);
  const c = useStreakCopy(lang);

  const yourName = userName || you.name;

  return (
    <Card className="gap-3">
      <div className="font-heading text-sm font-extrabold md:text-base">
        {c.todaysGoal}
      </div>

      <div className="flex flex-col gap-2">
        <GoalRow
          name={yourName}
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

      {/* Only while the friend is outstanding. Once both are done the card has
          nothing to wait for and the header is already celebrating. */}
      {today.waitingOnFriend && (
        <div className="rounded-xl border border-yellow/30 bg-yellow/8 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-yellow">
            <Clock className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            {waitingForLabel(friend.name, lang)}
          </div>
          <div className="mt-1 text-[11px] leading-relaxed font-bold text-muted">
            {friendNeedsToFinishLabel(friend.name, lang)}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!today.you && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-cta transition hover:brightness-105 active:scale-[0.98]"
          >
            {c.completeYours}
          </button>
        )}

        {today.waitingOnFriend && (
          <button
            type="button"
            onClick={onRemind}
            disabled={reminded}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98]",
              reminded
                ? "cursor-default border border-mint/30 bg-mint/10 text-mint"
                : "border border-purple/25 bg-surface text-purple hover:bg-purple/8"
            )}
          >
            {reminded ? (
              <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden />
            ) : (
              <Bell className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            {reminded ? c.reminded : remindLabel(friend.name, lang)}
          </button>
        )}
      </div>

      {today.waitingOnFriend && (
        <div className="border-t border-purple/8 pt-3">
          <button
            type="button"
            onClick={onSimulateFriend}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] font-extrabold text-muted transition hover:text-purple"
          >
            <Sparkles className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            {c.simulateFriend}
          </button>
          <div className="mt-1.5 text-center text-[10px] font-bold text-muted">
            {c.simulateNote}
          </div>
        </div>
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
        done ? "border-mint/30 bg-mint/8" : "border-border bg-control"
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

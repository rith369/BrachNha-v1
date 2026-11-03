import { Shield } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Card } from "@/components/ui/card";
import { ProtectionNotice } from "@/features/home/components/protection-notice";
import { useBrachNhaStore } from "@/lib/store";
import { MAX_STREAK_PROTECTIONS, STREAK_PROTECTION_COINS } from "@/utils/rewards";
import { protectionBuyLabel, protectionNeedLabel, useStreakCopy } from "../copy";

/**
 * How many protections the student holds, and the one place to buy another. Coins
 * had nothing to spend them on before this.
 *
 * Full, or short of coins, is a dimmed line rather than a disabled button: a
 * control that does nothing must not look tappable.
 */
export function StreakProtectionCard() {
  const { lang, held, coins, buy } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      held: s.streakProtections,
      coins: s.coins,
      buy: s.buyStreakProtection,
    }))
  );
  const c = useStreakCopy(lang);
  const short = STREAK_PROTECTION_COINS - coins;

  return (
    <Card className="gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple/15 text-purple">
          <Shield className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-sm font-extrabold md:text-base">
            {c.protectionTitle}
          </div>
          <div className="text-[11px] leading-relaxed font-bold text-muted">
            {c.protectionHelp}
          </div>
        </div>
        <div className="shrink-0 font-heading text-lg font-extrabold text-purple">
          {held}/{MAX_STREAK_PROTECTIONS}
        </div>
      </div>

      {held >= MAX_STREAK_PROTECTIONS ? (
        <div className="rounded-2xl bg-control px-4 py-3 text-center text-sm font-extrabold text-muted">
          {c.protectionFull}
        </div>
      ) : short > 0 ? (
        <div className="rounded-2xl bg-control px-4 py-3 text-center text-sm font-extrabold text-muted">
          {protectionNeedLabel(short, lang)}
        </div>
      ) : (
        <button
          type="button"
          onClick={buy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-neo-yellow px-4 py-3 text-sm font-extrabold text-ink shadow-hard-sm transition active:translate-x-px active:translate-y-px active:shadow-none"
        >
          <Shield className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          {protectionBuyLabel(STREAK_PROTECTION_COINS, lang)}
        </button>
      )}

      <ProtectionNotice />
    </Card>
  );
}

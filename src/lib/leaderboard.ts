import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Result } from "./competitions";
import { avatarSeedFor } from "@/utils/avatar-seed";
import type { RealStudentRow } from "@/utils/leaderboard";

/**
 * Real students for the leaderboard, through the leaderboard() SQL function
 * (supabase/migrations/20260916000004_leaderboard.sql).
 *
 * A function rather than a table read because every table is own-rows-only and
 * must stay that way — profiles holds email, age and location. The function
 * returns a display name and numbers, nothing else, and never the caller: the
 * viewer's own row is built from the live store instead.
 *
 * Returns a Result like lib/competitions.ts rather than swallowing errors the
 * way supabase-sync.ts does, although the page treats every failure the same
 * (the board simply shows the sample cohort and the viewer). Keeping the reason
 * costs nothing and is what a future "couldn't load classmates" line would need.
 *
 * getSupabase() is awaited, never imported statically — the SDK is its own chunk.
 */
export async function fetchLeaderboard(
  today: string
): Promise<Result<RealStudentRow[]>> {
  if (!isSupabaseConfigured) return { ok: false, reason: "unconfigured" };
  const db = await getSupabase();
  if (!db) return { ok: false, reason: "unconfigured" };

  const { data, error } = await db.rpc("leaderboard", { p_today: today });
  if (error) return { ok: false, reason: "failed" };

  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      name: r.display_name,
      // Derived from the account id, so a student looks the same here as on
      // their competitions — see utils/avatar-seed.ts for why not their photo.
      avatarSeed: avatarSeedFor(r.id),
      stats: {
        weekly: {
          xp: r.xp_week,
          streak: r.streak_now,
          studyMinutes: r.minutes_week,
        },
        monthly: {
          xp: r.xp_month,
          streak: r.streak_month,
          studyMinutes: r.minutes_month,
        },
        allTime: {
          xp: r.xp_all,
          streak: r.streak_all,
          studyMinutes: r.minutes_all,
        },
      },
    })),
  };
}

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchLeaderboard } from "@/lib/leaderboard";
import type { RealStudentRow } from "@/utils/leaderboard";

/**
 * Other real students, for merging into the board beside the sample cohort.
 *
 * NOTHING WAITS ON THIS. The board renders at once with the sample rows and the
 * viewer's own row, and real students slot in when the request lands — so every
 * non-answer (loading, a guest, Supabase unconfigured, a failed call) is simply
 * an empty list rather than a state the screen has to draw. That is the rule
 * lib/supabase.ts sets for the whole app, and open-competitions.tsx's pattern.
 *
 * A guest fetches nothing: the SQL function is granted to signed-in students
 * only, so there is no request worth making.
 */
export function useRealStudents(today: string): RealStudentRow[] {
  const { authStatus, authUserId } = useBrachNhaStore(
    useShallow((s) => ({
      authStatus: s.authStatus,
      authUserId: s.authUser?.id ?? "",
    }))
  );
  const [rows, setRows] = useState<RealStudentRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || authStatus === "loading" || !authUserId) return;
    let cancelled = false;
    fetchLeaderboard(today).then((result) => {
      // setState only in the async callback — oxlint's
      // react(set-state-in-effect) rule, same as open-competitions.tsx.
      if (!cancelled && result.ok) setRows(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus, authUserId, today]);

  // A signed-out viewer must not keep the list fetched under a previous
  // session. Derived here rather than cleared by an effect.
  return authUserId ? rows : [];
}

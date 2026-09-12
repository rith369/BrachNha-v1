import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Avatar } from "@/components/ui/avatar";
import { findSubject } from "@/features/lessons/subjects";
import { DIFFICULTIES, attemptFor } from "../game";
import { gameCopy, num, relativeDay } from "../copy";
import { avatarSeedFor } from "@/utils/avatar-seed";
import {
  fetchMyAttemptIds,
  fetchOpenCompetitions,
  type RemoteCompetition,
} from "@/lib/competitions";

/**
 * Competitions other students have posted — THE APP'S FIRST SCREEN THAT READS
 * ANOTHER PERSON'S DATA, and its first that waits on the network.
 *
 * Every other screen renders synchronously from the Zustand store, and
 * lib/supabase.ts states plainly that nothing in the UI may depend on the client
 * being present. This section is the documented exception, so it follows the
 * rule the rest of the app lives by rather than breaking it:
 *
 *   NOTHING HERE BLOCKS FIRST PAINT. The hub renders instantly from the store
 *   and this card fills in underneath. Its three waiting states are quiet inline
 *   lines inside a card that already occupies its space — not a full-page
 *   spinner, and not a layout that jumps when the answer arrives.
 *
 * The states, and why each says what it says:
 *   loading  — one muted line. No skeleton: a list of grey bars pretending to be
 *              rows is a bigger lie than a sentence.
 *   failed   — a plain retry. The rest of the page still works, so this must not
 *              read like the app is broken.
 *   empty    — TWO of them, and they mean opposite things: "nobody has posted
 *              one yet" (an empty app) versus "you have played them all" (a
 *              finished student). Identical in the data, so they are told apart
 *              by whether anything was fetched before filtering.
 *   guest    — an invitation to sign in rather than an empty list, because a
 *              guest is not missing data, they are missing an account.
 *
 * It renders NOTHING AT ALL when Supabase is unconfigured — a fresh clone, or
 * the blanked-env screenshot harness — because there is no server to have
 * competitions on and an error there would be noise about a state that is
 * supported by design.
 */
export function OpenCompetitions() {
  const { lang, authUserId, authStatus, attempts } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      authUserId: s.authUser?.id ?? "",
      authStatus: s.authStatus,
      attempts: s.competitionAttempts,
    }))
  );
  const t = gameCopy(lang);

  const [rows, setRows] = useState<RemoteCompetition[]>([]);
  // Competitions this student has attempted on ANY device — they are dropped
  // from the list rather than shown as played. See the note on the filter below.
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [fetched, setFetched] = useState<"loading" | "ready" | "failed" | "off">(
    "loading"
  );
  // Bumped by Retry to re-run the effect. A counter rather than calling the
  // fetch from the handler, so there is exactly one place the request is made.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Wait for the session rather than fetching without one: RLS gives an
    // unauthenticated caller nothing, so firing early would just produce a
    // failure to show and then a second request.
    if (authStatus === "loading" || !authUserId) return;
    let cancelled = false;
    // In parallel: the competitions, and which of them this student has already
    // attempted on ANY device. Sequentially would double the wait for a list
    // that is already the one place in the app that blocks on the network.
    Promise.all([
      fetchOpenCompetitions(authUserId),
      fetchMyAttemptIds(authUserId),
    ]).then(([list, mine]) => {
      // Every setState here is in an async callback, never synchronous inside
      // the effect body — the cascading-render pattern oxlint's
      // react(set-state-in-effect) rule flags. The opening "loading" comes from
      // the initial state, and Retry sets it from its own handler.
      if (cancelled) return;
      if (!list.ok) {
        setFetched(list.reason === "unconfigured" ? "off" : "failed");
        return;
      }
      setRows(list.data);
      // A failed attempt-check is NOT a failure of the list. The local attempts
      // still filter this device, and showing a competition that turns out to be
      // played is recoverable — the play screen says so. Showing nothing at all
      // because a secondary query failed is not.
      setPlayedIds(mine.ok ? new Set(mine.data) : new Set());
      setFetched("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus, authUserId, attempt]);

  function retry() {
    setFetched("loading");
    setAttempt((n) => n + 1);
  }

  // DERIVED during render rather than pushed into state by an effect. A guest is
  // not a fetch outcome — it is what the session already says — and "loading"
  // while the session resolves is the honest answer, since calling a returning
  // student a guest in that window would be wrong (see app-shell.tsx's gate).
  const state =
    authStatus === "loading"
      ? "loading"
      : !authUserId
        ? "guest"
        : fetched;

  // A BROWSE LIST IS WHAT YOU CAN PLAY. A competition already answered is not a
  // choice any more — replaying cannot change the recorded score — and its result
  // is in Recent Games, so leaving it here was two places saying one thing and a
  // list that only ever grew. Local attempts cover this device; playedIds covers
  // the others.
  const visible = rows.filter(
    (c) => !playedIds.has(c.id) && !attemptFor(attempts, c.id)
  );

  if (state === "off") return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-heading text-sm font-extrabold">
          {t.challengeSomeone}
        </div>
        {state === "failed" && (
          <button
            onClick={retry}
            className="text-xs font-extrabold text-purple"
          >
            {t.retry}
          </button>
        )}
      </div>

      {state !== "ready" && (
        <div className="rounded-2xl border border-purple/10 bg-surface p-4 text-center text-xs font-bold text-muted shadow-panel-sm">
          {state === "loading"
            ? t.loadingCompetitions
            : state === "guest"
              ? t.competitionsSignIn
              : t.competitionsFailed}
        </div>
      )}

      {/* TWO different empty states. "Nobody has posted one" and "you have
          played them all" look identical in the data and mean opposite things —
          one is an empty app, the other is a finished student. */}
      {state === "ready" && visible.length === 0 && (
        <div className="rounded-2xl border border-purple/10 bg-surface p-4 text-center text-xs font-bold text-muted shadow-panel-sm">
          {rows.length === 0 ? t.competitionsEmpty : t.allPlayed}
        </div>
      )}

      {state === "ready" && visible.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {visible.map((c) => {
            const subject = findSubject(c.subject);
            const difficulty = DIFFICULTIES.find((d) => d.id === c.difficulty);
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm"
              >
                <Avatar
                  // Derived from the account id, so the same student looks the
                  // same to everyone — see utils/avatar-seed.ts for why this is
                  // not their real photo.
                  seed={avatarSeedFor(c.creatorId)}
                  name={c.creatorName}
                  className="size-11 shrink-0 border-2 border-blue"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold">
                    {c.creatorName}
                  </div>
                  <div className="truncate text-[10px] font-bold text-muted">
                    {subject?.name ?? ""} · {difficulty?.label[lang]}
                  </div>
                  <div className="mt-1 flex gap-2.5 text-[10px] font-extrabold text-muted">
                    <span>
                      ⏱ {num(c.minutes, lang)} {t.minutes}
                    </span>
                    <span>
                      {t.scoreToBeat} {num(c.creatorScore, lang)}/
                      {num(c.total, lang)}
                    </span>
                  </div>
                </div>
                {/* Every row here is playable by construction — a competition
                    already attempted is filtered out above — so there is no
                    played state to render and no disabled button. The result of
                    a finished one lives in Recent Games, which is the one place
                    it belongs. */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {/* A real Link, unlike the original card's inert Play
                      button — there is now something behind it. */}
                  <Link
                    to={`/game/play/${c.id}`}
                    className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-extrabold text-white"
                  >
                    {t.play}
                  </Link>
                  <div className="text-[9px] font-bold text-muted">
                    {relativeDay(c.createdAt, lang)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

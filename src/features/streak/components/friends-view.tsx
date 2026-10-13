import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronRight, Clock, Flame, Search, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import {
  removeFriendship,
  respondFriendRequest,
  searchStudents,
  sendFriendRequest,
  type FriendFail,
  type FriendRow,
  type SearchHit,
} from "@/lib/friends";
import { avatarSeedFor } from "@/utils/avatar-seed";
import { cn } from "@/utils/cn";
import { todayKey } from "@/utils/day";
import { pairStreak } from "@/utils/streak-friends";
import { friendFailLabel, useStreakCopy } from "../copy";
import { useFriends } from "../use-friends";

const SEARCH_DELAY_MS = 300;
const MIN_QUERY = 2;

/**
 * /streak/friends: requests waiting for you, your friends (each with the
 * pair's streak), a name search to add one, and the requests you sent.
 *
 * SEARCH BY NAME WAS THE USER'S CALL, and it means any signed-in student can
 * find any other. What keeps that small is in the database
 * (20261013000001_friends.sql): a result is a display name and an id, nothing
 * else; nothing is shared until the other student accepts; and the caps. The
 * note at the bottom of this screen says plainly who can see what.
 *
 * Every write re-asks the server for the list rather than patching it locally:
 * the list is small, and a sent request can come back "accepted" (they had
 * already asked you), which only the server knows.
 */
export function FriendsView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const activityLog = useBrachNhaStore((s) => s.activityLog);
  const { loading, failed, rows, reload } = useFriends();
  const today = todayKey();

  const incoming = rows.filter((r) => r.status === "pending" && !r.outgoing);
  const outgoing = rows.filter((r) => r.status === "pending" && r.outgoing);
  const friends = rows.filter((r) => r.status === "accepted");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs leading-relaxed font-bold text-muted md:text-sm">
        {c.friendsIntro}
      </p>

      {incoming.length > 0 && (
        <Card className="gap-2">
          <h2 className="font-heading text-sm font-extrabold md:text-base">
            {c.requestsTitle}
          </h2>
          <ul className="flex flex-col gap-2">
            {incoming.map((r) => (
              <IncomingRow key={r.id} row={r} onDone={reload} />
            ))}
          </ul>
        </Card>
      )}

      <Card className="gap-2">
        <h2 className="font-heading text-sm font-extrabold md:text-base">
          {c.yourFriends}
        </h2>
        {loading ? (
          <p className="text-xs font-bold text-muted">{c.loading}</p>
        ) : failed ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-muted">{c.loadFailed}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-purple"
            >
              {c.retry}
            </button>
          </div>
        ) : friends.length === 0 ? (
          <p className="text-xs leading-relaxed font-bold text-muted">{c.noFriends}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((r) => {
              const streak = r.since
                ? pairStreak(activityLog, r.goalDays, r.since, today).current
                : 0;
              return (
                <FriendLink
                  key={r.id}
                  row={r}
                  streak={streak}
                  doneToday={r.goalDays.includes(today)}
                />
              );
            })}
          </ul>
        )}
      </Card>

      <AddFriend onChanged={reload} />

      {outgoing.length > 0 && (
        <Card className="gap-2">
          <h2 className="font-heading text-sm font-extrabold md:text-base">
            {c.sentTitle}
          </h2>
          <ul className="flex flex-col gap-2">
            {outgoing.map((r) => (
              <OutgoingRow key={r.id} row={r} onDone={reload} />
            ))}
          </ul>
        </Card>
      )}

      <p className="text-[11px] leading-relaxed font-bold text-muted">{c.whoSees}</p>
    </div>
  );
}

/** A name and a face, the start of every row on this screen. */
function Person({ id, name }: { id: string; name: string }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const shown = name || c.noName;
  return (
    <>
      <Avatar seed={avatarSeedFor(id)} name={shown} className="size-9 shrink-0 bg-surface" />
      <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-text">
        {shown}
      </span>
    </>
  );
}

const ROW = "flex items-center gap-2.5 rounded-xl border border-border bg-control p-2.5";

function FriendLink({
  row,
  streak,
  doneToday,
}: {
  row: FriendRow;
  streak: number;
  doneToday: boolean;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  return (
    <li>
      <Link
        to={`/streak/friends/${row.otherId}`}
        className={cn(ROW, "transition active:scale-[0.98]")}
      >
        <Avatar
          seed={avatarSeedFor(row.otherId)}
          name={row.name || c.noName}
          className="size-9 shrink-0 bg-surface"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold text-text">
            {row.name || c.noName}
          </div>
          {/* Their half of today, in words AND an icon. */}
          <div
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[10px] font-extrabold",
              doneToday ? "text-mint" : "text-muted"
            )}
          >
            {doneToday ? (
              <Check className="size-3 shrink-0" strokeWidth={3.5} aria-hidden />
            ) : (
              <Clock className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            {doneToday ? c.statusDone : c.statusWaiting}
          </div>
        </div>
        <span
          className="flex shrink-0 items-center gap-1 font-heading text-base font-extrabold text-text"
          aria-label={`${streak} ${c.dayStreak}`}
        >
          <Flame
            className={cn("size-4", streak > 0 ? "text-[var(--brand-flame-to)]" : "text-muted")}
            fill={streak > 0 ? "currentColor" : "none"}
            strokeWidth={2}
            aria-hidden
          />
          {streak}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} aria-hidden />
      </Link>
    </li>
  );
}

/** Shared by every row that writes: one call in flight, its refusal shown. */
function useAction(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FriendFail | null>(null);
  async function run(call: () => Promise<{ ok: true } | { ok: false; reason: FriendFail }>) {
    setBusy(true);
    setError(null);
    const r = await call();
    setBusy(false);
    if (!r.ok) {
      setError(r.reason);
      return false;
    }
    onDone();
    return true;
  }
  return { busy, error, run };
}

function ErrorLine({ error }: { error: FriendFail | null }) {
  const lang = useBrachNhaStore((s) => s.lang);
  if (!error) return null;
  return (
    <p role="alert" className="mt-1 text-[11px] font-bold text-muted">
      {friendFailLabel(error, lang)}
    </p>
  );
}

const SMALL_BUTTON =
  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-extrabold transition disabled:opacity-60";

function IncomingRow({ row, onDone }: { row: FriendRow; onDone: () => void }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const { busy, error, run } = useAction(onDone);
  return (
    <li>
      <div className={cn(ROW, "flex-wrap")}>
        <Person id={row.otherId} name={row.name} />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => respondFriendRequest(row.id, false))}
            className={cn(SMALL_BUTTON, "border border-border bg-surface text-muted")}
          >
            {c.decline}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => respondFriendRequest(row.id, true))}
            className={cn(SMALL_BUTTON, "bg-brand text-white shadow-cta")}
          >
            {c.accept}
          </button>
        </div>
      </div>
      <ErrorLine error={error} />
    </li>
  );
}

function OutgoingRow({ row, onDone }: { row: FriendRow; onDone: () => void }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const { busy, error, run } = useAction(onDone);
  return (
    <li>
      <div className={cn(ROW, "flex-wrap")}>
        <Person id={row.otherId} name={row.name} />
        <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
          <Clock className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
          {c.waitingAccept}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(() => removeFriendship(row.id))}
          className={cn(SMALL_BUTTON, "ml-auto border border-border bg-surface text-muted")}
        >
          {c.cancel}
        </button>
      </div>
      <ErrorLine error={error} />
    </li>
  );
}

type SearchState =
  | { query: string; state: "failed"; reason: FriendFail }
  | { query: string; state: "ready"; hits: SearchHit[] };

/**
 * The name search. Debounced, so typing a name sends one search rather than one
 * per letter; setState only from the timer's async callback
 * (react(set-state-in-effect)), the admin Students page's pattern. Results for
 * an older query stay on screen, dimmed, until the new answer arrives.
 */
function AddFriend({ onChanged }: { onChanged: () => void }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchState | null>(null);
  // Bumped after every add/accept, so the relations in the results re-read.
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const trimmed = query.trim();
  const active = trimmed.length >= MIN_QUERY;

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        const r = await searchStudents(trimmed);
        if (!alive) return;
        setResult(
          r.ok
            ? { query: trimmed, state: "ready", hits: r.data }
            : { query: trimmed, state: "failed", reason: r.reason }
        );
      })();
    }, SEARCH_DELAY_MS);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [trimmed, active, version]);

  const shown = active ? result : null;
  const stale = shown !== null && shown.query !== trimmed;

  function changed(message: string | null) {
    setNotice(message);
    setVersion((v) => v + 1);
    onChanged();
  }

  return (
    <Card className="gap-2">
      <h2 className="font-heading text-sm font-extrabold md:text-base">{c.addFriend}</h2>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-purple">
        <Search className="size-4 shrink-0 text-muted" strokeWidth={2.5} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNotice(null);
          }}
          placeholder={c.searchPlaceholder}
          aria-label={c.searchPlaceholder}
          maxLength={60}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-text outline-none placeholder:text-muted"
        />
      </label>

      {notice && (
        <p role="status" className="text-[11px] font-bold text-mint">
          {notice}
        </p>
      )}

      {!active ? (
        <p className="text-[11px] font-bold text-muted">{c.searchHint}</p>
      ) : shown === null ? (
        <p className="text-[11px] font-bold text-muted">{c.searching}</p>
      ) : shown.state === "failed" ? (
        <p role="alert" className="text-[11px] font-bold text-muted">
          {friendFailLabel(shown.reason, lang)}
        </p>
      ) : shown.hits.length === 0 ? (
        <p className={cn("text-[11px] font-bold text-muted", stale && "opacity-60")}>
          {c.searchEmpty}
        </p>
      ) : (
        <ul className={cn("flex flex-col gap-2", stale && "opacity-60")}>
          {shown.hits.map((hit) => (
            <SearchRow key={hit.id} hit={hit} onChanged={changed} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function SearchRow({
  hit,
  onChanged,
}: {
  hit: SearchHit;
  onChanged: (notice: string | null) => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FriendFail | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    const r = await sendFriendRequest(hit.id);
    setBusy(false);
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    onChanged(r.data === "accepted" ? c.nowFriends : null);
  }

  return (
    <li>
      <div className={cn(ROW, "flex-wrap")}>
        <Person id={hit.id} name={hit.name} />
        {hit.relation === "none" || hit.relation === "received" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void add()}
            className={cn(
              SMALL_BUTTON,
              "ml-auto flex items-center gap-1 bg-brand text-white shadow-cta"
            )}
          >
            {hit.relation === "received" ? (
              <Check className="size-3.5" strokeWidth={3} aria-hidden />
            ) : (
              <UserPlus className="size-3.5" strokeWidth={2.5} aria-hidden />
            )}
            {hit.relation === "received" ? c.accept : c.add}
          </button>
        ) : (
          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-mint/15 px-2 py-1 text-[10px] font-extrabold text-mint">
            {hit.relation === "friends" ? (
              <Check className="size-3 shrink-0" strokeWidth={3.5} aria-hidden />
            ) : (
              <Clock className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            {hit.relation === "friends" ? c.alreadyFriends : c.requestSent}
          </span>
        )}
      </div>
      <ErrorLine error={error} />
    </li>
  );
}


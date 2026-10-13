-- ============================================================================
-- BrachNha — friends, for Streak with Friends
-- ============================================================================
--
-- /streak/friends was demo data because the app had no idea what a friend is.
-- This adds the one missing piece. Everything the SHARED streak needs already
-- exists: each student's daily_activity rows record, per day, whether the daily
-- goal (lesson + practice + flashcards) was met.
--
-- THE USER'S DECISIONS (13 Oct 2026):
--   * many friends, each pair with its own streak, at most 20 friends;
--   * a friend is found by SEARCHING THEIR NAME and must ACCEPT a request;
--   * a pair's streak starts at 0 on the day they became friends.
--
-- SAFETY, because search lets any signed-in student find any other:
--   * search returns a display name and an id, nothing else (no email, age,
--     location or photo; the avatar is a cartoon derived from the id);
--   * nothing is shared until the other student accepts;
--   * a friend sees only which days you met the goal, since you became friends;
--   * 2+ letters to search, 10 results at most, 20 friends, 20 requests a day;
--   * Google accounts only (anonymous accounts can neither search nor be found).
--
-- WRITES GO THROUGH FUNCTIONS ONLY. The table has a read policy (your own rows,
-- which is what the menu badge counts) and no insert, update or delete policy:
-- the functions check the caps and refuse with a `hint` the app turns into a
-- sentence, the same shape as the admin functions in 20261002000001.
--
-- Account deletion needs nothing new: both columns cascade from profiles.
--
-- Re-runnable, in one transaction.
-- ============================================================================

begin;

create table if not exists public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles (id) on delete cascade,
  addressee_id  uuid not null references public.profiles (id) on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted')),
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz,
  check (requester_id <> addressee_id),
  check ((status = 'accepted') = (accepted_at is not null))
);

-- One row per PAIR, whichever of the two asked first.
create unique index if not exists friendships_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

drop policy if exists "friendships: read own" on public.friendships;
create policy "friendships: read own"
  on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

-- ── helpers (not callable by any client) ────────────────────────────────────

-- Accepted friends of one student.
create or replace function public.friend_count(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.friendships f
  where f.status = 'accepted' and p_user in (f.requester_id, f.addressee_id);
$$;

-- A real (Google) student with a name: the only kind that can search or be found.
create or replace function public.friend_eligible(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.id = p_user
      and coalesce(u.is_anonymous, false) = false
      and btrim(coalesce(p.display_name, '')) <> ''
  );
$$;

revoke all on function public.friend_count(uuid) from public, anon, authenticated;
revoke all on function public.friend_eligible(uuid) from public, anon, authenticated;

-- ── search_students ─────────────────────────────────────────────────────────

create or replace function public.search_students(p_query text)
returns table (id uuid, display_name text, relation text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me      uuid := auth.uid();
  needle  text := btrim(coalesce(p_query, ''));
  pattern text;
begin
  if me is null or not public.friend_eligible(me) then
    raise exception 'search_students: not signed in' using errcode = '42501';
  end if;
  if char_length(needle) < 2 then
    return;
  end if;

  -- A typed % or _ is a character, not a wildcard (as in admin_students).
  pattern := replace(replace(replace(left(needle, 60),
    '\', '\\'), '%', '\%'), '_', '\_');

  return query
  select
    p.id,
    btrim(p.display_name),
    case
      when f.id is null then 'none'
      when f.status = 'accepted' then 'friends'
      when f.requester_id = me then 'sent'
      else 'received'
    end
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.friendships f
    on least(f.requester_id, f.addressee_id) = least(me, p.id)
   and greatest(f.requester_id, f.addressee_id) = greatest(me, p.id)
  where p.id <> me
    and coalesce(u.is_anonymous, false) = false
    and btrim(coalesce(p.display_name, '')) <> ''
    and p.display_name ilike '%' || pattern || '%'
  -- Names that START with what was typed first, then the rest.
  order by (p.display_name ilike pattern || '%') desc, btrim(p.display_name), p.id
  limit 10;
end;
$$;

-- ── send_friend_request ─────────────────────────────────────────────────────
--
-- Returns 'sent', or 'accepted' when the other student had already asked you
-- (their request is accepted rather than a second one refused).
--
-- Hints: self, unknown, exists, limit (you have 20 friends), their_limit,
-- too_many (20 requests today, or 20 still waiting).

create or replace function public.send_friend_request(p_user uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me       uuid := auth.uid();
  today    date := (now() at time zone 'Asia/Phnom_Penh')::date;
  existing public.friendships;
begin
  if me is null or not public.friend_eligible(me) then
    raise exception 'send_friend_request: not signed in' using errcode = '42501';
  end if;
  if p_user is null or p_user = me then
    raise exception 'send_friend_request: yourself' using errcode = 'P0001', hint = 'self';
  end if;
  if not public.friend_eligible(p_user) then
    raise exception 'send_friend_request: no such student' using errcode = 'P0001', hint = 'unknown';
  end if;

  -- Two students asking each other at the same moment must not both insert.
  perform pg_advisory_xact_lock(hashtextextended(
    least(me, p_user)::text || greatest(me, p_user)::text, 0));

  select * into existing from public.friendships f
  where least(f.requester_id, f.addressee_id) = least(me, p_user)
    and greatest(f.requester_id, f.addressee_id) = greatest(me, p_user);

  if found then
    if existing.status = 'pending' and existing.addressee_id = me then
      if public.friend_count(me) >= 20 then
        raise exception 'send_friend_request: friend limit' using errcode = 'P0001', hint = 'limit';
      end if;
      if public.friend_count(p_user) >= 20 then
        raise exception 'send_friend_request: their limit' using errcode = 'P0001', hint = 'their_limit';
      end if;
      update public.friendships
        set status = 'accepted', accepted_at = now()
        where id = existing.id;
      return 'accepted';
    end if;
    raise exception 'send_friend_request: already there' using errcode = 'P0001', hint = 'exists';
  end if;

  if public.friend_count(me) >= 20 then
    raise exception 'send_friend_request: friend limit' using errcode = 'P0001', hint = 'limit';
  end if;
  if public.friend_count(p_user) >= 20 then
    raise exception 'send_friend_request: their limit' using errcode = 'P0001', hint = 'their_limit';
  end if;
  if (
    select count(*) from public.friendships f
    where f.requester_id = me
      and (f.status = 'pending'
           or (f.created_at at time zone 'Asia/Phnom_Penh')::date = today)
  ) >= 20 then
    raise exception 'send_friend_request: too many' using errcode = 'P0001', hint = 'too_many';
  end if;

  insert into public.friendships (requester_id, addressee_id) values (me, p_user);
  return 'sent';
end;
$$;

-- ── respond_friend_request ──────────────────────────────────────────────────
--
-- Accept or decline a request sent TO you. Decline deletes the row, so the
-- other student may ask again later. Hints: missing, limit, their_limit.

create or replace function public.respond_friend_request(p_id uuid, p_accept boolean)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me  uuid := auth.uid();
  req public.friendships;
begin
  if me is null then
    raise exception 'respond_friend_request: not signed in' using errcode = '42501';
  end if;

  select * into req from public.friendships f
  where f.id = p_id and f.addressee_id = me and f.status = 'pending'
  for update;
  if not found then
    raise exception 'respond_friend_request: no such request' using errcode = 'P0001', hint = 'missing';
  end if;

  if not coalesce(p_accept, false) then
    delete from public.friendships where id = req.id;
    return;
  end if;

  if public.friend_count(me) >= 20 then
    raise exception 'respond_friend_request: friend limit' using errcode = 'P0001', hint = 'limit';
  end if;
  if public.friend_count(req.requester_id) >= 20 then
    raise exception 'respond_friend_request: their limit' using errcode = 'P0001', hint = 'their_limit';
  end if;

  update public.friendships
    set status = 'accepted', accepted_at = now()
    where id = req.id;
end;
$$;

-- ── remove_friendship ───────────────────────────────────────────────────────
--
-- Remove a friend, or cancel a request you sent. Either side of an accepted
-- friendship may remove it; a pending request is cancelled by its sender and
-- declined (respond_friend_request) by its addressee. Hint: missing.

create or replace function public.remove_friendship(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'remove_friendship: not signed in' using errcode = '42501';
  end if;

  delete from public.friendships f
  where f.id = p_id
    and (
      (f.status = 'accepted' and me in (f.requester_id, f.addressee_id))
      or (f.status = 'pending' and f.requester_id = me)
    );
  if not found then
    raise exception 'remove_friendship: nothing to remove' using errcode = 'P0001', hint = 'missing';
  end if;
end;
$$;

-- ── my_friends ──────────────────────────────────────────────────────────────
--
-- Every friendship row you are in, with the other student's name and, for an
-- accepted friend, the days THEY met the goal since you became friends (at
-- most 400 back). The caller's own days come from their device, which is
-- fresher than the copy here.
--
-- `since` is the Phnom Penh date of acceptance: the first day the pair's
-- streak can count. p_today is the client's local date (day keys are local
-- dates, see utils/day.ts), clamped to within a day of the server's, as in
-- leaderboard().

create or replace function public.my_friends(p_today date)
returns table (
  id            uuid,
  other_id      uuid,
  display_name  text,
  status        text,
  outgoing      boolean,
  since         date,
  goal_days     date[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select least(
      greatest(coalesce(p_today, current_date), current_date - 1),
      current_date + 1
    ) as today
  ),
  mine as (
    select
      f.id,
      case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end as other_id,
      f.status,
      f.requester_id = (select auth.uid()) as outgoing,
      case when f.status = 'accepted'
        then (f.accepted_at at time zone 'Asia/Phnom_Penh')::date end as since,
      f.created_at
    from public.friendships f
    where (select auth.uid()) in (f.requester_id, f.addressee_id)
  )
  select
    m.id,
    m.other_id,
    btrim(coalesce(p.display_name, '')),
    m.status,
    m.outgoing,
    m.since,
    case when m.status = 'accepted' then coalesce((
      select array_agg(a.activity_date order by a.activity_date)
      from public.daily_activity a, bounds b
      where a.user_id = m.other_id
        and a.task_lesson and a.task_practice and a.task_flashcards
        and a.activity_date >= greatest(m.since, b.today - 400)
        and a.activity_date <= b.today
    ), '{}'::date[]) else '{}'::date[] end
  from mine m
  left join public.profiles p on p.id = m.other_id
  order by m.created_at;
$$;

-- Signed-in students only.
revoke all on function public.search_students(text) from public, anon;
revoke all on function public.send_friend_request(uuid) from public, anon;
revoke all on function public.respond_friend_request(uuid, boolean) from public, anon;
revoke all on function public.remove_friendship(uuid) from public, anon;
revoke all on function public.my_friends(date) from public, anon;
grant execute on function public.search_students(text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_friendship(uuid) to authenticated;
grant execute on function public.my_friends(date) to authenticated;

commit;

-- ============================================================================
-- BrachNha — error reports and usage events
-- ============================================================================
--
-- Two questions the app could not answer before this: "did a student hit a
-- crash?" and "do students come back?". Both are stored HERE, in our own
-- project, rather than with a third-party vendor (the user's call, 1 Oct 2026):
-- no new account, no new key, no new place student data goes.
--
-- WRITE-ONLY FROM THE CLIENT, THROUGH TWO FUNCTIONS. Both tables have RLS on and
-- NO client policies at all, so nothing can be read back over the REST API and
-- nothing can be inserted except through log_client_error() / log_event(),
-- which cap sizes and rates. Read them in the dashboard (SQL editor or Table
-- Editor, as the project owner); supabase/README.md has ready-made queries.
--
-- WHAT IS NOT COLLECTED: no message content, no answers, no KruAI text, no
-- email. An error carries its message, stack, the route and the browser string;
-- an event carries its name and a few small numbers (props, 1KB at most).
--
-- Both cascade on account deletion (20261001000002), like every other table.
--
-- Re-runnable.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- client_errors
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_errors (
  id          bigint generated always as identity primary key,
  -- Null for a guest: their crashes are reported too, since a guest is exactly
  -- the student most likely to leave silently after one.
  user_id     uuid references auth.users (id) on delete cascade,
  message     text not null check (char_length(message) <= 500),
  stack       text check (char_length(stack) <= 4000),
  route       text check (char_length(route) <= 200),
  app_version text check (char_length(app_version) <= 40),
  user_agent  text check (char_length(user_agent) <= 300),
  created_at  timestamptz not null default now()
);

create index if not exists client_errors_created_idx
  on public.client_errors (created_at desc);
create index if not exists client_errors_user_idx
  on public.client_errors (user_id, created_at desc);

alter table public.client_errors enable row level security;

create or replace function public.log_client_error(
  p_message text,
  p_stack   text,
  p_route   text,
  p_version text,
  p_ua      text
)
returns void
language plpgsql
security definer
-- Empty search_path and every name schema-qualified, as in kruai_take().
set search_path = ''
as $$
declare
  -- A crash loop on one device must not fill the table. Over the cap the call
  -- is DROPPED quietly rather than raising: the client is already in trouble
  -- and must not get a second error from reporting the first.
  per_user_hour constant integer := 20;
  anon_hour     constant integer := 200;
  uid  uuid := auth.uid();
  seen integer;
begin
  if p_message is null or char_length(p_message) = 0 then
    return;
  end if;

  if uid is null then
    select count(*) into seen from public.client_errors e
    where e.user_id is null and e.created_at > now() - interval '1 hour';
    if seen >= anon_hour then return; end if;
  else
    select count(*) into seen from public.client_errors e
    where e.user_id = uid and e.created_at > now() - interval '1 hour';
    if seen >= per_user_hour then return; end if;
  end if;

  insert into public.client_errors (user_id, message, stack, route, app_version, user_agent)
  values (
    uid,
    left(p_message, 500),
    left(p_stack, 4000),
    left(p_route, 200),
    left(p_version, 40),
    left(p_ua, 300)
  );
end;
$$;

revoke all on function public.log_client_error(text, text, text, text, text) from public;
-- anon too, deliberately: a guest's crash is worth knowing about. The caps
-- above are what make that safe.
grant execute on function public.log_client_error(text, text, text, text, text) to anon;
grant execute on function public.log_client_error(text, text, text, text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- app_events
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.app_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  props      jsonb not null default '{}'::jsonb,
  -- The day in Phnom Penh, so "daily active" means a Cambodian day.
  event_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists app_events_user_idx
  on public.app_events (user_id, created_at desc);
create index if not exists app_events_name_idx
  on public.app_events (name, event_date);

alter table public.app_events enable row level security;

create or replace function public.log_event(p_name text, p_props jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  per_user_day constant integer := 500;
  uid   uuid := auth.uid();
  today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  seen  integer;
begin
  if uid is null then
    raise exception 'log_event: not signed in' using errcode = '42501';
  end if;

  -- The allow-list. A name outside it is refused, so the table only ever holds
  -- events somebody decided to measure. Keep in step with src/lib/telemetry.ts.
  if p_name not in (
    'app_open', 'sign_up', 'survey_done', 'lesson_done', 'quiz_done',
    'flashcards_done', 'exam_done', 'kruai_question', 'battle_done'
  ) then
    raise exception 'log_event: unknown event' using errcode = '22023';
  end if;

  if p_props is not null and octet_length(p_props::text) > 1024 then
    raise exception 'log_event: props too large' using errcode = '22023';
  end if;

  -- app_open once per student per day: its count IS daily active users.
  if p_name = 'app_open' and exists (
    select 1 from public.app_events e
    where e.user_id = uid and e.name = 'app_open' and e.event_date = today
  ) then
    return;
  end if;

  select count(*) into seen from public.app_events e
  where e.user_id = uid and e.event_date = today;
  if seen >= per_user_day then
    return;
  end if;

  insert into public.app_events (user_id, name, props, event_date)
  values (uid, p_name, coalesce(p_props, '{}'::jsonb), today);
end;
$$;

revoke all on function public.log_event(text, jsonb) from public;
revoke all on function public.log_event(text, jsonb) from anon;
grant execute on function public.log_event(text, jsonb) to authenticated;

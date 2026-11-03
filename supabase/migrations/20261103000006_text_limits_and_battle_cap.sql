-- ============================================================================
-- BrachNha: how long a student's text can be, and 20 new Battles a day
-- ============================================================================
--
-- THE HOLE. Most of what a student writes had no length limit in the database. The
-- app's screens keep normal students short, but anyone calling the database directly
-- could set a name of a million letters, and everyone opening the leaderboard would
-- download it on their mobile data. Nothing capped Battles either, so a script could
-- fill the list other students browse.
--
-- TOO-LONG TEXT IS CUT, NOT REFUSED. This is the decision to keep. Sync failures are
-- silent (`attempt` in lib/supabase-sync.ts only logs them), so a check that refused
-- a long Google name would stop that student's whole profile saving, XP and streak
-- included, with nothing on screen. Worse, chat sync deletes a conversation's messages
-- and then re-inserts them, so one refused message would lose the whole conversation
-- from the account. Cutting has no such failure.
--
-- IDS AND KEYS ARE REFUSED. Cutting one would point it at something else, and the app
-- only ever makes short ones, so only a forged row can reach these limits. NOT VALID
-- means rows already there are not checked, so this cannot fail on existing data.
--
-- Every limit is far above real use. Measured from the app: a drawn signature is at
-- most 2500 points (about 35000 characters), a KruAI reply at most 3000 tokens, a chat
-- title 44 characters, and all the keys under 120.
--
-- THE TABLES NOT HERE already have limits: the study-progress tables, simulation
-- attempts, mistakes and reports have checks; errors and events are clipped by their
-- functions; Battles and attempts go through functions that store only checked data.
--
-- NOT COVERED: how MANY rows a student can write to their own tables. Those rows are
-- only ever read by that student, and nobody else sees them.
--
-- ORDER DOES NOT MATTER. The app and this migration work in either order: until this
-- lands the app simply never sees the new limit, and an older open tab shows a refused
-- Battle as "not shared yet", which shares by itself on a later visit.
--
-- Re-runnable.
-- ============================================================================

begin;

-- ── Cutting free text ───────────────────────────────────────────────────────

create or replace function public.limit_profile_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.display_name := pg_catalog.left(new.display_name, 40);
  new.email := pg_catalog.left(new.email, 320);
  new.location := pg_catalog.left(new.location, 100);
  new.grade := pg_catalog.left(new.grade, 100);
  new.active_conversation_id := pg_catalog.left(new.active_conversation_id, 100);
  -- The survey's own lists are short. array(...) keeps their order.
  new.strengths := array(
    select pg_catalog.left(x, 100)
    from pg_catalog.unnest(new.strengths) with ordinality as t (x, i)
    order by i limit 50
  );
  new.weaknesses := array(
    select pg_catalog.left(x, 100)
    from pg_catalog.unnest(new.weaknesses) with ordinality as t (x, i)
    order by i limit 50
  );
  return new;
end;
$$;

create or replace function public.limit_commitment_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.signature := pg_catalog.left(new.signature, 60000);
  new.grade := pg_catalog.left(new.grade, 100);
  new.months := pg_catalog.left(new.months, 100);
  return new;
end;
$$;

create or replace function public.limit_conversation_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.title := pg_catalog.left(new.title, 200);
  return new;
end;
$$;

create or replace function public.limit_chat_message_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.content := pg_catalog.left(new.content, 30000);
  return new;
end;
$$;

-- Fired by the table, never called. Same hardening as handle_new_user.
revoke all on function public.limit_profile_text() from public, anon, authenticated;
revoke all on function public.limit_commitment_text() from public, anon, authenticated;
revoke all on function public.limit_conversation_text() from public, anon, authenticated;
revoke all on function public.limit_chat_message_text() from public, anon, authenticated;

drop trigger if exists profiles_limit_text on public.profiles;
create trigger profiles_limit_text
  before insert or update on public.profiles
  for each row execute function public.limit_profile_text();

drop trigger if exists commitments_limit_text on public.commitments;
create trigger commitments_limit_text
  before insert or update on public.commitments
  for each row execute function public.limit_commitment_text();

drop trigger if exists conversations_limit_text on public.conversations;
create trigger conversations_limit_text
  before insert or update on public.conversations
  for each row execute function public.limit_conversation_text();

drop trigger if exists chat_messages_limit_text on public.chat_messages;
create trigger chat_messages_limit_text
  before insert or update on public.chat_messages
  for each row execute function public.limit_chat_message_text();

-- ── Refusing long ids and keys ──────────────────────────────────────────────

alter table public.conversations drop constraint if exists conversations_id_length;
alter table public.conversations add constraint conversations_id_length
  check (char_length(id) <= 100) not valid;

alter table public.completed_sessions drop constraint if exists completed_sessions_lesson_length;
alter table public.completed_sessions add constraint completed_sessions_lesson_length
  check (char_length(lesson_id) <= 200) not valid;

alter table public.daily_content_activity drop constraint if exists daily_content_key_length;
alter table public.daily_content_activity add constraint daily_content_key_length
  check (char_length(content_key) <= 200) not valid;

alter table public.exam_results drop constraint if exists exam_results_subject_length;
alter table public.exam_results add constraint exam_results_subject_length
  check (char_length(subject) <= 100) not valid;

alter table public.pending_placement_tests drop constraint if exists pending_placement_subject_length;
alter table public.pending_placement_tests add constraint pending_placement_subject_length
  check (char_length(subject) <= 100) not valid;

-- ── Names already too long ──────────────────────────────────────────────────
-- Other students read these, so they are shortened now rather than on the next save.
-- The profiles update only touches a name over the limit; its trigger does the cut.

update public.profiles set display_name = display_name where char_length(display_name) > 40;
update public.competitions set creator_name = left(creator_name, 40) where char_length(creator_name) > 40;
update public.competition_attempts set user_name = left(user_name, 40) where char_length(user_name) > 40;

-- ── 20 new Battles a day ────────────────────────────────────────────────────
-- The rest of this function is unchanged from 20261103000005, so its grants stand.

create or replace function public.post_competition(
  p_id         text,
  p_subject    text,
  p_difficulty text,
  p_minutes    integer,
  p_questions  jsonb,
  p_answers    jsonb,
  p_ms         integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me       uuid := auth.uid();
  n        integer;
  i        integer;
  question jsonb;
  words    text;
  found    jsonb;
  answer   jsonb;
  stored   jsonb := '[]'::jsonb;
  score    integer := 0;
  today    timestamptz := (now() at time zone 'Asia/Phnom_Penh')::date at time zone 'Asia/Phnom_Penh';
begin
  -- A real account with a name: the same test finding a friend uses.
  if me is null or not public.friend_eligible(me) then
    raise exception 'post_competition: not signed in' using errcode = '42501', hint = 'not_signed_in';
  end if;
  if p_id is null or p_id !~ '^[A-Za-z0-9-]{1,100}$' then
    raise exception 'post_competition: bad id' using errcode = '22023', hint = 'bad_id';
  end if;

  -- At most 20 new Battles per Phnom Penh day. One at a time per student, or a script
  -- sending many at once would all count the same total and all pass. A Battle already
  -- up there falls through to the duplicate error, which the app reads as shared.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text, 0));
  if not exists (select 1 from public.competitions c where c.id = p_id)
     and (select count(*) from public.competitions c
          where c.creator_id = me and c.created_at >= today) >= 20 then
    raise exception 'post_competition: too many today' using errcode = 'P0001', hint = 'too_many';
  end if;

  if jsonb_typeof(p_questions) is distinct from 'array'
     or jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception 'post_competition: bad shape' using errcode = '22023', hint = 'bad_shape';
  end if;
  n := jsonb_array_length(p_questions);
  if n not between 1 and 50 or jsonb_array_length(p_answers) <> n then
    raise exception 'post_competition: bad length' using errcode = '22023', hint = 'bad_shape';
  end if;

  for i in 0 .. n - 1 loop
    question := p_questions -> i;
    words := question -> 'q' ->> 'km';

    -- In a published pool, word for word. The newest version it appears in wins.
    -- A question in an older pool may be a pair of texts rather than one.
    select item into found
    from public.content_versions v
    cross join lateral jsonb_array_elements(v.body) as item
    where v.kind = 'game'
      and v.key = p_subject
      and case
            when jsonb_typeof(item -> 'q') = 'string' then item ->> 'q'
            else item -> 'q' ->> 'km'
          end = words
      and item -> 'options' = question -> 'options'
      and item ->> 'correct' = question ->> 'correct'
    order by v.version desc
    limit 1;

    if found is null then
      raise exception 'post_competition: not a published question' using errcode = '22023', hint = 'unknown_question';
    end if;

    -- A picked option, or null where the clock ran out. Nothing else.
    answer := p_answers -> i;
    if jsonb_typeof(answer) = 'string' then
      if not (found -> 'options') @> answer then
        raise exception 'post_competition: answer is not an option' using errcode = '22023', hint = 'bad_answer';
      end if;
      if answer #>> '{}' = found ->> 'correct' then
        score := score + 1;
      end if;
    elsif jsonb_typeof(answer) is distinct from 'null' then
      raise exception 'post_competition: answer is not an option' using errcode = '22023', hint = 'bad_answer';
    end if;

    -- The pool's copy, in the shape the app freezes.
    stored := stored || jsonb_build_array(
      jsonb_strip_nulls(jsonb_build_object(
        'q', jsonb_build_object('en', words, 'km', words),
        'options', found -> 'options',
        'correct', found -> 'correct',
        'difficulty', found -> 'difficulty',
        'explanation', found -> 'explanation'
      ))
    );
  end loop;

  insert into public.competitions (
    id, creator_id, creator_name, subject, difficulty, minutes,
    questions, creator_answers, creator_score, creator_ms, total, created_at
  )
  select
    p_id, me, btrim(p.display_name), p_subject, p_difficulty, p_minutes,
    stored, p_answers, score,
    least(greatest(coalesce(p_ms, 0), 0), p_minutes * 60000),
    n, now()
  from public.profiles p
  where p.id = me;
end;
$$;

commit;

-- What the SQL editor shows afterwards: true, if the triggers and the cap are in place.
select
  (select count(*) from pg_catalog.pg_trigger where tgname in (
     'profiles_limit_text', 'commitments_limit_text',
     'conversations_limit_text', 'chat_messages_limit_text'
   )) = 4
  and pg_catalog.pg_get_functiondef('public.post_competition(text, text, text, integer, jsonb, jsonb, integer)'::pg_catalog.regprocedure) like '%too_many%'
  as limits_in_place;

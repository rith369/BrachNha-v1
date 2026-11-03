-- ============================================================================
-- BrachNha: Battles can only be written through a function that checks them
-- ============================================================================
--
-- THE HOLE. `competitions` and `competition_attempts` took a student's row as it
-- came, checking only that it was under their own account. The app sends questions
-- from the published pool, but anyone calling the database directly could post any
-- question text, any creator name and any score, and other students would read it.
-- Most of these students are under 18, so that is a way to bully someone in the app
-- under an official-looking name.
--
-- THE FIX. No client can insert into either table any more. These two functions are
-- the only way in:
--   post_competition          every question must be one from a published pool for
--                             that subject, and the stored copy is the POOL's, not
--                             the sender's. Answers must be options of the question.
--   post_competition_attempt  answers must be options of the competition's questions.
-- Both take the name from the student's own profile, work the score out themselves,
-- hold the time inside the budget and stamp the time from the server.
--
-- ANY PUBLISHED VERSION OF THE POOL COUNTS, not just the newest, because a Battle
-- is played first and shared after, and a fix may be published in between.
--
-- A DISPLAY NAME IS STILL FREE TEXT. A student chooses their own, and it shows on
-- the leaderboard too. This closes the text they could put in QUESTIONS, ANSWERS and
-- someone else's name; it is not moderation of names.
--
-- APPLY THIS BEFORE THE APP THAT CALLS IT. Until the new app is live an open tab's
-- insert is refused, and the student's Battle waits as "not shared yet" on their
-- phone, then shares by itself on a later visit. Nothing is lost.
--
-- Rows already posted are left alone: they are not rechecked or deleted here.
-- ============================================================================

begin;

drop policy if exists "competitions: insert own" on public.competitions;
drop policy if exists "competition_attempts: insert own" on public.competition_attempts;

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
begin
  -- A real account with a name: the same test finding a friend uses.
  if me is null or not public.friend_eligible(me) then
    raise exception 'post_competition: not signed in' using errcode = '42501', hint = 'not_signed_in';
  end if;
  if p_id is null or p_id !~ '^[A-Za-z0-9-]{1,100}$' then
    raise exception 'post_competition: bad id' using errcode = '22023', hint = 'bad_id';
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

create or replace function public.post_competition_attempt(
  p_competition text,
  p_answers     jsonb,
  p_ms          integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me        uuid := auth.uid();
  questions jsonb;
  creator   uuid;
  budget    integer;
  n         integer;
  i         integer;
  answer    jsonb;
  score     integer := 0;
begin
  if me is null or not public.friend_eligible(me) then
    raise exception 'post_competition_attempt: not signed in' using errcode = '42501', hint = 'not_signed_in';
  end if;

  select c.questions, c.creator_id, c.minutes into questions, creator, budget
  from public.competitions c
  where c.id = p_competition;

  if questions is null then
    raise exception 'post_competition_attempt: no such competition' using errcode = '22023', hint = 'missing';
  end if;
  if creator = me then
    raise exception 'post_competition_attempt: your own competition' using errcode = '22023', hint = 'own';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array'
     or jsonb_typeof(questions) is distinct from 'array'
     or jsonb_array_length(p_answers) <> jsonb_array_length(questions) then
    raise exception 'post_competition_attempt: bad shape' using errcode = '22023', hint = 'bad_shape';
  end if;

  n := jsonb_array_length(questions);
  for i in 0 .. n - 1 loop
    answer := p_answers -> i;
    if jsonb_typeof(answer) = 'string' then
      if jsonb_typeof(questions -> i -> 'options') is distinct from 'array'
         or not (questions -> i -> 'options') @> answer then
        raise exception 'post_competition_attempt: answer is not an option' using errcode = '22023', hint = 'bad_answer';
      end if;
      if answer #>> '{}' = questions -> i ->> 'correct' then
        score := score + 1;
      end if;
    elsif jsonb_typeof(answer) is distinct from 'null' then
      raise exception 'post_competition_attempt: answer is not an option' using errcode = '22023', hint = 'bad_answer';
    end if;
  end loop;

  -- unique (competition_id, user_id) still refuses a second attempt, with 23505,
  -- which the app already reads as "you already played this".
  insert into public.competition_attempts (
    competition_id, user_id, user_name, score, ms, answers, played_at
  )
  select
    p_competition, me, btrim(p.display_name), score,
    least(greatest(coalesce(p_ms, 0), 0), budget * 60000),
    p_answers, now()
  from public.profiles p
  where p.id = me;
end;
$$;

revoke all on function public.post_competition(text, text, text, integer, jsonb, jsonb, integer) from public, anon;
revoke all on function public.post_competition_attempt(text, jsonb, integer) from public, anon;
grant execute on function public.post_competition(text, text, text, integer, jsonb, jsonb, integer) to authenticated;
grant execute on function public.post_competition_attempt(text, jsonb, integer) to authenticated;

commit;

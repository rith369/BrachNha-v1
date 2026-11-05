-- ============================================================================
-- BrachNha: the 20 Battles a day limit counts from midnight in Phnom Penh
-- ============================================================================
--
-- THE BUG, in 20261103000006. "The start of today" was written as
--
--   (now() at time zone 'Asia/Phnom_Penh')::date at time zone 'Asia/Phnom_Penh'
--
-- which looks right and is not. A date has no AT TIME ZONE of its own, so it is first made a
-- timestamptz at midnight in the SERVER's zone, UTC, and that is then read as Phnom Penh time.
-- The result is 07:00 UTC, which is 14:00 in Phnom Penh.
--
-- So before 14:00 each day, "today" was still in the future, nothing counted, and THERE WAS NO
-- LIMIT. After 14:00 only Battles since 14:00 counted. Found on 5 Nov 2026, when the permanent
-- tests first ran in a Phnom Penh morning. The test had the same line in it, and every earlier
-- run happened to be in the afternoon, so it passed.
--
-- THE FIX is ::timestamp, which has no zone and so can be given one. Nothing else in the schema
-- has this: every other day check compares dates with dates.
--
-- ORDER DOES NOT MATTER. There is no app change.
--
-- Re-runnable. The rest of the function is unchanged, so its grants stand.
-- ============================================================================

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
  -- ::timestamp matters. A date goes through AT TIME ZONE as a timestamptz in the server's
  -- own zone, which comes out seven hours late. See the top of 20261105000001.
  today    timestamptz := (now() at time zone 'Asia/Phnom_Penh')::date::timestamp at time zone 'Asia/Phnom_Penh';
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

-- What the SQL editor shows afterwards: true, if the fixed line is in place.
select pg_catalog.pg_get_functiondef('public.post_competition(text, text, text, integer, jsonb, jsonb, integer)'::pg_catalog.regprocedure) like '%::date::timestamp at time zone%'
  as cap_fixed;

-- ============================================================================
-- BrachNha — game questions carry ONE text, in the subject's language
-- ============================================================================
--
-- The user's rule: content is Khmer, except the English subject, whose content
-- is English. It is never translated. 20261007000001 stored each game question's
-- text as a pair, { en, km }, carrying over English versions an earlier session
-- had added to the code, and its check REQUIRED both. That broke the rule.
--
-- This migration:
--
--   1. redefines content_game_question_problem: `q` is ONE string, checked by
--      the quiz rules (content_choice_problem), like a practice quiz question;
--
--   2. republishes every game pool whose current version still has a pair,
--      keeping only the Khmer text (`q.km`), as a new version. Older versions
--      stay as they are, never changed, like every published version;
--
--   3. converts any saved draft that still has a pair the same way.
--
-- Nothing else changes: the ids, options, answers, explanations and levels are
-- kept exactly, and a Battle already created keeps the questions it froze.
--
-- Re-runnable: a pool or draft already in one language is left alone. One
-- transaction. Apply AFTER 20261007000001.
-- ============================================================================

begin;

-- One Battle question. Null when fine, otherwise what is wrong.
create or replace function public.content_game_question_problem(p_el jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if jsonb_typeof(p_el -> 'q') is distinct from 'string' then
    return 'the question text must be one text, in the subject''s language';
  end if;
  if p_el -> 'difficulty' is not null and jsonb_typeof(p_el -> 'difficulty') <> 'null'
     and (jsonb_typeof(p_el -> 'difficulty') <> 'string'
          or (p_el ->> 'difficulty') not in ('easy', 'medium', 'hard')) then
    return 'the difficulty must be easy, medium or hard';
  end if;
  -- The question text, options, the answer among them and the explanation:
  -- the quiz rules.
  return public.content_choice_problem(p_el, 'q');
end;
$$;

revoke all on function public.content_game_question_problem(jsonb) from public, anon, authenticated;

-- A body with every pair replaced by its Khmer text. Used only below.
create or replace function pg_temp.game_one_language(p_body jsonb)
returns jsonb
language sql
immutable
as $$
  select coalesce(jsonb_agg(
    case when jsonb_typeof(e.value -> 'q') = 'object'
      then jsonb_set(e.value, '{q}', coalesce(e.value -> 'q' -> 'km', to_jsonb(''::text)))
      else e.value
    end
    order by e.ordinality
  ), '[]'::jsonb)
  from jsonb_array_elements(p_body) with ordinality as e(value, ordinality);
$$;

-- 2. Republish each pool whose current version still has a pair.
do $$
declare
  r record;
begin
  for r in
    select i.key, v.body
    from public.content_items i
    join public.content_versions v
      on v.kind = i.kind and v.key = i.key and v.version = i.version
    where i.kind = 'game'
      and i.version is not null
      and jsonb_typeof(v.body) = 'array'
      and exists (
        select 1 from jsonb_array_elements(v.body) e
        where jsonb_typeof(e.value -> 'q') = 'object'
      )
  loop
    perform public.content_publish_body('game', r.key, pg_temp.game_one_language(r.body));
  end loop;
end;
$$;

-- 3. Convert saved drafts the same way.
update public.content_drafts d
set body = pg_temp.game_one_language(d.body)
where d.kind = 'game'
  and jsonb_typeof(d.body) = 'array'
  and exists (
    select 1 from jsonb_array_elements(d.body) e
    where jsonb_typeof(e.value -> 'q') = 'object'
  );

commit;

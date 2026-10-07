-- ============================================================================
-- BrachNha — Battle questions, stored in the database
-- ============================================================================
--
-- The fifth kind in content_items / content_versions / content_drafts, after
-- decks and quizzes (20261003000001) and lesson sections and past papers
-- (20261003000002):
--
--   game     one subject's pool of Battle questions, key "math" (the subject
--            id alone). The body is a LIST, like a quiz:
--              { id: "q3", q: { en, km }, options, correct,
--                difficulty?: "easy" | "medium" | "hard", explanation }
--            A Battle draws its questions from the pool when it is created and
--            FREEZES them on the competition row, so editing a pool changes
--            new Battles only, never one already being played.
--
-- The question text is a PAIR, unlike a past paper's single string: the Battle
-- page follows the app's language, and these questions carry real English and
-- Khmer wording.
--
-- Only the helpers that name kinds change (the kind CHECKs, content_key_ok,
-- content_item_ids, content_count, content_draft_problem and
-- content_body_problem), redefined with the SAME SIGNATURES. The list, get,
-- save, publish and import functions call them and need no edit. Decks,
-- quizzes, sections and papers behave exactly as before.
--
-- An app that predates this ignores the new kind in its manifest, so publishing
-- a pool before the code that reads it ships changes nothing on a phone.
--
-- As before, the SQL checks SHAPE; the rich checks (KaTeX, Khmer digits, em
-- dashes) run in the editor and in check:content (src/utils/content-check.ts).
--
-- Re-runnable. One transaction. Apply AFTER 20261003000002.
-- ============================================================================

begin;

-- ── The kinds ───────────────────────────────────────────────────────────────

-- Drop whatever kind CHECK is there (found by its text, so a re-run also drops
-- the one this file adds) and add the five-kind one.
do $$
declare
  r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    where c.contype = 'c'
      and c.conrelid in (
        'public.content_items'::regclass,
        'public.content_versions'::regclass,
        'public.content_drafts'::regclass
      )
      and pg_get_constraintdef(c.oid) like '%''deck''%'
      and pg_get_constraintdef(c.oid) not like '%content_key_ok%'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end;
$$;

alter table public.content_items
  add constraint content_items_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper', 'game'));
alter table public.content_versions
  add constraint content_versions_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper', 'game'));
alter table public.content_drafts
  add constraint content_drafts_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper', 'game'));

-- A game key is a subject id alone.
create or replace function public.content_key_ok(p_kind text, p_key text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_kind
    when 'deck' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]?-[1-9][0-9]?$', false)
    when 'quiz' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]?-[1-9][0-9]?(-[1-9][0-9]?)?$', false)
    when 'section' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]?-[1-9][0-9]?-[1-9][0-9]?$', false)
    when 'paper' then coalesce(p_key ~ '^20[0-9]{2}-(math|physics|chemistry|biology|history|khmer|english|french)$', false)
    when 'game' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)$', false)
    else false
  end;
$$;

-- ── Kind-aware helpers: a game pool is a list, like a deck or a quiz ────────

create or replace function public.content_item_ids(p_kind text, p_body jsonb)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  ids  text[] := '{}';
  lst  text;
  part jsonb;
begin
  if p_body is null then
    return ids;
  end if;
  if p_kind in ('deck', 'quiz', 'game') then
    if jsonb_typeof(p_body) <> 'array' then
      return ids;
    end if;
    return coalesce((
      select array_agg(e.value ->> 'id' order by e.ordinality)
      from jsonb_array_elements(p_body) with ordinality as e(value, ordinality)
    ), '{}');
  end if;
  if jsonb_typeof(p_body) <> 'object' then
    return ids;
  end if;
  if p_kind = 'section' then
    foreach lst in array array['quiz', 'quizHarder'] loop
      if jsonb_typeof(p_body -> lst) = 'array' then
        ids := ids || coalesce((
          select array_agg(e.value ->> 'id' order by e.ordinality)
          from jsonb_array_elements(p_body -> lst) with ordinality as e(value, ordinality)
        ), '{}');
      end if;
    end loop;
  elsif p_kind = 'paper' and jsonb_typeof(p_body -> 'sections') = 'array' then
    for part in select value from jsonb_array_elements(p_body -> 'sections') loop
      if jsonb_typeof(part -> 'questions') = 'array' then
        ids := ids || coalesce((
          select array_agg(e.value ->> 'id' order by e.ordinality)
          from jsonb_array_elements(part -> 'questions') with ordinality as e(value, ordinality)
        ), '{}');
      end if;
      if jsonb_typeof(part -> 'gapFill' -> 'gaps') = 'array' then
        ids := ids || coalesce((
          select array_agg(e.value ->> 'id' order by e.ordinality)
          from jsonb_array_elements(part -> 'gapFill' -> 'gaps') with ordinality as e(value, ordinality)
        ), '{}');
      end if;
    end loop;
  end if;
  return ids;
end;
$$;

create or replace function public.content_count(p_kind text, p_body jsonb)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  total integer := 0;
  lst   text;
  part  jsonb;
begin
  if p_body is null then
    return 0;
  end if;
  if p_kind in ('deck', 'quiz', 'game') then
    return case when jsonb_typeof(p_body) = 'array' then jsonb_array_length(p_body) else 0 end;
  end if;
  if jsonb_typeof(p_body) <> 'object' then
    return 0;
  end if;
  if p_kind = 'section' then
    foreach lst in array array['quiz', 'quizHarder'] loop
      if jsonb_typeof(p_body -> lst) = 'array' then
        total := total + jsonb_array_length(p_body -> lst);
      end if;
    end loop;
  elsif p_kind = 'paper' and jsonb_typeof(p_body -> 'sections') = 'array' then
    for part in select value from jsonb_array_elements(p_body -> 'sections') loop
      if jsonb_typeof(part -> 'questions') = 'array' then
        total := total + jsonb_array_length(part -> 'questions');
      end if;
      if jsonb_typeof(part -> 'gapFill' -> 'gaps') = 'array' then
        total := total + (
          select count(*)::integer
          from jsonb_array_elements(part -> 'gapFill' -> 'gaps') g
          where not coalesce(g.value -> 'example' = 'true'::jsonb, false)
        );
      end if;
    end loop;
  end if;
  return total;
end;
$$;

-- A DRAFT only has to be the right type with unique ids.
create or replace function public.content_draft_problem(p_kind text, p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  el  jsonb;
  ids text[] := '{}';
  pos integer := 0;
begin
  if p_body is null then
    return 'the body is missing';
  end if;
  if pg_column_size(p_body) > 1000000 then
    return 'the body is too large';
  end if;

  if p_kind in ('deck', 'quiz', 'game') then
    if jsonb_typeof(p_body) <> 'array' then
      return 'the body is not a list';
    end if;
    if jsonb_array_length(p_body) > 300 then
      return 'more than 300 items';
    end if;
    for el in select value from jsonb_array_elements(p_body) loop
      pos := pos + 1;
      if jsonb_typeof(el) <> 'object' or jsonb_typeof(el -> 'id') is distinct from 'string'
         or char_length(el ->> 'id') not between 1 and 80 then
        return format('item %s has no id', pos);
      end if;
      if (el ->> 'id') = any (ids) then
        return format('id %s is used twice', el ->> 'id');
      end if;
      ids := ids || (el ->> 'id');
    end loop;
    return null;
  end if;

  if p_kind not in ('section', 'paper') then
    return 'unknown kind';
  end if;
  if jsonb_typeof(p_body) <> 'object' then
    return 'the body is not an object';
  end if;
  ids := public.content_item_ids(p_kind, p_body);
  if exists (select 1 from unnest(ids) x where x is null or char_length(x) not between 1 and 80) then
    return 'a question has no id';
  end if;
  if (select count(*) from unnest(ids)) <> (select count(distinct x) from unnest(ids) x) then
    return 'an id is used twice';
  end if;
  return null;
end;
$$;

-- One Battle question. Null when fine, otherwise what is wrong.
create or replace function public.content_game_question_problem(p_el jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if jsonb_typeof(p_el -> 'q') is distinct from 'object' then
    return 'the question text is missing';
  end if;
  if not public.content_str_ok(p_el -> 'q' -> 'en', 4000, true) then
    return 'the English question is missing or too long';
  end if;
  if not public.content_str_ok(p_el -> 'q' -> 'km', 4000, true) then
    return 'the Khmer question is missing or too long';
  end if;
  if p_el -> 'difficulty' is not null and jsonb_typeof(p_el -> 'difficulty') <> 'null'
     and (jsonb_typeof(p_el -> 'difficulty') <> 'string'
          or (p_el ->> 'difficulty') not in ('easy', 'medium', 'hard')) then
    return 'the difficulty must be easy, medium or hard';
  end if;
  -- Options, the answer among them and the explanation: the quiz rules, with
  -- the Khmer text standing in for the prompt (both were checked above).
  return public.content_choice_problem(p_el || jsonb_build_object('q', p_el -> 'q' -> 'km'), 'q');
end;
$$;

-- The full check, at publish and import.
create or replace function public.content_body_problem(p_kind text, p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  el      jsonb;
  ids     text[] := '{}';
  item_id text;
  pos     integer := 0;
  problem text;
begin
  if p_kind = 'section' then
    return public.content_section_problem(p_body);
  end if;
  if p_kind = 'paper' then
    return public.content_paper_problem(p_body);
  end if;

  if p_body is null or jsonb_typeof(p_body) <> 'array' then
    return 'the body is not a list';
  end if;
  if jsonb_array_length(p_body) > 300 then
    return 'more than 300 items';
  end if;
  if pg_column_size(p_body) > 1000000 then
    return 'the body is too large';
  end if;
  -- Decks and quizzes say this in the publish and import functions; a game
  -- pool says it here, so those functions need no edit.
  if p_kind = 'game' and jsonb_array_length(p_body) = 0 then
    return 'nothing to publish: the list is empty';
  end if;

  for el in select value from jsonb_array_elements(p_body) loop
    pos := pos + 1;
    if jsonb_typeof(el) <> 'object' then
      return format('item %s is not an object', pos);
    end if;
    if jsonb_typeof(el -> 'id') is distinct from 'string' then
      return format('item %s has no id', pos);
    end if;
    item_id := el ->> 'id';
    if item_id = any (ids) then
      return format('id %s is used twice', item_id);
    end if;
    ids := ids || item_id;

    if p_kind = 'deck' then
      if item_id !~ '^[a-z0-9-]{1,80}$' then
        return format('card %s: bad id', pos);
      end if;
      if not public.content_str_ok(el -> 'front', 2000, true) then
        return format('card %s: the front is empty or too long', pos);
      end if;
      if not public.content_str_ok(el -> 'back', 4000, true) then
        return format('card %s: the back is empty or too long', pos);
      end if;

    elsif p_kind = 'quiz' then
      if item_id !~ '^q[0-9]{1,4}$' then
        return format('question %s: bad id', pos);
      end if;
      problem := public.content_question_problem(el);
      if problem is not null then
        return format('question %s: %s', pos, problem);
      end if;

    elsif p_kind = 'game' then
      if item_id !~ '^q[0-9]{1,4}$' then
        return format('question %s: bad id', pos);
      end if;
      problem := public.content_game_question_problem(el);
      if problem is not null then
        return format('question %s: %s', pos, problem);
      end if;

    else
      return 'unknown kind';
    end if;
  end loop;

  return null;
end;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Helpers are for the security definer functions only, as before.

revoke all on function public.content_key_ok(text, text) from public, anon, authenticated;
revoke all on function public.content_item_ids(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_count(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_draft_problem(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_game_question_problem(jsonb) from public, anon, authenticated;
revoke all on function public.content_body_problem(text, jsonb) from public, anon, authenticated;

commit;

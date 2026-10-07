-- ============================================================================
-- BrachNha — lesson sections and past papers, stored in the database
-- ============================================================================
--
-- Stages 2 and 3 of docs/plans/sections-and-papers-in-database.md, step A.
-- Stage 1 (20261003000001_content_in_database.sql) moved flashcards and
-- practice quizzes into content_items / content_versions / content_drafts.
-- This adds two more kinds to the same tables and functions:
--
--   section  one node on a Study path, key "biology-3-1-1"
--            (subject-chapter-lesson-section). The body is the app's
--            SectionContent: title, an optional video and 3D model, the four
--            blocks (intro, examples, lesson, notes), the mistakes, and the
--            two quizzes (quiz on step 1, quizHarder on step 2). Every quiz
--            question carries a stable id ("q3"), unique across BOTH lists.
--
--   paper    one MoEYS past paper, key "2025-math" (year-subject). The body
--            is the app's PastPaperContent with the question text as ONE
--            string, plus `skills`: the drills its questions name, carried
--            with the paper. Question and gap ids ("l1", "g4") are unique
--            across the whole paper: a student's answers are kept under them.
--
-- BODIES ARE OBJECTS for these two kinds, where a deck or a quiz is a list.
-- So every place stage 1 measured a body with jsonb_array_length now asks two
-- kind-aware helpers instead:
--
--   content_count(kind, body)     cards, questions, a section's questions
--                                 (0 is allowed: a section need not ask any),
--                                 or a paper's scored questions and gaps
--   content_item_ids(kind, body)  the ids, in order, for item_ids and used_ids
--
-- The list, get, save, publish and import functions are redefined with the
-- SAME SIGNATURES, so the app's calls do not change and decks and quizzes
-- behave exactly as before.
--
-- Students are unaffected until step B: the app still reads sections and
-- papers from its code, and its manifest reader ignores kinds it does not
-- know, so a published section changes nothing on a phone yet.
--
-- As in stage 1, the SQL checks SHAPE at publish and import (types, lengths,
-- ids, `correct` among the options, a gap's answer in the word box, a named
-- skill that exists, a poster or model path of the right form); a draft only
-- needs unique ids. The rich checks (KaTeX, Khmer digits, em dashes, an SVG
-- the sanitizer would change) run in the editor and in check:content through
-- src/utils/content-check.ts.
--
-- Re-runnable. One transaction. Apply AFTER 20261003000001.
-- ============================================================================

begin;

-- ── The kinds ───────────────────────────────────────────────────────────────

-- The stage 1 tables carry an unnamed `kind in ('deck', 'quiz')` CHECK each.
-- Drop whatever kind CHECK is there (found by its text, so a re-run also
-- drops the one this file adds) and add the four-kind one.
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
  add constraint content_items_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper'));
alter table public.content_versions
  add constraint content_versions_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper'));
alter table public.content_drafts
  add constraint content_drafts_kind_ok check (kind in ('deck', 'quiz', 'section', 'paper'));

-- A section key is a Study path node: subject-chapter-lesson-section. A paper
-- key is an exam session and a subject: 2025-math.
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
    else false
  end;
$$;

-- ── Shape helpers ───────────────────────────────────────────────────────────

-- A whole number within [lo, hi]; null or absent is fine unless required.
create or replace function public.content_int_ok(v jsonb, lo integer, hi integer, required boolean)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when v is null or jsonb_typeof(v) = 'null' then not required
    when jsonb_typeof(v) <> 'number' then false
    else (v #>> '{}')::numeric = trunc((v #>> '{}')::numeric)
         and (v #>> '{}')::numeric between lo and hi
  end;
$$;

-- The help under a question, or one of a paper's skills: a label, the rule
-- in up to 20 lines, an optional common mistake, and up to 10 similar and 10
-- foundation exercises. Null when fine, otherwise what is wrong.
create or replace function public.content_help_problem(p_help jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  line jsonb;
  drill jsonb;
  problem text;
begin
  if jsonb_typeof(p_help) is distinct from 'object'
     or not public.content_str_ok(p_help -> 'label', 300, true) then
    return 'help needs a label';
  end if;
  if jsonb_typeof(p_help -> 'note') is distinct from 'array'
     or jsonb_array_length(p_help -> 'note') > 20 then
    return 'help note must be a list of up to 20 lines';
  end if;
  for line in select value from jsonb_array_elements(p_help -> 'note') loop
    if not public.content_str_ok(line, 2000, true) then
      return 'a help note line is empty or too long';
    end if;
  end loop;
  if not public.content_str_ok(p_help -> 'mistake', 2000, false) then
    return 'the common mistake is too long';
  end if;
  if jsonb_typeof(p_help -> 'questions') is distinct from 'array'
     or jsonb_array_length(p_help -> 'questions') > 10 then
    return 'help exercises must be a list of up to 10';
  end if;
  for drill in select value from jsonb_array_elements(p_help -> 'questions') loop
    problem := public.content_choice_problem(drill, 'prompt');
    if problem is not null then
      return 'exercise: ' || problem;
    end if;
  end loop;
  if p_help -> 'foundation' is not null and jsonb_typeof(p_help -> 'foundation') <> 'null' then
    if jsonb_typeof(p_help -> 'foundation') <> 'array'
       or jsonb_array_length(p_help -> 'foundation') > 10 then
      return 'foundation exercises must be a list of up to 10';
    end if;
    for drill in select value from jsonb_array_elements(p_help -> 'foundation') loop
      problem := public.content_choice_problem(drill, 'prompt');
      if problem is not null then
        return 'foundation exercise: ' || problem;
      end if;
    end loop;
  end if;
  return null;
end;
$$;

-- One practice question (a quiz's, or a section's): the optional situation,
-- the multiple choice, and the optional help. The id is the caller's.
create or replace function public.content_question_problem(p_el jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  problem text;
begin
  if not public.content_str_ok(p_el -> 'scenario', 4000, false) then
    return 'the scenario is too long';
  end if;
  problem := public.content_choice_problem(p_el, 'q');
  if problem is not null then
    return problem;
  end if;
  if p_el -> 'help' is not null and jsonb_typeof(p_el -> 'help') <> 'null' then
    return public.content_help_problem(p_el -> 'help');
  end if;
  return null;
end;
$$;

-- A whole lesson section. Null when fine, otherwise what is wrong.
create or replace function public.content_section_problem(p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v        jsonb;
  md       jsonb;
  blk      text;
  block    jsonb;
  it       jsonb;
  sub      jsonb;
  lst      text;
  q        jsonb;
  pos      integer;
  points   integer := 0;
  has_subs boolean;
  ids      text[] := '{}';
  problem  text;
begin
  if p_body is null or jsonb_typeof(p_body) <> 'object' then
    return 'the body is not an object';
  end if;
  if pg_column_size(p_body) > 1000000 then
    return 'the body is too large';
  end if;
  if not public.content_str_ok(p_body -> 'title', 300, true) then
    return 'the title is missing or too long';
  end if;

  -- The video: a poster the app ships, an optional length, and the YouTube
  -- id (11 characters, never a URL) once a recording exists.
  v := p_body -> 'video';
  if v is not null and jsonb_typeof(v) <> 'null' then
    if jsonb_typeof(v) <> 'object'
       or jsonb_typeof(v -> 'poster') is distinct from 'string'
       or (v ->> 'poster') !~ '^/sections/[a-z0-9-]{1,80}\.webp$' then
      return 'the video poster is not a picture the app has';
    end if;
    if not public.content_int_ok(v -> 'durationSec', 1, 36000, false) then
      return 'the video length is not a whole number of seconds';
    end if;
    if v -> 'youtubeId' is not null and jsonb_typeof(v -> 'youtubeId') <> 'null'
       and (jsonb_typeof(v -> 'youtubeId') <> 'string'
            or (v ->> 'youtubeId') !~ '^[A-Za-z0-9_-]{11}$') then
      return 'the YouTube id is not 11 characters';
    end if;
  end if;

  md := p_body -> 'model3d';
  if md is not null and jsonb_typeof(md) <> 'null' then
    if jsonb_typeof(md) <> 'object'
       or jsonb_typeof(md -> 'src') is distinct from 'string'
       or (md ->> 'src') !~ '^/models/[a-z0-9-]{1,80}\.glb$' then
      return 'the 3D model is not a file the app has';
    end if;
    if not public.content_str_ok(md -> 'credit', 500, true) then
      return 'the 3D model needs its credit';
    end if;
    if not public.content_str_ok(md -> 'title', 300, false) then
      return 'the 3D model caption is too long';
    end if;
  end if;

  -- The four blocks. Each is present; between them they hold at least one
  -- point. A point needs text, unless it has bold words and sub-points.
  foreach blk in array array['intro', 'examples', 'lesson', 'notes'] loop
    block := p_body -> blk;
    if block is null or jsonb_typeof(block) <> 'object' then
      return format('the %s block is missing', blk);
    end if;
    if not public.content_str_ok(block -> 'intro', 4000, false) then
      return format('%s: the opening paragraph is too long', blk);
    end if;
    if not public.content_str_ok(block -> 'outro', 4000, false) then
      return format('%s: the closing paragraph is too long', blk);
    end if;
    if block -> 'items' is not null and jsonb_typeof(block -> 'items') <> 'null' then
      if jsonb_typeof(block -> 'items') <> 'array'
         or jsonb_array_length(block -> 'items') > 60 then
        return format('%s: points must be a list of up to 60', blk);
      end if;
      pos := 0;
      for it in select value from jsonb_array_elements(block -> 'items') loop
        pos := pos + 1;
        if jsonb_typeof(it) <> 'object' then
          return format('%s point %s is not an object', blk, pos);
        end if;
        if not public.content_str_ok(it -> 'label', 300, false) then
          return format('%s point %s: the bold words are too long', blk, pos);
        end if;
        has_subs := false;
        if it -> 'items' is not null and jsonb_typeof(it -> 'items') <> 'null' then
          if jsonb_typeof(it -> 'items') <> 'array'
             or jsonb_array_length(it -> 'items') > 30 then
            return format('%s point %s: sub-points must be a list of up to 30', blk, pos);
          end if;
          for sub in select value from jsonb_array_elements(it -> 'items') loop
            if not public.content_str_ok(sub, 2000, true) then
              return format('%s point %s: a sub-point is empty or too long', blk, pos);
            end if;
          end loop;
          has_subs := jsonb_array_length(it -> 'items') > 0;
        end if;
        if not public.content_str_ok(
          it -> 'body', 4000,
          not (has_subs and coalesce(it ->> 'label', '') <> '')
        ) then
          return format('%s point %s: the text is empty or too long', blk, pos);
        end if;
        points := points + 1;
      end loop;
    end if;
  end loop;
  if points = 0 then
    return 'the section has no points in any block';
  end if;

  q := p_body -> 'mistakes';
  if q is not null and jsonb_typeof(q) <> 'null' then
    if jsonb_typeof(q) <> 'array' or jsonb_array_length(q) > 30 then
      return 'mistakes must be a list of up to 30';
    end if;
    pos := 0;
    for it in select value from jsonb_array_elements(q) loop
      pos := pos + 1;
      if jsonb_typeof(it) <> 'object'
         or not public.content_str_ok(it -> 'wrong', 2000, true)
         or not public.content_str_ok(it -> 'right', 2000, true) then
        return format('mistake %s needs both halves', pos);
      end if;
    end loop;
  end if;

  -- The two quizzes. Ids are unique across BOTH: a report names one by id.
  foreach lst in array array['quiz', 'quizHarder'] loop
    q := p_body -> lst;
    if q is null or jsonb_typeof(q) = 'null' then
      continue;
    end if;
    if jsonb_typeof(q) <> 'array' or jsonb_array_length(q) > 100 then
      return format('%s must be a list of up to 100 questions', lst);
    end if;
    pos := 0;
    for it in select value from jsonb_array_elements(q) loop
      pos := pos + 1;
      if jsonb_typeof(it) <> 'object'
         or jsonb_typeof(it -> 'id') is distinct from 'string'
         or (it ->> 'id') !~ '^q[0-9]{1,4}$' then
        return format('%s question %s: bad id', lst, pos);
      end if;
      if (it ->> 'id') = any (ids) then
        return format('id %s is used twice', it ->> 'id');
      end if;
      ids := ids || (it ->> 'id');
      problem := public.content_question_problem(it);
      if problem is not null then
        return format('%s question %s: %s', lst, pos, problem);
      end if;
    end loop;
  end loop;

  return null;
end;
$$;

-- A whole past paper. Null when fine, otherwise what is wrong.
create or replace function public.content_paper_problem(p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  skills   jsonb;
  sk       record;
  part     jsonb;
  pos      integer := 0;
  qpos     integer;
  has_q    boolean;
  has_g    boolean;
  q        jsonb;
  fill     jsonb;
  bank     jsonb;
  w        jsonb;
  n        integer;
  numbers  integer[];
  part_ids text[] := '{}';
  item_ids text[] := '{}';
  scored   integer := 0;
  wr       jsonb;
  problem  text;
begin
  if p_body is null or jsonb_typeof(p_body) <> 'object' then
    return 'the body is not an object';
  end if;
  if pg_column_size(p_body) > 1000000 then
    return 'the body is too large';
  end if;
  if not public.content_int_ok(p_body -> 'minutes', 1, 600, true) then
    return 'the time in minutes is missing or not a whole number';
  end if;
  if not public.content_int_ok(p_body -> 'points', 1, 1000, false) then
    return 'the points are not a whole number';
  end if;
  if not public.content_str_ok(p_body -> 'note', 1000, false) then
    return 'the note is too long';
  end if;

  -- The drills the paper carries, keyed by skill id.
  skills := p_body -> 'skills';
  if skills is null or jsonb_typeof(skills) = 'null' then
    skills := '{}'::jsonb;
  elsif jsonb_typeof(skills) <> 'object' then
    return 'skills must be an object';
  end if;
  if (select count(*) from jsonb_object_keys(skills)) > 50 then
    return 'more than 50 skills';
  end if;
  for sk in select e.key, e.value from jsonb_each(skills) e loop
    if sk.key !~ '^[a-z0-9-]{1,40}$' then
      return format('skill %s: bad id', sk.key);
    end if;
    problem := public.content_help_problem(sk.value);
    if problem is not null then
      return format('skill %s: %s', sk.key, problem);
    end if;
  end loop;

  if jsonb_typeof(p_body -> 'sections') is distinct from 'array'
     or jsonb_array_length(p_body -> 'sections') = 0
     or jsonb_array_length(p_body -> 'sections') > 20 then
    return 'the paper needs 1 to 20 parts';
  end if;

  for part in select value from jsonb_array_elements(p_body -> 'sections') loop
    pos := pos + 1;
    if jsonb_typeof(part) <> 'object'
       or jsonb_typeof(part -> 'id') is distinct from 'string'
       or (part ->> 'id') !~ '^[a-z0-9-]{1,40}$' then
      return format('part %s: bad id', pos);
    end if;
    if (part ->> 'id') = any (part_ids) then
      return format('part id %s is used twice', part ->> 'id');
    end if;
    part_ids := part_ids || (part ->> 'id');
    if not public.content_str_ok(part -> 'title', 200, true) then
      return format('part %s: the title is missing or too long', pos);
    end if;
    if not public.content_str_ok(part -> 'instruction', 2000, true) then
      return format('part %s: the instruction is missing or too long', pos);
    end if;
    if not public.content_str_ok(part -> 'statement', 20000, false) then
      return format('part %s: the exercise is too long', pos);
    end if;
    if not public.content_str_ok(part -> 'example', 2000, false) then
      return format('part %s: the example is too long', pos);
    end if;

    has_q := coalesce(jsonb_typeof(part -> 'questions') = 'array', false);
    has_g := coalesce(jsonb_typeof(part -> 'gapFill') = 'object', false);
    if has_q = has_g then
      return format('part %s needs either questions or a gap-fill passage', pos);
    end if;

    if has_q then
      if jsonb_array_length(part -> 'questions') = 0
         or jsonb_array_length(part -> 'questions') > 60 then
        return format('part %s needs 1 to 60 questions', pos);
      end if;
      qpos := 0;
      for q in select value from jsonb_array_elements(part -> 'questions') loop
        qpos := qpos + 1;
        if jsonb_typeof(q) <> 'object'
           or jsonb_typeof(q -> 'id') is distinct from 'string'
           or (q ->> 'id') !~ '^[a-z][a-z0-9-]{0,19}$' then
          return format('part %s question %s: bad id', pos, qpos);
        end if;
        if (q ->> 'id') = any (item_ids) then
          return format('id %s is used twice', q ->> 'id');
        end if;
        item_ids := item_ids || (q ->> 'id');
        problem := public.content_choice_problem(q, 'q');
        if problem is not null then
          return format('part %s question %s: %s', pos, qpos, problem);
        end if;
        if not public.content_int_ok(q -> 'points', 0, 1000, false) then
          return format('part %s question %s: the marks are not a whole number', pos, qpos);
        end if;
        if q -> 'skill' is not null and jsonb_typeof(q -> 'skill') <> 'null'
           and (jsonb_typeof(q -> 'skill') <> 'string' or not (skills ? (q ->> 'skill'))) then
          return format('part %s question %s: the skill is not one of the paper''s skills', pos, qpos);
        end if;
        scored := scored + 1;
      end loop;

    else
      fill := part -> 'gapFill';
      if not public.content_str_ok(fill -> 'title', 200, true) then
        return format('part %s: the passage title is missing or too long', pos);
      end if;
      if not public.content_str_ok(fill -> 'body', 20000, true) then
        return format('part %s: the passage is missing or too long', pos);
      end if;
      bank := fill -> 'wordBank';
      if jsonb_typeof(bank) is distinct from 'array'
         or jsonb_array_length(bank) < 2 or jsonb_array_length(bank) > 40 then
        return format('part %s: the word box needs 2 to 40 words', pos);
      end if;
      for w in select value from jsonb_array_elements(bank) loop
        if not public.content_str_ok(w, 100, true) then
          return format('part %s: a word in the box is empty or too long', pos);
        end if;
      end loop;
      if (select count(distinct value) from jsonb_array_elements_text(bank))
         <> jsonb_array_length(bank) then
        return format('part %s: two words in the box are the same', pos);
      end if;
      if jsonb_typeof(fill -> 'gaps') is distinct from 'array'
         or jsonb_array_length(fill -> 'gaps') = 0
         or jsonb_array_length(fill -> 'gaps') > 60 then
        return format('part %s needs 1 to 60 gaps', pos);
      end if;
      numbers := '{}';
      qpos := 0;
      for q in select value from jsonb_array_elements(fill -> 'gaps') loop
        qpos := qpos + 1;
        if jsonb_typeof(q) <> 'object'
           or jsonb_typeof(q -> 'id') is distinct from 'string'
           or (q ->> 'id') !~ '^[a-z][a-z0-9-]{0,19}$' then
          return format('part %s gap %s: bad id', pos, qpos);
        end if;
        if (q ->> 'id') = any (item_ids) then
          return format('id %s is used twice', q ->> 'id');
        end if;
        item_ids := item_ids || (q ->> 'id');
        if not public.content_int_ok(q -> 'number', 1, 99, true) then
          return format('part %s gap %s: the number is missing', pos, qpos);
        end if;
        n := ((q ->> 'number')::numeric)::integer;
        if n = any (numbers) then
          return format('part %s: gap %s is used twice', pos, n);
        end if;
        numbers := numbers || n;
        if strpos(fill ->> 'body', '{' || n || '}') = 0 then
          return format('part %s: gap %s is not marked in the passage', pos, n);
        end if;
        if jsonb_typeof(q -> 'correct') is distinct from 'string'
           or not exists (
             select 1 from jsonb_array_elements_text(bank) b
             where b.value = q ->> 'correct'
           ) then
          return format('part %s gap %s: the answer is not in the word box', pos, n);
        end if;
        if q -> 'skill' is not null and jsonb_typeof(q -> 'skill') <> 'null'
           and (jsonb_typeof(q -> 'skill') <> 'string' or not (skills ? (q ->> 'skill'))) then
          return format('part %s gap %s: the skill is not one of the paper''s skills', pos, n);
        end if;
        if not public.content_str_ok(q -> 'explanation', 8000, true) then
          return format('part %s gap %s: the explanation is missing or too long', pos, n);
        end if;
        if q -> 'example' is not null and jsonb_typeof(q -> 'example') not in ('null', 'boolean') then
          return format('part %s gap %s: example must be true or false', pos, n);
        end if;
        -- The paper fills the example gap in for the student: not scored.
        if not coalesce(q -> 'example' = 'true'::jsonb, false) then
          scored := scored + 1;
        end if;
      end loop;
    end if;
  end loop;

  if scored = 0 then
    return 'the paper has nothing to answer';
  end if;

  wr := p_body -> 'writing';
  if wr is not null and jsonb_typeof(wr) <> 'null' then
    if jsonb_typeof(wr) <> 'object' then
      return 'the writing task is not an object';
    end if;
    if not public.content_str_ok(wr -> 'title', 200, true) then
      return 'the writing task needs a title';
    end if;
    if not public.content_str_ok(wr -> 'prompt', 4000, true) then
      return 'the writing task needs its task';
    end if;
    if not public.content_int_ok(wr -> 'minWords', 1, 2000, true) then
      return 'the writing task needs a minimum number of words';
    end if;
    if jsonb_typeof(wr -> 'modelEssay') is distinct from 'array'
       or jsonb_array_length(wr -> 'modelEssay') = 0
       or jsonb_array_length(wr -> 'modelEssay') > 20 then
      return 'the model essay needs 1 to 20 paragraphs';
    end if;
    for w in select value from jsonb_array_elements(wr -> 'modelEssay') loop
      if not public.content_str_ok(w, 4000, true) then
        return 'a model essay paragraph is empty or too long';
      end if;
    end loop;
    if wr -> 'checklist' is not null and jsonb_typeof(wr -> 'checklist') <> 'null' then
      if jsonb_typeof(wr -> 'checklist') <> 'array'
         or jsonb_array_length(wr -> 'checklist') > 20 then
        return 'the checklist must be a list of up to 20 lines';
      end if;
      for w in select value from jsonb_array_elements(wr -> 'checklist') loop
        if not public.content_str_ok(w, 500, true) then
          return 'a checklist line is empty or too long';
        end if;
      end loop;
    end if;
  end if;

  return null;
end;
$$;

-- The ids of a body's items, in order: cards or questions; a section's
-- questions (quiz, then quizHarder); a paper's questions and gaps, part by
-- part. Tolerant of a half-written draft: anything not shaped as expected is
-- skipped rather than raising.
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
  if p_kind in ('deck', 'quiz') then
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

-- How many items a body holds, for content_items.item_count and the editor's
-- lists: cards, questions, a section's questions (may be 0), or a paper's
-- scored questions and gaps (an example gap is not scored).
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
  if p_kind in ('deck', 'quiz') then
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

-- A DRAFT only has to be the right type with unique ids, so unfinished work
-- can be saved. Decks and quizzes keep stage 1's rule exactly.
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

  if p_kind in ('deck', 'quiz') then
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

-- The full check, at publish and import. Decks and quizzes: stage 1's list
-- rules, unchanged except that a question's checks now live in
-- content_question_problem, shared with sections.
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

    else
      return 'unknown kind';
    end if;
  end loop;

  return null;
end;
$$;

-- ── The editor's functions, kind-aware ──────────────────────────────────────
-- Same signatures as 20261003000001; only the counting and the ids changed.

create or replace function public.admin_content_list()
returns table (
  kind              text,
  key               text,
  published_version integer,
  published_count   integer,
  published_at      timestamptz,
  draft_updated_at  timestamptz,
  draft_updated_by  text,
  draft_count       integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_content_list: not an admin' using errcode = '42501';
  end if;

  return query
  select
    coalesce(i.kind, d.kind),
    coalesce(i.key, d.key),
    i.version,
    case when i.version is not null then i.item_count end,
    v.published_at,
    d.updated_at,
    case when d.kind is not null then coalesce(p.display_name, '') end,
    case when d.kind is not null then public.content_count(d.kind, d.body) end
  from public.content_items i
  full outer join public.content_drafts d
    on d.kind = i.kind and d.key = i.key
  left join public.content_versions v
    on v.kind = i.kind and v.key = i.key and v.version = i.version
  left join public.profiles p
    on p.id = d.updated_by
  order by 1, 2;
end;
$$;

create or replace function public.admin_content_get(p_kind text, p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_content_get: not an admin' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'published', (
      select jsonb_build_object(
        'version', v.version,
        'body', v.body,
        'published_at', v.published_at,
        'published_by', coalesce(p.display_name, '')
      )
      from public.content_items i
      join public.content_versions v
        on v.kind = i.kind and v.key = i.key and v.version = i.version
      left join public.profiles p on p.id = v.published_by
      where i.kind = p_kind and i.key = p_key and i.version is not null
    ),
    'draft', (
      select jsonb_build_object(
        'body', d.body,
        'base_version', d.base_version,
        'updated_at', d.updated_at,
        'updated_by', coalesce(p.display_name, '')
      )
      from public.content_drafts d
      left join public.profiles p on p.id = d.updated_by
      where d.kind = p_kind and d.key = p_key
    ),
    -- Every id any published version ever used, so a new card or question
    -- never takes one: review history and saved answers are keyed by them.
    'used_ids', coalesce((
      select jsonb_agg(distinct x.id)
      from public.content_versions v,
           unnest(public.content_item_ids(v.kind, v.body)) as x(id)
      where v.kind = p_kind and v.key = p_key and x.id is not null
    ), '[]'::jsonb),
    'versions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'version', v.version,
          'published_at', v.published_at,
          'published_by', coalesce(p.display_name, ''),
          'item_count', public.content_count(v.kind, v.body)
        )
        order by v.version desc
      )
      from public.content_versions v
      left join public.profiles p on p.id = v.published_by
      where v.kind = p_kind and v.key = p_key
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.admin_save_content_draft(
  p_kind     text,
  p_key      text,
  p_body     jsonb,
  p_expected timestamptz
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_at timestamptz;
  problem    text;
  saved_at   timestamptz;
begin
  if not public.is_app_admin() then
    raise exception 'admin_save_content_draft: not an admin' using errcode = '42501';
  end if;
  if not public.content_key_ok(p_kind, p_key) then
    raise exception 'admin_save_content_draft: bad key' using errcode = '22023', hint = 'key';
  end if;
  problem := public.content_draft_problem(p_kind, p_body);
  if problem is not null then
    raise exception 'admin_save_content_draft: %', problem using errcode = '22023', hint = 'shape';
  end if;

  select d.updated_at into current_at
  from public.content_drafts d
  where d.kind = p_kind and d.key = p_key
  for update;

  if found then
    if p_expected is null or current_at <> p_expected then
      raise exception 'admin_save_content_draft: changed since loaded'
        using errcode = 'P0001', hint = 'stale';
    end if;
    update public.content_drafts d
    set body = p_body, updated_at = now(), updated_by = auth.uid()
    where d.kind = p_kind and d.key = p_key
    returning d.updated_at into saved_at;
  else
    if p_expected is not null then
      raise exception 'admin_save_content_draft: draft gone since loaded'
        using errcode = 'P0001', hint = 'stale';
    end if;
    insert into public.content_drafts (kind, key, body, base_version, updated_by)
    values (
      p_kind, p_key, p_body,
      (select i.version from public.content_items i where i.kind = p_kind and i.key = p_key),
      auth.uid()
    )
    returning updated_at into saved_at;
  end if;

  return saved_at;
end;
$$;

create or replace function public.content_publish_body(p_kind text, p_key text, p_body jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_version integer;
begin
  -- One publish at a time per item, so two cannot both take version N.
  perform pg_advisory_xact_lock(hashtext('content:' || p_kind || ':' || p_key));

  select coalesce(max(v.version), 0) + 1 into next_version
  from public.content_versions v
  where v.kind = p_kind and v.key = p_key;

  insert into public.content_versions (kind, key, version, body, published_by)
  values (p_kind, p_key, next_version, p_body, auth.uid());

  insert into public.content_items (kind, key, version, item_count, item_ids, updated_at)
  values (
    p_kind, p_key, next_version,
    public.content_count(p_kind, p_body), public.content_item_ids(p_kind, p_body), now()
  )
  on conflict on constraint content_items_pkey do update
  set version = excluded.version,
      item_count = excluded.item_count,
      item_ids = excluded.item_ids,
      updated_at = excluded.updated_at;

  return next_version;
end;
$$;

create or replace function public.admin_publish_content(
  p_kind     text,
  p_key      text,
  p_expected timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  draft_body jsonb;
  draft_at   timestamptz;
  problem    text;
  published  integer;
begin
  if not public.has_role('owner') then
    raise exception 'admin_publish_content: owner only'
      using errcode = '42501', hint = 'owner_only';
  end if;

  select d.body, d.updated_at into draft_body, draft_at
  from public.content_drafts d
  where d.kind = p_kind and d.key = p_key
  for update;
  if not found then
    raise exception 'admin_publish_content: no draft'
      using errcode = 'P0001', hint = 'missing';
  end if;
  if p_expected is null or draft_at <> p_expected then
    raise exception 'admin_publish_content: changed since loaded'
      using errcode = 'P0001', hint = 'stale';
  end if;

  problem := public.content_body_problem(p_kind, draft_body);
  -- A section or a paper says "nothing in it" in its own check.
  if problem is null and p_kind in ('deck', 'quiz') and jsonb_array_length(draft_body) = 0 then
    problem := 'nothing to publish: the list is empty';
  end if;
  if problem is not null then
    raise exception 'admin_publish_content: %', problem using errcode = '22023', hint = 'shape';
  end if;

  published := public.content_publish_body(p_kind, p_key, draft_body);

  delete from public.content_drafts d
  where d.kind = p_kind and d.key = p_key;

  return published;
end;
$$;

create or replace function public.admin_import_content(p_items jsonb, p_publish boolean)
returns table (item_kind text, item_key text, outcome text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  it jsonb;
  k  text;
  ky text;
  b  jsonb;
  problem text;
  ever_published boolean;
  has_draft boolean;
begin
  if not public.has_role('owner') then
    raise exception 'admin_import_content: owner only'
      using errcode = '42501', hint = 'owner_only';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 300 then
    raise exception 'admin_import_content: the file must hold 1 to 300 items'
      using errcode = '22023', hint = 'shape';
  end if;

  for it in select value from jsonb_array_elements(p_items) loop
    k := it ->> 'kind';
    ky := it ->> 'key';
    if not public.content_key_ok(k, ky) then
      raise exception 'admin_import_content: bad key %', coalesce(ky, '?')
        using errcode = '22023', hint = 'key';
    end if;
    b := it -> 'body';
    problem := public.content_body_problem(k, b);
    if problem is null and k in ('deck', 'quiz') and jsonb_array_length(b) = 0 then
      problem := 'the list is empty';
    end if;
    if problem is not null then
      raise exception 'admin_import_content: % %: %', k, ky, problem
        using errcode = '22023', hint = 'shape';
    end if;
  end loop;

  if (select count(*) from jsonb_array_elements(p_items))
     <> (select count(distinct (e.value ->> 'kind') || ':' || (e.value ->> 'key'))
         from jsonb_array_elements(p_items) e) then
    raise exception 'admin_import_content: the same item is in the file twice'
      using errcode = '22023', hint = 'shape';
  end if;

  for it in select value from jsonb_array_elements(p_items) loop
    k := it ->> 'kind';
    ky := it ->> 'key';
    b := it -> 'body';

    select exists (
      select 1 from public.content_versions v where v.kind = k and v.key = ky
    ) into ever_published;
    select exists (
      select 1 from public.content_drafts d where d.kind = k and d.key = ky
    ) into has_draft;

    item_kind := k;
    item_key := ky;
    if has_draft then
      outcome := 'skipped';
    elsif p_publish and not ever_published then
      perform public.content_publish_body(k, ky, b);
      outcome := 'published';
    else
      insert into public.content_drafts (kind, key, body, base_version, updated_by)
      values (
        k, ky, b,
        (select i.version from public.content_items i where i.kind = k and i.key = ky),
        auth.uid()
      );
      outcome := 'draft';
    end if;
    return next;
  end loop;
end;
$$;

-- The one-argument helpers stage 1 used, replaced by the kind-aware pair.
drop function if exists public.content_draft_problem(jsonb);
drop function if exists public.content_item_ids(jsonb);

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Helpers: nobody calls them directly. The admin functions keep stage 1's
-- grants (restated so a re-run cannot leave them wider).

revoke all on function public.content_key_ok(text, text) from public, anon, authenticated;
revoke all on function public.content_int_ok(jsonb, integer, integer, boolean) from public, anon, authenticated;
revoke all on function public.content_help_problem(jsonb) from public, anon, authenticated;
revoke all on function public.content_question_problem(jsonb) from public, anon, authenticated;
revoke all on function public.content_section_problem(jsonb) from public, anon, authenticated;
revoke all on function public.content_paper_problem(jsonb) from public, anon, authenticated;
revoke all on function public.content_item_ids(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_count(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_draft_problem(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_body_problem(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_publish_body(text, text, jsonb) from public, anon, authenticated;

revoke all on function public.admin_content_list() from public, anon;
grant execute on function public.admin_content_list() to authenticated;
revoke all on function public.admin_content_get(text, text) from public, anon;
grant execute on function public.admin_content_get(text, text) to authenticated;
revoke all on function public.admin_save_content_draft(text, text, jsonb, timestamptz) from public, anon;
grant execute on function public.admin_save_content_draft(text, text, jsonb, timestamptz) to authenticated;
revoke all on function public.admin_publish_content(text, text, timestamptz) from public, anon;
grant execute on function public.admin_publish_content(text, text, timestamptz) to authenticated;
revoke all on function public.admin_import_content(jsonb, boolean) from public, anon;
grant execute on function public.admin_import_content(jsonb, boolean) to authenticated;

commit;

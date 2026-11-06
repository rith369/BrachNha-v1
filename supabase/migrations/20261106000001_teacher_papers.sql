-- Teacher papers: the Mock Exam page's "newly generated" tab (6 Nov 2026).
--
-- A teacher paper is a whole paper a teacher wrote in the Bac II format, modelled
-- on the past exams: the SAME body as a past paper (parts, points, a time limit),
-- stored as kind 'paper'. Only its key differs: "new-{subject}-{n}" (new-math-1,
-- new-math-2 ... up to 999 per subject) beside a past paper's "{year}-{subject}".
--
-- Nothing else changes: the paper kind's count, ids, publish checks and history
-- already work on any paper body. Only content_key_ok() learns the second shape.
--
-- Safe to run twice: create or replace.

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
    when 'paper' then coalesce(
      p_key ~ '^20[0-9]{2}-(math|physics|chemistry|biology|history|khmer|english|french)$'
      or p_key ~ '^new-(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]{0,2}$',
      false)
    when 'game' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)$', false)
    else false
  end;
$$;

revoke all on function public.content_key_ok(text, text) from public, anon, authenticated;

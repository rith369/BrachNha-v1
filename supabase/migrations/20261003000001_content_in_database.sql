-- ============================================================================
-- BrachNha — flashcards and practice quizzes, stored in the database
-- ============================================================================
--
-- Stage 1 of docs/plans/content-in-database.md. Until now every flashcard deck
-- and practice quiz was written in code (src/data/practice.ts and
-- src/data/quizzes/*.ts). From here they live in three tables, the team edits
-- them on /admin/content, and ONLY THE OWNER PUBLISHES.
--
--   content_items     one row per deck or quiz: which version students see
--                     now (null = not published), how many cards/questions,
--                     and their ids. This is the MANIFEST a student's phone
--                     downloads to know what exists. Anyone may read the
--                     published rows, guests included.
--
--   content_versions  every version ever published, never changed afterwards.
--                     A phone downloads one (kind, key, version) when a deck
--                     or quiz is opened and keeps it, because a published
--                     version can never change under it. Anyone may read.
--
--   content_drafts    at most one unpublished draft per item. No client can
--                     read or write it; the admin functions below do.
--
-- A body is a JSON array:
--
--   deck   [{ "id": "biology-1-1-3", "front": "…", "back": "…" }, …]
--          Card ids are KEPT FOREVER: a student's spaced-repetition history
--          is keyed by them. A new card takes the next unused number.
--
--   quiz   [{ "id": "q3", "scenario"?: "…", "q": "…", "options": ["…"],
--             "correct": "…", "explanation": "…", "help"?: { … } }, …]
--          The SectionQuestion shape plus a stable id, so a mistake report
--          (quiz:math-1-1-1#q3) still names the right question after the
--          questions are reordered.
--
-- The SQL checks the SHAPE (types, lengths, unique ids, `correct` among the
-- options) when an item is PUBLISHED or IMPORTED; a draft only needs unique
-- ids, so unfinished work can be saved. The rich checks (KaTeX, Khmer inside maths, Khmer digits, em
-- dashes) run in the editor and in scripts/check-content.mjs through
-- src/utils/content-check.ts, the same rules check:quiz applies.
--
-- Refusals carry a hint the admin page can name:
--   owner_only  only the owner publishes, unpublishes and imports
--   key         not a real deck or quiz key
--   shape       the body is malformed (the message says how)
--   stale       someone saved, published or discarded since you loaded it
--   missing     there is no draft to publish
--
-- Re-runnable. One transaction.
-- ============================================================================

begin;

-- ── Shape helpers (pure; used by the functions below) ───────────────────────

-- A deck key is a lesson: subject-chapter-lesson. A quiz key is a lesson or a
-- section of one: subject-chapter-lesson[-section]. Same subjects as the app's
-- catalog (src/features/lessons/subjects.ts).
create or replace function public.content_key_ok(p_kind text, p_key text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_kind
    when 'deck' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]?-[1-9][0-9]?$', false)
    when 'quiz' then coalesce(p_key ~ '^(math|physics|chemistry|biology|history|khmer|english|french)-[1-9][0-9]?-[1-9][0-9]?(-[1-9][0-9]?)?$', false)
    else false
  end;
$$;

-- A string field: present (unless optional), a string, within its length, and
-- not blank when required.
create or replace function public.content_str_ok(v jsonb, max_len integer, required boolean)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when v is null or jsonb_typeof(v) = 'null' then not required
    when jsonb_typeof(v) <> 'string' then false
    else char_length(v #>> '{}') <= max_len
         and (not required or char_length(btrim(v #>> '{}')) > 0)
  end;
$$;

-- One multiple-choice item: the prompt field, 2 to 6 distinct options, a
-- `correct` that is one of them, and an explanation. Returns null when fine,
-- otherwise what is wrong. Shared by quiz questions and their drill exercises.
create or replace function public.content_choice_problem(p_item jsonb, p_prompt text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  opts jsonb := p_item -> 'options';
  n integer;
  opt jsonb;
begin
  if not public.content_str_ok(p_item -> p_prompt, 4000, true) then
    return 'the question text is missing or too long';
  end if;
  if opts is null or jsonb_typeof(opts) <> 'array' then
    return 'options are missing';
  end if;
  n := jsonb_array_length(opts);
  if n < 2 or n > 6 then
    return 'needs 2 to 6 options';
  end if;
  for opt in select value from jsonb_array_elements(opts) loop
    if not public.content_str_ok(opt, 1000, true) then
      return 'an option is empty or too long';
    end if;
  end loop;
  if (select count(distinct value) from jsonb_array_elements_text(opts)) <> n then
    return 'two options are the same';
  end if;
  if not public.content_str_ok(p_item -> 'correct', 1000, true)
     or not exists (
       select 1 from jsonb_array_elements_text(opts) o
       where o.value = p_item ->> 'correct'
     ) then
    return 'the correct answer is not one of the options';
  end if;
  if not public.content_str_ok(p_item -> 'explanation', 8000, true) then
    return 'the explanation is missing or too long';
  end if;
  return null;
end;
$$;

-- A whole body. Null when fine, otherwise what is wrong (for the message).
-- An EMPTY list is a valid draft but cannot be published; the publish
-- function checks that separately.
create or replace function public.content_body_problem(p_kind text, p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  el jsonb;
  help jsonb;
  drill jsonb;
  line jsonb;
  ids text[] := '{}';
  item_id text;
  pos integer := 0;
  problem text;
begin
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
      if not public.content_str_ok(el -> 'scenario', 4000, false) then
        return format('question %s: the scenario is too long', pos);
      end if;
      problem := public.content_choice_problem(el, 'q');
      if problem is not null then
        return format('question %s: %s', pos, problem);
      end if;

      help := el -> 'help';
      if help is not null and jsonb_typeof(help) <> 'null' then
        if jsonb_typeof(help) <> 'object'
           or not public.content_str_ok(help -> 'label', 300, true) then
          return format('question %s: help needs a label', pos);
        end if;
        if jsonb_typeof(help -> 'note') is distinct from 'array'
           or jsonb_array_length(help -> 'note') > 20 then
          return format('question %s: help note must be a list of up to 20 lines', pos);
        end if;
        for line in select value from jsonb_array_elements(help -> 'note') loop
          if not public.content_str_ok(line, 2000, true) then
            return format('question %s: a help note line is empty or too long', pos);
          end if;
        end loop;
        if not public.content_str_ok(help -> 'mistake', 2000, false) then
          return format('question %s: the common mistake is too long', pos);
        end if;
        if jsonb_typeof(help -> 'questions') is distinct from 'array'
           or jsonb_array_length(help -> 'questions') > 10 then
          return format('question %s: help exercises must be a list of up to 10', pos);
        end if;
        for drill in select value from jsonb_array_elements(help -> 'questions') loop
          problem := public.content_choice_problem(drill, 'prompt');
          if problem is not null then
            return format('question %s, exercise: %s', pos, problem);
          end if;
        end loop;
        if help -> 'foundation' is not null and jsonb_typeof(help -> 'foundation') <> 'null' then
          if jsonb_typeof(help -> 'foundation') <> 'array'
             or jsonb_array_length(help -> 'foundation') > 10 then
            return format('question %s: foundation exercises must be a list of up to 10', pos);
          end if;
          for drill in select value from jsonb_array_elements(help -> 'foundation') loop
            problem := public.content_choice_problem(drill, 'prompt');
            if problem is not null then
              return format('question %s, foundation exercise: %s', pos, problem);
            end if;
          end loop;
        end if;
      end if;

    else
      return 'unknown kind';
    end if;
  end loop;

  return null;
end;
$$;

-- A DRAFT only has to be a list of items with unique ids, so half-finished
-- work (a new card with no back yet) can be saved. The full check above runs
-- when it is published or imported, and the editor shows every problem as
-- the team types.
create or replace function public.content_draft_problem(p_body jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  el jsonb;
  ids text[] := '{}';
  pos integer := 0;
begin
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
end;
$$;

-- The ids of a body's items, in order, for content_items.item_ids.
create or replace function public.content_item_ids(p_body jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(e.value ->> 'id' order by e.ordinality), '{}')
  from jsonb_array_elements(p_body) with ordinality as e(value, ordinality);
$$;

revoke all on function public.content_key_ok(text, text) from public, anon, authenticated;
revoke all on function public.content_str_ok(jsonb, integer, boolean) from public, anon, authenticated;
revoke all on function public.content_choice_problem(jsonb, text) from public, anon, authenticated;
revoke all on function public.content_body_problem(text, jsonb) from public, anon, authenticated;
revoke all on function public.content_item_ids(jsonb) from public, anon, authenticated;
revoke all on function public.content_draft_problem(jsonb) from public, anon, authenticated;

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.content_items (
  kind       text not null check (kind in ('deck', 'quiz')),
  key        text not null,
  -- The version students see. Null when not published (never, or the owner
  -- unpublished it): the app then shows the item as "coming soon".
  version    integer check (version is null or version >= 1),
  item_count integer not null default 0,
  item_ids   text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint content_items_pkey primary key (kind, key),
  constraint content_items_key_ok check (public.content_key_ok(kind, key))
);

create table if not exists public.content_versions (
  kind         text not null check (kind in ('deck', 'quiz')),
  key          text not null,
  version      integer not null check (version >= 1),
  body         jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null,
  constraint content_versions_pkey primary key (kind, key, version)
);

create table if not exists public.content_drafts (
  kind         text not null check (kind in ('deck', 'quiz')),
  key          text not null,
  body         jsonb not null,
  -- The version that was published when this draft was started, so the page
  -- can say "started from version 2" when the published one has moved on.
  base_version integer,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint content_drafts_pkey primary key (kind, key),
  constraint content_drafts_key_ok check (public.content_key_ok(kind, key))
);

alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_drafts enable row level security;

-- Reads are stated, writes are not granted at all: every write goes through
-- the functions below. Drafts are not readable by any client.
revoke all on public.content_items from anon, authenticated;
revoke all on public.content_versions from anon, authenticated;
revoke all on public.content_drafts from anon, authenticated;
grant select on public.content_items to anon, authenticated;
grant select on public.content_versions to anon, authenticated;

drop policy if exists "content_items: read published" on public.content_items;
create policy "content_items: read published"
  on public.content_items for select
  to anon, authenticated
  using (version is not null);

-- Every version is readable, not just the current one: a student reopening an
-- old quiz attempt loads the version they actually took.
drop policy if exists "content_versions: read all" on public.content_versions;
create policy "content_versions: read all"
  on public.content_versions for select
  to anon, authenticated
  using (true);

-- ── Reading, for everyone ───────────────────────────────────────────────────

-- The current body of every published item of one kind, in one call. For the
-- two places that need all of them at once: KruAI's server (the deck catalog)
-- and /practice/review (every deck's due cards). Security invoker: the read
-- policies above decide what it returns.
create or replace function public.content_current(p_kind text)
returns table (key text, version integer, body jsonb)
language sql
stable
set search_path = ''
as $$
  select i.key, i.version, v.body
  from public.content_items i
  join public.content_versions v
    on v.kind = i.kind and v.key = i.key and v.version = i.version
  where i.kind = p_kind and i.version is not null
  order by i.key;
$$;

revoke all on function public.content_current(text) from public;
grant execute on function public.content_current(text) to anon, authenticated;

-- ── The editor's reads (any admin) ──────────────────────────────────────────

-- Every item, published or only drafted, for the /admin/content list.
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
    case when d.kind is not null then jsonb_array_length(d.body) end
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

revoke all on function public.admin_content_list() from public, anon;
grant execute on function public.admin_content_list() to authenticated;

-- One item: its published version, its draft, and its version history.
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
    -- Every id any published version ever used. A new card or question must
    -- take a number outside this set: a student's review history is keyed by
    -- card id, so a reused id would hand an old card's history to a new one.
    'used_ids', coalesce((
      select jsonb_agg(distinct e.value ->> 'id')
      from public.content_versions v,
           jsonb_array_elements(v.body) e
      where v.kind = p_kind and v.key = p_key
    ), '[]'::jsonb),
    'versions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'version', v.version,
          'published_at', v.published_at,
          'published_by', coalesce(p.display_name, ''),
          'item_count', jsonb_array_length(v.body)
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

revoke all on function public.admin_content_get(text, text) from public, anon;
grant execute on function public.admin_content_get(text, text) to authenticated;

-- ── Drafts (any admin) ──────────────────────────────────────────────────────

-- Save the draft. `p_expected` is the draft's updated_at as the page loaded
-- it, or null when the page saw no draft; anything else means someone else
-- saved, published or discarded in between, and the save is refused ('stale')
-- rather than silently overwriting their work. Returns the new updated_at,
-- which the page sends with its next save.
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
  problem := public.content_draft_problem(p_body);
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

revoke all on function public.admin_save_content_draft(text, text, jsonb, timestamptz) from public, anon;
grant execute on function public.admin_save_content_draft(text, text, jsonb, timestamptz) to authenticated;

-- Throw the draft away. Refused ('stale') if it changed since the page loaded
-- it, so nobody discards work they never saw. False when there was none.
create or replace function public.admin_discard_content_draft(
  p_kind     text,
  p_key      text,
  p_expected timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_discard_content_draft: not an admin' using errcode = '42501';
  end if;

  delete from public.content_drafts d
  where d.kind = p_kind and d.key = p_key and d.updated_at = p_expected;
  if found then
    return true;
  end if;
  if exists (select 1 from public.content_drafts d where d.kind = p_kind and d.key = p_key) then
    raise exception 'admin_discard_content_draft: changed since loaded'
      using errcode = 'P0001', hint = 'stale';
  end if;
  return false;
end;
$$;

revoke all on function public.admin_discard_content_draft(text, text, timestamptz) from public, anon;
grant execute on function public.admin_discard_content_draft(text, text, timestamptz) to authenticated;

-- Copy an old version into the draft, for the owner to publish again. Same
-- 'stale' rule as saving.
create or replace function public.admin_restore_content_version(
  p_kind     text,
  p_key      text,
  p_version  integer,
  p_expected timestamptz
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_body jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'admin_restore_content_version: not an admin' using errcode = '42501';
  end if;

  select v.body into old_body
  from public.content_versions v
  where v.kind = p_kind and v.key = p_key and v.version = p_version;
  if not found then
    raise exception 'admin_restore_content_version: no such version'
      using errcode = 'P0001', hint = 'missing';
  end if;

  return public.admin_save_content_draft(p_kind, p_key, old_body, p_expected);
end;
$$;

revoke all on function public.admin_restore_content_version(text, text, integer, timestamptz) from public, anon;
grant execute on function public.admin_restore_content_version(text, text, integer, timestamptz) to authenticated;

-- ── Publishing (owner only) ─────────────────────────────────────────────────

-- Internal: make `p_body` the next version of an item and the one students
-- see. Not granted to anyone; the owner-checked functions call it.
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
    jsonb_array_length(p_body), public.content_item_ids(p_body), now()
  )
  on conflict on constraint content_items_pkey do update
  set version = excluded.version,
      item_count = excluded.item_count,
      item_ids = excluded.item_ids,
      updated_at = excluded.updated_at;

  return next_version;
end;
$$;

revoke all on function public.content_publish_body(text, text, jsonb) from public, anon, authenticated;

-- Publish the draft as the next version. `p_expected` is the draft's
-- updated_at as the owner saw it, so what is published is exactly what was
-- reviewed. Returns the new version number.
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
  if problem is null and jsonb_array_length(draft_body) = 0 then
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

revoke all on function public.admin_publish_content(text, text, timestamptz) from public, anon;
grant execute on function public.admin_publish_content(text, text, timestamptz) to authenticated;

-- Hide an item from students (it shows as "coming soon" again). Its versions
-- are kept; publishing a draft brings it back as the next version.
create or replace function public.admin_unpublish_content(p_kind text, p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_role('owner') then
    raise exception 'admin_unpublish_content: owner only'
      using errcode = '42501', hint = 'owner_only';
  end if;

  update public.content_items i
  set version = null, updated_at = now()
  where i.kind = p_kind and i.key = p_key and i.version is not null;
  return found;
end;
$$;

revoke all on function public.admin_unpublish_content(text, text) from public, anon;
grant execute on function public.admin_unpublish_content(text, text) to authenticated;

-- Import a file of items: [{ "kind", "key", "body" }, …]. Owner only.
--
-- ALL OR NOTHING on shape: one bad item refuses the whole file, naming it.
-- Then, per item:
--   'published'  p_publish, and the item has never been published: it goes
--                straight to version 1. Used once, for the move out of code.
--   'draft'      otherwise it becomes the draft, for review before publishing.
--   'skipped'    the item already has a draft, which is never overwritten.
-- A published version is never replaced by an import.
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
    if problem is null and jsonb_array_length(b) = 0 then
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

revoke all on function public.admin_import_content(jsonb, boolean) from public, anon;
grant execute on function public.admin_import_content(jsonb, boolean) to authenticated;

commit;

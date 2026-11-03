-- ============================================================================
-- BrachNha: how many rows one student can keep in each table
-- ============================================================================
--
-- THE HOLE. The app keeps its own lists short, but a script calling the database directly
-- could keep adding rows to its own account until the project ran out of space. Other
-- students never see those rows. The harm is the storage.
--
-- THE RULE. After an insert, if a student is over a table's limit, their oldest rows over
-- it are deleted. Nothing is ever refused, so a real student's sync cannot fail because
-- of this: sync failures are silent (see 20261103000006), and chat sync deletes before it
-- re-inserts.
--
-- ONCE PER STATEMENT, NOT PER ROW. The app's own batches run to 500 rows, and counting once
-- per row would be 500 counts of up to 20000 rows each.
--
-- ONE AT A TIME PER STUDENT. Many inserts at once would each count only their own rows and
-- all stay. The advisory lock makes the next one wait and count what the last one wrote.
--
-- THE LIMITS, and what the app really keeps:
--
--   table                    limit   the app
--   conversations               50   20 (MAX_CONVERSATIONS)
--   chat_messages             1000   800: 20 conversations of 40 (MAX_CHAT_MSGS)
--   commitments                100   one each time the pledge is signed
--   exam_results              1000   a few a week at most
--   completed_sessions        5000   one per lesson, and lessons are far fewer
--   pending_placement_tests     50   nothing writes these any more
--   card_reviews             20000   one per card ever studied
--   student_cards             2000   typed by hand, one at a time
--   starred_cards            20000   one per card
--   card_review_log           5000   the device and the pull use the newest 1000
--   quiz_results               200   the device and the pull use the newest 50
--   paper_results              200   the device and the pull use the newest 50
--   simulation_attempts         30   10 (MAX_SIMULATIONS)
--   question_mistakes         1000   300 (MAX_MISTAKES)
--   daily_content_activity   30000   a few rows per day studied
--   app_events               30000   a few dozen a day, and at most 500 by log_event
--
-- card_review_log, quiz_results and paper_results GROW on the server as a real student
-- studies, past what the device keeps. Their limits can be reached in time, and that is
-- fine: only what the app never reads again is lost.
--
-- TABLES NOT HERE are already held. daily_activity is one row a day inside the window in
-- 20261103000007. competitions are 20 a day, and an attempt is one per Battle. Reports and
-- friendships have their own limits. client_errors is held by 20261103000008.
--
-- WHAT THIS STILL ALLOWS. One account at every limit, with the longest text allowed and every
-- character taking 4 bytes, is about 300 MB: chat 120, a student's cards 64, the rest about 115.
-- That is the worst case of a deliberate script, not unlimited any more, but two such accounts
-- could still fill a 500 MB project. Removing the account deletes it all.
--
-- ORDER DOES NOT MATTER. There is no app change.
--
-- Re-runnable.
-- ============================================================================

begin;

-- tg_argv[0] is the limit, tg_argv[1] the column saying which rows are newest.
-- security definer because some of these tables give students no delete.
create or replace function public.keep_newest_rows()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who uuid;
  n   bigint;
begin
  for who in select distinct r.user_id from new_rows r loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(who::text, 0));

    execute format('select count(*) from public.%I where user_id = $1', tg_table_name)
      into n using who;

    if n > tg_argv[0]::bigint then
      execute format(
        'delete from public.%1$I where ctid in (
           select ctid from public.%1$I where user_id = $1
           order by %2$I desc nulls last offset $2
         )',
        tg_table_name, tg_argv[1]
      ) using who, tg_argv[0]::bigint;
    end if;
  end loop;
  return null;
end;
$$;

-- Fired by the tables, never called.
revoke all on function public.keep_newest_rows() from public, anon, authenticated;

do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('conversations',           50,    'updated_at'),
      ('chat_messages',           1000,  'created_at'),
      ('commitments',             100,   'signed_at'),
      ('exam_results',            1000,  'taken_at'),
      ('completed_sessions',      5000,  'completed_at'),
      ('pending_placement_tests', 50,    'created_at'),
      ('card_reviews',            20000, 'updated_at'),
      ('student_cards',           2000,  'updated_at'),
      ('starred_cards',           20000, 'created_at'),
      ('card_review_log',         5000,  'reviewed_at'),
      ('quiz_results',            200,   'taken_at'),
      ('paper_results',           200,   'taken_at'),
      ('simulation_attempts',     30,    'started_at'),
      ('question_mistakes',       1000,  'last_wrong_at'),
      ('daily_content_activity',  30000, 'activity_date'),
      ('app_events',              30000, 'created_at')
    ) as x (name, cap, newest)
  loop
    execute format('drop trigger if exists %I on public.%I', t.name || '_keep_newest', t.name);
    execute format(
      'create trigger %I after insert on public.%I
         referencing new table as new_rows
         for each statement execute function public.keep_newest_rows(%L, %L)',
      t.name || '_keep_newest', t.name, t.cap, t.newest
    );
  end loop;
end;
$$;

commit;

-- What the SQL editor shows afterwards: true, if all 16 are in place.
select
  (select count(*) from pg_catalog.pg_trigger where tgname like '%\_keep\_newest') = 16
  as row_limits_in_place;

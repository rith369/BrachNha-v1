-- ============================================================================
-- BrachNha — hardening: RPC exposure and one missing foreign-key index
-- ============================================================================
--
-- Both items come from Supabase's own database advisors, run against a live
-- project on 4 Sep 2026 once the schema had real rows in it. Neither is a
-- change of design — 20260828000001 and ...02 stand as written; this closes two
-- gaps they left open by omission rather than by decision.
--
-- Re-runnable like the other two files, so a partial apply can simply be
-- repeated: `revoke` on an already-revoked privilege is a no-op, and the index
-- is `if not exists`.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. handle_new_user() must not be callable over the REST API
--
-- It is a SECURITY DEFINER trigger function: it runs as its owner so it can
-- write to public.profiles regardless of who caused the insert on auth.users.
-- That is correct and necessary for a trigger.
--
-- The problem is that Postgres grants EXECUTE on new functions to PUBLIC by
-- default, and PostgREST exposes everything in the `public` schema — so it was
-- also reachable as POST /rest/v1/rpc/handle_new_user by `anon` and
-- `authenticated`. Supabase's security advisor flags exactly this
-- (0028_anon_security_definer_function_executable and 0029_… for authenticated).
--
-- The practical risk here is small: the function takes no arguments and reads
-- `new`, which is null outside a trigger context, so a direct call errors
-- rather than doing damage. It is revoked anyway, because "it happens to fail"
-- is not an access control decision, and a SECURITY DEFINER function reachable
-- by anyone on the internet is the wrong default to leave standing — the next
-- edit to its body would inherit that exposure silently.
--
-- The trigger is unaffected: a trigger executes as the table owner and does not
-- consult EXECUTE grants at all. Nothing in the app calls this by name.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function public.handle_new_user() from anon, authenticated;

-- PUBLIC is where the grant actually comes from; revoking only the two named
-- roles would leave it reachable by any future role that inherits PUBLIC.
revoke execute on function public.handle_new_user() from public;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. chat_messages.user_id needs its own index
--
-- Every other table in 20260828000001 indexes the column its RLS policy filters
-- on; chat_messages was the one that did not, so it is an oversight rather than
-- a judgement. Its foreign key to profiles has no covering index, which means a
-- sequential scan for the ownership check on every read, and a scan of the
-- child table whenever a profile row is deleted (the cascade has to find the
-- rows it owns).
--
-- It matters more here than anywhere else in the schema for the reason
-- 20260828000002's header already gives: chat_messages is the only table that
-- grows without a per-user cap. A conversation is capped at 40 messages and a
-- student at 20 conversations, but rows accumulate across every student on the
-- project, and this index is what keeps one student's reads independent of how
-- many other students exist.
--
-- Cheap to add now while the table is small; a sequential scan is invisible at
-- 26 rows and is exactly the kind of thing that is noticed far too late.
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists chat_messages_user_idx
  on public.chat_messages (user_id);

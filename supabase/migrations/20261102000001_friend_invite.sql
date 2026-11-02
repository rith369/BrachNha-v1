-- ============================================================================
-- BrachNha — the invite link for Streak with Friends
-- ============================================================================
--
-- Search by name fails when the name is spelled differently from how it is
-- stored (most Google names are Latin, and typing សុខ does not find "Sok"), and
-- two students with one name look the same in the results. So a student can
-- now send a link or show a QR code: /friend/{their account id}.
--
-- Opening it shows WHO the link belongs to, which is all this function adds.
-- Adding them still goes through send_friend_request(), and they still have to
-- accept (the user's rule, 13 Oct 2026). Both taps matter:
--   * the page never sends a request by itself, or anyone could send you a link
--     that makes you ask them, and then accept themselves into your goal days;
--   * accepting stays, so a link forwarded to a stranger gives them nothing.
--
-- NOT A NEW EXPOSURE. It returns a display name for an account id, to a signed-in
-- student, and search_students() already hands out exactly that pair. Nothing is
-- returned for an account search could not find either (anonymous, or no name).
--
-- THE CALLER NEED NOT HAVE A NAME YET, unlike search_students(). A new student
-- who signed in from the link can land here before their name has reached the
-- server, and the page must still say who invited them.
--
-- Re-runnable, in one transaction. Apply AFTER 20261013000001.
-- ============================================================================

begin;

create or replace function public.friend_invite(p_user uuid)
returns table (display_name text, relation text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null or not exists (
    select 1 from auth.users u
    where u.id = me and coalesce(u.is_anonymous, false) = false
  ) then
    raise exception 'friend_invite: not signed in' using errcode = '42501';
  end if;

  -- No row at all means "no such student": the page says so.
  if p_user is null or not public.friend_eligible(p_user) then
    return;
  end if;

  return query
  select
    btrim(p.display_name),
    case
      when p.id = me then 'self'
      when f.id is null then 'none'
      when f.status = 'accepted' then 'friends'
      when f.requester_id = me then 'sent'
      else 'received'
    end
  from public.profiles p
  left join public.friendships f
    on least(f.requester_id, f.addressee_id) = least(me, p.id)
   and greatest(f.requester_id, f.addressee_id) = greatest(me, p.id)
  where p.id = p_user;
end;
$$;

-- Signed-in students only.
revoke all on function public.friend_invite(uuid) from public, anon;
grant execute on function public.friend_invite(uuid) to authenticated;

commit;

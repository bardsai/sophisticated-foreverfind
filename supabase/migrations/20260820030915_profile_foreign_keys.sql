-- match_requests/matches originally pointed at auth.users, which PostgREST
-- can't traverse to embed the other party's profile in one query (profiles
-- and match_requests share a referenced table but aren't directly linked).
-- Repoint at public.profiles, which is always in sync with auth.users
-- 1:1 via the handle_new_user trigger.

alter table public.match_requests drop constraint match_requests_requester_id_fkey;
alter table public.match_requests
  add constraint match_requests_requester_id_fkey
  foreign key (requester_id) references public.profiles (id) on delete cascade;

alter table public.match_requests drop constraint match_requests_target_id_fkey;
alter table public.match_requests
  add constraint match_requests_target_id_fkey
  foreign key (target_id) references public.profiles (id) on delete cascade;

alter table public.matches drop constraint matches_user_a_id_fkey;
alter table public.matches
  add constraint matches_user_a_id_fkey
  foreign key (user_a_id) references public.profiles (id) on delete cascade;

alter table public.matches drop constraint matches_user_b_id_fkey;
alter table public.matches
  add constraint matches_user_b_id_fkey
  foreign key (user_b_id) references public.profiles (id) on delete cascade;

-- 1. Create/invite the admin login in Supabase Dashboard > Authentication > Users.
--    The login needs no display_name/birthdate metadata and no public profile.
-- 2. Run this in the Supabase SQL Editor to grant that Auth account admin access.
-- The admin signs in through the app's regular Log in screen and is routed to /admin.
do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('Sophisticatedalaga@gmail.com');

  if target_user_id is null then
    raise exception 'No account found for Sophisticatedalaga@gmail.com. Register first, then run this script again.';
  end if;

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'admin')
  on conflict (user_id) do update set role = excluded.role;
end $$;

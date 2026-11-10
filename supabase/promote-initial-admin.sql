-- Run in the Supabase SQL Editor after Bukola Ganiyat Akande has registered
-- with this email address. This assigns the protected admin role to that
-- existing account; it does not create an account or set a password.
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

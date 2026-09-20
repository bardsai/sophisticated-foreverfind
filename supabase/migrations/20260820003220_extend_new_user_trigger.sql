-- Email confirmation is on by default, so there's no authenticated session
-- right after auth.signUp() for the client to insert its own profiles row.
-- Instead the sign-up screen passes display_name/birthdate as auth metadata,
-- and this trigger creates the profile server-side at the same time as the
-- auth.users row, before confirmation even happens.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id) values (new.id);

  insert into public.profiles (id, display_name, birthdate)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    (new.raw_user_meta_data ->> 'birthdate')::date
  );

  return new;
end;
$$;

alter table public.profiles add column push_token text;
alter table public.profiles add column terms_accepted_at timestamptz;

-- Sign-up only ever calls auth.signUp() after the terms checkbox is
-- checked, so acceptance can be stamped unconditionally at account
-- creation rather than threading another metadata field through.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id) values (new.id);

  insert into public.profiles (id, display_name, birthdate, terms_accepted_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    (new.raw_user_meta_data ->> 'birthdate')::date,
    now()
  );

  return new;
end;
$$;

-- Admin-only Auth accounts do not need a dating profile. Keep the default
-- user role row so every new Auth account has an explicit role, and create a
-- dating profile only when normal signup metadata is present.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id) values (new.id);

  if nullif(new.raw_user_meta_data ->> 'display_name', '') is not null
     and nullif(new.raw_user_meta_data ->> 'birthdate', '') is not null then
    insert into public.profiles (id, display_name, birthdate, terms_accepted_at)
    values (
      new.id,
      new.raw_user_meta_data ->> 'display_name',
      (new.raw_user_meta_data ->> 'birthdate')::date,
      now()
    );
  end if;

  return new;
end;
$$;

-- Expanded self-profile attributes and partner-preference criteria, used by
-- the longer onboarding flow and by admins vetting introduction requests.

alter table public.profiles
  add column gender text check (gender in ('man', 'woman', 'non_binary', 'prefer_not_to_say')),
  add column hometown text check (char_length(hometown) <= 100),
  add column occupation text check (char_length(occupation) <= 100),
  add column phone_number text check (char_length(phone_number) <= 20),
  add column height_cm smallint check (height_cm is null or height_cm between 100 and 250),
  add column physique text check (
    physique in ('slim', 'athletic', 'average', 'curvy', 'muscular', 'plus_size', 'prefer_not_to_say')
  ),
  add column interests text[] not null default '{}',
  add column education_level text check (
    education_level in ('high_school', 'some_college', 'bachelors', 'masters', 'doctorate', 'trade_professional', 'prefer_not_to_say')
  ),
  add column religion text check (
    religion in ('christian', 'muslim', 'traditional', 'other', 'none', 'prefer_not_to_say')
  ),
  add column marital_status text check (
    marital_status in ('never_married', 'divorced', 'widowed', 'separated')
  ),
  add column children_count smallint not null default 0 check (children_count >= 0),
  add column wants_children text check (wants_children in ('yes', 'no', 'not_sure')),
  add column genotype text check (genotype in ('AA', 'AS', 'SS', 'AC', 'SC', 'CC', 'unknown')),
  add column is_single_parent boolean not null default false;

-- One row per user: what they're looking for, separate from who they are.
-- Kept private to the owner and admins (not browsable like profiles are) —
-- this is search criteria, not something shown to a prospective match.
create table public.partner_preferences (
  id uuid primary key references public.profiles (id) on delete cascade,
  min_age smallint check (min_age >= 18),
  max_age smallint check (max_age >= min_age),
  qualities text[] not null default '{}',
  deal_breakers text[] not null default '{}',
  max_distance_km smallint,
  updated_at timestamptz not null default now()
);

alter table public.partner_preferences enable row level security;

create trigger partner_preferences_set_updated_at
  before update on public.partner_preferences
  for each row execute function public.set_updated_at();

create policy "users can read their own partner preferences"
  on public.partner_preferences for select
  using (auth.uid() = id);

create policy "admins can read all partner preferences"
  on public.partner_preferences for select
  using (public.is_admin(auth.uid()));

create policy "users can insert their own partner preferences"
  on public.partner_preferences for insert
  with check (auth.uid() = id);

create policy "users can update their own partner preferences"
  on public.partner_preferences for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

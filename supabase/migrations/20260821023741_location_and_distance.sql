-- Location lives in its own table, locked to the owner only — no policy
-- grants read access to anyone else, not even via select(*). Exact
-- coordinates are a real safety concern (a stalking vector) for an app
-- whose whole premise is introducing strangers, so distance is computed
-- server-side in nearby_profile_ids() and only a rounded km figure ever
-- reaches another user's client, never the raw lat/lng.

create table public.profile_locations (
  id uuid primary key references public.profiles (id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  updated_at timestamptz not null default now()
);

alter table public.profile_locations enable row level security;

create trigger profile_locations_set_updated_at
  before update on public.profile_locations
  for each row execute function public.set_updated_at();

create policy "users can read their own location"
  on public.profile_locations for select
  using (auth.uid() = id);

create policy "users can insert their own location"
  on public.profile_locations for insert
  with check (auth.uid() = id);

create policy "users can update their own location"
  on public.profile_locations for update
  using (auth.uid() = id);

-- Great-circle distance (spherical law of cosines). Returns only the other
-- party's id and a rounded distance — never coordinates.
create function public.nearby_profile_ids(p_max_distance_km double precision)
returns table (profile_id uuid, distance_km numeric)
language sql
stable
security definer
set search_path = public
as $$
  select
    other.id as profile_id,
    round(
      (
        6371 * acos(
          least(1.0, greatest(-1.0,
            sin(radians(me.latitude)) * sin(radians(other.latitude)) +
            cos(radians(me.latitude)) * cos(radians(other.latitude)) *
              cos(radians(other.longitude) - radians(me.longitude))
          ))
        )
      )::numeric,
      1
    ) as distance_km
  from public.profile_locations me
  join public.profile_locations other on other.id <> me.id
  where me.id = auth.uid()
    and (
      6371 * acos(
        least(1.0, greatest(-1.0,
          sin(radians(me.latitude)) * sin(radians(other.latitude)) +
          cos(radians(me.latitude)) * cos(radians(other.latitude)) *
            cos(radians(other.longitude) - radians(me.longitude))
        ))
      )
    ) <= p_max_distance_km;
$$;

grant execute on function public.nearby_profile_ids(double precision) to authenticated;

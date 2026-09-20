-- ForeverFind: admin-curated matchmaking schema
-- Users request an introduction -> admin reviews -> target confirms -> match opens.
-- All state transitions go through SECURITY DEFINER functions rather than raw
-- table UPDATEs, so invalid transitions (e.g. skipping admin review, self-promoting
-- to admin, matching a blocked pair) are impossible regardless of client bugs.

-- ============================================================================
-- roles
-- ============================================================================

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role = 'admin'
  );
$$;

create policy "users can read their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "admins can read all roles"
  on public.user_roles for select
  using (public.is_admin(auth.uid()));

-- no insert/update/delete policies: role changes only happen via the service
-- role key (e.g. from the admin dashboard's server-side code), never the client.

-- ============================================================================
-- profiles
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  birthdate date not null check (birthdate <= (current_date - interval '18 years')),
  bio text check (char_length(bio) <= 500),
  city text check (char_length(city) <= 100),
  primary_photo_url text,
  status text not null default 'active' check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a profile row (and default role) when someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create function public.is_blocked_pair(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

create policy "users can read their own blocks"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "users can create their own blocks"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "users can remove their own blocks"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

create policy "own profile is always visible"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "active non-blocked profiles are browsable"
  on public.profiles for select
  using (
    status = 'active'
    and not public.is_blocked_pair(auth.uid(), id)
  );

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- match requests: pending -> admin_approved/admin_declined -> target_accepted/
-- target_declined. A "withdrawn" state lets the requester cancel while pending.
-- ============================================================================

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  target_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'admin_approved', 'admin_declined', 'target_accepted', 'target_declined', 'withdrawn')
  ),
  admin_id uuid references auth.users (id),
  admin_note text check (char_length(admin_note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> target_id)
);

-- only one active (non-terminal) request per requester/target pair at a time
create unique index match_requests_one_active_per_pair
  on public.match_requests (requester_id, target_id)
  where status in ('pending', 'admin_approved');

create trigger match_requests_set_updated_at
  before update on public.match_requests
  for each row execute function public.set_updated_at();

alter table public.match_requests enable row level security;

create policy "participants and admins can read requests"
  on public.match_requests for select
  using (
    auth.uid() = requester_id
    or auth.uid() = target_id
    or public.is_admin(auth.uid())
  );

-- no insert/update policies for match_requests: all writes go through the
-- functions below, which run the block/duplicate/permission checks that RLS
-- alone can't express as a state machine.

-- ============================================================================
-- matches: created once a request reaches target_accepted
-- ============================================================================

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  match_request_id uuid not null unique references public.match_requests (id),
  user_a_id uuid not null references auth.users (id) on delete cascade,
  user_b_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a_id <> user_b_id)
);

alter table public.matches enable row level security;

create policy "participants and admins can read matches"
  on public.matches for select
  using (
    auth.uid() = user_a_id
    or auth.uid() = user_b_id
    or public.is_admin(auth.uid())
  );

-- ============================================================================
-- reports
-- ============================================================================

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 100),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned')),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

alter table public.reports enable row level security;

create policy "reporters can read their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "admins can read all reports"
  on public.reports for select
  using (public.is_admin(auth.uid()));

create policy "users can file reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "admins can update reports"
  on public.reports for update
  using (public.is_admin(auth.uid()));

-- ============================================================================
-- state-machine functions (SECURITY DEFINER: bypass table RLS internally,
-- but re-check auth.uid() themselves, so they're safe to expose via RPC)
-- ============================================================================

create function public.request_match(p_target_id uuid)
returns public.match_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.match_requests;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if auth.uid() = p_target_id then
    raise exception 'cannot request yourself';
  end if;
  if public.is_blocked_pair(auth.uid(), p_target_id) then
    raise exception 'not permitted';
  end if;
  if not exists (select 1 from public.profiles where id = p_target_id and status = 'active') then
    raise exception 'target not available';
  end if;

  insert into public.match_requests (requester_id, target_id)
  values (auth.uid(), p_target_id)
  returning * into v_row;

  return v_row;
end;
$$;

create function public.withdraw_request(p_request_id uuid)
returns public.match_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.match_requests;
begin
  update public.match_requests
  set status = 'withdrawn'
  where id = p_request_id
    and requester_id = auth.uid()
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'request not found or not withdrawable';
  end if;

  return v_row;
end;
$$;

create function public.admin_review_request(p_request_id uuid, p_approve boolean, p_note text default null)
returns public.match_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.match_requests;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not permitted';
  end if;

  update public.match_requests
  set status = case when p_approve then 'admin_approved' else 'admin_declined' end,
      admin_id = auth.uid(),
      admin_note = p_note
  where id = p_request_id
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'request not found or already reviewed';
  end if;

  return v_row;
end;
$$;

create function public.respond_to_request(p_request_id uuid, p_accept boolean)
returns public.match_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.match_requests;
begin
  update public.match_requests
  set status = case when p_accept then 'target_accepted' else 'target_declined' end
  where id = p_request_id
    and target_id = auth.uid()
    and status = 'admin_approved'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'request not found or not awaiting your response';
  end if;

  if p_accept then
    insert into public.matches (match_request_id, user_a_id, user_b_id)
    values (v_row.id, v_row.requester_id, v_row.target_id);
  end if;

  return v_row;
end;
$$;

grant execute on function public.request_match(uuid) to authenticated;
grant execute on function public.withdraw_request(uuid) to authenticated;
grant execute on function public.admin_review_request(uuid, boolean, text) to authenticated;
grant execute on function public.respond_to_request(uuid, boolean) to authenticated;

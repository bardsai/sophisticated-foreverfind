-- profiles.primary_photo_url is the publicly-visible, already-approved
-- photo — it's never written directly by a photo upload anymore. New
-- uploads go into photo_reviews as 'pending' and only land in
-- primary_photo_url once admin_review_photo() approves them, so a photo is
-- never visible to other members before a human has looked at it.

create table public.photo_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  photo_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text check (char_length(admin_note) <= 500),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index photo_reviews_profile_id_idx on public.photo_reviews (profile_id, created_at desc);
create index photo_reviews_pending_idx on public.photo_reviews (created_at) where status = 'pending';

alter table public.photo_reviews enable row level security;

create policy "users can read their own photo reviews"
  on public.photo_reviews for select
  using (auth.uid() = profile_id);

create policy "admins can read all photo reviews"
  on public.photo_reviews for select
  using (public.is_admin(auth.uid()));

-- No insert/update policy: submission and review both go through the
-- functions below so only one pending review exists per user and only an
-- admin can resolve one.

create function public.submit_photo_for_review(p_photo_url text)
returns public.photo_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.photo_reviews;
begin
  update public.photo_reviews
  set photo_url = p_photo_url, status = 'pending', reviewed_at = null, admin_note = null
  where profile_id = auth.uid() and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    insert into public.photo_reviews (profile_id, photo_url)
    values (auth.uid(), p_photo_url)
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

create function public.admin_review_photo(p_review_id uuid, p_approve boolean, p_note text default null)
returns public.photo_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.photo_reviews;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not permitted';
  end if;

  update public.photo_reviews
  set status = case when p_approve then 'approved' else 'rejected' end,
      admin_note = p_note,
      reviewed_at = now()
  where id = p_review_id
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'review not found or already resolved';
  end if;

  if p_approve then
    update public.profiles set primary_photo_url = v_row.photo_url where id = v_row.profile_id;
  end if;

  return v_row;
end;
$$;

grant execute on function public.submit_photo_for_review(text) to authenticated;
grant execute on function public.admin_review_photo(uuid, boolean, text) to authenticated;

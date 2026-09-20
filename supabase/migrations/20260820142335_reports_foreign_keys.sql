-- Same fix as profile_foreign_keys.sql: reports pointed at auth.users, which
-- PostgREST can't traverse to embed reporter/reported profiles in one query.
-- Repoint at public.profiles for the admin reports review screen.

alter table public.reports drop constraint reports_reporter_id_fkey;
alter table public.reports
  add constraint reports_reporter_id_fkey
  foreign key (reporter_id) references public.profiles (id) on delete cascade;

alter table public.reports drop constraint reports_reported_id_fkey;
alter table public.reports
  add constraint reports_reported_id_fkey
  foreign key (reported_id) references public.profiles (id) on delete cascade;

-- Resolving a report is an admin-only cross-user action, same shape as
-- admin_review_request: goes through a SECURITY DEFINER function rather than
-- a raw RLS-gated UPDATE, so there's no need for a broad "admins can update
-- any profile" policy just to support the optional suspend.
create function public.admin_resolve_report(
  p_report_id uuid,
  p_status text,
  p_suspend_reported boolean default false
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.reports;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not permitted';
  end if;
  if p_status not in ('reviewed', 'actioned') then
    raise exception 'invalid status';
  end if;

  update public.reports
  set status = p_status
  where id = p_report_id
    and status = 'open'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'report not found or already resolved';
  end if;

  if p_suspend_reported then
    update public.profiles set status = 'suspended' where id = v_row.reported_id;
  end if;

  return v_row;
end;
$$;

grant execute on function public.admin_resolve_report(uuid, text, boolean) to authenticated;

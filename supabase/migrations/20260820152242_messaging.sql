-- Messages belong to a match 1:1 as its conversation thread — no separate
-- conversations table needed since matches are already the unique pairing.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_match_id_created_at_idx on public.messages (match_id, created_at);

alter table public.messages enable row level security;

create policy "match participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- No insert policy: sending goes through send_message(), which also checks
-- for a block between the two participants (matching could predate a block
-- made afterward, so this can't be assumed away).
create function public.send_message(p_match_id uuid, p_body text)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_other uuid;
  v_row public.messages;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match not found';
  end if;
  if auth.uid() not in (v_match.user_a_id, v_match.user_b_id) then
    raise exception 'not permitted';
  end if;

  v_other := case when v_match.user_a_id = auth.uid() then v_match.user_b_id else v_match.user_a_id end;
  if public.is_blocked_pair(auth.uid(), v_other) then
    raise exception 'not permitted';
  end if;

  insert into public.messages (match_id, sender_id, body)
  values (p_match_id, auth.uid(), trim(p_body))
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.send_message(uuid, text) to authenticated;

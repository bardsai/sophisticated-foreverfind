alter table public.partner_preferences
  add column preferred_children_count smallint
    check (preferred_children_count between 0 and 20);

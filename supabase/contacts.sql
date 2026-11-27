-- Run once in Supabase → SQL Editor → New query → Run

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  full_name text not null,
  name_shortcut text not null,
  name_shortcut_color_code integer not null default 1,
  email text not null unique,
  phone text not null,
  img text not null default '',
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- Guests use signInAnonymously and count as authenticated.
drop policy if exists "contacts_select_all" on public.contacts;
drop policy if exists "contacts_insert_all" on public.contacts;
drop policy if exists "contacts_update_all" on public.contacts;
drop policy if exists "contacts_delete_all" on public.contacts;

create policy "contacts_select_all"
  on public.contacts for select
  to authenticated
  using (true);

create policy "contacts_insert_all"
  on public.contacts for insert
  to authenticated
  with check (true);

create policy "contacts_update_all"
  on public.contacts for update
  to authenticated
  using (true)
  with check (true);

create policy "contacts_delete_all"
  on public.contacts for delete
  to authenticated
  using (true);

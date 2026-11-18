-- Run once in Supabase → SQL Editor → New query → Run
-- Status values must match the app: toDo | inProgress | awaitFeedback | done

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  assigned_to uuid[] not null default '{}',
  status text not null check (status in ('toDo', 'inProgress', 'awaitFeedback', 'done')),
  due_date date,
  prio text not null check (prio in ('Urgent', 'Medium', 'Low')),
  category text not null check (category in ('Technical Task', 'User Story')),
  sub_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_all" on public.tasks;
drop policy if exists "tasks_insert_all" on public.tasks;
drop policy if exists "tasks_update_all" on public.tasks;
drop policy if exists "tasks_delete_all" on public.tasks;

create policy "tasks_select_all"
  on public.tasks for select
  to anon, authenticated
  using (true);

create policy "tasks_insert_all"
  on public.tasks for insert
  to anon, authenticated
  with check (true);

create policy "tasks_update_all"
  on public.tasks for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "tasks_delete_all"
  on public.tasks for delete
  to anon, authenticated
  using (true);

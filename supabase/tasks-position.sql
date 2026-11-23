-- Run once in Supabase → SQL Editor → New query → Run (after tasks.sql)
-- Adds the place of a card on the board, so the order of the cards is saved.

alter table public.tasks add column if not exists position integer;

-- Number the existing tasks in the order they were created.
with numbered as (
  select id, row_number() over (order by created_at) - 1 as place
  from public.tasks
)
update public.tasks as task
set position = numbered.place
from numbered
where task.id = numbered.id
  and task.position is null;

-- Let the API know about the new column.
notify pgrst, 'reload schema';

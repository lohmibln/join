-- Run once in Supabase → SQL Editor
-- Enables live updates for the contacts table (needed for Realtime in the app).

alter publication supabase_realtime add table public.contacts;

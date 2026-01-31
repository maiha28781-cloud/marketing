-- Force add tasks to supabase_realtime
-- This ensures that INSERT, UPDATE, DELETE events are sent to clients
begin;
  -- Remove first to be safe (idempotent-ish)
  alter publication supabase_realtime drop table public.tasks;
  -- Add it back
  alter publication supabase_realtime add table public.tasks;
commit;

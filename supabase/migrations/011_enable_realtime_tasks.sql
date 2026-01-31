-- Enable Realtime for tasks table
-- This allows Kanban board to update instantly when tasks change

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
END
$$;

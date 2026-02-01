-- Safely enable Realtime (Check if already enabled first to avoid errors)

DO $$
BEGIN
  -- 1. Profiles (Salary, Rates)
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;

  -- 2. KPIs (Target changes)
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'kpis') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE kpis;
  END IF;

  -- 3. Tasks (Status changes)
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;

  -- 4. Content Items (Status changes)
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'content_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE content_items;
  END IF;
END $$;

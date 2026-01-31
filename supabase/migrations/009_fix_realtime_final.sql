-- 009_fix_realtime_final.sql

-- 1. Ensure Table Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;


-- 2. Force Enable Realtime (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END
$$;

-- 3. Reset RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System/Admin can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;

-- Re-create Policies
-- READ: Users see their own
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- WRITE (Insert): Any authenticated user can insert (for assigning tasks to others)
CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- WRITE (Update): Users can update their own (for marking as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);


-- Fix RLS Policy for Notification Creation
  
-- Drop existing overly restrictive policy
DROP POLICY IF EXISTS "System/Admin can insert notifications" ON notifications;

-- Create new policy allowing authenticated users to insert notifications for others
CREATE POLICY "Authenticated users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Ensure all profiles are visible to all authenticated users
-- This allows Members to see Admins in the assignment list

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure Tasks can be assigned to anyone (INSERT check)
-- Existing policy "Users can create tasks" doesn't restrict assigned_to, but let's double check RLS
-- (It was: WITH CHECK (auth.uid() = created_by)) -> this is fine, it only validates creator.

-- Just in case there is a "Users can update tasks" policy that interferes during doing/review?
-- No, the issue is "Giao Task" (Creation/Assignment).

-- Migration: Restrict write access for 'Member' position users
-- Description:
-- 1. Updates RLS policies for: tasks, campaigns, content_items, kpis
-- 2. READ (SELECT): Open to all authenticated users.
-- 3. WRITE (INSERT, UPDATE, DELETE): Restricted to 'admin' role OR users with position != 'Member'

-- =================================================================
-- 1. TASKS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tasks;
DROP POLICY IF EXISTS "Enable update for users" ON public.tasks;
DROP POLICY IF EXISTS "Enable delete for users" ON public.tasks;

-- Read: Everyone can read
CREATE POLICY "Enable read access for all users"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

-- Write: Only Admin OR Non-Member Positions
CREATE POLICY "Enable insert for authorized users"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);

CREATE POLICY "Enable update for authorized users"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);

CREATE POLICY "Enable delete for authorized users"
ON public.tasks FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);


-- =================================================================
-- 2. CAMPAIGNS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.campaigns;
DROP POLICY IF EXISTS "Enable update for users" ON public.campaigns;
DROP POLICY IF EXISTS "Enable delete for users" ON public.campaigns;

CREATE POLICY "Enable read access for all users"
ON public.campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write for authorized users"
ON public.campaigns FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);


-- =================================================================
-- 3. CONTENT_ITEMS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.content_items;
DROP POLICY IF EXISTS "Enable write access for all users" ON public.content_items;

CREATE POLICY "Enable read access for all users"
ON public.content_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write for authorized users"
ON public.content_items FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);


-- =================================================================
-- 4. KPIS Policies
-- =================================================================
-- Assuming KPIs usually managed by Admin/Manager, but let's apply same rule
DROP POLICY IF EXISTS "Enable read access for all users" ON public.kpis;
DROP POLICY IF EXISTS "Enable write access for all users" ON public.kpis;

CREATE POLICY "Enable read access for all users"
ON public.kpis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write for authorized users"
ON public.kpis FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR position != 'Member'
  )
);

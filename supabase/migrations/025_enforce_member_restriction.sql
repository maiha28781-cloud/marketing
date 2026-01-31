-- Migration: Enforcement of Member Restriction (Case Insensitive)
-- Description:
-- Re-applies the restriction policies with LOWER() check to be safe against case sensitivity issues.
-- Ensures that 'Member', 'member', 'MEMBER' are all restricted.

-- =================================================================
-- 1. TASKS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable insert for authorized users" ON public.tasks;
DROP POLICY IF EXISTS "Enable update for authorized users" ON public.tasks;
DROP POLICY IF EXISTS "Enable delete for authorized users" ON public.tasks;

CREATE POLICY "Enable insert for authorized users"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);

CREATE POLICY "Enable update for authorized users"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);

CREATE POLICY "Enable delete for authorized users"
ON public.tasks FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);


-- =================================================================
-- 2. CAMPAIGNS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable write for authorized users" ON public.campaigns;

CREATE POLICY "Enable write for authorized users"
ON public.campaigns FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);


-- =================================================================
-- 3. CONTENT_ITEMS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable write for authorized users" ON public.content_items;

CREATE POLICY "Enable write for authorized users"
ON public.content_items FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);


-- =================================================================
-- 4. KPIS Policies
-- =================================================================
DROP POLICY IF EXISTS "Enable write for authorized users" ON public.kpis;

CREATE POLICY "Enable write for authorized users"
ON public.kpis FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' OR LOWER(position) != 'member'
  )
);

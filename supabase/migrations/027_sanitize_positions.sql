-- Migration: Sanitize Position Data
-- Description:
-- 1. Trims whitespace from all positions.
-- 2. Standardizes 'Member' variations to 'Member'.
-- 3. Ensures RLS is enabled (again).

-- 1. Trim whitespace
UPDATE public.profiles
SET position = TRIM(position);

-- 2. Normalize 'member' variations
UPDATE public.profiles
SET position = 'Member'
WHERE LOWER(position) = 'member';

-- 3. Ensure RLS enabled check (again)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- 4. Debugging: Make sure the policy actually sees the changes
-- (Re-run the restrictive policy just to be theoretically sure, similar to 025 but cleanest)
DROP POLICY IF EXISTS "Enable insert for authorized users" ON public.tasks;

CREATE POLICY "Enable insert for authorized users"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' 
    OR (position IS NOT NULL AND LOWER(position) != 'member')
  )
);

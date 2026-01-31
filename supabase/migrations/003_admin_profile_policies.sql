-- Add RLS policy for admins to update any profile
-- This allows Team Management feature to work

-- Drop the old policy if exists and recreate
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also ensure admins can insert profiles (for future user management)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

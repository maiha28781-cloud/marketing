-- NUCLEAR FIX FOR ADMIN PERMISSIONS
-- Using a SECURITY DEFINER function to bypass any RLS on the profiles table.

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Content Items Policy
DROP POLICY IF EXISTS "admin_all" ON public.content_items;
DROP POLICY IF EXISTS "Admins can manage content items" ON public.content_items; -- cleanup old

CREATE POLICY "admin_all" ON public.content_items
    FOR ALL
    TO authenticated
    USING ( public.is_admin() );

-- 3. Update Campaigns Policy (to be safe)
DROP POLICY IF EXISTS "admin_manage_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns; -- cleanup old

CREATE POLICY "admin_manage_campaigns" ON public.campaigns
    FOR ALL
    TO authenticated
    USING ( public.is_admin() );

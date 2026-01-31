-- COMPREHENSIVE FIX FOR DELETION PERMISSIONS
-- 1. Fix the is_admin function to be bulletproof
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user exists and has admin role
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$;

-- 2. Drop FORCE DELETE RPC (We will rely on RLS if possible, or re-create it safer)
DROP FUNCTION IF EXISTS public.force_delete_content(UUID);

-- 3. Reset RLS Policies for content_items
ALTER TABLE public.content_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all" ON public.content_items;
DROP POLICY IF EXISTS "Admins can manage content items" ON public.content_items;
DROP POLICY IF EXISTS "view_content" ON public.content_items;
DROP POLICY IF EXISTS "create_content" ON public.content_items;
DROP POLICY IF EXISTS "member_manage_own" ON public.content_items;
DROP POLICY IF EXISTS "member_delete_own" ON public.content_items;

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Granular Policies (Safer than 'ALL')

-- 4.1. VIEW (All Authenticated)
CREATE POLICY "policy_view_content"
ON public.content_items FOR SELECT TO authenticated
USING (true);

-- 4.2. INSERT (Authenticated, must be creator)
CREATE POLICY "policy_insert_content"
ON public.content_items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 4.3. UPDATE (Admin OR Owner OR Assignee)
CREATE POLICY "policy_update_content"
ON public.content_items FOR UPDATE TO authenticated
USING (
    public.is_admin() OR 
    auth.uid() = created_by OR 
    auth.uid() = assignee_id
);

-- 4.4. DELETE (Admin OR Owner) - HERE IS THE CRITICAL PART
CREATE POLICY "policy_delete_content"
ON public.content_items FOR DELETE TO authenticated
USING (
    public.is_admin() OR 
    auth.uid() = created_by
);

-- 5. Grant Permissions (Just in case)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

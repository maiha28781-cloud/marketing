-- FINAL FIX FOR CONTENT DELETION PERMISSIONS
-- This script clears all existing RLS policies on content_items and sets up simple, correct ones.

-- 1. Reset: Drop all existing policies to ensure no conflicts
DROP POLICY IF EXISTS "Admins can manage content items" ON public.content_items;
DROP POLICY IF EXISTS "Admins have full access" ON public.content_items;
DROP POLICY IF EXISTS "Everyone can view content items" ON public.content_items;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.content_items;
DROP POLICY IF EXISTS "Members can create content items" ON public.content_items;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.content_items;
DROP POLICY IF EXISTS "Members can update own content items" ON public.content_items;
DROP POLICY IF EXISTS "Members manage own content" ON public.content_items;
DROP POLICY IF EXISTS "Members can delete own content items" ON public.content_items;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- 3. READ: Everyone can view all content
CREATE POLICY "view_content" ON public.content_items
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. INSERT: Authenticated users can create content
CREATE POLICY "create_content" ON public.content_items
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- 5. ADMIN: Full authority (Update/Delete ANY item)
CREATE POLICY "admin_all" ON public.content_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 6. MEMBER: Update/Delete ONLY their own items
CREATE POLICY "member_manage_own" ON public.content_items
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "member_delete_own" ON public.content_items
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

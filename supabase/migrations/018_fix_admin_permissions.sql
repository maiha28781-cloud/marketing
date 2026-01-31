-- Fix Admin permissions for content_items
-- Ensure Admins can manage (INSERT, UPDATE, DELETE) any content item
DROP POLICY IF EXISTS "Admins can manage content items" ON public.content_items;
CREATE POLICY "Admins can manage content items"
    ON public.content_items
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Also ensure Admins can manage any campaign
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns"
    ON public.campaigns
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- RPC: Force Delete Content (Admin Only)
-- This function allows an admin to delete a content item regardless of RLS, 
-- but strictly checks admin status first.

CREATE OR REPLACE FUNCTION public.force_delete_content(target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- 1. Check if the executing user is an admin
    -- We use the previously created safe check, or direct query
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin_user;

    IF NOT is_admin_user THEN
        RAISE EXCEPTION 'Access Denied: Only Admins can force delete.';
    END IF;

    -- 2. Perform Delete
    DELETE FROM public.content_items WHERE id = target_id;

    -- 3. Return true if deleted
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE; 
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify admins when content is created by a member
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_content()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    creator_name TEXT;
    creator_role TEXT;
BEGIN
    -- Get creator's name and role
    SELECT full_name, role INTO creator_name, creator_role FROM public.profiles WHERE id = NEW.created_by;

    -- IF creator is ADMIN, DO NOT NOTIFY anyone.
    IF creator_role = 'admin' THEN
        RETURN NEW;
    END IF;

    -- Loop through all admins and insert notification
    FOR admin_id IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
        -- Don't notify the creator themselves (redundant check since we exit if admin, but safe to keep if logic changes)
        IF admin_id != NEW.created_by THEN
            INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
            VALUES (
                admin_id,
                'content_created',
                'New Content Created',
                COALESCE(creator_name, 'A member') || ' created new content: ' || NEW.title,
                '/calendar?contentId=' || NEW.id, -- Link to specific content
                jsonb_build_object('content_id', NEW.id, 'campaign_id', NEW.campaign_id)
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_content_created ON public.content_items;
CREATE TRIGGER on_content_created
    AFTER INSERT ON public.content_items
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_on_new_content();

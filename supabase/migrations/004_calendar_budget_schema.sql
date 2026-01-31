-- Create Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_total NUMERIC DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Content Items table
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('social_post', 'blog_post', 'video', 'ad_creative', 'email', 'other')),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'tiktok', 'youtube', 'instagram', 'website', 'email', 'linkedin', 'other')),
    status TEXT NOT NULL CHECK (status IN ('idea', 'draft', 'review', 'scheduled', 'published', 'cancelled')) DEFAULT 'idea',
    scheduled_date TIMESTAMPTZ,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_url TEXT,
    media_urls TEXT[], -- Array of URLs for attachments
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Campaigns Policies
-- Admins have full access
CREATE POLICY "Admins can manage campaigns"
    ON public.campaigns
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Everyone can view campaigns
CREATE POLICY "Everyone can view campaigns"
    ON public.campaigns
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Content Items Policies
-- Admins have full access
CREATE POLICY "Admins can manage content items"
    ON public.content_items
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Everyone can view content items (for calendar visibility)
CREATE POLICY "Everyone can view content items"
    ON public.content_items
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Members can create content items
CREATE POLICY "Members can create content items"
    ON public.content_items
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Members can update content items they created or are assigned to
CREATE POLICY "Members can update own content items"
    ON public.content_items
    FOR UPDATE
    USING (
        auth.uid() = created_by OR
        auth.uid() = assignee_id
    );

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON public.content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

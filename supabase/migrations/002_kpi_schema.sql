-- Create KPIs table for tracking team performance metrics
CREATE TABLE IF NOT EXISTS public.kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- KPI Metadata
    name TEXT NOT NULL, -- e.g., "Số bài viết", "Số video", "Số lead"
    description TEXT,
    kpi_type TEXT NOT NULL CHECK (kpi_type IN (
        'content_articles',    -- Số bài viết
        'content_videos',      -- Số video
        'content_images',      -- Số hình ảnh
        'leads',               -- Số lead
        'engagement_rate',     -- Engagement rate (%)
        'other'                -- Custom KPI
    )),
    
    -- Values
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT, -- e.g., "bài viết", "video", "leads", "%"
    
    -- Period
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kpis_user_id ON public.kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_kpis_period ON public.kpis(period);
CREATE INDEX IF NOT EXISTS idx_kpis_date_range ON public.kpis(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_kpis_type ON public.kpis(kpi_type);

-- Enable Row Level Security
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KPIs
-- 1. Members can view their own KPIs
CREATE POLICY "Users can view own KPIs"
    ON public.kpis
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Admins can view all KPIs
CREATE POLICY "Admins can view all KPIs"
    ON public.kpis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 3. Only admins can create KPIs
CREATE POLICY "Only admins can create KPIs"
    ON public.kpis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Admins can update any KPI
CREATE POLICY "Admins can update all KPIs"
    ON public.kpis
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Users can update their own KPI progress (current_value only)
CREATE POLICY "Users can update own KPI progress"
    ON public.kpis
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Only admins can delete KPIs
CREATE POLICY "Only admins can delete KPIs"
    ON public.kpis
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kpis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER kpis_updated_at
    BEFORE UPDATE ON public.kpis
    FOR EACH ROW
    EXECUTE FUNCTION update_kpis_updated_at();

-- Create KPI history table for tracking progress over time
CREATE TABLE IF NOT EXISTS public.kpi_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE NOT NULL,
    value NUMERIC NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Index for KPI history
CREATE INDEX IF NOT EXISTS idx_kpi_history_kpi_id ON public.kpi_history(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_history_recorded_at ON public.kpi_history(recorded_at);

-- Enable RLS on KPI history
ALTER TABLE public.kpi_history ENABLE ROW LEVEL SECURITY;

-- KPI History policies (same as KPIs)
CREATE POLICY "Users can view own KPI history"
    ON public.kpi_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.kpis
            WHERE kpis.id = kpi_history.kpi_id
            AND kpis.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all KPI history"
    ON public.kpi_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins and owners can insert KPI history"
    ON public.kpi_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.kpis
            WHERE kpis.id = kpi_history.kpi_id
            AND (kpis.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            ))
        )
    );

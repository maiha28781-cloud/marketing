-- Facebook Ads Integration Schema
-- Migration 040: Tables for storing Facebook Ads data and metrics configuration

-- =====================================================
-- Table 1: Facebook Ad Accounts Connection
-- =====================================================
CREATE TABLE IF NOT EXISTS public.facebook_ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT UNIQUE NOT NULL, -- Facebook Ad Account ID (e.g., "act_123456789")
    account_name TEXT,
    access_token TEXT NOT NULL, -- TODO: Should be encrypted in production
    token_expires_at TIMESTAMPTZ,
    connected_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.facebook_ad_accounts IS 'Stores connected Facebook Ads accounts and their access tokens';
COMMENT ON COLUMN public.facebook_ad_accounts.account_id IS 'Facebook Ad Account ID from Meta';
COMMENT ON COLUMN public.facebook_ad_accounts.access_token IS 'OAuth access token - should be encrypted';

-- =====================================================
-- Table 2: Ad Metrics Configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ad_metrics_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key TEXT UNIQUE NOT NULL, -- 'ctr', 'video_view_3s', 'reach', 'spend'
    display_name TEXT NOT NULL,
    description TEXT,
    fb_api_field TEXT NOT NULL, -- Actual field name in Facebook API
    data_type TEXT NOT NULL DEFAULT 'number' CHECK (data_type IN ('number', 'percentage', 'currency')),
    enabled BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ad_metrics_config IS 'Configuration for available Facebook Ads metrics';
COMMENT ON COLUMN public.ad_metrics_config.metric_key IS 'Internal key for this metric';
COMMENT ON COLUMN public.ad_metrics_config.fb_api_field IS 'Corresponding field name in Facebook Graph API';

-- =====================================================
-- Table 3: Ad Campaign Performance Data
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ad_campaign_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fb_account_id UUID REFERENCES public.facebook_ad_accounts(id) ON DELETE CASCADE NOT NULL,
    campaign_id TEXT NOT NULL, -- Facebook Campaign ID
    campaign_name TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Metrics stored as JSONB for flexibility
    -- Example: {"ctr": 2.5, "video_view_3s": 1200, "spend": 500000, "reach": 10000}
    metrics JSONB NOT NULL,
    
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(fb_account_id, campaign_id, date)
);

COMMENT ON TABLE public.ad_campaign_data IS 'Daily campaign performance data from Facebook Ads';
COMMENT ON COLUMN public.ad_campaign_data.metrics IS 'Campaign metrics in flexible JSONB format';

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_facebook_ad_accounts_connected_by 
    ON public.facebook_ad_accounts(connected_by);

CREATE INDEX IF NOT EXISTS idx_facebook_ad_accounts_is_active 
    ON public.facebook_ad_accounts(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ad_metrics_config_enabled 
    ON public.ad_metrics_config(enabled) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_ad_metrics_config_display_order 
    ON public.ad_metrics_config(display_order);

CREATE INDEX IF NOT EXISTS idx_ad_campaign_data_fb_account 
    ON public.ad_campaign_data(fb_account_id);

CREATE INDEX IF NOT EXISTS idx_ad_campaign_data_date 
    ON public.ad_campaign_data(date DESC);

CREATE INDEX IF NOT EXISTS idx_ad_campaign_data_campaign 
    ON public.ad_campaign_data(campaign_id);

-- GIN index for JSONB metrics querying
CREATE INDEX IF NOT EXISTS idx_ad_campaign_data_metrics 
    ON public.ad_campaign_data USING GIN (metrics);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.facebook_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies: facebook_ad_accounts
-- =====================================================

-- Policy: Admins can manage Facebook accounts
CREATE POLICY "Admins can manage FB accounts"
    ON public.facebook_ad_accounts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: All authenticated users can view connected accounts (read-only for members)
CREATE POLICY "All users can view FB accounts"
    ON public.facebook_ad_accounts
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- RLS Policies: ad_metrics_config
-- =====================================================

-- Policy: Everyone can view metrics configuration
CREATE POLICY "Everyone can view metrics config"
    ON public.ad_metrics_config
    FOR SELECT
    USING (true);

-- Policy: Only admins can update metrics config
CREATE POLICY "Admins can update metrics config"
    ON public.ad_metrics_config
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- RLS Policies: ad_campaign_data
-- =====================================================

-- Policy: All authenticated users can view campaign data
CREATE POLICY "All users can view ad campaign data"
    ON public.ad_campaign_data
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert/update/delete campaign data
CREATE POLICY "Admins can manage ad campaign data"
    ON public.ad_campaign_data
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- Function: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_facebook_ad_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for facebook_ad_accounts
CREATE TRIGGER facebook_ad_accounts_updated_at
    BEFORE UPDATE ON public.facebook_ad_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_facebook_ad_accounts_updated_at();

-- =====================================================
-- Seed Data: Popular Facebook Ads Metrics
-- =====================================================
INSERT INTO public.ad_metrics_config (metric_key, display_name, description, fb_api_field, data_type, enabled, display_order)
VALUES
    ('ctr', 'CTR (%)', 'Click-through Rate', 'ctr', 'percentage', true, 1),
    ('video_view_3s', 'Video Views >3s', 'ThruPlay video views (watched for at least 3 seconds)', 'video_thruplay_watched_actions', 'number', true, 2),
    ('reach', 'Reach', 'Số người tiếp cận duy nhất', 'reach', 'number', false, 3),
    ('impressions', 'Impressions', 'Tổng số lần hiển thị', 'impressions', 'number', false, 4),
    ('spend', 'Chi phí (VND)', 'Tổng chi phí quảng cáo', 'spend', 'currency', false, 5),
    ('clicks', 'Clicks', 'Tổng số lượt click', 'clicks', 'number', false, 6),
    ('conversions', 'Conversions', 'Số lượng chuyển đổi', 'conversions', 'number', false, 7),
    ('cost_per_result', 'Cost per Result', 'Chi phí trung bình cho mỗi kết quả', 'cost_per_action_type', 'currency', false, 8)
ON CONFLICT (metric_key) DO NOTHING;

-- =====================================================
-- Grant Permissions
-- =====================================================
-- Giữ nguyên quyền mặc định của Supabase RLS
-- Không cần GRANT explicit vì đã có RLS policies

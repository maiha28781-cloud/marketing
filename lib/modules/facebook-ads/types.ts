// Facebook Ads Integration Types
// Generated: 2026-02-07

export type FacebookAdAccount = {
    id: string
    account_id: string // Facebook Ad Account ID (e.g., "act_123456")
    account_name: string | null
    access_token: string
    token_expires_at: string | null
    connected_by: string
    connected_at: string
    last_sync_at: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export type AdMetricDataType = 'number' | 'percentage' | 'currency'

export type AdMetricsConfig = {
    id: string
    metric_key: string // 'ctr', 'video_view_3s', 'reach', etc.
    display_name: string
    description: string | null
    fb_api_field: string // Field name in Facebook Graph API
    data_type: AdMetricDataType
    enabled: boolean
    display_order: number
    created_at: string
}

export type AdCampaignData = {
    id: string
    fb_account_id: string
    campaign_id: string // Facebook Campaign ID
    campaign_name: string
    date: string // ISO date string (YYYY-MM-DD)
    metrics: Record<string, number> // Flexible metrics object
    synced_at: string
}

// Input types for server actions
export type ConnectFacebookAccountInput = {
    account_id: string
    account_name: string
    access_token: string
    token_expires_at?: string
}

export type SyncFacebookAdsDataInput = {
    fbAccountId: string
    dateRange: {
        since: string // YYYY-MM-DD
        until: string // YYYY-MM-DD
    }
    metrics?: string[] // Optional: specific metrics to fetch
}

export type UpdateMetricsConfigInput = {
    metricKeys: string[] // Array of metric_key to enable
}

// Facebook Graph API response types
export type FacebookCampaign = {
    id: string
    name: string
}

export type FacebookInsightsData = {
    campaign_id: string
    campaign_name: string
    date_start: string
    date_stop: string
    ctr?: string
    reach?: string
    impressions?: string
    spend?: string
    clicks?: string
    conversions?: number
    video_thruplay_watched_actions?: Array<{ value: string }>
    cost_per_action_type?: Array<{ value: string }>
}

// Display/View types
export type CampaignWithMetrics = {
    campaignId: string
    campaignName: string
    date: string
    metrics: Record<string, number>
}

export type EnabledMetric = {
    key: string
    displayName: string
    dataType: AdMetricDataType
}

// Constants
export const METRIC_KEYS = {
    CTR: 'ctr',
    VIDEO_VIEW_3S: 'video_view_3s',
    REACH: 'reach',
    IMPRESSIONS: 'impressions',
    SPEND: 'spend',
    CLICKS: 'clicks',
    CONVERSIONS: 'conversions',
    COST_PER_RESULT: 'cost_per_result',
} as const

export const FACEBOOK_API_VERSION = 'v18.0'
export const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`

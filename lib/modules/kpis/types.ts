export type KPIType =
    | 'content_articles'   // Số bài viết
    | 'content_videos'     // Số video
    | 'content_images'     // Số hình ảnh
    | 'leads'              // Số lead
    | 'engagement_rate'    // Engagement rate (%)
    | 'other'              // Custom KPI

export type KPIPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

// New tracking system types
export type TrackingSource = 'tasks' | 'content'

export type ContentType = 'blog_post' | 'video' | 'social_post' | 'content_organic' | 'ad_creative' | 'all'

export interface TrackingFilter {
    content_type?: ContentType
    priority?: 'low' | 'medium' | 'high'
    // Future extensibility: labels, tags, etc.
}

export interface KPI {
    id: string
    user_id: string

    // Metadata
    name: string
    description?: string
    kpi_type: KPIType // Kept for backward compatibility

    // Values
    target_value: number
    current_value: number
    unit?: string
    auto_track?: boolean

    // New tracking system
    tracking_source: TrackingSource
    tracking_filter: TrackingFilter

    // Period
    period: KPIPeriod
    start_date: string // ISO date
    end_date: string   // ISO date

    // Metadata
    created_by: string
    created_at: string
    updated_at: string

    // Joined data
    user?: {
        id: string
        full_name: string
        email: string
        position: string
    }
    creator?: {
        id: string
        full_name: string
    }
}

// ... (rest of interface)

// In CreateKPIInput
export interface CreateKPIInput {
    user_id: string
    name: string
    description?: string
    kpi_type: KPIType // Kept for backward compatibility
    target_value: number
    current_value?: number
    unit?: string
    auto_track?: boolean
    tracking_source: TrackingSource
    tracking_filter?: TrackingFilter
    period: KPIPeriod
    start_date: string
    end_date: string
}

// In UpdateKPIInput
export interface UpdateKPIInput {
    id: string
    name?: string
    description?: string
    target_value?: number
    current_value?: number
    auto_track?: boolean
    tracking_source?: TrackingSource
    tracking_filter?: TrackingFilter
    end_date?: string
}

export interface UpdateKPIProgressInput {
    id: string
    current_value: number
}

export interface KPIStats {
    total: number
    on_track: number      // >= 80% of target
    at_risk: number       // 50-79% of target
    behind: number        // < 50% of target
    completed: number     // >= 100% of target
}

export interface KPISummary {
    user_id: string
    user_name: string
    position: string
    total_kpis: number
    completed: number
    on_track: number
    at_risk: number
    behind: number
    avg_completion: number // Average percentage
}

// Helper type for chart data
export interface KPIChartData {
    name: string
    target: number
    current: number
    percentage: number
}

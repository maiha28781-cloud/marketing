export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'trash'
export type ContentType = 'social_post' | 'blog_post' | 'video' | 'ad_creative' | 'email' | 'other'
export type ContentPlatform = 'facebook' | 'tiktok' | 'youtube' | 'instagram' | 'website' | 'email' | 'linkedin' | 'other'
export type ContentStatus = 'idea' | 'draft' | 'review' | 'scheduled' | 'published' | 'cancelled' | 'approved' | 'running' | 'paused' | 'completed'

export interface Campaign {
    id: string
    name: string
    description?: string
    status: CampaignStatus
    start_date: string
    end_date: string
    budget_total: number
    created_by: string
    created_at: string
    updated_at: string
}

export interface ContentItem {
    id: string
    campaign_id?: string
    title: string
    type: ContentType
    platform: ContentPlatform
    status: ContentStatus
    scheduled_date?: string
    assignee_id?: string
    content_url?: string
    media_urls?: string[]
    estimated_cost: number
    actual_cost: number
    created_by: string
    created_at: string
    updated_at: string

    // Joined fields
    campaign?: {
        id: string
        name: string
    }
    assignee?: {
        id: string
        full_name: string
        avatar_url?: string
    }
}

export interface CreateCampaignInput {
    name: string
    description?: string
    status: CampaignStatus
    start_date: Date
    end_date: Date
    budget_total: number
}

export interface CreateContentItemInput {
    campaign_id?: string
    title: string
    type: ContentType
    platform: ContentPlatform
    status: ContentStatus
    scheduled_date?: Date
    assignee_id?: string
    estimated_cost?: number
    actual_cost?: number
    content_url?: string
}

export interface UpdateContentItemInput extends Partial<CreateContentItemInput> {
    id: string
    actual_cost?: number
}

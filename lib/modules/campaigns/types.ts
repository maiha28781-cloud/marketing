import { Campaign, ContentItem } from '@/lib/modules/calendar/types'

export interface CampaignBrief {
    objective?: string
    target_audience?: string
    key_messages?: string
    channels?: string[]
    notes?: string
}

export interface Campaign360 extends Campaign {
    phase?: 'briefing' | 'planning' | 'execution' | 'reporting'
    brief?: CampaignBrief
    target_leads?: number
    actual_leads?: number
    actual_revenue?: number
    // Enriched
    content_items?: ContentItem[]
    kpis?: Campaign360KPI[]
    budget_total: number
    spend_total: number
}

export interface Campaign360KPI {
    id: string
    title: string
    target_value: number
    current_value: number
    unit: string
    campaign_id?: string
}

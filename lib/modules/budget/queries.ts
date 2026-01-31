'use server'

import { createClient } from '@/lib/supabase/server'
import { Campaign, ContentItem } from '@/lib/modules/calendar/types'

export interface CampaignBudgetStats {
    id: string
    name: string
    budget_total: number
    spend_total: number
    spend_percent: number
    remaining: number
    status: string
    item_count: number
    items: ContentItem[]
    description?: string
}

export interface BudgetOverview {
    total_budget: number
    total_spend: number
    total_remaining: number
    total_over_budget: number
    spend_percent: number
    campaigns: CampaignBudgetStats[]
    recent_expenses: ContentItem[]
}

export async function getBudgetOverview(): Promise<BudgetOverview> {
    const supabase = await createClient()

    // Fetch active campaigns
    const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

    if (!campaignsData) return {
        total_budget: 0,
        total_spend: 0,
        total_remaining: 0,
        total_over_budget: 0,
        spend_percent: 0,
        campaigns: [],
        recent_expenses: []
    }

    const campaigns = campaignsData as Campaign[]
    const campaignIds = campaigns.map(c => c.id)

    // Fetch content items with cost for these campaigns
    const { data: itemsData } = await supabase
        .from('content_items')
        .select('*, campaign:campaigns(name)')
        .in('campaign_id', campaignIds)
        .eq('type', 'ad_creative') // Only include Ad Creative items in budget
        .gt('actual_cost', 0) // Only items with actual cost
        .order('updated_at', { ascending: false })

    const items = itemsData as ContentItem[] || []

    // Calculate stats per campaign
    const campaignStats: CampaignBudgetStats[] = campaigns.map(campaign => {
        const campaignItems = items.filter(item => item.campaign_id === campaign.id)
        const spend_total = campaignItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0)
        const budget_total = campaign.budget_total || 0

        return {
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            budget_total,
            spend_total,
            spend_percent: budget_total > 0 ? (spend_total / budget_total) * 100 : 0,
            remaining: budget_total - spend_total,
            status: campaign.status,
            item_count: campaignItems.length,
            items: campaignItems
        }
    })

    // Calculate total stats (excluding trash)
    const total_budget = campaignStats.reduce((sum, c) => c.status === 'trash' ? sum : sum + c.budget_total, 0)
    const total_spend = campaignStats.reduce((sum, c) => c.status === 'trash' ? sum : sum + c.spend_total, 0)

    // Calculate total over budget (sum of negative remaining amounts)
    const total_over_budget = campaignStats.reduce((sum, c) => {
        if (c.status === 'trash') return sum
        return c.remaining < 0 ? sum + Math.abs(c.remaining) : sum
    }, 0)

    return {
        total_budget,
        total_spend,
        total_remaining: total_budget - total_spend,
        total_over_budget,
        spend_percent: total_budget > 0 ? (total_spend / total_budget) * 100 : 0,
        campaigns: campaignStats,
        recent_expenses: items.slice(0, 10) // Top 10 recent
    }
}

export async function getCampaignDetails(id: string): Promise<CampaignBudgetStats | null> {
    const supabase = await createClient()

    // Fetch campaign
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

    if (!campaign) return null

    // Fetch items
    const { data: itemsData } = await supabase
        .from('content_items')
        .select('*')
        .eq('campaign_id', id)
        .eq('type', 'ad_creative') // Only include Ad Creative items in budget
        .gt('actual_cost', 0)
        .order('updated_at', { ascending: false })

    const items = itemsData as ContentItem[] || []

    // Calculate stats
    const spend_total = items.reduce((sum, item) => sum + (item.actual_cost || 0), 0)
    const budget_total = campaign.budget_total || 0

    return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        budget_total,
        spend_total,
        spend_percent: budget_total > 0 ? (spend_total / budget_total) * 100 : 0,
        remaining: budget_total - spend_total,
        status: campaign.status,
        item_count: items.length,
        items
    }
}

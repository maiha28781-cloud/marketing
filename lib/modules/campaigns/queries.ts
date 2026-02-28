import { createClient } from '@/lib/supabase/server'
import { Campaign360 } from './types'

export async function getCampaign360(campaignId: string): Promise<Campaign360 | null> {
    const supabase = await createClient()

    const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

    if (!campaign) return null

    const { data: contentItems } = await supabase
        .from('content_items')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('scheduled_date', { ascending: true })

    const { data: kpis } = await supabase
        .from('kpis')
        .select('id, title, target_value, current_value, unit, campaign_id')
        .eq('campaign_id', campaignId)

    const spendTotal = (contentItems ?? [])
        .filter(i => i.type === 'ad_creative')
        .reduce((sum: number, i: any) => sum + (i.actual_cost ?? 0), 0)

    return {
        ...campaign,
        content_items: contentItems ?? [],
        kpis: kpis ?? [],
        spend_total: spendTotal,
    }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CampaignBrief } from './types'

export async function updateCampaignPhase(campaignId: string, phase: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('campaigns')
        .update({ phase })
        .eq('id', campaignId)
    if (error) return { error: error.message }
    revalidatePath(`/budget/${campaignId}`)
    return { success: true }
}

export async function updateCampaignBrief(campaignId: string, brief: CampaignBrief) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('campaigns')
        .update({ brief })
        .eq('id', campaignId)
    if (error) return { error: error.message }
    revalidatePath(`/budget/${campaignId}`)
    return { success: true }
}

export async function updateCampaignROI(campaignId: string, data: {
    target_leads?: number
    actual_leads?: number
    actual_revenue?: number
}) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('campaigns')
        .update(data)
        .eq('id', campaignId)
    if (error) return { error: error.message }
    revalidatePath(`/budget/${campaignId}`)
    return { success: true }
}

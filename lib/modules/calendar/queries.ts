'use server'

import { createClient } from '@/lib/supabase/server'
import { Campaign, ContentItem } from './types'

export async function getCampaigns(): Promise<Campaign[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

    return data as Campaign[] || []
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    return data as Campaign[] || []
}

export async function getContentItems(start?: Date, end?: Date): Promise<ContentItem[]> {
    const supabase = await createClient()

    let query = supabase
        .from('content_items')
        .select(`
      *,
      campaign:campaigns(id, name),
      assignee:profiles!content_items_assignee_id_fkey(id, full_name, avatar_url)
    `)
        .order('scheduled_date', { ascending: true })

    if (start) {
        query = query.gte('scheduled_date', start.toISOString())
    }

    if (end) {
        query = query.lte('scheduled_date', end.toISOString())
    }

    const { data } = await query

    return data as ContentItem[] || []
}

export async function getContentItemById(id: string): Promise<ContentItem | null> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('content_items')
        .select(`
      *,
      campaign:campaigns(id, name),
      assignee:profiles!content_items_assignee_id_fkey(id, full_name, avatar_url)
    `)
        .eq('id', id)
        .single()

    return data as ContentItem
}

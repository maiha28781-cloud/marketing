'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateCampaignInput, CreateContentItemInput, UpdateContentItemInput } from './types'

export async function createCampaign(input: CreateCampaignInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Only admins can create campaigns' }
    }

    const { error } = await supabase
        .from('campaigns')
        .insert({
            ...input,
            created_by: user.id
        })

    if (error) return { error: error.message }

    revalidatePath('/calendar')
    revalidatePath('/budget')
    return { success: true }
}

export async function createContentItem(input: CreateContentItemInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Explicit Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    const { error } = await supabase
        .from('content_items')
        .insert({
            ...input,
            created_by: user.id
        })

    if (error) return { error: error.message }

    revalidatePath('/calendar')
    return { success: true }
}

export async function updateContentItem(input: UpdateContentItemInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Explicit Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    const { error } = await supabase
        .from('content_items')
        .update(input)
        .eq('id', input.id)

    if (error) return { error: error.message }

    revalidatePath('/calendar')
    return { success: true }
}

export async function deleteContentItem(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized: No session' }

    // Explicit Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    // STANDARD DELETE (Relies on server check + RLS)
    const { error, count } = await supabase
        .from('content_items')
        .delete({ count: 'exact' })
        .eq('id', id)

    if (error) {
        console.error('Delete error:', error)
        return { error: `Lỗi DB: ${error.message}` }
    }

    if (count === 0) {
        // Double check: Does the item exist?
        const { data: checkItem } = await supabase.from('content_items').select('id, created_by').eq('id', id).single()
        if (checkItem) {
            return { error: `Không thể xóa: Bạn không có quyền.` }
        } else {
            return { error: 'Bài viết không tồn tại.' }
        }
    }

    revalidatePath('/calendar')
    return { success: true }
}

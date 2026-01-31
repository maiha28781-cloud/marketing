'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateNotificationInput } from './types'

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: [] }

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return { data: data || [] }
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { count: 0 }

    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    return { count: count || 0 }
}

export async function markAsRead(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

// Internal function to be called by other modules
export async function createNotification(input: CreateNotificationInput) {
    // Note: This creates a client with service role if needed, 
    // but here we rely on the caller being an authorized user (e.g. admin assigning task)
    // or we might need Supabase Admin Client for system triggers.
    // For now, simpler: user A triggers notification for user B.
    // Ensure "System/Admin can insert notifications" policy handles this.

    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .insert(input)

    if (error) console.error('Error creating notification:', error)
    return { success: !error }
}

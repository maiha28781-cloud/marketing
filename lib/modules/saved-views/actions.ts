'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSavedViews() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: [] }

    const { data, error } = await supabase
        .from('saved_views')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

    if (error) {
        console.error('Error fetching saved views:', error)
        return { data: [] }
    }

    return { data }
}

export async function createSavedView(name: string, filters: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('saved_views')
        .insert({
            user_id: user.id,
            name,
            filters
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/tasks')
    return { success: true }
}

export async function deleteSavedView(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('saved_views')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/tasks')
    return { success: true }
}

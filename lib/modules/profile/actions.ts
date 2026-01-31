'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name?: string; avatar_url?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function changePassword(password: string) {
    const supabase = await createClient()

    // For password update, we just use updateUser
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) return { error: error.message }

    return { success: true }
}

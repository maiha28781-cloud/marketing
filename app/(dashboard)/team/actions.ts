'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface UpdateMemberProfileInput {
    id: string
    position?: string
    role?: 'admin' | 'member'
}

/**
 * Update team member profile (Admin only)
 */
export async function updateMemberProfile(input: UpdateMemberProfileInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return { error: 'Only admins can update member profiles' }
    }

    const { id, ...updates } = input

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating member profile:', error)
        return { error: error.message }
    }

    revalidatePath('/team')
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    revalidatePath('/kpis')

    return { data, error: null }
}

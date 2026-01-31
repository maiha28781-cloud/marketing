'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCampaignBudget(id: string, name: string, budget: number, description?: string, status?: string) {
    const supabase = await createClient()

    // Check admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Only admins can update budget' }
    }

    const { error } = await supabase
        .from('campaigns')
        .update({
            name: name,
            budget_total: budget,
            description: description,
            status: status
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/budget')
    return { success: true }
}

export async function deleteCampaign(id: string) {
    const supabase = await createClient()

    // Check admin (reuse same check logic or trust middleware/component check, but good to check again)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting campaign:', error)
        throw new Error('Failed to delete campaign')
    }

    revalidatePath('/budget')
}

export async function restoreCampaign(id: string) {
    const supabase = await createClient()

    // Check admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase
        .from('campaigns')
        .update({ status: 'draft' })
        .eq('id', id)

    if (error) {
        console.error('Error restoring campaign:', error)
        throw new Error('Failed to restore campaign')
    }

    revalidatePath('/budget')
}

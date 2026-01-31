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

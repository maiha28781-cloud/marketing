'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateKPIInput, UpdateKPIInput, UpdateKPIProgressInput } from './types'

/**
 * Create a new KPI (Admin only)
 */
export async function createKPI(input: CreateKPIInput) {
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
        return { error: 'Only admins can create KPIs' }
    }

    const { data, error } = await supabase
        .from('kpis')
        .insert({
            ...input,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating KPI:', error)
        return { error: error.message }
    }

    revalidatePath('/kpis')
    revalidatePath('/dashboard')

    return { data, error: null }
}

/**
 * Update a KPI (Admin only)
 */
export async function updateKPI(input: UpdateKPIInput) {
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
        return { error: 'Only admins can update KPIs' }
    }

    const { id, ...updates } = input

    const { data, error } = await supabase
        .from('kpis')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating KPI:', error)
        return { error: error.message }
    }

    revalidatePath('/kpis')
    revalidatePath('/dashboard')

    return { data, error: null }
}

/**
 * Update KPI progress (Admin or KPI owner)
 */
export async function updateKPIProgress(input: UpdateKPIProgressInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get KPI to check ownership
    const { data: kpi } = await supabase
        .from('kpis')
        .select('user_id')
        .eq('id', input.id)
        .single()

    if (!kpi) {
        return { error: 'KPI not found' }
    }

    // Check if user is admin or owner
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAuthorized = profile?.role === 'admin' || kpi.user_id === user.id

    if (!isAuthorized) {
        return { error: 'Not authorized to update this KPI' }
    }

    // Update KPI
    const { data, error } = await supabase
        .from('kpis')
        .update({ current_value: input.current_value })
        .eq('id', input.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating KPI progress:', error)
        return { error: error.message }
    }

    // Record in history
    await supabase
        .from('kpi_history')
        .insert({
            kpi_id: input.id,
            value: input.current_value,
            updated_by: user.id,
        })

    revalidatePath('/kpis')
    revalidatePath('/dashboard')

    return { data, error: null }
}

/**
 * Delete a KPI (Admin only)
 */
export async function deleteKPI(id: string) {
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
        return { error: 'Only admins can delete KPIs' }
    }

    const { error } = await supabase
        .from('kpis')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting KPI:', error)
        return { error: error.message }
    }

    revalidatePath('/kpis')
    revalidatePath('/dashboard')

    return { error: null }
}

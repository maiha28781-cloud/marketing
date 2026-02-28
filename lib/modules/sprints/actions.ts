'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateSprintInput, UpdateSprintInput } from './types'

export async function createSprint(data: CreateSprintInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Only admins can create sprints' }

    const { data: sprint, error } = await supabase
        .from('sprints')
        .insert({ ...data, created_by: user.id })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/sprints')
    return { data: sprint }
}

export async function updateSprint(data: UpdateSprintInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { id, ...rest } = data
    const { error } = await supabase
        .from('sprints')
        .update(rest)
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/sprints')
    return { success: true }
}

export async function addTaskToSprint(taskId: string, sprintId: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('tasks')
        .update({ sprint_id: sprintId })
        .eq('id', taskId)

    if (error) return { error: error.message }
    revalidatePath('/sprints')
    return { success: true }
}

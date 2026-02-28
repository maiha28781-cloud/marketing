import { createClient } from '@/lib/supabase/server'
import { Sprint } from './types'
import { Task } from '@/lib/modules/tasks/types'

export async function getSprints(): Promise<Sprint[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('sprints')
        .select('*')
        .order('start_date', { ascending: false })
    return data ?? []
}

export async function getActiveSprint(): Promise<Sprint | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('sprints')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .single()
    return data ?? null
}

export async function getSprintTasks(sprintId: string): Promise<Task[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, position),
            creator:profiles!tasks_created_by_fkey(id, full_name, email)
        `)
        .eq('sprint_id', sprintId)
        .order('created_at', { ascending: false })
    return (data as Task[]) ?? []
}

export async function getBacklogTasks(): Promise<Task[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, position),
            creator:profiles!tasks_created_by_fkey(id, full_name, email)
        `)
        .is('sprint_id', null)
        .neq('status', 'done')
        .order('created_at', { ascending: false })
    return (data as Task[]) ?? []
}

// Returns daily count of completed tasks for burndown calculation
export async function getBurndownData(sprintId: string, startDate: string, endDate: string) {
    const supabase = await createClient()
    const { data: tasks } = await supabase
        .from('tasks')
        .select('status, completed_at, story_points')
        .eq('sprint_id', sprintId)

    if (!tasks) return []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points ?? 1), 0)
    const days: { date: string; ideal: number; actual: number }[] = []

    const dayCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    for (let i = 0; i < dayCount; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        const completedByDay = tasks
            .filter(t => t.status === 'done' && t.completed_at && t.completed_at.split('T')[0] <= dateStr)
            .reduce((sum, t) => sum + (t.story_points ?? 1), 0)

        const ideal = Math.round(totalPoints * (1 - i / (dayCount - 1)))
        days.push({ date: dateStr, ideal, actual: totalPoints - completedByDay })
    }

    return days
}

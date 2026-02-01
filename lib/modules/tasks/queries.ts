import { createClient } from '@/lib/supabase/server'
import { Task } from './types'

export async function getTasks(referenceDate?: Date): Promise<Task[]> {
    const supabase = await createClient()

    let query = supabase
        .from('tasks')
        .select(`
      *,
      assignee:assigned_to(id, full_name, email, position),
      creator:created_by(id, full_name, email)
    `)

    if (referenceDate) {
        const year = referenceDate.getFullYear()
        const month = referenceDate.getMonth()
        const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
        const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

        // User request: "Filter task by completion month"
        // So we strictly filter for Done tasks in that period
        query = query
            .eq('status', 'done')
            .gte('completed_at', startOfMonth)
            .lte('completed_at', endOfMonth)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return data as Task[]
}

export async function getTaskById(id: string): Promise<Task | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      assignee:assigned_to(id, full_name, email, position),
      creator:created_by(id, full_name, email)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching task:', error)
        return null
    }

    return data as Task
}

export async function getMyTasks(userId: string): Promise<Task[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      assignee:assigned_to(id, full_name, email, position),
      creator:created_by(id, full_name, email)
    `)
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching my tasks:', error)
        return []
    }

    return data as Task[]
}

export async function getTaskStats(userId: string, referenceDate?: Date) {
    const supabase = await createClient()

    let query = supabase
        .from('tasks')
        .select('status')
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)

    if (referenceDate) {
        // If filtering by date, typically we want stats for that period
        // For "Completion Month", we match the getTasks logic
        // But stats usually show Todo/Doing etc. 
        // If we only show DONE tasks in the list, the stats should reflect that context?
        // Or should stats show "What was Todo in that month"? (Hard)
        // Let's align with getTasks: Only count things that match the filter.
        const year = referenceDate.getFullYear()
        const month = referenceDate.getMonth()
        const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
        const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

        query = query
            .eq('status', 'done')
            .gte('completed_at', startOfMonth)
            .lte('completed_at', endOfMonth)
    }

    const { data: tasks } = await query

    const total = tasks?.length || 0
    const todo = tasks?.filter(t => t.status === 'todo').length || 0
    const doing = tasks?.filter(t => t.status === 'doing').length || 0
    const review = tasks?.filter(t => t.status === 'review').length || 0
    const done = tasks?.filter(t => t.status === 'done').length || 0

    return { total, todo, doing, review, done }
}

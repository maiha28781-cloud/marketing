import { createClient } from '@/lib/supabase/server'
import { Task } from './types'

export async function getTasks(): Promise<Task[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      assignee:assigned_to(id, full_name, email, position),
      creator:created_by(id, full_name, email)
    `)
        .order('created_at', { ascending: false })

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

export async function getTaskStats(userId: string) {
    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)

    const total = tasks?.length || 0
    const todo = tasks?.filter(t => t.status === 'todo').length || 0
    const doing = tasks?.filter(t => t.status === 'doing').length || 0
    const review = tasks?.filter(t => t.status === 'review').length || 0
    const done = tasks?.filter(t => t.status === 'done').length || 0

    return { total, todo, doing, review, done }
}

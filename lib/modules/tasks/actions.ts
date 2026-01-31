'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateTaskInput, UpdateTaskInput } from './types'

export async function createTask(data: CreateTaskInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Explicit Role Check (Failsafe for RLS)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    const { error } = await supabase.from('tasks').insert({
        ...data,
        created_by: user.id,
    })

    if (error) {
        return { error: error.message }
    }

    // Trigger notification if assigned to another user
    if (data.assigned_to && data.assigned_to !== user.id) {
        try {
            const { createNotification } = await import('@/lib/modules/notifications/actions')
            await createNotification({
                user_id: data.assigned_to,
                type: 'task_assigned',
                title: 'Nhiệm vụ mới',
                message: `Bạn được giao nhiệm vụ: ${data.title}`,
                link: '/tasks'
            })
        } catch (err) {
            console.error('Failed to create notification:', err)
        }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTask(data: UpdateTaskInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { id, ...updateData } = data

    // Explicit Role Check
    const { data: profileUpdate } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profileUpdate?.role !== 'admin' && profileUpdate?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    // Auto-set completed_at when status changes to 'done'
    if (updateData.status === 'done' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    // Notify Creator if Assignee updates the task
    try {
        const { data: currentTask } = await supabase
            .from('tasks')
            .select('created_by, title, assigned_to')
            .eq('id', id)
            .single()

        if (currentTask) {
            const { createNotification } = await import('@/lib/modules/notifications/actions')

            let message = `${user.email} đã chuyển task "${currentTask.title}" sang trạng thái ${updateData.status}`
            if (updateData.status === 'review' && updateData.submission_notes) {
                message += `\n\nGhi chú: ${updateData.submission_notes}`
            }

            // 1. Identify recipients
            const recipientIds = new Set<string>()
            if (currentTask.assigned_to) recipientIds.add(currentTask.assigned_to)
            if (currentTask.created_by) recipientIds.add(currentTask.created_by)

            // 2. Add followers
            try {
                const { data: followers } = await supabase
                    .from('task_followers')
                    .select('user_id')
                    .eq('task_id', id)

                followers?.forEach(f => recipientIds.add(f.user_id))
            } catch (ignore) { }

            // 3. Remove self
            recipientIds.delete(user.id)

            // 4. Send notifications
            await Promise.all(Array.from(recipientIds).map(recipientId =>
                createNotification({
                    user_id: recipientId,
                    type: 'task_updated',
                    title: updateData.status === 'review' ? 'Yêu cầu Review Task' : 'Cập nhật tiến độ',
                    message: message,
                    link: `/tasks?taskId=${id}`
                })
            ))
        }
    } catch (err) {
        console.error('Notification error:', err)
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteTask(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Explicit Role Check
    const { data: profileDelete } = await supabase
        .from('profiles')
        .select('role, position')
        .eq('id', user.id)
        .single()

    if (profileDelete?.role !== 'admin' && profileDelete?.position?.toLowerCase() === 'member') {
        return { error: 'Permission denied: Members are read-only.' }
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function createComment(taskId: string, content: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('task_comments')
        .insert({
            task_id: taskId,
            user_id: user.id,
            content: content
        })
        .select(`
            *,
            user:profiles(full_name, email, avatar_url)
        `)
        .single()

    if (error) {
        return { error: error.message }
    }

    // Notify relevant users
    try {
        const { data: task } = await supabase
            .from('tasks')
            .select('title, created_by, assigned_to')
            .eq('id', taskId)
            .single()

        if (task) {
            const { createNotification } = await import('@/lib/modules/notifications/actions')

            // 1. Identify recipients (Start with Assigned + Creator)
            const recipientIds = new Set<string>()
            if (task.assigned_to) recipientIds.add(task.assigned_to)
            if (task.created_by) recipientIds.add(task.created_by)

            // 2. Add followers
            // (Optimize: fetch followers in the same query if possible using join, but separate query is cleaner for now)
            try {
                const { data: followers } = await supabase
                    .from('task_followers')
                    .select('user_id')
                    .eq('task_id', taskId)

                followers?.forEach(f => recipientIds.add(f.user_id))
            } catch (ignore) { }

            // 3. Remove self (don't notify me about my own comment)
            recipientIds.delete(user.id)

            // 4. Send notifications
            const recipients = Array.from(recipientIds)
            await Promise.all(recipients.map(recipientId =>
                createNotification({
                    user_id: recipientId,
                    type: 'task_comment',
                    title: 'Bình luận mới',
                    message: `${user.email} đã bình luận trong task "${task.title}"`,
                    link: `/tasks?taskId=${taskId}`
                })
            ))
        }
    } catch (err) {
        console.error('Failed to send comment notification:', err)
    }

    return { data }
}

export async function getComments(taskId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('task_comments')
        .select(`
            *,
            user:profiles(full_name, email, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

    if (error) {
        return { error: error.message }
    }

    return { data }
}

export async function toggleFollowTask(taskId: string, shouldFollow: boolean = true) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    if (shouldFollow) {
        const { error } = await supabase
            .from('task_followers')
            .insert({ task_id: taskId, user_id: user.id })
            // If already exists, ignore
            .select()

        if (error && error.code !== '23505') { // 23505 = unique_violation
            return { error: error.message }
        }
    } else {
        const { error } = await supabase
            .from('task_followers')
            .delete()
            .match({ task_id: taskId, user_id: user.id })

        if (error) return { error: error.message }
    }

    return { success: true }
}

export async function addFollower(taskId: string, userId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('task_followers')
        .insert({ task_id: taskId, user_id: userId })
        .select()

    if (error && error.code !== '23505') {
        return { error: error.message }
    }
    return { success: true }
}

export async function getFollowers(taskId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('task_followers')
        .select('user:profiles(id, full_name, email)')
        .eq('task_id', taskId)

    return data?.map(d => d.user) || []
}

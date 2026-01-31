export interface Task {
    id: string
    title: string
    description: string | null
    status: 'todo' | 'doing' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assigned_to: string | null
    created_by: string
    due_date: string | null
    completed_at: string | null
    created_at: string
    updated_at: string
    submission_notes?: string | null
    // Joined data
    assignee?: {
        id: string
        full_name: string
        email: string
        position: string
    }
    creator?: {
        id: string
        full_name: string
        email: string
    }
}

export interface CreateTaskInput {
    title: string
    description?: string
    status: Task['status']
    priority: Task['priority']
    assigned_to?: string
    due_date?: string
}

export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, 'assigned_to'>> {
    id: string
    assigned_to?: string | null
    completed_at?: string
    submission_notes?: string
}

export interface Comment {
    id: string
    task_id: string
    user_id: string
    content: string
    created_at: string
    user?: {
        full_name: string
        email: string
        avatar_url?: string
    }
}

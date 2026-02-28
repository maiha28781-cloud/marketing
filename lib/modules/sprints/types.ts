export interface Sprint {
    id: string
    name: string
    goal: string | null
    start_date: string
    end_date: string
    status: 'planning' | 'active' | 'completed'
    target_velocity: number
    actual_velocity: number
    retrospective_notes: string | null
    created_by: string
    created_at: string
    updated_at: string
}

export interface CreateSprintInput {
    name: string
    goal?: string
    start_date: string
    end_date: string
    target_velocity?: number
}

export interface UpdateSprintInput extends Partial<CreateSprintInput> {
    id: string
    status?: Sprint['status']
    actual_velocity?: number
    retrospective_notes?: string
}

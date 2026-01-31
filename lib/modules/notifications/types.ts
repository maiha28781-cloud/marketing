export type NotificationType = 'task_assigned' | 'task_completed' | 'budget_alert' | 'kpi_update' | 'system' | 'task_updated' | 'task_comment'

export interface Notification {
    id: string
    user_id: string
    type: NotificationType
    title: string
    message: string
    is_read: boolean
    link?: string
    metadata?: Record<string, any>
    created_at: string
}

export interface CreateNotificationInput {
    user_id: string
    type: NotificationType
    title: string
    message: string
    link?: string
    metadata?: Record<string, any>
}

'use client'

import { useState } from 'react'
import { Task } from '@/lib/modules/tasks/types'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateTask } from '@/lib/modules/tasks/actions'
import { format } from 'date-fns'
import { TaskComments } from './task-comments'

interface EditTaskDialogProps {
    task: Task
    teamMembers: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUserId: string
}

export function EditTaskDialog({ task, teamMembers, open, onOpenChange, currentUserId }: EditTaskDialogProps) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const assignedTo = formData.get('assigned_to') as string

        const data = {
            id: task.id,
            title: formData.get('title') as string,
            description: formData.get('description') as string || undefined,
            status: formData.get('status') as any,
            priority: formData.get('priority') as any,
            assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
            due_date: formData.get('due_date') as string || undefined,
        }

        const result = await updateTask(data)

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        } else {
            onOpenChange(false)
        }

        setLoading(false)
    }

    // Format datetime-local value
    const formatDateTimeLocal = (date: string | null) => {
        if (!date) return ''
        return format(new Date(date), "yyyy-MM-dd'T'HH:mm")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Task Information Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Tiêu đề *</Label>
                            <Input
                                id="edit-title"
                                name="title"
                                defaultValue={task.title}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <textarea
                                id="edit-description"
                                name="description"
                                defaultValue={task.description || ''}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-status">Trạng thái</Label>
                                <Select name="status" defaultValue={task.status} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">Todo</SelectItem>
                                        <SelectItem value="doing">Doing</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-priority">Độ ưu tiên</Label>
                                <Select name="priority" defaultValue={task.priority} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-assigned_to">Giao cho</Label>
                            <Select
                                name="assigned_to"
                                defaultValue={task.assigned_to || 'unassigned'}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn người nhận task" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Không giao cho ai</SelectItem>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name} ({member.position})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-due_date">Deadline</Label>
                            <Input
                                id="edit-due_date"
                                name="due_date"
                                type="datetime-local"
                                defaultValue={formatDateTimeLocal(task.due_date)}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>

                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-semibold text-sm">Thảo luận / Review</h4>
                            <div className="h-4 w-4 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-bold">!</div>
                        </div>
                        <TaskComments taskId={task.id} currentUserId={currentUserId} teamMembers={teamMembers} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState } from 'react'
import { Task } from '@/lib/modules/tasks/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { EditTaskDialog } from './edit-task-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteTask } from '@/lib/modules/tasks/actions'

interface TaskListProps {
    tasks: Task[]
    teamMembers: any[]
    currentUserId: string
    userRole: string | undefined
}

const statusColors = {
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    doing: 'bg-blue-100 text-blue-700 border-blue-200',
    review: 'bg-amber-100 text-amber-700 border-amber-200',
    done: 'bg-green-100 text-green-700 border-green-200',
}

const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
}

const statusLabels = {
    todo: 'Todo',
    doing: 'Doing',
    review: 'Review',
    done: 'Done',
}

const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
}

const positionColors: Record<string, string> = {
    manager: 'border-l-4 border-l-indigo-600',
    content: 'border-l-4 border-l-purple-400',
    social_media: 'border-l-4 border-l-purple-400',
    performance: 'border-l-4 border-l-green-500',
    designer: 'border-l-4 border-l-pink-500',
    editor: 'border-l-4 border-l-slate-500',
    member: 'border-l-4 border-l-gray-300',
}

export function TaskList({ tasks, teamMembers, currentUserId, userRole }: TaskListProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const handleDeleteConfirm = async () => {
        if (!taskToDelete) return

        setIsDeleting(true)
        const result = await deleteTask(taskToDelete)

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        }

        setIsDeleting(false)
        setTaskToDelete(null)
    }

    if (tasks.length === 0) {
        return (
            <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                    Chưa có task nào. Click "Tạo Task" để bắt đầu!
                </p>
            </Card>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {tasks.map((task) => {
                    const positionColorClass = task.assignee?.position
                        ? positionColors[task.assignee.position] || positionColors.member
                        : 'border-l-4 border-l-transparent'

                    return (
                        <Card key={task.id} className={`p-4 hover:shadow-md transition-shadow ${positionColorClass}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{task.title}</h3>
                                        <Badge variant="outline" className={statusColors[task.status]}>
                                            {statusLabels[task.status]}
                                        </Badge>
                                        <Badge variant="secondary" className={priorityColors[task.priority]}>
                                            {priorityLabels[task.priority]}
                                        </Badge>
                                    </div>

                                    {task.description && (
                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {task.assignee && (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(task.assignee.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{task.assignee.full_name}</span>
                                            </div>
                                        )}

                                        {task.due_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(task.due_date), 'dd MMM yyyy', { locale: vi })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedTask(task)
                                                setIsEditing(true)
                                            }}
                                        >
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => setTaskToDelete(task.id)}
                                        >
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Edit Dialog */}
            {selectedTask && (
                <EditTaskDialog
                    task={selectedTask}
                    teamMembers={teamMembers}
                    open={isEditing}
                    onOpenChange={setIsEditing}
                    currentUserId={currentUserId}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

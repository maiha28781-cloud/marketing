'use client'

import { useState } from 'react'
import { Task } from '@/lib/modules/tasks/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, X, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { addTaskToSprint } from '@/lib/modules/sprints/actions'
import { useRouter } from 'next/navigation'

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
}

interface SprintBacklogProps {
    backlogTasks: Task[]
    sprintId: string
}

export function SprintBacklog({ backlogTasks, sprintId }: SprintBacklogProps) {
    const router = useRouter()
    const [adding, setAdding] = useState<string | null>(null)

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)

    async function handleAdd(taskId: string) {
        setAdding(taskId)
        await addTaskToSprint(taskId, sprintId)
        setAdding(null)
        router.refresh()
    }

    if (!backlogTasks.length) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground">
                Backlog trống. Tất cả tasks đã được phân vào sprint.
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {backlogTasks.map((task) => (
                <Card key={task.id} className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={`${priorityColors[task.priority]} text-xs`}>
                                    {task.priority}
                                </Badge>
                                {task.due_date && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(task.due_date), 'dd/MM', { locale: vi })}
                                    </span>
                                )}
                                {task.assignee && (
                                    <div className="flex items-center gap-1">
                                        <Avatar className="h-4 w-4">
                                            <AvatarFallback className="text-[8px]">
                                                {getInitials(task.assignee.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">{task.assignee.full_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            disabled={adding === task.id}
                            onClick={() => handleAdd(task.id)}
                            title="Add to sprint"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}

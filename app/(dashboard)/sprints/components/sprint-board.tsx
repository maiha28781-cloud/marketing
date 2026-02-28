'use client'

import { Task } from '@/lib/modules/tasks/types'
import { Sprint } from '@/lib/modules/sprints/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, ArrowLeft } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { addTaskToSprint } from '@/lib/modules/sprints/actions'
import { useRouter } from 'next/navigation'

const columns = [
    { id: 'todo', label: 'Todo', color: 'bg-slate-50' },
    { id: 'doing', label: 'Doing', color: 'bg-blue-50' },
    { id: 'review', label: 'Review', color: 'bg-amber-50' },
    { id: 'done', label: 'Done', color: 'bg-green-50' },
] as const

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
}

interface SprintBoardProps {
    sprint: Sprint
    tasks: Task[]
}

export function SprintBoard({ sprint, tasks }: SprintBoardProps) {
    const router = useRouter()
    const tasksByStatus = columns.reduce((acc, col) => {
        acc[col.id] = tasks.filter((t) => t.status === col.id)
        return acc
    }, {} as Record<string, Task[]>)

    const daysLeft = differenceInDays(new Date(sprint.end_date), new Date())
    const progress = sprint.target_velocity > 0
        ? Math.round((tasks.filter(t => t.status === 'done').length / sprint.target_velocity) * 100)
        : 0

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)

    async function handleRemove(taskId: string) {
        await addTaskToSprint(taskId, null)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            {/* Sprint info bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <h3 className="font-semibold">{sprint.name}</h3>
                            {sprint.goal && <p className="text-sm text-muted-foreground">{sprint.goal}</p>}
                        </div>
                        <div className="flex gap-6 text-sm">
                            <div className="text-center">
                                <div className="font-semibold">{daysLeft > 0 ? daysLeft : 0}</div>
                                <div className="text-muted-foreground text-xs">ngày còn lại</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold">{tasks.filter(t => t.status === 'done').length}/{sprint.target_velocity}</div>
                                <div className="text-muted-foreground text-xs">tasks done</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-green-600">{progress}%</div>
                                <div className="text-muted-foreground text-xs">hoàn thành</div>
                            </div>
                        </div>
                        <Badge variant={sprint.status === 'active' ? 'default' : sprint.status === 'completed' ? 'secondary' : 'outline'}>
                            {sprint.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-2">
                        <div className={`${col.color} rounded-lg p-3 border flex items-center justify-between`}>
                            <span className="font-semibold text-sm">{col.label}</span>
                            <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center">
                                {tasksByStatus[col.id].length}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {tasksByStatus[col.id].map((task) => (
                                <Card key={task.id} className="p-3 group">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium flex-1">{task.title}</p>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                                                onClick={() => handleRemove(task.id)}
                                                title="Remove from sprint"
                                            >
                                                <ArrowLeft className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className={`${priorityColors[task.priority]} text-xs`}>
                                                {task.priority}
                                            </Badge>
                                            {task.assignee && (
                                                <div className="flex items-center gap-1">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[9px]">
                                                            {getInitials(task.assignee.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            )}
                                        </div>
                                        {task.story_points && (
                                            <span className="text-xs text-muted-foreground">{task.story_points} pts</span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

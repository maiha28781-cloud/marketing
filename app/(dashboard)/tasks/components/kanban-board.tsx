'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/lib/modules/tasks/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    useDroppable,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SubmitTaskDialog } from './submit-task-dialog'
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
import { updateTask, deleteTask } from '@/lib/modules/tasks/actions'
import { EditTaskDialog } from './edit-task-dialog'

const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
} as const

const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
} as const

const columns = [
    { id: 'todo', label: 'Todo', color: 'bg-slate-50' },
    { id: 'doing', label: 'Doing', color: 'bg-blue-50' },
    { id: 'review', label: 'Review', color: 'bg-amber-50' },
    { id: 'done', label: 'Done', color: 'bg-green-50' },
] as const

interface KanbanBoardProps {
    tasks: Task[]
    teamMembers: any[]
    currentUserId: string
    userRole: string | undefined
}

export function KanbanBoard({ tasks, teamMembers, currentUserId, userRole }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [overId, setOverId] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Submission Dialog State
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
    const [pendingReviewTask, setPendingReviewTask] = useState<{ id: string, status: 'review' } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handle hydration mismatch for dnd-kit
    useState(() => {
        setIsMounted(true)
    })

    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

    // Sync local state when props change
    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const router = useRouter()
    // Stable supabase client instance
    const [supabase] = useState(() => createClient())

    const searchParams = useSearchParams()

    // Auto-open task from URL
    useEffect(() => {
        const taskId = searchParams.get('taskId')
        if (taskId && !selectedTask) {
            // Use localTasks instead of tasks to find newly created tasks from realtime
            const task = localTasks.find(t => t.id === taskId)
            if (task) {
                setSelectedTask(task)
                setIsEditing(true)
            }
        }
    }, [searchParams, localTasks, selectedTask])

    useEffect(() => {
        const channel = supabase
            .channel('realtime-kanban')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                },
                (payload) => {
                    console.log('Realtime update received:', payload)

                    if (payload.eventType === 'INSERT') {
                        setLocalTasks((prev) => [...prev, payload.new as Task])
                    } else if (payload.eventType === 'UPDATE') {
                        setLocalTasks((prev) =>
                            prev.map((task) =>
                                task.id === payload.new.id ? { ...task, ...payload.new } : task
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setLocalTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
                    }

                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t.id === event.active.id)
        setActiveTask(task || null)
    }

    function handleDragOver(event: DragOverEvent) {
        const { over } = event
        setOverId(over ? over.id as string : null)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveTask(null)
        setOverId(null)

        if (!over) return

        const taskId = active.id as string
        let newStatus = over.id as Task['status']

        // If dropped over a task (not a column), find that task's status
        const isColumn = columns.some(col => col.id === newStatus)
        if (!isColumn) {
            const overTask = tasks.find(t => t.id === over.id)
            if (overTask) {
                newStatus = overTask.status
            } else {
                return
            }
        }

        const task = localTasks.find((t) => t.id === taskId)
        if (!task || task.status === newStatus) return

        console.log('DragEnd Logic:', { currentUserId, creator: task.created_by, assignee: task.assigned_to, userRole, newStatus })

        const isCreator = currentUserId === task.created_by
        const isAdmin = userRole === 'admin'

        // Log permission statuses
        console.log('Permissions:', { isCreator, isAdmin })

        // 1. Check permissions first
        if (!isCreator && !isAdmin && newStatus === 'done') {
            const { toast } = await import('@/hooks/use-toast')
            toast({
                title: "Không thể cập nhật",
                description: "Bạn chỉ có thể cập nhật trạng thái tới Review. Vui lòng liên hệ người giao việc để hoàn thành.",
                variant: "destructive"
            })
            return
        }

        // Optimistically update local state
        const previousTasks = [...localTasks]
        setLocalTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ))

        // 2. Intercept 'review' status to show submission dialog
        // Anyone moving to review should probably explain why/results
        if (newStatus === 'review') {
            // Revert optimistic update for dialog flow, or keep it?
            // If we keep it, the UI shows 'Review' while dialog is open.
            // If cancel, we must revert.
            // Let's keep it but revert if cancel.
            setPendingReviewTask({ id: taskId, status: 'review' })
            setIsSubmitDialogOpen(true)
            return
        }

        // 3. Normal update for other statuses
        const result = await updateTask({
            id: taskId,
            status: newStatus,
        })

        if (result.error) {
            // Revert on error
            setLocalTasks(previousTasks)
            const { toast } = await import('@/hooks/use-toast')
            toast({
                title: "Lỗi cập nhật",
                description: result.error,
                variant: "destructive"
            })
        }
    }

    const handleSubmitReview = async (notes: string) => {
        if (!pendingReviewTask) return

        setIsSubmitting(true)

        // 1. Update task status
        const updateResult = await updateTask({
            id: pendingReviewTask.id,
            status: pendingReviewTask.status,
            // submission_notes: notes // We don't need this anymore if we use comments
        })

        if (updateResult.error) {
            const { toast } = await import('@/hooks/use-toast')
            toast({
                title: "Lỗi cập nhật",
                description: updateResult.error,
                variant: "destructive"
            })
            setIsSubmitting(false)
            return
        }

        // 2. Add as a comment if notes exist
        if (notes.trim()) {
            const { createComment } = await import('@/lib/modules/tasks/actions')
            await createComment(pendingReviewTask.id, notes)
        }

        setIsSubmitting(false)
        setIsSubmitDialogOpen(false)
        setPendingReviewTask(null)

        const { toast } = await import('@/hooks/use-toast')
        toast({
            title: "Đã gửi Review",
            description: "Task đã được chuyển sang Review. Ghi chú của bạn đã được thêm vào thảo luận.",
        })
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

    // Determine tasks for each column
    // Important: Move columns definition above if needed or ensure it's defined
    const tasksByStatus = columns.reduce((acc, column) => {
        acc[column.id] = localTasks.filter((task) => task.status === column.id)
        return acc
    }, {} as Record<string, Task[]>)

    if (!isMounted) return null

    return (
        <>
            <DndContext
                id="kanban-dnd-context"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map((column) => {
                        const columnTasks = tasksByStatus[column.id]
                        return (
                            <DroppableColumn
                                key={column.id}
                                id={column.id}
                                label={column.label}
                                color={column.color}
                                count={columnTasks.length}
                                isOver={overId === column.id}
                            >
                                <SortableContext
                                    id={column.id}
                                    items={columnTasks.map((t) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {columnTasks.map((task) => (
                                        <SortableTaskCard
                                            key={task.id}
                                            task={task}
                                            onEdit={() => {
                                                setSelectedTask(task)
                                                setIsEditing(true)
                                            }}
                                            onDelete={() => setTaskToDelete(task.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DroppableColumn>
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeTask && (
                        <Card className="p-3 opacity-90 cursor-grabbing shadow-lg rotate-3">
                            <h4 className="font-medium text-sm">{activeTask.title}</h4>
                            {activeTask.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{activeTask.description}</p>
                            )}
                        </Card>
                    )}
                </DragOverlay>
            </DndContext>

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

            {/* Submit Review Dialog */}
            <SubmitTaskDialog
                open={isSubmitDialogOpen}
                onOpenChange={setIsSubmitDialogOpen}
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmitting}
            />

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

function DroppableColumn({
    id,
    label,
    color,
    count,
    children,
    isOver
}: {
    id: string
    label: string
    color: string
    count: number
    children: React.ReactNode
    isOver: boolean
}) {
    const { setNodeRef } = useDroppable({ id })

    return (
        <div ref={setNodeRef} className="flex flex-col">
            <div className={`${color} rounded-lg p-3 border mb-3 ${isOver ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center">
                        {count}
                    </Badge>
                </div>
            </div>
            <div className="flex-1 space-y-2 min-h-[200px]">
                {children}
            </div>
        </div>
    )
}

function SortableTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
            onClick={onEdit}
            {...attributes}
            {...listeners}
        >
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onPointerDown={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            >
                                Xóa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${priorityColors[task.priority]} text-xs`}>
                        {priorityLabels[task.priority]}
                    </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t">
                    {task.assignee ? (
                        <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                    {getInitials(task.assignee.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate">{task.assignee.full_name.split(' ').slice(-1)}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">Chưa giao</span>
                    )}

                    {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.due_date), 'dd/MM', { locale: vi })}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

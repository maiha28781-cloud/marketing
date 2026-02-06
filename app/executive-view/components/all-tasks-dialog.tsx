'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Task {
    id: string
    title: string
    status: string
    due_date: string | null
    priority: string
    assignee_name: string
    assignee_position: string
}

interface AllTasksDialogProps {
    tasks: Task[]
}

export function AllTasksDialog({ tasks }: AllTasksDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-2"
            >
                Xem tất cả
                <ExternalLink className="h-3 w-3" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tất cả công việc ({tasks.length})</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b sticky top-0">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Công việc</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Giao cho</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Ưu tiên</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Deadline</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                            <td className="p-4 font-medium">{task.title}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{task.assignee_name}</span>
                                                    <span className="text-xs text-muted-foreground capitalize">{task.assignee_position}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                    ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                    ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                                        task.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                                                            task.status === 'review' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-700'}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            Không có task nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

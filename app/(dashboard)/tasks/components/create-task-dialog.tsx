'use client'

import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTask } from '@/lib/modules/tasks/actions'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { CreateTaskInput, Task } from '@/lib/modules/tasks/types'

interface CreateTaskDialogProps {
    teamMembers: any[]
    currentUserId: string
    currentUserRole?: string
}

import { useToast } from '@/hooks/use-toast'

export function CreateTaskDialog({ teamMembers, currentUserId, currentUserRole }: CreateTaskDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date | undefined>()
    const formRef = useRef<HTMLFormElement>(null)

    // Filter members: 
    // - If current user is Admin: See all
    // - If current user is Member: See only other Members (hide Admins)
    const filteredMembers = teamMembers.filter(member => {
        if (currentUserRole === 'admin') return true
        return member.role !== 'admin'
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const data: CreateTaskInput = {
            title: formData.get('title') as string,
            description: (formData.get('description') as string) || undefined,
            status: 'todo',
            priority: (formData.get('priority') as Task['priority']) || 'medium',
            assigned_to: (formData.get('assigned_to') as string) || undefined,
            due_date: (formData.get('due_date') as string) || undefined,
        }

        const result = await createTask(data)

        if (result.error) {
            toast({
                title: "Không thể tạo Task",
                description: result.error,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Thành công",
                description: "Đã tạo task mới.",
            })
            // Reset form before closing to avoid null reference
            formRef.current?.reset()
            setDate(undefined)
            setOpen(false)
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <form ref={formRef} onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tạo Task Mới</DialogTitle>
                        <DialogDescription>
                            Tạo task mới và giao cho thành viên trong team
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tiêu đề *</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Viết bài blog về sản phẩm mới"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Chi tiết công việc cần làm..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Độ ưu tiên</Label>
                                <Select name="priority" defaultValue="medium" disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn độ ưu tiên" />
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
                            <Label htmlFor="assigned_to">Giao cho</Label>
                            <Select name="assigned_to" disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn người nhận task" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name} ({member.position})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Deadline</Label>
                            <DateTimePicker date={date} setDate={setDate} />
                            <input type="hidden" name="due_date" value={date ? date.toISOString() : ''} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

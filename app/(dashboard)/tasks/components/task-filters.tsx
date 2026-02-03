'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { createSavedView } from '@/lib/modules/saved-views/actions'
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
import { useToast } from '@/hooks/use-toast'

interface TaskFiltersProps {
    teamMembers: any[]
    currentAssignee?: string
    currentStatus?: string
    currentPriority?: string
}

export function TaskFilters({
    teamMembers,
    currentAssignee = 'all',
    currentStatus = 'all',
    currentPriority = 'all',
}: TaskFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
    const [viewName, setViewName] = useState('')

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/tasks?${params.toString()}`)
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('assignee')
        params.delete('status')
        params.delete('priority')
        router.push(`/tasks?${params.toString()}`)
    }

    const handleSaveView = async () => {
        if (!viewName.trim()) return

        const filters = {
            assignee: currentAssignee !== 'all' ? currentAssignee : undefined,
            status: currentStatus !== 'all' ? currentStatus : undefined,
            priority: currentPriority !== 'all' ? currentPriority : undefined,
        }

        const result = await createSavedView(viewName, filters)

        if (result.error) {
            toast({
                title: 'Lỗi',
                description: result.error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Thành công',
                description: 'Đã lưu bộ lọc',
            })
            setIsSaveDialogOpen(false)
            setViewName('')
        }
    }

    const hasFilters = currentAssignee !== 'all' || currentStatus !== 'all' || currentPriority !== 'all'

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Select
                value={currentAssignee}
                onValueChange={(value) => updateFilter('assignee', value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Người thực hiện" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả thành viên</SelectItem>
                    {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                            {member.full_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentStatus}
                onValueChange={(value) => updateFilter('status', value)}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="doing">Doing</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={currentPriority}
                onValueChange={(value) => updateFilter('priority', value)}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                <>
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Xóa bộ lọc">
                        <X className="h-4 w-4" />
                    </Button>

                    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Save className="h-4 w-4" />
                                Lưu bộ lọc
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Lưu bộ lọc hiện tại</DialogTitle>
                                <DialogDescription>
                                    Đặt tên cho view này để truy cập nhanh sau này.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Tên View
                                    </Label>
                                    <Input
                                        id="name"
                                        value={viewName}
                                        onChange={(e) => setViewName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="Ví dụ: Việc cần làm gấp"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveView}>Lưu</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { updateMemberProfile } from '../actions'
import { useToast } from '@/hooks/use-toast'

interface EditMemberDialogProps {
    member: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

const positionOptions = [
    { value: 'manager', label: 'Manager' },
    { value: 'content', label: 'Content Creator' },
    { value: 'social_media', label: 'Social Media Specialist' },
    { value: 'performance', label: 'Performance Marketing' },
    { value: 'designer', label: 'Designer' },
    { value: 'editor', label: 'Video Editor' },
    { value: 'member', label: 'Member' },
]

const roleOptions = [
    { value: 'admin', label: 'Admin', description: 'Full quyền quản lý' },
    { value: 'member', label: 'Member', description: 'Quyền cơ bản' },
]

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState(member.position)
    const [selectedRole, setSelectedRole] = useState(member.role)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const result = await updateMemberProfile({
            id: member.id,
            position: selectedPosition,
            role: selectedRole,
        })

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Lỗi cập nhật",
                description: result.error,
            })
        } else {
            toast({
                title: "Thành công",
                description: "Đã cập nhật thông tin thành viên",
            })
            onOpenChange(false)
        }

        setIsSubmitting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
                    <DialogDescription>
                        {member.full_name} - {member.email}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Vị trí *</Label>
                        <Select
                            value={selectedPosition}
                            onValueChange={setSelectedPosition}
                        >
                            <SelectTrigger id="position">
                                <SelectValue placeholder="Chọn vị trí" />
                            </SelectTrigger>
                            <SelectContent>
                                {positionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Phân quyền *</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Chọn quyền" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Admin có full quyền quản lý KPI, tasks, và team members
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

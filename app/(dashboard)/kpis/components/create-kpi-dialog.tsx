'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createKPI } from '@/lib/modules/kpis/actions'
import type { KPIType, KPIPeriod } from '@/lib/modules/kpis/types'

interface CreateKPIDialogProps {
    teamMembers: any[]
    currentUserId: string
}

const kpiTypeOptions: { value: KPIType; label: string; unit: string }[] = [
    { value: 'content_articles', label: 'Số bài viết', unit: 'bài viết' },
    { value: 'content_videos', label: 'Số video', unit: 'video' },
    { value: 'content_images', label: 'Số hình ảnh', unit: 'hình ảnh' },
    { value: 'leads', label: 'Số lead', unit: 'leads' },
    { value: 'engagement_rate', label: 'Engagement Rate', unit: '%' },
    { value: 'other', label: 'Khác (tùy chỉnh)', unit: '' },
]

const periodOptions: { value: KPIPeriod; label: string }[] = [
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'quarterly', label: 'Hàng quý' },
    { value: 'yearly', label: 'Hàng năm' },
]

export function CreateKPIDialog({ teamMembers, currentUserId }: CreateKPIDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedType, setSelectedType] = useState<KPIType>('content_articles')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        const kpiType = formData.get('kpi_type') as KPIType
        const selectedKPIOption = kpiTypeOptions.find(opt => opt.value === kpiType)

        const input = {
            user_id: formData.get('user_id') as string,
            name: formData.get('name') as string,
            description: formData.get('description') as string || undefined,
            kpi_type: kpiType,
            target_value: Number(formData.get('target_value')),
            current_value: Number(formData.get('current_value')) || 0,
            unit: formData.get('unit') as string || selectedKPIOption?.unit || '',
            period: formData.get('period') as KPIPeriod,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
        }

        const result = await createKPI(input)

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        } else {
            setOpen(false)
            e.currentTarget.reset()
        }

        setIsSubmitting(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo KPI
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo KPI mới</DialogTitle>
                    <DialogDescription>
                        Thêm KPI cho thành viên trong team
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* User Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="user_id">Giao cho *</Label>
                            <Select name="user_id" required>
                                <SelectTrigger id="user_id">
                                    <SelectValue placeholder="Chọn thành viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name} - {member.position}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* KPI Type */}
                        <div className="space-y-2">
                            <Label htmlFor="kpi_type">Loại KPI *</Label>
                            <Select
                                name="kpi_type"
                                required
                                value={selectedType}
                                onValueChange={(value) => setSelectedType(value as KPIType)}
                            >
                                <SelectTrigger id="kpi_type">
                                    <SelectValue placeholder="Chọn loại KPI" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kpiTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên KPI *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="VD: Số bài viết tuần này"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Mô tả chi tiết về KPI này"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Target Value */}
                        <div className="space-y-2">
                            <Label htmlFor="target_value">Target *</Label>
                            <Input
                                id="target_value"
                                name="target_value"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="100"
                                required
                            />
                        </div>

                        {/* Current Value */}
                        <div className="space-y-2">
                            <Label htmlFor="current_value">Giá trị hiện tại</Label>
                            <Input
                                id="current_value"
                                name="current_value"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                defaultValue="0"
                            />
                        </div>

                        {/* Unit */}
                        <div className="space-y-2">
                            <Label htmlFor="unit">Đơn vị</Label>
                            <Input
                                id="unit"
                                name="unit"
                                placeholder={kpiTypeOptions.find(opt => opt.value === selectedType)?.unit || 'đơn vị'}
                                defaultValue={kpiTypeOptions.find(opt => opt.value === selectedType)?.unit}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Period */}
                        <div className="space-y-2">
                            <Label htmlFor="period">Chu kỳ *</Label>
                            <Select name="period" required defaultValue="monthly">
                                <SelectTrigger id="period">
                                    <SelectValue placeholder="Chọn chu kỳ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Ngày bắt đầu *</Label>
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <Label htmlFor="end_date">Ngày kết thúc *</Label>
                            <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tạo...' : 'Tạo KPI'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

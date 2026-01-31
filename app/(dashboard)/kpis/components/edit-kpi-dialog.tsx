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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { updateKPI } from '@/lib/modules/kpis/actions'
import type { KPI, KPIType, KPIPeriod, TrackingSource, ContentType } from '@/lib/modules/kpis/types'

interface EditKPIDialogProps {
    kpi: KPI
    teamMembers: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

const kpiTypeOptions: { value: KPIType; label: string; unit: string }[] = [
    { value: 'content_articles', label: 'Số bài viết', unit: 'bài viết' },
    { value: 'content_videos', label: 'Số video', unit: 'video' },
    { value: 'content_images', label: 'Số hình ảnh', unit: 'hình ảnh' },
    { value: 'leads', label: 'Số lead', unit: 'leads' },
    { value: 'engagement_rate', label: 'Engagement Rate', unit: '%' },
    { value: 'other', label: 'Khác (tùy chỉnh)', unit: '' },
]

const contentTypeOptions: { value: ContentType; label: string; unit: string }[] = [
    { value: 'blog_post', label: 'Bài viết', unit: 'bài viết' },
    { value: 'video', label: 'Video', unit: 'video' },
    { value: 'social_post', label: 'Hình ảnh/Social Post', unit: 'bài đăng' },
    { value: 'all', label: 'Tất cả loại content', unit: 'items' },
]

const periodOptions: { value: KPIPeriod; label: string }[] = [
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'quarterly', label: 'Hàng quý' },
    { value: 'yearly', label: 'Hàng năm' },
]

export function EditKPIDialog({ kpi, teamMembers, open, onOpenChange }: EditKPIDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedType, setSelectedType] = useState<KPIType>(kpi.kpi_type)
    const [autoTrack, setAutoTrack] = useState(kpi.auto_track || false)
    const [trackingSource, setTrackingSource] = useState<TrackingSource>(kpi.tracking_source || 'tasks')
    const [contentType, setContentType] = useState<ContentType>(kpi.tracking_filter?.content_type || 'blog_post')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        const result = await updateKPI({
            id: kpi.id,
            name: formData.get('name') as string,
            description: formData.get('description') as string || undefined,
            target_value: Number(formData.get('target_value')),
            current_value: Number(formData.get('current_value')),
            auto_track: autoTrack,
            tracking_source: trackingSource,
            tracking_filter: trackingSource === 'content' ? { content_type: contentType } : {},
            end_date: formData.get('end_date') as string,
        })

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        } else {
            onOpenChange(false)
        }

        setIsSubmitting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa KPI</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin KPI
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên KPI *</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={kpi.name}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={kpi.description || ''}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Target Value */}
                        <div className="space-y-2">
                            <Label htmlFor="target_value">Target *</Label>
                            <Input
                                id="target_value"
                                name="target_value"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={kpi.target_value}
                                required
                            />
                        </div>

                        {/* Auto Track Configuration */}
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="auto_track"
                                    checked={autoTrack}
                                    onChange={(e) => setAutoTrack(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="auto_track" className="cursor-pointer font-medium">
                                    ✨ Tự động theo dõi (Auto Track)
                                </Label>
                            </div>

                            {autoTrack && (
                                <div className="space-y-4 mt-4 pl-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Nguồn dữ liệu</Label>
                                        <RadioGroup value={trackingSource} onValueChange={(val) => setTrackingSource(val as TrackingSource)}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="tasks" id="edit-source-tasks" />
                                                <Label htmlFor="edit-source-tasks" className="cursor-pointer font-normal">
                                                    📋 Tasks (Nhiệm vụ)
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="content" id="edit-source-content" />
                                                <Label htmlFor="edit-source-content" className="cursor-pointer font-normal">
                                                    📝 Content (Nội dung)
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {trackingSource === 'content' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Loại content</Label>
                                            <Select value={contentType} onValueChange={(val) => setContentType(val as ContentType)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contentTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        ℹ️ KPI sẽ tự động cập nhật dựa trên {trackingSource === 'tasks' ? 'tasks hoàn thành' : `content ${contentType !== 'all' ? contentTypeOptions.find(o => o.value === contentType)?.label.toLowerCase() : ''} đã publish`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Current Value */}
                        <div className="space-y-2">
                            <Label htmlFor="current_value">Giá trị hiện tại *</Label>
                            <Input
                                id="current_value"
                                name="current_value"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={kpi.current_value}
                                required
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label htmlFor="end_date">Ngày kết thúc *</Label>
                        <Input
                            id="end_date"
                            name="end_date"
                            type="date"
                            defaultValue={kpi.end_date}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Ngày bắt đầu: {kpi.start_date}
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

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
import { updateKPIProgress } from '@/lib/modules/kpis/actions'
import type { KPI } from '@/lib/modules/kpis/types'

interface UpdateKPIProgressDialogProps {
    kpi: KPI
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpdateKPIProgressDialog({ kpi, open, onOpenChange }: UpdateKPIProgressDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        const result = await updateKPIProgress({
            id: kpi.id,
            current_value: Number(formData.get('current_value')),
        })

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        } else {
            onOpenChange(false)
        }

        setIsSubmitting(false)
    }

    const percentage = kpi.target_value > 0
        ? Math.round((kpi.current_value / kpi.target_value) * 100)
        : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cập nhật tiến độ KPI</DialogTitle>
                    <DialogDescription>
                        {kpi.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Info */}
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hiện tại:</span>
                            <span className="font-medium">{kpi.current_value} {kpi.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Target:</span>
                            <span className="font-medium">{kpi.target_value} {kpi.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tiến độ:</span>
                            <span className="font-semibold text-blue-600">{percentage}%</span>
                        </div>
                    </div>

                    {/* New Value Input */}
                    <div className="space-y-2">
                        <Label htmlFor="current_value">Giá trị mới *</Label>

                        {kpi.auto_track && (
                            <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm border border-amber-200 mb-2">
                                ⚠️ KPI này đang được cập nhật tự động.
                                <br />
                                <span className="text-xs opacity-80">
                                    Giá trị thủ công sẽ ghi đè auto-track. Hệ thống sẽ cập nhật lại khi refresh.
                                </span>
                            </div>
                        )}

                        <Input
                            id="current_value"
                            name="current_value"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={`${kpi.current_value}`}
                            defaultValue={kpi.current_value}
                            required
                            autoFocus
                        />

                        <p className="text-xs text-muted-foreground">
                            Đơn vị: {kpi.unit}
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
                            {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

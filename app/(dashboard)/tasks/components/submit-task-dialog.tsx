'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SubmitTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (notes: string) => Promise<void>
    isSubmitting: boolean
}

export function SubmitTaskDialog({ open, onOpenChange, onSubmit, isSubmitting }: SubmitTaskDialogProps) {
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(notes)
        setNotes('') // Reset after success
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Xác nhận hoàn thành</DialogTitle>
                    <DialogDescription>
                        Vui lòng nhập link kết quả hoặc ghi chú để người giao việc kiểm tra.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Link kết quả / Ghi chú</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Dán link Google Docs, Drive hoặc ghi chú kết quả..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Review'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

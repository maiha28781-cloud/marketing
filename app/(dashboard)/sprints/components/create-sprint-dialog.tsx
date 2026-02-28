'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { createSprint } from '@/lib/modules/sprints/actions'
import { useRouter } from 'next/navigation'

export function CreateSprintDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = e.currentTarget
        const data = new FormData(form)

        const result = await createSprint({
            name: data.get('name') as string,
            goal: data.get('goal') as string || undefined,
            start_date: data.get('start_date') as string,
            end_date: data.get('end_date') as string,
            target_velocity: parseInt(data.get('target_velocity') as string) || 0,
        })

        setLoading(false)
        if (!result.error) {
            setOpen(false)
            router.refresh()
        }
    }

    // Default to a 2-week sprint starting today
    const today = new Date().toISOString().split('T')[0]
    const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Sprint
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo Sprint mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên Sprint *</Label>
                        <Input id="name" name="name" placeholder="Sprint 1" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal">Mục tiêu Sprint</Label>
                        <Textarea id="goal" name="goal" placeholder="Sprint này nhằm đạt được..." rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Bắt đầu *</Label>
                            <Input id="start_date" name="start_date" type="date" defaultValue={today} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">Kết thúc *</Label>
                            <Input id="end_date" name="end_date" type="date" defaultValue={twoWeeks} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="target_velocity">Target Velocity (tasks)</Label>
                        <Input id="target_velocity" name="target_velocity" type="number" min={0} defaultValue={10} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo Sprint'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

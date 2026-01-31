'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCampaign } from '@/lib/modules/calendar/actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'

export function CreateCampaignDialog() {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const payload = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            budget_total: Number(formData.get('budget_total')),
            start_date: new Date(formData.get('start_date') as string),
            end_date: new Date(formData.get('end_date') as string),
            status: 'active' as const
        }

        try {
            const res = await createCampaign(payload)
            if (res.error) throw new Error(res.error)

            toast({ title: 'Campaign created successfully' })
            setOpen(false)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name *</Label>
                        <Input id="name" name="name" required placeholder="Summer Sale 2024" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Campaign goals and details..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input id="start_date" name="start_date" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date *</Label>
                            <Input id="end_date" name="end_date" type="date" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget_total">Total Budget (VND) *</Label>
                        <Input id="budget_total" name="budget_total" type="number" min="0" defaultValue="0" required />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Campaign
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

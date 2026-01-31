'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateCampaignBudget } from '@/lib/modules/budget/actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface EditBudgetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: {
        id: string
        name: string
        budget_total: number
        description?: string
        status?: string
    }
}

export function EditBudgetDialog({ open, onOpenChange, campaign }: EditBudgetDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(campaign.name)
    const [amount, setAmount] = useState(campaign.budget_total)
    const [description, setDescription] = useState(campaign.description || '')
    const [status, setStatus] = useState(campaign.status || 'active')
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await updateCampaignBudget(campaign.id, name, Number(amount), description, status)
            if (res.error) throw new Error(res.error)

            toast({ title: 'Campaign updated successfully' })
            onOpenChange(false)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            // Ensure we are sending 'trash' status
            const res = await updateCampaignBudget(campaign.id, name, Number(amount), description, 'trash')
            if (res.error) throw new Error(res.error)

            toast({ title: 'Campaign moved to trash' })
            onOpenChange(false)
        } catch (error: any) {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
            setShowDeleteAlert(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Campaign: {campaign.name}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Campaign Name</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter campaign name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    {/* Don't show trash option manually usually, but ok if present */}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Total Budget (VND)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                min="0"
                                step="100000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notes / Description</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add campaign details..."
                                className="h-24"
                            />
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteAlert(true)}
                                disabled={loading}
                            >
                                Delete
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move the campaign to the trash. You can restore it later from the trash view.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault() // Prevent auto-close
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

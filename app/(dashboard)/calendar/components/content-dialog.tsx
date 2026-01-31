'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContentItem, ContentType, ContentPlatform, ContentStatus, CreateContentItemInput } from '@/lib/modules/calendar/types'
import { createContentItem, updateContentItem, deleteContentItem } from '@/lib/modules/calendar/actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface ContentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialDate?: Date
    existingItem?: ContentItem
    campaigns: { id: string; name: string }[]
    members: { id: string; full_name: string }[]
    userRole?: string
    onDeleteSuccess?: (id: string) => void
}

const TYPES: { value: ContentType; label: string }[] = [
    { value: 'social_post', label: 'Social Post' },
    { value: 'blog_post', label: 'Blog Post' },
    { value: 'video', label: 'Video' },
    { value: 'ad_creative', label: 'Ad Creative' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' },
]

const PLATFORMS: { value: ContentPlatform; label: string }[] = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' },
]

const STATUSES: { value: ContentStatus; label: string }[] = [
    { value: 'idea', label: 'Idea' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In Review' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' },
]

export function ContentDialog({ open, onOpenChange, initialDate, existingItem, campaigns, members, userRole, onDeleteSuccess }: ContentDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const isAdmin = userRole === 'admin'

    const [formData, setFormData] = useState<Partial<CreateContentItemInput>>({
        type: 'social_post',
        platform: 'facebook',
        status: 'idea',
    })

    useEffect(() => {
        if (existingItem) {
            setFormData({
                title: existingItem.title,
                campaign_id: existingItem.campaign_id,
                type: existingItem.type,
                platform: existingItem.platform,
                status: existingItem.status,
                scheduled_date: existingItem.scheduled_date ? new Date(existingItem.scheduled_date) : undefined,
                assignee_id: existingItem.assignee_id,
                estimated_cost: existingItem.estimated_cost,
                actual_cost: existingItem.actual_cost,
                content_url: existingItem.content_url,
            })
        } else {
            setFormData({
                type: 'social_post',
                platform: 'facebook',
                status: 'idea',
                scheduled_date: initialDate,
            })
        }
    }, [existingItem, initialDate, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.title) throw new Error('Title is required')

            const payload = {
                title: formData.title,
                type: formData.type as ContentType,
                platform: formData.platform as ContentPlatform,
                status: formData.status as ContentStatus,
                scheduled_date: formData.scheduled_date,
                campaign_id: formData.campaign_id === 'none' ? undefined : formData.campaign_id,
                assignee_id: formData.assignee_id === 'none' ? undefined : formData.assignee_id,
                estimated_cost: Number(formData.estimated_cost) || 0,
                actual_cost: Number((formData as any).actual_cost) || 0,
                content_url: formData.content_url,
            }

            if (existingItem) {
                const res = await updateContentItem({
                    id: existingItem.id,
                    ...payload
                })
                if (res.error) throw new Error(res.error)
                toast({ title: 'Updated successfully' })
            } else {
                const res = await createContentItem(payload)
                if (res.error) throw new Error(res.error)
                toast({ title: 'Created successfully' })
            }
            onOpenChange(false)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteAlert(true)
    }

    const confirmDelete = async () => {
        if (!existingItem) return

        setLoading(true)
        try {
            const res = await deleteContentItem(existingItem.id)
            if (res.error) throw new Error(res.error)

            toast({ title: 'Deleted successfully' })
            onDeleteSuccess?.(existingItem.id)
            setShowDeleteAlert(false)
            onOpenChange(false)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const getStatusOptions = (type?: ContentType) => {
        if (type === 'ad_creative') {
            return [
                { value: 'draft', label: 'Draft' },
                { value: 'review', label: 'In Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'running', label: 'Running' },
                { value: 'paused', label: 'Paused' },
                { value: 'completed', label: 'Completed' },
            ]
        }
        return [
            { value: 'idea', label: 'Idea' },
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In Review' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'published', label: 'Published' },
            { value: 'cancelled', label: 'Cancelled' },
        ]
    }

    const currentStatuses = getStatusOptions(formData.type)

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex flex-row items-center justify-between pr-8">
                        <DialogTitle>{existingItem ? 'Edit Content' : 'New Content'}</DialogTitle>
                    </DialogHeader>

                    <form id="content-form" onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Summer Sale Post"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={v => {
                                        const newType = v as ContentType
                                        // Reset status if not valid for new type
                                        const newStatuses = getStatusOptions(newType)
                                        const isStatusValid = newStatuses.some(s => s.value === formData.status)

                                        setFormData({
                                            ...formData,
                                            type: newType,
                                            status: isStatusValid ? formData.status : newStatuses[0].value as ContentStatus
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <Select
                                    value={formData.platform}
                                    onValueChange={v => setFormData({ ...formData, platform: v as ContentPlatform })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLATFORMS.map(p => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={v => setFormData({ ...formData, status: v as ContentStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentStatuses.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Scheduled Date</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.scheduled_date ? format(formData.scheduled_date, "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={e => setFormData({ ...formData, scheduled_date: e.target.value ? new Date(e.target.value) : undefined })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Campaign</Label>
                                <Select
                                    value={formData.campaign_id || 'none'}
                                    onValueChange={v => setFormData({ ...formData, campaign_id: v })}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Campaign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Campaign</SelectItem>
                                        {campaigns.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Assignee</Label>
                                <Select
                                    value={formData.assignee_id || 'none'}
                                    onValueChange={v => setFormData({ ...formData, assignee_id: v })}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {members.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Estimated Cost (VND)</Label>
                                    <Input
                                        type="number"
                                        value={formData.estimated_cost || 0}
                                        onChange={e => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Actual Cost (VND)</Label>
                                    <Input
                                        type="number"
                                        value={(formData as any).actual_cost || 0}
                                        onChange={e => setFormData({ ...formData, actual_cost: Number(e.target.value) } as any)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Ghi chú / Mô tả</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ghi chú thêm về nội dung..."
                                value={formData.content_url || ''}
                                onChange={e => setFormData({ ...formData, content_url: e.target.value })}
                            />
                        </div>
                    </form>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        {existingItem && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteClick}
                                disabled={loading}
                                className="mr-auto"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" form="content-form" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the content item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

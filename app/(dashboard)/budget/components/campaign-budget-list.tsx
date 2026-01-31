'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampaignBudgetStats } from '@/lib/modules/budget/queries'
import { deleteCampaign, restoreCampaign } from '@/lib/modules/budget/actions'
import { Trash2, RotateCcw, Edit2, AlertCircle, XCircle } from 'lucide-react'
import { EditBudgetDialog } from './edit-budget-dialog'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
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

interface CampaignBudgetListProps {
    campaigns: CampaignBudgetStats[]
    isAdmin: boolean
}

export function CampaignBudgetList({ campaigns, isAdmin }: CampaignBudgetListProps) {
    const [editingCampaign, setEditingCampaign] = useState<CampaignBudgetStats | null>(null)
    const [viewTrash, setViewTrash] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        // Open confirmation dialog
        setDeleteConfirmationId(id)
    }

    const confirmDelete = async () => {
        if (!deleteConfirmationId) return

        try {
            setIsLoading(true)
            await deleteCampaign(deleteConfirmationId)
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Failed to delete campaign')
        } finally {
            setIsLoading(false)
            setDeleteConfirmationId(null)
        }
    }

    const handleRestore = async (id: string) => {
        try {
            setIsLoading(true)
            await restoreCampaign(id)
        } catch (error) {
            console.error('Failed to restore:', error)
            alert('Failed to restore campaign')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500 hover:bg-green-600'
            case 'paused': return 'bg-orange-500 hover:bg-orange-600'
            case 'completed': return 'bg-blue-500 hover:bg-blue-600'
            case 'draft': return 'bg-gray-500 hover:bg-gray-600'
            case 'trash': return 'bg-red-500 hover:bg-red-600'
            default: return 'bg-slate-500 hover:bg-slate-600'
        }
    }

    const filteredCampaigns = campaigns.filter(c =>
        viewTrash ? c.status === 'trash' : c.status !== 'trash'
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    {viewTrash ? 'Trash (Deleted Campaigns)' : 'Chi tiết theo chiến dịch'}
                </h2>
                <Button
                    variant={viewTrash ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setViewTrash(!viewTrash)}
                    className="gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    {viewTrash ? 'View Active' : 'Trash'}
                </Button>
            </div>

            <div className="grid gap-4">
                {filteredCampaigns.map(campaign => (
                    <Card key={campaign.id} className={campaign.status === 'draft' ? 'opacity-75 bg-muted/30' : ''}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                    {campaign.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-[80%]">
                                            {campaign.description}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                                            {campaign.status}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {campaign.item_count} content items
                                        </span>
                                    </div>
                                </div>
                                {isAdmin && (
                                    viewTrash ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 text-green-600 hover:text-green-700"
                                                disabled={isLoading}
                                                onClick={() => handleRestore(campaign.id)}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                                disabled={isLoading}
                                                onClick={() => handleDelete(campaign.id)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Delete Forever
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="sm" onClick={() => setEditingCampaign(campaign)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress ({campaign.spend_percent.toFixed(1)}%)</span>
                                    <span className={campaign.spend_percent > 100 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                        {formatCurrency(campaign.spend_total)} / {formatCurrency(campaign.budget_total)}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(campaign.spend_percent, 100)}
                                    className={`h-2 ${campaign.spend_percent > 100 ? 'bg-red-100' : ''}`}
                                    indicatorClassName={campaign.spend_percent > 100 ? 'bg-red-500' : undefined}
                                />

                                {campaign.remaining < 0 && (
                                    <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Over budget by {formatCurrency(Math.abs(campaign.remaining))}
                                    </div>
                                )}
                            </div>

                            {/* Content Items List */}
                            {campaign.items.length > 0 && (
                                <div className="mt-6 pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-3">Hạng mục chi tiêu ({campaign.items.length})</h4>
                                    <div className="space-y-2">
                                        {campaign.items.slice(0, 5).map(item => (
                                            <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.title}</span>
                                                    {item.platform && (
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {item.platform}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">
                                                        {formatCurrency(item.actual_cost || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {campaign.items.length > 5 && (
                                        <div className="mt-3 text-center">
                                            <Link
                                                href={`/budget/${campaign.id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Xem tất cả {campaign.items.length} hạng mục
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                ))}

                {filteredCampaigns.length === 0 && (
                    <Card className="border-dashed p-8 text-center text-muted-foreground">
                        {viewTrash ? 'Trash is empty.' : 'No active campaigns found. Start creating campaigns in Calendar.'}
                    </Card>
                )}
            </div>

            {
                editingCampaign && (
                    <EditBudgetDialog
                        open={!!editingCampaign}
                        onOpenChange={(open) => !open && setEditingCampaign(null)}
                        campaign={{
                            id: editingCampaign.id,
                            name: editingCampaign.name,
                            budget_total: editingCampaign.budget_total,
                            description: editingCampaign.description,
                            status: editingCampaign.status
                        }}
                    />
                )
            }

            <AlertDialog open={!!deleteConfirmationId} onOpenChange={() => setDeleteConfirmationId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the campaign
                            and remove all associated data from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

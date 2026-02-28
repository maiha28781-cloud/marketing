'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Save, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { updateCampaignROI } from '@/lib/modules/campaigns/actions'
import { useRouter } from 'next/navigation'

interface CampaignROIProps {
    campaignId: string
    budgetTotal: number
    spendTotal: number
    targetLeads?: number
    actualLeads?: number
    actualRevenue?: number
}

export function CampaignROI({
    campaignId,
    budgetTotal,
    spendTotal,
    targetLeads = 0,
    actualLeads = 0,
    actualRevenue = 0,
}: CampaignROIProps) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ targetLeads, actualLeads, actualRevenue })
    const router = useRouter()

    const roi = spendTotal > 0 ? ((form.actualRevenue - spendTotal) / spendTotal * 100) : 0
    const leadConversion = form.targetLeads > 0 ? Math.round((form.actualLeads / form.targetLeads) * 100) : 0

    async function handleSave() {
        setSaving(true)
        await updateCampaignROI(campaignId, {
            target_leads: form.targetLeads,
            actual_leads: form.actualLeads,
            actual_revenue: form.actualRevenue,
        })
        setSaving(false)
        setEditing(false)
        router.refresh()
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">ROI & Performance</CardTitle>
                {!editing ? (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                ) : (
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
                            <X className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={saving}>
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {editing ? (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Target Leads</Label>
                            <Input
                                type="number"
                                value={form.targetLeads}
                                onChange={e => setForm({ ...form, targetLeads: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Actual Leads</Label>
                            <Input
                                type="number"
                                value={form.actualLeads}
                                onChange={e => setForm({ ...form, actualLeads: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Revenue (VND)</Label>
                            <Input
                                type="number"
                                value={form.actualRevenue}
                                onChange={e => setForm({ ...form, actualRevenue: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Chi phí / Lead</p>
                            <p className="text-lg font-bold">
                                {form.actualLeads > 0 ? formatCurrency(spendTotal / form.actualLeads) : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">ROI</p>
                            <p className={`text-lg font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {spendTotal > 0 ? `${roi.toFixed(1)}%` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Leads {form.actualLeads}/{form.targetLeads}</p>
                            <p className="text-lg font-bold">{leadConversion}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-bold text-green-600">
                                {form.actualRevenue > 0 ? formatCurrency(form.actualRevenue) : '—'}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Pencil, Save, X } from 'lucide-react'
import { CampaignBrief } from '@/lib/modules/campaigns/types'
import { updateCampaignBrief } from '@/lib/modules/campaigns/actions'
import { useRouter } from 'next/navigation'

interface CampaignBriefCardProps {
    campaignId: string
    brief?: CampaignBrief
    phase?: string
}

export function CampaignBriefCard({ campaignId, brief, phase }: CampaignBriefCardProps) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<CampaignBrief>(brief ?? {})
    const router = useRouter()

    async function handleSave() {
        setSaving(true)
        await updateCampaignBrief(campaignId, form)
        setSaving(false)
        setEditing(false)
        router.refresh()
    }

    const phaseColors: Record<string, string> = {
        briefing: 'bg-purple-100 text-purple-700',
        planning: 'bg-blue-100 text-blue-700',
        execution: 'bg-orange-100 text-orange-700',
        reporting: 'bg-green-100 text-green-700',
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Campaign Brief</CardTitle>
                <div className="flex items-center gap-2">
                    {phase && (
                        <Badge className={phaseColors[phase] ?? ''} variant="secondary">
                            {phase}
                        </Badge>
                    )}
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
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {editing ? (
                    <>
                        <div className="space-y-1">
                            <Label className="text-xs">Mục tiêu</Label>
                            <Textarea
                                rows={2}
                                value={form.objective ?? ''}
                                onChange={e => setForm({ ...form, objective: e.target.value })}
                                placeholder="Campaign nhằm đạt được..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Target Audience</Label>
                            <Input
                                value={form.target_audience ?? ''}
                                onChange={e => setForm({ ...form, target_audience: e.target.value })}
                                placeholder="VD: Nam/Nữ 25-35, quan tâm lifestyle"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Key Messages</Label>
                            <Textarea
                                rows={2}
                                value={form.key_messages ?? ''}
                                onChange={e => setForm({ ...form, key_messages: e.target.value })}
                                placeholder="Thông điệp chính..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ghi chú</Label>
                            <Textarea
                                rows={2}
                                value={form.notes ?? ''}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </>
                ) : (
                    <dl className="space-y-2 text-sm">
                        {form.objective && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground">Mục tiêu</dt>
                                <dd>{form.objective}</dd>
                            </div>
                        )}
                        {form.target_audience && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground">Target Audience</dt>
                                <dd>{form.target_audience}</dd>
                            </div>
                        )}
                        {form.key_messages && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground">Key Messages</dt>
                                <dd>{form.key_messages}</dd>
                            </div>
                        )}
                        {form.notes && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground">Ghi chú</dt>
                                <dd>{form.notes}</dd>
                            </div>
                        )}
                        {!form.objective && !form.target_audience && !form.key_messages && (
                            <p className="text-muted-foreground text-xs italic">Chưa có brief. Nhấn chỉnh sửa để thêm.</p>
                        )}
                    </dl>
                )}
            </CardContent>
        </Card>
    )
}

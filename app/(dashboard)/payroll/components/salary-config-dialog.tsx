'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'

interface SalaryConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: any
    onSuccess: () => void
}

export function SalaryConfigDialog({ open, onOpenChange, member, onSuccess }: SalaryConfigDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [baseSalary, setBaseSalary] = useState(member?.base_salary || 0)
    const [bonusSalary, setBonusSalary] = useState(member?.bonus_salary || 0)
    const [kpiBonus, setKpiBonus] = useState(member?.kpi_bonus || 0)
    const [insuranceThreshold, setInsuranceThreshold] = useState(member?.insurance_threshold || 0)
    const [insurancePercent, setInsurancePercent] = useState(member?.insurance_percent || 0)
    const [taxPercent, setTaxPercent] = useState(member?.tax_percent || 0)
    const [rates, setRates] = useState<Array<{ id: string, type: string, amount: number }>>(() => {
        const contentRates = member?.content_rates || {}
        return Object.entries(contentRates).map(([type, amount], idx) => ({
            id: `rate-${idx}-${Date.now()}`,
            type,
            amount: Number(amount)
        }))
    })

    const handleSave = async () => {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    base_salary: baseSalary,
                    bonus_salary: bonusSalary,
                    kpi_bonus: kpiBonus,
                    insurance_threshold: insuranceThreshold,
                    insurance_percent: insurancePercent,
                    tax_percent: taxPercent,
                    content_rates: rates.reduce((acc, r) => ({ ...acc, [r.type]: r.amount }), {})
                })
                .eq('id', member.id)

            if (error) throw error

            toast({ title: 'Success', description: 'Salary configuration updated' })
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const addRate = () => {
        setRates(prev => [...prev, { id: `rate-${Date.now()}`, type: '', amount: 0 }])
    }

    const removeRate = (id: string) => {
        setRates(prev => prev.filter(r => r.id !== id))
    }

    const updateRate = (id: string, field: 'type' | 'amount', value: string | number) => {
        setRates(prev => prev.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure Salary: {member?.full_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Base Salary (Monthly)</Label>
                        <Input
                            type="number"
                            value={baseSalary}
                            onChange={(e) => setBaseSalary(Number(e.target.value))}
                            className="font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>KPI Bonus Base</Label>
                        <Input
                            type="number"
                            value={kpiBonus}
                            onChange={(e) => setKpiBonus(Number(e.target.value))}
                            className="font-mono"
                            placeholder="e.g. 2,000,000"
                        />
                        <p className="text-xs text-muted-foreground">
                            💡 Amount multiplied by coefficient (1.0x at 85%, 1.2x at 100%). KPI Target is managed on KPIs page.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Bonus Salary (Monthly)</Label>
                        <Input
                            type="number"
                            value={bonusSalary}
                            onChange={(e) => setBonusSalary(Number(e.target.value))}
                            className="font-mono"
                            placeholder="e.g. 1,000,000"
                        />
                        <p className="text-xs text-muted-foreground">
                            💡 Fixed monthly bonus (independent of KPI/products)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Insurance Deduction</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Input
                                    type="number"
                                    value={insuranceThreshold}
                                    onChange={(e) => setInsuranceThreshold(Number(e.target.value))}
                                    className="font-mono text-xs"
                                    placeholder="Threshold (VD: 5000000)"
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5">Mức miễn trừ</p>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    value={insurancePercent}
                                    onChange={(e) => setInsurancePercent(Number(e.target.value))}
                                    className="font-mono text-xs"
                                    placeholder="% (VD: 10.5)"
                                    step="0.1"
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5">Phần trăm</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tax Deduction</Label>
                        <div className="space-y-1">
                            <Input
                                type="number"
                                value={taxPercent}
                                onChange={(e) => setTaxPercent(Number(e.target.value))}
                                className="font-mono text-xs"
                                placeholder="% (VD: 10)"
                                step="0.1"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                💡 Áp dụng khi tổng thu nhập &gt; 15,000,000 ₫
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Extra Product Bonus (Optional)</Label>
                            <Button variant="outline" size="sm" onClick={addRate}>
                                <Plus className="h-4 w-4 mr-1" /> Add Rate
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                            {rates.map((rate) => (
                                <div key={rate.id} className="flex gap-2 items-center">
                                    <Input
                                        value={rate.type}
                                        onChange={(e) => updateRate(rate.id, 'type', e.target.value)}
                                        placeholder="Type (e.g. Host)"
                                        className="h-8 text-xs flex-1"
                                    />
                                    <Input
                                        type="number"
                                        value={rate.amount}
                                        onChange={(e) => updateRate(rate.id, 'amount', Number(e.target.value))}
                                        className="h-8 w-32 font-mono text-xs"
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeRate(rate.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {rates.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">No rates configured</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

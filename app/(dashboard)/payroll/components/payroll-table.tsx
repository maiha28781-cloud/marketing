'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { SalaryConfigDialog } from './salary-config-dialog'

interface PayrollTableProps {
    members: any[]
    contentItems: any[]
    activeKPIs?: any[] // Added
    currentUserRole?: string
}

export function PayrollTable({ members, contentItems, activeKPIs, currentUserRole }: PayrollTableProps) {
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [configOpen, setConfigOpen] = useState(false)

    // Calculate payroll data for each member
    const data = members.map(member => {
        const baseSalary = member.base_salary || 0
        const rates = member.content_rates || {}

        // Find auto-tracked KPIs for this member
        const memberKPIs = (activeKPIs || []).filter(kpi => kpi.user_id === member.id)

        // Calculate KPI bonus from auto-tracked KPIs
        let kpiBonusAmount = 0
        let kpiTarget = 0
        let totalTasksDone = 0
        let coefficient = 0
        let kpiBonusBase = 0

        // Get the first KPI (prefer auto-tracked, but fallback to manual)
        const primaryKPI = memberKPIs.find(kpi => kpi.auto_track) || memberKPIs[0]

        if (primaryKPI) {
            kpiTarget = primaryKPI.target_value
            totalTasksDone = primaryKPI.current_value
            kpiBonusBase = member.kpi_bonus || primaryKPI.bonus_value || 0

            const kpiPercent = kpiTarget > 0 ? (totalTasksDone / kpiTarget) * 100 : 0

            // KPI Coefficient Logic (1.2x at 100%, 1.0x at 85%, 0 below)
            if (kpiPercent >= 100) {
                coefficient = 1.2
            } else if (kpiPercent >= 85) {
                coefficient = 1.0
            } else {
                coefficient = 0
            }

            kpiBonusAmount = kpiBonusBase * coefficient
        }

        // Extra Product Bonus - match content type with rates (case-insensitive)
        const memberContent = contentItems.filter(item =>
            item.assignee_id === member.id &&
            (item.status === 'published' || item.status === 'completed')
        )

        let extraBonus = 0
        const productCounts: Record<string, number> = {}

        // Create case-insensitive rate lookup
        const ratesLowerCase: Record<string, number> = {}
        Object.entries(rates).forEach(([key, value]) => {
            ratesLowerCase[key.toLowerCase().trim()] = value as number
        })

        memberContent.forEach((item: any) => {
            const type = item.type
            const typeLower = (type || '').toLowerCase().trim()
            const rate = ratesLowerCase[typeLower] || 0

            if (rate > 0) {
                extraBonus += rate
                productCounts[type] = (productCounts[type] || 0) + 1
            }
        })

        const totalBonus = kpiBonusAmount + extraBonus + (member.bonus_salary || 0)
        const kpiPercent = kpiTarget > 0 ? (totalTasksDone / kpiTarget) * 100 : 0
        const grossTotal = baseSalary + totalBonus

        // Insurance deduction - calculated on BASE SALARY only (before bonuses)
        const insuranceDeduction = baseSalary > (member.insurance_threshold || 0)
            ? (baseSalary - (member.insurance_threshold || 0)) * ((member.insurance_percent || 0) / 100)
            : 0

        // Tax deduction - only if TOTAL INCOME > 15,000,000 VND
        const TAX_THRESHOLD = 15000000
        const taxDeduction = grossTotal > TAX_THRESHOLD
            ? (grossTotal - TAX_THRESHOLD) * ((member.tax_percent || 0) / 100)
            : 0

        const netPay = grossTotal - insuranceDeduction - taxDeduction

        return {
            ...member,
            calculated: {
                baseSalary,
                kpiTarget,
                totalTasksDone,
                kpiPercent,
                coefficient,
                kpiBonusBase,
                kpiBonusAmount,
                extraBonus,
                grossTotal,
                insuranceDeduction,
                taxDeduction,
                netPay,
                productCounts
            }
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payroll Estimation (KPI Model)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Target (KPI)</TableHead>
                            <TableHead>Actual</TableHead>
                            <TableHead>Coefficient</TableHead>
                            <TableHead>KPI Bonus</TableHead>
                            <TableHead>Base Salary</TableHead>
                            <TableHead>Bonus Salary</TableHead>
                            <TableHead>Insurance</TableHead>
                            <TableHead>Tax</TableHead>
                            <TableHead className="text-right">Estimated Total</TableHead>
                            {currentUserRole === 'admin' && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => {
                            const total = row.calculated.netPay
                            const basePercent = total > 0 ? (row.calculated.baseSalary / total) * 100 : 0
                            const bonusPercent = total > 0 ? ((row.calculated.kpiBonusAmount + row.calculated.extraBonus) / total) * 100 : 0

                            return (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{row.full_name}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{row.position || 'Member'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{row.calculated.kpiTarget} tasks</span>
                                            <span className="text-xs text-muted-foreground">
                                                Base: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.kpiBonusBase)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={row.calculated.kpiPercent >= 85 ? 'default' : 'secondary'}>
                                                {row.calculated.totalTasksDone} ({row.calculated.kpiPercent.toFixed(0)}%)
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={row.calculated.coefficient >= 1 ? 'default' : 'destructive'} className="font-mono">
                                            x{row.calculated.coefficient}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-green-600">
                                                +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.kpiBonusAmount)}
                                            </span>
                                            {row.calculated.extraBonus > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    + {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.extraBonus)} (Extra)
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.baseSalary)}
                                    </TableCell>
                                    <TableCell className="font-mono text-green-600">
                                        +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((row.bonus_salary || 0) + row.calculated.extraBonus)}
                                    </TableCell>
                                    <TableCell className="text-red-600">
                                        -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.insuranceDeduction)}
                                    </TableCell>
                                    <TableCell className="text-red-600">
                                        -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.taxDeduction)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.calculated.netPay)}
                                    </TableCell>
                                    {currentUserRole === 'admin' && (
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setSelectedMember(row)
                                                setConfigOpen(true)
                                            }}>
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            {selectedMember && (
                <SalaryConfigDialog
                    open={configOpen}
                    onOpenChange={setConfigOpen}
                    member={selectedMember}
                    onSuccess={() => window.location.reload()} // Simple reload to refresh data
                />
            )}
        </Card>
    )
}

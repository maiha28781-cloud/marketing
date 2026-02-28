'use client'

import { WeeklyReport, MonthlyReport } from '@/lib/modules/reports/queries'
import { CSVExportButton } from '@/components/shared/csv-export-button'

interface ReportExportButtonsProps {
    weeklyReport: WeeklyReport
    monthlyReport: MonthlyReport
}

export function ReportExportButtons({ weeklyReport, monthlyReport }: ReportExportButtonsProps) {
    const weeklyTasksData = weeklyReport.tasks.recent_tasks.map(t => ({
        title: t.title,
        status: t.status,
        assignee: t.assignee_name,
        position: t.assignee_position,
        due_date: t.due_date ?? '',
    }))

    const monthlyKPIData = monthlyReport.kpis.by_user.map(u => ({
        user: u.user_name,
        total_kpis: u.total_kpis,
        avg_completion: u.avg_completion,
    }))

    const budgetData = monthlyReport.budget.campaigns.map(c => ({
        campaign: c.name,
        status: c.status,
        budget: c.budget,
        spent: c.spent,
        remaining: c.budget - c.spent,
    }))

    return (
        <div className="flex gap-2">
            <CSVExportButton
                data={weeklyTasksData}
                filename={`weekly-tasks-${new Date().toISOString().split('T')[0]}`}
                label="Tasks CSV"
            />
            <CSVExportButton
                data={monthlyKPIData}
                filename={`monthly-kpis-${new Date().toISOString().split('T')[0]}`}
                label="KPIs CSV"
            />
            <CSVExportButton
                data={budgetData}
                filename={`budget-${new Date().toISOString().split('T')[0]}`}
                label="Budget CSV"
            />
        </div>
    )
}

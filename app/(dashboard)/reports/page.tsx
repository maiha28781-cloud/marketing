import { getWeeklyReport, getMonthlyReport } from '@/lib/modules/reports/queries'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeeklyReport as WeeklyReportView } from './components/weekly-report'
import { MonthlyReport as MonthlyReportView } from './components/monthly-report'
import { FileText } from 'lucide-react'

import { MonthPicker } from '@/components/shared/month-picker'

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const params = await searchParams
    const monthParam = params.month
    const referenceDate = monthParam ? new Date(`${monthParam}-01`) : undefined

    const weeklyReport = await getWeeklyReport()
    const monthlyReport = await getMonthlyReport(referenceDate)

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <h1 className="text-lg font-semibold">Reports</h1>
                            <p className="text-sm text-muted-foreground">
                                Báo cáo tổng hợp Tasks và KPIs
                            </p>
                        </div>
                    </div>
                    <div>
                        <MonthPicker />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <Tabs defaultValue="weekly" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="weekly">Tuần này</TabsTrigger>
                        <TabsTrigger value="monthly">Tháng này</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weekly" className="space-y-6">
                        <WeeklyReportView report={weeklyReport} />
                    </TabsContent>

                    <TabsContent value="monthly" className="space-y-6">
                        <MonthlyReportView report={monthlyReport} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

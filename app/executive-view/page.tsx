import { getExecutiveData } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, AlertCircle, TrendingUp, DollarSign } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ExecutiveDashboardPage() {
    // Basic protection check (secondary to middleware)
    const cookieStore = await cookies()
    const session = cookieStore.get('executive_session')
    if (!session) {
        redirect('/executive-view/login')
    }

    const data = await getExecutiveData()

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">M</span>
                        </div>
                        <span className="font-semibold text-lg">Marketing OS <span className="text-muted-foreground font-normal">| Executive View</span></span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Tháng 01/2026
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Section 1: Financial Overview */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Tài chính & Ngân sách
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng ngân sách</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.budget.total.toLocaleString()} đ</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{data.budget.spent.toLocaleString()} đ</div>
                                <p className="text-xs text-muted-foreground">
                                    {(data.budget.total > 0 ? Math.round((data.budget.spent / data.budget.total) * 100) : 0)}% ngân sách
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Còn lại</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{data.budget.remaining.toLocaleString()} đ</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Detail Table */}
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-8">
                        <div className="p-4 border-b bg-gray-50/50">
                            <h3 className="font-semibold">Chi tiết theo chiến dịch</h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Chiến dịch</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Trạng thái</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ngân sách</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Đã tiêu</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Còn lại</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.budget.campaigns && data.budget.campaigns.length > 0 ? (
                                        data.budget.campaigns.map((camp: any) => (
                                            <tr key={camp.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                                <td className="p-4 font-medium">{camp.name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                        ${camp.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            camp.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                                                                camp.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'}`}>
                                                        {camp.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">{camp.budget.toLocaleString()} đ</td>
                                                <td className="p-4 text-right text-blue-600">{camp.spent.toLocaleString()} đ</td>
                                                <td className="p-4 text-right text-green-600">{camp.remaining.toLocaleString()} đ</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs text-muted-foreground">{camp.percent}%</span>
                                                        <div className="h-2 w-16 rounded-full bg-gray-100">
                                                            <div
                                                                className="h-full rounded-full bg-blue-500"
                                                                style={{ width: `${Math.min(camp.percent, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                Chưa có dữ liệu chiến dịch active
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Spending Items */}
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-sm">
                        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-orange-500" />
                                Hạng mục chi phí cao nhất
                            </h3>
                            <span className="text-xs text-muted-foreground">Top 5 Content Items</span>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Hạng mục / Content</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Chiến dịch</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Kênh</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Chi phí thực tế</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.budget.topSpending && data.budget.topSpending.length > 0 ? (
                                        data.budget.topSpending.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50">
                                                <td className="p-4 font-medium">{item.title}</td>
                                                <td className="p-4 text-muted-foreground">{item.campaign_name}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                                                        {item.platform}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-semibold text-gray-900">
                                                    {item.actual_cost?.toLocaleString()} đ
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                                Chưa có dữ liệu chi tiêu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Section 2: Team Performance */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Hiệu quả & Báo cáo
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* KPI Stats */}
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex justify-between items-center">
                                    <span>Chi tiết KPI</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        TB: <strong className="text-primary">{data.kpis.avgAchievement}%</strong>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {data.kpis.details && data.kpis.details.length > 0 ? (
                                    data.kpis.details.map((kpi: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{kpi.name}</span>
                                                <span className="text-muted-foreground">
                                                    {kpi.current_value.toLocaleString()} / {kpi.target_value.toLocaleString()} {kpi.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${kpi.progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                        style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold w-9 text-right">{kpi.progress}%</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Chưa có KPI nào được thiết lập
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Task Stats */}
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Trạng thái công việc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-700">{data.tasks.todo}</span>
                                        <span className="text-sm text-muted-foreground font-medium">Cần làm</span>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-blue-600">{data.tasks.doing}</span>
                                        <span className="text-sm text-blue-600/80 font-medium">Đang làm</span>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-orange-600">{data.tasks.review}</span>
                                        <span className="text-sm text-orange-600/80 font-medium">Review</span>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-green-600">{data.tasks.done}</span>
                                        <span className="text-sm text-green-600/80 font-medium">Hoàn thành</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                                    <span>Tổng số metrics:</span>
                                    <span className="font-semibold text-foreground">{data.tasks.total} task</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    )
}

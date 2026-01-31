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
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50">
                            <h3 className="font-semibold">Chi tiết theo chiến dịch</h3>
                        </div>
                        <div className="p-0">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tổng quan KPI</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Mức độ hoàn thành trung bình</span>
                                    <span className="text-2xl font-bold">{data.kpis.avgAchievement}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${Math.min(data.kpis.avgAchievement, 100)}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Số lượng KPI</div>
                                        <div className="text-xl font-semibold">{data.kpis.totalKpis}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Đánh giá chung</div>
                                        <div className="text-xl font-semibold text-green-600">
                                            {data.kpis.avgAchievement >= 80 ? 'Tốt' : data.kpis.avgAchievement >= 50 ? 'Khá' : 'Cần cố gắng'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tiến độ công việc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-4">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                                            <circle
                                                cx="64" cy="64" r="60"
                                                stroke="#22c55e" strokeWidth="8" fill="transparent"
                                                strokeDasharray={377}
                                                strokeDashoffset={377 - (377 * data.tasks.rate) / 100}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-3xl font-bold">{data.tasks.rate}%</span>
                                            <span className="text-xs text-muted-foreground">Hoàn thành</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-8 mt-2">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{data.tasks.completed}</div>
                                        <div className="text-xs text-muted-foreground">Đã xong</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{data.tasks.total}</div>
                                        <div className="text-xs text-muted-foreground">Tổng task</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    )
}

'use client'

import { WeeklyReport as WeeklyReportType } from '@/lib/modules/reports/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ListTodo, Target, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WeeklyReportProps {
    report: WeeklyReportType
}

const STATUS_COLORS: Record<string, string> = {
    todo: '#94a3b8',
    doing: '#3b82f6',
    review: '#f59e0b',
    done: '#10b981',
}

const PRIORITY_COLORS: Record<string, string> = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
}

export function WeeklyReport({ report }: WeeklyReportProps) {
    const { period, tasks, kpis } = report

    // Prepare chart data
    const taskStatusData = [
        { name: 'Todo', value: tasks.by_status.todo, color: STATUS_COLORS.todo },
        { name: 'Doing', value: tasks.by_status.doing, color: STATUS_COLORS.doing },
        { name: 'Review', value: tasks.by_status.review, color: STATUS_COLORS.review },
        { name: 'Done', value: tasks.by_status.done, color: STATUS_COLORS.done },
    ]

    const kpiStatusData = [
        { name: 'Hoàn thành', value: kpis.completed, color: '#10b981' },
        { name: 'On Track', value: kpis.on_track, color: '#3b82f6' },
        { name: 'At Risk', value: kpis.at_risk, color: '#f59e0b' },
        { name: 'Behind', value: kpis.behind, color: '#ef4444' },
    ]

    const userKPIData = kpis.by_user.map(user => ({
        name: user.user_name.split(' ').slice(-1)[0], // Last name
        completion: user.avg_completion,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Báo cáo tuần</h2>
                    <p className="text-muted-foreground">{period.label}</p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2">
                    Tuần này
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {tasks.completed} hoàn thành
                        </p>
                        <Progress value={tasks.completion_rate} className="mt-2 h-1" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{tasks.completion_rate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks hoàn thành
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">KPIs</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {kpis.completed} hoàn thành
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">KPI Avg</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{kpis.avg_completion}%</div>
                        <p className="text-xs text-muted-foreground">
                            Tiến độ trung bình
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tasks Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        Công việc gần đây
                    </CardTitle>
                    <a href="/tasks" className="text-sm text-blue-600 hover:underline">
                        Xem tất cả
                    </a>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Công việc</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Giao cho</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Deadline</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.recent_tasks && tasks.recent_tasks.length > 0 ? (
                                    tasks.recent_tasks.map((task: any) => (
                                        <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                            <td className="p-4 font-medium">{task.title}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{task.assignee_name}</span>
                                                    <span className="text-xs text-muted-foreground capitalize">{task.assignee_position}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Badge variant="outline" className={`capitalize 
                                                    ${task.status === 'done' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        task.status === 'doing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            task.status === 'review' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {task.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                            Chưa có dữ liệu task trong tuần này
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Task Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks theo trạng thái</CardTitle>
                        <CardDescription>Phân bố tasks trong tuần</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* KPI Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>KPIs theo trạng thái</CardTitle>
                        <CardDescription>Phân bố KPIs trong tuần</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={kpiStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {kpiStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ngân sách & Chiến dịch</h3>
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Chiến dịch</CardTitle>
                            <Target className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{report.budget.active_campaigns}</div>
                            <p className="text-xs text-muted-foreground">
                                Đang chạy
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
                            <TrendingUp className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.budget.actual_cost)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Trong tuần này
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {report.budget.campaigns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi phí theo Chiến dịch</CardTitle>
                            <CardDescription>Ngân sách vs Thực chi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={report.budget.campaigns}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value as number)} />
                                    <Legend />
                                    <Bar dataKey="budget" fill="#94a3b8" name="Ngân sách" />
                                    <Bar dataKey="spent" fill="#ef4444" name="Đã chi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* User KPI Performance */}
            {userKPIData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>KPI Performance theo thành viên</CardTitle>
                        <CardDescription>Tiến độ KPI trung bình của từng người</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userKPIData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completion" fill="#3b82f6" name="Completion (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

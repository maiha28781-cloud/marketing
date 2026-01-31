'use client'

import { MonthlyReport as MonthlyReportType } from '@/lib/modules/reports/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ListTodo, Target, TrendingUp, Calendar } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyReportProps {
    report: MonthlyReportType
}

const STATUS_COLORS: Record<string, string> = {
    todo: '#94a3b8',
    doing: '#3b82f6',
    review: '#f59e0b',
    done: '#10b981',
}

export function MonthlyReport({ report }: MonthlyReportProps) {
    const { period, tasks, kpis, weekly_breakdown } = report

    // Prepare chart data
    const taskStatusData = [
        { name: 'Todo', value: tasks.by_status.todo, color: STATUS_COLORS.todo },
        { name: 'Doing', value: tasks.by_status.doing, color: STATUS_COLORS.doing },
        { name: 'Review', value: tasks.by_status.review, color: STATUS_COLORS.review },
        { name: 'Done', value: tasks.by_status.done, color: STATUS_COLORS.done },
    ]

    const taskPriorityData = [
        { name: 'Low', value: tasks.by_priority.low },
        { name: 'Medium', value: tasks.by_priority.medium },
        { name: 'High', value: tasks.by_priority.high },
        { name: 'Urgent', value: tasks.by_priority.urgent },
    ]

    const kpiStatusData = [
        { name: 'Hoàn thành', value: kpis.completed, color: '#10b981' },
        { name: 'On Track', value: kpis.on_track, color: '#3b82f6' },
        { name: 'At Risk', value: kpis.at_risk, color: '#f59e0b' },
        { name: 'Behind', value: kpis.behind, color: '#ef4444' },
    ]

    const userKPIData = kpis.by_user.map(user => ({
        name: user.user_name.split(' ').slice(-1)[0], // Last name
        kpis: user.total_kpis,
        completion: user.avg_completion,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Báo cáo tháng</h2>
                    <p className="text-muted-foreground">{period.label}</p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2">
                    Tháng này
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.total}</div>
                        <Progress value={tasks.completion_rate} className="mt-2 h-1" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{tasks.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            {tasks.completion_rate}% completion
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{tasks.in_progress}</div>
                        <p className="text-xs text-muted-foreground">
                            Doing + Review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {kpis.completed} done
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
                            Average progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Xu hướng theo tuần</CardTitle>
                    <CardDescription>Tasks hoàn thành và KPI trung bình mỗi tuần</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weekly_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="tasks_completed" stroke="#10b981" strokeWidth={2} name="Tasks completed" />
                            <Line yAxisId="right" type="monotone" dataKey="kpis_avg" stroke="#3b82f6" strokeWidth={2} name="KPI Avg (%)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Task Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks theo Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={70}
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

                {/* Task Priority */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks theo Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={taskPriorityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* KPI Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>KPIs theo Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={kpiStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={70}
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
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{report.budget.active_campaigns}</div>
                            <p className="text-xs text-muted-foreground">
                                Đang hoạt động
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Tổng Ngân Sách</CardTitle>
                            <Target className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(report.budget.total_budget)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Các chiến dịch active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Thực Chi</CardTitle>
                            <TrendingUp className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(report.budget.actual_cost)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Trong tháng này
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {report.budget.campaigns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hiệu quả chi tiêu theo Chiến dịch</CardTitle>
                            <CardDescription>So sánh ngân sách và thực chi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={report.budget.campaigns}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value as number)} />
                                    <Legend />
                                    <Bar dataKey="budget" fill="#94a3b8" name="Total Budget" />
                                    <Bar dataKey="spent" fill="#ef4444" name="Spent (In Period)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Team Performance */}
            {userKPIData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Team KPI Performance</CardTitle>
                        <CardDescription>Số lượng KPIs và tiến độ trung bình của từng thành viên</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userKPIData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="kpis" fill="#94a3b8" name="Số KPIs" />
                                <Bar yAxisId="right" dataKey="completion" fill="#3b82f6" name="Completion (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

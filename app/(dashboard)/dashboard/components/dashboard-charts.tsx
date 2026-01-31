'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardChartsProps {
    tasks: any[]
    kpis: any[]
    isAdmin: boolean
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

export function DashboardCharts({ tasks, kpis, isAdmin }: DashboardChartsProps) {
    // Task Status Distribution
    const tasksByStatus = [
        { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: STATUS_COLORS.todo },
        { name: 'Doing', value: tasks.filter(t => t.status === 'doing').length, color: STATUS_COLORS.doing },
        { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: STATUS_COLORS.review },
        { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: STATUS_COLORS.done },
    ]

    // Task Priority Distribution
    const tasksByPriority = [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: PRIORITY_COLORS.low },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: PRIORITY_COLORS.high },
        { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: PRIORITY_COLORS.urgent },
    ]

    // KPI Status Distribution
    const kpisByStatus = kpis.reduce((acc, kpi) => {
        const percentage = kpi.target_value > 0
            ? (kpi.current_value / kpi.target_value) * 100
            : 0

        if (percentage >= 100) acc.completed++
        else if (percentage >= 80) acc.on_track++
        else if (percentage >= 50) acc.at_risk++
        else acc.behind++

        return acc
    }, { completed: 0, on_track: 0, at_risk: 0, behind: 0 })

    const kpisData = [
        { name: 'Completed', value: kpisByStatus.completed, color: '#10b981' },
        { name: 'On Track', value: kpisByStatus.on_track, color: '#3b82f6' },
        { name: 'At Risk', value: kpisByStatus.at_risk, color: '#f59e0b' },
        { name: 'Behind', value: kpisByStatus.behind, color: '#ef4444' },
    ]

    if (tasks.length === 0 && kpis.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">Chưa có dữ liệu để hiển thị charts</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Tạo tasks và KPIs để xem visualization
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Task Status Chart */}
            {tasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks by Status</CardTitle>
                        <CardDescription>Phân bố tasks theo trạng thái</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={tasksByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {tasksByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Task Priority Chart */}
            {tasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks by Priority</CardTitle>
                        <CardDescription>Phân bố tasks theo độ ưu tiên</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={tasksByPriority}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6">
                                    {tasksByPriority.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* KPI Status Chart - Only for Admin */}
            {isAdmin && kpis.length > 0 && (
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>KPIs by Status</CardTitle>
                        <CardDescription>Phân bố KPIs theo trạng thái hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={kpisData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {kpisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

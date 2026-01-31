'use client'

import { KPI, KPISummary } from '@/lib/modules/kpis/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KPIOverviewChartsProps {
    kpis: KPI[]
    summaries: KPISummary[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function KPIOverviewCharts({ kpis, summaries }: KPIOverviewChartsProps) {
    // Prepare data for KPI Type Distribution (Pie Chart)
    const kpiTypeData = kpis.reduce((acc, kpi) => {
        const existing = acc.find(item => item.name === kpi.kpi_type)
        if (existing) {
            existing.value++
        } else {
            const labels: Record<string, string> = {
                content_articles: 'Bài viết',
                content_videos: 'Video',
                content_images: 'Hình ảnh',
                leads: 'Leads',
                engagement_rate: 'Engagement',
                other: 'Khác'
            }
            acc.push({ name: labels[kpi.kpi_type] || kpi.kpi_type, value: 1 })
        }
        return acc
    }, [] as { name: string; value: number }[])

    // Prepare data for Team Performance (Bar Chart)
    const teamPerformanceData = summaries.map(summary => ({
        name: summary.user_name.split(' ').slice(-1)[0], // Last name only
        completed: summary.completed,
        on_track: summary.on_track,
        at_risk: summary.at_risk,
        behind: summary.behind,
        avg: summary.avg_completion
    }))

    // Prepare data for Overall Progress (Line Chart) - Top 8 KPIs
    const topKPIs = kpis
        .slice(0, 8)
        .map(kpi => {
            const percentage = kpi.target_value > 0
                ? Math.round((kpi.current_value / kpi.target_value) * 100)
                : 0
            return {
                name: kpi.name.length > 20 ? kpi.name.substring(0, 20) + '...' : kpi.name,
                progress: percentage,
                target: 100
            }
        })

    if (kpis.length === 0) {
        return null
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* KPI Type Distribution - Pie Chart */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Phân bố loại KPI</CardTitle>
                    <CardDescription>Số lượng KPI theo loại</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={kpiTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {kpiTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Team Performance - Bar Chart */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Hiệu suất team</CardTitle>
                    <CardDescription>Tổng quan KPI theo thành viên</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={teamPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Hoàn thành" />
                            <Bar dataKey="on_track" stackId="a" fill="#3b82f6" name="On Track" />
                            <Bar dataKey="at_risk" stackId="a" fill="#f59e0b" name="At Risk" />
                            <Bar dataKey="behind" stackId="a" fill="#ef4444" name="Behind" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Overall Progress - Line Chart */}
            {topKPIs.length > 0 && (
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tiến độ các KPI</CardTitle>
                        <CardDescription>So sánh tiến độ với target (Top {topKPIs.length} KPIs)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={topKPIs}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="Target" />
                                <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} name="Tiến độ (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

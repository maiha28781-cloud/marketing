'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { Sprint } from '@/lib/modules/sprints/types'

interface VelocityChartProps {
    sprints: Sprint[]
}

export function VelocityChart({ sprints }: VelocityChartProps) {
    const data = sprints
        .filter((s) => s.status === 'completed')
        .slice(0, 6)
        .reverse()
        .map((s) => ({
            name: s.name,
            target: s.target_velocity,
            actual: s.actual_velocity,
        }))

    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Velocity Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có sprint hoàn thành</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Velocity Tracking</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="target" name="Target" fill="#94a3b8" />
                        <Bar dataKey="actual" name="Actual" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

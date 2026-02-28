'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface BurndownChartProps {
    data: { date: string; ideal: number; actual: number }[]
}

export function BurndownChart({ data }: BurndownChartProps) {
    const formatted = data.map((d) => ({
        ...d,
        label: format(new Date(d.date), 'dd/MM', { locale: vi }),
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Burndown Chart</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={formatted}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="ideal"
                            name="Ideal"
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

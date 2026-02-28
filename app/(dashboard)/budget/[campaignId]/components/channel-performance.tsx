'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { ContentItem } from '@/lib/modules/calendar/types'

interface ChannelPerformanceProps {
    items: ContentItem[]
}

const PLATFORM_COLORS: Record<string, string> = {
    facebook: '#1877f2',
    tiktok: '#000000',
    youtube: '#ff0000',
    instagram: '#e1306c',
    website: '#10b981',
    email: '#f59e0b',
    linkedin: '#0077b5',
    other: '#94a3b8',
}

export function ChannelPerformance({ items }: ChannelPerformanceProps) {
    // Group by platform
    const platforms = Array.from(new Set(items.map(i => i.platform)))
    const chartData = platforms.map(platform => {
        const platformItems = items.filter(i => i.platform === platform)
        return {
            platform,
            published: platformItems.filter(i => i.status === 'published').length,
            scheduled: platformItems.filter(i => i.status === 'scheduled').length,
            draft: platformItems.filter(i => ['draft', 'idea'].includes(i.status)).length,
            cost: platformItems.reduce((sum, i) => sum + (i.actual_cost ?? 0), 0),
        }
    })

    if (!chartData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Channel Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có content item nào.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="published" name="Published" fill="#10b981" />
                        <Bar dataKey="scheduled" name="Scheduled" fill="#3b82f6" />
                        <Bar dataKey="draft" name="Draft" fill="#94a3b8" />
                    </BarChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap gap-2">
                    {platforms.map(p => (
                        <Badge
                            key={p}
                            style={{ backgroundColor: PLATFORM_COLORS[p] ?? '#94a3b8', color: 'white' }}
                            className="capitalize"
                        >
                            {p}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

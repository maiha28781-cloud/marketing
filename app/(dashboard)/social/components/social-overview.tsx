'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentItem } from '@/lib/modules/calendar/types'
import { BarChart3, CheckCircle2, FileText, Share2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface SocialOverviewProps {
    items: ContentItem[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658']

export function SocialOverview({ items }: SocialOverviewProps) {
    // Current month items for summary cards
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyItems = items.filter(item => {
        if (!item.scheduled_date) return false
        const date = new Date(item.scheduled_date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const totalItems = monthlyItems.length
    const publishedItems = monthlyItems.filter(i => i.status === 'published' || i.status === 'completed').length
    const draftItems = monthlyItems.filter(i => i.status === 'draft' || i.status === 'idea' || i.status === 'review').length

    // Platform stats (All time or Monthly? Let's do Monthly for consistency with top cards, but charts often good for overall context. Let's stick to monthly for the "Overview" concept, or passed items which seem to be ALL items from page.tsx. 
    // Wait, page.tsx fetches ALL items. So let's use ALL items for charts to show bigger picture, or maybe filter? 
    // Let's use ALL items for charts to make them look more populated, or clarify "This Month" in title.
    // Given the dashboard title isn't specific to month, let's use ALL items for charts, but keep cards monthly as KPIs often track monthly progress.
    // Actually, consistency is key. Let's keep cards monthly but maybe charts all time? Or add a filter later. 
    // For now, let's use ALL items for charts for better viz.)

    const platformData = Object.entries(items.reduce((acc, item) => {
        const platform = item.platform || 'other'
        acc[platform] = (acc[platform] || 0) + 1
        return acc
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))

    const statusData = Object.entries(items.reduce((acc, item) => {
        const status = item.status || 'draft'
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))

    // Sort order for status to make pipeline sensical
    const statusOrder = ['idea', 'draft', 'review', 'scheduled', 'published', 'completed', 'cancelled']
    statusData.sort((a, b) => statusOrder.indexOf(a.name) - statusOrder.indexOf(b.name))


    return (
        <div className="space-y-6 mb-6">
            {/* Summary Cards (Monthly) */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Posts this Month
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Social & Editorial content
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Published
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedItems}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalItems > 0 ? Math.round((publishedItems / totalItems) * 100) : 0}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            In Pipeline
                        </CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{draftItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Drafts, Ideas & Reviews
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Top Platform
                        </CardTitle>
                        <Share2 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">
                            {platformData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most active channel
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Platform Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {platformData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Content Status Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={80} tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Posts" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

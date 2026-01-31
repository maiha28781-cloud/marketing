'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetOverview } from '@/lib/modules/budget/queries'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingUp, AlertOctagon, PiggyBank } from 'lucide-react'

interface BudgetOverviewProps {
    data: BudgetOverview
}

export function BudgetOverviewStats({ data }: BudgetOverviewProps) {
    // Data for chart
    const chartData = data.campaigns
        .filter(c => c.spend_total > 0)
        .map(c => ({
            name: c.name,
            value: c.spend_total
        }))

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.total_budget)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {data.campaigns.length} active campaigns
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.total_spend)}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.spend_percent.toFixed(1)}% of budget used
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <PiggyBank className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.total_remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {formatCurrency(data.total_remaining)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available funds
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Spend Distribution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Campaign</CardTitle>
                    <CardDescription>Distribution of expenses across campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No spending data yet
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

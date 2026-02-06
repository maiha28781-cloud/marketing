'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendData {
    budget: {
        current: number
        previous: number
        change: number
        changePercent: number
    }
    taskCompletion: {
        current: number
        previous: number
        change: number
    }
    kpiAchievement: {
        current: number
        previous: number
        change: number
    }
}

interface TrendAnalysisCardProps {
    data: TrendData
}

export function TrendAnalysisCard({ data }: TrendAnalysisCardProps) {
    const getTrendIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
        if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
        return <Minus className="w-4 h-4 text-gray-400" />
    }

    const getTrendColor = (change: number) => {
        if (change > 0) return 'text-green-600'
        if (change < 0) return 'text-red-600'
        return 'text-gray-500'
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">So sánh xu hướng</CardTitle>
                <p className="text-xs text-muted-foreground">Tháng này vs tháng trước</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Budget */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium">Ngân sách chi tiêu</div>
                        <div className="text-xs text-muted-foreground">
                            {data.budget.current.toLocaleString()} đ
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getTrendIcon(data.budget.change)}
                        <span className={`text-sm font-bold ${getTrendColor(data.budget.change)}`}>
                            {data.budget.changePercent > 0 ? '+' : ''}{data.budget.changePercent}%
                        </span>
                    </div>
                </div>

                {/* Task Completion */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium">Hoàn thành task</div>
                        <div className="text-xs text-muted-foreground">
                            {data.taskCompletion.current}%
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getTrendIcon(data.taskCompletion.change)}
                        <span className={`text-sm font-bold ${getTrendColor(data.taskCompletion.change)}`}>
                            {data.taskCompletion.change > 0 ? '+' : ''}{data.taskCompletion.change}%
                        </span>
                    </div>
                </div>

                {/* KPI Achievement */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium">Đạt KPI trung bình</div>
                        <div className="text-xs text-muted-foreground">
                            {data.kpiAchievement.current}%
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getTrendIcon(data.kpiAchievement.change)}
                        <span className={`text-sm font-bold ${getTrendColor(data.kpiAchievement.change)}`}>
                            {data.kpiAchievement.change > 0 ? '+' : ''}{data.kpiAchievement.change}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ContentData {
    byStatus: {
        published: number
        draft: number
        review: number
    }
    byPlatform: Array<{
        platform: string
        count: number
    }>
    recentPublished: Array<{
        id: string
        title: string
        platform: string
        scheduled_date: string
    }>
    total: number
}

interface ContentPerformanceCardProps {
    data: ContentData
}

export function ContentPerformanceCard({ data }: ContentPerformanceCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Hiệu quả nội dung
                    <span className="ml-auto text-xs text-muted-foreground">Tổng: {data.total}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Status Breakdown */}
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Theo trạng thái</div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Đã đăng
                                </span>
                                <span className="font-bold">{data.byStatus.published}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                    Nháp
                                </span>
                                <span className="font-bold">{data.byStatus.draft}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Review
                                </span>
                                <span className="font-bold">{data.byStatus.review}</span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Breakdown */}
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Theo kênh</div>
                        <div className="space-y-1.5">
                            {data.byPlatform.length > 0 ? (
                                data.byPlatform.slice(0, 5).map((p) => (
                                    <div key={p.platform} className="flex justify-between items-center text-sm">
                                        <span className="capitalize">{p.platform}</span>
                                        <span className="font-bold">{p.count}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-muted-foreground">Chưa có dữ liệu</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Published */}
                {data.recentPublished.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="text-xs font-medium text-muted-foreground mb-3">Mới đăng gần đây</div>
                        <div className="space-y-2">
                            {data.recentPublished.slice(0, 3).map((item) => (
                                <div key={item.id} className="text-sm flex justify-between">
                                    <span className="truncate flex-1 pr-2">{item.title}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{item.platform}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

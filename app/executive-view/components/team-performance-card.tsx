'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users2 } from 'lucide-react'

interface TeamMember {
    id: string
    name: string
    position: string
    tasksTotal: number
    tasksCompleted: number
    kpiUnit: string
    completionRate: number
    kpiAchievement: number
    performance: 'excellent' | 'good' | 'needs_support'
}

interface TeamPerformanceCardProps {
    members: TeamMember[]
}

export function TeamPerformanceCard({ members }: TeamPerformanceCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-primary" />
                    Hiệu suất thành viên
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {members.length > 0 ? (
                    members.map((member) => (
                        <div key={member.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{member.name}</span>
                                        {member.performance === 'excellent' && (
                                            <Badge variant="default" className="text-xs bg-green-500">⭐ Top</Badge>
                                        )}
                                        {member.performance === 'needs_support' && (
                                            <Badge variant="destructive" className="text-xs">⚠️ Cần hỗ trợ</Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">{member.position}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold">{member.completionRate}%</div>
                                    <div className="text-xs text-muted-foreground">{member.tasksCompleted}/{member.tasksTotal} {member.kpiUnit}</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-full rounded-full ${member.completionRate >= 80 ? 'bg-green-500' :
                                        member.completionRate >= 50 ? 'bg-blue-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${member.completionRate}%` }}
                                />
                            </div>
                            {member.kpiAchievement > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    KPI: {member.kpiAchievement}%
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Không có dữ liệu thành viên
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface RiskAlert {
    type: 'budget' | 'task' | 'kpi'
    severity: 'warning' | 'critical'
    message: string
    details: any
}

interface RiskAlertsCardProps {
    risks: RiskAlert[]
}

export function RiskAlertsCard({ risks }: RiskAlertsCardProps) {
    const getIcon = (severity: string) => {
        if (severity === 'critical') return <AlertCircle className="w-4 h-4 text-red-600" />
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
    }

    const getBgColor = (severity: string) => {
        if (severity === 'critical') return 'bg-red-50 border-red-200'
        return 'bg-orange-50 border-orange-200'
    }

    const getTextColor = (severity: string) => {
        if (severity === 'critical') return 'text-red-900'
        return 'text-orange-900'
    }

    return (
        <Card className="h-full border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Cảnh báo nguy cơ
                    {risks.length > 0 && (
                        <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            {risks.length} vấn đề
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {risks.length > 0 ? (
                    risks.map((risk, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border flex items-start gap-2 ${getBgColor(risk.severity)}`}>
                            {getIcon(risk.severity)}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${getTextColor(risk.severity)}`}>
                                    {risk.message}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-green-600 font-medium text-sm">
                        ✅ Không có rủi ro nào được phát hiện
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

import { Campaign360KPI } from '@/lib/modules/campaigns/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CampaignKPIsProps {
    kpis: Campaign360KPI[]
}

export function CampaignKPIs({ kpis }: CampaignKPIsProps) {
    if (!kpis.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">KPIs liên kết</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có KPI nào được gắn với campaign này.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">KPIs liên kết ({kpis.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {kpis.map((kpi) => {
                    const percent = kpi.target_value > 0
                        ? Math.min(Math.round((kpi.current_value / kpi.target_value) * 100), 100)
                        : 0
                    return (
                        <div key={kpi.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium truncate">{kpi.title}</span>
                                <span className="text-muted-foreground shrink-0 ml-2">
                                    {kpi.current_value}/{kpi.target_value} {kpi.unit}
                                </span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

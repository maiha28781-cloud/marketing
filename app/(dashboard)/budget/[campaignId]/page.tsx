import { getCampaign360 } from '@/lib/modules/campaigns/queries'
import { getCampaignDetails } from '@/lib/modules/budget/queries'
import { redirect } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { CampaignBriefCard } from './components/campaign-brief'
import { ChannelPerformance } from './components/channel-performance'
import { CampaignROI } from './components/campaign-roi'
import { CampaignKPIs } from './components/campaign-kpis'
import { CampaignTimeline } from './components/campaign-timeline'
import { PrintButton } from './components/print-button'

export default async function CampaignDetailsPage({
    params
}: {
    params: Promise<{ campaignId: string }>
}) {
    const { campaignId } = await params
    const [campaign, budgetStats] = await Promise.all([
        getCampaign360(campaignId),
        getCampaignDetails(campaignId),
    ])

    if (!campaign || !budgetStats) {
        redirect('/budget')
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
    }

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6 gap-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/budget">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold">{campaign.name}</h1>
                            <p className="text-sm text-muted-foreground">Campaign 360° View</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={statusColors[campaign.status] ?? ''} variant="secondary">
                            {campaign.status}
                        </Badge>
                        <PrintButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto print:p-4">
                {/* Top KPI Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Ngân sách</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(budgetStats.budget_total)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Đã chi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(budgetStats.spend_total)}</div>
                            <Progress value={Math.min(budgetStats.spend_percent, 100)} className="h-1.5 mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">{budgetStats.spend_percent.toFixed(1)}%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Còn lại</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl font-bold ${budgetStats.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {formatCurrency(Math.abs(budgetStats.remaining))}
                            </div>
                            {budgetStats.remaining < 0 && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" /> Over budget
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Content Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{campaign.content_items?.length ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {campaign.content_items?.filter(i => i.status === 'published').length ?? 0} published
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="expenses">Chi tiêu</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <CampaignBriefCard
                                campaignId={campaign.id}
                                brief={campaign.brief}
                                phase={campaign.phase}
                            />
                            <CampaignROI
                                campaignId={campaign.id}
                                budgetTotal={budgetStats.budget_total}
                                spendTotal={budgetStats.spend_total}
                                targetLeads={campaign.target_leads}
                                actualLeads={campaign.actual_leads}
                                actualRevenue={campaign.actual_revenue}
                            />
                        </div>
                        <CampaignKPIs kpis={campaign.kpis ?? []} />
                    </TabsContent>

                    <TabsContent value="timeline">
                        <CampaignTimeline
                            items={campaign.content_items ?? []}
                            startDate={campaign.start_date}
                            endDate={campaign.end_date}
                        />
                    </TabsContent>

                    <TabsContent value="performance">
                        <ChannelPerformance items={campaign.content_items ?? []} />
                    </TabsContent>

                    <TabsContent value="expenses">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hạng mục chi tiêu ({budgetStats.items.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hạng mục</TableHead>
                                            <TableHead>Nền tảng</TableHead>
                                            <TableHead>Chi phí</TableHead>
                                            <TableHead>Ngày cập nhật</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {budgetStats.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.title}</TableCell>
                                                <TableCell className="capitalize">{item.platform || '-'}</TableCell>
                                                <TableCell>{formatCurrency(item.actual_cost || 0)}</TableCell>
                                                <TableCell>{new Date(item.updated_at).toLocaleDateString('vi-VN')}</TableCell>
                                            </TableRow>
                                        ))}
                                        {budgetStats.items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                    Chưa có chi tiêu nào
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default async function CampaignDetailsPage({
    params
}: {
    params: Promise<{ campaignId: string }>
}) {
    const { campaignId } = await params
    const campaign = await getCampaignDetails(campaignId)

    if (!campaign) {
        redirect('/budget')
    }

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6 gap-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-4">
                    <Link href="/budget">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">{campaign.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Chi tiết ngân sách và chi tiêu
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng ngân sách</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(campaign.budget_total)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(campaign.spend_total)}</div>
                            <Progress value={Math.min(campaign.spend_percent, 100)} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {campaign.spend_percent.toFixed(1)}% ngân sách
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Còn lại</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${campaign.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {formatCurrency(Math.abs(campaign.remaining))}
                            </div>
                            {campaign.remaining < 0 && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Vượt quá ngân sách
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Content Items List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách hạng mục chi tiêu ({campaign.items.length})</CardTitle>
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
                                {campaign.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="capitalize">{item.platform || '-'}</TableCell>
                                        <TableCell>{formatCurrency(item.actual_cost || 0)}</TableCell>
                                        <TableCell>{new Date(item.updated_at).toLocaleDateString('vi-VN')}</TableCell>
                                    </TableRow>
                                ))}
                                {campaign.items.length === 0 && (
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
            </main>
        </div>
    )
}

'use client'

import { KPI } from '@/lib/modules/kpis/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { EditKPIDialog } from './edit-kpi-dialog'
import { UpdateKPIProgressDialog } from './update-kpi-progress-dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteKPI } from '@/lib/modules/kpis/actions'

interface KPIListProps {
    kpis: KPI[]
    teamMembers: any[]
    currentUserId: string
    userRole?: string
}

export function KPIList({ kpis, teamMembers, currentUserId, userRole }: KPIListProps) {
    const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)
    const [kpiToDelete, setKpiToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'text-green-600'
        if (percentage >= 80) return 'text-blue-600'
        if (percentage >= 50) return 'text-amber-600'
        return 'text-red-600'
    }

    const getStatusBadge = (percentage: number) => {
        if (percentage >= 100) return <Badge className="bg-green-100 text-green-700">Hoàn thành</Badge>
        if (percentage >= 80) return <Badge className="bg-blue-100 text-blue-700">On Track</Badge>
        if (percentage >= 50) return <Badge className="bg-amber-100 text-amber-700">At Risk</Badge>
        return <Badge className="bg-red-100 text-red-700">Behind</Badge>
    }

    const handleDeleteConfirm = async () => {
        if (!kpiToDelete) return

        setIsDeleting(true)
        const result = await deleteKPI(kpiToDelete)

        if (result.error) {
            alert(`Lỗi: ${result.error}`)
        }

        setIsDeleting(false)
        setKpiToDelete(null)
    }

    if (kpis.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">Chưa có KPI nào</p>
                    {userRole === 'admin' && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Tạo KPI đầu tiên bằng nút "Tạo KPI" ở trên
                        </p>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi) => {
                    const percentage = kpi.target_value > 0
                        ? Math.round((kpi.current_value / kpi.target_value) * 100)
                        : 0
                    const isIncreasing = percentage >= 50

                    return (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-base">{kpi.name}</CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            {format(new Date(kpi.start_date), 'dd MMM', { locale: vi })} - {format(new Date(kpi.end_date), 'dd MMM yyyy', { locale: vi })}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {(userRole === 'admin' || kpi.user_id === currentUserId) && (
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedKPI(kpi)
                                                    setIsUpdatingProgress(true)
                                                }}>
                                                    Cập nhật tiến độ
                                                </DropdownMenuItem>
                                            )}
                                            {userRole === 'admin' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedKPI(kpi)
                                                        setIsEditing(true)
                                                    }}>
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setKpiToDelete(kpi.id)}
                                                    >
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tiến độ</span>
                                        <div className="flex items-center gap-1">
                                            {isIncreasing ? (
                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 text-red-600" />
                                            )}
                                            <span className={`font-semibold ${getStatusColor(percentage)}`}>
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{kpi.current_value} {kpi.unit}</span>
                                        <span>Target: {kpi.target_value} {kpi.unit}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    {kpi.user && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(kpi.user.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">{kpi.user.full_name}</span>
                                        </div>
                                    )}
                                    {getStatusBadge(percentage)}
                                </div>

                                {kpi.description && (
                                    <p className="text-xs text-muted-foreground pt-2 border-t">
                                        {kpi.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Edit Dialog */}
            {selectedKPI && (
                <EditKPIDialog
                    kpi={selectedKPI}
                    teamMembers={teamMembers}
                    open={isEditing}
                    onOpenChange={setIsEditing}
                />
            )}

            {/* Update Progress Dialog */}
            {selectedKPI && (
                <UpdateKPIProgressDialog
                    kpi={selectedKPI}
                    open={isUpdatingProgress}
                    onOpenChange={setIsUpdatingProgress}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!kpiToDelete} onOpenChange={(open) => !open && setKpiToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa KPI</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa KPI này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getKPIStats, getActiveKPIs } from '@/lib/modules/kpis/queries'
import { CheckCircle2, ListTodo, Target, TrendingUp, AlertTriangle, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardCharts } from './components/dashboard-charts'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    // Get tasks stats
    const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')

    const { data: myTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user?.id)

    const tasksCompleted = allTasks?.filter(t => t.status === 'done').length || 0
    const tasksInProgress = allTasks?.filter(t => ['doing', 'review'].includes(t.status)).length || 0
    const myTasksPending = myTasks?.filter(t => t.status !== 'done').length || 0
    const taskCompletionRate = allTasks && allTasks.length > 0
        ? Math.round((tasksCompleted / allTasks.length) * 100)
        : 0

    // Get KPI stats
    const kpiStats = await getKPIStats()
    const myKPIs = await getActiveKPIs()
    const myKPIsFiltered = myKPIs.filter(k => k.user_id === user?.id)
    const myKPIAvg = myKPIsFiltered.length > 0
        ? Math.round(myKPIsFiltered.reduce((sum, k) => {
            const pct = k.target_value > 0 ? (k.current_value / k.target_value) * 100 : 0
            return sum + pct
        }, 0) / myKPIsFiltered.length)
        : 0

    // Get team count
    const { count: teamCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div>
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Chào mừng trở lại, {profile?.full_name}!
                    </p>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* My Tasks */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Tasks của tôi</CardTitle>
                            <ListTodo className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myTasksPending}</div>
                            <p className="text-xs text-muted-foreground">
                                Chưa hoàn thành
                            </p>
                            <Link href="/tasks">
                                <Button variant="link" className="px-0 h-auto mt-2 text-xs">
                                    Xem tất cả →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* KPI Performance */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">KPI Performance</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{myKPIAvg}%</div>
                            <p className="text-xs text-muted-foreground">
                                {myKPIsFiltered.length} KPIs đang theo dõi
                            </p>
                            <Link href="/kpis">
                                <Button variant="link" className="px-0 h-auto mt-2 text-xs">
                                    Chi tiết →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Team Tasks Completion */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Team Completion</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{taskCompletionRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {tasksCompleted}/{allTasks?.length || 0} tasks hoàn thành
                            </p>
                            <Progress value={taskCompletionRate} className="mt-2 h-1" />
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    {profile?.role === 'admin' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{teamCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    Thành viên trong team
                                </p>
                                <Link href="/team">
                                    <Button variant="link" className="px-0 h-auto mt-2 text-xs">
                                        Quản lý →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* KPI Overview */}
                {profile?.role === 'admin' && kpiStats.total > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>KPI Overview</CardTitle>
                            <CardDescription>Tổng quan KPI của team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="text-2xl font-bold">{kpiStats.total}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Completed</span>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">{kpiStats.completed}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">On Track</span>
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">{kpiStats.on_track}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">At Risk</span>
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-amber-600">{kpiStats.at_risk}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Behind</span>
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">{kpiStats.behind}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Task & KPI Charts */}
                <DashboardCharts
                    tasks={allTasks || []}
                    kpis={myKPIs}
                    isAdmin={profile?.role === 'admin'}
                />

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Các tính năng chính của Marketing OS</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link href="/tasks">
                                <Card className="cursor-pointer hover:bg-accent transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-base">📋 Tasks</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        Quản lý công việc với Kanban board và List view
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/kpis">
                                <Card className="cursor-pointer hover:bg-accent transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-base">🎯 KPIs</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        Theo dõi KPI với charts và progress tracking
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/reports">
                                <Card className="cursor-pointer hover:bg-accent transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-base">📊 Reports</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        Báo cáo weekly và monthly với comprehensive charts
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

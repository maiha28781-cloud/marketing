import { createClient } from '@/lib/supabase/server'
import { getActiveKPIs, getKPIStats, getKPISummaryByUser } from '@/lib/modules/kpis/queries'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateKPIDialog } from './components/create-kpi-dialog'
import { KPIList } from './components/kpi-list'
import { KPIOverviewCharts } from './components/kpi-overview-charts'
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function KPIsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get all team members for assignment
    const { data: teamMembers } = await supabase
        .from('profiles')
        .select('id, full_name, email, position')
        .order('full_name')

    const kpis = await getActiveKPIs()  // Use getActiveKPIs for auto-track support!
    const stats = await getKPIStats()
    const summaries = await getKPISummaryByUser()

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">KPIs</h1>
                        <p className="text-sm text-muted-foreground">
                            Quản lý KPI của team
                        </p>
                    </div>
                    {profile?.role === 'admin' && (
                        <CreateKPIDialog teamMembers={teamMembers || []} currentUserId={user.id} />
                    )}
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Tổng KPIs</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">On Track</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.on_track}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.at_risk}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Behind</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.behind}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Overview Charts */}
                <KPIOverviewCharts kpis={kpis} summaries={summaries} />

                {/* KPI List */}
                <KPIList
                    kpis={kpis}
                    teamMembers={teamMembers || []}
                    currentUserId={user.id}
                    userRole={profile?.role}
                />
            </main>
        </div>
    )
}

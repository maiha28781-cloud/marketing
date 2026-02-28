import { getSprints, getActiveSprint, getSprintTasks, getBacklogTasks, getBurndownData } from '@/lib/modules/sprints/queries'
import { createClient } from '@/lib/supabase/server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap } from 'lucide-react'
import { CreateSprintDialog } from './components/create-sprint-dialog'
import { SprintBoard } from './components/sprint-board'
import { SprintBacklog } from './components/sprint-backlog'
import { BurndownChart } from './components/burndown-chart'
import { VelocityChart } from './components/velocity-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function SprintsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const [sprints, activeSprint, backlogTasks] = await Promise.all([
        getSprints(),
        getActiveSprint(),
        getBacklogTasks(),
    ])

    const sprintTasks = activeSprint ? await getSprintTasks(activeSprint.id) : []
    const burndownData = activeSprint
        ? await getBurndownData(activeSprint.id, activeSprint.start_date, activeSprint.end_date)
        : []

    const isAdmin = profile?.role === 'admin'

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <h1 className="text-lg font-semibold">Sprints</h1>
                            <p className="text-sm text-muted-foreground">Sprint Planning & Tracking</p>
                        </div>
                    </div>
                    {isAdmin && <CreateSprintDialog />}
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {!activeSprint && sprints.length === 0 ? (
                    <EmptyState
                        icon={Zap}
                        title="Chưa có Sprint nào"
                        description="Tạo sprint đầu tiên để bắt đầu lập kế hoạch 2 tuần cho team."
                    />
                ) : (
                    <Tabs defaultValue={activeSprint ? 'board' : 'history'} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="board" disabled={!activeSprint}>Board</TabsTrigger>
                            <TabsTrigger value="burndown" disabled={!activeSprint}>Burndown</TabsTrigger>
                            <TabsTrigger value="backlog">Backlog ({backlogTasks.length})</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="board">
                            {activeSprint && (
                                <SprintBoard sprint={activeSprint} tasks={sprintTasks} />
                            )}
                        </TabsContent>

                        <TabsContent value="burndown">
                            {activeSprint && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <BurndownChart data={burndownData} />
                                    <VelocityChart sprints={sprints} />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="backlog">
                            <div className="max-w-2xl">
                                <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                                    Tasks chưa có Sprint ({backlogTasks.length})
                                </h2>
                                {activeSprint ? (
                                    <SprintBacklog backlogTasks={backlogTasks} sprintId={activeSprint.id} />
                                ) : (
                                    <p className="text-sm text-muted-foreground">Cần có sprint active để thêm tasks.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="history">
                            <div className="space-y-3">
                                {sprints.map((sprint) => (
                                    <Card key={sprint.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{sprint.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(sprint.start_date), 'dd/MM/yyyy', { locale: vi })}
                                                    {' → '}
                                                    {format(new Date(sprint.end_date), 'dd/MM/yyyy', { locale: vi })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-right">
                                                    <div className="font-semibold">{sprint.actual_velocity}/{sprint.target_velocity}</div>
                                                    <div className="text-muted-foreground text-xs">tasks</div>
                                                </div>
                                                <Badge variant={sprint.status === 'active' ? 'default' : sprint.status === 'completed' ? 'secondary' : 'outline'}>
                                                    {sprint.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    )
}

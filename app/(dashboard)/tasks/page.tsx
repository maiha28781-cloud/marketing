import { createClient } from '@/lib/supabase/server'
import { getTasks, getTaskStats } from '@/lib/modules/tasks/queries'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskList } from './components/task-list'
import { KanbanBoard } from './components/kanban-board'
import { CreateTaskDialog } from './components/create-task-dialog'
import { ViewSwitcher } from './components/view-switcher'

export default async function TasksPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>
}) {
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
        .select('id, full_name, email, position, role, avatar_url')
        .order('full_name')

    const tasks = await getTasks()
    const stats = await getTaskStats(user.id)

    // Await searchParams in Next.js 15
    const params = await searchParams
    const view = params.view || 'kanban'

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Tasks</h1>
                        <p className="text-sm text-muted-foreground">
                            Quản lý công việc của team
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ViewSwitcher currentView={view} />
                        <CreateTaskDialog
                            teamMembers={teamMembers || []}
                            currentUserId={user.id}
                            currentUserRole={profile?.role}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Tổng tasks</CardDescription>
                            <CardTitle className="text-3xl">{stats.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Todo</CardDescription>
                            <CardTitle className="text-3xl text-slate-600">{stats.todo}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Doing</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats.doing}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Review</CardDescription>
                            <CardTitle className="text-3xl text-amber-600">{stats.review}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Done</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.done}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* View Content */}
                {view === 'kanban' ? (
                    <KanbanBoard
                        tasks={tasks}
                        teamMembers={teamMembers || []}
                        currentUserId={user.id}
                        userRole={profile?.role}
                    />
                ) : (
                    <TaskList
                        tasks={tasks}
                        teamMembers={teamMembers || []}
                        currentUserId={user.id}
                        userRole={profile?.role}
                    />
                )}
            </main>
        </div>
    )
}

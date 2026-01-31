import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamMemberList } from './components/team-member-list'
import { Users } from 'lucide-react'

export default async function TeamPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Check if admin
    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Get all team members
    const { data: teamMembers } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-1 items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Team Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Quản lý thành viên và phân quyền
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-base">Tổng thành viên</CardTitle>
                            <CardDescription>Số lượng thành viên trong team</CardDescription>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamMembers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {teamMembers?.filter(m => m.role === 'admin').length || 0} admin, {teamMembers?.filter(m => m.role === 'member').length || 0} members
                        </p>
                    </CardContent>
                </Card>

                {/* Team Member List */}
                <TeamMemberList teamMembers={teamMembers || []} currentUserId={user.id} />
            </main>
        </div>
    )
}

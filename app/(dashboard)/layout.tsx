import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardShell } from '@/components/layout/dashboard-shell'



export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

    return (
        <SidebarProvider>
            <AppSidebar user={user} profile={profile} />
            <SidebarInset className="min-w-0 overflow-hidden">
                <DashboardShell>
                    <div className="pb-16 md:pb-0 min-w-0">
                        {children}
                    </div>
                </DashboardShell>
            </SidebarInset>
        </SidebarProvider>
    )
}

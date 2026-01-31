import { getContentItems, getCampaigns } from '@/lib/modules/calendar/queries'
import { CalendarView } from './components/calendar-view'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Suspense } from 'react'

export default async function CalendarPage() {
    const supabase = await createClient()

    // Fetch data
    const contentItems = await getContentItems()
    const campaigns = await getCampaigns()

    // Fetch members for assignment
    const { data: members } = await supabase
        .from('profiles')
        .select('id, full_name, email, position, role')

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <h1 className="text-lg font-semibold">Content Calendar</h1>
                        <p className="text-sm text-muted-foreground">
                            Lập kế hoạch và quản lý nội dung
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden">
                <Suspense fallback={<div>Loading calendar...</div>}>
                    <CalendarView
                        items={contentItems}
                        campaigns={campaigns}
                        members={members || []}
                        userRole={profile?.role}
                    />
                </Suspense>
            </main>
        </div>
    )
}

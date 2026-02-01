import { getContentItems, getCampaigns } from '@/lib/modules/calendar/queries'
import { CalendarView } from './components/calendar-view'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Suspense } from 'react'

import { MonthPicker } from '@/components/shared/month-picker'

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const supabase = await createClient()

    // Parse date filter
    const params = await searchParams
    const monthParam = params.month
    const initialDate = monthParam ? new Date(`${monthParam}-01`) : undefined

    let start: Date | undefined
    let end: Date | undefined

    if (initialDate) {
        const year = initialDate.getFullYear()
        const month = initialDate.getMonth()
        // Get full month range
        start = new Date(Date.UTC(year, month, 1, 0, 0, 0))
        end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
    }

    // Fetch data
    const contentItems = await getContentItems(start, end)
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
                    <div className="flex items-center gap-2">
                        <MonthPicker />
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
                        initialDate={initialDate}
                    />
                </Suspense>
            </main>
        </div>
    )
}

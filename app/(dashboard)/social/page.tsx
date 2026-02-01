import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/app/(dashboard)/calendar/components/calendar-view'
import { SocialOverview } from './components/social-overview'
import { ContentItem } from '@/lib/modules/calendar/types'
import { Share2 } from 'lucide-react'

import { MonthPicker } from '@/components/shared/month-picker'

export default async function SocialDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const supabase = await createClient()

    // Await params
    const params = await searchParams
    const monthParam = params.month
    const initialDate = monthParam ? new Date(`${monthParam}-01`) : undefined

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get user profile for role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    // Fetch campaigns for filter/dropdowns
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name')
        .neq('status', 'trash')
        .order('created_at', { ascending: false })

    // Fetch team members
    const { data: members } = await supabase
        .from('profiles')
        .select('id, full_name')

    // Fetch ONLY Social/Organic content (exclude ad_creative)
    let query = supabase
        .from('content_items')
        .select('*')
        .neq('type', 'ad_creative')

    if (initialDate) {
        const year = initialDate.getFullYear()
        const month = initialDate.getMonth()
        const start = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
        const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

        query = query.gte('scheduled_date', start).lte('scheduled_date', end)
    }

    const { data: items } = await query.order('scheduled_date', { ascending: true })

    const socialItems = items as ContentItem[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Share2 className="h-8 w-8" />
                    Social Media Dashboard
                </h2>

                <div className="flex items-center gap-2">
                    <MonthPicker />
                </div>
            </div>

            <SocialOverview items={socialItems} />

            <div className="h-full">
                <CalendarView
                    items={socialItems}
                    campaigns={campaigns || []}
                    members={members || []}
                    userRole={profile?.role}

                    showTabs={false}
                    initialDate={initialDate}
                />
            </div>
        </div>
    )
}

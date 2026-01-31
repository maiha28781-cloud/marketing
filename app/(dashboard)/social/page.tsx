import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/app/(dashboard)/calendar/components/calendar-view'
import { SocialOverview } from './components/social-overview'
import { ContentItem } from '@/lib/modules/calendar/types'
import { Share2 } from 'lucide-react'

export default async function SocialDashboardPage() {
    const supabase = await createClient()

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
    const { data: items } = await supabase
        .from('content_items')
        .select('*')
        .neq('type', 'ad_creative')
        .order('scheduled_date', { ascending: true })

    const socialItems = items as ContentItem[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Share2 className="h-8 w-8" />
                    Social Media Dashboard
                </h2>
            </div>

            <SocialOverview items={socialItems} />

            <div className="h-full">
                <CalendarView
                    items={socialItems}
                    campaigns={campaigns || []}
                    members={members || []}
                    userRole={profile?.role}
                    showTabs={false}
                />
            </div>
        </div>
    )
}

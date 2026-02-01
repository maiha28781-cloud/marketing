import { createClient } from '@/lib/supabase/server'
import { PayrollTable } from './components/payroll-table'
import { BadgeDollarSign } from 'lucide-react'
import { getActiveKPIs } from '@/lib/modules/kpis/queries'

export const dynamic = 'force-dynamic'

export default async function PayrollPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get user profile for role check
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    const isAdmin = currentUserProfile?.role === 'admin'

    // Fetch members based on role
    let membersQuery = supabase.from('profiles').select('*').order('full_name')

    if (!isAdmin) {
        // If not admin, only fetch self
        membersQuery = membersQuery.eq('id', user?.id)
    }

    const { data: members } = await membersQuery

    // Fetch active KPIs with auto-calculated values
    const activeKPIs = await getActiveKPIs()

    // Fetch content items for THIS MONTH to calculate bonus
    // We fetch ALL content items for simplicity, and filter in JS or could filter DB side. 
    // Ideally we want content items where assignee is in the members list.
    // For now, let's fetch all published content this month.

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: contentItems } = await supabase
        .from('content_items')
        .select('type, status, assignee_id')
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth)
        .in('status', ['published', 'completed'])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BadgeDollarSign className="h-8 w-8" />
                    Estimated Payroll
                </h2>
                <div className="text-sm text-muted-foreground">
                    Month: {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            <PayrollTable
                members={members || []}
                contentItems={contentItems || []}
                activeKPIs={activeKPIs || []}
                currentUserRole={currentUserProfile?.role}
            />
        </div>
    )
}

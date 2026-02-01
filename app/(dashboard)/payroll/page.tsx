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

    // Fix Timezone: Always use Vietnam time for month calculation
    const now = new Date()

    // Get current month/year in VN time
    const vnDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }) // "2/1/2026, 11:30:00 AM"
    const vnDate = new Date(vnDateString)
    const year = vnDate.getFullYear()
    const month = vnDate.getMonth() // 0-indexed

    // Calculate start/end of month in UTC but aligned with VN day boundaries
    // We want content that falls within Feb 1 00:00 VN to Feb 28 23:59 VN
    // Start: YYYY-MM-01T00:00:00+07:00 -> ISO
    const startOfMonth = new Date(Date.UTC(year, month, 1, -7, 0, 0)).toISOString()

    // End: YYYY-MM-NextMonth-00T23:59:59+07:00 -> ISO
    // trick: using day 0 of next month gives last day of current month
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 16, 59, 59, 999)).toISOString()

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

            {/* DEBUG SECTION - Remove after fixing */}
            <div className="mt-8 p-4 bg-slate-100 rounded-lg text-xs font-mono border border-slate-300 overflow-auto max-h-96">
                <h3 className="font-bold text-red-600 mb-2">🚧 DEBUG INFO (Server Data)</h3>
                <p><strong>Server Time:</strong> {now.toString()}</p>
                <p><strong>Query Range:</strong> {startOfMonth} to {endOfMonth}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <strong>Found Content Items ({contentItems?.length || 0}):</strong>
                        <pre>{JSON.stringify(contentItems, null, 2)}</pre>
                    </div>
                    <div>
                        <strong>Member Rates (First 2):</strong>
                        <pre>{JSON.stringify(members?.slice(0, 2).map(m => ({ name: m.full_name, rates: m.content_rates })), null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

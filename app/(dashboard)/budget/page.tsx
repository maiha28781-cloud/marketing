import { getBudgetOverview } from '@/lib/modules/budget/queries'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { DollarSign } from 'lucide-react'
import { BudgetOverviewStats } from './components/budget-overview'
import { CampaignBudgetList } from './components/campaign-budget-list'
import { CreateCampaignDialog } from './components/create-campaign-dialog'

export default async function BudgetPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user profile for admin check
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    const isAdmin = profile?.role === 'admin'
    const budgetData = await getBudgetOverview()

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <h1 className="text-lg font-semibold">Budget Management</h1>
                            <p className="text-sm text-muted-foreground">
                                Theo dõi ngân sách và chi phí chiến dịch
                            </p>
                        </div>
                    </div>
                </div>
                {isAdmin && <CreateCampaignDialog />}
            </header>

            <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                <BudgetOverviewStats data={budgetData} />

                <div className="grid gap-6 md:grid-cols-1">
                    <CampaignBudgetList
                        campaigns={budgetData.campaigns}
                        isAdmin={isAdmin}
                    />
                </div>
            </main>
        </div>
    )
}

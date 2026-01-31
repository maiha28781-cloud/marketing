'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const EXECUTIVE_PASSWORD = process.env.EXECUTIVE_PASSWORD
// Cookie expires in 30 days
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function verifyExecutivePassword(formData: FormData) {
    const password = formData.get('password') as string

    if (password !== EXECUTIVE_PASSWORD) {
        return { error: 'Mật khẩu không đúng' }
    }

    const cookieStore = await cookies()
    cookieStore.set('executive_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    })

    redirect('/executive-view')
}

// Admin client to bypass RLS for public view
// Using vanilla createClient for Service Role to ensure no cookie interference
async function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.error('❌ CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in env vars!')
        throw new Error('Server Configuration Error: Missing Service Role Key')
    }

    console.log('✅ Admin Client initialized with Service Role Key')

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function getExecutiveData() {
    const supabase = await createAdminClient()

    // 1. Fetch Campaigns & Budget
    // Note: fetching all campaigns for now to debug
    const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, budget_total, status')
        .in('status', ['active', 'paused', 'completed'])

    // Debug log
    if (campaignsError) {
        console.error('❌ Error fetching campaigns:', campaignsError)
    } else {
        console.log('✅ Executive View - Campaigns found:', campaigns?.length)
    }

    const { data: expenseItems } = await supabase
        .from('content_items')
        .select('actual_cost, campaign_id')
        .gt('actual_cost', 0)

    let totalBudget = 0
    let totalSpent = 0
    const campaignSpending: Record<string, number> = {}

    if (campaigns) {
        // Force number type conversion just in case
        totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget_total) || 0), 0)

        // Init spending map
        campaigns.forEach(c => campaignSpending[c.id] = 0)
    }

    if (expenseItems) {
        totalSpent = expenseItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0)

        expenseItems.forEach(item => {
            if (item.campaign_id && campaignSpending[item.campaign_id] !== undefined) {
                campaignSpending[item.campaign_id] += (item.actual_cost || 0)
            }
        })
    }

    const remaining = totalBudget - totalSpent

    // 2. Fetch Tasks Stats (Detailed)
    const { data: tasks } = await supabase
        .from('tasks')
        .select('status')

    const taskStats = {
        total: tasks?.length || 0,
        todo: tasks?.filter(t => t.status === 'todo').length || 0,
        doing: tasks?.filter(t => t.status === 'doing').length || 0,
        review: tasks?.filter(t => t.status === 'review').length || 0,
        done: tasks?.filter(t => t.status === 'done').length || 0,
    }

    // 3. Fetch KPI Stats (Detailed)
    // Fetch top 5 KPIs
    const { data: kpis } = await supabase
        .from('kpis')
        .select('name, current_value, target_value, unit')
        .limit(5)

    let avgKpi = 0
    let kpiDetails: any[] = []

    if (kpis && kpis.length > 0) {
        let totalPercent = 0
        kpiDetails = kpis.map(k => {
            const progress = k.target_value > 0 ? Math.round((k.current_value / k.target_value) * 100) : 0
            totalPercent += Math.min(progress, 100)
            return {
                ...k,
                progress
            }
        })
        avgKpi = Math.round(totalPercent / kpis.length)
    }

    // 4. Fetch Top Spending Items (For "Check Budget")
    // Get top 5 most expensive items
    const { data: topSpending } = await supabase
        .from('content_items')
        .select('title, actual_cost, platform, campaign_id')
        .gt('actual_cost', 0)
        .order('actual_cost', { ascending: false })
        .limit(5)

    // Map campaign names to spending items if possible
    const spendingWithCampaignName = topSpending?.map(item => {
        const campaign = campaigns?.find(c => c.id === item.campaign_id)
        return {
            ...item,
            campaign_name: campaign?.name || 'Unknown'
        }
    }) || []


    // Prepare detailed campaign data
    const campaignDetails = campaigns?.map(c => {
        const budget = Number(c.budget_total) || 0
        const spent = campaignSpending[c.id] || 0
        const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0

        return {
            id: c.id,
            name: c.name,
            status: c.status,
            budget,
            spent,
            remaining: budget - spent,
            percent
        }
    }) || []

    return {
        budget: {
            total: totalBudget,
            spent: totalSpent,
            remaining: remaining,
            campaigns: campaignDetails,
            topSpending: spendingWithCampaignName, // New detailed spending
        },
        kpis: {
            avgAchievement: avgKpi,
            totalKpis: kpis?.length || 0,
            details: kpiDetails, // New detailed list
        },
        tasks: {
            ...taskStats, // Expanded stats
            rate: taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0
        }
    }
}

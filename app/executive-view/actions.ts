'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { calculateKPIProgress } from '@/lib/modules/kpis/queries'

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

export async function getExecutiveData(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

    // 1. Fetch Campaigns & Budget
    // Note: fetching all campaigns to match Budget View
    const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, budget_total, status')
        .neq('status', 'trash')

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
        .eq('type', 'ad_creative') // Only include Ad Creative items in budget logic
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth)

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
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)

    const taskStats = {
        total: tasks?.length || 0,
        todo: tasks?.filter(t => t.status === 'todo').length || 0,
        doing: tasks?.filter(t => t.status === 'doing').length || 0,
        review: tasks?.filter(t => t.status === 'review').length || 0,
        done: tasks?.filter(t => t.status === 'done').length || 0,
    }





    // 3. Fetch KPI Stats (Detailed)
    // Fetch top 5 KPIs
    const { data: rawKpis } = await supabase
        .from('kpis')
        .select('*') // Need all fields for calculation
        .lte('start_date', targetDate.toISOString().split('T')[0])
        .gte('end_date', targetDate.toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(5)

    // Calculate live progress
    // @ts-ignore
    const kpis = rawKpis ? await calculateKPIProgress(supabase, rawKpis, targetDate) : []

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

    // 4. Fetch Recent Tasks (Job, Deadline, Assignee)
    const { data: recentTasks } = await supabase
        .from('tasks')
        .select(`
            id, title, status, due_date,
            profiles!assigned_to (full_name, position)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    // Map tasks to include flattened assignee info
    const detailedTasks = recentTasks?.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        assignee_name: t.profiles?.full_name || 'Unassigned',
        assignee_position: t.profiles?.position || ''
    })) || []


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

    const totalOverBudget = campaignDetails.reduce((sum, c) => {
        return c.remaining < 0 ? sum + Math.abs(c.remaining) : sum
    }, 0)

    return {
        budget: {
            total: totalBudget,
            spent: totalSpent,
            remaining: remaining,
            overBudget: totalOverBudget,
            campaigns: campaignDetails,
        },
        kpis: {
            avgAchievement: avgKpi,
            totalKpis: kpis?.length || 0,
            details: kpiDetails, // New detailed list
        },
        tasks: {
            ...taskStats, // Expanded stats
            rate: taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0,
            recent: detailedTasks // New detailed task list
        }
    }
}

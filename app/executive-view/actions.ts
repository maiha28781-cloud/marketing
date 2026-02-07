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

    // Return success so client can navigate
    return { success: true }
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

export async function getAllTasksForExecutive(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

    // Fetch ALL tasks for the month
    const { data: allTasks } = await supabase
        .from('tasks')
        .select(`
            id, title, status, due_date, priority,
            profiles!assigned_to (full_name, position)
        `)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .order('created_at', { ascending: false })

    const detailedTasks = allTasks?.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        priority: t.priority,
        assignee_name: t.profiles?.full_name || 'Unassigned',
        assignee_position: t.profiles?.position || ''
    })) || []

    return detailedTasks
}

// ======= NEW ANALYTICS FUNCTIONS =======

export async function getTeamPerformance(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

    // Get members who have KPIs in this period
    const { data: kpisInPeriod } = await supabase
        .from('kpis')
        .select('user_id, profiles!user_id (id, full_name, position)')
        .lte('start_date', targetDate.toISOString().split('T')[0])
        .gte('end_date', targetDate.toISOString().split('T')[0])

    if (!kpisInPeriod || kpisInPeriod.length === 0) return []

    // Get unique members
    const uniqueMembersMap = new Map()
    kpisInPeriod.forEach((kpi: any) => {
        if (kpi.profiles && kpi.profiles.id) {
            uniqueMembersMap.set(kpi.profiles.id, kpi.profiles)
        }
    })
    const members = Array.from(uniqueMembersMap.values())

    if (!members || members.length === 0) return []

    // For each member, calculate their task stats
    const memberStats = await Promise.all(members.map(async (member: any) => {
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('assigned_to', member.id)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth)

        const total = tasks?.length || 0
        const completed = tasks?.filter(t => t.status === 'done').length || 0
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        // Get KPIs owned by this member (with all fields for live calculation)
        const { data: rawKpis } = await supabase
            .from('kpis')
            .select('*') // Need all fields for calculateKPIProgress
            .eq('user_id', member.id)
            .lte('start_date', targetDate.toISOString().split('T')[0])
            .gte('end_date', targetDate.toISOString().split('T')[0])

        let avgKpi = 0
        let primaryKpi: any = null

        if (rawKpis && rawKpis.length > 0) {
            // Calculate live progress using the same function as KPI page
            // @ts-ignore
            const calculatedKpis = await calculateKPIProgress(supabase, rawKpis, targetDate)

            // Find primary KPI (auto-tracked one, or first one)
            primaryKpi = calculatedKpis.find(k => k.auto_track) || calculatedKpis[0]

            const totalProgress = calculatedKpis.reduce((sum, k) => {
                const progress = k.target_value > 0 ? (k.current_value / k.target_value) * 100 : 0
                return sum + Math.min(progress, 100)
            }, 0)
            avgKpi = Math.round(totalProgress / calculatedKpis.length)
        }

        // Calculate final completion rate (use KPI if available, otherwise task completion)
        const finalCompletionRate = primaryKpi && primaryKpi.target_value > 0
            ? Math.round((primaryKpi.current_value / primaryKpi.target_value) * 100)
            : completionRate

        return {
            id: member.id,
            name: member.full_name,
            position: member.position,
            tasksTotal: primaryKpi ? primaryKpi.target_value : total,
            tasksCompleted: primaryKpi ? primaryKpi.current_value : completed,
            kpiUnit: primaryKpi ? (primaryKpi.unit || 'items') : 'task',
            completionRate: finalCompletionRate,
            kpiAchievement: avgKpi,
            performance: (finalCompletionRate >= 80 ? 'excellent' : finalCompletionRate >= 50 ? 'good' : 'needs_support') as 'excellent' | 'good' | 'needs_support'
        }
    }))

    return memberStats
}

export async function getTrendAnalysis(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()

    // Current month
    const currentYear = targetDate.getFullYear()
    const currentMonth = targetDate.getMonth()
    const currentStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0)).toISOString()
    const currentEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)).toISOString()

    // Previous month
    const prevDate = new Date(targetDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevYear = prevDate.getFullYear()
    const prevMonth = prevDate.getMonth()
    const prevStart = new Date(Date.UTC(prevYear, prevMonth, 1, 0, 0, 0)).toISOString()
    const prevEnd = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999)).toISOString()

    // Current month budget
    const { data: currentExpenses } = await supabase
        .from('content_items')
        .select('actual_cost')
        .gt('actual_cost', 0)
        .eq('type', 'ad_creative')
        .gte('scheduled_date', currentStart)
        .lte('scheduled_date', currentEnd)

    const currentSpent = currentExpenses?.reduce((sum, e) => sum + (e.actual_cost || 0), 0) || 0

    // Previous month budget
    const { data: prevExpenses } = await supabase
        .from('content_items')
        .select('actual_cost')
        .gt('actual_cost', 0)
        .eq('type', 'ad_creative')
        .gte('scheduled_date', prevStart)
        .lte('scheduled_date', prevEnd)

    const prevSpent = prevExpenses?.reduce((sum, e) => sum + (e.actual_cost || 0), 0) || 0

    // Current month tasks
    const { data: currentTasks } = await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', currentStart)
        .lte('created_at', currentEnd)

    const currentTotal = currentTasks?.length || 0
    const currentDone = currentTasks?.filter(t => t.status === 'done').length || 0
    const currentTaskRate = currentTotal > 0 ? Math.round((currentDone / currentTotal) * 100) : 0

    // Previous month tasks
    const { data: prevTasks } = await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd)

    const prevTotal = prevTasks?.length || 0
    const prevDone = prevTasks?.filter(t => t.status === 'done').length || 0
    const prevTaskRate = prevTotal > 0 ? Math.round((prevDone / prevTotal) * 100) : 0

    // Current KPIs
    const { data: currentKpis } = await supabase
        .from('kpis')
        .select('current_value, target_value')
        .lte('start_date', targetDate.toISOString().split('T')[0])
        .gte('end_date', targetDate.toISOString().split('T')[0])

    let currentKpiAvg = 0
    if (currentKpis && currentKpis.length > 0) {
        const total = currentKpis.reduce((sum, k) => {
            const progress = k.target_value > 0 ? (k.current_value / k.target_value) * 100 : 0
            return sum + Math.min(progress, 100)
        }, 0)
        currentKpiAvg = Math.round(total / currentKpis.length)
    }

    // Previous KPIs
    const { data: prevKpis } = await supabase
        .from('kpis')
        .select('current_value, target_value')
        .lte('start_date', prevDate.toISOString().split('T')[0])
        .gte('end_date', prevDate.toISOString().split('T')[0])

    let prevKpiAvg = 0
    if (prevKpis && prevKpis.length > 0) {
        const total = prevKpis.reduce((sum, k) => {
            const progress = k.target_value > 0 ? (k.current_value / k.target_value) * 100 : 0
            return sum + Math.min(progress, 100)
        }, 0)
        prevKpiAvg = Math.round(total / prevKpis.length)
    }

    return {
        budget: {
            current: currentSpent,
            previous: prevSpent,
            change: currentSpent - prevSpent,
            changePercent: prevSpent > 0 ? Math.round(((currentSpent - prevSpent) / prevSpent) * 100) : 0
        },
        taskCompletion: {
            current: currentTaskRate,
            previous: prevTaskRate,
            change: currentTaskRate - prevTaskRate
        },
        kpiAchievement: {
            current: currentKpiAvg,
            previous: prevKpiAvg,
            change: currentKpiAvg - prevKpiAvg
        }
    }
}

export async function getRiskAlerts(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

    const risks: any[] = []

    // 1. Campaigns near budget limit (>90%)
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name, budget_total')
        .neq('status', 'trash')

    if (campaigns) {
        const { data: expenses } = await supabase
            .from('content_items')
            .select('actual_cost, campaign_id')
            .gt('actual_cost', 0)
            .eq('type', 'ad_creative')
            .gte('scheduled_date', startOfMonth)
            .lte('scheduled_date', endOfMonth)

        const campaignSpending: Record<string, number> = {}
        expenses?.forEach(e => {
            if (e.campaign_id) {
                campaignSpending[e.campaign_id] = (campaignSpending[e.campaign_id] || 0) + e.actual_cost
            }
        })

        campaigns.forEach(c => {
            const spent = campaignSpending[c.id] || 0
            const budget = Number(c.budget_total) || 0
            const percent = budget > 0 ? (spent / budget) * 100 : 0

            if (percent > 90) {
                risks.push({
                    type: 'budget',
                    severity: percent > 100 ? 'critical' : 'warning',
                    message: `Chiến dịch "${c.name}" đã dùng ${Math.round(percent)}% ngân sách`,
                    details: { campaignName: c.name, percent: Math.round(percent) }
                })
            }
        })
    }

    // 2. Overdue tasks
    const now = new Date().toISOString()
    const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, profiles!assigned_to (full_name)')
        .lt('due_date', now)
        .neq('status', 'done')
        .limit(10)

    overdueTasks?.forEach((t: any) => {
        risks.push({
            type: 'task',
            severity: 'warning',
            message: `Task "${t.title}" đã quá hạn (${t.profiles?.full_name || 'Unassigned'})`,
            details: { taskTitle: t.title, assignee: t.profiles?.full_name }
        })
    })

    // 3. At-risk KPIs (<50% progress when >70% time elapsed)
    const { data: kpis } = await supabase
        .from('kpis')
        .select('id, name, current_value, target_value, start_date, end_date')
        .lte('start_date', targetDate.toISOString().split('T')[0])
        .gte('end_date', targetDate.toISOString().split('T')[0])

    kpis?.forEach(k => {
        const progress = k.target_value > 0 ? (k.current_value / k.target_value) * 100 : 0
        const startTime = new Date(k.start_date).getTime()
        const endTime = new Date(k.end_date).getTime()
        const currentTime = targetDate.getTime()
        const timeElapsed = ((currentTime - startTime) / (endTime - startTime)) * 100

        if (timeElapsed > 70 && progress < 50) {
            risks.push({
                type: 'kpi',
                severity: 'warning',
                message: `KPI "${k.name}" có nguy cơ fail (${Math.round(progress)}% sau ${Math.round(timeElapsed)}% thời gian)`,
                details: { kpiName: k.name, progress: Math.round(progress), timeElapsed: Math.round(timeElapsed) }
            })
        }
    })

    return risks
}

export async function getContentPerformance(date?: Date) {
    const supabase = await createAdminClient()

    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString()
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString()

    // Count by status
    const { data: allContent } = await supabase
        .from('content_items')
        .select('id, status, platform')
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth)

    const byStatus = {
        published: allContent?.filter(c => c.status === 'published').length || 0,
        draft: allContent?.filter(c => c.status === 'draft').length || 0,
        review: allContent?.filter(c => c.status === 'review').length || 0
    }

    // Count by platform
    const platformCounts: Record<string, number> = {}
    allContent?.forEach(c => {
        if (c.platform) {
            platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1
        }
    })

    const byPlatform = Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count
    }))

    // Recent published
    const { data: recentPublished } = await supabase
        .from('content_items')
        .select('id, title, platform, scheduled_date')
        .eq('status', 'published')
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth)
        .order('scheduled_date', { ascending: false })
        .limit(10)

    return {
        byStatus,
        byPlatform,
        recentPublished: recentPublished || [],
        total: allContent?.length || 0
    }
}

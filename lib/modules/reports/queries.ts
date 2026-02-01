'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format } from 'date-fns'
import { vi } from 'date-fns/locale'

export interface ReportPeriod {
    start: Date
    end: Date
    label: string
}

export interface TaskReport {
    total: number
    completed: number
    in_progress: number
    completion_rate: number
    by_status: {
        todo: number
        doing: number
        review: number
        done: number
    }
    by_priority: {
        low: number
        medium: number
        high: number
        urgent: number
    }
    recent_tasks: {
        id: string
        title: string
        status: string
        due_date: string | null
        assignee_name: string
        assignee_position: string
    }[]
}

export interface KPIReport {
    total: number
    completed: number
    on_track: number
    at_risk: number
    behind: number
    avg_completion: number
    by_user: {
        user_id: string
        user_name: string
        total_kpis: number
        avg_completion: number
    }[]
}

export interface BudgetReport {
    total_campaigns: number
    active_campaigns: number
    total_budget: number
    estimated_cost: number
    actual_cost: number
    campaigns: {
        id: string
        name: string
        status: string
        budget: number
        spent: number
    }[]
}

export interface WeeklyReport {
    period: ReportPeriod
    tasks: TaskReport
    kpis: KPIReport
    budget: BudgetReport
}

export interface MonthlyReport {
    period: ReportPeriod
    tasks: TaskReport
    kpis: KPIReport
    budget: BudgetReport
    weekly_breakdown: {
        week: string
        tasks_completed: number
        kpis_avg: number
    }[]
}

/**
 * Get current week period
 */
export async function getCurrentWeekPeriod(): Promise<ReportPeriod> {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 })

    return {
        start,
        end,
        label: `${format(start, 'dd/MM', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`
    }
}

/**
 * Get current month period
 */
export async function getCurrentMonthPeriod(referenceDate?: Date): Promise<ReportPeriod> {
    const now = referenceDate || new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    return {
        start,
        end,
        label: format(start, 'MMMM yyyy', { locale: vi })
    }
}

// ... (in getTaskReport function) ...

export async function getTaskReport(start: Date, end: Date): Promise<TaskReport> {
    const supabase = await createClient()

    // 1. Fetch counts (existing logic)
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())

    // 2. Fetch detailed recent tasks for the table (limit 10 for report)
    const { data: recentTasksData } = await supabase
        .from('tasks')
        .select(`
            id, title, status, due_date,
            profiles!assigned_to (full_name, position)
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(3)

    const recent_tasks = recentTasksData?.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        assignee_name: t.profiles?.full_name || 'Unassigned',
        assignee_position: t.profiles?.position || ''
    })) || []

    if (!tasks) {
        return {
            total: 0,
            completed: 0,
            in_progress: 0,
            completion_rate: 0,
            by_status: { todo: 0, doing: 0, review: 0, done: 0 },
            by_priority: { low: 0, medium: 0, high: 0, urgent: 0 },
            recent_tasks: []
        }
    }

    const completed = tasks.filter(t => t.status === 'done').length
    const in_progress = tasks.filter(t => ['doing', 'review'].includes(t.status)).length

    const by_status = {
        todo: tasks.filter(t => t.status === 'todo').length,
        doing: tasks.filter(t => t.status === 'doing').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
    }

    const by_priority = {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length,
    }

    return {
        total: tasks.length,
        completed,
        in_progress,
        completion_rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        by_status,
        by_priority,
        recent_tasks
    }
}

/**
 * Get KPI report for a period
 */
export async function getKPIReport(start: Date, end: Date): Promise<KPIReport> {
    const supabase = await createClient()

    const { data: kpis } = await supabase
        .from('kpis')
        .select(`
      *,
      user:profiles!kpis_user_id_fkey (
        id,
        full_name
      )
    `)
        .lte('start_date', end.toISOString().split('T')[0])
        .gte('end_date', start.toISOString().split('T')[0])

    if (!kpis || kpis.length === 0) {
        return {
            total: 0,
            completed: 0,
            on_track: 0,
            at_risk: 0,
            behind: 0,
            avg_completion: 0,
            by_user: []
        }
    }

    let completed = 0
    let on_track = 0
    let at_risk = 0
    let behind = 0
    let total_percentage = 0

    const userMap = new Map<string, { total: number; sum_percentage: number; name: string }>()

    kpis.forEach(kpi => {
        const percentage = kpi.target_value > 0
            ? (kpi.current_value / kpi.target_value) * 100
            : 0

        total_percentage += percentage

        if (percentage >= 100) completed++
        else if (percentage >= 80) on_track++
        else if (percentage >= 50) at_risk++
        else behind++

        // Group by user
        if (kpi.user) {
            const userId = kpi.user.id
            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    total: 0,
                    sum_percentage: 0,
                    name: kpi.user.full_name
                })
            }
            const userStats = userMap.get(userId)!
            userStats.total++
            userStats.sum_percentage += percentage
        }
    })

    const by_user = Array.from(userMap.entries()).map(([userId, stats]) => ({
        user_id: userId,
        user_name: stats.name,
        total_kpis: stats.total,
        avg_completion: Math.round(stats.sum_percentage / stats.total)
    }))

    return {
        total: kpis.length,
        completed,
        on_track,
        at_risk,
        behind,
        avg_completion: kpis.length > 0 ? Math.round(total_percentage / kpis.length) : 0,
        by_user
    }
}

export interface BudgetReport {
    total_campaigns: number
    active_campaigns: number
    total_budget: number
    estimated_cost: number
    actual_cost: number
    campaigns: {
        id: string
        name: string
        status: string
        budget: number
        spent: number
    }[]
}

export interface WeeklyReport {
    period: ReportPeriod
    tasks: TaskReport
    kpis: KPIReport
    budget: BudgetReport
}

export interface MonthlyReport {
    period: ReportPeriod
    tasks: TaskReport
    kpis: KPIReport
    budget: BudgetReport
    weekly_breakdown: {
        week: string
        tasks_completed: number
        kpis_avg: number
    }[]
}

/**
 * Get Budget/Campaign report for a period
 */
export async function getBudgetReport(start: Date, end: Date): Promise<BudgetReport> {
    const supabase = await createClient()

    // 1. Get active campaigns in this period
    // Overlap logic: campaign_start <= period_end AND campaign_end >= period_start
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name, status, budget_total')
        .lte('start_date', end.toISOString())
        .gte('end_date', start.toISOString())

    if (!campaigns || campaigns.length === 0) {
        return {
            total_campaigns: 0,
            active_campaigns: 0,
            total_budget: 0,
            estimated_cost: 0,
            actual_cost: 0,
            campaigns: []
        }
    }

    // 2. Get content items costs for these campaigns in this period
    const campaignIds = campaigns.map(c => c.id)
    const { data: items } = await supabase
        .from('content_items')
        .select('campaign_id, estimated_cost, actual_cost')
        .in('campaign_id', campaignIds)
        // Optionally filter items scheduled in this period? 
        // For now, let's take ALL items for the active campaigns to show total campaign progress
        // Or strictly items in this period? 
        // Let's go with items scheduled in this period for "Monthly Report" accuracy
        .gte('scheduled_date', start.toISOString())
        .lte('scheduled_date', end.toISOString())

    const campaignStats = new Map<string, { estimated: number; actual: number }>()

    let total_estimated = 0
    let total_actual = 0

    items?.forEach(item => {
        if (!item.campaign_id) return

        const current = campaignStats.get(item.campaign_id) || { estimated: 0, actual: 0 }
        current.estimated += Number(item.estimated_cost || 0)
        current.actual += Number(item.actual_cost || 0)
        campaignStats.set(item.campaign_id, current)

        total_estimated += Number(item.estimated_cost || 0)
        total_actual += Number(item.actual_cost || 0)
    })

    const detailedCampaigns = campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        budget: Number(c.budget_total || 0),
        spent: campaignStats.get(c.id)?.actual || 0
    }))

    return {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_budget: campaigns.reduce((sum, c) => sum + Number(c.budget_total || 0), 0),
        estimated_cost: total_estimated,
        actual_cost: total_actual,
        campaigns: detailedCampaigns
    }
}

/**
 * Get weekly report
 */
export async function getWeeklyReport(): Promise<WeeklyReport> {
    const period = await getCurrentWeekPeriod()
    const tasks = await getTaskReport(period.start, period.end)
    const kpis = await getKPIReport(period.start, period.end)
    const budget = await getBudgetReport(period.start, period.end)

    return { period, tasks, kpis, budget }
}

/**
 * Get monthly report
 */
export async function getMonthlyReport(referenceDate?: Date): Promise<MonthlyReport> {
    const period = await getCurrentMonthPeriod(referenceDate)
    const tasks = await getTaskReport(period.start, period.end)
    const kpis = await getKPIReport(period.start, period.end)
    const budget = await getBudgetReport(period.start, period.end)

    // Get weekly breakdown for the month
    const weeks: { week: string; tasks_completed: number; kpis_avg: number }[] = []
    let weekStart = startOfWeek(period.start, { weekStartsOn: 1 })

    while (weekStart <= period.end) {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        const weekTasks = await getTaskReport(weekStart, weekEnd < period.end ? weekEnd : period.end)
        const weekKPIs = await getKPIReport(weekStart, weekEnd < period.end ? weekEnd : period.end)

        weeks.push({
            week: `${format(weekStart, 'dd/MM', { locale: vi })} - ${format(weekEnd, 'dd/MM', { locale: vi })}`,
            tasks_completed: weekTasks.completed,
            kpis_avg: weekKPIs.avg_completion
        })

        weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    return { period, tasks, kpis, budget, weekly_breakdown: weeks }
}

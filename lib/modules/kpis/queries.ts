'use server'

import { createClient } from '@/lib/supabase/server'
import type { KPI, KPIStats, KPISummary } from './types'

/**
 * Get all KPIs with user info
 * Admins see all, members see only their own
 */
export async function getKPIs(): Promise<KPI[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kpis')
        .select(`
      *,
      user:profiles!kpis_user_id_fkey (
        id,
        full_name,
        email,
        position
      ),
      creator:profiles!kpis_created_by_fkey (
        id,
        full_name
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching KPIs:', error)
        return []
    }

    return data || []
}

/**
 * Get KPIs for a specific user
 */
export async function getUserKPIs(userId: string): Promise<KPI[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kpis')
        .select(`
      *,
      user:profiles!kpis_user_id_fkey (
        id,
        full_name,
        email,
        position
      ),
      creator:profiles!kpis_created_by_fkey (
        id,
        full_name
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user KPIs:', error)
        return []
    }

    return data || []
}

/**
 * Get active KPIs (within current date range)
 */
/**
 * Get active KPIs (within date range relative to reference date)
 * @param referenceDate Optional date for historical view (defaults to now)
 */
export async function getActiveKPIs(referenceDate?: Date): Promise<KPI[]> {
    const supabase = await createClient()

    // Determine the reference date (VN timezone for consistency)
    let targetDateStr: string

    if (referenceDate) {
        // If specific date provided (e.g. from picker), use it
        targetDateStr = referenceDate.toISOString().split('T')[0]
    } else {
        // Default to "today" in VN time
        const vnDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
        targetDateStr = new Date(vnDate).toISOString().split('T')[0]
    }

    // Determine the month boundaries for the target date
    // We want to find active KPIs that overlap with this month
    // Logic: KPI Start <= Month End AND KPI End >= Month Start

    // For simplicity, we stick to the existing "active on this specific day" logic first
    // But for historical view, we often select the 1st of the month.
    // Let's assume if referenceParam is passed, we check if KPI is active *at any point* in that month?
    // OR just keep it simple: "Active on the selected reference date". 
    // Since MonthPicker selects the 1st of the month, let's stick to "Active on Reference Date".

    const { data, error } = await supabase
        .from('kpis')
        .select(`
      *,
      user:profiles!kpis_user_id_fkey (
        id,
        full_name,
        email,
        position
      )
    `)
        .lte('start_date', targetDateStr)
        .gte('end_date', targetDateStr)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching active KPIs:', error)
        return []
    }

    // Auto-track logic
    // Pass the reference date to calculate progress correctly for that period
    return await calculateKPIProgress(supabase, data, referenceDate)
}

/**
 * Shared function to calculate KPI progress based on tracking source
 * Used by Dashboard and Executive View to ensure consistency
 * @param referenceDate Optional date to limit the tracking window (for historical view)
 */
export async function calculateKPIProgress(supabase: any, kpis: KPI[], referenceDate?: Date): Promise<KPI[]> {
    if (!kpis || kpis.length === 0) return []

    const enrichedKPIs = await Promise.all(kpis.map(async (kpi) => {
        if (!kpi.auto_track) return kpi

        let count = 0

        // Determine effective end date for calculation
        // If referenceDate is provided (e.g. historical view), we should only count up to that month/date
        // Actually, for "Monthly View", we typically want to see what happened in that entire month.
        // But KPI has its own start/end. 
        // If we overlap, we should respect the KPI's natural end date OR the reference month's end.
        // For simplicity: We stick to the KPI's defined start/end dates. 
        // The referenceDate only determines WHICH KPIs we pick (handled in getActiveKPIs).
        // However, if we are recalculating for a past month, we might want to ensure we don't count future data?
        // But "published" content won't change its date.
        // So for now, standard logic is fine. KPI start/end are absolute.

        if (kpi.tracking_source === 'content') {
            // Content Tracking
            const contentType = kpi.tracking_filter?.content_type

            let query = supabase
                .from('content_items')
                .select('id', { count: 'exact', head: true })
                .eq('assignee_id', kpi.user_id)
                .in('status', ['published', 'completed'])
                .gte('scheduled_date', kpi.start_date)
                // Append time to cover the full end date
                .lte('scheduled_date', kpi.end_date + 'T23:59:59')




            // Apply content type filter if specified
            if (contentType === 'content_organic') {
                // Match blog_post, video, or social_post (organic content only, no ads)
                query = query.in('type', ['blog_post', 'video', 'social_post'])
            } else if (contentType === 'ad_creative') {
                // Match ad_creative exactly (database stores as 'ad_creative')
                query = query.eq('type', 'ad_creative')
            } else if (contentType && contentType !== 'all') {
                // Single specific type (blog_post, video, social_post)
                query = query.eq('type', contentType)
            }
            // If contentType is 'all' or undefined, don't filter - count everything



            const { count: contentCount } = await query
            count = contentCount || 0

        } else if (kpi.tracking_source === 'tasks') {
            // Task Tracking
            let query = supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('assigned_to', kpi.user_id)
                .eq('status', 'done')
                .gte('completed_at', kpi.start_date)
                .lte('completed_at', kpi.end_date + 'T23:59:59')

            const { count: taskCount } = await query
            count = taskCount || 0
        }

        // Only update display value, do NOT write back to DB
        return {
            ...kpi,
            current_value: count
        }
    }))

    return enrichedKPIs
}

/**
 * Get a single KPI by ID
 */
export async function getKPIById(id: string): Promise<KPI | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kpis')
        .select(`
      *,
      user:profiles!kpis_user_id_fkey (
        id,
        full_name,
        email,
        position
      ),
      creator:profiles!kpis_created_by_fkey (
        id,
        full_name
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching KPI:', error)
        return null
    }

    return data
}

/**
 * Get KPI statistics
 */
export async function getKPIStats(): Promise<KPIStats> {
    const kpis = await getActiveKPIs()

    const stats = kpis.reduce(
        (acc, kpi) => {
            const percentage = kpi.target_value > 0
                ? (kpi.current_value / kpi.target_value) * 100
                : 0

            acc.total++

            if (percentage >= 100) {
                acc.completed++
            } else if (percentage >= 80) {
                acc.on_track++
            } else if (percentage >= 50) {
                acc.at_risk++
            } else {
                acc.behind++
            }

            return acc
        },
        { total: 0, on_track: 0, at_risk: 0, behind: 0, completed: 0 }
    )

    return stats
}

/**
 * Get KPI summary by user
 */
export async function getKPISummaryByUser(): Promise<KPISummary[]> {
    const kpis = await getActiveKPIs()

    // Group by user
    const userMap = new Map<string, KPISummary>()

    kpis.forEach((kpi) => {
        if (!kpi.user) return

        const userId = kpi.user.id
        if (!userMap.has(userId)) {
            userMap.set(userId, {
                user_id: userId,
                user_name: kpi.user.full_name,
                position: kpi.user.position,
                total_kpis: 0,
                completed: 0,
                on_track: 0,
                at_risk: 0,
                behind: 0,
                avg_completion: 0,
            })
        }

        const summary = userMap.get(userId)!
        const percentage = kpi.target_value > 0
            ? (kpi.current_value / kpi.target_value) * 100
            : 0

        summary.total_kpis++

        if (percentage >= 100) {
            summary.completed++
        } else if (percentage >= 80) {
            summary.on_track++
        } else if (percentage >= 50) {
            summary.at_risk++
        } else {
            summary.behind++
        }
    })

    // Calculate average completion
    userMap.forEach((summary) => {
        const userKPIs = kpis.filter(k => k.user?.id === summary.user_id)
        const totalPercentage = userKPIs.reduce((sum, kpi) => {
            return sum + (kpi.target_value > 0 ? (kpi.current_value / kpi.target_value) * 100 : 0)
        }, 0)
        summary.avg_completion = userKPIs.length > 0
            ? Math.round(totalPercentage / userKPIs.length)
            : 0
    })

    return Array.from(userMap.values())
}

/**
 * Get KPI history for charts
 */
export async function getKPIHistory(kpiId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kpi_history')
        .select('*')
        .eq('kpi_id', kpiId)
        .order('recorded_at', { ascending: true })

    if (error) {
        console.error('Error fetching KPI history:', error)
        return []
    }

    return data || []
}

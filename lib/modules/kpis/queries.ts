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
export async function getActiveKPIs(): Promise<KPI[]> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

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
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching active KPIs:', error)
        return []
    }

    // Auto-track logic
    const enrichedKPIs = await Promise.all(data.map(async (kpi) => {
        if (!kpi.auto_track) return kpi

        let count = 0

        console.log('🔄 Auto-tracking KPI:', {
            id: kpi.id,
            name: kpi.name,
            auto_track: kpi.auto_track,
            tracking_source: kpi.tracking_source,
            tracking_filter: kpi.tracking_filter
        })

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
            if (contentType && contentType !== 'all') {
                // Use ilike for case-insensitive matching
                // Also handle simplified types (e.g. 'social_post' vs 'Social Post')
                if (contentType.includes('_')) {
                    // If type has underscore (e.g. social_post), try to match it or space version
                    const spaceVersion = contentType.replace(/_/g, ' ')
                    query = query.or(`type.eq.${contentType},type.ilike.${spaceVersion}`)
                } else {
                    query = query.ilike('type', contentType)
                }
            }

            const { count: contentCount, error: countError } = await query

            if (countError) {
                console.error('Error counting content for KPI:', kpi.name, countError)
            }

            count = contentCount || 0
            console.log(`Phase Debug: Content Count for ${kpi.name} (${contentType}) = ${count}`)

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

        console.log('✅ Calculated count for KPI', kpi.name, ':', count)

        // Only update display value, do NOT write back to DB (to avoid race conditions/perf). 
        // Admin calculates payroll based on this view.
        return {
            ...kpi,
            current_value: count
        }
    }))

    return enrichedKPIs || []
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

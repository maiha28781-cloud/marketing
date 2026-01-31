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

    return data || []
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

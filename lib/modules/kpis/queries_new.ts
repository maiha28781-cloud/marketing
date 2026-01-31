import { createClient } from '@/lib/supabase/server'
import { KPI, KPIStats, TrackingSource, ContentType } from './types'

/**
 * Get aggregated KPI statistics
 */
export async function getKPIStats(): Promise<KPIStats> {
    const supabase = await createClient()

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Get all active KPIs (end_date >= today)
    const { data: kpis } = await supabase
        .from('kpis')
        .select('id, target_value, current_value')
        .gte('end_date', today)
        .order('created_at', { ascending: false })

    if (!kpis) {
        return {
            total: 0,
            on_track: 0,
            at_risk: 0,
            behind: 0,
            completed: 0
        }
    }

    const total = kpis.length
    let on_track = 0
    let at_risk = 0
    let behind = 0
    let completed = 0

    kpis.forEach(kpi => {
        const percentage = (kpi.current_value / kpi.target_value) * 100

        if (percentage >= 100) {
            completed++
        } else if (percentage >= 80) {
            on_track++
        } else if (percentage >= 50) {
            at_risk++
        } else {
            behind++
        }
    })

    return {
        total,
        on_track,
        at_risk,
        behind,
        completed
    }
}

/**
 * Get active KPIs with auto-calculated values based on tracking source
 */
export async function getActiveKPIs(): Promise<KPI[]> {
    const supabase = await createClient()

    const now = new Date()
    const today = now.toISOString().split('T')[0]

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

    // Auto-track logic using new tracking_source system
    const enrichedKPIs = await Promise.all(data.map(async (kpi) => {
        if (!kpi.auto_track) return kpi

        let count = 0

        if (kpi.tracking_source === 'content') {
            // Content Tracking
            const contentType = kpi.tracking_filter?.content_type

            let query = supabase
                .from('content_items')
                .select('id', { count: 'exact', head: true })
                .eq('assignee_id', kpi.user_id)
                .in('status', ['published', 'completed'])
                .gte('scheduled_date', kpi.start_date)
                .lte('scheduled_date', kpi.end_date + 'T23:59:59')

            // Apply content type filter if specified
            if (contentType && contentType !== 'all') {
                query = query.eq('type', contentType)
            }

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

            // Future: Apply priority filter if needed
            // if (kpi.tracking_filter?.priority) {
            //     query = query.eq('priority', kpi.tracking_filter.priority)
            // }

            const { count: taskCount } = await query
            count = taskCount || 0
        }

        // Only update display value, do NOT write back to DB (to avoid race conditions/perf). 
        // Admin calculates payroll based on this view.
        return {
            ...kpi,
            current_value: count
        }
    }))

    return enrichedKPIs || []
}

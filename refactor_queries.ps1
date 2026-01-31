# PowerShell script to refactor queries.ts

$file = "c:/Users/Admin/Documents/marketing-master/lib/modules/kpis/queries.ts"
$content = Get-Content $file -Raw

# Replace the auto-track logic section
$oldPattern = @'
        if \(kpi\.kpi_type\.startsWith\('content_'\)\) \{[\s\S]*?\} else \{[\s\S]*?count = taskCount \|\| 0\s*\}
'@

$newLogic = @'
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

            const { count: taskCount } = await query
            count = taskCount || 0
        }
'@

$content = $content -replace $oldPattern, $newLogic

Set-Content -Path $file -Value $content
Write-Host "Refactored successfully!"

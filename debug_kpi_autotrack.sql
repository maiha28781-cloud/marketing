-- Debug script: Check KPI configuration
-- Chạy script này trong Supabase SQL Editor để debug

-- 1. Xem tất cả KPIs và tracking config
SELECT 
    id,
    name,
    user_id,
    auto_track,
    tracking_source,
    tracking_filter,
    kpi_type,
    current_value,
    target_value,
    start_date,
    end_date
FROM kpis
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check tasks có match với KPI không
-- Replace 'USER_ID_HERE' với user_id từ KPI trên
SELECT 
    id,
    title,
    assigned_to,
    status,
    completed_at,
    created_at
FROM tasks 
WHERE assigned_to = 'USER_ID_HERE'
  AND status = 'done'
ORDER BY completed_at DESC
LIMIT 10;

-- 3. Check content items có match không
SELECT 
    id,
    name,
    assignee_id,
    type,
    status,
    scheduled_date,
    created_at
FROM content_items
WHERE assignee_id = 'USER_ID_HERE'
  AND status IN ('published', 'completed')
ORDER BY scheduled_date DESC
LIMIT 10;

-- 4. Nếu auto_track = false hoặc tracking_source = null,
-- chạy update này để fix:
-- UPDATE kpis 
-- SET auto_track = true,
--     tracking_source = 'tasks',  -- hoặc 'content'
--     tracking_filter = '{}'::jsonb
-- WHERE id = 'KPI_ID_HERE';

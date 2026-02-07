-- Debug: Check actual content types in database
SELECT 
    type,
    COUNT(*) as count,
    status,
    assignee_id
FROM content_items
GROUP BY type, status, assignee_id
ORDER BY type, status;

-- Check specifically for ad_creative
SELECT 
    id,
    title,
    type,
    status,
    scheduled_date,
    assignee_id
FROM content_items
WHERE type LIKE '%ad%' OR type LIKE '%creative%'
ORDER BY scheduled_date DESC;

-- Check all content types
SELECT DISTINCT type FROM content_items;

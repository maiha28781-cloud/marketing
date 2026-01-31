-- Migration 034: Add KPI Tracking Source System
-- This migration adds explicit tracking source and filter columns for clearer KPI auto-tracking

-- Step 1: Add new columns (nullable first for existing data)
ALTER TABLE kpis 
ADD COLUMN IF NOT EXISTS tracking_source VARCHAR(20),
ADD COLUMN IF NOT EXISTS tracking_filter JSONB DEFAULT '{}'::jsonb;

-- Step 2: Migrate existing data based on kpi_type
UPDATE kpis
SET 
  tracking_source = CASE 
    WHEN kpi_type LIKE 'content_%' THEN 'content'
    ELSE 'tasks'
  END,
  tracking_filter = CASE
    WHEN kpi_type = 'content_articles' THEN '{"content_type": "blog_post"}'::jsonb
    WHEN kpi_type = 'content_videos' THEN '{"content_type": "video"}'::jsonb
    WHEN kpi_type = 'content_images' THEN '{"content_type": "social_post"}'::jsonb
    ELSE '{}'::jsonb
  END
WHERE tracking_source IS NULL;

-- Step 3: Add constraints after data migration
ALTER TABLE kpis 
ALTER COLUMN tracking_source SET NOT NULL;

ALTER TABLE kpis 
ADD CONSTRAINT kpis_tracking_source_check 
  CHECK (tracking_source IN ('tasks', 'content'));

-- Step 4: Add index for performance
CREATE INDEX IF NOT EXISTS idx_kpis_tracking_source 
ON kpis(tracking_source);

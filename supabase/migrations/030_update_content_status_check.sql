-- Drop the old constraint
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_status_check;

-- Add the new constraint with all statuses
ALTER TABLE content_items ADD CONSTRAINT content_items_status_check 
CHECK (status IN (
    'idea', 'draft', 'review', 'scheduled', 'published', 'cancelled', -- old statuses
    'approved', 'running', 'paused', 'completed' -- new statuses
));

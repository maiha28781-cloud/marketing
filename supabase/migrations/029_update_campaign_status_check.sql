-- Drop the existing constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Add the new constraint including 'trash'
ALTER TABLE campaigns 
  ADD CONSTRAINT campaigns_status_check 
  CHECK (status IN ('draft', 'active', 'paused', 'completed', 'trash'));

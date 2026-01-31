-- Add submission_notes column to tasks for storing result links or feedback
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_notes TEXT;

-- Update RLS if necessary (usually UPDATE policy covers all columns, so likely fine)
-- "Assigned users and creators can update tasks" policy covers this.

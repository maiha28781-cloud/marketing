-- Database Migration: 040_update_position_check_constraint
-- Description: Updates the 'profiles_position_check' constraint to include 'editor'.
-- Breaking Change: No (only adds allowed value)

-- 1. Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_position_check;

-- 2. Normalize existing data: Set invalid positions to 'member' to satisfy the new constraint
UPDATE public.profiles
SET position = 'member'
WHERE position NOT IN (
    'manager',
    'content',
    'social_media',
    'performance',
    'designer',
    'editor',
    'member'
);

-- 3. Add the updated constraint with 'editor'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_position_check
CHECK (position IN (
    'manager',
    'content',
    'social_media',
    'performance',
    'designer',
    'editor',
    'member'
));

-- Add salary columns to profiles table
ALTER TABLE profiles
ADD COLUMN base_salary numeric DEFAULT 0,
ADD COLUMN content_rates jsonb DEFAULT '{}'::jsonb;

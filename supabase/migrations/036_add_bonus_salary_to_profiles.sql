-- Add bonus_salary column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bonus_salary BIGINT DEFAULT 0;

COMMENT ON COLUMN profiles.bonus_salary IS 'Fixed monthly bonus salary (VND)';

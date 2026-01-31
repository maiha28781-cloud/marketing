-- Add tax and insurance configuration to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS insurance_threshold BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_threshold BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_percent DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN profiles.insurance_threshold IS 'Minimum income threshold before insurance applies (VND)';
COMMENT ON COLUMN profiles.insurance_percent IS 'Insurance deduction percentage (e.g., 10.5 for 10.5%)';
COMMENT ON COLUMN profiles.tax_threshold IS 'Minimum taxable income threshold (VND)';
COMMENT ON COLUMN profiles.tax_percent IS 'Tax percentage (e.g., 10 for 10%)';

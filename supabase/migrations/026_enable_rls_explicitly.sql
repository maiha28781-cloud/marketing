-- Migration: Explicitly Enable RLS on all tables
-- Description:
-- Policies do NOT work if RLS is not enabled on the table.
-- This script forcefully enables RLS on all sensitive tables to ensure checks are run.

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- Also ensure profiles is secure
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify policy existence (Optional check logic not needed in migration)
-- The previous policies (025) are good, just need RLS enabled.

-- Enable Public Read Access for Tasks and KPIs
-- Objective: Allow all authenticated users ('member') to VIEW all tasks and KPIs.
-- BUT: Update/Delete restricted to Owner/Admin.

-- 1. Update Tasks Policies
DROP POLICY IF EXISTS "Members see assigned or created tasks, admins see all" ON public.tasks;

CREATE POLICY "Authenticated users view all tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL); -- Any authenticated user

-- 2. Update KPIs Policies
DROP POLICY IF EXISTS "Users can view own KPIs" ON public.kpis;
DROP POLICY IF EXISTS "Admins can view all KPIs" ON public.kpis;

CREATE POLICY "Authenticated users view all KPIs"
    ON public.kpis
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 3. Update KPI History Policies
DROP POLICY IF EXISTS "Users can view own KPI history" ON public.kpi_history;
DROP POLICY IF EXISTS "Admins can view all KPI history" ON public.kpi_history;

CREATE POLICY "Authenticated users view all KPI history"
    ON public.kpi_history
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

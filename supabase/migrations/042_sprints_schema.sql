-- Migration: 042_sprints_schema.sql
-- Sprint Planning module

CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  target_velocity INT DEFAULT 0,
  actual_velocity INT DEFAULT 0,
  retrospective_notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS story_points INT DEFAULT 1;

CREATE INDEX idx_tasks_sprint_id ON public.tasks(sprint_id);
CREATE INDEX idx_sprints_status ON public.sprints(status);

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view sprints"
  ON public.sprints FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sprints"
  ON public.sprints USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_sprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION update_sprints_updated_at();

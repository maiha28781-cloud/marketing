-- Saved Views Schema

-- 1. Create saved_views table
CREATE TABLE IF NOT EXISTS public.saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Users can manage own saved views"
  ON public.saved_views
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX idx_saved_views_user_id ON public.saved_views(user_id);

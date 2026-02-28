-- Migration: 043_campaign_360_schema.sql
-- Campaign 360° View enhancements

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS phase TEXT CHECK (phase IN ('briefing', 'planning', 'execution', 'reporting')) DEFAULT 'planning',
  ADD COLUMN IF NOT EXISTS brief JSONB,
  ADD COLUMN IF NOT EXISTS target_leads INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_leads INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_revenue NUMERIC DEFAULT 0;

ALTER TABLE public.kpis
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kpis_campaign_id ON public.kpis(campaign_id);

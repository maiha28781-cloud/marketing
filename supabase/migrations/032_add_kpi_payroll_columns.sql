-- Add KPI columns to profiles table
ALTER TABLE profiles
ADD COLUMN kpi_target integer DEFAULT 0,
ADD COLUMN kpi_bonus numeric DEFAULT 0;

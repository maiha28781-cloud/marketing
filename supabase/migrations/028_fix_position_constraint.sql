-- Migration: Fix Position Constraint
-- Allow lowercase 'member' in position check constraint

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_position_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_position_check 
CHECK (position IN ('manager', 'content', 'social_media', 'performance', 'designer', 'member', 'Member'));

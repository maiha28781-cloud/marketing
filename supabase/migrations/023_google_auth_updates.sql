-- =============================================
-- Migration: Google Auth Updates
-- 1. Add department column to profiles
-- 2. Allow 'Member' in position check constraint
-- 3. Update handle_new_user trigger for Google Auth defaults
-- =============================================

-- 1. Add department column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';

-- 2. Update position constraint
-- First drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_position_check;

-- Add new constraint that includes 'Member'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_position_check 
CHECK (position IN ('manager', 'content', 'social_media', 'performance', 'designer', 'Member'));

-- 3. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  user_role TEXT;
  user_department TEXT;
  user_position TEXT;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;
  
  -- First user gets admin role, others get member
  IF is_first_user THEN
    user_role := 'admin';
  ELSE
    user_role := 'member';
  END IF;

  -- Determine department (default to 'General' if not provided)
  user_department := COALESCE(NEW.raw_user_meta_data->>'department', 'General');
  
  -- Determine position (default to 'Member' if not provided)
  user_position := COALESCE(NEW.raw_user_meta_data->>'position', 'Member');

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role, position, department, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Unknown User'),
    user_role,
    user_position,
    user_department,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

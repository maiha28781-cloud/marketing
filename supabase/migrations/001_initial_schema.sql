-- Marketing OS Database Schema
-- Phase 1: Initial Setup with Profiles and Tasks

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (Extended from auth.users)
-- =============================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  position TEXT NOT NULL CHECK (position IN ('manager', 'content', 'social_media', 'performance', 'designer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. TASKS TABLE
-- =============================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'review', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Members see assigned or created tasks, admins see all"
  ON public.tasks
  FOR SELECT
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Assigned users and creators can update tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Creators and admins can delete tasks"
  ON public.tasks
  FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 3. TRIGGER: Auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. TRIGGER: Auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  user_role TEXT;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;
  
  -- First user gets admin role, others get member
  IF is_first_user THEN
    user_role := 'admin';
  ELSE
    user_role := 'member';
  END IF;

  -- Insert profile with email from auth.users
  INSERT INTO public.profiles (id, email, full_name, role, position)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'position', 'member')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. INDEXES for Performance
-- =============================================

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_position ON public.profiles(position);

-- =============================================
-- 6. SEED DATA (Optional - for testing)
-- =============================================

-- Insert sample task for testing (will fail if no users exist)
-- You can manually add sample data after first user registers

-- =============================================
-- Migration Complete!
-- =============================================
-- Run this entire script in Supabase SQL Editor
-- Then verify tables in Database → Tables

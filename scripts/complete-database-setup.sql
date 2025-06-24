-- =====================================================
-- COMPLETE DATABASE SETUP FOR APPLYFIT
-- =====================================================
-- This file contains all the necessary SQL scripts to set up
-- the complete database schema for the ApplyFit application.
-- Run this file in your Supabase SQL editor to set up everything.
-- =====================================================

-- =====================================================
-- 1. CREATE USER ROLES ENUM
-- =====================================================
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin', 'premium');

-- =====================================================
-- 2. CREATE USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  bio TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  date_of_birth DATE,
  preferred_job_types TEXT[],
  experience_level TEXT,
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  skills TEXT[],
  resume_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  education JSONB DEFAULT '[]'::jsonb,
  professional_experience JSONB DEFAULT '[]'::jsonb,
  projects_achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_education ON user_profiles USING GIN (education);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience ON user_profiles USING GIN (professional_experience);
CREATE INDEX IF NOT EXISTS idx_user_profiles_projects ON user_profiles USING GIN (projects_achievements);

-- =====================================================
-- 3. CREATE JOB APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_link TEXT,
  date_applied DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'applied',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  job_description TEXT,
  resume_generated_at TIMESTAMPTZ,
  resume_file_path TEXT,
  resume_version INTEGER DEFAULT 1,
  application_notes TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  resume_file_url TEXT,
  cover_letter_file_url TEXT,
  cover_letter_file_path TEXT,
  resume_content JSONB
);

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for job_applications
DROP POLICY IF EXISTS "Users can view their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can insert their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can delete their own job applications" ON public.job_applications;

CREATE POLICY "Users can view their own job applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications" ON public.job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications" ON public.job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for job_applications
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_date_applied ON public.job_applications(date_applied);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_date ON job_applications(user_id, date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_generated ON job_applications(user_id, resume_generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_file_url ON job_applications(resume_file_url);
CREATE INDEX IF NOT EXISTS idx_job_applications_cover_letter_file_url ON job_applications(cover_letter_file_url);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_job ON job_applications(company_name, job_title);

-- =====================================================
-- 4. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates on job_applications
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. UPDATE EXISTING DATA
-- =====================================================

-- Update existing profiles to have empty arrays for new JSONB fields
UPDATE user_profiles 
SET 
  education = '[]'::jsonb,
  professional_experience = '[]'::jsonb,
  projects_achievements = '[]'::jsonb
WHERE 
  education IS NULL 
  OR professional_experience IS NULL 
  OR projects_achievements IS NULL;

-- Update existing job applications to have resume_generated_at if they don't have one
UPDATE job_applications 
SET resume_generated_at = created_at 
WHERE resume_generated_at IS NULL AND created_at IS NOT NULL;

-- Update existing records to have NULL values for new file storage columns
UPDATE job_applications 
SET resume_file_url = NULL, 
    cover_letter_file_url = NULL, 
    cover_letter_file_path = NULL 
WHERE resume_file_url IS NULL;

-- =====================================================
-- 6. DEMO DATA (OPTIONAL - FOR DEVELOPMENT/TESTING)
-- =====================================================
-- Uncomment the section below if you want to create demo data
-- Note: You'll need to create the demo user through Supabase Auth first
-- Email: demouser@gmail.com, Password: demouser

/*
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Try to find the demo user (replace with actual UUID from Supabase)
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demouser@gmail.com' LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Update the demo user profile with sample data
        UPDATE user_profiles SET
            full_name = 'Demo User',
            bio = 'This is a demo account for testing the ApplyFit resume generator.',
            location = 'San Francisco, CA',
            experience_level = 'mid',
            skills = ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            preferred_job_types = ARRAY['Full-time', 'Remote'],
            salary_range_min = 80000,
            salary_range_max = 120000,
            linkedin_url = 'https://linkedin.com/in/demouser',
            github_url = 'https://github.com/demouser',
            updated_at = now()
        WHERE user_id = demo_user_id;
        
        -- Insert some sample job applications
        INSERT INTO job_applications (user_id, company_name, job_title, job_link, date_applied, status) VALUES
            (demo_user_id, 'Google', 'Software Engineer', 'https://careers.google.com/jobs/123', CURRENT_DATE - INTERVAL '5 days', 'applied'),
            (demo_user_id, 'Microsoft', 'Frontend Developer', 'https://careers.microsoft.com/jobs/456', CURRENT_DATE - INTERVAL '10 days', 'interviewed'),
            (demo_user_id, 'Apple', 'Full Stack Developer', 'https://jobs.apple.com/jobs/789', CURRENT_DATE - INTERVAL '15 days', 'rejected'),
            (demo_user_id, 'Meta', 'React Developer', 'https://careers.meta.com/jobs/101', CURRENT_DATE - INTERVAL '3 days', 'applied');
    END IF;
END $$;
*/

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for the ApplyFit application.
-- Make sure to:
-- 1. Enable Row Level Security (RLS) in Supabase dashboard
-- 2. Set up your environment variables
-- 3. Configure your storage buckets if needed
-- ===================================================== 
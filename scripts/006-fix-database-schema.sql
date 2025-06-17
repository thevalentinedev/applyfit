-- Fix user_profiles table
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies for user_profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
    
    CREATE POLICY "Users can view their own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create indexes for user_profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
  END IF;
END
$$;

-- Fix job_applications table
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
  cover_letter TEXT
);

-- Add resume_url column if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_applications') AND 
     NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'resume_url') THEN
    ALTER TABLE public.job_applications ADD COLUMN resume_url TEXT;
  END IF;
END
$$;

-- Enable RLS on job_applications if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_applications') THEN
    ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies for job_applications if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_applications') THEN
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
  END IF;
END
$$;

-- Create indexes for job_applications if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_applications') THEN
    CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_date_applied ON public.job_applications(date_applied);
    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
  END IF;
END
$$;

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

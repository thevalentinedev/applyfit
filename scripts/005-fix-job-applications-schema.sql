-- Fix job_applications table schema
ALTER TABLE job_applications 
  ALTER COLUMN date_applied SET DEFAULT CURRENT_DATE,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure the status check constraint allows all valid values
ALTER TABLE job_applications 
  DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE job_applications 
  ADD CONSTRAINT job_applications_status_check 
  CHECK (status IN ('applied', 'interviewed', 'rejected', 'ghosted', 'offer', 'accepted'));

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add job_description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_applications' AND column_name = 'job_description') THEN
    ALTER TABLE job_applications ADD COLUMN job_description TEXT;
  END IF;

  -- Add resume_generated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_applications' AND column_name = 'resume_generated_at') THEN
    ALTER TABLE job_applications ADD COLUMN resume_generated_at TIMESTAMPTZ;
  END IF;

  -- Add resume_file_path column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_applications' AND column_name = 'resume_file_path') THEN
    ALTER TABLE job_applications ADD COLUMN resume_file_path TEXT;
  END IF;

  -- Add resume_version column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_applications' AND column_name = 'resume_version') THEN
    ALTER TABLE job_applications ADD COLUMN resume_version INTEGER DEFAULT 1;
  END IF;

  -- Add application_notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'job_applications' AND column_name = 'application_notes') THEN
    ALTER TABLE job_applications ADD COLUMN application_notes TEXT;
  END IF;
END $$;

-- Update RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view own job applications" ON job_applications;
DROP POLICY IF EXISTS "Users can insert own job applications" ON job_applications;
DROP POLICY IF EXISTS "Users can update own job applications" ON job_applications;
DROP POLICY IF EXISTS "Users can delete own job applications" ON job_applications;

CREATE POLICY "Users can view own job applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

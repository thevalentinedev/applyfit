-- Add columns for resume generation tracking
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resume_file_path TEXT,
ADD COLUMN IF NOT EXISTS resume_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS application_notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_date ON job_applications(user_id, date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_generated ON job_applications(user_id, resume_generated_at DESC);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view own job applications" ON job_applications;
DROP POLICY IF EXISTS "Users can insert own job applications" ON job_applications;
DROP POLICY IF EXISTS "Users can update own job applications" ON job_applications;

CREATE POLICY "Users can view own job applications" ON job_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job applications" ON job_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications" ON job_applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

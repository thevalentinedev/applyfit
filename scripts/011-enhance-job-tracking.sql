-- Add additional columns for better job tracking
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS resume_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resume_content JSONB,
ADD COLUMN IF NOT EXISTS application_notes TEXT;

-- Create index for better performance on resume generation tracking
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_generated ON job_applications(resume_generated_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_job ON job_applications(company_name, job_title);

-- Update existing records to have a resume_generated_at if they don't have one
UPDATE job_applications 
SET resume_generated_at = created_at 
WHERE resume_generated_at IS NULL AND created_at IS NOT NULL;

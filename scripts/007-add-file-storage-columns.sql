-- Add file storage columns to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_file_url TEXT,
ADD COLUMN IF NOT EXISTS cover_letter_file_url TEXT,
ADD COLUMN IF NOT EXISTS cover_letter_file_path TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_file_url ON job_applications(resume_file_url);
CREATE INDEX IF NOT EXISTS idx_job_applications_cover_letter_file_url ON job_applications(cover_letter_file_url);

-- Update existing records to have NULL values for new columns (if needed)
UPDATE job_applications 
SET resume_file_url = NULL, 
    cover_letter_file_url = NULL, 
    cover_letter_file_path = NULL 
WHERE resume_file_url IS NULL;

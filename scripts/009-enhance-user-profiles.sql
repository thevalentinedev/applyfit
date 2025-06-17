-- Add new columns to user_profiles table for comprehensive profile data
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS professional_experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS projects_achievements JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_education ON user_profiles USING GIN (education);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience ON user_profiles USING GIN (professional_experience);
CREATE INDEX IF NOT EXISTS idx_user_profiles_projects ON user_profiles USING GIN (projects_achievements);

-- Update existing profiles to have empty arrays for new fields
UPDATE user_profiles 
SET 
  education = '[]'::jsonb,
  professional_experience = '[]'::jsonb,
  projects_achievements = '[]'::jsonb
WHERE 
  education IS NULL 
  OR professional_experience IS NULL 
  OR projects_achievements IS NULL;
